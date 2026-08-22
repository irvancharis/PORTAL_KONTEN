/**
 * mayarPaymentService.js
 * Layanan Integrasi Pembayaran Mayar.id Resmi Menggunakan Endpoint Invoice
 * Memberikan ID Transaksi Unik yang dapat dicek statusnya secara presisi 1:1
 */

export const MAYAR_CONFIG = {
  apiKey: localStorage.getItem('portal-mayar-api-key') || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NWY5NTIxNy0xMmU0LTQwZDItYTMyMS00MzRlM2RkODY1YWQiLCJhY2NvdW50SWQiOiJhNjhlOTIyZC1jZDE3LTRmMTQtOWZjMy05ZDhhOWY0MjYxYjgiLCJjcmVhdGVkQXQiOiIxNzg3Mzc2NjI1NTY1Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoiaXJ2YW5jaGFyaXNAZ21haWwuY29tIiwibmFtZSI6IklydmFuIENoYXJpcyIsImxpbmsiOiJpcnZhbi1jaGFyaXMiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc4NzM3NjYyNX0.OfjmkNMoqw7UNWbuYXqaeMHiizCghdNgk9_BmUiFP4uGZ70idi8297QJP--M63Ppft2_Fh-gvx4kN4imn8Nh23zAErwK13periKd0Nsgj46vsGuqp_DCgZUtFbJmjQ5aPbFpKVM7dSs5vNrSpORl0v3quspWzxlPTB8JxXyjY7uCPv7nWejbpEIVoy-B8r3zTnP4xQVFuXFRo5tyMaXt0zijBVyCbtvszZQROAP1bYq3v_KjaQOEar9s1Tw_mIiFhl3o3fN60lFHNZfGSdPbLSAK_DTsdEQBWxe24d4FoGWlPp7o1v6ELXjX2UfaTxQYaF88kvg5nT3Y5EHotcQ1UA',
  isProduction: true,
  baseUrl: 'https://api.mayar.id'
};

/**
 * Mengambil daftar seluruh metode / channel pembayaran yang aktif di akun Mayar
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
 * Buat Invoice Pembayaran Resmi Mayar.id melalui POST /hl/v1/invoice/create
 * Menghasilkan ID Transaksi / Invoice Unik dan Link / QR Pembayaran Resmi
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

  const payload = {
    name: name,
    email: email.includes('@') ? email : `${email}@ngonten.id`,
    mobile: mobile || '081234567890',
    description: description,
    redirectUrl: 'https://ngonten.id/profile',
    expiredAt: expiryDate,
    items: [
      {
        quantity: 1,
        rate: Number(amount),
        description: description
      }
    ]
  };

  try {
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await res.json();
    console.log('📦 [Mayar Invoice Create Response]:', resData);

    const inv = resData.data || resData;
    if (res.ok && inv && (inv.id || inv.url || inv.link)) {
      const invoiceId = inv.id;
      const paymentLink = inv.url || inv.link || `https://mayar.id/inv/${invoiceId}`;
      const qrCodeUrl = inv.qrCodeUrl || inv.qrcode || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLink)}`;

      return {
        status: 'success',
        data: {
          id: invoiceId,
          transactionId: invoiceId,
          amount: Number(amount),
          qrCodeUrl: qrCodeUrl,
          link: paymentLink,
          status: 'unpaid',
          createdAt: Date.now()
        }
      };
    } else {
      throw new Error(resData?.messages || resData?.message || 'Gagal membuat Invoice Mayar');
    }
  } catch (error) {
    console.warn('Mayar Invoice Create Error:', error);
    // Fallback ke QRIS langsung jika invoice endpoint mengalami kendala
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
 * Cek Status Invoice Pembayaran Resmi 1:1 via GET /hl/v1/invoice/{id}
 */
export const checkMayarPaymentStatus = async (transactionId, expectedAmount = null, qrCreatedAt = null, customApiKey = '') => {
  const activeApiKey = customApiKey || MAYAR_CONFIG.apiKey || localStorage.getItem('portal-mayar-api-key');

  if (!transactionId || transactionId.startsWith('NGONTEN-')) {
    console.warn('ID Transaksi tidak valid untuk cek invoice:', transactionId);
    return { isPaid: false };
  }

  console.log('🔍 [Cek Status Invoice Mayar 1:1] Query Invoice ID:', transactionId);

  try {
    const res = await fetch(`${MAYAR_CONFIG.baseUrl}/hl/v1/invoice/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${activeApiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const resJson = await res.json();
      const invoice = resJson.data || resJson;
      console.log('📡 [Mayar Invoice Status Result]:', invoice);

      if (invoice) {
        const rawStatus = String(invoice.status || invoice.payment_status || invoice.paymentStatus || '').toLowerCase();
        const isPaid = rawStatus === 'paid' || rawStatus === 'settled' || rawStatus === 'success';

        if (isPaid) {
          console.log(`✅ [Mayar Invoice ${transactionId}] TERKONFIRMASI LUNAS!`);
          return { isPaid: true, data: invoice };
        } else {
          console.log(`⏳ [Mayar Invoice ${transactionId}] Status saat ini: ${rawStatus} (Belum Lunas)`);
          return { isPaid: false, status: rawStatus };
        }
      }
    }
    return { isPaid: false };
  } catch (error) {
    console.error('Error saat cek status invoice Mayar:', error);
    return { isPaid: false, error: error.message };
  }
};
