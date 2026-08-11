import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Activity, 
  Settings, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Users, 
  Calendar, 
  DollarSign, 
  Radio, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  getOpenClawConfig, 
  saveOpenClawConfig, 
  getOpenClawLogs, 
  clearOpenClawLogs, 
  dispatchOpenClawEvent, 
  queryOpenClawAnalyst,
  testTelegramNotification 
} from '../services/openClawService';

export default function OpenClawModal({
  isOpen,
  onClose,
  platformData = {}
}) {
  const [activeTab, setActiveTab] = useState('analyst'); // 'analyst' | 'feed' | 'settings'
  const [config, setConfig] = useState(getOpenClawConfig());
  const [logs, setLogs] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'claw',
      text: 'Halo! Saya **OpenClaw AI Analyst & Action Agent** untuk ngonten.id. Saya siap menganalisis data user, event, submission, serta menjalankan action otomatis sesuai perintahmu.'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setConfig(getOpenClawConfig());
      setLogs(getOpenClawLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const updated = saveOpenClawConfig(config);
    if (updated) {
      setTestStatus({ type: 'success', message: 'Pengaturan OpenClaw berhasil disimpan!' });
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  const handleTestDispatch = async () => {
    setTestStatus({ type: 'info', message: 'Mengirimkan test signal ke OpenClaw...' });
    const result = await dispatchOpenClawEvent('new_event', {
      title: 'Lomba Konten Kreator Nasional 2026 (Test)',
      category: 'Videography & Film',
      organizer: 'ngonten.id Official',
      prizePool: 'Rp 15.000.000',
      date: new Date().toLocaleDateString('id-ID')
    });
    setLogs(getOpenClawLogs());
    if (result.success) {
      setTestStatus({ type: 'success', message: 'Test event berhasil dikirim ke webhook & channel terhubung!' });
    } else {
      setTestStatus({ type: 'error', message: 'Gagal mengirim event. Cek konfigurasi webhook.' });
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsAnalyzing(true);

    try {
      const response = await queryOpenClawAnalyst(textToSend, platformData);
      setMessages(prev => [
        ...prev,
        {
          sender: 'claw',
          text: response.text,
          actions: response.suggestedActions || []
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'claw',
          text: 'Maaf, terjadi kesalahan saat menghubungi OpenClaw analyst engine.'
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteAction = async (action) => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'claw',
        text: `⚡ Menjalankan tindakan: **${action.label}**...`
      }
    ]);

    await dispatchOpenClawEvent('custom_action', {
      actionId: action.id,
      label: action.label,
      executedAt: new Date().toISOString()
    });

    setLogs(getOpenClawLogs());

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'claw',
          text: `✅ Tindakan **${action.label}** berhasil diproses & disinkronkan ke OpenClaw!`
        }
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', color: '#f8fafc' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e293b', background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>OpenClaw Autonomous Agent</h3>
                <span style={{ fontSize: '10px', backgroundColor: '#22c55e20', color: '#4ade80', border: '1px solid #22c55e40', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>ONLINE</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Data Analyst & Automated Action Runner ngonten.id</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#090d16', padding: '0 16px' }}>
          <button 
            onClick={() => setActiveTab('analyst')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontSize: '13px', fontWeight: '600',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'analyst' ? '2px solid #818cf8' : '2px solid transparent',
              color: activeTab === 'analyst' ? '#818cf8' : '#94a3b8'
            }}
          >
            <Sparkles size={16} /> Analyst & Action AI
          </button>
          <button 
            onClick={() => { setActiveTab('feed'); setLogs(getOpenClawLogs()); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontSize: '13px', fontWeight: '600',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'feed' ? '2px solid #818cf8' : '2px solid transparent',
              color: activeTab === 'feed' ? '#818cf8' : '#94a3b8'
            }}
          >
            <Activity size={16} /> Live Feeds ({logs.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontSize: '13px', fontWeight: '600',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'settings' ? '2px solid #818cf8' : '2px solid transparent',
              color: activeTab === 'settings' ? '#818cf8' : '#94a3b8'
            }}
          >
            <Settings size={16} /> Pengaturan Webhook & Bot
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', minHeight: '380px' }}>
          
          {/* TAB 1: ANALYST & ACTIONS */}
          {activeTab === 'analyst' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              {/* Quick Prompts */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSendMessage('Analisis tren user dan pertumbuhan komunitas saat ini')}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Users size={14} color="#60a5fa" /> Analisis User & Komunitas
                </button>
                <button
                  onClick={() => handleSendMessage('Analisis performa event dan karya submission yang masuk')}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Calendar size={14} color="#f472b6" /> Analisis Event & Submission
                </button>
                <button
                  onClick={() => handleSendMessage('Bagaimana analisis omset dan peluang monetisasi kreator?')}
                  style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <DollarSign size={14} color="#4ade80" /> Analisis Keuangan & Monetisasi
                </button>
              </div>

              {/* Chat Message List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '320px', paddingRight: '4px' }}>
                {messages.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      background: m.sender === 'user' ? '#4f46e5' : '#1e293b',
                      color: '#f8fafc',
                      border: m.sender === 'user' ? 'none' : '1px solid #334155',
                      whiteSpace: 'pre-line'
                    }}>
                      {m.text}
                    </div>

                    {/* Action buttons if available */}
                    {m.actions && m.actions.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {m.actions.map(act => (
                          <button
                            key={act.id}
                            onClick={() => handleExecuteAction(act)}
                            style={{
                              background: '#312e81',
                              border: '1px solid #6366f1',
                              color: '#e0e7ff',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '600'
                            }}
                          >
                            <Play size={12} fill="#e0e7ff" /> {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isAnalyzing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '13px' }}>
                    <RefreshCw size={14} className="animate-spin" /> OpenClaw sedang menganalisis data live platform...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <input 
                  type="text"
                  placeholder="Ketik instruksi data analis atau action OpenClaw..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isAnalyzing || !chatInput.trim()}
                  style={{ backgroundColor: '#6366f1', border: 'none', borderRadius: '10px', padding: '0 18px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE FEEDS */}
          {activeTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Riwayat notifikasi & event yang dikirimkan ke OpenClaw:</span>
                <button
                  onClick={() => { clearOpenClawLogs(); setLogs([]); }}
                  style={{ background: 'none', border: '1px solid #ef444450', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Hapus Log
                </button>
              </div>

              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Radio size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>Belum ada log aktivitas yang tercatat.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Aktivitas baru (Event, User, Transaksi) akan otomatis muncul di sini secara real-time.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logs.map((log) => (
                    <div key={log.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#38bdf8' }}>{log.title}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                      </div>
                      <pre style={{ margin: 0, backgroundColor: '#0f172a', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1', overflowX: 'auto' }}>
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS (TELEGRAM & INTEGRASI) */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {testStatus && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: testStatus.type === 'success' ? '#065f46' : testStatus.type === 'error' ? '#991b1b' : '#1e3a8a',
                  border: `1px solid ${testStatus.type === 'success' ? '#10b981' : testStatus.type === 'error' ? '#ef4444' : '#3b82f6'}`,
                  color: '#fff'
                }}>
                  {testStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {/* TELEGRAM BOT SECTION */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    ✈️
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>Koneksi Telegram Bot (Khusus Owner)</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Notifikasi real-time ngonten.id akan dikirim langsung ke akun / grup Telegram Anda.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      1. Telegram Bot Token <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="Contoh: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={config.telegramBotToken}
                      onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      💡 Dapatkan token dari bot <b>@BotFather</b> di Telegram (ketik <code>/newbot</code>).
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                      2. Telegram Chat ID / User ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="Contoh: 123456789 (User ID) atau -100123456789 (Grup ID)"
                      value={config.telegramChatId}
                      onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      💡 Cek Chat ID kamu via bot <b>@userinfobot</b> di Telegram. (Pastikan kamu sudah klik <b>/start</b> ke bot kamu).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!config.telegramBotToken || !config.telegramChatId) {
                        setTestStatus({ type: 'error', message: 'Harap isi Bot Token dan Chat ID terlebih dahulu!' });
                        return;
                      }
                      setTestStatus({ type: 'info', message: 'Mengirimkan pesan uji coba ke Telegram...' });
                      const res = await testTelegramNotification(config.telegramBotToken, config.telegramChatId);
                      if (res.success) {
                        setTestStatus({ type: 'success', message: '✅ Pesan test berhasil masuk ke Telegram Anda!' });
                      } else {
                        setTestStatus({ type: 'error', message: `❌ Gagal: ${res.error}` });
                      }
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}
                  >
                    <Send size={13} /> Kirim Test Notifikasi ke Telegram
                  </button>
                </div>
              </div>

              {/* EVENT TRIGGERS */}
              <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '10px' }}>
                  Pilih Data yang Memicu Notifikasi ke Telegram:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#f1f5f9' }}>
                    <input 
                      type="checkbox"
                      checked={config.notifyOnNewEvent}
                      onChange={(e) => setConfig({ ...config, notifyOnNewEvent: e.target.checked })}
                    />
                    🎪 Event / Lomba Baru Dibuat
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#f1f5f9' }}>
                    <input 
                      type="checkbox"
                      checked={config.notifyOnNewUser}
                      onChange={(e) => setConfig({ ...config, notifyOnNewUser: e.target.checked })}
                    />
                    👤 Pengguna Baru Mendaftar
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#f1f5f9' }}>
                    <input 
                      type="checkbox"
                      checked={config.notifyOnNewSubmission}
                      onChange={(e) => setConfig({ ...config, notifyOnNewSubmission: e.target.checked })}
                    />
                    📩 Karya / Submission Baru Masuk
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#f1f5f9' }}>
                    <input 
                      type="checkbox"
                      checked={config.notifyOnNewTransaction}
                      onChange={(e) => setConfig({ ...config, notifyOnNewTransaction: e.target.checked })}
                    />
                    💰 Pembayaran / Transaksi Baru
                  </label>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  type="submit"
                  style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
