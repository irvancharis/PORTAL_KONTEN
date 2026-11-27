import jsQR from 'jsqr';

/**
 * Decode QRIS payload string from an uploaded image File.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function decodeQrisFromImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          resolve(code.data.trim());
        } else {
          reject(new Error('QR Code tidak terdeteksi pada gambar. Pastikan gambar QRIS jelas dan tidak terpotong.'));
        }
      };
      img.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate dynamic QRIS payload with embedded transaction amount (EMVCo CRC-16/CCITT-FALSE).
 * @param {string} staticQris - Base static QRIS string from DANA Bisnis / merchant
 * @param {number} amount - Transaction amount in IDR
 * @returns {string} Dynamic QRIS payload string
 */
export function generateDynamicQris(staticQris, amount) {
  if (!staticQris || typeof staticQris !== 'string') return '';
  const cleanQris = staticQris.trim();
  const amtNum = Math.round(Number(amount) || 0);
  if (amtNum <= 0) return cleanQris;

  // Strip trailing CRC (6304XXXX)
  let base = cleanQris.replace(/6304[0-9A-Fa-f]{4}$/, '');

  // Switch Point of Initiation Method from static (010211) to dynamic (010212)
  base = base.replace(/^000201010211/, '000201010212');

  const amtStr = String(amtNum);
  const amtLen = String(amtStr.length).padStart(2, '0');
  const tag54 = `54${amtLen}${amtStr}`;

  // Insert tag 54 before 5802ID if present, otherwise append before CRC
  const idx58 = base.indexOf('5802ID');
  let payloadWithoutCrc;
  if (idx58 !== -1) {
    payloadWithoutCrc = base.slice(0, idx58) + tag54 + base.slice(idx58);
  } else {
    payloadWithoutCrc = base + tag54;
  }

  const withCrcPrefix = payloadWithoutCrc + '6304';
  return withCrcPrefix + crc16Ccitt(withCrcPrefix);
}

function crc16Ccitt(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
