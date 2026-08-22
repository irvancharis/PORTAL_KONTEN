/**
 * mayarPaymentService.js
 * Layanan Integrasi API Payment Gateway Mayar.id untuk ngonten.id
 * Menggunakan Endpoint Resmi Mayar: POST /hl/v1/qrcode/create & GET /hl/v1/invoice/{id}
 */

export const MAYAR_CONFIG = {
  // API Key Mayar Resmi
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id/hl/v1'
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
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/qrcode/create`, {
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
      return {
        status: 'success',
        data: {
          id: data.data?.id || orderId,
          transactionId: orderId,
          amount: amount,
          qrCodeUrl: qrImageUrl,
          link: '',
          status: 'unpaid'
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
        status: 'unpaid'
      },
      error: error.message
    };
  }
};

/**
 * Cek status pembayaran transaksi / invoice Mayar secara real-time
 * Endpoint: GET /hl/v1/invoice/{id} atau /hl/v1/payment/{id}
 */
export const checkMayarPaymentStatus = async (transactionId, customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');
  if (!transactionId || !activeApiKey) return { isPaid: false };

  try {
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/invoice/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const status = data.data?.status || data.status;
      if (status === 'paid' || status === 'PAID' || status === 'success' || status === 'SUCCESS') {
        return { isPaid: true, data };
      }
    }
    return { isPaid: false };
  } catch (error) {
    return { isPaid: false, error: error.message };
  }
};
