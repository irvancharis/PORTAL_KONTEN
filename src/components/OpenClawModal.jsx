import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Users, 
  Calendar, 
  DollarSign, 
  Trash2,
  Copy,
  Check,
  ChevronLeft
} from 'lucide-react';
import { 
  getOpenClawConfig, 
  saveOpenClawConfig, 
  dispatchOpenClawEvent, 
  queryOpenClawAnalyst,
  testTelegramNotification 
} from '../services/openClawService';

export default function OpenClawModal({
  isOpen,
  onClose,
  platformData = {}
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(getOpenClawConfig());
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'claw',
      text: 'Halo! Saya **ngonten.id AI Analyst & Executive Assistant**. Ada data atau rencana strategi yang ingin kita diskusikan hari ini?'
    }
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!showSettings) {
      scrollToBottom();
    }
  }, [messages, isAnalyzing, showSettings]);

  useEffect(() => {
    if (isOpen) {
      setConfig(getOpenClawConfig());
      setTimeout(scrollToBottom, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const updated = saveOpenClawConfig(config);
    if (updated) {
      setTestStatus({ type: 'success', message: 'Pengaturan AI ngonten.id berhasil disimpan!' });
      setTimeout(() => {
        setTestStatus(null);
        setShowSettings(false);
      }, 1500);
    }
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
          text: 'Maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali.'
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
        text: `⚡ Menjalankan: **${action.label}**...`
      }
    ]);

    await dispatchOpenClawEvent('custom_action', {
      actionId: action.id,
      label: action.label,
      executedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'claw',
          text: `✅ Tindakan **${action.label}** berhasil diproses!`
        }
      ]);
    }, 600);
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'claw',
        text: 'Obrolan telah dibersihkan. Silakan ajukan pertanyaan atau instruksi baru seputar ngonten.id.'
      }
    ]);
  };

  const renderFormattedText = (content) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    return lines.map((line, i) => {
      let trimmed = line.trim();
      
      // Heading 3 or 2
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const title = trimmed.replace(/^#+\s*/, '');
        return <h4 key={i} style={{ margin: '12px 0 6px', fontSize: '14.5px', fontWeight: 'bold', color: '#1e293b' }}>{title}</h4>;
      }
      
      // List items
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const formattedLine = parseBold(trimmed);
        return (
          <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '4px', margin: '4px 0' }}>
            <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>•</span>
            <span style={{ flex: 1, color: '#334155' }}>{formattedLine}</span>
          </div>
        );
      }

      if (!trimmed) {
        return <div key={i} style={{ height: '6px' }} />;
      }

      return (
        <p key={i} style={{ margin: '4px 0', color: '#334155', lineHeight: '1.65' }}>
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ color: '#0f172a', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <style>{`
        .ai-chat-user-bubble {
          background-color: #4f46e5 !important;
          color: #ffffff !important;
        }
        .ai-chat-user-bubble * {
          color: #ffffff !important;
        }
        .ai-chat-bubble-ai {
          background-color: #ffffff !important;
          color: #334155 !important;
        }
        .ai-chat-bubble-ai p, .ai-chat-bubble-ai span {
          color: #334155 !important;
        }
        .ai-chat-bubble-ai strong, .ai-chat-bubble-ai h4, .ai-chat-bubble-ai b {
          color: #0f172a !important;
        }
        .ai-input-field {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }
        .ai-input-field::placeholder {
          color: #94a3b8 !important;
        }
      `}</style>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', width: '100%', maxWidth: '860px', height: '82vh', minHeight: '520px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', color: '#0f172a', position: 'relative' }}>
        
        {/* Modern Clean Light Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)' }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.01em', color: '#0f172a' }}>ngonten.id AI</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span> ONLINE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>Data Analyst & Executive AI Partner</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={handleResetChat}
              title="Bersihkan Percakapan"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              title="Pengaturan Telegram & Webhook"
              style={{ background: showSettings ? '#f1f5f9' : 'none', border: 'none', color: showSettings ? '#4f46e5' : '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseLeave={(e) => { !showSettings && (e.currentTarget.style.color = '#64748b'); !showSettings && (e.currentTarget.style.backgroundColor = 'transparent'); }}
            >
              <Settings size={16} />
            </button>
            <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
            <button 
              onClick={onClose}
              title="Tutup"
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fee2e2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area (Light Slate Theme) */}
        {!showSettings ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '16px 20px 20px', backgroundColor: '#f8fafc' }}>
            
            {/* Messages Container */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '6px' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', position: 'relative' }}>
                  
                  {m.sender === 'user' ? (
                    /* User Message Bubble */
                    <div className="ai-chat-user-bubble" style={{
                      maxWidth: '80%',
                      padding: '11px 16px',
                      borderRadius: '16px 16px 4px 16px',
                      fontSize: '13.5px',
                      lineHeight: '1.5',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      fontWeight: '500',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                    }}>
                      <span style={{ color: '#ffffff' }}>{m.text}</span>
                    </div>
                  ) : (
                    /* AI Message Bubble */
                    <div className="ai-chat-bubble-ai" style={{
                      maxWidth: '90%',
                      padding: '16px 20px',
                      borderRadius: '16px 16px 16px 4px',
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}>
                      <div>{renderFormattedText(m.text)}</div>

                      {/* Copy action for AI responses */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <button
                          onClick={() => handleCopyText(m.text, idx)}
                          title="Salin jawaban"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: copiedIdx === idx ? '#16a34a' : '#64748b',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}
                        >
                          {copiedIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedIdx === idx ? 'Tersalin' : 'Salin Jawaban'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {m.actions.map(act => (
                        <button
                          key={act.id}
                          onClick={() => handleExecuteAction(act)}
                          style={{
                            background: '#e0e7ff',
                            border: '1px solid #c7d2fe',
                            color: '#3730a3',
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
                          <Play size={12} fill="#3730a3" /> {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAnalyzing && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontSize: '13px', padding: '10px 16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <RefreshCw size={14} className="animate-spin" /> Sedang menganalisis data & merumuskan jawaban...
                </div>
              )}
              <div ref={chatEndRef} style={{ height: '1px' }} />
            </div>

            {/* Quick Starter Suggestions */}
            {messages.length <= 2 && !isAnalyzing && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0 6px' }}>
                <button
                  onClick={() => handleSendMessage('Beri saya 3 ide tema kompetisi viral untuk menggaet 1000 kreator baru')}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <Calendar size={13} color="#db2777" /> Ide Kompetisi Viral
                </button>
                <button
                  onClick={() => handleSendMessage('Bagaimana analisis performa user dan omset platform saat ini?')}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <Users size={13} color="#2563eb" /> Analisis Data Platform
                </button>
                <button
                  onClick={() => handleSendMessage('Berapa estimasi budget yang pas untuk promosi campaign kreator?')}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <DollarSign size={13} color="#16a34a" /> Estimasi Budget Campaign
                </button>
              </div>
            )}

            {/* Clean Input Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text"
                  placeholder="Ketik pertanyaan atau instruksi untuk ngonten.id AI..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleSendMessage()}
                  className="ai-input-field"
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '13px 18px',
                    color: '#0f172a',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={isAnalyzing || !chatInput.trim()}
                style={{
                  backgroundColor: chatInput.trim() && !isAnalyzing ? '#4f46e5' : '#f1f5f9',
                  color: chatInput.trim() && !isAnalyzing ? '#ffffff' : '#94a3b8',
                  border: '1px solid',
                  borderColor: chatInput.trim() && !isAnalyzing ? '#4f46e5' : '#cbd5e1',
                  borderRadius: '12px',
                  width: '46px',
                  height: '46px',
                  cursor: chatInput.trim() && !isAnalyzing ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: chatInput.trim() && !isAnalyzing ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                }}
              >
                <Send size={18} color={chatInput.trim() && !isAnalyzing ? '#ffffff' : '#94a3b8'} />
              </button>
            </div>
          </div>
        ) : (
          /* Settings Drawer (Light Theme) */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}
              >
                <ChevronLeft size={16} /> Kembali ke Obrolan
              </button>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
              {testStatus && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: testStatus.type === 'success' ? '#dcfce7' : testStatus.type === 'error' ? '#fee2e2' : '#e0e7ff',
                  color: testStatus.type === 'success' ? '#166534' : testStatus.type === 'error' ? '#991b1b' : '#3730a3',
                  border: `1px solid ${testStatus.type === 'success' ? '#bbf7d0' : testStatus.type === 'error' ? '#fecaca' : '#c7d2fe'}`
                }}>
                  {testStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{testStatus.message}</span>
                </div>
              )}

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Integrasi Telegram Bot Owner</h4>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>Notifikasi real-time ngonten.id dikirim langsung ke akun Telegram Owner.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Telegram Bot Token</label>
                    <input 
                      type="text"
                      placeholder="Contoh: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      value={config.telegramBotToken}
                      onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 12px', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Telegram Chat ID</label>
                    <input 
                      type="text"
                      placeholder="Contoh: 396954314"
                      value={config.telegramChatId}
                      onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 12px', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!config.telegramBotToken || !config.telegramChatId) {
                        setTestStatus({ type: 'error', message: 'Harap isi Bot Token dan Chat ID!' });
                        return;
                      }
                      setTestStatus({ type: 'info', message: 'Mengirimkan pesan uji coba ke Telegram...' });
                      const res = await testTelegramNotification(config.telegramBotToken, config.telegramChatId);
                      if (res.success) {
                        setTestStatus({ type: 'success', message: '✅ Pesan test berhasil masuk ke Telegram!' });
                      } else {
                        setTestStatus({ type: 'error', message: `❌ Gagal: ${res.error}` });
                      }
                    }}
                    style={{ alignSelf: 'flex-start', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Kirim Test Notifikasi ke Telegram
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
