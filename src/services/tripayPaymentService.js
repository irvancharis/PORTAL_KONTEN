/**
 * tripayPaymentService.js
 * Layanan Integrasi Frontend untuk TriPay via Firebase Cloud Functions
 * Aman: Semua Private Key & Request IP dieksekusi di Server Cloud Functions.
 */

// URL Cloud Functions (Akan otomatis menyesuaikan project id)
const CLOUD_FUNCTIONS_BASE_URL = 'https://us-central1-jamkosong.cloudfunctions.net';

export const TRIPAY_PAYMENT_METHODS = {
  // QRIS
  qris: { code: 'QRIS', name: 'QRIS (Semua E-Wallet & Mobile Banking)', category: 'qris' },
  qris2: { code: 'QRISC', name: 'QRIS Customizable', category: 'qris' },
  
  // Virtual Account
  va_bca: { code: 'BCAVA', name: 'BCA Virtual Account', category: 'va' },
  va_bni: { code: 'BNIVA', name: 'BNI Virtual Account', category: 'va' },
  va_bri: { code: 'BRIVA', name: 'BRI Virtual Account', category: 'va' },
  va_mandiri: { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', category: 'va' },
  va_permata: { code: 'PERMATAVA', name: 'Permata Virtual Account', category: 'va' },
  va_cimb: { code: 'CIMBVA', name: 'CIMB Niaga Virtual Account', category: 'va' },
  va_bsi: { code: 'BSIVA', name: 'BSI Virtual Account', category: 'va' },
  
  // E-Wallet & Retail
  ewallet_ovo: { code: 'OVO', name: 'OVO', category: 'ewallet' },
  ewallet_dana: { code: 'DANA', name: 'DANA', category: 'ewallet' },
  ewallet_shopee: { code: 'SHOPEEPAY', name: 'ShopeePay', category: 'ewallet' },
  retail_alfamart: { code: 'ALFAMART', name: 'Alfamart', category: 'retail' },
  retail_indomaret: { code: 'INDOMARET', name: 'Indomaret', category: 'retail' }
};

/**
 * Membuat Transaksi Pembayaran TriPay via Cloud Functions
 * @param {Object} params
 * @param {string} params.method - Kode metode (e.g. 'QRIS', 'BRIVA')
 * @param {number} params.amount - Jumlah pembayaran (IDR)
 * @param {string} params.customerName - Nama pembeli
 * @param {string} params.customerEmail - Email pembeli
 * @param {string} [params.customerPhone] - Nomor HP pembeli
 * @param {Array} [params.orderItems] - Daftar item pesanan
 * @param {Object} [params.metadata] - Data tambahan yang ingin disimpan
 */
export async function createTripayPayment({
  method,
  amount,
  customerName,
  customerEmail,
  customerPhone = '081234567890',
  orderItems = [],
  metadata = {}
}) {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/createTripayTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        orderItems,
        metadata
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal membuat transaksi pembayaran TriPay');
    }

    return {
      success: true,
      reference: data.data.reference,
      merchantRef: data.data.merchant_ref,
      paymentMethod: data.data.payment_name,
      paymentName: data.data.payment_name,
      payCode: data.data.pay_code, // Nomor VA / Kode Bayar
      qrUrl: data.data.qr_url, // URL Gambar QRIS
      checkoutUrl: data.data.checkout_url, // Halaman Checkout TriPay
      amount: data.data.amount,
      feeMerchant: data.data.fee_merchant,
      feeCustomer: data.data.fee_customer,
      totalAmount: data.data.amount_received,
      instructions: data.data.instructions || [],
      expiredTime: data.data.expired_time
    };
  } catch (error) {
    console.error('Error createTripayPayment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mengambil daftar channel pembayaran aktif dari TriPay
 */
export async function fetchTripayChannels() {
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_BASE_URL}/getTripayChannels`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengambil channel pembayaran TriPay');
    }
    return data.data;
  } catch (error) {
    console.error('Error fetchTripayChannels:', error);
    return [];
  }
}
