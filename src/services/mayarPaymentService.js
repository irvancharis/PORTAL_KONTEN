/**
 * mayarPaymentService.js
 * Layanan Integrasi API Payment Gateway Mayar.id untuk ngonten.id
 * Mendukung: Dynamic QRIS, Fetch Payment Channels, Realtime Status Polling
 */

export const MAYAR_CONFIG = {
  // API Key Mayar Resmi
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id'
};

/**
 * Mengambil daftar seluruh metode / channel pembayaran yang aktif di akun Mayar Anda
 */
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
 * Buat Dynamic QRIS resmi Mayar.id melalui endpoint POST /hl/v1/qrcode/create
 */
export const createMayarQRISPayment = async ({
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
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/qrcode/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Number(amount)
      })
    });

    const data = await res.json();
    if (res.ok && data && (data.data?.url || data.url)) {
      const qrImageUrl = data.data?.url || data.url;
      const trxId = data.data?.id || data.id || data.data?.transactionId || orderId;
      return {
        status: 'success',
        data: {
          id: trxId,
          transactionId: trxId,
          amount: amount,
          qrCodeUrl: qrImageUrl,
          link: '',
          status: 'unpaid',
          createdAt: Date.now()
        },
        isSimulated: false
      };
    } else {
      console.warn('Mayar QR Code API Error Response:', data);
      throw new Error(data?.messages || data?.message || 'Gagal generate QRIS Mayar');
    }
  } catch (error) {
    console.warn('Mayar QR Code Fetch Error:', error);
    return {
      status: 'error',
      data: {
        id: `mayar_${Date.now()}`,
        transactionId: orderId,
        amount: amount,
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
 * Cek status pembayaran transaksi Mayar secara real-time via berbagai endpoint
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, customApiKey = '', startTime = null) => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');
  if (!activeApiKey) return { isPaid: false };

  try {
    // 1. Coba periksa riwayat pembayaran terbaru (GET /hl/v1/payment atau /hl/v1/transactions)
    const endpoints = [
      `${MAYAR_CONFIG.baseUrl}/hl/v1/payment?limit=10&page=1`,
      `${MAYAR_CONFIG.baseUrl}/hl/v1/transactions?limit=10&page=1`,
      `${MAYAR_CONFIG.baseUrl}/hl/v1/qrcode/history?limit=10`
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
          const listData = await res.json();
          const items = listData.data || listData.items || (Array.isArray(listData) ? listData : []);
          
          if (Array.isArray(items) && items.length > 0) {
            const found = items.find(item => {
              const itemStatus = String(item.status || item.payment_status || item.transactionStatus || '').toLowerCase();
              const isPaid = itemStatus === 'paid' || itemStatus === 'success' || itemStatus === 'settled' || itemStatus === 'completed';
              
              if (!isPaid) return false;

              // Cocokkan nominal jika ada
              if (expectedAmount) {
                const itemAmount = Number(item.amount || item.totalAmount || item.netAmount || 0);
                if (itemAmount !== Number(expectedAmount)) return false;
              }

              // Cocokkan ID jika ada
              if (transactionId && (item.id === transactionId || item.transactionId === transactionId || item.orderId === transactionId)) {
                return true;
              }

              // Jika baru dibayar (dalam 15 menit terakhir)
              if (item.createdAt || item.updatedAt || item.timestamp) {
                const itemTime = new Date(item.updatedAt || item.createdAt || item.timestamp).getTime();
                const now = Date.now();
                if (now - itemTime < 15 * 60 * 1000) {
                  return true;
                }
              }

              return true;
            });

            if (found) {
              return { isPaid: true, data: found };
            }
          }
        }
      } catch (e) {
        // Continue to next endpoint
      }
    }

    // 2. Coba periksa direct invoice/transaction ID
    if (transactionId && !transactionId.startsWith('NGONTEN-')) {
      const resTrx = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeApiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (resTrx.ok) {
        const data = await resTrx.json();
        const status = String(data.data?.status || data.status || '').toLowerCase();
        if (status === 'paid' || status === 'success' || status === 'completed') {
          return { isPaid: true, data };
        }
      }
    }

    return { isPaid: false };
  } catch (error) {
    return { isPaid: false, error: error.message };
  }
};
