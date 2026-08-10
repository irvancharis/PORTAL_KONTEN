import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Calendar, Users, User, Award, FileVideo, CheckCircle2, Clock, XCircle, AlertTriangle, Send, Sparkles, Search, Wallet, ShieldCheck, Loader2, ArrowLeft, ChevronDown, X, Maximize2, ExternalLink, MapPin, ClipboardList, Play } from 'lucide-react';
import { sendEmailNotification } from '../services/emailNotificationService';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const formatIndonesianDate = (dateString) => {
  if (!dateString) return 'Hingga Budget Habis';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const hasTime = dateString.includes('T');
    
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    if (hasTime) {
      const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${formattedDate} pukul ${formattedTime}`;
    }
    
    return formattedDate;
  } catch (e) {
    return dateString;
  }
};

const getCategoryBadgeStyle = (category) => {
  return {
    bg: 'var(--primary-glow)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)'
  };
};

function CountdownTimer({ deadline }) {
  const calculateTimeLeft = () => {
    if (!deadline) return null;
    const difference = (deadline.includes('T') ? new Date(deadline).getTime() : new Date(deadline + 'T23:59:59').getTime()) - new Date().getTime();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        background: 'rgba(239, 68, 68, 0.08)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        padding: '12px 20px', 
        borderRadius: '12px', 
        color: '#ef4444', 
        fontWeight: 'bold',
        fontSize: '0.9rem' 
      }}>
        <Clock size={16} />
        <span>Pendaftaran & Pengiriman Karya Telah Ditutup</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  
  const digitBoxStyle = {
    background: 'rgba(15, 23, 42, 0.65)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '12px',
    padding: '12px 14px',
    minWidth: '55px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(56, 189, 248, 0.05)'
  };
  
  const digitStyle = {
    fontSize: '1.6rem', 
    fontWeight: '800', 
    color: 'white', 
    display: 'block', 
    lineHeight: '1.1',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
  };
  
  const digitLabelStyle = {
    fontSize: '0.62rem', 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase', 
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginTop: '4px',
    display: 'block'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '12px', 
      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.04) 0%, rgba(15, 23, 42, 0.4) 100%)', 
      border: '1px solid rgba(56, 189, 248, 0.18)', 
      padding: '20px', 
      borderRadius: '16px', 
      marginBottom: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        <Clock size={15} className="animate-pulse" style={{ color: '#38bdf8' }} />
        <span>Sisa Waktu Pendaftaran & Pengiriman</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {days > 0 && (
          <>
            <div style={digitBoxStyle}>
              <span style={digitStyle}>{days}</span>
              <span style={digitLabelStyle}>Hari</span>
            </div>
            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>:</span>
          </>
        )}
        <div style={digitBoxStyle}>
          <span style={digitStyle}>{hours.toString().padStart(2, '0')}</span>
          <span style={digitLabelStyle}>Jam</span>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>:</span>
        <div style={digitBoxStyle}>
          <span style={digitStyle}>{minutes.toString().padStart(2, '0')}</span>
          <span style={digitLabelStyle}>Menit</span>
        </div>
        <span style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold' }}>:</span>
        <div style={{...digitBoxStyle, borderColor: 'rgba(56, 189, 248, 0.4)'}}>
          <span style={{...digitStyle, color: '#38bdf8', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)'}}>{seconds.toString().padStart(2, '0')}</span>
          <span style={digitLabelStyle}>Detik</span>
        </div>
      </div>
    </div>
  );
}


function CardCountdown({ deadline }) {
  const getLabel = () => {
    if (!deadline) return '';
    const diffMs = (deadline.includes('T') ? new Date(deadline).getTime() : new Date(deadline + 'T23:59:59').getTime()) - new Date().getTime();
    if (diffMs <= 0) return 'Telah Selesai';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
      return `Sisa ${diffDays} hari ${diffHrs % 24} jam`;
    }
    if (diffHrs > 0) {
      return `Sisa ${diffHrs} jam ${diffMins % 60} menit`;
    }
    return `Sisa ${diffMins} menit`;
  };

  const [label, setLabel] = useState(getLabel());

  useEffect(() => {
    const timer = setInterval(() => {
      setLabel(getLabel());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, [deadline]);

  if (!label) return null;

  const isEndingSoon = label.startsWith('Sisa') && !label.includes('hari');
  const color = label === 'Telah Selesai' ? 'var(--text-muted)' : 'var(--text-primary)';
  const bg = 'var(--primary-glow)';
  const border = '1px solid var(--border-color)';

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '4px', 
      fontSize: '0.72rem', 
      color: color, 
      fontWeight: 'bold',
      background: bg,
      padding: '3px 8px',
      borderRadius: '20px',
      border: border
    }}>
      <Clock size={12} className={isEndingSoon ? "animate-pulse" : ""} />
      <span>{label}</span>
    </div>
  );
}

const formatInputCurrency = (num) => {
  if (num === 0 || !num) return '';
  return num.toLocaleString('id-ID');
};

// Google Apps Script Web App URL for social media verification (Optional)
// Paste your deployed Google Apps Script URL here, e.g. 'https://script.google.com/macros/s/...'
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbww9byb9H5SIW_HknSEVJJe-oY9S--NaeKSPjcQ6IBACzoQc38oZ36bQqm__60gncIxxA/exec';

// JSONP fetch helper to route Google Apps Script calls without CORS blocks
const fetchJSONP = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      const scriptTag = document.getElementById(callbackName);
      if (scriptTag) document.body.removeChild(scriptTag);
      resolve(data);
    };

    const queryParams = { ...params, callback: callbackName };
    const queryString = Object.keys(queryParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    const finalUrl = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = finalUrl;
    script.onerror = (err) => {
      delete window[callbackName];
      const scriptTag = document.getElementById(callbackName);
      if (scriptTag) document.body.removeChild(scriptTag);
      reject(new Error('JSONP request failed'));
    };

    document.body.appendChild(script);
  });
};

const SearchableSelect = ({ value, onChange, placeholder, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
          outline: 'none',
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <span>{value || placeholder}</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginTop: '4px',
          zIndex: 1000000000,
          maxHeight: '180px',
          overflowY: 'auto',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          padding: '8px',
          boxSizing: 'border-box'
        }}>
          <input 
            type="text"
            placeholder="Cari regional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              marginBottom: '8px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <div 
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`searchable-select-option ${opt === value ? 'selected' : ''}`}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EventsUserPortal({
  regions = [],
  currentUser,
  onLoginClick,
  onLogout,
  onEditProfileClick,
  onCreateEventRedirect,
  events,
  eventParticipants,
  setEventParticipants,
  eventSubmissions,
  setEventSubmissions,
  users = [],
  setUsers,
  onPopulateDemoEvents,
  offers = [],
  setOffers,
  communities = [],
  renderEventManagement,
  handleAwardEventGift
}) {
  const [registeringEvent, setRegisteringEvent] = useState(null); // Event model open for register
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventAreaFilter, setEventAreaFilter] = useState('');
  const [visibleEventsCount, setVisibleEventsCount] = useState(12);
  const [userPortalTab, setUserPortalTab] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/events/kelola')) return 'manage';
    if (path === '/events/undangan') return 'offers';
    return 'events';
  });
  const [autoOpenForm, setAutoOpenForm] = useState(false);

  const changePortalTab = (tab) => {
    setUserPortalTab(tab);
    if (tab === 'events') {
      window.history.pushState(null, '', '/events/semua');
    } else if (tab === 'offers') {
      window.history.pushState(null, '', '/events/undangan');
    } else if (tab === 'manage') {
      window.history.pushState(null, '', '/events/kelola');
    }
  };

  useEffect(() => {
    setVisibleEventsCount(12);
  }, [searchQuery]);
  const [expandedJuknis, setExpandedJuknis] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (selectedEvent) {
      window.scrollTo({ top: 0 });
      if (document.documentElement) document.documentElement.scrollTo({ top: 0 });
      if (document.body) document.body.scrollTo({ top: 0 });
    }
  }, [selectedEvent]);

  // URL Path Listener for Event Details (Allows direct link sharing)
  useEffect(() => {
    const handlePathCheck = () => {
      const path = window.location.pathname;
      if (path && path.startsWith('/event/')) {
        const eventParam = path.replace('/event/', '');
        const foundEvent = events.find(e => e.id === eventParam || eventParam.endsWith(e.id));
        if (foundEvent) {
          if (!currentUser) {
            window.history.replaceState(null, '', '/events');
            setSelectedEvent(null);
            if (onLoginClick) onLoginClick('register');
          } else {
            setSelectedEvent(foundEvent);
          }
        } else {
          setSelectedEvent(null);
        }
      } else {
        setSelectedEvent(null);
      }

      if (path.startsWith('/events/kelola')) {
        setUserPortalTab('manage');
      } else if (path === '/events/undangan') {
        setUserPortalTab('offers');
      } else if (path.startsWith('/events')) {
        setUserPortalTab('events');
      }
    };

    // Run once on mount
    handlePathCheck();

    // Listen for path changes
    window.addEventListener('popstate', handlePathCheck);
    return () => window.removeEventListener('popstate', handlePathCheck);
  }, [events]);

  // Social Media Verification States
  const [verificationStep, setVerificationStep] = useState('input'); // 'input' | 'verify' | 'loading' | 'success' | 'expired' | 'failed'
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [socialUrl, setSocialUrl] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [codeTimestamp, setCodeTimestamp] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [simulatedBio, setSimulatedBio] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [participantName, setParticipantName] = useState('');
  const [participantContact, setParticipantContact] = useState('');
  const [showTicketConfirm, setShowTicketConfirm] = useState(false);
  const [enlargedTicketReg, setEnlargedTicketReg] = useState(null);

  useEffect(() => {
    if (registeringEvent) {
      setParticipantName(currentUser ? currentUser.username : '');
      setParticipantContact(currentUser ? (currentUser.email || '') : '');
    }
  }, [registeringEvent, currentUser]);

  // Timer countdown hook for verification
  useEffect(() => {
    let interval = null;
    if (verificationStep === 'verify' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setVerificationStep('expired');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [verificationStep, timerSeconds]);



  const [submittingEvent, setSubmittingEvent] = useState(null); // Event model open for work submission
  const [workTitle, setWorkTitle] = useState('');
  const [workVideoUrl, setWorkVideoUrl] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workPlatform, setWorkPlatform] = useState('YouTube');
  const [googleAccountName, setGoogleAccountName] = useState('');
  const [googleReviewText, setGoogleReviewText] = useState('');
  const [googleReviewScreenshot, setGoogleReviewScreenshot] = useState('');

  const handleAcceptOffer = (off) => {
    // 1. Update this offer status to 'accepted'
    setOffers(prev => prev.map(o => o.id === off.id ? { ...o, status: 'accepted' } : o));

    // 2. Automatically register creator to the event if not registered yet
    const alreadyRegistered = eventParticipants.some(p => p.eventId === off.eventId && p.username.toLowerCase() === currentUser.username.toLowerCase());
    if (!alreadyRegistered) {
      const newPart = {
        id: 'part_' + Date.now(),
        eventId: off.eventId,
        name: currentUser.username,
        username: currentUser.username,
        email: currentUser.email || `${currentUser.username}@ngonten.id`,
        contact: `@${currentUser.username}`,
        socialPlatform: 'instagram',
        socialLink: `https://instagram.com/${currentUser.username}`,
        status: 'approved',
        verifiedAt: new Date().toISOString(),
        registeredAt: new Date().toISOString()
      };
      setEventParticipants(prev => [...prev, newPart]);
    }
    
    alert(`Undangan kolaborasi untuk event "${off.eventTitle}" berhasil diterima!`);
  };

  const handleDeclineOffer = (off) => {
    setOffers(prev => prev.map(o => o.id === off.id ? { ...o, status: 'declined' } : o));
    alert(`Undangan kolaborasi untuk event "${off.eventTitle}" ditolak.`);
  };

  const handleRegularRegister = (e) => {
    if (e) e.preventDefault();
    
    const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
    const finalName = userProfile.organizerName || userProfile.username;
    const finalPhone = userProfile.organizerPhone || userProfile.phone || '';
    const finalEmail = userProfile.email || `${userProfile.username}@gmail.com`;

    if (!userProfile.organizerName || !userProfile.organizerPhone) {
      alert('Silakan lengkapi Nama Lengkap dan No. WhatsApp di profil Anda terlebih dahulu!');
      return;
    }

    if (window.setGlobalLoading) window.setGlobalLoading('Sedang memproses tiket pendaftaran...');

    setTimeout(() => {
      try {
        const approvedCount = eventParticipants.filter(p => p.eventId === registeringEvent.id && p.status === 'approved').length;
        if (registeringEvent.maxParticipants > 0 && approvedCount >= registeringEvent.maxParticipants) {
          alert('Maaf, kuota peserta untuk event ini sudah penuh!');
          setRegisteringEvent(null);
          resetVerificationForm();
          return;
        }

        const ticketPrice = registeringEvent.ticketPrice || 0;
        if (ticketPrice > 0) {
          const currentBal = userProfile.walletBalance || 0;
          if (currentBal < ticketPrice) {
            alert('Saldo Anda tidak mencukupi untuk membeli tiket event ini!');
            return;
          }

          // Deduct balance
          setUsers(prevUsers => prevUsers.map(u => {
            if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
              return { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) - ticketPrice) };
            }
            if (u.username.toLowerCase() === (registeringEvent.creator || '').toLowerCase()) {
              return { ...u, walletBalance: (u.walletBalance || 0) + ticketPrice };
            }
            return u;
          }));
        }

        const tktCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        setGeneratedTicketCode(tktCode);

        const newPart = {
          id: `part_${Date.now()}`,
          eventId: registeringEvent.id,
          eventTitle: registeringEvent.title,
          name: finalName,
          username: currentUser.username,
          email: finalEmail,
          contact: finalPhone,
          socialPlatform: 'ticket',
          socialLink: '',
          status: 'approved',
          verifiedAt: new Date().toISOString(),
          registeredAt: new Date().toISOString(),
          ticketCode: tktCode,
          isCheckedIn: false,
          checkedInAt: null,
          ticketPrice: ticketPrice,
          isPaid: ticketPrice > 0
        };

        setEventParticipants([...eventParticipants, newPart]);
        setVerificationStep('success');
      } finally {
        if (window.setGlobalLoading) window.setGlobalLoading(null);
      }
    }, 850);
  };

  // Move from input handle step to show code instruction step
  const handleLanjutVerifikasi = (e) => {
    e.preventDefault();
    const usernameInput = socialUrl.trim();
    if (!usernameInput) {
      alert('Silakan masukkan Username atau @handle sosial media Anda!');
      return;
    }
    
    if (usernameInput.includes(' ')) {
      alert('Username / Handle tidak boleh mengandung spasi!');
      return;
    }

    // Generate unique code if not already set
    if (!uniqueCode) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setUniqueCode(`NGONTEN-${randomId}`);
    }

    setVerificationStep('verify');
    setTimerSeconds(180);
  };

  // Handle Check Account (Initiate checking if the social media account exists)
  const handleCheckAccount = async (e) => {
    if (e) e.preventDefault();
    const usernameInput = socialUrl.trim();
    if (!usernameInput) {
      alert('Silakan masukkan Username atau @handle sosial media Anda!');
      return;
    }

    if (window.setGlobalLoading) window.setGlobalLoading('Sedang memverifikasi akun sosial media...');
    setVerificationStep('loading');

    try {
      let cleanUsername = usernameInput;
      if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.substring(1);
      }

      // Determine target platform URL format for search query
      let searchUrl = '';
      let generatedLink = '';
      if (selectedPlatform === 'instagram') {
        searchUrl = `https://html.duckduckgo.com/html/?q=site:instagram.com/${cleanUsername}`;
        generatedLink = `https://instagram.com/${cleanUsername}`;
      } else if (selectedPlatform === 'tiktok') {
        searchUrl = `https://html.duckduckgo.com/html/?q=site:tiktok.com/%40${cleanUsername}`;
        generatedLink = `https://tiktok.com/@${cleanUsername}`;
      } else if (selectedPlatform === 'youtube') {
        searchUrl = `https://html.duckduckgo.com/html/?q=site:youtube.com/%40${cleanUsername}`;
        generatedLink = `https://youtube.com/@${cleanUsername}`;
      } else if (selectedPlatform === 'facebook') {
        searchUrl = `https://html.duckduckgo.com/html/?q=site:facebook.com/${cleanUsername}`;
        generatedLink = `https://facebook.com/${cleanUsername}`;
      }

      let verificationResult = { exists: false, codeFound: false, status: 'failed' };

      // 1. Try checking via deployed Google Apps Script first
      let appsScriptSuccess = false;
      if (GOOGLE_APPS_SCRIPT_URL) {
        try {
          const res = await fetchJSONP(GOOGLE_APPS_SCRIPT_URL, {
            platform: selectedPlatform,
            username: cleanUsername,
            code: uniqueCode
          });
          if (res && res.status) {
            verificationResult = res;
            appsScriptSuccess = true;
          }
        } catch (scriptErr) {
          console.warn("Apps Script verification failed, trying client-side fallback:", scriptErr);
        }
      }

      if (!appsScriptSuccess) {
        if (selectedPlatform === 'tiktok') {
          // Direct check using TikWM API (CORS friendly!)
          const tikwmUrl = `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(cleanUsername)}`;
          const response = await fetch(tikwmUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.code === 0 && data.data && data.data.user) {
              const signature = data.data.user.signature || '';
              const containsCode = signature.toLowerCase().includes(uniqueCode.toLowerCase());
              verificationResult = {
                exists: true,
                codeFound: containsCode,
                status: containsCode ? 'approved' : 'failed'
              };
            }
          }
        } else if (selectedPlatform === 'youtube') {
          // YouTube: Search channel page using proxy
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/@${cleanUsername}`)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            const html = data.contents || '';
            const containsCode = html.toLowerCase().includes(uniqueCode.toLowerCase());
            verificationResult = {
              exists: html.includes('ytInitialData') && !html.includes('This channel does not exist'),
              codeFound: containsCode,
              status: containsCode ? 'approved' : 'failed'
            };
          }
        } else {
          // Instagram/Facebook fallback check via DuckDuckGo search query
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            const html = data.contents || '';
            const hasResults = html.includes('class="result__body"') || html.includes('result__snippet');
            const containsCode = html.toLowerCase().includes(uniqueCode.toLowerCase());
            
            verificationResult = {
              exists: hasResults,
              codeFound: containsCode,
              status: containsCode ? 'approved' : 'failed'
            };
          }
        }
      }

      // Check special test simulation accounts
      const isTestMockSuccess = cleanUsername.toLowerCase() === 'rudiwijaya' || cleanUsername.toLowerCase() === 'sanaminnulloh';
      const isTestMockFailure = cleanUsername.toLowerCase() === 'notfound' || 
                                cleanUsername.toLowerCase() === 'invalid' || 
                                cleanUsername.toLowerCase() === 'tidakditemukan' || 
                                cleanUsername.toLowerCase() === 'error';

      if (isTestMockSuccess) {
        verificationResult = { exists: true, codeFound: true, status: 'approved' };
      } else if (isTestMockFailure) {
        verificationResult = { exists: false, codeFound: false, status: 'failed' };
      }

      if (verificationResult.status === 'failed') {
        if (!verificationResult.exists) {
          setVerificationError(`Akun @${cleanUsername} tidak ditemukan di platform ${selectedPlatform.toUpperCase()}. Pastikan username Anda sudah benar.`);
        } else {
          setVerificationError(`Kode unik ${uniqueCode} tidak ditemukan di bio/deskripsi profil ${selectedPlatform.toUpperCase()} Anda. Pastikan Anda telah menempelkan kode tersebut dengan benar.`);
        }
        setVerificationStep('failed');
      } else {
        const approvedCount = eventParticipants.filter(p => p.eventId === registeringEvent.id && p.status === 'approved').length;
        if (registeringEvent.maxParticipants > 0 && approvedCount >= registeringEvent.maxParticipants) {
          alert('Maaf, kuota peserta untuk event ini sudah penuh!');
          setRegisteringEvent(null);
          resetVerificationForm();
          return;
        }

        const targetStatus = verificationResult.status || 'approved';
        const ticketPrice = registeringEvent.ticketPrice || 0;
        
        if (ticketPrice > 0) {
          const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
          const currentBal = userProfile ? (userProfile.walletBalance || 0) : (currentUser.walletBalance || 0);
          if (currentBal < ticketPrice) {
            alert('Saldo Anda tidak mencukupi untuk membayar tiket pendaftaran event ini!');
            return;
          }
        }

        const tktCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        setGeneratedTicketCode(tktCode);

        if (ticketPrice > 0) {
          setUsers(prevUsers => prevUsers.map(u => {
            if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
              return { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) - ticketPrice) };
            }
            if (u.username.toLowerCase() === (registeringEvent.creator || '').toLowerCase()) {
              return { ...u, walletBalance: (u.walletBalance || 0) + ticketPrice };
            }
            return u;
          }));
        }

        const newPart = {
          id: `part_${Date.now()}`,
          eventId: registeringEvent.id,
          eventTitle: registeringEvent.title,
          name: currentUser.username,
          username: currentUser.username,
          email: currentUser.email || `${currentUser.username}@ngonten.id`,
          contact: `@${cleanUsername}`,
          socialPlatform: selectedPlatform,
          socialLink: generatedLink,
          status: targetStatus,
          verifiedAt: new Date().toISOString(),
          registeredAt: new Date().toISOString(),
          ticketCode: tktCode,
          isCheckedIn: false,
          checkedInAt: null,
          ticketPrice: ticketPrice,
          isPaid: ticketPrice > 0
        };

        setEventParticipants([...eventParticipants, newPart]);
        setVerificationStep('success');

        sendEmailNotification({
          toEmail: currentUser.email || `${currentUser.username}@ngonten.id`,
          toUsername: currentUser.username,
          subject: `[ngonten.id] E-Tiket & Konfirmasi Pendaftaran: ${registeringEvent.title}`,
          title: `E-Tiket Resmi: ${registeringEvent.title}`,
          message: `Selamat! Pendaftaran Anda di event <strong>"${registeringEvent.title}"</strong> telah berhasil dan status Anda resmi terdaftar. Klik tombol di bawah untuk melihat pass tiket QR resmi Anda saat hadir di acara.`,
          type: 'ticket',
          eventTitle: registeringEvent.title,
          actionUrl: `https://ngonten.id/ticket/${tktCode}`,
          actionLabel: 'Lihat E-Tiket Saya',
          secondaryActionUrl: `https://ngonten.id/event/${registeringEvent.slug || registeringEvent.id}`,
          secondaryActionLabel: 'Buka Detail Event',
          metadata: {
            'Nama Peserta': currentUser.name || currentUser.username,
            'Biaya / Tiket': ticketPrice > 0 ? `Rp ${ticketPrice.toLocaleString('id-ID')}` : 'Gratis',
            'Platform Akun': selectedPlatform.toUpperCase(),
            'Status Pendaftaran': 'Disetujui / Terdaftar',
            'Waktu Penerbitan': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          },
          usersList: users
        });
      }
    } catch (err) {
      console.warn('GAS/Primary check failed, running client-side fallback check:', err);
      
      try {
        let fallbackResult = { exists: false, codeFound: false, status: 'failed' };

        if (selectedPlatform === 'tiktok') {
          const tikwmUrl = `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(cleanUsername)}`;
          const response = await fetch(tikwmUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.code === 0 && data.data && data.data.user) {
              const signature = data.data.user.signature || '';
              const containsCode = signature.toLowerCase().includes(uniqueCode.toLowerCase());
              fallbackResult = {
                exists: true,
                codeFound: containsCode,
                status: containsCode ? 'approved' : 'failed'
              };
            }
          }
        } else if (selectedPlatform === 'youtube') {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/@${cleanUsername}`)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            const html = data.contents || '';
            const containsCode = html.toLowerCase().includes(uniqueCode.toLowerCase());
            fallbackResult = {
              exists: html.includes('ytInitialData') && !html.includes('This channel does not exist'),
              codeFound: containsCode,
              status: containsCode ? 'approved' : 'failed'
            };
          }
        } else {
          // Instagram/Facebook
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            const html = data.contents || '';
            const hasResults = html.includes('class="result__body"') || html.includes('result__snippet');
            const containsCode = html.toLowerCase().includes(uniqueCode.toLowerCase());
            fallbackResult = {
              exists: hasResults,
              codeFound: containsCode,
              status: containsCode ? 'approved' : 'failed'
            };
          }
        }

        // Test mock override
        const isTestMockSuccess = cleanUsername.toLowerCase() === 'rudiwijaya' || cleanUsername.toLowerCase() === 'sanaminnulloh';
        const isTestMockFailure = cleanUsername.toLowerCase() === 'notfound' || 
                                  cleanUsername.toLowerCase() === 'invalid' || 
                                  cleanUsername.toLowerCase() === 'tidakditemukan' || 
                                  cleanUsername.toLowerCase() === 'error';

        if (isTestMockSuccess) fallbackResult = { exists: true, codeFound: true, status: 'approved' };
        if (isTestMockFailure) fallbackResult = { exists: false, codeFound: false, status: 'failed' };

        if (fallbackResult.status === 'failed') {
          if (!fallbackResult.exists) {
            setVerificationError(`Akun @${cleanUsername} tidak ditemukan di platform ${selectedPlatform.toUpperCase()}. Pastikan username Anda sudah benar.`);
          } else {
            setVerificationError(`Kode unik ${uniqueCode} tidak ditemukan di bio/deskripsi profil ${selectedPlatform.toUpperCase()} Anda. Pastikan Anda telah menempelkan kode tersebut dengan benar.`);
          }
          setVerificationStep('failed');
        } else {
          const approvedCount = eventParticipants.filter(p => p.eventId === registeringEvent.id && p.status === 'approved').length;
          if (registeringEvent.maxParticipants > 0 && approvedCount >= registeringEvent.maxParticipants) {
            alert('Maaf, kuota peserta untuk event ini sudah penuh!');
            setRegisteringEvent(null);
            resetVerificationForm();
            return;
          }

          const targetStatus = fallbackResult.status || 'approved';
          const ticketPrice = registeringEvent.ticketPrice || 0;
          
          if (ticketPrice > 0) {
            const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
            const currentBal = userProfile ? (userProfile.walletBalance || 0) : (currentUser.walletBalance || 0);
            if (currentBal < ticketPrice) {
              alert('Saldo Anda tidak mencukupi untuk membayar tiket pendaftaran event ini!');
              return;
            }
          }

          const tktCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
          setGeneratedTicketCode(tktCode);

          if (ticketPrice > 0) {
            setUsers(prevUsers => prevUsers.map(u => {
              if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                return { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) - ticketPrice) };
              }
              if (u.username.toLowerCase() === (registeringEvent.creator || '').toLowerCase()) {
                return { ...u, walletBalance: (u.walletBalance || 0) + ticketPrice };
              }
              return u;
            }));
          }

          const newPart = {
            id: `part_${Date.now()}`,
            eventId: registeringEvent.id,
            eventTitle: registeringEvent.title,
            name: currentUser.username,
            username: currentUser.username,
            email: currentUser.email || `${currentUser.username}@ngonten.id`,
            contact: `@${cleanUsername}`,
            socialPlatform: selectedPlatform,
            socialLink: generatedLink,
            status: targetStatus,
            verifiedAt: new Date().toISOString(),
            registeredAt: new Date().toISOString(),
            ticketCode: tktCode,
            isCheckedIn: false,
            checkedInAt: null,
            ticketPrice: ticketPrice,
            isPaid: ticketPrice > 0
          };

          setEventParticipants([...eventParticipants, newPart]);
          setVerificationStep('success');

          sendEmailNotification({
            toEmail: currentUser.email || `${currentUser.username}@ngonten.id`,
            toUsername: currentUser.username,
            subject: `[ngonten.id] E-Tiket & Konfirmasi Pendaftaran: ${registeringEvent.title}`,
            title: `E-Tiket Resmi: ${registeringEvent.title}`,
            message: `Selamat! Pendaftaran Anda di event <strong>"${registeringEvent.title}"</strong> telah berhasil dan status Anda resmi terdaftar. Klik tombol di bawah untuk melihat pass tiket QR resmi Anda saat hadir di acara.`,
            type: 'ticket',
            eventTitle: registeringEvent.title,
            actionUrl: `https://ngonten.id/ticket/${tktCode}`,
            actionLabel: 'Lihat E-Tiket Saya',
            secondaryActionUrl: `https://ngonten.id/event/${registeringEvent.slug || registeringEvent.id}`,
            secondaryActionLabel: 'Buka Detail Event',
            metadata: {
              'Nama Peserta': currentUser.name || currentUser.username,
              'Biaya / Tiket': ticketPrice > 0 ? `Rp ${ticketPrice.toLocaleString('id-ID')}` : 'Gratis',
              'Platform Akun': selectedPlatform.toUpperCase(),
              'Status Pendaftaran': 'Disetujui / Terdaftar',
              'Waktu Penerbitan': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            },
            usersList: users
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback check failed too:', fallbackErr);
        setVerificationError(`Gagal menghubungi server verifikasi. Silakan periksa koneksi internet Anda atau coba lagi beberapa saat.`);
        setVerificationStep('failed');
      }
    }
  };

  const resetVerificationForm = () => {
    setVerificationStep('input');
    setSelectedPlatform('instagram');
    setSocialUrl('');
    setUniqueCode('');
    setTimerSeconds(180);
    setScanLog([]);
    setSimulatedBio('');
    setVerificationError('');
    setConfirmCode('');
    setShowConfirmDialog(false);
    setShowTicketConfirm(false);
  };



  const handleWorkSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const userRegistration = eventParticipants.find(
      p => p.eventId === submittingEvent.id && p.username.toLowerCase() === currentUser.username.toLowerCase()
    );

    if (!userRegistration) {
      alert('Pendaftaran Anda untuk event ini tidak ditemukan!');
      return;
    }

    if (window.setGlobalLoading) window.setGlobalLoading('Sedang mengirimkan karya Anda...');

    setTimeout(() => {
      try {
        const isGoogleReview = submittingEvent.juknisPlatforms?.GoogleReview === true;
        const newSub = {
          id: `sub_${Date.now()}`,
          eventId: submittingEvent.id,
          eventTitle: submittingEvent.title,
          participantName: userRegistration.name,
          username: currentUser.username,
          title: isGoogleReview ? `Google Review: ${googleAccountName.trim()}` : workTitle.trim(),
          videoUrl: workVideoUrl.trim(),
          description: isGoogleReview ? workDescription.trim() : workDescription.trim(),
          platform: isGoogleReview ? 'GoogleReview' : workPlatform,
          views: 0,
          likes: 0,
          comments: 0,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          score: null,
          feedback: '',
          paidBenefit: 0,
          // Google Review specific fields
          googleAccountName: isGoogleReview ? googleAccountName.trim() : '',
          googleReviewText: isGoogleReview ? workDescription.trim() : '',
          screenshotFile: isGoogleReview ? googleReviewScreenshot : ''
        };

        if (isGoogleReview) {
          // If there is an existing rejected submission, filter it out so we override it
          setEventSubmissions(prev => {
            const cleaned = prev.filter(s => !(s.eventId === submittingEvent.id && s.username.toLowerCase() === currentUser.username.toLowerCase()));
            return [...cleaned, newSub];
          });
        } else {
          setEventSubmissions([...eventSubmissions, newSub]);
        }
        setSubmittingEvent(null);
        setWorkTitle('');
        setWorkVideoUrl('');
        setWorkDescription('');
        setWorkPlatform('YouTube');
        setGoogleAccountName('');
        setGoogleReviewText('');
        setGoogleReviewScreenshot('');
        alert('Karya Anda berhasil dikirim! Panitia dan Juri akan segera menilai karya Anda.');
      } finally {
        if (window.setGlobalLoading) window.setGlobalLoading(null);
      }
    }, 850);
  };

  const handleUrlChange = (url) => {
    setWorkVideoUrl(url);
    if (url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be')) {
      setWorkPlatform('YouTube');
    } else if (url.toLowerCase().includes('tiktok.com')) {
      setWorkPlatform('TikTok');
    } else if (url.toLowerCase().includes('instagram.com')) {
      setWorkPlatform('Instagram');
    }
  };



  const getEventRemainingBudget = (evt) => {
    if (!evt) return 0;
    const initialBudget = evt.campaignBudget || 0;
    const eventSubs = eventSubmissions.filter(s => s.eventId === evt.id);
    
    if (evt.budgetMode === 'submit') {
      const totalPayout = eventSubs.reduce((sum, sub) => {
        if (sub.status === 'reviewed') {
          return sum + (sub.paidBenefit || evt.benefitAmount || 0);
        }
        return sum;
      }, 0);
      return Math.max(0, initialBudget - totalPayout);
    }

    const totalPayout = eventSubs.reduce((sum, sub) => {
      const views = sub.views || 0;
      const step = evt.benefitViewsStep || 1000;
      const minViews = evt.minEarningViews || 0;
      const amount = evt.benefitAmount || 0;
      const payout = views >= minViews ? Math.floor(views / step) * amount : 0;
      return sum + payout;
    }, 0);
    return Math.max(0, initialBudget - totalPayout);
  };

  const handleCreateEventClick = () => {
    if (!currentUser) {
      onLoginClick('register', 'panitia', true);
    } else if (
      currentUser.role === 'panitia' ||
      currentUser.role === 'user' ||
      currentUser.role === 'staf' ||
      currentUser.role === 'superadmin'
    ) {
      changePortalTab('manage');
      setAutoOpenForm(true);
    } else {
      setShowRoleWarning(true);
    }
  };

  const getEventStatusLabel = (evt) => {
    if (evt.paymentStatus !== 'paid') return 'Pending';
    const isDeadlinePassed = evt.deadline ? (
      evt.deadline.includes('T')
        ? new Date().getTime() > new Date(evt.deadline).getTime()
        : new Date().getTime() > new Date(evt.deadline + 'T23:59:59').getTime()
    ) : false;

    if (evt.eventType === 'regular') {
      if (isDeadlinePassed) return 'Selesai';
      return 'Aktif';
    }

    if (evt.budgetMode === 'ranking') {
      if (isDeadlinePassed) return 'Selesai';
      return 'Berjalan';
    } else {
      const remainingBudget = getEventRemainingBudget(evt);
      if (remainingBudget <= 0) return 'Selesai (Budget Habis)';
      if (isDeadlinePassed) return 'Selesai';
      return 'Berjalan';
    }
  };

  const isEventHiddenFromPublic = (evt) => {
    const label = getEventStatusLabel(evt);
    return label.startsWith('Selesai');
  };

  return (
    <div className="events-portal-container animate-fade-in-up" style={{ 
      padding: '24px 0', 
      color: 'var(--text-primary)',
      width: '100%'
    }}>
      {/* Profile Completion Suggestion Banner */}
      {currentUser && currentUser.role === 'user' && (!currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio) && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 'bold' }}>Profil Belum Lengkap!</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                lengkapi profil Anda terlebih dahulu agar dapat mendaftar sebagai peserta event.
              </p>
            </div>
          </div>
          <button
            onClick={onEditProfileClick}
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--bg-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-main)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <User size={14} />
            <span>Lengkapi Profil Sekarang</span>
          </button>
        </div>
      )}

      {selectedEvent ? (
        // ================= DEDICATED DETAIL PAGE VIEW =================
        (() => {
          const evt = selectedEvent;
          const userReg = currentUser 
            ? eventParticipants.find(p => p.eventId === evt.id && p.username.toLowerCase() === currentUser.username.toLowerCase())
            : null;

          const userSub = currentUser && userReg
            ? eventSubmissions.find(s => s.eventId === evt.id && s.username.toLowerCase() === currentUser.username.toLowerCase())
            : null;

          const organizerUser = users.find(u => u.username.toLowerCase() === (evt.creator || '').toLowerCase());
          const orgName = organizerUser?.organizerName || evt.organizerName || 'Panitia Portal';
          const orgAvatar = organizerUser?.organizerAvatar || evt.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=262626&textColor=ffffff`;

          return (
            <div className="animate-fade-in" style={{
              background: 'var(--bg-card)', 
              backdropFilter: 'blur(20px)', 
              padding: '32px', 
              borderRadius: '24px', 
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              {/* Back button */}
              <button 
                onClick={() => {
                  window.history.pushState(null, '', '/events');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginTop: '16px',
                  marginBottom: '28px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--border-color)';
                  e.currentTarget.style.borderColor = 'var(--text-secondary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--primary-glow)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Daftar Event</span>
              </button>

              {/* Grid Detail Content */}
              <div className="event-detail-grid">
                {/* Left Column: Info & Juknis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '2.2rem', 
                      fontWeight: '800', 
                      margin: '0 0 10px 0', 
                      letterSpacing: '-0.8px'
                    }}>{evt.title}</h2>

                    {/* Small category and type tags under the title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        background: 'var(--primary-glow)', 
                        color: 'var(--text-primary)', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        border: '1px solid var(--border-color)'
                      }}>
                        {evt.eventType === 'regular' ? 'Event' : 'Kompetisi'}
                      </span>
                      {(() => {
                        const style = getCategoryBadgeStyle(evt.category);
                        return (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            background: style.bg, 
                            color: style.color, 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            border: style.border
                          }}>
                            {evt.category}
                          </span>
                        );
                      })()}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <Calendar size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        {evt.deadline ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>Batas Waktu Pendaftaran: <strong style={{ color: 'var(--text-primary)' }}>{formatIndonesianDate(evt.deadline)}</strong></span>
                            <CardCountdown deadline={evt.deadline} />
                          </div>
                        ) : (
                          <span>Batas Waktu Pendaftaran: <strong style={{ color: 'var(--text-primary)' }}>{evt.eventType === 'regular' ? 'Tanpa Batas Waktu' : 'Tanpa Batas Waktu (Selesai saat budget habis)'}</strong></span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Wallet size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span>Biaya Pendaftaran / Tiket: <strong style={{ color: evt.ticketPrice > 0 ? '#10b981' : 'var(--text-primary)' }}>{evt.ticketPrice > 0 ? `Rp ${evt.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span>Mekanisme Area: <strong style={{ color: 'var(--text-primary)' }}>{evt.areaMode === 'regional' ? `Regional Khusus (${evt.areaRegional})` : 'Nasional (Semua Area)'}</strong></span>
                      </div>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8', margin: 0 }}>{evt.description}</p>
                  </div>

                  {/* Structured Technical Guidelines Card */}
                  {((evt.juknisPlatforms && (evt.juknisPlatforms.TikTok || evt.juknisPlatforms.Instagram || evt.juknisPlatforms.YouTube || evt.juknisPlatforms.Facebook)) || 
                    evt.juknisDuration || 
                    evt.juknisSourceName1 || 
                    evt.juknisBrandName || 
                    evt.juknisDos || 
                    evt.juknisDonts) ? (
                    <div style={{
                      padding: '24px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      fontSize: '0.88rem',
                      textAlign: 'left',
                      marginBottom: '24px'
                    }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', width: '100%' }}>
                        <CheckCircle2 size={18} style={{ color: 'var(--text-primary)' }} />
                        <span>Tugas & Cara Kerja</span>
                      </strong>

                      {/* Platforms & Duration badges */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Upload ke:</span>
                        {evt.juknisPlatforms?.TikTok && (
                          <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'var(--bg-main)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>TikTok</span>
                        )}
                        {evt.juknisPlatforms?.Instagram && (
                          <span style={{ fontSize: '0.75rem', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>Instagram</span>
                        )}
                        {evt.juknisPlatforms?.YouTube && (
                          <span style={{ fontSize: '0.75rem', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>YouTube Shorts</span>
                        )}
                        {evt.juknisPlatforms?.Facebook && (
                          <span style={{ fontSize: '0.75rem', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>Facebook</span>
                        )}
                        {evt.juknisDuration && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
                            {evt.juknisDuration}
                          </span>
                        )}
                      </div>

                      {/* Source Materials */}
                      {(evt.juknisSourceName1 || evt.juknisSourceName2) && (
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Bahan Sumber</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {evt.juknisSourceName1 && (
                              <a href={ensureAbsoluteUrl(evt.juknisSourceLink1)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-glow)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{evt.juknisSourceName1}</span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px', whiteSpace: 'nowrap' }}>{evt.juknisSourceLink1}</span>
                                </div>
                                <ExternalLink size={16} style={{ color: 'var(--text-secondary)' }} />
                              </a>
                            )}
                            {evt.juknisSourceName2 && (
                              <a href={ensureAbsoluteUrl(evt.juknisSourceLink2)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-glow)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{evt.juknisSourceName2}</span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px', whiteSpace: 'nowrap' }}>{evt.juknisSourceLink2}</span>
                                </div>
                                <ExternalLink size={16} style={{ color: 'var(--text-secondary)' }} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Google Maps Business Link (For Submit Mode) */}
                      {evt.budgetMode === 'submit' && evt.juknisBrandLink && (
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Google Maps Bisnis</span>
                          <a href={ensureAbsoluteUrl(evt.juknisBrandLink)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(96, 165, 250, 0.05)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '12px', textDecoration: 'none', color: '#60a5fa', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(96, 165, 250, 0.05)'}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#60a5fa' }}>Tulis Ulasan di Google Maps</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px', whiteSpace: 'nowrap' }}>{evt.juknisBrandLink}</span>
                            </div>
                            <ExternalLink size={16} style={{ color: '#60a5fa' }} />
                          </a>
                        </div>
                      )}

                      {/* Brand Assets */}
                      {evt.juknisBrandName && (
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Asset Logo / Brand</span>
                          <a href={ensureAbsoluteUrl(evt.juknisBrandLink)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-glow)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{evt.juknisBrandName}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px', whiteSpace: 'nowrap' }}>{evt.juknisBrandLink}</span>
                            </div>
                            <ExternalLink size={16} style={{ color: 'var(--text-secondary)' }} />
                          </a>
                        </div>
                      )}

                      {/* DOs list */}
                      {evt.juknisDos && (
                        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--secondary-glow)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Isi Konten Harus Begini:</span>
                          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            {evt.juknisDos.split('\n').filter(Boolean).map((line, idx) => (
                              <li key={idx} style={{ lineHeight: '1.5' }}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* DONTs list (Red warning container) */}
                      {evt.juknisDonts && (
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <AlertTriangle size={14} />
                            JANGAN Lakukan Ini!
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.8)', marginBottom: '8px' }}>Awas! Kalau melanggar, konten otomatis ditolak.</span>
                          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            {evt.juknisDonts.split('\n').filter(Boolean).map((line, idx) => (
                              <li key={idx} style={{ lineHeight: '1.5', color: '#ef4444' }}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evt.juknis && (
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Catatan Tambahan</span>
                          <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{evt.juknis}</div>
                        </div>
                      )}

                    </div>
                  ) : (
                    evt.juknis && (
                      <div style={{ 
                        padding: '24px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        fontSize: '0.88rem',
                        textAlign: 'left',
                        marginBottom: '24px'
                      }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                          <CheckCircle2 size={18} style={{ color: 'var(--text-secondary)' }} />
                          <span>Petunjuk Teknis (Juknis)</span>
                        </strong>
                        <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{evt.juknis}</div>
                      </div>
                    )
                  )}

                  <div style={{
                    padding: '24px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    textAlign: 'left'
                  }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                      <Users size={18} style={{ color: 'var(--text-secondary)' }} />
                      <span>Detail Penyelenggara</span>
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px dashed var(--border-color)' }}>
                      <img 
                        src={orgAvatar} 
                        alt={orgName} 
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=262626&textColor=ffffff`;
                        }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', marginBottom: '2px' }}>Nama Penyelenggara / Komunitas</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '700' }}>{orgName}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                      {evt.organizerDescription && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', marginBottom: '2px' }}>Tentang Penyelenggara</span>
                          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.6' }}>{evt.organizerDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Standings / Leaderboard (Automatically Calculated) */}
                  {evt.budgetMode === 'ranking' && (
                    <div style={{
                      padding: '24px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      textAlign: 'left',
                      marginTop: '24px'
                    }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                        <Trophy size={18} style={{ color: 'var(--text-secondary)' }} />
                        <span>{new Date(evt.deadline) < new Date() ? 'Pemenang Kompetisi (Final)' : 'Klasemen Sementara (Real-time)'}</span>
                      </strong>
                      {(() => {
                        const eventSubs = eventSubmissions.filter(sub => sub.eventId === evt.id);
                        const sortedSubs = [...eventSubs].sort((a, b) => (b.views || 0) - (a.views || 0));
                        
                        if (sortedSubs.length === 0) {
                          return <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Belum ada karya yang dikirimkan untuk kompetisi ini.</div>;
                        }
                        
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {sortedSubs.map((sub, index) => {
                              const rankLabels = ['Juara I', 'Juara II', 'Juara III'];
                              const prizeAmounts = [evt.prize1, evt.prize2, evt.prize3];
                              
                              const isTop3 = index < 3;
                              const subUser = users.find(u => u.username.toLowerCase() === sub.username.toLowerCase());
                              const userAvatar = subUser?.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sub.username)}&backgroundColor=262626&textColor=ffffff`;
                              
                              return (
                                <div 
                                  key={sub.id} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    background: 'var(--bg-card)',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ 
                                      fontSize: '0.82rem', 
                                      fontWeight: '700', 
                                      color: isTop3 ? 'var(--text-primary)' : 'var(--text-muted)',
                                      width: '65px',
                                      display: 'inline-block'
                                    }}>
                                      {isTop3 ? rankLabels[index] : `#${index + 1}`}
                                    </span>
                                    <img 
                                      src={userAvatar} 
                                      alt={sub.username} 
                                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.85rem' }}>{sub.username}</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{sub.title}</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    {isTop3 && prizeAmounts[index] > 0 && (
                                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '2px' }}>
                                        Rp {prizeAmounts[index].toLocaleString('id-ID')}
                                      </div>
                                    )}
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '600' }}>
                                      {(sub.views || 0).toLocaleString('id-ID')} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>views</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Right Column: Timer, Budget, and Forms/Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Countdown and Budget widgets */}

                  {evt.campaignBudget > 0 && (
                    evt.budgetMode === 'ranking' ? (
                      <div style={{ 
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-premium)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          background: 'var(--primary-glow)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderBottom: '1px solid var(--border-color)',
                          textAlign: 'left'
                        }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Total Hadiah (Prize Pool)
                          </span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '1.65rem', fontWeight: '800', lineHeight: 1 }}>
                            Rp {evt.campaignBudget.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 20px', fontSize: '0.85rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Juara I</span>
                            <strong style={{ color: 'var(--text-primary)' }}>Rp {evt.prize1?.toLocaleString('id-ID')}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Juara II</span>
                            <strong style={{ color: 'var(--text-primary)' }}>Rp {evt.prize2?.toLocaleString('id-ID')}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Juara III</span>
                            <strong style={{ color: 'var(--text-primary)' }}>Rp {evt.prize3?.toLocaleString('id-ID')}</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-premium)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          background: 'var(--primary-glow)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderBottom: '1px solid var(--border-color)',
                          textAlign: 'left'
                        }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Budget Campaign
                          </span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>
                            Rp {evt.campaignBudget.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        
                        <div style={{ padding: '16px 20px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Sisa Saldo</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Rp {getEventRemainingBudget(evt).toLocaleString('id-ID')}</span>
                          </div>
                          
                          {/* Budget Progress Bar */}
                          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ 
                              width: `${(getEventRemainingBudget(evt) / evt.campaignBudget) * 100}%`, 
                              height: '100%', 
                              background: 'var(--primary)',
                              boxShadow: '0 0 8px var(--primary)'
                            }}></div>
                          </div>
                          
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-glow)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <Award size={14} style={{ color: 'var(--text-secondary)' }} />
                            <span>
                              {evt.budgetMode === 'submit' ? (
                                `Benefit: Rp ${evt.benefitAmount?.toLocaleString('id-ID')} per Ulasan yang Disetujui`
                              ) : (
                                <>
                                  Benefit: Rp {evt.benefitAmount?.toLocaleString('id-ID')} per {(evt.benefitViewsStep || 1000).toLocaleString('id-ID')} Views
                                  {evt.minEarningViews > 0 && ` (Min. ${evt.minEarningViews.toLocaleString('id-ID')} Views)`}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Status Section based on Registration and Submission */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getEventStatusLabel(evt).startsWith('Selesai') ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Event Ended Info Box */}
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                          <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                          <div style={{ fontSize: '0.82rem', color: '#f87171', lineHeight: '1.5' }}>
                            <strong style={{ color: 'white' }}>Event Telah Selesai</strong><br />
                            Pendaftaran dan pengiriman karya untuk event ini sudah ditutup.
                          </div>
                        </div>
                        
                        {/* If user already submitted, still show their submission info */}
                        {userSub && (
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Karya Anda:</div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>{userSub.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                padding: '3px 10px', 
                                borderRadius: '12px', 
                                fontSize: '0.65rem',
                                color: 'white',
                                fontWeight: 'bold',
                                background: 
                                  userSub.platform?.toLowerCase() === 'youtube' ? '#ff0000' :
                                  userSub.platform?.toLowerCase() === 'tiktok' ? 'linear-gradient(45deg, #fe2c55, #25f4ee)' :
                                  userSub.platform?.toLowerCase() === 'instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : '#475569'
                              }}>{userSub.platform || 'Link Eksternal'}</span>
                              <span>Views: <strong>{(userSub.views || 0).toLocaleString('id-ID')}</strong></span>
                              <span>Likes: <strong>{(userSub.likes || 0).toLocaleString('id-ID')}</strong></span>
                            </div>
                            
                            {(() => {
                              const step = evt.benefitViewsStep || 1000;
                              const amount = evt.benefitAmount || 0;
                              const views = userSub.views || 0;
                              const minViews = evt.minEarningViews || 0;
                              const payout = views >= minViews ? Math.floor(views / step) * amount : 0;
                              if (minViews > 0 && views < minViews) {
                                return (
                                  <div style={{
                                    margin: '8px 0',
                                    padding: '10px 14px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)'
                                  }}>
                                    <span>Batas Min. Views:</span>
                                    <strong>{(views).toLocaleString('id-ID')} / {(minViews).toLocaleString('id-ID')} Views</strong>
                                  </div>
                                );
                              }
                              if (payout === 0) return null;
                              return (
                                <div style={{ 
                                  margin: '8px 0', 
                                  padding: '10px 14px', 
                                  background: 'rgba(34, 197, 94, 0.08)', 
                                  border: '1px solid rgba(34, 197, 94, 0.15)', 
                                  borderRadius: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.82rem'
                                }}>
                                  <span style={{ color: '#4ade80', fontWeight: '500' }}>Estimasi Pembayaran</span>
                                  <strong style={{ color: 'white', fontSize: '0.9rem' }}>Rp {payout.toLocaleString('id-ID')}</strong>
                                </div>
                              );
                            })()}
                            
                             {evt.budgetMode === 'views' ? (
                               userSub.score === null && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.05)', padding: '6px 8px', borderRadius: '4px' }}>
                                   <Clock size={14} />
                                   <span>Menunggu Sinkronisasi Views & Pembayaran</span>
                                 </div>
                               )
                             ) : userSub.score !== null ? (
                               <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                   <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: '600' }}>Hasil Penjurian</span>
                                   <span style={{ fontSize: '1.05rem', color: '#a78bfa', fontWeight: 'bold' }}>{userSub.score} / 100</span>
                                 </div>
                                 {userSub.feedback && (
                                   <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                                     "{userSub.feedback}"
                                   </p>
                                 )}
                               </div>
                             ) : (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.05)', padding: '6px 8px', borderRadius: '4px' }}>
                                 <Clock size={14} />
                                 <span>Sedang Dinilai oleh Juri</span>
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Normal Flow (Active event)
                      <React.Fragment>
                        {!currentUser ? (
                          // Not Logged In
                          <button 
                            className="btn btn-primary" 
                            onClick={() => onLoginClick('register', 'user', true)}
                            style={{ 
                              width: '100%', 
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: 'none',
                              padding: '14px 28px',
                              borderRadius: '30px',
                              fontSize: '0.92rem',
                              fontWeight: 'bold',
                              color: '#000000',
                              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.1)';
                            }}
                          >
                            <span>Masuk untuk Mendaftar</span>
                          </button>
                        ) : !userReg ? (
                          // Logged In, Not Registered
                          currentUser?.isCommunity ? (
                             <button 
                              className="btn btn-secondary" 
                              disabled
                              style={{ 
                                width: '100%', 
                                justifyContent: 'center',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '14px 28px',
                                borderRadius: '30px',
                                fontSize: '0.92rem',
                                fontWeight: 'bold',
                                color: 'var(--text-muted)',
                                cursor: 'not-allowed'
                              }}
                            >
                              <span>Komunitas tidak dapat mendaftar</span>
                            </button>
                          ) : (() => {
                            const isMembersOnly = evt.targetAudience === 'members_only';
                            const creatorCommunity = communities.find(c => c.username.toLowerCase() === evt.creator?.toLowerCase());
                            const isCommunityMember = creatorCommunity && (creatorCommunity.joinedMembers || []).includes(currentUser?.username);
                            
                            const isRegionalEvent = evt.areaMode === 'regional';
                            const isUserRegionalMatch = !isRegionalEvent || (evt.areaRegional && currentUser?.userRegional && currentUser.userRegional.toLowerCase().trim() === evt.areaRegional.toLowerCase().trim());
                            
                            if (isRegionalEvent && !isUserRegionalMatch) {
                              return (
                                <button 
                                  className="btn btn-secondary" 
                                  disabled
                                  style={{ 
                                    width: '100%', 
                                    justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    padding: '14px 28px',
                                    borderRadius: '30px',
                                    fontSize: '0.92rem',
                                    fontWeight: 'bold',
                                    color: '#ef4444',
                                    cursor: 'not-allowed'
                                  }}
                                >
                                  <span>Khusus Regional {evt.areaRegional} (Lokasi Anda: {currentUser?.userRegional || '-'})</span>
                                </button>
                              );
                            }

                            if (isMembersOnly && !isCommunityMember) {
                              return (
                                <button 
                                  className="btn btn-secondary" 
                                  disabled
                                  style={{ 
                                    width: '100%', 
                                    justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    padding: '14px 28px',
                                    borderRadius: '30px',
                                    fontSize: '0.92rem',
                                    fontWeight: 'bold',
                                    color: '#ef4444',
                                    cursor: 'not-allowed'
                                  }}
                                >
                                  <span>Khusus Anggota {creatorCommunity?.name || evt.organizerName || evt.creator}</span>
                                </button>
                              );
                            }
                            
                            return (
                               <button 
                                className="btn btn-primary" 
                                onClick={() => {
                                  const isProfileIncomplete = !currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio;
                                  if (currentUser.role === 'user' && isProfileIncomplete) {
                                    alert('Profil & Portofolio Anda belum lengkap! Silakan lengkapi profil Anda terlebih dahulu untuk dapat mendaftar event.');
                                    if (onEditProfileClick) onEditProfileClick();
                                    return;
                                  }
                                  setRegisteringEvent(evt);
                                  setEmail(currentUser.username + '@gmail.com');
                                }}
                                style={{ 
                                  width: '100%', 
                                  justifyContent: 'center',
                                  background: '#ffffff',
                                  border: 'none',
                                  padding: '14px 28px',
                                  borderRadius: '30px',
                                  fontSize: '0.92rem',
                                  fontWeight: 'bold',
                                  color: '#000000',
                                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.1)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.1)';
                                }}
                              >
                                <span>{evt.eventType === 'regular' ? (evt.ticketPrice > 0 ? 'Beli Tiket' : 'Daftar Acara') : 'Daftar Kompetisi'}</span>
                              </button>
                            );
                          })()
                        ) : (
                          // Logged In & Registered
                          <div style={{ textAlign: 'left' }}>
                            {/* E-Tiket Card (Hanya jika ada penjualan tiket) */}
                            {evt.ticketPrice > 0 && (
                              <div 
                                onClick={() => setEnlargedTicketReg(userReg)}
                                title="Klik untuk memperbesar tiket"
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '16px',
                                  padding: '20px',
                                  marginBottom: '24px',
                                  boxShadow: 'var(--shadow-premium)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'var(--primary-glow)';
                                  e.currentTarget.style.borderColor = 'var(--text-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'var(--bg-card)';
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                              >
                                {/* Ticket Notch decorations */}
                                <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-main)', borderRight: '1px solid var(--border-color)' }}></div>
                                <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-main)', borderLeft: '1px solid var(--border-color)' }}></div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '14px' }}>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>E-Tiket Resmi</span>
                                  <span style={{ 
                                    fontSize: '0.68rem', 
                                    background: userReg.isCheckedIn ? 'var(--primary-glow)' : 'var(--primary-glow)', 
                                    color: userReg.isCheckedIn ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                    padding: '3px 8px', 
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: '1px solid var(--border-color)'
                                  }}>
                                    {userReg.isCheckedIn ? 'SUDAH CHECK-IN' : 'BELUM CHECK-IN'}
                                  </span>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                 {/* Real QR Code Image */}
                                  <div style={{ 
                                    background: 'white', 
                                    borderRadius: '8px', 
                                    padding: '4px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    boxSizing: 'border-box'
                                  }}>
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(userReg.ticketCode || `TKT-${userReg.id.substring(userReg.id.length - 6).toUpperCase()}`)}`}
                                      alt="QR Code"
                                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                  </div>
                                  
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kode Tiket</span>
                                    <span style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                      {userReg.ticketCode || `TKT-${userReg.id.substring(userReg.id.length - 6).toUpperCase()}`}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                      Nama: <strong>{userReg.name}</strong>
                                    </span>
                                  </div>
                                </div>

                                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                                  <Maximize2 size={10} />
                                  <span>Klik tiket untuk memperbesar & scan</span>
                                </div>
                                
                                {evt.ticketPrice > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Status Pembayaran</span>
                                    <strong style={{ color: '#10b981' }}>✓ Lunas (Rp {evt.ticketPrice.toLocaleString('id-ID')})</strong>
                                  </div>
                                )}
                                
                                {userReg.isCheckedIn && userReg.checkedInAt && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    <span>Waktu Check-In:</span>
                                    <span>{new Date(userReg.checkedInAt).toLocaleTimeString('id-ID')} - {new Date(userReg.checkedInAt).toLocaleDateString('id-ID')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Panel Aksi & Status Tugas Sineas/Peserta (Tone Hitam Putih Premium) */}
                            {evt.eventType !== 'regular' && (
                              <div style={{
                                background: 'var(--bg-card)',
                                border: '2px solid var(--text-primary)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                textAlign: 'left',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-premium)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                  <ClipboardList size={18} style={{ color: 'var(--text-primary)' }} />
                                  <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                    Panel Tugas Anda
                                  </span>
                                </div>

                                {userReg.status === 'pending' && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'var(--primary-glow)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '12px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                                      <Clock size={12} />
                                      <span>MENUNGGU PERSETUJUAN DAFTAR</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      Pendaftaran Anda sedang diverifikasi oleh panitia. Anda baru dapat mengirimkan laporan tugas setelah pendaftaran disetujui.
                                    </p>
                                  </div>
                                )}

                                {userReg.status === 'rejected' && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', marginBottom: '10px' }}>
                                      <XCircle size={12} />
                                      <span>PENDAFTARAN DITOLAK</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      Mohon maaf, pendaftaran Anda ditolak oleh panitia. Silakan hubungi panitia untuk informasi lebih lanjut.
                                    </p>
                                  </div>
                                )}

                                {userReg.status === 'approved' && (!userSub || userSub.status === 'rejected') && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'var(--primary-glow)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                                      <Play size={12} />
                                      <span>TUGAS BELUM DIKIRIM</span>
                                    </div>
                                    
                                    {userSub && userSub.status === 'rejected' && (
                                      <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Alasan Penolakan Panitia:</span>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#f87171', fontStyle: 'italic', lineHeight: '1.4' }}>
                                          "${userSub.feedback}"
                                        </p>
                                      </div>
                                    )}

                                    <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      {evt.budgetMode === 'submit' ? (
                                        'Tulis ulasan bintang 5 Anda di Google Maps sesuai petunjuk juknis, ambil screenshot bukti ulasan, lalu unggah laporan Anda di bawah ini.'
                                      ) : (
                                        'Buat karya video terbaik Anda, unggah ke platform sosmed (YouTube/TikTok/Instagram), lalu kirimkan tautan videonya di bawah ini.'
                                      )}
                                    </p>

                                    <button
                                      onClick={() => setSubmittingEvent(evt)}
                                      style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'var(--text-primary)',
                                        color: 'var(--bg-main)',
                                        border: 'none',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.2)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,255,255,0.1)';
                                      }}
                                    >
                                      <Send size={14} />
                                      <span>
                                        {userSub && userSub.status === 'rejected' ? 'PERBAIKI & KIRIM ULANG SEKARANG' : (evt.budgetMode === 'submit' ? 'KIRIM LAPORAN ULASAN SEKARANG' : 'KIRIM TAUTAN KARYA SEKARANG')}
                                      </span>
                                    </button>
                                  </div>
                                )}

                                {userReg.status === 'approved' && userSub && (userSub.status === 'submitted' || userSub.status === 'pending') && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'var(--primary-glow)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                                      <Clock size={12} />
                                      <span>SEDANG DINILAI / DIVERIFIKASI</span>
                                    </div>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      Tugas Anda telah sukses terkirim dan saat ini sedang berada dalam tahap pemeriksaan oleh panitia/juri.
                                    </p>
                                    <div style={{ 
                                      padding: '12px', 
                                      background: 'rgba(255, 255, 255, 0.02)', 
                                      border: '1px solid var(--border-color)', 
                                      borderRadius: '10px',
                                      fontSize: '0.78rem',
                                      color: 'var(--text-secondary)'
                                    }}>
                                      <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }}>Laporan Terkirim:</strong>
                                      <div style={{ wordBreak: 'break-all' }}>{userSub.title}</div>
                                      <div style={{ marginTop: '6px', color: 'var(--text-muted)' }}>Dikirim pada: {new Date(userSub.submittedAt).toLocaleDateString('id-ID')}</div>
                                    </div>
                                  </div>
                                )}

                                {userReg.status === 'approved' && userSub && userSub.status === 'approved' && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', marginBottom: '12px' }}>
                                      <CheckCircle2 size={12} />
                                      <span>TUGAS SELESAI & DISETUJUI</span>
                                    </div>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      Selamat! Ulasan/karya Anda telah disetujui oleh panitia dan benefit reward telah sukses ditransfer ke dompet Anda.
                                    </p>
                                    <div style={{ 
                                      padding: '14px', 
                                      background: 'rgba(34, 197, 94, 0.05)', 
                                      border: '1px solid rgba(34, 197, 94, 0.2)', 
                                      borderRadius: '10px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      fontSize: '0.82rem'
                                    }}>
                                      <span style={{ color: '#4ade80', fontWeight: '600' }}>Reward Diterima</span>
                                      <strong style={{ color: 'white', fontSize: '0.95rem' }}>Rp {(userSub.paidBenefit || evt.benefitAmount || 0).toLocaleString('id-ID')}</strong>
                                    </div>
                                  </div>
                                )}

                                {userReg.status === 'approved' && userSub && userSub.status === 'reviewed' && (
                                  <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', marginBottom: '12px' }}>
                                      <Award size={12} />
                                      <span>PENILAIAN SELESAI</span>
                                    </div>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                      Karya video Anda telah dinilai oleh dewan juri. Terima kasih atas partisipasi Anda!
                                    </p>
                                    <div style={{ 
                                      padding: '14px', 
                                      background: 'rgba(255,255,255,0.02)', 
                                      border: '1px solid var(--border-color)', 
                                      borderRadius: '10px',
                                      fontSize: '0.82rem'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Skor Akhir Juri:</span>
                                        <strong style={{ color: 'white' }}>{userSub.score} / 100</strong>
                                      </div>
                                      {userSub.feedback && (
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                                          Catatan Juri: "{userSub.feedback}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}


                            {/* Unified Stepper/Timeline */}
                            {evt.eventType === 'regular' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', marginTop: '10px' }}>
                                {/* Step 1: Pendaftaran & Tiket */}
                                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                  <div style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '26px',
                                    bottom: '-26px',
                                    width: '2px',
                                    background: userReg.status === 'approved' ? '#22c55e' : 'var(--border-color)',
                                    zIndex: 1
                                  }} />
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: userReg.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' : 'var(--primary-glow)',
                                    border: `2px solid ${userReg.status === 'approved' ? '#22c55e' : 'var(--border-color)'}`,
                                    zIndex: 2,
                                    flexShrink: 0
                                  }}>
                                    {userReg.status === 'approved' ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <Clock size={14} style={{ color: '#fbbf24' }} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                      Tahap 1: Pendaftaran & Pembelian Tiket
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                      {userReg.status === 'approved' ? 'Tiket Anda telah terbit dan lunas.' : 'Pendaftaran Anda sedang diproses.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 2: Check-In Kehadiran */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: userReg.isCheckedIn ? 'rgba(34, 197, 94, 0.15)' : 'var(--primary-glow)',
                                    border: `2px solid ${userReg.isCheckedIn ? '#22c55e' : 'var(--border-color)'}`,
                                    zIndex: 2,
                                    flexShrink: 0
                                  }}>
                                    {userReg.isCheckedIn ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: userReg.isCheckedIn ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                      Tahap 2: Kehadiran di Acara
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      {userReg.isCheckedIn ? 'Anda telah berhasil check-in di lokasi.' : 'Tunjukkan E-Tiket Anda pada panitia di lokasi untuk check-in.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', marginTop: '10px' }}>
                                
                                {/* Step 1: Pendaftaran */}
                                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                  {/* Line to Step 2 */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '26px',
                                    bottom: '-26px',
                                    width: '2px',
                                    background: userReg.status === 'approved' ? '#22c55e' : 'var(--border-color)',
                                    zIndex: 1
                                  }} />
                                  
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 
                                      userReg.status === 'approved' ? 'rgba(34, 197, 94, 0.15)' :
                                      userReg.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    border: `2px solid ${
                                      userReg.status === 'approved' ? '#22c55e' :
                                      userReg.status === 'pending' ? '#eab308' : '#ef4444'
                                    }`,
                                    zIndex: 2,
                                    flexShrink: 0
                                  }}>
                                    {userReg.status === 'approved' && <CheckCircle2 size={14} style={{ color: '#22c55e' }} />}
                                    {userReg.status === 'pending' && <Clock size={14} style={{ color: '#fbbf24' }} />}
                                    {userReg.status === 'rejected' && <XCircle size={14} style={{ color: '#ef4444' }} />}
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                      Tahap 1: Pendaftaran Kompetisi
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                      {userReg.status === 'approved' ? 'Pendaftaran disetujui. Anda resmi terdaftar.' :
                                       userReg.status === 'pending' ? 'Pendaftaran Anda sedang diverifikasi panitia.' :
                                       'Pendaftaran Anda ditolak oleh panitia.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 2: Pengiriman Karya */}
                                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                  {/* Line to Step 3 */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '26px',
                                    bottom: '-26px',
                                    width: '2px',
                                    background: (userReg.status === 'approved' && userSub && userSub.status !== 'rejected') ? '#22c55e' : 'var(--border-color)',
                                    zIndex: 1
                                  }} />
                                  
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 
                                      (userReg.status === 'approved' && userSub && userSub.status !== 'rejected') ? 'rgba(34, 197, 94, 0.15)' :
                                      userReg.status === 'approved' ? 'var(--primary-glow)' : 'var(--primary-glow)',
                                    border: `2px solid ${
                                      (userReg.status === 'approved' && userSub && userSub.status !== 'rejected') ? '#22c55e' :
                                      userReg.status === 'approved' ? 'var(--primary)' : 'var(--border-color)'
                                    }`,
                                    zIndex: 2,
                                    flexShrink: 0
                                  }}>
                                    {(userReg.status === 'approved' && userSub && userSub.status !== 'rejected') ? (
                                      <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                                    ) : (
                                      <div style={{ 
                                        width: '6px', 
                                        height: '6px', 
                                        borderRadius: '50%', 
                                        background: userReg.status === 'approved' ? 'var(--primary)' : 'var(--text-muted)' 
                                      }} />
                                    )}
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: userReg.status === 'approved' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                      {evt.budgetMode === 'submit' ? 'Tahap 2: Pengisian Ulasan Google Maps' : 'Tahap 2: Pengiriman Karya Video'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                      {userReg.status !== 'approved' ? 'Menunggu persetujuan pendaftaran.' :
                                       (userSub && userSub.status !== 'rejected') ? (evt.budgetMode === 'submit' ? '✓ Ulasan Anda telah sukses dikirim.' : '✓ Karya video Anda telah sukses dikirim.') :
                                       (evt.budgetMode === 'submit' ? 'Tulis ulasan & unggah bukti laporan di atas.' : 'Kirim video YouTube/TikTok/Instagram Anda di atas.')}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 3: Penilaian & Hasil */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 
                                      (userSub && (userSub.status === 'approved' || userSub.status === 'reviewed')) ? 'rgba(34, 197, 94, 0.15)' :
                                      (userSub && userSub.status === 'submitted') ? 'rgba(234, 179, 8, 0.15)' :
                                      (userSub && userSub.status === 'rejected') ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary-glow)',
                                    border: `2px solid ${
                                      (userSub && (userSub.status === 'approved' || userSub.status === 'reviewed')) ? '#22c55e' :
                                      (userSub && userSub.status === 'submitted') ? '#eab308' :
                                      (userSub && userSub.status === 'rejected') ? '#ef4444' : 'var(--border-color)'
                                    }`,
                                    zIndex: 2,
                                    flexShrink: 0
                                  }}>
                                    {(userSub && (userSub.status === 'approved' || userSub.status === 'reviewed')) ? (
                                      <Award size={13} style={{ color: '#22c55e' }} />
                                    ) : (userSub && userSub.status === 'submitted') ? (
                                      <Clock size={13} style={{ color: '#fbbf24' }} />
                                    ) : (userSub && userSub.status === 'rejected') ? (
                                      <XCircle size={13} style={{ color: '#ef4444' }} />
                                    ) : (
                                      <div style={{ 
                                        width: '6px', 
                                        height: '6px', 
                                        borderRadius: '50%', 
                                        background: 'var(--text-muted)' 
                                      }} />
                                    )}
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: userSub ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                      {evt.budgetMode === 'submit' ? 'Tahap 3: Verifikasi Ulasan & Hasil' : (evt.budgetMode === 'views' ? 'Tahap 3: Pembayaran Otomatis & Hasil' : 'Tahap 3: Penilaian Juri & Hasil')}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                      {!userSub ? (evt.budgetMode === 'submit' ? 'Menunggu pengiriman laporan ulasan.' : 'Menunggu pengiriman karya video.') :
                                       (userSub.status === 'submitted' || userSub.status === 'pending') ? (evt.budgetMode === 'submit' ? 'Sedang diverifikasi oleh panitia.' : 'Sedang dinilai oleh juri.') :
                                       userSub.status === 'rejected' ? 'Ulasan ditolak (silakan perbaiki pada tahap 2).' :
                                       userSub.status === 'approved' ? '✓ Tugas disetujui & reward saldo wallet cair.' : '✓ Penilaian selesai.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        // ================= ROW LIST VIEW =================
        <React.Fragment>
          {/* Header Title */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '16px' 
          }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              Event & Kompetisi Kreatif
            </h1>
          </div>

          {/* User Portal Tabs */}
          {currentUser && (currentUser.role === 'user' || currentUser.role === 'panitia' || currentUser.role === 'superadmin' || currentUser.role === 'staf') && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto', width: '100%' }}>
              <button
                onClick={() => changePortalTab('events')}
                style={{
                  padding: '10px 20px',
                  background: userPortalTab === 'events' ? 'var(--primary-glow)' : 'transparent',
                  border: userPortalTab === 'events' ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: userPortalTab === 'events' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Semua Event
              </button>
              <button
                onClick={() => {
                  changePortalTab('manage');
                  setAutoOpenForm(false);
                }}
                style={{
                  padding: '10px 20px',
                  background: userPortalTab === 'manage' ? 'var(--primary-glow)' : 'transparent',
                  border: userPortalTab === 'manage' ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: userPortalTab === 'manage' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Kelola Event Saya
              </button>
              <button
                onClick={() => changePortalTab('offers')}
                style={{
                  padding: '10px 20px',
                  background: userPortalTab === 'offers' ? 'var(--primary-glow)' : 'transparent',
                  border: userPortalTab === 'offers' ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: userPortalTab === 'offers' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Undangan Kolaborasi</span>
                {(() => {
                  const pendingCount = (offers || []).filter(o => o.recipient.toLowerCase() === currentUser.username.toLowerCase() && o.status === 'pending').length;
                  if (pendingCount > 0) {
                    return (
                      <span style={{
                        background: 'var(--primary)',
                        color: 'var(--bg-main)',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {pendingCount}
                      </span>
                    );
                  }
                  return null;
                })()}
              </button>
            </div>
          )}

          {userPortalTab === 'offers' ? (
            <div className="collab-offers-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', width: '100%' }}>
              {(() => {
                const myOffers = (offers || []).filter(o => o.recipient.toLowerCase() === currentUser?.username.toLowerCase());
                if (myOffers.length === 0) {
                  return (
                    <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
                      Belum ada undangan kolaborasi untuk akun Anda saat ini.
                    </div>
                  );
                }

                return myOffers.map(off => {
                  const evt = events.find(e => e.id === off.eventId);
                  const offerDate = off.sentAt ? new Date(off.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                  const isRegistered = eventParticipants.some(p => p.eventId === off.eventId && p.username.toLowerCase() === currentUser.username.toLowerCase());

                  return (
                    <div 
                      key={off.id}
                      className="glass-panel"
                      style={{
                        padding: '18px 22px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        flexWrap: 'wrap',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Left Block: Sender & Event Info */}
                      <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            fontWeight: '700', 
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            Pengirim: @{off.sender}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {offerDate}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span 
                            onClick={() => {
                              if (evt) {
                                const eventSlug = slugify(evt.title) + '-' + evt.id;
                                window.history.pushState(null, '', '/event/' + eventSlug);
                                window.dispatchEvent(new PopStateEvent('popstate'));
                              } else {
                                alert('Detail event tidak ditemukan atau sudah dihapus.');
                              }
                            }}
                            style={{ 
                              color: 'var(--text-primary)', 
                              fontWeight: '800', 
                              fontSize: '1.05rem', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{off.eventTitle}</span>
                            <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                          </span>
                        </div>

                        {off.message && (
                          <div style={{ 
                            fontSize: '0.82rem', 
                            color: 'var(--text-secondary)', 
                            fontStyle: 'italic', 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            borderLeft: '3px solid var(--text-muted)',
                            marginTop: '2px'
                          }}>
                            "{off.message}"
                          </div>
                        )}
                      </div>

                      {/* Middle Block: Budget if available */}
                      {(off.budget || 0) > 0 && (
                        <div style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'center',
                          flex: '0 0 auto'
                        }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                            TAWARAN BUDGET
                          </span>
                          <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                            Rp {off.budget?.toLocaleString('id-ID')}
                          </strong>
                        </div>
                      )}

                      {/* Right Block: Action Buttons / Status Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
                        {off.status === 'pending' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleDeclineOffer(off)}
                              style={{
                                height: '38px',
                                padding: '0 16px',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                fontWeight: '600',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                              }}
                            >
                              <XCircle size={15} />
                              <span>Tolak</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(off)}
                              style={{
                                height: '38px',
                                padding: '0 18px',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                background: 'var(--text-primary)',
                                color: 'var(--bg-main)',
                                border: '1px solid var(--text-primary)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                              }}
                            >
                              <CheckCircle2 size={15} />
                              <span>Terima Undangan</span>
                            </button>
                          </div>
                        ) : off.status === 'accepted' ? (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            height: '38px',
                            padding: '0 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.84rem', 
                            fontWeight: '700', 
                            background: '#ecfdf5', 
                            color: '#15803d', 
                            border: '1px solid #a7f3d0',
                            boxSizing: 'border-box'
                          }}>
                            <CheckCircle2 size={15} />
                            <span>Undangan Diterima</span>
                          </div>
                        ) : (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            height: '38px',
                            padding: '0 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.84rem', 
                            fontWeight: '700', 
                            background: '#fef2f2', 
                            color: '#b91c1c', 
                            border: '1px solid #fecaca',
                            boxSizing: 'border-box'
                          }}>
                            <XCircle size={15} />
                            <span>Undangan Ditolak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : userPortalTab === 'manage' ? (
            <div className="event-management-view animate-fade-in" style={{ textAlign: 'left', width: '100%' }}>
              {renderEventManagement && renderEventManagement(() => {
                setAutoOpenForm(false);
                changePortalTab('manage');
              }, autoOpenForm)}
            </div>
          ) : (
            <>
              {/* Search Bar & Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', width: '100%', position: 'relative', zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', flex: '1 1 300px', maxWidth: '650px' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '350px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari event kompetisi..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Area / Regional Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', flex: '1 1 200px', maxWidth: '280px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', whiteSpace: 'nowrap' }}>Regional:</span>
                <div style={{ flex: 1 }}>
                  <SearchableSelect 
                    value={eventAreaFilter}
                    onChange={(val) => setEventAreaFilter(val === "Semua Regional" ? "" : val)}
                    placeholder="Semua Regional"
                    options={["Semua Regional", ...regions]}
                  />
                </div>
              </div>
            </div>

            {/* Buat Event Button */}
            <button 
              onClick={handleCreateEventClick}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'white',
                border: '1px solid white',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                color: 'black',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.88rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.1)';
              }}
            >
              <Calendar size={16} />
              <span>Buat Event Baru</span>
            </button>
          </div>

          {/* List Layout: Row Cards */}
          <div className="event-portal-list-container">
            {(() => {
              const filtered = events
                .filter(evt => evt.paymentStatus === 'paid' && !isEventHiddenFromPublic(evt))
                .filter(evt => {
                  if (!eventAreaFilter) return true;
                  if (evt.areaMode === 'regional') {
                    return evt.areaRegional && evt.areaRegional.toLowerCase().trim() === eventAreaFilter.toLowerCase().trim();
                  }
                  return true;
                })
                .filter(evt =>
                  evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  evt.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  evt.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              .sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                const timeA = new Date(a.deadline).getTime();
                const timeB = new Date(b.deadline).getTime();
                return timeA - timeB;
              });
              
              if (filtered.length === 0) {
                return (
                  <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1', width: '100%', boxSizing: 'border-box' }}>
                    Tidak ada event kompetisi yang cocok dengan pencarian Anda.
                  </div>
                );
              }

              const displayed = filtered.slice(0, visibleEventsCount);
                 return displayed.map(evt => {
                const userReg = currentUser 
                  ? eventParticipants.find(p => p.eventId === evt.id && p.username.toLowerCase() === currentUser.username.toLowerCase())
                  : null;

                const organizerUser = users.find(u => u.username.toLowerCase() === (evt.creator || '').toLowerCase());
                const orgName = organizerUser?.organizerName || evt.organizerName || 'Panitia Portal';
                const orgAvatar = organizerUser?.organizerAvatar || evt.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=262626&textColor=ffffff`;
 
                 return (
                  <div 
                    key={evt.id} 
                    className={`glass-panel event-portal-card ${userReg?.status === 'approved' ? 'registered-card' : ''}`}
                    onClick={() => {
                      if (!currentUser) {
                        if (onLoginClick) onLoginClick('register');
                        return;
                      }
                      const eventSlug = slugify(evt.title) + '-' + evt.id;
                      window.history.pushState(null, '', '/event/' + eventSlug);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    style={{ 
                      borderRadius: '12px', 
                      padding: '18px 24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '24px',
                      border: userReg?.status === 'approved' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      background: 'rgba(15, 23, 42, 0.45)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                      flexWrap: 'wrap',
                      width: '100%',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                      e.currentTarget.style.borderColor = userReg?.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Left Section: Title, Desc, and Organizer Info with Tags */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{evt.title}</span>
                        {userReg?.status === 'approved' && (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            background: 'rgba(16, 185, 129, 0.12)', 
                            color: '#10b981', 
                            padding: '2px 8px', 
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✓ Terdaftar
                          </span>
                        )}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', maxWidth: '500px' }}>
                        {evt.description}
                      </p>

                      {/* Organizer info & Tags */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                        {/* Organizer Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={orgAvatar} 
                            alt={orgName} 
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }} 
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=262626&textColor=ffffff`;
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {orgName}
                          </span>
                        </div>

                        {/* Tags Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {(() => {
                            const style = getCategoryBadgeStyle(evt.category);
                            return (
                              <span style={{ 
                                fontSize: '0.65rem', 
                                background: style.bg, 
                                color: style.color, 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                border: style.border
                              }}>
                                {evt.category}
                              </span>
                            );
                          })()}
                          
                          <span style={{ 
                              fontSize: '0.65rem', 
                              background: 'var(--primary-glow)', 
                              color: 'var(--text-primary)', 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              border: '1px solid var(--border-color)'
                            }}>
                            {evt.eventType === 'regular' ? 'Event' : 'Kompetisi'}
                          </span>

                          {evt.areaMode === 'regional' && evt.areaRegional && (
                            <span style={{ 
                                fontSize: '0.65rem', 
                                background: 'rgba(239, 68, 68, 0.08)', 
                                color: '#ef4444', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                              <MapPin size={10} />
                              {evt.areaRegional}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Budget & Ticket & Deadline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginRight: '8px' }}>
                      {evt.campaignBudget > 0 && (
                        <div style={{ minWidth: '130px', textAlign: 'left' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                            {evt.budgetMode === 'ranking' ? 'Prize Pool' : 'Sisa / Total Budget'}
                          </div>
                          {evt.budgetMode === 'ranking' ? (
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              Rp {evt.campaignBudget.toLocaleString('id-ID')}
                            </strong>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                Rp {getEventRemainingBudget(evt).toLocaleString('id-ID')}
                              </strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                / Rp {evt.campaignBudget.toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ minWidth: '110px', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                          {evt.eventType === 'regular' ? 'Harga Tiket' : 'Biaya Tiket'}
                        </div>
                        <strong style={{ color: evt.ticketPrice > 0 ? '#4ade80' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {evt.ticketPrice > 0 ? `Rp ${evt.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}
                        </strong>
                      </div>

                      <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
                          <span>Batas Waktu</span>
                        </div>
                        {evt.deadline ? (
                          <CardCountdown deadline={evt.deadline} />
                        ) : (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '0.72rem', 
                            color: 'var(--text-primary)', 
                            fontWeight: 'bold',
                            background: 'var(--primary-glow)',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            width: 'fit-content'
                          }}>
                            <Clock size={12} style={{ color: 'var(--text-primary)' }} />
                            <span>Tanpa Batas Waktu</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {(() => {
            const filteredCount = events.filter(evt =>
              evt.paymentStatus === 'paid' && 
              !isEventHiddenFromPublic(evt) && (
                evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                evt.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                evt.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
            ).length;

            if (filteredCount > visibleEventsCount) {
              return (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                  <button 
                    onClick={() => setVisibleEventsCount(prev => prev + 12)}
                    title="Muat Lebih Banyak"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              );
            }
            return null;
          })()}
            </>
          )}
        </React.Fragment>
      )}{/* Registration Full Page Overlay */}
      {registeringEvent && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#020202',
          zIndex: 99999,
          overflowY: 'auto',
          padding: '40px 24px',
          boxSizing: 'border-box'
        }} className="animate-fade-in">
          <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '32px', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  <ShieldCheck size={26} style={{ color: '#ffffff' }} />
                  <span>{registeringEvent.eventType === 'regular' ? 'Formulir Pembelian Tiket / Pendaftaran' : 'Verifikasi Akun Sosmed'}</span>
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {registeringEvent.eventType === 'regular' ? 'Pendaftaran Acara: ' : 'Pendaftaran Kompetisi: '}
                  <strong style={{ color: 'white' }}>{registeringEvent.title}</strong>
                </p>
              </div>
              <button 
                onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}
              >
                <XCircle size={24} />
              </button>
            </div>

            {verificationStep === 'input' && (
              <div>
                {registeringEvent.eventType === 'regular' ? (
                  showTicketConfirm ? (
                    /* TICKET CONFIRMATION STEP */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '12px' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>Konfirmasi Pembelian Tiket</h4>
                        
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Mohon periksa kembali data Anda sebelum melanjutkan pendaftaran. Transaksi ini akan memotong saldo dompet Anda secara langsung.
                        </p>

                        {(() => {
                          const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
                          return (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '8px 0', width: '140px' }}>Nama Pengunjung:</td>
                                  <td style={{ padding: '8px 0', color: 'white', fontWeight: '600' }}>{userProfile.organizerName || userProfile.username}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '8px 0' }}>No. WhatsApp:</td>
                                  <td style={{ padding: '8px 0', color: 'white', fontWeight: '600' }}>{userProfile.organizerPhone}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '8px 0' }}>Email:</td>
                                  <td style={{ padding: '8px 0', color: 'white', fontWeight: '600' }}>{userProfile.email || `${userProfile.username}@gmail.com`}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '8px 0', color: '#fbbf24', fontWeight: 'bold' }}>Harga Tiket:</td>
                                  <td style={{ padding: '8px 0', color: '#4ade80', fontWeight: 'bold', fontSize: '1rem' }}>
                                    {registeringEvent.ticketPrice > 0 ? `Rp ${registeringEvent.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ padding: '10px 20px' }} 
                          onClick={() => setShowTicketConfirm(false)}
                        >
                          Batal / Ubah Data
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          style={{ padding: '10px 24px', fontWeight: 'bold', background: 'white', color: 'black', border: '1px solid white' }} 
                          onClick={handleRegularRegister}
                        >
                          Ya, Konfirmasi & Bayar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* REGULAR EVENT TICKET REGISTRATION FORM */
                    <form onSubmit={(e) => { e.preventDefault(); setShowTicketConfirm(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(() => {
                        const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
                        const hasIncompleteProfile = !userProfile.organizerName || !userProfile.organizerPhone;
                        return (
                          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', marginBottom: '8px' }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              Data pengunjung diambil langsung dari profil Anda untuk memastikan kevalidan data tiket:
                            </p>
                            
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nama Lengkap Pengunjung</label>
                              <input
                                type="text"
                                disabled
                                value={userProfile.organizerName || userProfile.username}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'not-allowed' }}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No. WhatsApp</label>
                              <input
                                type="text"
                                disabled
                                value={userProfile.organizerPhone || '-'}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'not-allowed' }}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: '14px' }}>
                              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email</label>
                              <input
                                type="text"
                                disabled
                                value={userProfile.email || `${userProfile.username}@gmail.com`}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'not-allowed' }}
                              />
                            </div>

                            {hasIncompleteProfile ? (
                              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', fontSize: '0.8rem', color: '#dc2626' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>⚠️ Data Profil Belum Lengkap!</p>
                                <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                  Nama Lengkap dan No. WhatsApp wajib diisi di profil Anda untuk dapat membeli tiket / mendaftar.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRegisteringEvent(null);
                                    if (onEditProfileClick) onEditProfileClick();
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold' }}
                                >
                                  Lengkapi Profil Sekarang
                                </button>
                              </div>
                            ) : (
                              <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', fontSize: '0.75rem', color: '#16a34a', lineHeight: '1.4' }}>
                                ✓ Data profil Anda valid. E-Tiket Anda akan diterbitkan secara otomatis setelah pendaftaran dikonfirmasi.
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ticket price and payment */}
                      {registeringEvent.ticketPrice > 0 && (() => {
                        const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
                        const activeBal = userProfile ? (userProfile.walletBalance || 0) : (currentUser.walletBalance || 0);
                        const isInsufficient = activeBal < registeringEvent.ticketPrice;
                        return (
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '16px',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Harga Tiket Masuk:</span>
                              <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>Rp {registeringEvent.ticketPrice.toLocaleString('id-ID')}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saldo Dompet Anda:</span>
                              <strong style={{ color: 'white', fontSize: '1.05rem' }}>Rp {activeBal.toLocaleString('id-ID')}</strong>
                            </div>
                            
                            {isInsufficient ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#f87171', lineHeight: '1.4' }}>
                                  * Saldo Anda kurang sebesar <strong>Rp {(registeringEvent.ticketPrice - activeBal).toLocaleString('id-ID')}</strong>.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const deficit = registeringEvent.ticketPrice - activeBal;
                                    setUsers(prevUsers => prevUsers.map(u => {
                                      if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                                        return { ...u, walletBalance: (u.walletBalance || 0) + deficit };
                                      }
                                      return u;
                                    }));
                                    alert(`Top Up Sukses! Dana sebesar Rp ${deficit.toLocaleString('id-ID')} ditambahkan ke dompet Anda.`);
                                  }}
                                  className="btn"
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'inline-flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <Wallet size={14} />
                                  <span>Top Up Instan & Beli Tiket</span>
                                </button>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                ✓ Saldo Anda mencukupi. Saldo akan otomatis dipotong untuk pembelian tiket.
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                        {(() => {
                          const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
                          const hasIncompleteProfile = !userProfile.organizerName || !userProfile.organizerPhone;
                          return (
                            <button 
                              type="submit" 
                              disabled={hasIncompleteProfile} 
                              className="btn btn-primary" 
                              style={{ padding: '10px 20px', fontWeight: 'bold', opacity: hasIncompleteProfile ? 0.5 : 1, cursor: hasIncompleteProfile ? 'not-allowed' : 'pointer' }}
                            >
                              {registeringEvent.ticketPrice > 0 ? 'Beli Tiket & Daftar' : 'Konfirmasi Pendaftaran'}
                            </button>
                          );
                        })()}
                      </div>
                    </form>
                  )
                ) : (
                  (() => {
                    const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
                    
                    const isGoogleReview = registeringEvent?.juknisPlatforms?.GoogleReview === true;
                    if (isGoogleReview) {
                      const activeBal = userProfile.walletBalance || 0;
                      const isInsufficient = activeBal < registeringEvent.ticketPrice;
                      const hasIncompleteProfile = !userProfile.organizerName || !userProfile.organizerPhone;
                      const isDisabled = hasIncompleteProfile || isInsufficient;
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <p style={{ margin: '0 0 10px 0', color: 'white', fontWeight: 'bold' }}>Pendaftaran Event Google Review</p>
                            Pendaftaran untuk event ini tidak memerlukan verifikasi akun sosial media. Setelah mendaftar, Anda dapat langsung membuat ulasan di Google Maps dan mengirimkan bukti ulasan berupa teks serta tangkapan layar (screenshot) pada menu pengiriman karya.
                          </div>
                          
                          {/* ticket price and payment if any */}
                          {registeringEvent.ticketPrice > 0 && (
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '16px',
                              borderRadius: '8px',
                              marginTop: '8px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Biaya Pendaftaran / Tiket:</span>
                                <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>Rp {registeringEvent.ticketPrice.toLocaleString('id-ID')}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saldo Dompet Anda:</span>
                                <strong style={{ color: 'white', fontSize: '1.05rem' }}>Rp {activeBal.toLocaleString('id-ID')}</strong>
                              </div>
                              
                              {isInsufficient ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#f87171', lineHeight: '1.4' }}>
                                    * Saldo Anda kurang sebesar <strong>Rp {(registeringEvent.ticketPrice - activeBal).toLocaleString('id-ID')}</strong>.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const deficit = registeringEvent.ticketPrice - activeBal;
                                      setUsers(prevUsers => prevUsers.map(u => {
                                        if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                                          return { ...u, walletBalance: (u.walletBalance || 0) + deficit };
                                        }
                                        return u;
                                      }));
                                      alert(`Top Up Sukses! Dana sebesar Rp ${deficit.toLocaleString('id-ID')} ditambahkan ke dompet Anda.`);
                                    }}
                                    className="btn"
                                    style={{
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 16px',
                                      borderRadius: '20px',
                                      fontWeight: 'bold',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      display: 'inline-flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <Wallet size={14} />
                                    <span>Top Up Instan & Bayar</span>
                                  </button>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                                  ✓ Saldo Anda mencukupi. Biaya pendaftaran akan langsung dipotong setelah konfirmasi pendaftaran.
                                </div>
                              )}
                            </div>
                          )}

                          {hasIncompleteProfile && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', fontSize: '0.8rem', color: '#dc2626' }}>
                              <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>⚠️ Data Profil Belum Lengkap!</p>
                              Nama Lengkap dan No. WhatsApp wajib diisi di profil Anda untuk dapat berpartisipasi.
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                            <button 
                              type="button" 
                              disabled={isDisabled}
                              onClick={() => {
                                const ticketPrice = registeringEvent.ticketPrice || 0;
                                if (ticketPrice > 0) {
                                  setUsers(prevUsers => prevUsers.map(u => {
                                    if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                                      return { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) - ticketPrice) };
                                    }
                                    if (u.username.toLowerCase() === (registeringEvent.creator || '').toLowerCase()) {
                                      return { ...u, walletBalance: (u.walletBalance || 0) + ticketPrice };
                                    }
                                    return u;
                                  }));
                                }

                                const tktCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
                                setGeneratedTicketCode(tktCode);

                                const newPart = {
                                  id: `part_${Date.now()}`,
                                  eventId: registeringEvent.id,
                                  eventTitle: registeringEvent.title,
                                  name: userProfile.organizerName || currentUser.username,
                                  username: currentUser.username,
                                  email: userProfile.email || `${currentUser.username}@ngonten.id`,
                                  contact: '-',
                                  socialPlatform: 'GoogleReview',
                                  socialLink: '',
                                  status: 'approved',
                                  verifiedAt: new Date().toISOString(),
                                  registeredAt: new Date().toISOString(),
                                  ticketCode: tktCode,
                                  isCheckedIn: false,
                                  checkedInAt: null,
                                  ticketPrice: ticketPrice,
                                  isPaid: ticketPrice > 0
                                };

                                setEventParticipants([...eventParticipants, newPart]);
                                setVerificationStep('success');
                              }}
                              className="btn btn-primary" 
                              style={{ padding: '10px 20px', fontWeight: 'bold', opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            >
                              {registeringEvent.ticketPrice > 0 ? 'Beli Tiket & Daftar Instan' : 'Daftar Sekarang'}
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
                    const verifiedAccounts = [];
                    if (userProfile.instagramVerified && userProfile.instagramHandle) {
                      verifiedAccounts.push({ id: 'instagram', label: 'Instagram', handle: userProfile.instagramHandle });
                    }
                    if (userProfile.tiktokVerified && userProfile.tiktokHandle) {
                      verifiedAccounts.push({ id: 'tiktok', label: 'TikTok', handle: userProfile.tiktokHandle });
                    }
                    if (userProfile.youtubeVerified && userProfile.youtubeHandle) {
                      verifiedAccounts.push({ id: 'youtube', label: 'YouTube', handle: userProfile.youtubeHandle });
                    }
                    if (userProfile.facebookVerified && userProfile.facebookHandle) {
                      verifiedAccounts.push({ id: 'facebook', label: 'Facebook', handle: userProfile.facebookHandle });
                    }

                    const requiredPlatforms = [];
                    if (registeringEvent?.juknisPlatforms?.TikTok) requiredPlatforms.push({ id: 'tiktok', label: 'TikTok' });
                    if (registeringEvent?.juknisPlatforms?.Instagram) requiredPlatforms.push({ id: 'instagram', label: 'Instagram' });
                    if (registeringEvent?.juknisPlatforms?.YouTube) requiredPlatforms.push({ id: 'youtube', label: 'YouTube Shorts' });
                    if (registeringEvent?.juknisPlatforms?.Facebook) requiredPlatforms.push({ id: 'facebook', label: 'Facebook' });

                    const missingPlatforms = requiredPlatforms.filter(req => {
                      if (req.id === 'tiktok') return !(userProfile.tiktokVerified && userProfile.tiktokHandle);
                      if (req.id === 'instagram') return !(userProfile.instagramVerified && userProfile.instagramHandle);
                      if (req.id === 'youtube') return !(userProfile.youtubeVerified && userProfile.youtubeHandle);
                      if (req.id === 'facebook') return !(userProfile.facebookVerified && userProfile.facebookHandle);
                      return false;
                    });

                    if (missingPlatforms.length > 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
                          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.92rem' }}>⚠️ Koneksi Sosial Media Belum Lengkap!</strong>
                            Event ini mewajibkan Anda untuk mengunggah konten pada platform: <strong>{requiredPlatforms.map(p => p.label).join(', ')}</strong>.
                            <br /><br />
                            Namun, Anda belum menghubungkan atau memverifikasi akun berikut di profil Anda:
                            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                              {missingPlatforms.map(p => (
                                <li key={p.id} style={{ fontWeight: 'bold' }}>{p.label}</li>
                              ))}
                            </ul>
                            <br />
                            Silakan hubungkan dan verifikasi akun sosial media yang diperlukan terlebih dahulu untuk dapat berpartisipasi dalam event ini.
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ padding: '10px 20px', fontWeight: 'bold' }}
                              onClick={() => {
                                setRegisteringEvent(null);
                                resetVerificationForm();
                                if (onEditProfileClick) onEditProfileClick();
                              }}
                            >
                              Hubungkan & Verifikasi Sekarang di Profil
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (verifiedAccounts.length === 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
                          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>⚠️ Akun Sosial Media Belum Terverifikasi!</strong>
                            Anda belum memverifikasi akun sosial media di profil Anda. Untuk dapat berpartisipasi dalam event kompetisi ini, Anda wajib memverifikasi minimal satu akun sosial media Anda terlebih dahulu.
                          </div>
                          
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ padding: '10px 20px', fontWeight: 'bold' }}
                              onClick={() => {
                                setRegisteringEvent(null);
                                resetVerificationForm();
                                if (onEditProfileClick) onEditProfileClick();
                              }}
                            >
                              Verifikasi Sekarang di Profil
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Pre-select first verified account if current selected is not verified
                    const currentExists = verifiedAccounts.some(a => a.id === selectedPlatform);
                    if (!currentExists && verifiedAccounts.length > 0) {
                      // We must do this asynchronously or inside a render-safe check
                      // to avoid setting state during render.
                      setTimeout(() => {
                        setSelectedPlatform(verifiedAccounts[0].id);
                        setSocialUrl(verifiedAccounts[0].handle);
                      }, 0);
                    } else if (currentExists && socialUrl !== (verifiedAccounts.find(a => a.id === selectedPlatform)?.handle || '')) {
                      setTimeout(() => {
                        setSocialUrl(verifiedAccounts.find(a => a.id === selectedPlatform)?.handle || '');
                      }, 0);
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '700' }}>
                          Pilih Akun Sosial Media Terverifikasi Anda:
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {verifiedAccounts.map(acc => {
                            const isSelected = selectedPlatform === acc.id;
                            return (
                              <button
                                type="button"
                                key={acc.id}
                                onClick={() => {
                                  setSelectedPlatform(acc.id);
                                  setSocialUrl(acc.handle);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '14px 18px',
                                  borderRadius: '12px',
                                  background: isSelected ? 'var(--primary-glow)' : 'var(--bg-card)',
                                  border: isSelected ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                                  boxShadow: isSelected ? '0 4px 14px rgba(0, 0, 0, 0.08)' : 'none',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  outline: 'none',
                                  textAlign: 'left',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {/* Custom Radio Button Indicator */}
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: isSelected ? '2px solid var(--text-primary)' : '2px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0,
                                    background: isSelected ? 'var(--text-primary)' : 'transparent'
                                  }}>
                                    {isSelected && (
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'var(--bg-card)'
                                      }} />
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem' }}>
                                      {acc.label}
                                    </span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                      @{acc.handle}
                                    </span>
                                  </div>
                                </div>

                                {isSelected ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: 'var(--text-primary)',
                                    color: 'var(--bg-card)',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.3px'
                                  }}>
                                    <CheckCircle2 size={13} />
                                    <span>Terpilih</span>
                                  </span>
                                ) : (
                                  <span style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: '500'
                                  }}>
                                    Klik untuk pilih
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* ticket price and payment */}
                        {registeringEvent.ticketPrice > 0 && (() => {
                          const activeBal = userProfile.walletBalance || 0;
                          const isInsufficient = activeBal < registeringEvent.ticketPrice;
                          return (
                            <div style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              padding: '16px',
                              borderRadius: '12px',
                              marginTop: '8px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Biaya Pendaftaran / Tiket:</span>
                                <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>Rp {registeringEvent.ticketPrice.toLocaleString('id-ID')}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saldo Dompet Anda:</span>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>Rp {activeBal.toLocaleString('id-ID')}</strong>
                              </div>
                              
                              {isInsufficient ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#f87171', lineHeight: '1.4' }}>
                                    * Saldo Anda kurang sebesar <strong>Rp {(registeringEvent.ticketPrice - activeBal).toLocaleString('id-ID')}</strong>.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const deficit = registeringEvent.ticketPrice - activeBal;
                                      setUsers(prevUsers => prevUsers.map(u => {
                                        if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                                          return { ...u, walletBalance: (u.walletBalance || 0) + deficit };
                                        }
                                        return u;
                                      }));
                                      alert(`Top Up Sukses! Dana sebesar Rp ${deficit.toLocaleString('id-ID')} ditambahkan ke dompet Anda.`);
                                    }}
                                    className="btn"
                                    style={{
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 16px',
                                      borderRadius: '20px',
                                      fontWeight: 'bold',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      display: 'inline-flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <Wallet size={14} />
                                    <span>Top Up Instan & Bayar</span>
                                  </button>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                                  ✓ Saldo Anda mencukupi. Biaya pendaftaran akan langsung dipotong setelah konfirmasi pendaftaran.
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                          {(() => {
                            const activeBal = userProfile.walletBalance || 0;
                            const hasIncompleteProfile = !userProfile.organizerName || !userProfile.organizerPhone;
                            const isInsufficient = registeringEvent.ticketPrice > 0 && activeBal < registeringEvent.ticketPrice;
                            const isDisabled = hasIncompleteProfile || isInsufficient;
                            
                            return (
                              <button 
                                type="button" 
                                disabled={isDisabled}
                                onClick={() => {
                                  // Instant registration
                                  const ticketPrice = registeringEvent.ticketPrice || 0;
                                  if (ticketPrice > 0) {
                                    setUsers(prevUsers => prevUsers.map(u => {
                                      if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
                                        return { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) - ticketPrice) };
                                      }
                                      if (u.username.toLowerCase() === (registeringEvent.creator || '').toLowerCase()) {
                                        return { ...u, walletBalance: (u.walletBalance || 0) + ticketPrice };
                                      }
                                      return u;
                                    }));
                                  }

                                  const tktCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
                                  setGeneratedTicketCode(tktCode);

                                  const targetPlatform = selectedPlatform || verifiedAccounts[0].id;
                                  const targetHandle = verifiedAccounts.find(a => a.id === targetPlatform)?.handle || verifiedAccounts[0].handle;
                                  const generatedLink = targetPlatform === 'youtube' ? `https://youtube.com/@${targetHandle}` : `https://${targetPlatform}.com/${targetHandle}`;

                                  const newPart = {
                                    id: `part_${Date.now()}`,
                                    eventId: registeringEvent.id,
                                    eventTitle: registeringEvent.title,
                                    name: userProfile.organizerName || currentUser.username,
                                    username: currentUser.username,
                                    email: userProfile.email || `${currentUser.username}@ngonten.id`,
                                    contact: `@${targetHandle}`,
                                    socialPlatform: targetPlatform,
                                    socialLink: generatedLink,
                                    status: 'approved',
                                    verifiedAt: new Date().toISOString(),
                                    registeredAt: new Date().toISOString(),
                                    ticketCode: tktCode,
                                    isCheckedIn: false,
                                    checkedInAt: null,
                                    ticketPrice: ticketPrice,
                                    isPaid: ticketPrice > 0
                                  };

                                  setEventParticipants([...eventParticipants, newPart]);
                                  setVerificationStep('success');

                                  sendEmailNotification({
                                    toEmail: currentUser?.email,
                                    toUsername: currentUser?.username,
                                    toName: currentUser?.name || currentUser?.username,
                                    subject: `[ngonten.id] Tiket & Pendaftaran Berhasil: ${registeringEvent.title}`,
                                    title: 'Pendaftaran Event Berhasil! 🎫',
                                    message: `Selamat, pendaftaran Anda di event <strong>"${registeringEvent.title}"</strong> telah berhasil dikonfirmasi. Silakan selesaikan tugas sebelum batas waktu event berakhir dan gunakan tiket resmi Anda pada saat hadir di acara.`,
                                    type: 'review',
                                    eventTitle: registeringEvent.title,
                                    actionUrl: `https://ngonten.id/event/${registeringEvent.slug || registeringEvent.id}`,
                                    actionLabel: 'Kirim Karya / Lihat Tugas',
                                    secondaryActionUrl: `https://ngonten.id/event/${registeringEvent.slug || registeringEvent.id}`,
                                    secondaryActionLabel: 'Buka E-Tiket',
                                    metadata: {
                                      'Nama Event': registeringEvent.title,
                                      'Reward Ulasan': registeringEvent.benefitAmount ? `Rp ${registeringEvent.benefitAmount.toLocaleString('id-ID')}` : 'Gratis',
                                      'Status': 'TERDAFTAR & AKTIF'
                                    },
                                    usersList: users
                                  });
                                }}
                                className="btn btn-primary" 
                                style={{ padding: '10px 20px', fontWeight: 'bold', opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                              >
                                {registeringEvent.ticketPrice > 0 ? 'Beli Tiket & Daftar Instan' : 'Daftar Instan Sekarang'}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {verificationStep === 'verify' && (
              <div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kode Verifikasi Unik:</span>
                    <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 'bold' }}>Sisa Waktu: {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1, background: '#0f172a', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', fontSize: '1.2rem', fontWeight: 'bold', color: 'white', letterSpacing: '2px', textAlign: 'center' }}>
                      {uniqueCode}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(uniqueCode);
                        alert('Kode berhasil disalin ke clipboard!');
                      }}
                      className="btn btn-secondary"
                      style={{ height: '50px', padding: '0 16px' }}
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                    <span>Salin kode verifikasi unik di atas.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                    <span>Buka profil {selectedPlatform.toUpperCase()} Anda (<strong>@{socialUrl.trim()}</strong>), tempelkan kode tersebut ke dalam <strong>Bio</strong> atau deskripsi profil Anda.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                    <span>Setelah bio diperbarui, klik tombol <strong>"Verifikasi Akun Saya"</strong> di bawah untuk memindai akun secara real-time.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '12px 20px' }} onClick={() => setVerificationStep('input')}>Kembali</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 'bold' }} onClick={() => handleCheckAccount()}>Verifikasi Akun Saya</button>
                </div>
              </div>
            )}

            {verificationStep === 'expired' && (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#ffffff' }}>
                  <Clock size={32} />
                </div>
                <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>Waktu Verifikasi Habis</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                  Batas waktu 3 menit untuk menempelkan kode ke bio telah berakhir. Silakan coba kembali untuk membuat kode baru.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setVerificationStep('input');
                    setUniqueCode('');
                  }}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Buat Kode Baru
                </button>
              </div>
            )}

            {verificationStep === 'pending' && (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#ffffff' }}>
                  <Clock size={32} />
                </div>
                <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>Pendaftaran Terkirim (Pending)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  Akun <strong>@{socialUrl.trim()}</strong> berhasil didaftarkan. Namun, karena delay mesin pencari untuk menyinkronkan bio {selectedPlatform.toUpperCase()} Anda secara instan, pendaftaran disetujui dengan status "Pending" untuk diverifikasi manual oleh Admin.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '28px', textAlign: 'left', lineHeight: '1.4' }}>
                  💡 <strong>Petunjuk:</strong> Pastikan kode <strong>{uniqueCode}</strong> tetap berada di Bio/deskripsi akun Anda sampai disetujui oleh panitia event.
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setRegisteringEvent(null);
                    resetVerificationForm();
                  }}
                  style={{ width: '100%', fontWeight: 'bold', padding: '12px' }}
                >
                  Selesai
                </button>
              </div>
            )}

            {verificationStep === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', textAlign: 'center' }}>
                <Loader2 className="spinner" size={48} style={{ color: '#ffffff', marginBottom: '24px', animation: 'spin 1s linear infinite' }} />
                <h4 style={{ color: 'white', marginBottom: '8px', fontSize: '1.1rem', fontWeight: '600' }}>Memindai Bio Profil {selectedPlatform.toUpperCase()}...</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto', lineHeight: '1.5' }}>
                  Sedang menghubungi server {selectedPlatform.toUpperCase()} untuk memeriksa apakah kode <strong>{uniqueCode}</strong> tertera di bio akun <strong>@{socialUrl.trim()}</strong> Anda...
                </p>
              </div>
            )}

            {verificationStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#ffffff' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {registeringEvent.eventType === 'regular' ? 'Pembelian Tiket Sukses!' : 'Pendaftaran & Pembayaran Sukses!'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  {registeringEvent.eventType === 'regular' ? (
                    (() => {
                      const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) || currentUser;
                      return <>Pendaftaran atas nama <strong>{userProfile.organizerName || userProfile.username}</strong> berhasil disetujui. E-Tiket Anda telah aktif.</>;
                    })()
                  ) : registeringEvent.juknisPlatforms?.GoogleReview ? (
                    <>Pendaftaran Anda berhasil disetujui. Silakan langsung membuat ulasan di Google Maps dan mengirimkan bukti ulasan pada menu kirim karya.</>
                  ) : (
                    <>Sistem mendeteksi akun <strong>@{socialUrl.trim()}</strong> Anda valid. Pendaftaran kompetisi disetujui secara otomatis.</>
                  )}
                </p>
                
                {/* E-Tiket Success Box */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  marginBottom: '24px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px' }}>E-Tiket Resmi</span>
                    <span style={{ fontSize: '0.68rem', color: '#ffffff', fontWeight: 'bold', letterSpacing: '1px' }}>NGONTEN.ID TICKET</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.05rem', fontWeight: 'bold' }}>{registeringEvent.title}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Peserta: <strong>{currentUser.username}</strong></span>
                    <span>Kode Tiket: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{generatedTicketCode}</strong></span>
                  </div>
                  {registeringEvent.ticketPrice > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '10px', fontWeight: '600' }}>
                      ✓ Pembayaran Lunas (Rp {registeringEvent.ticketPrice.toLocaleString('id-ID')})
                    </div>
                  )}
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setRegisteringEvent(null);
                    resetVerificationForm();
                  }}
                  style={{ width: '100%', fontWeight: 'bold', padding: '12px' }}
                >
                  {registeringEvent.eventType === 'regular' ? 'Selesai' : 'Mulai Kompetisi'}
                </button>
              </div>
            )}

            {verificationStep === 'failed' && (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', border: '2px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#ffffff' }}>
                  <XCircle size={32} />
                </div>
                <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>Akun Tidak Ditemukan</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                  {verificationError}
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setVerificationStep('input');
                    }}
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Coba Lagi
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setRegisteringEvent(null);
                      resetVerificationForm();
                    }}
                    style={{ flex: 1, fontWeight: 'bold', padding: '12px' }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Enlarged Ticket Modal for Scanning */}
      {enlargedTicketReg && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }} onClick={() => setEnlargedTicketReg(null)}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #111827',
            borderRadius: '24px',
            padding: '36px 28px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            position: 'relative',
            cursor: 'default',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setEnlargedTicketReg(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#ffffff',
                border: '2px solid #111827',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#111827',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                zIndex: 4
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#111827';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#111827';
              }}
            >
              <X size={16} />
            </button>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#111827', 
              border: '2px solid #111827', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              marginBottom: '14px' 
            }}>
              <span style={{
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                display: 'block'
              }}>
                SCAN TIKET MASUK
              </span>
            </div>

            <h3 className="badge" style={{ 
              margin: '0 0 16px 0', 
              color: '#111827', 
              fontSize: '1.05rem', 
              fontWeight: '800', 
              lineHeight: '1.4', 
              padding: '0 10px',
              background: 'transparent',
              border: 'none',
              display: 'block'
            }}>
              {(() => {
                const foundEvent = events.find(e => e.id === enlargedTicketReg.eventId);
                return foundEvent ? foundEvent.title : enlargedTicketReg.eventTitle;
              })()}
            </h3>

            {/* High Contrast QR Code Container for Easy Scanning */}
            <div style={{
              background: '#ffffff',
              padding: '12px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
              border: '2px solid #111827',
              width: '210px',
              height: '210px',
              boxSizing: 'border-box'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(enlargedTicketReg.ticketCode || `TKT-${enlargedTicketReg.id.substring(enlargedTicketReg.id.length - 6).toUpperCase()}`)}`}
                alt="QR Code Tiket"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Dotted dividing line with aligned notches */}
            <div style={{
              position: 'relative',
              borderTop: '2px dashed #111827',
              margin: '24px -28px 20px -28px',
              height: '0px'
            }}>
              {/* Left Ticket Cutout Notch */}
              <div style={{
                position: 'absolute',
                left: '-12px',
                top: '-12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.92)',
                borderRight: '2px solid #111827',
                zIndex: 3
              }} />
              {/* Right Ticket Cutout Notch */}
              <div style={{
                position: 'absolute',
                right: '-12px',
                top: '-12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.92)',
                borderLeft: '2px solid #111827',
                zIndex: 3
              }} />
            </div>

            {/* Ticket Details */}
            <div>
              <div className="badge" style={{ 
                fontSize: '1.15rem', 
                color: '#111827', 
                fontWeight: '800', 
                fontFamily: 'monospace', 
                letterSpacing: '2px', 
                marginBottom: '12px',
                background: 'transparent',
                border: 'none',
                display: 'block'
              }}>
                {enlargedTicketReg.ticketCode || `TKT-${enlargedTicketReg.id.substring(enlargedTicketReg.id.length - 6).toUpperCase()}`}
              </div>
              
              <div style={{ 
                fontSize: '0.74rem', 
                color: '#111827', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                textAlign: 'left', 
                background: '#f8fafc', 
                padding: '10px 14px', 
                borderRadius: '12px', 
                border: '2px solid #111827'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: '600' }}>Nama:</span>
                  <span style={{ color: '#111827', fontWeight: '800' }}>{enlargedTicketReg.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: '600' }}>Email:</span>
                  <span style={{ color: '#111827', fontWeight: '700' }}>{enlargedTicketReg.email}</span>
                </div>
              </div>

              <div className="badge" style={{ 
                marginTop: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem', 
                background: enlargedTicketReg.isCheckedIn ? '#111827' : '#ffffff', 
                color: enlargedTicketReg.isCheckedIn ? '#ffffff' : '#111827', 
                padding: '6px 14px', 
                borderRadius: '30px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                border: '2px solid #111827'
              }}>
                <span>{enlargedTicketReg.isCheckedIn ? 'SUDAH CHECK-IN' : 'BELUM CHECK-IN'}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Submission Full Page Overlay */}
      {submittingEvent && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#020202',
          zIndex: 10200,
          overflowY: 'auto',
          padding: '40px 24px',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }} className="animate-fade-in">
          <div style={{ width: '100%', maxWidth: '640px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Kirim Hasil Karya</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Event Kompetisi: <strong style={{ color: '#ffffff' }}>{submittingEvent.title}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSubmittingEvent(null)} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <XCircle size={22} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWorkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(() => {
                const isGoogleReview = submittingEvent.juknisPlatforms?.GoogleReview === true;
                return (
                  <>
                    {isGoogleReview ? (
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Nama Akun Google Anda</label>
                        <input 
                          type="text" 
                          required 
                          value={googleAccountName} 
                          onChange={(e) => setGoogleAccountName(e.target.value)} 
                          placeholder="Masukkan nama akun Google yang digunakan saat menulis ulasan" 
                          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Judul Karya Film / Konten</label>
                        <input 
                          type="text" 
                          required 
                          value={workTitle} 
                          onChange={(e) => setWorkTitle(e.target.value)} 
                          placeholder="Masukkan judul menarik karya Anda" 
                          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
                        />
                      </div>
                    )}
                    
                    {isGoogleReview ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Platform Publikasi</label>
                          <div style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#60a5fa', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Google Review
                          </div>
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Tautan Google Maps / Bisnis (URL)</label>
                          <input 
                            type="url" 
                            required 
                            value={workVideoUrl} 
                            onChange={(e) => setWorkVideoUrl(e.target.value)} 
                            placeholder="https://maps.google.com/..." 
                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Platform Publikasi</label>
                          <select 
                            value={workPlatform} 
                            onChange={(e) => setWorkPlatform(e.target.value)} 
                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter / X">Twitter / X</option>
                            <option value="Threads">Threads</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Tautan Karya (URL)</label>
                          <input 
                            type="url" 
                            required 
                            value={workVideoUrl} 
                            onChange={(e) => handleUrlChange(e.target.value)} 
                            placeholder="Contoh: https://www.youtube.com/watch?v=..." 
                            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
                          />
                        </div>
                      </div>
                    )}

                    {isGoogleReview && (
                      <div className="form-group animate-fade-in">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Unggah Bukti Ulasan (Screenshot)</label>
                        <input 
                          type="file" 
                          required 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setGoogleReviewScreenshot(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                          style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }} 
                        />
                        {googleReviewScreenshot && (
                          <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'left' }}>Pratinjau Screenshot:</span>
                            <img src={googleReviewScreenshot} alt="Google Review Screenshot Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>
                        {isGoogleReview ? 'Salinan Teks Ulasan Anda' : 'Deskripsi Singkat Karya'}
                      </label>
                      <textarea 
                        rows="5" 
                        required 
                        value={workDescription} 
                        onChange={(e) => setWorkDescription(e.target.value)} 
                        placeholder={isGoogleReview ? "Tempelkan (paste) teks ulasan lengkap yang Anda tulis di Google Maps..." : "Tuliskan latar belakang singkat, sinopsis, atau pesan penting dari karya Anda..."} 
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                      ></textarea>
                    </div>
                  </>
                );
              })()}

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSubmittingEvent(null)}
                  style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  Kirim Karya Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Role Warning Modal Overlay */}
      {showRoleWarning && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 7, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} className="animate-fade-in">
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(18, 18, 18, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            color: 'white',
            textAlign: 'center'
          }}>
            {/* Warning Icon with circular pulse background */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertTriangle size={32} style={{ color: '#ffffff' }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'white' }}>
              Memerlukan Akun Panitia
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
              Saat ini Anda masuk sebagai <strong style={{ color: 'white' }}>{currentUser?.role === 'member' ? 'Member' : 'User'}</strong>. 
              Untuk dapat membuat & mengelola event baru, Anda harus terdaftar menggunakan akun dengan peran <strong style={{ color: 'white', textDecoration: 'underline' }}>Panitia</strong>.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={async () => {
                  setShowRoleWarning(false);
                  if (onLogout) {
                    await onLogout();
                  }
                  onLoginClick('register', 'panitia', true);
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'white',
                  border: '1px solid white',
                  color: 'black',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                Log Out & Daftar sebagai Panitia
              </button>
              
              <button
                onClick={() => setShowRoleWarning(false)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                Batal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}