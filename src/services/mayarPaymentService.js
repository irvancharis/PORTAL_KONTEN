/**
 * mayarPaymentService.js
 * Layanan Integrasi Pembayaran Mayar.id Resmi Berbasis Payment Request ID Unik
 */

export const MAYAR_CONFIG = {
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id'
};

export const fetchMayarPaymentChannels = async (customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');
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
 * Buat Payment Request Mayar Resmi (POST /hl/v1/payment/create)
 * Menghasilkan Unique Payment ID yang terdaftar resmi di sistem Mayar
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
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');
  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Buat Payment Request Resmi dengan ID
    const payRes = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/payment/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email.includes('@') ? email : `${email}@ngonten.id`,
        amount: Number(amount),
        mobile: mobile || '081234567890',
        redirectUrl: 'https://ngonten.id/profile',
        description: description,
        expiredAt: expiryDate
      })
    });

    const payData = await payRes.json();
    console.log('📦 [Mayar Payment Create Response]:', payData);

    const paymentInfo = payData.data || payData;
    const paymentId = paymentInfo.id || paymentInfo.transactionId || paymentInfo.transaction_id;
    const paymentLink = paymentInfo.link || paymentInfo.url || `https://mayar.id/pay/${paymentId}`;

    // 2. Buat QRIS Resmi Bank Indonesia
    let qrImageUrl = '';
    try {
      const qrRes = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/qrcode/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(amount) })
      });
      const qrData = await qrRes.json();
      qrImageUrl = qrData.data?.url || qrData.url || '';
    } catch (e) {
      console.warn('QR Code generate warning:', e);
    }

    return {
      status: 'success',
      data: {
        id: paymentId || orderId,
        transactionId: paymentId || orderId,
        amount: Number(amount),
        qrCodeUrl: qrImageUrl,
        link: paymentLink,
        status: 'unpaid',
        createdAt: Date.now()
      }
    };
  } catch (error) {
    console.warn('Mayar Payment Request Error:', error);
    return {
      status: 'error',
      data: {
        id: orderId,
        transactionId: orderId,
        amount: Number(amount),
        qrCodeUrl: '',
        link: '',
        status: 'unpaid',
        createdAt: Date.now()
      },
      error: error.message
    };
  }
};

/**
 * Cek Status Pembayaran Transaksi Mayar Murni Berdasarkan ID / Kode Transaksi Unik
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, qrCreatedAt = null, customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');

  if (!transactionId || transactionId.startsWith('NGONTEN-')) {
    console.warn('ID Transaksi tidak valid untuk dicek:', transactionId);
    return { isPaid: false };
  }

  console.log('🔍 [Verifikasi Berdasarkan ID Transaksi Spesifik Mayar] ID:', transactionId);

  // 1. Cek langsung status ID spesifik via /hl/v1/payment/{id} atau /hl/v1/invoice/{id}
  const idEndpoints = [
    `${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/${transactionId}`,
    `${MAYAR_CONFIG.baseUrl}/hl/v1/payment/${transactionId}`,
    `${MAYAR_CONFIG.baseUrl}/hl/v1/transactions/${transactionId}`
  ];

  for (const url of idEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeApiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const resData = await res.json();
        const item = resData.data || resData;
        console.log(`📡 [Detail Status dari Mayar ID ${transactionId}]:`, item);

        if (item) {
          const rawStatus = String(item.status || item.payment_status || item.paymentStatus || '').toLowerCase();
          if (rawStatus === 'paid' || rawStatus === 'success' || rawStatus === 'settled' || rawStatus === 'completed') {
            console.log(`✅ [Mayar ID ${transactionId}] TERVERIFIKASI LUNAS!`);
            return { isPaid: true, data: item };
          } else {
            console.log(`⏳ [Mayar ID ${transactionId}] Belum Lunas. Status: ${rawStatus}`);
            return { isPaid: false, status: rawStatus };
          }
        }
      }
    } catch (err) {
      console.warn('Mayar ID check query error:', url, err);
    }
  }

  // 2. Cek apakah ID Transaksi ini tercantum di daftar transaksi akun (/hl/v1/payment)
  try {
    const listRes = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/payment?limit=20&page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      const items = listData.data || listData.items || (Array.isArray(listData) ? listData : []);
      
      const matched = items.find(it => {
        const itId = it.id || it.transactionId || it.transaction_id;
        return itId && String(itId).toLowerCase() === String(transactionId).toLowerCase();
      });

      if (matched) {
        const matchedStatus = String(matched.status || matched.payment_status || '').toLowerCase();
        if (matchedStatus === 'paid' || matchedStatus === 'success' || matchedStatus === 'settled') {
          console.log(`✅ [Mayar ID Match Found in List] ID: ${transactionId} -> LUNAS`);
          return { isPaid: true, data: matched };
        } else {
          console.log(`⏳ [Mayar ID Match Found in List] ID: ${transactionId} -> Status: ${matchedStatus}`);
          return { isPaid: false, status: matchedStatus };
        }
      }
    }
  } catch (listErr) {
    console.warn('Mayar list lookup error:', listErr);
  }

  return { isPaid: false };
};
