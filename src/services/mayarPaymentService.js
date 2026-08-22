/**
 * mayarPaymentService.js
 * Layanan Integrasi Pembayaran Mayar.id Resmi Menggunakan Dynamic QRIS + Invoice
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
 * Buat Pembayaran QRIS Resmi Mayar.id
 * Menggunakan POST /hl/v1/qrcode/create untuk menghasilkan QRIS Standar Bank Indonesia (ASLI)
 * Dan mengaitkan invoice / transactionId
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

  try {
    // 1. Buat Dynamic QRIS Asli dari Mayar
    const qrRes = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/qrcode/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Number(amount)
      })
    });

    const qrData = await qrRes.json();
    console.log('📦 [Mayar Dynamic QRIS Response]:', qrData);

    if (qrRes.ok && qrData && (qrData.data?.url || qrData.url)) {
      const qrImageUrl = qrData.data?.url || qrData.url;
      const initialId = qrData.data?.id || qrData.id || `qris_${Date.now()}`;

      return {
        status: 'success',
        data: {
          id: initialId,
          transactionId: initialId,
          amount: Number(amount),
          qrCodeUrl: qrImageUrl,
          link: `https://mayar.id/qris`,
          status: 'unpaid',
          createdAt: Date.now()
        }
      };
    } else {
      throw new Error(qrData?.messages || qrData?.message || 'Gagal generate QRIS Mayar');
    }
  } catch (error) {
    console.warn('Mayar QRIS Generate Error:', error);
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
 * Cek Status Pembayaran Transaksi Mayar Berdasarkan Riwayat Transaksi Akun
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, qrCreatedAt = null, customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');

  console.log('🔍 [Verifikasi Transaksi Mayar] Memeriksa status untuk Amount:', expectedAmount, 'QRCreatedAt:', qrCreatedAt);

  if (activeApiKey) {
    const endpoints = [
      `${MAYAR_CONFIG.baseUrl}/hl/v1/transactions?limit=10&page=1`,
      `${MAYAR_CONFIG.baseUrl}/hl/v2/transactions?limit=10&page=1`
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
          const resData = await res.json();
          const items = resData.data || resData.items || resData.transactions || (Array.isArray(resData) ? resData : []);
          
          if (Array.isArray(items) && items.length > 0) {
            console.log(`📋 [Mayar Transactions List from ${url}]:`, items);

            const found = items.find(item => {
              const rawStatus = String(item.status || item.payment_status || item.transactionStatus || '').toUpperCase();
              const isPaid = rawStatus === 'PAID' || rawStatus === 'SUCCESS' || rawStatus === 'SETTLED' || rawStatus === 'COMPLETED';
              if (!isPaid) return false;

              // Validasi Nominal
              const valAmount = Number(
                item.credit !== undefined ? item.credit : 
                (item.amount || item.totalAmount || item.netAmount || item.paymentLinkAmount || 0)
              );
              const expAmount = Number(expectedAmount);
              if (expectedAmount && valAmount !== expAmount && Math.abs(valAmount - expAmount) >= 5) {
                return false;
              }

              return true;
            });

            if (found) {
              console.log('✅ [Mayar API] Transaksi Berhasil Ditemukan:', found);
              return { isPaid: true, data: found };
            }
          }
        }
      } catch (err) {
        console.warn('Mayar query error:', url, err);
      }
    }
  }

  return { isPaid: false };
};
