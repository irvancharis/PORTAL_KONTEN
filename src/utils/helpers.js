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

export const INDONESIAN_REGIONS = [
  // DKI Jakarta (Administrative Cities)
  "Jakarta Barat", "Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Utara",
  
  // Aceh
  "Banda Aceh", "Langsa", "Lhokseumawe", "Sabang", "Subulussalam",
  
  // Sumatera Utara
  "Binjai", "Gunungsitoli", "Medan", "Padangsidimpuan", "Pematangsiantar", "Sibolga", "Tanjungbalai", "Tebing Tinggi",
  
  // Sumatera Barat
  "Bukittinggi", "Padang", "Padang Panjang", "Pariaman", "Payakumbuh", "Sawahlunto", "Solok",
  
  // Riau
  "Dumai", "Pekanbaru",
  
  // Kepulauan Riau
  "Batam", "Tanjungpinang",
  
  // Jambi
  "Jambi", "Sungaipenuh",
  
  // Sumatera Selatan
  "Lubuklinggau", "Pagar Alam", "Palembang", "Prabumulih",
  
  // Kepulauan Bangka Belitung
  "Pangkalpinang",
  
  // Bengkulu
  "Bengkulu",
  
  // Lampung
  "Bandar Lampung", "Metro",
  
  // Jawa Barat
  "Bandung", "Bekasi", "Bogor", "Ciamis", "Cianjur", "Cirebon", "Depok", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Purwakarta", "Subang", "Sukabumi", "Sumedang", "Tasikmalaya", "Banjar", "Cimahi",
  
  // Banten
  "Cilegon", "Serang", "Tangerang", "Tangerang Selatan",
  
  // Jawa Tengah
  "Magelang", "Pekalongan", "Salatiga", "Semarang", "Surakarta (Solo)", "Tegal",
  
  // DI Yogyakarta
  "Yogyakarta",
  
  // Jawa Timur
  "Batu", "Blitar", "Kediri", "Madiun", "Malang", "Mojokerto", "Pasuruan", "Probolinggo", "Surabaya",
  
  // Bali
  "Denpasar",
  
  // Nusa Tenggara Barat
  "Bima", "Mataram",
  
  // Nusa Tenggara Timur
  "Kupang",
  
  // Kalimantan Barat
  "Pontianak", "Singkawang",
  
  // Kalimantan Tengah
  "Palangka Raya",
  
  // Kalimantan Selatan
  "Banjarbaru", "Banjarmasin",
  
  // Kalimantan Timur
  "Balikpapan", "Bontang", "Samarinda",
  
  // Kalimantan Utara
  "Tarakan",
  
  // Sulawesi Utara
  "Bitung", "Kotamobagu", "Manado", "Tomohon",
  
  // Gorontalo
  "Gorontalo",
  
  // Sulawesi Tengah
  "Palu",
  
  // Sulawesi Barat
  "Mamuju",
  
  // Sulawesi Selatan
  "Makassar", "Palopo", "Parepare",
  
  // Sulawesi Tenggara
  "Bau-Bau", "Kendari",
  
  // Maluku
  "Ambon", "Tual",
  
  // Maluku Utara
  "Ternate", "Tidore Kepulauan",
  
  // Papua
  "Jayapura", "Sorong", "Merauke", "Manokwari", "Mimika"
].sort();