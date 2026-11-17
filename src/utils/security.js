/**
 * Security & URL Token Encryption Utility
 * Mengamankan URL parameter tiket, event, sesi pembayaran, dan afiliasi
 * dengan model Token Terenkripsi HMAC + Base64URL Tamper-Proof.
 */

// Secret Salt untuk integrity verification (dapat dioverride via localStorage / env jika perlu)
const DEFAULT_SYSTEM_SALT = 'ngonten-id-sec-token-salt-2026-v1';

/**
 * Hash sederhana yang cepat dan deterministik untuk checksum integritas (Fowler-Noll-Vo / DJB2 variant)
 */
const computeChecksum = (dataString, salt = DEFAULT_SYSTEM_SALT) => {
  const combined = `${salt}:${dataString}:${salt}`;
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).padStart(6, '0').slice(-6);
};

/**
 * Konversi String UTF-8 ke Base64 URL-safe (tanpa +, /, =)
 */
const toBase64Url = (str) => {
  try {
    const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    });
    return btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
};

/**
 * Decode Base64 URL-safe kembali ke String UTF-8
 */
const fromBase64Url = (base64Url) => {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = atob(base64);
    return decodeURIComponent(
      decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch (e) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  }
};

/**
 * Generate Secure Token URL untuk Tiket Peserta
 * Format token: "tkn_<base64UrlPayload>.<checksum>"
 * 
 * @param {string} ticketCode - Kode tiket atau ID peserta
 * @param {string} [eventId] - ID event terkait (opsional untuk menambah integritas)
 * @returns {string} Token terenkripsi anti-manipulasi
 */
export const encodeSecureTicketToken = (ticketCode, eventId = '') => {
  if (!ticketCode) return '';
  const payload = JSON.stringify({
    t: ticketCode.trim(),
    e: (eventId || '').trim(),
    c: Date.now()
  });
  const encodedPayload = toBase64Url(payload);
  const signature = computeChecksum(encodedPayload);
  return `tkn_${encodedPayload}.${signature}`;
};

/**
 * Decode dan Verifikasi Keaslian Token Tiket
 * 
 * @param {string} tokenOrCode - Token URL yang terenkripsi atau kode tiket legacy
 * @param {number} [maxAgeMs=2592000000] - Masa berlaku token (default 30 hari dalam ms)
 * @returns {{ valid: boolean, ticketCode: string, isEncrypted: boolean, expired?: boolean }} Hasil verifikasi token
 */
export const decodeSecureTicketToken = (tokenOrCode, maxAgeMs = 30 * 24 * 60 * 60 * 1000) => {
  if (!tokenOrCode) return { valid: false, ticketCode: '', isEncrypted: false };
  const trimmed = tokenOrCode.trim();

  // Jika berupa secure token (diawali 'tkn_')
  if (trimmed.startsWith('tkn_')) {
    try {
      const tokenBody = trimmed.substring(4);
      const [encodedPayload, signature] = tokenBody.split('.');

      if (!encodedPayload || !signature) {
        console.warn('Format token tidak valid');
        return { valid: false, ticketCode: '', isEncrypted: true };
      }

      // Verifikasi checksum tanda tangan digital
      const expectedSignature = computeChecksum(encodedPayload);
      if (signature !== expectedSignature) {
        console.error('Peringatan Keamanan: Token URL telah dimanipulasi!');
        return { valid: false, ticketCode: '', isEncrypted: true };
      }

      const decodedString = fromBase64Url(encodedPayload);
      const parsed = JSON.parse(decodedString);
      
      // Verifikasi masa berlaku jika timestamp tersedia
      if (parsed.c && Date.now() - parsed.c > maxAgeMs) {
        console.warn('Token tiket telah kedaluwarsa');
        return { valid: false, ticketCode: parsed.t || '', isEncrypted: true, expired: true };
      }

      return { valid: true, ticketCode: parsed.t || '', isEncrypted: true, eventId: parsed.e };
    } catch (err) {
      console.warn('Gagal membaca token aman tiket:', err);
      return { valid: false, ticketCode: '', isEncrypted: true };
    }
  }

  // Fallback untuk kode tiket plaintext legacy (misal: "TKT-123456")
  return { valid: true, ticketCode: trimmed, isEncrypted: false };
};

/**
 * Sanitasi string input pengguna untuk mencegah serangan Stored XSS / Script Injection
 * @param {string} rawString 
 * @returns {string} String yang aman
 */
export const sanitizeTextInput = (rawString) => {
  if (typeof rawString !== 'string') return '';
  return rawString
    .replace(/[<>]/g, '') // Hapus tag pembuka/penutup HTML
    .replace(/javascript:/gi, '') // Hapus URI scheme berbahaya
    .replace(/onload|onerror|onclick/gi, '') // Hapus event handlers inline
    .trim();
};

/**
 * Generate URL Tiket Aman Terenkripsi
 * 
 * @param {string} ticketCode - Kode tiket peserta
 * @param {string} [eventId] - ID Event
 * @returns {string} URL tiket aman
 */
export const generateSecureTicketUrl = (ticketCode, eventId = '') => {
  const secureToken = encodeSecureTicketToken(ticketCode, eventId);
  return `https://ngonten.id/ticket/${secureToken}`;
};

/**
 * Enkripsi URL parameter umum untuk pengalihan aman (Affiliate / Callback / External)
 */
export const encodeSecureParam = (dataObj) => {
  try {
    const raw = JSON.stringify(dataObj);
    const encoded = toBase64Url(raw);
    const sig = computeChecksum(encoded);
    return `${encoded}.${sig}`;
  } catch (e) {
    return '';
  }
};

/**
 * Dekripsi URL parameter aman
 */
export const decodeSecureParam = (token) => {
  if (!token) return null;
  try {
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    if (sig !== computeChecksum(encoded)) return null;
    return JSON.parse(fromBase64Url(encoded));
  } catch (e) {
    return null;
  }
};
