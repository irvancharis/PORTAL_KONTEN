/**
 * dokuPaymentService.js
 * Layanan Integrasi Payment Gateway DOKU (Jokul) Resmi untuk ngonten.id
 * Mendukung: QRIS Real-Time, Virtual Account (BCA, Mandiri, BNI, BRI, Permata), E-Wallet & Minimarket.
 */

// Kredensial DOKU Resmi ngonten.id
export const DOKU_CONFIG = {
  clientId: 'BRN-0258-1786180977793',
  apiKey: 'doku_key_e32840e7148344a19d6749d1e0f4768e',
  secretKey: 'SK-0fWFwDRHT6V7gmaO3T8k',
  isProduction: true,
  baseUrl: 'https://api.doku.com',
  checkoutScriptUrl: 'https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js'
};

/**
 * Memuat skrip DOKU Checkout JS secara dinamis jika diperlukan
 */
export const loadDokuCheckoutScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.loadJokulCheckout) {
      return resolve(window.loadJokulCheckout);
    }
    const script = document.createElement('script');
    script.src = DOKU_CONFIG.checkoutScriptUrl;
    script.async = true;
    script.onload = () => resolve(window.loadJokulCheckout);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

/**
 * Format data pesanan transaksi untuk DOKU Checkout
 */
export const createDokuPaymentOrder = ({
  invoiceNumber = `INV-${Date.now()}`,
  amount = 10000,
  customerName = 'Kreator ngonten.id',
  customerEmail = 'noreply@ngonten.id',
  customerPhone = '081234567890',
  description = 'Pembayaran Layanan ngonten.id',
  items = []
}) => {
  return {
    order: {
      invoice_number: invoiceNumber,
      amount: amount,
      currency: 'IDR',
      callback_url: `${window.location.origin}/#/payment-success`,
      callback_url_cancel: `${window.location.origin}/#/payment-cancel`,
      language: 'ID',
      auto_redirect: true
    },
    payment: {
      payment_due_date: 60 // 60 menit kedaluwarsa
    },
    customer: {
      id: customerEmail,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: 'Indonesia',
      country: 'ID'
    },
    items: items.length > 0 ? items : [
      {
        name: description,
        price: amount,
        quantity: 1
      }
    ]
  };
};

/**
 * Helper untuk memeriksa status kesiapan integrasi DOKU
 */
export const isDokuReady = () => {
  return Boolean(DOKU_CONFIG.clientId && DOKU_CONFIG.secretKey);
};
