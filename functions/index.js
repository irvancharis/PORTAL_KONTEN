const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// KONFIGURASI KREDENSIAL TRIPAY
// ============================================================================
// Catatan: Gunakan API Key & Private Key dari Dashboard Merchant TriPay
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE || 'T52611';
const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY || '';
const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || '';
const IS_PRODUCTION = process.env.TRIPAY_ENV === 'production';

const TRIPAY_BASE_URL = IS_PRODUCTION
  ? 'https://tripay.co.id/api'
  : 'https://tripay.co.id/api-sandbox';

/**
 * 1. ENDPOINT: BUAT TRANSAKSI (createTripayTransaction)
 * Dipanggil oleh Frontend React secara aman (Server-to-Server).
 */
exports.createTripayTransaction = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
      const {
        method,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        orderItems,
        metadata
      } = req.body;

      if (!method || !amount || !customerName || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Parameter method, amount, customerName, dan customerEmail wajib diisi.'
        });
      }

      const parsedAmount = parseInt(amount, 10);
      const merchantRef = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

      // Generate Signature HMAC-SHA256 sesuai standar TriPay
      const signature = crypto
        .createHmac('sha256', TRIPAY_PRIVATE_KEY)
        .update(TRIPAY_MERCHANT_CODE + merchantRef + parsedAmount)
        .digest('hex');

      // Tentukan waktu expired (default 24 jam)
      const expiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

      const payload = {
        method: method, // e.g. QRIS, BRIVA, BCAVA, MANDIRIVA, OVO, DANA, dll
        merchant_ref: merchantRef,
        amount: parsedAmount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || '081234567890',
        order_items: orderItems && orderItems.length > 0
          ? orderItems
          : [
              {
                sku: 'SERVICE-NGONTEN',
                name: 'Layanan Kampanye / Konten ngonten.id',
                price: parsedAmount,
                quantity: 1
              }
            ],
        callback_url: `https://us-central1-${process.env.GCLOUD_PROJECT || 'jamkosong'}.cloudfunctions.net/tripayCallback`,
        return_url: 'https://ngonten.id/payment-finish',
        expired_time: expiry,
        signature: signature
      };

      // Panggil API TriPay dari Server (IP terverifikasi whitelist)
      const tripayRes = await axios.post(`${TRIPAY_BASE_URL}/transaction/create`, payload, {
        headers: {
          Authorization: `Bearer ${TRIPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = tripayRes.data;

      if (responseData.success && responseData.data) {
        // Catat transaksi awal ke Firestore
        await db.collection('transactions').doc(merchantRef).set({
          merchantRef: merchantRef,
          tripayReference: responseData.data.reference,
          paymentMethod: method,
          amount: parsedAmount,
          customerName,
          customerEmail,
          status: 'UNPAID',
          checkoutUrl: responseData.data.checkout_url || null,
          payCode: responseData.data.pay_code || null,
          qrUrl: responseData.data.qr_url || null,
          metadata: metadata || {},
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.status(200).json(responseData);
    } catch (error) {
      console.error('TriPay Create Transaction Error:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || error.message,
        details: error.response?.data || null
      });
    }
  });
});

/**
 * 2. ENDPOINT: WEBHOOK / CALLBACK (tripayCallback)
 * Menerima notifikasi otomatis dari TriPay saat transaksi lunas / expired.
 */
exports.tripayCallback = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const callbackSignature = req.headers['x-callback-signature'];
    const rawBody = JSON.stringify(req.body);

    if (!callbackSignature) {
      return res.status(400).json({ success: false, message: 'No signature provided' });
    }

    // Validasi Signature Callback
    const expectedSignature = crypto
      .createHmac('sha256', TRIPAY_PRIVATE_KEY)
      .update(rawBody)
      .digest('hex');

    if (callbackSignature !== expectedSignature) {
      console.warn('TriPay Callback: Invalid signature rejected');
      return res.status(403).json({ success: false, message: 'Invalid Signature' });
    }

    const { merchant_ref, reference, status, total_amount } = req.body;

    // Ambil dokumen transaksi dari Firestore
    const txRef = db.collection('transactions').doc(merchant_ref);
    const txDoc = await txRef.get();

    if (!txDoc.exists) {
      console.warn(`TriPay Callback: Transaction ${merchant_ref} not found in Firestore`);
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Update status transaksi
    await txRef.update({
      status: status, // 'PAID', 'EXPIRED', 'FAILED'
      tripayReference: reference,
      totalAmountPaid: total_amount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      callbackPayload: req.body
    });

    console.log(`TriPay Callback: Transaction ${merchant_ref} updated to ${status}`);

    // Return response JSON sesuai standar TriPay
    return res.json({ success: true });
  } catch (err) {
    console.error('TriPay Callback Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 3. ENDPOINT: DAFTAR KANAL PEMBAYARAN (getTripayChannels)
 */
exports.getTripayChannels = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const response = await axios.get(`${TRIPAY_BASE_URL}/merchant/payment-channel`, {
        headers: {
          Authorization: `Bearer ${TRIPAY_API_KEY}`
        }
      });
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.response?.data?.message || err.message
      });
    }
  });
});

/**
 * Webhook endpoint for Android Notification Forwarder (DANA Bisnis QRIS)
 */
const { onRequest } = require('firebase-functions/v2/https');
exports.qrisNotificationWebhook = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = req.body || {};
    const expectedSecret = process.env.QRIS_WEBHOOK_SECRET || 'ngonten-qris-2026';
    const providedSecret = req.headers['x-webhook-secret'] || body.secret || req.query.secret;
    if (providedSecret && providedSecret !== expectedSecret) return res.status(401).json({ error: 'Invalid webhook secret' });
    let amount = Number(body.amount) || 0;
    if (!amount) {
      const rawText = [body.title, body.text, body.message].filter(Boolean).join(' ');
      const match = rawText.match(/Rp\s?([\d.,]+)/i);
      if (match && match[1]) amount = parseInt(match[1].replace(/[.,]/g, ''), 10) || 0;
    }
    if (amount <= 0) return res.status(400).json({ error: 'Nominal pembayaran tidak ditemukan', received: body });
    const db = admin.firestore();
    const updated = [];
    const confSnap = await db.collection('confirmations').where('status', '==', 'pending').get();
    for (const docSnap of confSnap.docs) {
      const conf = docSnap.data();
      const confAmt = parseInt(String(conf.amount || '0').replace(/\D/g, ''), 10) || 0;
      if (confAmt === amount) {
        await docSnap.ref.update({ status: 'approved', verifiedBy: 'qris_webhook', verifiedAt: new Date().toISOString() });
        if (conf.isTicketPayment && conf.targetId) {
          await db.collection('eventParticipants').doc(conf.targetId).set({ status: 'approved', isPaid: true }, { merge: true });
        } else if (conf.isEventPayment && conf.targetId) {
          await db.collection('events').doc(conf.targetId).set({ paymentStatus: 'paid' }, { merge: true });
        } else if (conf.userId) {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await db.collection('users').doc(conf.userId).set({ role: conf.targetRole || 'vip', premiumExpiresAt: expiresAt }, { merge: true });
        }
        updated.push({ collection: 'confirmations', id: docSnap.id, amount });
        break;
      }
    }
    return res.status(200).json({ success: true, matchedAmount: amount, updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
