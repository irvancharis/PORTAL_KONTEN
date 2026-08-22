/**
 * mayarPaymentService.js
 * Layanan Integrasi API Payment Gateway Mayar.id untuk ngonten.id
 * Mendukung: Dynamic QRIS, Payment Links, Invoices, dan Webhook Status Callback
 */

export const MAYAR_CONFIG = {
  // API Key Mayar (bisa dikonfigurasi via Admin Panel / LocalStorage / env)
  apiKey: localStorage.getItem('portal-mayar-api-key') || '',
  isProduction: true,
  
  // Endpoint resmi Mayar API v1
  baseUrl: 'https://api.mayar.id/hl/v1'
};

/**
 * Buat Dynamic QRIS atau Payment Link via Mayar Headless/Payment API
 * @param {Object} params
 * @param {string} params.name - Nama pelanggan / username
 * @param {string} params.email - Email pelanggan
 * @param {string} params.mobile - Nomor HP / WhatsApp
 * @param {number} params.amount - Nominal pembayaran (misal 20000)
 * @param {string} params.description - Keterangan pesanan
 * @param {string} params.orderId - Unique Order Identifier
 * @param {string} [params.customApiKey] - Opsional API key kustom
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

  if (!activeApiKey) {
    console.warn('Mayar API Key belum diisi di Admin Panel.');
    return {
      status: 'success',
      data: {
        id: `mayar_${Date.now()}`,
        transactionId: orderId,
        amount: amount,
        qrCodeUrl: '',
        link: '',
        status: 'unpaid'
      },
      isSimulated: true,
      error: 'API Key Mayar belum diisi di menu Pengaturan Premium Admin Panel'
    };
  }

  try {
    // 1. Coba endpoint Payment Create Mayar API
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        mobile,
        amount: Number(amount),
        description,
        redirectUrl: window.location.origin,
        channel: ['qris']
      })
    });

    const data = await res.json();
    if (res.ok && data) {
      const qrUrl = data.data?.qrCodeUrl || data.data?.qrString || data.data?.linkQR || data.qrCodeUrl || '';
      const payLink = data.data?.link || data.link || data.data?.url || '';
      return {
        status: 'success',
        data: {
          id: data.data?.id || data.id || orderId,
          transactionId: data.data?.transactionId || orderId,
          amount: amount,
          qrCodeUrl: qrUrl,
          link: payLink,
          status: 'unpaid'
        },
        isSimulated: false
      };
    } else {
      console.warn('Mayar API Response Message:', data);
      throw new Error(data?.messages || data?.message || 'Gagal memanggil API Mayar');
    }
  } catch (error) {
    console.warn('Mayar API Request Exception:', error);
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
