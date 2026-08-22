/**
 * mayarPaymentService.js
 * Layanan Integrasi API Payment Gateway Mayar.id untuk ngonten.id
 * Menggunakan Webhook Cache di Google Apps Script untuk menghindari rate-limit 429
 */

export const MAYAR_CONFIG = {
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbww9byb9H5SIW_HknSEVJJe-oY9S--NaeKSPjcQ6IBACzoQc38oZ36bQqm__60gncIxxA/exec'
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
 * Cek status pembayaran transaksi Mayar secara real-time via Google Apps Script Webhook
 * (Mencegah error HTTP 429 Too Many Requests dari Mayar API)
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');

  console.log('🔍 [Verifikasi Transaksi Mayar] Memeriksa status untuk Amount:', expectedAmount, 'TrxId:', transactionId);

  // 1. Cek langsung ke Mayar API
  if (activeApiKey) {
    try {
      const endpoints = [
        `${MAYAR_CONFIG.baseUrl}/hl/v1/payment?limit=20&page=1`,
        `${MAYAR_CONFIG.baseUrl}/hl/v1/transactions?limit=20&page=1`,
        `${MAYAR_CONFIG.baseUrl}/hl/v2/transactions?limit=20&page=1`
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
            
            console.log('📡 [Mayar API Response from', url, ']:', items);

            if (Array.isArray(items) && items.length > 0) {
              const found = items.find(item => {
                const rawStatus = String(item.status || item.payment_status || item.transactionStatus || item.state || '').toUpperCase();
                const isSuccess = rawStatus === 'SUCCESS' || rawStatus === 'PAID' || rawStatus === 'SETTLED' || rawStatus === 'COMPLETED';
                if (!isSuccess) return false;

                if (expectedAmount) {
                  const valAmount = Number(item.amount || item.totalAmount || item.netAmount || item.paymentLinkAmount || item.grossAmount || 0);
                  const expAmount = Number(expectedAmount);
                  // Cocokkan nominal atau kelonggaran fee
                  if (valAmount === expAmount || Math.abs(valAmount - expAmount) < 5) {
                    return true;
                  }
                  return false;
                }
                return true;
              });

              if (found) {
                console.log('✅ [Mayar API] Transaksi Ditemukan:', found);
                return { isPaid: true, data: found };
              }
            }
          }
        } catch (subErr) {
          console.warn('Mayar endpoint error:', url, subErr);
        }
      }
    } catch (e) {
      console.warn('Direct Mayar check error:', e);
    }
  }

  // 2. Fallback: Periksa Webhook Cache dari Google Apps Script
  try {
    const scriptUrl = `${MAYAR_CONFIG.appsScriptUrl}?check_mayar=1&amount=${encodeURIComponent(expectedAmount || '')}&trx_id=${encodeURIComponent(transactionId || '')}&_t=${Date.now()}`;
    const scriptRes = await fetch(scriptUrl, { method: 'GET' });
    if (scriptRes.ok) {
      const scriptData = await scriptRes.json();
      console.log('📡 [Apps Script Cache Response]:', scriptData);
      if (scriptData && (scriptData.isPaid || scriptData.status === 'paid' || scriptData.status === 'success')) {
        return { isPaid: true, data: scriptData.data || scriptData };
      }
    }
  } catch (error) {
    console.warn('Apps Script cache check warning:', error);
  }

  return { isPaid: false };
};
