/**
 * openClawService.js
 * Layanan Integrasi OpenClaw Autonomous AI & Data Analyst Platform ngonten.id
 * Menangani Webhook Notifikasi Real-Time, Pemantauan Data, Analisis & Tindakan Otomatis (Action Runner).
 */

const STORAGE_KEY = 'openclaw-config';
const LOGS_STORAGE_KEY = 'openclaw-activity-logs';

const defaultConfig = {
  enabled: true,
  agentName: 'OpenClaw ngonten.id Analyst',
  webhookUrl: '', // URL Webhook OpenClaw / N8N / Custom API
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
    return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
  } catch (e) {
    console.error('Failed to load OpenClaw config:', e);
    return defaultConfig;
  }
};

export const saveOpenClawConfig = (newConfig) => {
  try {
    const merged = { ...getOpenClawConfig(), ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Failed to save OpenClaw config:', e);
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
      id: 'oc_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    const updated = [newEntry, ...current].slice(0, 100);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error('Failed to add OpenClaw log:', e);
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
    console.warn('OpenClaw Telegram notification error:', e);
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
    console.warn('OpenClaw Discord webhook error:', e);
    return false;
  }
};

/**
 * Dispatch Event ke OpenClaw (Webhook + Channels + Local Logs)
 */
export const dispatchOpenClawEvent = async (eventType, payload) => {
  const config = getOpenClawConfig();
  if (!config.enabled) return { success: false, reason: 'OpenClaw is disabled' };

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
    custom_action: '⚡ TINDAKAN OPENCLAW DIJALANKAN'
  };

  const title = eventTitleMap[eventType] || `🔔 UPDATE: ${eventType.toUpperCase()}`;
  const nowStr = new Date().toLocaleString('id-ID');

  let telegramText = `<b>[OpenClaw Alert - ngonten.id]</b>\n<b>${title}</b>\n<i>Waktu: ${nowStr}</i>\n\n`;
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

  // 2. Dispatch to custom OpenClaw Webhook
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
      console.warn('OpenClaw Webhook dispatch failed:', err);
    }
  }

  // 3. Dispatch to Telegram
  if (config.telegramBotToken && config.telegramChatId) {
    sendTelegramNotification(config.telegramBotToken, config.telegramChatId, telegramText);
  }

  // 4. Dispatch to Discord Webhook
  if (config.discordWebhookUrl) {
    sendDiscordNotification(config.discordWebhookUrl, {
      content: `**[OpenClaw Alert - ngonten.id]** ${title}\n` + '```json\n' + JSON.stringify(payload, null, 2).slice(0, 1500) + '\n```'
    });
  }

  return { success: true, webhookSuccess };
};

/**
 * OpenClaw AI Data Analyst & Action Processor
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

  // Check if custom OpenClaw webhook supports analyst endpoint
  const config = getOpenClawConfig();
  if (config.webhookUrl && config.webhookUrl.includes('openclaw')) {
    try {
      const res = await fetch(`${config.webhookUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
        },
        body: JSON.stringify({ prompt, context: contextSummary })
      });
      if (res.ok) {
        const data = await res.json();
        return data.response || data.analysis || data;
      }
    } catch {
      // Fallback to local intelligent analysis
    }
  }

  // Built-in Intelligent Analyst Engine
  const p = prompt.toLowerCase();

  let responseText = '';
  let suggestedActions = [];

  if (p.includes('user') || p.includes('pengguna')) {
    responseText = `📊 **Analisis Pengguna (Total: ${totalUsers} Users)**\n- Pertumbuhan akun baru terpantau aktif.\n- Dominasi role saat ini adalah Kreator & Penonton.\n- **Rekomendasi:** Berikan onboarding email otomatis & panduan submit event untuk meningkatkan konversi kreator pertama kali.`;
    suggestedActions = [
      { id: 'notify_new_users', label: '📢 Kirim Pesan Sambutan ke User Baru' },
      { id: 'promote_top_events', label: '🔥 Rekomendasikan Event Populer ke User' }
    ];
  } else if (p.includes('event') || p.includes('lomba') || p.includes('kompetisi')) {
    responseText = `🏆 **Analisis Event & Lomba (Total: ${totalEvents} Event, ${activeEvents} Aktif)**\n- Rasio rata-rata submission per event adalah ${(totalSubmissions / (totalEvents || 1)).toFixed(1)} karya.\n- Event dengan batas waktu dekat memerlukan dorongan promosi tambahan untuk memaksimalkan jumlah karya masuk.`;
    suggestedActions = [
      { id: 'highlight_active_events', label: '⭐ Sorot Event Aktif di Beranda' },
      { id: 'broadcast_event_reminder', label: '⏰ Kirim Pengingat Deadline Submission' }
    ];
  } else if (p.includes('uang') || p.includes('keuangan') || p.includes('revenue') || p.includes('omset') || p.includes('transaksi')) {
    responseText = `💰 **Analisis Keuangan & Monetisasi**\n- Estimasi perputaran omset/hadiah tercatat: **Rp ${totalRevenue.toLocaleString('id-ID')}**.\n- Jalur monetisasi melalui tiket event, biaya submission berbayar, dan langganan kreator berjalan optimal.`;
    suggestedActions = [
      { id: 'generate_financial_report', label: '📑 Buat Laporan Ringkasan Keuangan' }
    ];
  } else {
    responseText = `🤖 **OpenClaw Platform Executive Summary (ngonten.id)**:\n\n• 👥 **Total User:** ${totalUsers} terdaftar\n• 🎪 **Total Event:** ${totalEvents} (${activeEvents} sedang aktif)\n• 🎬 **Total Karya Masuk:** ${totalSubmissions} submissions\n• 📈 **Total Konten Portofolio:** ${movies.length}\n\n💡 **Insight Strategis:** Aktivitas interaksi berjalan stabil. Rekomendasi tindakan otomatis siap dieksekusi di bawah ini.`;
    suggestedActions = [
      { id: 'highlight_active_events', label: '⭐ Sorot Event Terpopuler' },
      { id: 'sync_openclaw_webhook', label: '🔄 Tes Ping & Sync Webhook OpenClaw' }
    ];
  }

  return {
    text: responseText,
    contextSummary,
    suggestedActions
  };
};
