export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

export const formatIndonesianDate = (dateStr) => {
  if (!dateStr) return 'Segera';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
};

export const fetchJSONP = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + query + '&callback=' + callbackName;
    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    document.body.appendChild(script);
  });
};

/**
 * Checks if a user's profile is complete for participating in or creating campaigns/events.
 * Requirements:
 * - Community/Panitia: organizerName, organizerPhone, activeMembersCount, userRegional.
 * - Regular Creator/User: organizerName, organizerPhone, userPortfolio, userRegional.
 */
export const checkUserProfileComplete = (user) => {
  if (!user) return { isComplete: false, missingFields: ['User tidak ditemukan'] };
  
  const isComm = user.role === 'panitia' || user.isCommunity;
  const missing = [];

  const name = (user.organizerName || user.name || user.fullName || '').trim();
  const phone = (user.organizerPhone || user.phone || user.whatsapp || '').trim();
  const regional = (user.userRegional || user.regional || user.city || '').trim();

  if (!name) missing.push(isComm ? 'Nama Komunitas' : 'Nama Lengkap');
  if (!phone) missing.push('No. WhatsApp / HP');
  if (!regional) missing.push('Lokasi Regional');

  if (isComm) {
    const members = (user.activeMembersCount || '').toString().trim();
    if (!members) missing.push('Target Jumlah Member Aktif');
  }

  return {
    isComplete: missing.length === 0,
    missingFields: missing
  };
};

