/**
 * openClawService.js (ngonten.id AI Engine)
 * Layanan Integrasi Autonomous AI & Data Analyst Platform ngonten.id
 * Menangani Webhook Notifikasi Real-Time, Pemantauan Data, Analisis & Tindakan Otomatis (Action Runner).
 */

const STORAGE_KEY = 'openclaw-config';
const LOGS_STORAGE_KEY = 'openclaw-activity-logs';

const defaultConfig = {
  enabled: true,
  agentName: 'ngonten.id AI Analyst',
  webhookUrl: '', // URL Webhook Custom API
  apiKey: '',
  telegramBotToken: '',
  telegramChatId: '',
  discordWebhookUrl: '',
  notifyOnNewEvent: true,
  notifyOnNewUser: true,
  notifyOnNewSubmission: true,
  notifyOnNewTransaction: true,
  autoAnalysisEnabled: true
};

export const getOpenClawConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultConfig;
    const parsed = JSON.parse(saved);
    return {
      ...defaultConfig,
      ...parsed,
      telegramBotToken: parsed.telegramBotToken || defaultConfig.telegramBotToken,
      telegramChatId: parsed.telegramChatId || defaultConfig.telegramChatId
    };
  } catch (e) {
    console.error('Failed to load AI config:', e);
    return defaultConfig;
  }
};

export const saveOpenClawConfig = (newConfig) => {
  try {
    const current = getOpenClawConfig();
    const merged = { ...current, ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to save AI config:', e);
    return null;
  }
};

export const getOpenClawLogs = () => {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const addOpenClawLog = (logEntry) => {
  try {
    const current = getOpenClawLogs();
    const newEntry = {
      id: 'ai_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    const updated = [newEntry, ...current].slice(0, 100);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error('Failed to add AI log:', e);
    return null;
  }
};

export const clearOpenClawLogs = () => {
  localStorage.removeItem(LOGS_STORAGE_KEY);
};

/**
 * Kirim pesan notifikasi langsung ke Telegram Bot/Channel
 */
export const sendTelegramNotification = async (token, chatId, text) => {
  if (!token || !chatId) return { success: false, error: 'Token bot atau Chat ID belum diisi' };
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true };
    }
    return { success: false, error: data.description || 'Gagal mengirim ke Telegram' };
  } catch (e) {
    console.warn('Telegram notification error:', e);
    return { success: false, error: e.message || 'Network error ke Telegram API' };
  }
};

export const testTelegramNotification = async (token, chatId) => {
  const timeStr = new Date().toLocaleString('id-ID');
  const msg = `🤖 <b>[ngonten.id - Telegram Alert Test]</b>\n\n✅ <b>Koneksi Berhasil!</b>\nNotifikasi realtime dari platform ngonten.id (Event baru, User baru, Submission, dll) akan otomatis dikirim ke sini.\n\n🕒 <i>Waktu: ${timeStr}</i>`;
  return await sendTelegramNotification(token, chatId, msg);
};

/**
 * Kirim notifikasi ke Discord Webhook
 */
const sendDiscordNotification = async (webhookUrl, payload) => {
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.warn('Discord webhook error:', e);
    return false;
  }
};

const dispatchedEventCache = new Map();

/**
 * Dispatch Event ke Channel & Local Logs
 */
export const dispatchOpenClawEvent = async (eventType, payload) => {
  const config = getOpenClawConfig();
  if (!config.enabled) return { success: false, reason: 'AI service is disabled' };

  // Anti-spam deduplication: prevent dispatching identical event within 60 seconds
  const cacheKey = `${eventType}_${JSON.stringify(payload)}`;
  const now = Date.now();
  if (dispatchedEventCache.has(cacheKey)) {
    const lastTime = dispatchedEventCache.get(cacheKey);
    if (now - lastTime < 60000) {
      return { skipped: true, reason: 'Duplicate event throttled' };
    }
  }
  dispatchedEventCache.set(cacheKey, now);

  // Filter based on toggles
  if (eventType === 'new_event' && !config.notifyOnNewEvent) return { skipped: true };
  if (eventType === 'new_user' && !config.notifyOnNewUser) return { skipped: true };
  if (eventType === 'new_submission' && !config.notifyOnNewSubmission) return { skipped: true };
  if (eventType === 'new_transaction' && !config.notifyOnNewTransaction) return { skipped: true };

  const eventTitleMap = {
    new_event: '🎉 EVENT BARU DIBUAT',
    new_user: '👤 PENGGUNA BARU TERDAFTAR',
    new_submission: '📩 KARYA / SUBMISSION BARU MASUK',
    new_transaction: '💰 TRANSAKSI / PEMBAYARAN BARU',
    custom_action: '⚡ TINDAKAN AI DIJALANKAN'
  };

  const title = eventTitleMap[eventType] || `🔔 UPDATE: ${eventType.toUpperCase()}`;
  const nowStr = new Date().toLocaleString('id-ID');

  let telegramText = `<b>[ngonten.id Alert]</b>\n<b>${title}</b>\n<i>Waktu: ${nowStr}</i>\n\n`;
  if (eventType === 'new_event') {
    telegramText += `📌 <b>Judul:</b> ${payload.title || '-'}\n🏷 <b>Kategori:</b> ${payload.category || '-'}\n🏢 <b>Penyelenggara:</b> ${payload.organizer || '-'}\n🎁 <b>Hadiah/Budget:</b> ${payload.prizePool || payload.budget || '-'}`;
  } else if (eventType === 'new_user') {
    telegramText += `👤 <b>Nama:</b> ${payload.name || '-'}\n📧 <b>Email:</b> ${payload.email || '-'}\n🎭 <b>Role:</b> ${payload.role || 'Creator'}`;
  } else if (eventType === 'new_submission') {
    telegramText += `🎬 <b>Event:</b> ${payload.eventTitle || '-'}\n👤 <b>Kreator:</b> ${payload.creatorName || '-'}\n🔗 <b>Link:</b> ${payload.submissionUrl || '-'}`;
  } else if (eventType === 'new_transaction') {
    telegramText += `💳 <b>Item/Plan:</b> ${payload.planName || payload.description || '-'}\n💵 <b>Nominal:</b> Rp ${(payload.amount || 0).toLocaleString('id-ID')}\n👤 <b>User:</b> ${payload.userName || '-'}`;
  } else {
    telegramText += `📝 <b>Detail:</b> ${JSON.stringify(payload, null, 2)}`;
  }

  // 1. Log to local store
  addOpenClawLog({
    type: eventType,
    title,
    payload,
    status: 'dispatched'
  });

  // 2. Dispatch to custom Webhook jika ada
  let webhookSuccess = false;
  if (config.webhookUrl) {
    try {
      const resp = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({
          source: 'ngonten.id',
          event: eventType,
          title,
          data: payload,
          timestamp: new Date().toISOString()
        })
      });
      webhookSuccess = resp.ok;
    } catch (err) {
      console.warn('Webhook dispatch failed:', err);
    }
  }

  // 3. Dispatch to Telegram
  if (config.telegramBotToken && config.telegramChatId) {
    sendTelegramNotification(config.telegramBotToken, config.telegramChatId, telegramText);
  }

  // 4. Dispatch to Discord Webhook
  if (config.discordWebhookUrl) {
    sendDiscordNotification(config.discordWebhookUrl, {
      content: `**[ngonten.id Alert]** ${title}\n` + '```json\n' + JSON.stringify(payload, null, 2).slice(0, 1500) + '\n```'
    });
  }

  return { success: true, webhookSuccess };
};

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";

/**
 * ngonten.id AI Data Analyst, Event Planner & Conversational AI Processor
 */
export const queryOpenClawAnalyst = async (prompt, platformData) => {
  const { users = [], events = [], eventSubmissions = [], financialJournals = [], movies = [] } = platformData || {};

  const totalUsers = users.length;
  const totalEvents = events.length;
  const activeEvents = events.filter(e => new Date(e.deadline || e.date) >= new Date()).length;
  const totalSubmissions = eventSubmissions.length;
  const totalRevenue = (financialJournals || [])
    .filter(j => j.type === 'income' || j.category === 'Revenue')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const contextSummary = {
    totalUsers,
    totalEvents,
    activeEvents,
    totalSubmissions,
    totalContent: movies.length,
    estimatedRevenue: totalRevenue,
    recentEvents: events.slice(-5).map(e => ({ title: e.title, category: e.category, views: e.views || 0 })),
    recentUsers: users.slice(-5).map(u => ({ name: u.name, role: u.role, date: u.joinedAt || u.createdAt }))
  };

  const config = getOpenClawConfig();
  const apiKeyToUse = config.apiKey || DEFAULT_GEMINI_KEY;

  const systemInstructions = `Kamu adalah **ngonten.id AI**, asisten eksekutif serba bisa, Data Analyst senior, Event Planner handal, dan Strategic Partner resmi buatan platform **ngonten.id** (ekosistem kompetisi, portofolio, dan monetisasi kreator digital di Indonesia).

Data Platform Real-Time Saat Ini:
- Total Pengguna: ${totalUsers} user terdaftar
- Total Event Lomba: ${totalEvents} event (${activeEvents} sedang aktif)
- Total Karya Masuk: ${totalSubmissions} submissions
- Total Portofolio: ${movies.length} konten
- Estimasi Omset/Hadiah: Rp ${totalRevenue.toLocaleString('id-ID')}

Karakter & Standar Jawabanmu:
1. **Sangat Cerdas, Luas & Solutif**: Jika diminta ide event/lomba atau strategi pemasaran/budget, berikan rancangan yang kreatif, rinci, angka perhitungan yang realistis, target audiens, dan langkah promosinya.
2. **Data Analyst Handal**: Jika ditanya performa atau evaluasi data, berikan analisis mendalam berbasis data nyata di atas beserta rekomendasi taktis.
3. **Karyawan/Asisten Handal**: Mampu membuat draf copywriting, syarat & ketentuan lomba, rencana operasional, hingga strategi growth hacking.
4. **Gaya Bahasa**: Profesional, visioner, antusias, komunikatif, dan terstruktur rapi menggunakan format Markdown (heading, bold, bullet points, numbered lists).`;

  // 1. Prioritas Utama: Gemini AI Engine dengan Multi-Model Fallback
  const geminiModels = [
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash"
  ];

  for (const modelName of geminiModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKeyToUse)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstructions}\n\nPertanyaan/Instruksi Pengguna: ${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          const answerText = data.candidates[0].content.parts.map(p => p.text).join('').trim();
          if (answerText) {
            const pLower = prompt.toLowerCase();
            let suggestedActions = [];
            if (pLower.includes('event') || pLower.includes('lomba') || pLower.includes('kompetisi') || pLower.includes('tema')) {
              suggestedActions = [
                { id: 'highlight_active_events', label: '⭐ Sorot Event Aktif' },
                { id: 'broadcast_event_reminder', label: '⏰ Kirim Pengingat Deadline' }
              ];
            } else if (pLower.includes('user') || pLower.includes('kreator') || pLower.includes('komunitas')) {
              suggestedActions = [
                { id: 'notify_new_users', label: '📢 Kirim Sambutan ke User Baru' }
              ];
            }

            return {
              text: answerText,
              contextSummary,
              suggestedActions
            };
          }
        }
      }
    } catch {
      // coba model berikutnya
    }
  }

  // 2. Fallback: Custom Webhook jika ada
  if (config.webhookUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${config.webhookUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({ prompt, context: contextSummary }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return typeof data === 'string' ? { text: data } : (data.response || data.analysis || data);
      }
    } catch {}
  }

  // 3. Fallback Cerdas Terstruktur
  const p = prompt.toLowerCase().trim();
  let responseText = '';
  let suggestedActions = [];

  const greetings = ['halo', 'hai', 'hello', 'hi', 'hei', 'pagi', 'siang', 'malam', 'tes', 'test', 'ping'];
  if (greetings.some(g => p === g || p.startsWith(g + ' '))) {
    responseText = `Halo! 👋 Saya **ngonten.id AI**, asisten eksekutif, data analyst, dan perancang strategi event untuk **ngonten.id**.\n\nApa yang ingin kita rencanakan hari ini?\n• 💡 **Ide & Konsep Lomba/Event Viral**\n• 📊 **Analisis Data & Pertumbuhan Kreator**\n• ✍️ **Drafting Copywriting & Syarat Ketentuan Event**\n• 🚀 **Strategi Pemasaran & Akuisisi User Baru**`;
  } else {
    responseText = `Halo! Menanggapi permintaan Anda mengenai *"${prompt}"*:\n\nSebagai partner data dan perencana event ngonten.id, saya menyarankan untuk mengombinasikan kompetisi berbasis karya video pendek berhadiah dengan kampanye referral komunitas. Silakan tentukan target peserta (pemula atau profesional) agar saya rancangkan panduan lengkapnya!`;
  }

  return {
    text: responseText,
    contextSummary,
    suggestedActions
  };
};
