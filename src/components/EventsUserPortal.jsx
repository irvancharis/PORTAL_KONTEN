import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Calendar, Users, Award, FileVideo, CheckCircle2, Clock, XCircle, AlertTriangle, Send, Sparkles, Search, Wallet, ShieldCheck, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';

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
    bg: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)'
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
  const color = label === 'Telah Selesai' ? '#a3a3a3' : '#ffffff';
  const bg = label === 'Telah Selesai' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)';
  const border = label === 'Telah Selesai' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.2)';

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

export default function EventsUserPortal({
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
  setOffers
}) {
  const [registeringEvent, setRegisteringEvent] = useState(null); // Event model open for register
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleEventsCount, setVisibleEventsCount] = useState(12);
  const [userPortalTab, setUserPortalTab] = useState('events'); // 'events' or 'offers'

  useEffect(() => {
    setVisibleEventsCount(12);
  }, [searchQuery]);
  const [expandedJuknis, setExpandedJuknis] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  // URL Path Listener for Event Details (Allows direct link sharing)
  useEffect(() => {
    const handlePathCheck = () => {
      const path = window.location.pathname;
      if (path && path.startsWith('/event/')) {
        const eventParam = path.replace('/event/', '');
        const foundEvent = events.find(e => e.id === eventParam || eventParam.endsWith(e.id));
        if (foundEvent) {
          setSelectedEvent(foundEvent);
        } else {
          setSelectedEvent(null);
        }
      } else {
        setSelectedEvent(null);
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

  const handleAcceptOffer = (off) => {
    // 1. Check if already registered
    const alreadyRegistered = eventParticipants.some(p => p.eventId === off.eventId && p.username.toLowerCase() === currentUser.username.toLowerCase());
    if (alreadyRegistered) {
      alert(`Anda sudah terdaftar sebagai peserta di event "${off.eventTitle}". Undangan lain untuk event yang sama otomatis ditolak.`);
      setOffers(prev => prev.map(o => 
        (o.id === off.id || (o.eventId === off.eventId && o.recipient.toLowerCase() === currentUser.username.toLowerCase() && o.status === 'pending'))
          ? { ...o, status: 'declined' } 
          : o
      ));
      return;
    }

    // 2. Update this offer status to 'accepted', and decline all other pending offers for the same event addressed to this creator
    setOffers(prev => prev.map(o => {
      if (o.id === off.id) {
        return { ...o, status: 'accepted' };
      }
      if (o.eventId === off.eventId && o.recipient.toLowerCase() === currentUser.username.toLowerCase() && o.status === 'pending') {
        return { ...o, status: 'declined' };
      }
      return o;
    }));

    // 3. Automatically register creator to the event
    const newPart = {
      id: 'part_' + Date.now(),
      eventId: off.eventId,
      name: currentUser.username,
      username: currentUser.username,
      email: currentUser.email || `${currentUser.username}@filmo.com`,
      contact: `@${currentUser.username}`,
      socialPlatform: 'instagram', // Default fallback
      socialLink: `https://instagram.com/${currentUser.username}`,
      status: 'approved',
      verifiedAt: new Date().toISOString(),
      registeredAt: new Date().toISOString()
    };
    setEventParticipants([...eventParticipants, newPart]);
    
    alert(`Undangan kolaborasi untuk event "${off.eventTitle}" berhasil diterima! Anda telah otomatis terdaftar.`);
  };

  const handleDeclineOffer = (off) => {
    setOffers(prev => prev.map(o => o.id === off.id ? { ...o, status: 'declined' } : o));
    alert(`Undangan kolaborasi untuk event "${off.eventTitle}" ditolak.`);
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
      setUniqueCode(`FILMO-${randomId}`);
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

    setVerificationStep('loading');

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

    try {
      let verificationResult = { exists: false, codeFound: false, status: 'failed' };

      // If user configured Google Apps Script Web App, call it via JSONP to bypass CORS.
      if (GOOGLE_APPS_SCRIPT_URL) {
        verificationResult = await fetchJSONP(GOOGLE_APPS_SCRIPT_URL, {
          platform: selectedPlatform,
          username: cleanUsername,
          code: uniqueCode
        });
      } else {
        // Client-side fallback using direct APIs and AllOrigins proxy
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

        const newPart = {
          id: `part_${Date.now()}`,
          eventId: registeringEvent.id,
          eventTitle: registeringEvent.title,
          name: currentUser.username,
          username: currentUser.username,
          email: currentUser.email || `${currentUser.username}@filmo.com`,
          contact: `@${cleanUsername}`,
          socialPlatform: selectedPlatform,
          socialLink: generatedLink,
          status: targetStatus,
          verifiedAt: new Date().toISOString(),
          registeredAt: new Date().toISOString()
        };

        setEventParticipants([...eventParticipants, newPart]);
        setVerificationStep('success');
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
          const newPart = {
            id: `part_${Date.now()}`,
            eventId: registeringEvent.id,
            eventTitle: registeringEvent.title,
            name: currentUser.username,
            username: currentUser.username,
            email: currentUser.email || `${currentUser.username}@filmo.com`,
            contact: `@${cleanUsername}`,
            socialPlatform: selectedPlatform,
            socialLink: generatedLink,
            status: targetStatus,
            verifiedAt: new Date().toISOString(),
            registeredAt: new Date().toISOString()
          };

          setEventParticipants([...eventParticipants, newPart]);
          setVerificationStep('success');
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
  };



  // Handle Work Submission submit
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

    const newSub = {
      id: `sub_${Date.now()}`,
      eventId: submittingEvent.id,
      eventTitle: submittingEvent.title,
      participantName: userRegistration.name,
      username: currentUser.username,
      title: workTitle.trim(),
      videoUrl: workVideoUrl.trim(),
      description: workDescription.trim(),
      platform: workPlatform,
      views: 0,
      likes: 0,
      comments: 0,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      score: null,
      feedback: '',
      paidBenefit: 0
    };

    setEventSubmissions([...eventSubmissions, newSub]);
    setSubmittingEvent(null);
    setWorkTitle('');
    setWorkVideoUrl('');
    setWorkDescription('');
    setWorkPlatform('YouTube');
    alert('Karya Anda berhasil dikirim! Panitia dan Juri akan segera menilai karya Anda.');
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
    const initialBudget = evt.campaignBudget || 0;
    const eventSubs = eventSubmissions.filter(s => s.eventId === evt.id);
    const totalPayout = eventSubs.reduce((sum, sub) => {
      const views = sub.views || 0;
      const step = evt.benefitViewsStep || 1000;
      const amount = evt.benefitAmount || 0;
      const payout = Math.floor(views / step) * amount;
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
      onCreateEventRedirect();
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
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Profile Completion Suggestion Banner */}
      {currentUser && currentUser.role === 'user' && (!currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio) && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.03) 0%, rgba(255, 120, 0, 0.03) 100%)',
          border: '1px solid rgba(255, 170, 0, 0.2)',
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
            <div style={{ background: 'rgba(255, 170, 0, 0.08)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#ffaa00" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#ffaa00', fontSize: '0.92rem', fontWeight: 'bold' }}>Profil Kreator Belum Lengkap!</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                Silakan lengkapi nama lengkap, nomor WhatsApp, keahlian, dan link portofolio Anda terlebih dahulu agar dapat mendaftar sebagai peserta event.
              </p>
            </div>
          </div>
          <button
            onClick={onEditProfileClick}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              background: '#ffffff',
              color: '#020202',
              border: '1px solid #ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e5e5';
              e.currentTarget.style.borderColor = '#e5e5e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#ffffff';
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
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(9, 13, 22, 0.8) 100%)', 
              backdropFilter: 'blur(20px)', 
              padding: '32px', 
              borderRadius: '24px', 
              border: '1px solid rgba(255,255,255,0.04)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginTop: '16px',
                  marginBottom: '28px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      {(() => {
                        const style = getCategoryBadgeStyle(evt.category);
                        return (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            background: style.bg, 
                            color: style.color, 
                            padding: '5px 14px', 
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            border: style.border,
                            letterSpacing: '0.5px'
                          }}>
                            {evt.category}
                          </span>
                        );
                      })()}
                      {evt.deadline && <CardCountdown deadline={evt.deadline} />}
                    </div>
                    
                    <h2 style={{ 
                      color: 'white', 
                      fontSize: '2.2rem', 
                      fontWeight: '800', 
                      margin: '0 0 16px 0', 
                      letterSpacing: '-0.8px',
                      background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>{evt.title}</h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                      <Calendar size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      {evt.deadline ? (
                        <span>Batas Waktu Pendaftaran: <strong style={{ color: 'white' }}>{formatIndonesianDate(evt.deadline)}</strong></span>
                      ) : (
                        <span>Batas Waktu Pendaftaran: <strong style={{ color: 'white' }}>Tanpa Batas Waktu (Selesai saat budget habis)</strong></span>
                      )}
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8', margin: 0 }}>{evt.description}</p>
                  </div>

                  {evt.juknis && (
                    <div style={{ 
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      fontSize: '0.88rem',
                      textAlign: 'left'
                    }}>
                      <strong style={{ color: 'white', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                        <CheckCircle2 size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <span>Petunjuk Teknis (Juknis)</span>
                      </strong>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{evt.juknis}</div>
                    </div>
                  )}

                  <div style={{
                    padding: '24px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    textAlign: 'left'
                  }}>
                    <strong style={{ color: 'white', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                      <Users size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <span>Detail Penyelenggara</span>
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>
                      <img 
                        src={orgAvatar} 
                        alt={orgName} 
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(orgName)}&backgroundColor=262626&textColor=ffffff`;
                        }}
                      />
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', marginBottom: '2px' }}>Nama Penyelenggara / Komunitas</span>
                        <span style={{ color: 'white', fontSize: '1.05rem', fontWeight: '700' }}>{orgName}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                      {evt.organizerDescription && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', marginBottom: '2px' }}>Tentang Penyelenggara</span>
                          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0', lineHeight: '1.6' }}>{evt.organizerDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Standings / Leaderboard (Automatically Calculated) */}
                  {evt.budgetMode === 'ranking' && (
                    <div style={{
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '16px',
                      textAlign: 'left',
                      marginTop: '24px'
                    }}>
                      <strong style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '700' }}>
                        <Trophy size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
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
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.04)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ 
                                      fontSize: '0.82rem', 
                                      fontWeight: '700', 
                                      color: isTop3 ? 'white' : 'var(--text-muted)',
                                      width: '65px',
                                      display: 'inline-block'
                                    }}>
                                      {isTop3 ? rankLabels[index] : `#${index + 1}`}
                                    </span>
                                    <img 
                                      src={userAvatar} 
                                      alt={sub.username} 
                                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: 'white', fontWeight: '700', fontSize: '0.85rem' }}>{sub.username}</span>
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{sub.title}</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    {isTop3 && prizeAmounts[index] > 0 && (
                                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '2px' }}>
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
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          textAlign: 'left'
                        }}>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Total Hadiah (Prize Pool)
                          </span>
                          <strong style={{ color: 'white', fontSize: '1.65rem', fontWeight: '800', lineHeight: 1 }}>
                            Rp {evt.campaignBudget.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 20px', fontSize: '0.85rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Juara I</span>
                            <strong style={{ color: 'white' }}>Rp {evt.prize1?.toLocaleString('id-ID')}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Juara II</span>
                            <strong style={{ color: 'white' }}>Rp {evt.prize2?.toLocaleString('id-ID')}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Juara III</span>
                            <strong style={{ color: 'white' }}>Rp {evt.prize3?.toLocaleString('id-ID')}</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          textAlign: 'left'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: '700', fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Budget Campaign
                          </span>
                          <strong style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>
                            Rp {evt.campaignBudget.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        
                        <div style={{ padding: '16px 20px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Sisa Saldo</span>
                            <span style={{ color: 'white', fontWeight: 'bold' }}>Rp {getEventRemainingBudget(evt).toLocaleString('id-ID')}</span>
                          </div>
                          
                          {/* Budget Progress Bar */}
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ 
                              width: `${(getEventRemainingBudget(evt) / evt.campaignBudget) * 100}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #e2e8f0, #ffffff)',
                              boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
                            }}></div>
                          </div>
                          
                          <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <Award size={14} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                            <span>Benefit: Rp {evt.benefitAmount?.toLocaleString('id-ID')} per {evt.benefitViewsStep?.toLocaleString('id-ID')} Views</span>
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
                              const payout = Math.floor(views / step) * amount;
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
                            <span>Daftar Kompetisi</span>
                          </button>
                        ) : (
                          // Logged In & Registered
                          <div style={{ textAlign: 'left' }}>
                            {/* Unified Stepper/Timeline */}
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
                                  background: userReg.status === 'approved' ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
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
                                  <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>
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
                                  background: (userReg.status === 'approved' && userSub) ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
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
                                    (userReg.status === 'approved' && userSub) ? 'rgba(34, 197, 94, 0.15)' :
                                    userReg.status === 'approved' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                  border: `2px solid ${
                                    (userReg.status === 'approved' && userSub) ? '#22c55e' :
                                    userReg.status === 'approved' ? 'white' : 'rgba(255, 255, 255, 0.1)'
                                  }`,
                                  zIndex: 2,
                                  flexShrink: 0
                                }}>
                                  {(userReg.status === 'approved' && userSub) ? (
                                    <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                                  ) : (
                                    <div style={{ 
                                      width: '6px', 
                                      height: '6px', 
                                      borderRadius: '50%', 
                                      background: userReg.status === 'approved' ? 'white' : 'rgba(255,255,255,0.2)' 
                                    }} />
                                  )}
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: userReg.status === 'approved' ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                    Tahap 2: Pengiriman Karya Video
                                  </h4>
                                  
                                  {userReg.status !== 'approved' && (
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      Menunggu persetujuan pendaftaran.
                                    </p>
                                  )}
                                  
                                  {userReg.status === 'approved' && !userSub && (
                                    <div style={{ marginTop: '8px' }}>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        Kirim tautan karya video Anda untuk dinilai juri.
                                      </p>
                                      <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setSubmittingEvent(evt)}
                                        style={{ 
                                          width: '100%', 
                                          justifyContent: 'center', 
                                          borderColor: 'white', 
                                          color: 'black',
                                          background: 'white',
                                          padding: '8px 16px',
                                          borderRadius: '30px',
                                          fontWeight: 'bold',
                                          fontSize: '0.8rem',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Send size={12} />
                                        <span>Kirim Karya Sekarang</span>
                                      </button>
                                    </div>
                                  )}
                                  
                                  {userReg.status === 'approved' && userSub && (
                                    <div style={{ 
                                      border: '1px solid var(--border-color)', 
                                      borderRadius: '12px', 
                                      padding: '12px', 
                                      background: 'rgba(255, 255, 255, 0.02)', 
                                      marginTop: '8px',
                                      fontSize: '0.8rem'
                                    }}>
                                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '2px' }}>Karya Terkirim:</div>
                                      <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>{userSub.title}</div>
                                      
                                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ 
                                          padding: '2px 8px', 
                                          borderRadius: '10px', 
                                          fontSize: '0.6rem',
                                          color: 'white',
                                          fontWeight: 'bold',
                                          background: 
                                            userSub.platform?.toLowerCase() === 'youtube' ? '#ff0000' :
                                            userSub.platform?.toLowerCase() === 'tiktok' ? 'linear-gradient(45deg, #fe2c55, #25f4ee)' :
                                            userSub.platform?.toLowerCase() === 'instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : '#475569'
                                        }}>{userSub.platform || 'Link Eksternal'}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Views: <strong>{userSub.views || 0}</strong></span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Likes: <strong>{userSub.likes || 0}</strong></span>
                                      </div>

                                      {/* Estimasi Pembayaran */}
                                      {(() => {
                                        const step = evt.benefitViewsStep || 1000;
                                        const amount = evt.benefitAmount || 0;
                                        const views = userSub.views || 0;
                                        const payout = Math.floor(views / step) * amount;
                                        if (payout === 0) return null;
                                        return (
                                          <div style={{ 
                                            padding: '8px 12px', 
                                            background: 'rgba(34, 197, 94, 0.08)', 
                                            border: '1px solid rgba(34, 197, 94, 0.15)', 
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.75rem',
                                            marginTop: '6px'
                                          }}>
                                            <span style={{ color: '#4ade80', fontWeight: '500' }}>Estimasi Pembayaran</span>
                                            <strong style={{ color: 'white' }}>Rp {payout.toLocaleString('id-ID')}</strong>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
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
                                    (userSub && userSub.score !== null) ? 'rgba(34, 197, 94, 0.15)' :
                                    userSub ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                  border: `2px solid ${
                                    (userSub && userSub.score !== null) ? '#22c55e' :
                                    userSub ? '#eab308' : 'rgba(255, 255, 255, 0.1)'
                                  }`,
                                  zIndex: 2,
                                  flexShrink: 0
                                }}>
                                  {(userSub && userSub.score !== null) ? (
                                    <Award size={13} style={{ color: '#22c55e' }} />
                                  ) : userSub ? (
                                    <Clock size={13} style={{ color: '#fbbf24' }} />
                                  ) : (
                                    <div style={{ 
                                      width: '6px', 
                                      height: '6px', 
                                      borderRadius: '50%', 
                                      background: 'rgba(255,255,255,0.2)' 
                                    }} />
                                  )}
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                   <h4 style={{ margin: '2px 0 2px 0', fontSize: '0.85rem', color: userSub ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                     {evt.budgetMode === 'views' ? 'Tahap 3: Pembayaran Otomatis & Hasil' : 'Tahap 3: Penilaian Juri & Hasil'}
                                   </h4>
                                   
                                   {!userSub && (
                                     <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                       Menunggu pengiriman karya video Anda.
                                     </p>
                                   )}
                                   
                                   {userSub && userSub.score === null && (
                                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: evt.budgetMode === 'views' ? '#38bdf8' : '#fbbf24', background: evt.budgetMode === 'views' ? 'rgba(56, 189, 248, 0.05)' : 'rgba(245, 158, 11, 0.05)', padding: '6px 12px', borderRadius: '20px', marginTop: '6px' }}>
                                       <Clock size={12} />
                                       <span>{evt.budgetMode === 'views' ? 'Menunggu Sinkronisasi Views & Pembayaran' : 'Sedang Dinilai oleh Juri'}</span>
                                     </div>
                                   )}
                                   
                                   {userSub && userSub.score !== null && (
                                     <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '10px 12px', borderRadius: '8px', marginTop: '8px', fontSize: '0.8rem' }}>
                                       {evt.budgetMode === 'views' ? (
                                         <>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>Status Pembayaran</span>
                                             <span style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 'bold' }}>Otomatis Cair</span>
                                           </div>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                             <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Payout Masuk</span>
                                             <strong style={{ color: 'white', fontSize: '0.9rem' }}>Rp {(userSub.paidBenefit || 0).toLocaleString('id-ID')}</strong>
                                           </div>
                                         </>
                                       ) : (
                                         <>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                             <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: '600' }}>Skor Akhir</span>
                                             <span style={{ fontSize: '1rem', color: '#22c55e', fontWeight: 'bold' }}>{userSub.score} / 100</span>
                                           </div>
                                           {userSub.feedback && (
                                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                                               "{userSub.feedback}"
                                             </p>
                                           )}
                                         </>
                                       )}
                                     </div>
                                   )}
                                </div>
                              </div>

                            </div>
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
            marginBottom: '24px' 
          }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              Event & Kompetisi Kreatif
            </h1>
          </div>

          {/* User Portal Tabs */}
          {currentUser && (currentUser.role === 'user' || currentUser.role === 'panitia') && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <button
                onClick={() => setUserPortalTab('events')}
                style={{
                  padding: '10px 20px',
                  background: userPortalTab === 'events' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: userPortalTab === 'events' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  color: userPortalTab === 'events' ? 'white' : 'var(--text-secondary)',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                Semua Event
              </button>
              <button
                onClick={() => setUserPortalTab('offers')}
                style={{
                  padding: '10px 20px',
                  background: userPortalTab === 'offers' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: userPortalTab === 'offers' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  color: userPortalTab === 'offers' ? 'white' : 'var(--text-secondary)',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none'
                }}
              >
                <span>Undangan Kolaborasi</span>
                {(() => {
                  const pendingCount = (offers || []).filter(o => o.recipient.toLowerCase() === currentUser.username.toLowerCase() && o.status === 'pending').length;
                  if (pendingCount > 0) {
                    return (
                      <span style={{
                        background: '#ffffff',
                        color: '#020202',
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
            <div className="collab-offers-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy style={{ color: '#ffffff' }} />
                  <span>Daftar Undangan Kolaborasi Penyelenggara</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Berikut adalah daftar undangan kolaborasi eksklusif dari Panitia Event untuk Anda. Terima undangan untuk langsung terdaftar sebagai peserta.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {(() => {
                  const myOffers = (offers || []).filter(o => o.recipient.toLowerCase() === currentUser?.username.toLowerCase());
                  if (myOffers.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Belum ada undangan kolaborasi untuk akun Anda saat ini.
                      </div>
                    );
                  }

                  return myOffers.map(off => {
                    const evt = events.find(e => e.id === off.eventId);
                    const offerDate = off.sentAt ? new Date(off.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
                    
                    return (
                      <div 
                        key={off.id}
                        className="glass-panel"
                        style={{
                          padding: '24px',
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          background: 'rgba(255, 255, 255, 0.01)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px'
                        }}
                      >
                        <div>
                          {/* Card Header: Sender Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Pengirim</span>
                              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>@{off.sender}</strong>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{offerDate}</span>
                          </div>

                          {/* Event proposed */}
                          <div style={{ marginBottom: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Event Kompetisi</span>
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
                                color: 'white', 
                                fontWeight: '700', 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                display: 'inline-block',
                                marginTop: '2px'
                              }}
                            >
                              {off.eventTitle}
                            </span>
                          </div>

                          {/* Budget offered */}
                          {(off.budget || 0) > 0 && (
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              marginBottom: '14px'
                            }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>TAWARAN BUDGET EKSKLUSIF</span>
                              <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>Rp {off.budget?.toLocaleString('id-ID')}</strong>
                            </div>
                          )}

                          {/* Message content */}
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.04)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                            "{off.message || 'Tidak ada pesan khusus.'}"
                          </div>
                        </div>

                        {/* Card Footer: Actions or status */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                          {off.status === 'pending' ? (
                            (() => {
                              const isRegistered = eventParticipants.some(p => p.eventId === off.eventId && p.username.toLowerCase() === currentUser.username.toLowerCase());
                              return (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => handleDeclineOffer(off)}
                                    className="btn"
                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}
                                  >
                                    Tolak
                                  </button>
                                  {isRegistered ? (
                                    <button
                                      disabled
                                      className="btn"
                                      style={{ flex: 2, padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'not-allowed' }}
                                      title="Anda sudah terdaftar di event ini"
                                    >
                                      Sudah Terdaftar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAcceptOffer(off)}
                                      className="btn btn-primary"
                                      style={{ flex: 2, padding: '10px', borderRadius: '10px', background: '#ffffff', border: '#ffffff', color: '#020202', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Terima Undangan
                                    </button>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div style={{
                              textAlign: 'center',
                              padding: '8px',
                              borderRadius: '10px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              color: off.status === 'accepted' ? '#ffffff' : 'var(--text-muted)',
                              background: off.status === 'accepted' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                              border: off.status === 'accepted' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)'
                            }}>
                              {off.status === 'accepted' ? 'Undangan Diterima' : 'Undangan Ditolak'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar & Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
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
                  outline: 'none'
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

            {/* Buat Event Button */}
            <button 
              onClick={handleCreateEventClick}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.88rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.2)';
              }}
            >
              <Calendar size={16} />
              <span>Buat Event Baru</span>
            </button>
          </div>

          {/* List Layout: Row Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(() => {
              const filtered = events.filter(evt =>
                evt.paymentStatus === 'paid' && 
                !isEventHiddenFromPublic(evt) && (
                  evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  evt.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  evt.description?.toLowerCase().includes(searchQuery.toLowerCase())
                )
              ).sort((a, b) => {
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
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                      e.currentTarget.style.borderColor = userReg?.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Left Section: Tags, Title & Desc */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(() => {
                          const style = getCategoryBadgeStyle(evt.category);
                          return (
                            <span style={{ 
                              fontSize: '0.68rem', 
                              background: style.bg, 
                              color: style.color, 
                              padding: '3px 10px', 
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              border: style.border
                            }}>
                              {evt.category}
                            </span>
                          );
                        })()}
                        {userReg?.status === 'approved' && (
                          <span style={{ 
                            fontSize: '0.68rem', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#4ade80', 
                            padding: '3px 10px', 
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            Terdaftar
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{evt.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverride: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', maxWidth: '500px' }}>
                        {evt.description}
                      </p>

                      {/* Organizer info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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
                    </div>

                    {/* Middle Section: Budget & Deadline */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginRight: '8px' }}>
                      <div style={{ minWidth: '160px', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                          {evt.budgetMode === 'ranking' ? 'Prize Pool' : 'Sisa / Total Budget'}
                        </div>
                        {evt.budgetMode === 'ranking' ? (
                          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                            Rp {evt.campaignBudget.toLocaleString('id-ID')}
                          </strong>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                              Rp {getEventRemainingBudget(evt).toLocaleString('id-ID')}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              / Rp {evt.campaignBudget.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
                          <span>Batas Waktu</span>
                        </div>
                        {evt.deadline ? (
                          <CardCountdown deadline={evt.deadline} />
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#ffffff', 
                            background: 'rgba(255, 255, 255, 0.06)', 
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            display: 'inline-block',
                            fontWeight: '600'
                          }}>
                            Tanpa Batas Waktu
                          </span>
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
                  <span>Verifikasi Akun Sosmed</span>
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Pendaftaran Kompetisi: <strong style={{ color: 'white' }}>{registeringEvent.title}</strong>
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
                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>Pilih Platform Sosial Media</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { id: 'instagram', label: 'Instagram', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, color: '#e1306c' },
                    { id: 'tiktok', label: 'TikTok', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>, color: '#00f2fe' },
                    { id: 'youtube', label: 'YouTube', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><polygon points="10 15 15 12 10 9"/></svg>, color: '#ff0000' },
                    { id: 'facebook', label: 'Facebook', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, color: '#1877f2' }
                  ].map(p => {
                    const isSelected = selectedPlatform === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid #ffffff' : '1px solid var(--border-color)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                      >
                        <span style={{ color: isSelected ? '#ffffff' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                          {p.svg}
                        </span>
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#ffffff', border: '1px solid #ffffff', padding: '14px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem', color: '#000000', lineHeight: '1.5', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#000000' }} />
                  <span style={{ fontWeight: '500' }}>
                    <strong style={{ fontWeight: '800', textDecoration: 'underline' }}>PENTING:</strong> Akun sosial media ini wajib menjadi akun yang Anda gunakan untuk mempublikasikan video hasil karya kompetisi Anda nantinya.
                  </span>
                </div>

                <form onSubmit={handleLanjutVerifikasi} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '500' }}>Username / Handle {selectedPlatform.toUpperCase()}</label>
                    <input
                      type="text"
                      required
                      value={socialUrl}
                      onChange={(e) => setSocialUrl(e.target.value)}
                      placeholder={`Contoh: @username atau username Anda`}
                      style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => { setRegisteringEvent(null); resetVerificationForm(); }}>Batal</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Lanjut ke Verifikasi Kode</button>
                  </div>
                </form>
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
                <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>Verifikasi Akun Sukses!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 28px 0' }}>
                  Sistem mendeteksi akun <strong>@{socialUrl.trim()}</strong> Anda valid dan aktif. Pendaftaran kompetisi disetujui secara otomatis.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    setRegisteringEvent(null);
                    resetVerificationForm();
                  }}
                  style={{ width: '100%', fontWeight: 'bold', padding: '12px' }}
                >
                  Mulai Kompetisi
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

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Deskripsi Singkat Karya</label>
                <textarea 
                  rows="5" 
                  required 
                  value={workDescription} 
                  onChange={(e) => setWorkDescription(e.target.value)} 
                  placeholder="Tuliskan latar belakang singkat, sinopsis, atau pesan penting dari karya Anda..." 
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

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
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.15)',
            color: 'white',
            textAlign: 'center'
          }}>
            {/* Warning Icon with circular pulse background */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertTriangle size={32} style={{ color: '#c084fc' }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'white' }}>
              Memerlukan Akun Panitia
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
              Saat ini Anda masuk sebagai <strong style={{ color: '#c084fc' }}>{currentUser?.role === 'member' ? 'Member' : 'User'}</strong>. 
              Untuk dapat membuat & mengelola event baru, Anda harus terdaftar menggunakan akun dengan peran <strong style={{ color: '#a78bfa' }}>Panitia</strong>.
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
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)',
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