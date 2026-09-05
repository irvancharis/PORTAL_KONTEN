/**
 * mayarPaymentService.js
 * Layanan Integrasi Pembayaran Mayar.id Resmi Berbasis Dokumentasi API Mayar:
 * - Invoice / QRIS Create: POST /hl/v1/invoice/create, POST /hl/v1/qrcode/create
 * - Status Cek Berdasarkan ID Transaksi / Invoice:
 *   1. GET /hl/v1/invoice/{id}
 *   2. GET /hl/v2/invoices/{id}
 *   3. GET /hl/v2/transactions/{id}
 *   4. GET /hl/v1/transactions/{id}
 *   5. Fallback pencarian transaksi/invoice aktif via GET /hl/v2/invoices & /hl/v1/transactions
 */

export const MAYAR_CONFIG = {
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id'
};

const getActiveApiKey = (customApiKey = '') => {
  return customApiKey || localStorage.getItem('portal-mayar-api-key') || MAYAR_CONFIG.apiKey || '';
};

export const fetchMayarPaymentChannels = async (customApiKey = '') => {
  const activeApiKey = getActiveApiKey(customApiKey);
  if (!activeApiKey) return { success: false, channels: [] };

  try {
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v2/payment-channels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const channels = data.data || data.channels || (Array.isArray(data) ? data : []);
      return { success: true, channels };
    }
    return { success: false, channels: [] };
  } catch (error) {
    return { success: false, channels: [] };
  }
};

/**
 * Buat Pembayaran Resmi Mayar.id (Dedicated 1:1 Invoice & QRIS)
 */
export const createMayarInvoicePayment = async ({
  name = 'Kreator ngonten.id',
  email = 'user@ngonten.id',
  mobile = '081234567890',
  amount = 20000,
  description = 'Pembayaran User Premium ngonten.id',
  orderId = `NGONTEN-${Date.now()}`,
  customApiKey = ''
}) => {
  const activeApiKey = getActiveApiKey(customApiKey);
  const numericAmount = Number(amount) || 20000;

  // 1. Buat Invoice Unik Resmi Mayar (/hl/v1/invoice/create)
  if (activeApiKey) {
    try {
      const expiredDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const invoicePayload = {
        name: name || 'Kreator ngonten.id',
        email: email || 'user@ngonten.id',
        mobile: (mobile || '081234567890').replace(/[^0-9]/g, '') || '081234567890',
        description: description || 'Pembayaran User Premium ngonten.id',
        redirectUrl: typeof window !== 'undefined' ? window.location.origin : 'https://jamkosong.web.app',
        expiredAt: expiredDate,
        items: [
          {
            description: description || 'User Premium',
            quantity: 1,
            rate: numericAmount
          }
        ]
      };

      const invRes = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoicePayload)
      });

      const invData = await invRes.json();
      console.log('📦 [Mayar Dedicated Invoice Created]:', invData);

      if (invRes.ok && invData?.data) {
        const item = invData.data;
        const dedicatedInvoiceId = item.id;
        const paymentLink = item.link || item.url || '';
        
        // Generate QR code scanner langsung mengarah ke halaman invoice Mayar resmi
        const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=2&data=${encodeURIComponent(paymentLink)}`;

        return {
          status: 'success',
          data: {
            id: dedicatedInvoiceId,
            transactionId: item.transactionId || dedicatedInvoiceId,
            merchantOrderId: orderId,
            amount: numericAmount,
            qrCodeUrl: qrCodeImageUrl,
            link: paymentLink,
            status: 'unpaid',
            createdAt: Date.now()
          }
        };
      }
    } catch (invErr) {
      console.warn('Mayar Dedicated Invoice Create Error:', invErr);
    }
  }

  // 2. Fallback jika offline/error
  return {
    status: 'error',
    data: {
      id: orderId,
      transactionId: orderId,
      merchantOrderId: orderId,
      amount: numericAmount,
      qrCodeUrl: '',
      link: '',
      status: 'unpaid',
      createdAt: Date.now()
    }
  };
};

/**
 * Cek Status Pembayaran Transaksi Mayar Murni Berdasarkan Kode Transaksi / ID Invoice Unik (1:1 Verification)
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, qrCreatedAt = null, customApiKey = '') => {
  const activeApiKey = getActiveApiKey(customApiKey);

  console.log('🔍 [Verifikasi Resmi ID Mayar]:', { transactionId, expectedAmount, qrCreatedAt });

  if (!activeApiKey) {
    return { isPaid: false, message: 'API Key Mayar tidak tersedia' };
  }

  const isPaidStatus = (status) => {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'settled' || s === 'completed';
  };

  // 1. Verifikasi spesifik 1:1 langsung ke Endpoint Resmi Invoice Mayar
  if (transactionId && !transactionId.startsWith('NGONTEN-') && !transactionId.startsWith('qris_')) {
    const endpoints = [
      `${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/${transactionId}`,
      `${MAYAR_CONFIG.baseUrl}/hl/v2/invoices/${transactionId}`,
      `${MAYAR_CONFIG.baseUrl}/hl/v2/transactions/${transactionId}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${activeApiKey.trim()}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const resJson = await res.json();
          const item = resJson.data || resJson;
          if (item) {
            const rawStatus = item.status || item.payment_status || item.paymentStatus;
            console.log(`🔎 [Cek Endpoint ${url}]: Status = "${rawStatus}"`);
            
            if (isPaidStatus(rawStatus)) {
              console.log(`✅ [Invoice ID ${transactionId}] RESMI TERVERIFIKASI LUNAS!`, item);
              return { isPaid: true, data: item, status: rawStatus };
            } else {
              // Jika endpoint ID invoice mengembalikan status belum lunas, batalkan pencarian mutasi acak
              console.log(`⏳ [Invoice ID ${transactionId}] Masih belum dibayar.`);
              return { isPaid: false, data: item, status: rawStatus };
            }
          }
        }
      } catch (err) {
        console.warn('Endpoint status check error:', url, err);
      }
    }
  }

  return { isPaid: false, status: 'unpaid' };
};

