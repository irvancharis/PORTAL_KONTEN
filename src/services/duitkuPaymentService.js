/**
 * duitkuPaymentService.js
 * Layanan Integrasi Payment Gateway Duitku Resmi untuk ngonten.id
 * Mendukung: QRIS Real-Time, Virtual Account (BCA, Mandiri, BNI, BRI, Permata, CIMB), E-Wallet (DANA, OVO, ShopeePay) & Retail.
 */

// Konfigurasi Kredensial Duitku
export const DUITKU_CONFIG = {
  merchantCode: 'DS34029',
  apiKey: '626de99095041a6301582e42e566dba0',
  isProduction: false, // Ubah ke true saat beralih ke production
  
  // Endpoint URL Duitku Inquiry
  sandboxUrl: 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry',
  productionUrl: 'https://api.duitku.com/webapi/api/merchant/v2/inquiry',
  
  // POP JS Checkout Script URLs
  popSandboxJs: 'https://app-sandbox.duitku.com/lib/js/duitku.js',
  popProdJs: 'https://app-prod.duitku.com/lib/js/duitku.js'
};

// Kode Metode Pembayaran Duitku Resmi
export const DUITKU_PAYMENT_METHODS = {
  qris: { code: 'SP', name: 'QRIS (ShopeePay/Gopay/DANA/OVO/BCA)', category: 'qris' },
  va_bca: { code: 'BC', name: 'BCA Virtual Account', category: 'va' },
  va_mandiri: { code: 'M1', name: 'Mandiri Virtual Account', category: 'va' },
  va_bri: { code: 'BR', name: 'BRI Virtual Account', category: 'va' },
  va_bni: { code: 'I1', name: 'BNI Virtual Account', category: 'va' },
  va_permata: { code: 'BT', name: 'Permata Virtual Account', category: 'va' },
  va_cimb: { code: 'B1', name: 'CIMB Niaga Virtual Account', category: 'va' },
  ewallet_dana: { code: 'DA', name: 'DANA', category: 'ewallet' },
  ewallet_ovo: { code: 'OV', name: 'OVO', category: 'ewallet' },
  ewallet_shopee: { code: 'SA', name: 'ShopeePay', category: 'ewallet' }
};

/**
 * Standard Lightweight MD5 Hash implementation (RFC 1321)
 */
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }
  let x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  for (let k = 0; k < x.length; k += 16) {
    let AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S[0], 0xd76aa478); d = FF(d, a, b, c, x[k + 1], S[1], 0xe8c7b756); c = FF(c, d, a, b, x[k + 2], S[2], 0x242070db); b = FF(b, c, d, a, x[k + 3], S[3], 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S[0], 0xf57c0faf); d = FF(d, a, b, c, x[k + 5], S[1], 0x4787c62a); c = FF(c, d, a, b, x[k + 6], S[2], 0xa8304613); b = FF(b, c, d, a, x[k + 7], S[3], 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S[0], 0x698098d8); d = FF(d, a, b, c, x[k + 9], S[1], 0x8b44f7af); c = FF(c, d, a, b, x[k + 10], S[2], 0xffff5bb1); b = FF(b, c, d, a, x[k + 11], S[3], 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S[0], 0x6b901122); d = FF(d, a, b, c, x[k + 13], S[1], 0xfd987193); c = FF(c, d, a, b, x[k + 14], S[2], 0xa679438e); b = FF(b, c, d, a, x[k + 15], S[3], 0x49b40821);
    
    a = GG(a, b, c, d, x[k + 1], S[4], 0xf61e2562); d = GG(d, a, b, c, x[k + 6], S[5], 0xc040b340); c = GG(c, d, a, b, x[k + 11], S[6], 0x265e5a51); b = GG(b, c, d, a, x[k + 0], S[7], 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S[4], 0xd62f105d); d = GG(d, a, b, c, x[k + 10], S[5], 0x02441453); c = GG(c, d, a, b, x[k + 15], S[6], 0xd8a1e681); b = GG(b, c, d, a, x[k + 4], S[7], 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S[4], 0x21e1cde6); d = GG(d, a, b, c, x[k + 14], S[5], 0xc33707d6); c = GG(c, d, a, b, x[k + 3], S[6], 0xf4d50d87); b = GG(b, c, d, a, x[k + 8], S[7], 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S[4], 0xa9e3e905); d = GG(d, a, b, c, x[k + 2], S[5], 0xfcefa3f8); c = GG(c, d, a, b, x[k + 7], S[6], 0x676f02d9); b = GG(b, c, d, a, x[k + 12], S[7], 0x8d2a4c8a);
    
    a = HH(a, b, c, d, x[k + 5], S[8], 0xfffa3942); d = HH(d, a, b, c, x[k + 8], S[9], 0x8771f681); c = HH(c, d, a, b, x[k + 11], S[10], 0x6d9d6122); b = HH(b, c, d, a, x[k + 14], S[11], 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S[8], 0xa4beea44); d = HH(d, a, b, c, x[k + 4], S[9], 0x4bdecfa9); c = HH(c, d, a, b, x[k + 7], S[10], 0xf6bb4b60); b = HH(b, c, d, a, x[k + 10], S[11], 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S[8], 0x289b7ec6); d = HH(d, a, b, c, x[k + 0], S[9], 0xeaa127fa); c = HH(c, d, a, b, x[k + 3], S[10], 0xd4ef3085); b = HH(b, c, d, a, x[k + 6], S[11], 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], S[8], 0xd9d4d039); d = HH(d, a, b, c, x[k + 12], S[9], 0xe6db99e5); c = HH(c, d, a, b, x[k + 15], S[10], 0x1fa27cf8); b = HH(b, c, d, a, x[k + 2], S[11], 0xc4ac5665);
    
    a = II(a, b, c, d, x[k + 0], S[12], 0xf4292244); d = II(d, a, b, c, x[k + 7], S[13], 0x432aff97); c = II(c, d, a, b, x[k + 14], S[14], 0xab9423a7); b = II(b, c, d, a, x[k + 5], S[15], 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S[12], 0x655b59c3); d = II(d, a, b, c, x[k + 3], S[13], 0x8f0ccc92); c = II(c, d, a, b, x[k + 10], S[14], 0xffeff47d); b = II(b, c, d, a, x[k + 1], S[15], 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S[12], 0x6fa87e4f); d = II(d, a, b, c, x[k + 15], S[13], 0xfe2ce6e0); c = II(c, d, a, b, x[k + 6], S[14], 0xa3014314); b = II(b, c, d, a, x[k + 13], S[15], 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S[12], 0xf7537e82); d = II(d, a, b, c, x[k + 11], S[13], 0xbd3af235); c = II(c, d, a, b, x[k + 2], S[14], 0x2ad7d2bb); b = II(b, c, d, a, x[k + 9], S[15], 0xeb86d391);
    
    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

/**
 * Buat Signature Resmi Duitku
 * Formula: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
 */
export const generateDuitkuSignature = (merchantCode, merchantOrderId, paymentAmount, apiKey) => {
  const raw = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
  return md5(raw);
};

/**
 * Memuat skrip Duitku POP JS secara dinamis untuk modal checkout pop-up
 */
export const loadDuitkuPopScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.duitku) {
      return resolve(window.duitku);
    }
    const scriptUrl = DUITKU_CONFIG.isProduction 
      ? DUITKU_CONFIG.popProdJs 
      : DUITKU_CONFIG.popSandboxJs;

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve(window.duitku);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbww9byb9H5SIW_HknSEVJJe-oY9S--NaeKSPjcQ6IBACzoQc38oZ36bQqm__60gncIxxA/exec';

/**
 * Request Inquiry ke API Server Duitku melalui Backend Proxy (Google Apps Script)
 */
export const requestDuitkuInquiry = async ({
  merchantOrderId = `NGONTEN-${Date.now()}`,
  paymentAmount = 20000,
  paymentMethod = 'SP',
  productDetails = 'Langganan User Premium ngonten.id',
  customerName = 'Kreator ngonten.id',
  customerEmail = 'user@ngonten.id',
  phoneNumber = '081234567890'
}) => {
  const signature = generateDuitkuSignature(
    DUITKU_CONFIG.merchantCode,
    merchantOrderId,
    paymentAmount,
    DUITKU_CONFIG.apiKey
  );

  const duitkuPayload = {
    merchantCode: DUITKU_CONFIG.merchantCode,
    paymentAmount: Number(paymentAmount),
    paymentMethod: paymentMethod,
    merchantOrderId: merchantOrderId,
    productDetails: productDetails,
    additionalParam: '',
    merchantUserInfo: '',
    customerVaName: customerName,
    email: customerEmail,
    phoneNumber: phoneNumber,
    callbackUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/#/payment-success`,
    returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/#/payment-success`,
    signature: signature,
    expiryPeriod: 60
  };

  const proxyPayload = {
    action: 'duitku_inquiry',
    isProduction: DUITKU_CONFIG.isProduction,
    payload: duitkuPayload
  };

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(proxyPayload)
    });

    if (!response.ok) {
      throw new Error(`Proxy HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.statusCode === '00',
      data: data,
      merchantOrderId: merchantOrderId
    };
  } catch (err) {
    console.warn('Duitku Inquiry Proxy Error / Fallback:', err);
    return {
      success: false,
      error: err.message,
      merchantOrderId: merchantOrderId,
      fallbackVa: '39108' + phoneNumber.replace(/\D/g, '').slice(-10)
    };
  }
};

/**
 * Helper SHA-256 Hash untuk Signature Payment Methods Duitku
 */
export const generateSha256 = async (str) => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return md5(str);
};

export const getDuitkuDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Mengambil daftar metode pembayaran yang aktif di akun Duitku
 */
export const fetchDuitkuPaymentMethods = async (amount = 20000) => {
  const datetime = getDuitkuDateTime();
  const rawSignature = `${DUITKU_CONFIG.merchantCode}${amount}${datetime}${DUITKU_CONFIG.apiKey}`;
  const signature = await generateSha256(rawSignature);

  const duitkuPayload = {
    merchantcode: DUITKU_CONFIG.merchantCode,
    amount: Number(amount),
    datetime: datetime,
    signature: signature
  };

  const proxyPayload = {
    action: 'duitku_get_payment_methods',
    isProduction: DUITKU_CONFIG.isProduction,
    payload: duitkuPayload
  };

  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(proxyPayload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.responseCode === '00' && Array.isArray(data.paymentFee)) {
      return { success: true, methods: data.paymentFee };
    }
    return { success: false, data };
  } catch (err) {
    console.warn('Duitku fetch payment methods notice:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Helper untuk memeriksa status kesiapan integrasi Duitku
 */
export const isDuitkuReady = () => {
  return Boolean(
    DUITKU_CONFIG.merchantCode && 
    DUITKU_CONFIG.merchantCode !== 'DXXXXX' && 
    DUITKU_CONFIG.apiKey && 
    DUITKU_CONFIG.apiKey !== 'YOUR_DUITKU_MERCHANT_KEY'
  );
};
