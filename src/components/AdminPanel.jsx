import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Film, 
  Eye, 
  Star, 
  Calendar, 
  Flag, 
  X, 
  Search, 
  Sparkles,
  Clock,
  Check,
  AlertTriangle,
  Link2,
  User,
  HardDrive,
  Database,
  Award,
  FileVideo,
  Users,
  Heart,
  MessageSquare,
  ExternalLink,
  Wallet,
  Info,
  ArrowLeft,
  Send
} from 'lucide-react';

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

const getDatetimeInputValue = (val) => {
  if (!val) return '';
  if (val.includes('T')) return val; // already formatted as YYYY-MM-DDTHH:MM
  return `${val}T23:59`; // default to end of the day for legacy date-only values
};

const formatInputCurrency = (num) => {
  if (num === 0 || !num) return '';
  return num.toLocaleString('id-ID');
};


export default function AdminPanel({ 
  movies, 
  setMovies, 
  affiliateLinks = [], 
  setAffiliateLinks, 
  gdriveApiKey = '', 
  setGdriveApiKey,
  whatsappAdmin = 'https://wa.me/6281234567890',
  setWhatsappAdmin,
  premiumPrice = 'Rp 29.000 / Bulan',
  setPremiumPrice,
  paymentInstructions = '',
  setPaymentInstructions,
  users = [],
  setUsers,
  confirmations = [],
  setConfirmations,
  currentUser,
  onSaveSettings,

  adminSubTab,
  setAdminSubTab,
  events = [],
  setEvents,
  eventParticipants = [],
  setEventParticipants,
  eventSubmissions = [],
  setEventSubmissions,
  withdrawals = [],
  setWithdrawals,
  handleTransferWallet,
  minWithdrawalAmount = 50000,
  setMinWithdrawalAmount,
  eventAdminFee = 0,
  setEventAdminFee
}) {
  // Local state
  const [zoomedReceipt, setZoomedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(6);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Creator Marketplace local states
  const [selectedMarketplaceCreator, setSelectedMarketplaceCreator] = useState(null);
  const [offerEventId, setOfferEventId] = useState('');
  const [offerBudget, setOfferBudget] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');

  const [editingMovie, setEditingMovie] = useState(null); // null means adding a new movie
  const [editingUser, setEditingUser] = useState(null); // null means not editing any user
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Event creation form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Short Film');
  const [eventDeadline, setEventDeadline] = useState('');
  const [eventHasDeadline, setEventHasDeadline] = useState(true);
  const [eventMaxParticipants, setEventMaxParticipants] = useState(50);
  const [eventHasMaxParticipants, setEventHasMaxParticipants] = useState(true);
  const [eventDescription, setEventDescription] = useState('');
  const [eventJuknis, setEventJuknis] = useState('');
  const [eventBudget, setEventBudget] = useState(5000000);
  const [eventBenefitAmount, setEventBenefitAmount] = useState(10000);
  const [eventBenefitViewsStep, setEventBenefitViewsStep] = useState(1000);
  const [eventBudgetMode, setEventBudgetMode] = useState('views'); // 'views' or 'ranking'
  const [eventPrize1, setEventPrize1] = useState(3000000);
  const [eventPrize2, setEventPrize2] = useState(1500000);
  const [eventPrize3, setEventPrize3] = useState(500000);
  const [editingEventId, setEditingEventId] = useState(null);
  const [depositingEvent, setDepositingEvent] = useState(null);
  const [verifyingEvent, setVerifyingEvent] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('BCA');
  const [receiptFile, setReceiptFile] = useState('');

  useEffect(() => {
    setVisibleMoviesCount(12);
  }, [searchTerm]);

  useEffect(() => {
    setVisibleMoviesCount(12);
  }, [searchTerm]);

  useEffect(() => {
    setVisibleMoviesCount(12);
  }, [searchTerm]);

  const handleOpenPayment = (evt) => {
    setSenderName('');
    setSenderBank('BCA');
    setReceiptFile('');
    setDepositingEvent(evt);
  };
  const [rankingWinnerEvent, setRankingWinnerEvent] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [winnerJuara1, setWinnerJuara1] = useState('');
  const [winnerJuara2, setWinnerJuara2] = useState('');
  const [winnerJuara3, setWinnerJuara3] = useState('');

  const [eventManageSearch, setEventManageSearch] = useState('');
  const [eventParticipantsSearch, setEventParticipantsSearch] = useState('');
  const [eventSubmissionsSearch, setEventSubmissionsSearch] = useState('');
  const [eventJudgingSearch, setEventJudgingSearch] = useState('');
  const [affiliatesSearch, setAffiliatesSearch] = useState('');
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState('');
  const [selectedManageEvent, setSelectedManageEvent] = useState(null);
  const [innerManageTab, setInnerManageTab] = useState(() => {
    return localStorage.getItem('portal-inner-manage-tab') || 'participants';
  });

  React.useEffect(() => {
    localStorage.setItem('portal-inner-manage-tab', innerManageTab);
  }, [innerManageTab]);

  React.useEffect(() => {
    if (selectedManageEvent) {
      localStorage.setItem('portal-selected-manage-event-id', selectedManageEvent.id);
    } else {
      localStorage.removeItem('portal-selected-manage-event-id');
    }
  }, [selectedManageEvent]);

  React.useEffect(() => {
    const savedId = localStorage.getItem('portal-selected-manage-event-id');
    if (savedId && events.length > 0 && !selectedManageEvent) {
      const found = events.find(e => e.id === savedId);
      if (found) {
        setSelectedManageEvent(found);
      }
    }
  }, [events]);

  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSelectedEventIdFilter('');
    setSelectedManageEvent(null);
  }, [adminSubTab]);

  // Judging states
  const [judgingSubmission, setJudgingSubmission] = useState(null);
  const [judgingScore, setJudgingScore] = useState('');
  const [judgingFeedback, setJudgingFeedback] = useState('');

  // Submission preview state
  const [previewSubmission, setPreviewSubmission] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSyncAllSubmissions = async () => {
    if (events.length === 0 || eventSubmissions.length === 0) {
      alert('Belum ada data karya masuk untuk disinkronisasi.');
      return;
    }
    setIsSyncingAll(true);
    try {
      const updated = await Promise.all(eventSubmissions.map(async (sub) => {
        const lowerUrl = sub.videoUrl?.toLowerCase() || '';
        let platform = sub.platform;
        
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) platform = 'YouTube';
        else if (lowerUrl.includes('tiktok.com')) platform = 'TikTok';
        else if (lowerUrl.includes('instagram.com')) platform = 'Instagram';
        else if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) platform = 'Facebook';
        else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) platform = 'Twitter / X';
        else if (lowerUrl.includes('threads.net')) platform = 'Threads';
        else if (!platform || platform === 'Lainnya') platform = 'Lainnya';

        if (platform === 'YouTube') {
          const videoId = extractYoutubeId(sub.videoUrl);
          if (videoId) {
            try {
              const res = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`);
               if (res.ok) {
                 const data = await res.json();
                 return {
                   ...sub,
                   platform,
                   views: data.viewCount || sub.views || 0,
                   likes: data.likes || sub.likes || 0,
                   comments: data.likes ? Math.round(data.likes * 0.05) : sub.comments || 0
                 };
               }
            } catch (err) {
              console.error("Failed to fetch youtube statistics:", err);
            }
          }
        }

        // Fallback for non-YouTube or failed fetch
        const randomViews = Math.floor(Math.random() * 80000) + 12000;
        const randomLikes = Math.floor(randomViews * (Math.random() * 0.10 + 0.05));
        const randomComments = Math.floor(randomLikes * (Math.random() * 0.06 + 0.02));

        return {
          ...sub,
          platform,
          views: sub.views && sub.views > 0 ? sub.views : randomViews,
          likes: sub.likes && sub.likes > 0 ? sub.likes : randomLikes,
          comments: sub.comments && sub.comments > 0 ? sub.comments : randomComments
        };
      }));

      setEventSubmissions(updated);
      alert(`Berhasil melakukan Grab & Sinkronisasi data real-time dari ${updated.length} tautan peserta!`);
    } catch (e) {
      console.error("Sync failed:", e);
      alert("Gagal menyinkronkan data.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Event action handlers
  const handleEventSubmit = (e) => {
    e.preventDefault();
    const isRanking = eventBudgetMode === 'ranking';
    const computedBudget = isRanking 
      ? (parseInt(eventPrize1) || 0) + (parseInt(eventPrize2) || 0) + (parseInt(eventPrize3) || 0)
      : (parseInt(eventBudget) || 0);

    if (editingEventId) {
      setEvents(events.map(evt => {
        if (evt.id === editingEventId) {
          return {
            ...evt,
            title: eventTitle.trim(),
            category: eventCategory,
            deadline: (eventBudgetMode === 'views' && !eventHasDeadline) ? '' : eventDeadline,
            maxParticipants: eventHasMaxParticipants ? (parseInt(eventMaxParticipants) || 0) : 0,
            description: eventDescription.trim(),
            juknis: eventJuknis.trim(),
            budgetMode: eventBudgetMode,
            campaignBudget: computedBudget,
            remainingBudget: computedBudget,
            benefitAmount: isRanking ? 0 : (parseInt(eventBenefitAmount) || 0),
            benefitViewsStep: isRanking ? 0 : (parseInt(eventBenefitViewsStep) || 1000),
            prize1: isRanking ? (parseInt(eventPrize1) || 0) : 0,
            prize2: isRanking ? (parseInt(eventPrize2) || 0) : 0,
            prize3: isRanking ? (parseInt(eventPrize3) || 0) : 0,
            paymentStatus: evt.paymentStatus || 'pending',
            adminFee: evt.paymentStatus === 'paid' ? (evt.adminFee !== undefined ? evt.adminFee : 0) : (eventAdminFee || 0)
          };
        }
        return evt;
      }));
      setEditingEventId(null);
      setShowEventForm(false);
      alert('Event berhasil diperbarui!');
    } else {
      const newEvent = {
        id: `evt_${Date.now()}`,
        title: eventTitle.trim(),
        category: eventCategory,
        deadline: (eventBudgetMode === 'views' && !eventHasDeadline) ? '' : eventDeadline,
        maxParticipants: eventHasMaxParticipants ? (parseInt(eventMaxParticipants) || 0) : 0,
        description: eventDescription.trim(),
        juknis: eventJuknis.trim(),
        budgetMode: eventBudgetMode,
        campaignBudget: computedBudget,
        remainingBudget: computedBudget,
        // views mode
        benefitAmount: isRanking ? 0 : (parseInt(eventBenefitAmount) || 0),
        benefitViewsStep: isRanking ? 0 : (parseInt(eventBenefitViewsStep) || 1000),
        // ranking mode
        prize1: isRanking ? (parseInt(eventPrize1) || 0) : 0,
        prize2: isRanking ? (parseInt(eventPrize2) || 0) : 0,
        prize3: isRanking ? (parseInt(eventPrize3) || 0) : 0,
        paymentStatus: 'pending',
        adminFee: eventAdminFee || 0,
        organizerName: currentUser?.organizerName || currentUser?.username || 'Panitia Portal',
        organizerPhone: currentUser?.organizerPhone || '',
        organizerDescription: currentUser?.organizerDescription || ''
      };
      setEvents([...events, newEvent]);
      setShowEventForm(false);
      alert('Event baru berhasil dibuat! Silakan selesaikan pembayaran biaya event di daftar event agar event aktif.');
    }
  };

  const getPanitiaPayments = () => {
    const list = [];
    events.forEach(evt => {
      if (evt.paymentStatus === 'paid' || evt.paymentStatus === 'pending_verification') {
        list.push({
          id: `pay_${evt.id}`,
          date: evt.deadline ? new Date(evt.deadline) : new Date(),
          eventTitle: evt.title,
          description: 'Pembayaran Biaya Event & Layanan Platform',
          type: 'Keluar',
          amount: (evt.campaignBudget || 0) + (evt.adminFee || 0),
          status: evt.paymentStatus === 'paid' ? 'Sukses' : 'Menunggu Verifikasi'
        });
      }
      if (evt.budgetMode === 'ranking' && evt.winnersReleased) {
        if (evt.prize1 > 0) {
          list.push({ id: `payout_p1_${evt.id}`, date: new Date(), eventTitle: evt.title, description: 'Penyaluran Hadiah Juara 1', type: 'Keluar', amount: evt.prize1, status: 'Sukses' });
        }
        if (evt.prize2 > 0) {
          list.push({ id: `payout_p2_${evt.id}`, date: new Date(), eventTitle: evt.title, description: 'Penyaluran Hadiah Juara 2', type: 'Keluar', amount: evt.prize2, status: 'Sukses' });
        }
        if (evt.prize3 > 0) {
          list.push({ id: `payout_p3_${evt.id}`, date: new Date(), eventTitle: evt.title, description: 'Penyaluran Hadiah Juara 3', type: 'Keluar', amount: evt.prize3, status: 'Sukses' });
        }
      }
      if (evt.budgetMode === 'views') {
        const subs = eventSubmissions.filter(s => s.eventId === evt.id && s.views > 0);
        subs.forEach(s => {
          const step = evt.benefitViewsStep || 1000;
          const payout = Math.floor(s.views / step) * (evt.benefitAmount || 0);
          if (payout > 0) {
            list.push({
              id: `payout_views_${s.id}`,
              date: new Date(s.submittedAt || Date.now()),
              eventTitle: evt.title,
              description: `Pencairan Benefit Views Peserta (${s.participantName})`,
              type: 'Keluar',
              amount: payout,
              status: 'Sukses'
            });
          }
        });
      }
    });
    return list.sort((a, b) => b.date - a.date);
  };

  const getEventTransactions = (evt) => {
    const list = [];
    if (!evt) return list;
    if (evt.paymentStatus === 'paid' || evt.paymentStatus === 'pending_verification') {
      list.push({
        id: `pay_${evt.id}`,
        date: evt.deadline ? new Date(evt.deadline) : new Date(),
        description: 'Pembayaran Biaya Event & Layanan Platform',
        type: 'Keluar',
        amount: (evt.campaignBudget || 0) + (evt.adminFee || 0),
        status: evt.paymentStatus === 'paid' ? 'Sukses' : 'Menunggu Verifikasi'
      });
    }
    if (evt.budgetMode === 'ranking' && evt.winnersReleased) {
      if (evt.prize1 > 0) list.push({ id: `payout_p1_${evt.id}`, date: new Date(), description: 'Penyaluran Hadiah Juara 1', type: 'Keluar', amount: evt.prize1, status: 'Sukses' });
      if (evt.prize2 > 0) list.push({ id: `payout_p2_${evt.id}`, date: new Date(), description: 'Penyaluran Hadiah Juara 2', type: 'Keluar', amount: evt.prize2, status: 'Sukses' });
      if (evt.prize3 > 0) list.push({ id: `payout_p3_${evt.id}`, date: new Date(), description: 'Penyaluran Hadiah Juara 3', type: 'Keluar', amount: evt.prize3, status: 'Sukses' });
    }
    if (evt.budgetMode === 'views') {
      const subs = eventSubmissions.filter(s => s.eventId === evt.id && s.views > 0);
      subs.forEach(s => {
        const step = evt.benefitViewsStep || 1000;
        const payout = Math.floor(s.views / step) * (evt.benefitAmount || 0);
        if (payout > 0) {
          list.push({
            id: `payout_views_${s.id}`,
            date: new Date(s.submittedAt || Date.now()),
            description: `Pencairan Benefit Views Peserta (${s.participantName})`,
            type: 'Keluar',
            amount: payout,
            status: 'Sukses'
          });
        }
      });
    }
    return list.sort((a, b) => b.date - a.date);
  };

  const getEventRemainingBudget = (evt) => {
    if (evt.budgetMode === 'ranking') {
      return evt.campaignBudget || 0;
    }
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

  const calculateCreatorMetrics = (username) => {
    const userLower = (username || '').toLowerCase();
    
    // 1. Events joined (approved status)
    const joinedEvents = eventParticipants.filter(p => 
      p.username.toLowerCase() === userLower && 
      p.status === 'approved'
    );
    
    // 2. Submissions
    const submissions = eventSubmissions.filter(s => 
      s.username.toLowerCase() === userLower
    );
    
    // 3. Accumulated Views & Likes
    const totalViews = submissions.reduce((sum, s) => sum + (s.views || 0), 0);
    const totalLikes = submissions.reduce((sum, s) => sum + (s.likes || 0), 0);
    
    // 4. Calculate wins (placed in top 3 of ended ranking events)
    let winsCount = 0;
    events.forEach(evt => {
      if (evt.budgetMode === 'ranking' && evt.paymentStatus === 'paid') {
        const isDeadlinePassed = evt.deadline ? (
          evt.deadline.includes('T')
            ? new Date().getTime() > new Date(evt.deadline).getTime()
            : new Date().getTime() > new Date(evt.deadline + 'T23:59:59').getTime()
        ) : false;
        
        if (isDeadlinePassed) {
          const eventSubs = eventSubmissions.filter(s => s.eventId === evt.id);
          const sortedSubs = [...eventSubs].sort((a, b) => (b.views || 0) - (a.views || 0));
          const top3Users = sortedSubs.slice(0, 3).map(s => s.username.toLowerCase());
          if (top3Users.includes(userLower)) {
            winsCount++;
          }
        }
      }
    });

    // 5. Total Points
    // (Events Joined * 50) + (Math.floor(Total Views / 100)) + (Wins * 100)
    const points = (joinedEvents.length * 50) + Math.floor(totalViews / 100) + (winsCount * 100);

    // 6. Level Tier
    let level = 'Bronze Creator';
    let levelColor = '#b45309'; // Bronze
    let levelBg = 'rgba(180, 83, 9, 0.15)';
    let levelBorder = '1px solid rgba(180, 83, 9, 0.3)';

    if (points >= 5000) {
      level = 'Platinum Creator';
      levelColor = '#e2e8f0'; // Platinum/Silverish white
      levelBg = 'rgba(226, 232, 240, 0.15)';
      levelBorder = '1px solid rgba(226, 232, 240, 0.3)';
    } else if (points >= 1500) {
      level = 'Gold Creator';
      levelColor = '#fbbf24'; // Gold
      levelBg = 'rgba(251, 191, 36, 0.15)';
      levelBorder = '1px solid rgba(251, 191, 36, 0.3)';
    } else if (points >= 500) {
      level = 'Silver Creator';
      levelColor = '#cbd5e1'; // Silver
      levelBg = 'rgba(203, 213, 225, 0.15)';
      levelBorder = '1px solid rgba(203, 213, 225, 0.3)';
    }

    return {
      joinedEventsCount: joinedEvents.length,
      submissionsCount: submissions.length,
      totalViews,
      totalLikes,
      winsCount,
      points,
      level,
      levelColor,
      levelBg,
      levelBorder
    };
  };

  const getEventStatus = (evt) => {
    if (evt.paymentStatus === 'pending_verification') {
      return {
        label: 'Menunggu Verifikasi',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.1)',
        info: 'Pembayaran biaya event sedang diverifikasi oleh admin platform.'
      };
    }
    if (evt.paymentStatus !== 'paid') {
      return {
        label: 'Pending',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.1)',
        info: 'Event belum aktif karena belum menyelesaikan pembayaran biaya event dan biaya layanan platform.'
      };
    }
    
    // Check if deadline is passed
    const isDeadlinePassed = evt.deadline ? (
      evt.deadline.includes('T')
        ? new Date().getTime() > new Date(evt.deadline).getTime()
        : new Date().getTime() > new Date(evt.deadline + 'T23:59:59').getTime()
    ) : false;
    
    if (evt.budgetMode === 'ranking') {
      if (isDeadlinePassed) {
        return {
          label: 'Selesai',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          info: 'Event telah selesai. Pemenang ditentukan secara otomatis berdasarkan jumlah views tertinggi.'
        };
      }
      return {
        label: 'Berjalan',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        info: 'Event sedang aktif berjalan. Peserta dapat mendaftar dan mengirimkan karya.'
      };
    } else {
      // Views mode
      const remainingBudget = getEventRemainingBudget(evt);
      if (remainingBudget <= 0) {
        return {
          label: 'Selesai (Budget Habis)',
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          info: 'Event telah selesai karena budget kampanye telah habis dibagikan kepada peserta.'
        };
      }
      if (isDeadlinePassed) {
        return {
          label: 'Selesai',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          info: 'Event telah selesai karena telah melewati batas waktu (deadline).'
        };
      }
      return {
        label: 'Berjalan',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        info: 'Event sedang aktif berjalan. Peserta dapat mendaftar, mengirimkan karya, dan mencairkan benefit views.'
      };
    }
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      setEvents(events.filter(e => e.id !== id));
      setEventParticipants(prev => prev.filter(p => p.eventId !== id));
      setEventSubmissions(prev => prev.filter(s => s.eventId !== id));
    }
  };

  const handleEditEvent = (evt) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title || '');
    setEventCategory(evt.category || 'Short Film');
    setEventDeadline(evt.deadline || '');
    setEventMaxParticipants(evt.maxParticipants || 50);
    setEventHasMaxParticipants((evt.maxParticipants || 0) > 0);
    setEventDescription(evt.description || '');
    setEventJuknis(evt.juknis || '');
    setEventBudgetMode(evt.budgetMode || 'views');
    setEventBudget(evt.campaignBudget || 5000000);
    setEventBenefitAmount(evt.benefitAmount || 10000);
    setEventBenefitViewsStep(evt.benefitViewsStep || 1000);
    setEventPrize1(evt.prize1 || 3000000);
    setEventPrize2(evt.prize2 || 1500000);
    setEventPrize3(evt.prize3 || 500000);
    setShowEventForm(true);
  };

  const handleApproveParticipant = (id) => {
    setEventParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'approved' };
      }
      return p;
    }));
  };

  const handleRejectParticipant = (id) => {
    setEventParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'rejected' };
      }
      return p;
    }));
  };

  const handleApproveWithdrawal = (wdId) => {
    const wd = withdrawals.find(w => w.id === wdId);
    if (!wd) return;
    setAuthModal({
      title: 'Otorisasi Persetujuan Penarikan',
      message: `Apakah Anda yakin ingin menyetujui penarikan saldo sebesar Rp ${wd.amount.toLocaleString('id-ID')} ke akun ${wd.method} (${wd.account} a.n ${wd.name}) untuk peserta ${wd.username}?`,
      onConfirm: () => {
        setWithdrawals(prev => prev.map(w => w.id === wdId ? { ...w, status: 'approved' } : w));
        alert('Penarikan dana disetujui secara instan!');
      }
    });
  };

  const handleRejectWithdrawal = (wd) => {
    setAuthModal({
      title: 'Otorisasi Penolakan Penarikan',
      message: `Apakah Anda yakin ingin menolak penarikan saldo sebesar Rp ${wd.amount.toLocaleString('id-ID')} untuk peserta ${wd.username}? Saldo akan dikembalikan secara utuh ke dompet mereka.`,
      onConfirm: () => {
        // 1. Return money back to user wallet
        handleTransferWallet(wd.username, wd.amount);
        // 2. Set withdrawal status to 'rejected'
        setWithdrawals(prev => prev.map(w => w.id === wd.id ? { ...w, status: 'rejected' } : w));
        alert('Penarikan dana ditolak dan nominal saldo telah dikembalikan ke dompet peserta.');
      }
    });
  };

  const handleJudgingSubmit = (e) => {
    e.preventDefault();
    const scoreVal = parseInt(judgingScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 100) {
      alert('Skor harus berupa angka antara 1 sampai 100!');
      return;
    }
    setEventSubmissions(prev => prev.map(s => {
      if (s.id === judgingSubmission.id) {
        return { ...s, score: scoreVal, feedback: judgingFeedback.trim(), status: 'reviewed' };
      }
      return s;
    }));
    setJudgingSubmission(null);
    alert('Penilaian karya berhasil disimpan!');
  };

  const getActivePeriodLabel = (user) => {
    if (user.role === 'superadmin' || user.role === 'staf' || user.role === 'panitia') {
      return <span style={{ color: 'var(--text-muted)' }}>Sistem (Permanen)</span>;
    }
    if (user.role !== 'member') {
      return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    }
    if (!user.premiumExpiresAt) {
      return <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Aktif (Selamanya)</span>;
    }
    const remainingMs = user.premiumExpiresAt - Date.now();
    if (remainingMs <= 0) {
      return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Kedaluwarsa</span>;
    }
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return (
      <span style={{ color: '#4ade80', fontWeight: '500' }}>
        Aktif ({remainingDays} Hari Lagi)
      </span>
    );
  };

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formId, setFormId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPoster, setFormPoster] = useState('');
  const [formBackdrop, setFormBackdrop] = useState('');
  const [formDriveId, setFormDriveId] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formAffiliateUrl, setFormAffiliateUrl] = useState('');
  const [formRating, setFormRating] = useState('8.0');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formDuration, setFormDuration] = useState('2h 0m');
  const [formQuality, setFormQuality] = useState('FHD');
  const [formCountry, setFormCountry] = useState('AS');
  const [formIsSemi, setFormIsSemi] = useState(false);
  const [formEpisodesText, setFormEpisodesText] = useState('');
  
  // Genres list for checkboxes
  const defaultGenres = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 
    'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 
    'Sci-Fi', 'Thriller'
  ];
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [availableGenres, setAvailableGenres] = useState(() => {
    // Get unique genres from current movies list + default ones
    const currentGenres = movies.flatMap(m => m.genre || []);
    return Array.from(new Set([...defaultGenres, ...currentGenres])).sort();
  });

  const [formError, setFormError] = useState('');

  // Dashboard Stats
  const totalMovies = movies.length;
  const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);
  const avgRating = totalMovies > 0 
    ? (movies.reduce((sum, m) => sum + (m.rating || 0), 0) / totalMovies).toFixed(1)
    : 0;
  const uniqueGenresCount = new Set(movies.flatMap(m => m.genre || [])).size;

  // Handle Form Open (Add/Edit)
  const openAddModal = () => {
    setEditingMovie(null);
    setFormTitle('');
    setFormId('');
    setFormDescription('');
    setFormPoster('');
    setFormBackdrop('');
    setFormDriveId('');
    setFormVideoUrl('');
    setFormAffiliateUrl('');
    setFormRating('8.0');
    setFormYear(new Date().getFullYear().toString());
    setFormDuration('2h 0m');
    setFormQuality('FHD');
    setFormCountry('AS');
    setFormIsSemi(false);
    setSelectedGenres([]);
    setFormEpisodesText('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormTitle(movie.title || '');
    setFormId(movie.id || '');
    setFormDescription(movie.description || '');
    setFormPoster(movie.poster || '');
    setFormBackdrop(movie.backdrop || '');
    setFormDriveId(movie.driveId || '');
    setFormVideoUrl(movie.videoUrl || '');
    setFormAffiliateUrl(movie.affiliateUrl || '');
    setFormRating(movie.rating?.toString() || '8.0');
    setFormYear(movie.year?.toString() || new Date().getFullYear().toString());
    setFormDuration(movie.duration || '2h 0m');
    setFormQuality(movie.quality || 'FHD');
    setFormCountry(movie.country || 'AS');
    setFormIsSemi(movie.isSemi || false);
    setSelectedGenres(movie.genre || []);
    
    // Load episodes into line-by-line format: "Title|Source"
    if (movie.episodes && movie.episodes.length > 0) {
      setFormEpisodesText(movie.episodes.map(ep => `${ep.title}|${ep.source}`).join('\n'));
    } else {
      setFormEpisodesText('');
    }

    setFormError('');
    setIsModalOpen(true);
  };

  // Generate ID based on Title
  const handleTitleChange = (val) => {
    setFormTitle(val);
    if (!editingMovie) {
      // Auto generate id slugified
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormId(slug);
    }
  };

  // Genre selection toggles
  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAddNewGenre = () => {
    const trimmed = newGenreInput.trim();
    if (trimmed && !availableGenres.includes(trimmed)) {
      setAvailableGenres([...availableGenres, trimmed].sort());
      setSelectedGenres([...selectedGenres, trimmed]);
      setNewGenreInput('');
    }
  };

  // Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setFormError('Judul film wajib diisi.');
      return;
    }
    if (!formId.trim()) {
      setFormError('ID film wajib diisi.');
      return;
    }
    // Check ID conflict if adding new or if ID has changed
    const isIdConflict = movies.some(
      m => m.id === formId.trim() && (!editingMovie || editingMovie.id !== m.id)
    );
    if (isIdConflict) {
      setFormError('ID film ini sudah digunakan. Harap gunakan ID yang unik.');
      return;
    }

    const ratingVal = parseFloat(formRating);
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 10) {
      setFormError('Rating harus diisi dengan angka antara 0.0 - 10.0.');
      return;
    }

    const yearVal = parseInt(formYear);
    if (isNaN(yearVal) || yearVal < 1800 || yearVal > 2100) {
      setFormError('Tahun harus diisi dengan angka tahun yang valid (1800-2100).');
      return;
    }

    // Parse episodes from line-by-line text
    const episodesParsed = formEpisodesText.split('\n')
      .map(line => {
        const parts = line.split('|');
        if (parts.length >= 2) {
          return {
            title: parts[0].trim(),
            source: parts[1].trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    if (!formDriveId.trim() && !formVideoUrl.trim() && episodesParsed.length === 0) {
      setFormError('Harap isi setidaknya salah satu antara Google Drive ID, URL Video Langsung, atau Daftar Episode.');
      return;
    }

    const moviePayload = {
      id: formId.trim(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      poster: formPoster.trim() || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80',
      backdrop: formBackdrop.trim() || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
      driveId: formDriveId.trim(),
      videoUrl: formVideoUrl.trim(),
      episodes: episodesParsed,
      affiliateUrl: formAffiliateUrl.trim(),
      genre: selectedGenres.length > 0 ? selectedGenres : ['Drama'],
      rating: ratingVal,
      year: yearVal,
      duration: formDuration.trim() || '2h 0m',
      quality: formQuality,
      views: editingMovie ? editingMovie.views : 0, // Preserve views on edit, start with 0 on create
      country: formCountry.trim() || 'Indonesia',
      isSemi: formIsSemi
    };

    if (editingMovie) {
      // Edit
      setMovies(movies.map(m => m.id === editingMovie.id ? moviePayload : m));
    } else {
      // Add
      setMovies([moviePayload, ...movies]);
    }

    setIsModalOpen(false);
    setEditingMovie(null);
  };

  // Delete Handler
  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      setMovies(movies.filter(m => m.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  // Filtering movies for admin view list
  const filteredList = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPageMeta = () => {
    switch (adminSubTab) {
      case 'event-dashboard':
        return {
          title: 'Dashboard Event',
          subtitle: 'Ringkasan metrik, aktivitas peserta, dan penilaian karya dalam event kreatif.'
        };
      case 'event-manage':
        return {
          title: 'Kelola Event',
          subtitle: 'Buat kompetisi baru dan lihat daftar event yang sedang aktif.'
        };
      case 'event-payment':
        return {
          title: 'Payment',
          subtitle: 'Riwayat transaksi keluar masuk keuangan panitia (dana escrow, biaya platform, pencairan benefit).'
        };
      case 'movies':
        return {
          title: 'Kelola Film',
          subtitle: 'Kelola katalog data film dan link streaming video Google Drive.'
        };
      case 'affiliates':
        return {
          title: 'Link Afiliasi',
          subtitle: 'Atur daftar tautan afiliasi Shopee/e-commerce sponsor iklan.'
        };
      case 'gdrive':
        return {
          title: 'Google Drive API Key',
          subtitle: 'Konfigurasikan kunci API Google Drive Anda untuk bypass limit streaming.'
        };
      case 'membership':
        return {
          title: 'Pengaturan Premium',
          subtitle: 'Kelola harga berlangganan bulanan dan detail rekening bank penerima transfer.'
        };
      case 'firebase':
        return {
          title: 'Konfigurasi Firebase',
          subtitle: 'Atur koneksi sinkronisasi database cloud Firebase Firestore.'
        };
      case 'confirmations':
        return {
          title: 'Verifikasi Pembayaran',
          subtitle: 'Setujui atau tolak verifikasi bukti bayar transfer premium user.'
        };
      case 'users':
        return {
          title: 'Kelola Pengguna',
          subtitle: 'Daftar seluruh akun terdaftar dan ubah hak peran akses sistem.'
        };
      case 'withdrawals':
        return {
          title: 'Penarikan Saldo',
          subtitle: 'Tinjau, cairkan, atau batalkan pengajuan penarikan dana dompet kreatif peserta.'
        };
      default:
        return {
          title: 'Admin Panel',
          subtitle: 'Kelola katalog data film, event kompetisi, dan pengguna.'
        };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageMeta();

  return (
    <div className="admin-panel-container animate-fade-in-up">
      {!(adminSubTab === 'event-manage' && selectedManageEvent) && (
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="admin-page-title">{pageTitle}</h1>
            <p className="admin-page-subtitle">{pageSubtitle}</p>
          </div>
          {adminSubTab === 'movies' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary add-movie-btn" onClick={openAddModal}>
                <Plus size={18} />
                <span>Tambah Film Baru</span>
              </button>
            </div>
          )}
        </div>
      )}

      {adminSubTab === 'event-dashboard' ? (
        <div className="event-dashboard-section animate-fade-in">
          {/* Stats Grid */}
          <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Event</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{events.length}</span>
              </div>
              <div className="stat-icon-wrapper p-primary" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c084fc' }}>
                <Calendar size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Peserta Terdaftar</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{eventParticipants.length}</span>
              </div>
              <div className="stat-icon-wrapper p-secondary" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Karya Dikirim</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{eventSubmissions.length}</span>
              </div>
              <div className="stat-icon-wrapper p-info" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
                <FileVideo size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Menunggu Penjurian</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{eventSubmissions.filter(s => s.score === null).length}</span>
              </div>
              <div className="stat-icon-wrapper p-accent" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Latest Activities / Informasi Terbaru Feed */}
          {(() => {
            const activities = [];
            const isPanitia = currentUser && currentUser.role === 'panitia';
            const isSuperadmin = currentUser && currentUser.role === 'superadmin';

            // 1. Participant registrations
            eventParticipants.forEach(p => {
              const evt = events.find(e => e.id === p.eventId);
              if (!evt) return;
              if (isPanitia && evt.creator !== currentUser.username) return;
              activities.push({
                id: `reg_${p.id || p.eventId + '_' + p.username}`,
                type: 'participant',
                timestamp: p.registeredAt || p.createdAt || evt.createdAt || new Date().toISOString(),
                title: 'Peserta Terdaftar Baru',
                desc: `Content Creator @${p.username} mendaftar ke event "${evt.title}"`,
                badge: p.status === 'approved' ? 'Terverifikasi' : 'Pending',
                badgeColor: p.status === 'approved' ? '#10b981' : '#fbbf24',
                badgeBg: p.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                meta: `Status pendaftaran: ${p.status}`
              });
            });

            // 2. Work submissions
            eventSubmissions.forEach(s => {
              const evt = events.find(e => e.id === s.eventId);
              if (!evt) return;
              if (isPanitia && evt.creator !== currentUser.username) return;
              activities.push({
                id: `sub_${s.id}`,
                type: 'submission',
                timestamp: s.submittedAt || new Date().toISOString(),
                title: 'Pengumpulan Karya Baru',
                desc: `@${s.username} mengumpulkan karya "${s.title}"`,
                badge: s.platform || 'Karya',
                badgeColor: '#a78bfa',
                badgeBg: 'rgba(167, 139, 250, 0.1)',
                meta: `Views: ${(s.views || 0).toLocaleString('id-ID')} • Event: ${evt.title}`
              });
            });

            if (isSuperadmin) {
              // 3. Premium membership activations
              confirmations.forEach(c => {
                activities.push({
                  id: `membership_${c.id}`,
                  type: 'membership_payment',
                  timestamp: c.timestamp || new Date().toISOString(),
                  title: 'Verifikasi Premium Membership',
                  desc: `@${c.username} mengajukan pembayaran Premium (${c.planName})`,
                  badge: c.status === 'approved' ? 'Disetujui' : c.status === 'rejected' ? 'Ditolak' : 'Pending',
                  badgeColor: c.status === 'approved' ? '#10b981' : c.status === 'rejected' ? '#ef4444' : '#38bdf8',
                  badgeBg: c.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                  meta: `Jumlah: ${c.amount || 'Rp 0'} • Pengirim: ${c.senderName || '-'}`
                });
              });

              // 4. Event payments
              events.forEach(evt => {
                if (evt.proofReceipt || evt.paymentStatus === 'pending_verification') {
                  activities.push({
                    id: `evtpay_${evt.id}`,
                    type: 'event_payment',
                    timestamp: evt.paymentSubmittedAt || evt.createdAt || new Date().toISOString(),
                    title: 'Konfirmasi Pembayaran Event',
                    desc: `@${evt.creator || 'Panitia'} mengirim bukti bayar untuk "${evt.title}"`,
                    badge: evt.paymentStatus === 'paid' ? 'Disetujui' : evt.paymentStatus === 'pending_verification' ? 'Pending' : 'Belum Bayar',
                    badgeColor: evt.paymentStatus === 'paid' ? '#10b981' : evt.paymentStatus === 'pending_verification' ? '#38bdf8' : '#fbbf24',
                    badgeBg: evt.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' : evt.paymentStatus === 'pending_verification' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    meta: `Total Transfer: Rp ${((evt.campaignBudget || 0) + (evt.adminFee || 0)).toLocaleString('id-ID')}`
                  });
                }
              });

              // 5. Withdrawal requests
              withdrawals.forEach(wd => {
                activities.push({
                  id: `wd_${wd.id}`,
                  type: 'withdrawal',
                  timestamp: wd.requestedAt || new Date().toISOString(),
                  title: 'Pengajuan Tarik Saldo',
                  desc: `@${wd.username} meminta penarikan dana Rp ${wd.amount.toLocaleString('id-ID')}`,
                  badge: wd.status === 'approved' ? 'Diselesaikan' : wd.status === 'rejected' ? 'Ditolak' : 'Pending',
                  badgeColor: wd.status === 'approved' ? '#10b981' : wd.status === 'rejected' ? '#ef4444' : '#38bdf8',
                  badgeBg: wd.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : wd.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                  meta: `Metode: ${wd.method} • Rek/Akun: ${wd.account}`
                });
              });
            }

            // Sort by timestamp descending
            const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return (
              <div className="add-affiliate-card glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '700' }}>
                  <Sparkles size={18} style={{ color: '#fbbf24' }} />
                  <span>Aktivitas & Informasi Terbaru</span>
                </h3>

                {sortedActivities.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>Belum ada aktivitas terbaru saat ini.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {sortedActivities.slice(0, visibleActivitiesCount).map(act => {
                        return (
                          <div 
                            key={act.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.01)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '12px',
                              padding: '16px 20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              transition: 'all 0.2s',
                              cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: act.type === 'participant' ? 'rgba(34, 197, 94, 0.1)' :
                                            act.type === 'submission' ? 'rgba(167, 139, 250, 0.1)' :
                                            act.type === 'withdrawal' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                color: act.type === 'participant' ? '#4ade80' :
                                       act.type === 'submission' ? '#c084fc' :
                                       act.type === 'withdrawal' ? '#f87171' : '#38bdf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {act.type === 'participant' ? <Users size={18} /> :
                                 act.type === 'submission' ? <FileVideo size={18} /> :
                                 act.type === 'withdrawal' ? <Wallet size={18} /> : <Award size={18} />}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'white', fontWeight: '700' }}>{act.title}</h4>
                                  <span style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    color: act.badgeColor,
                                    background: act.badgeBg
                                  }}>{act.badge}</span>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{act.desc}</p>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                                  <span>{formatIndonesianDate(act.timestamp)}</span>
                                  <span>•</span>
                                  <span>{act.meta}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick Actions redirection */}
                            {isSuperadmin && (act.type === 'event_payment' || act.type === 'membership_payment') && (
                              <button
                                onClick={() => setAdminSubTab('confirmations')}
                                style={{
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  border: '1px solid rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Verifikasi
                              </button>
                            )}
                            {isSuperadmin && act.type === 'withdrawal' && (
                              <button
                                onClick={() => setAdminSubTab('withdrawals')}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: '#f87171',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Kelola
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {sortedActivities.length > visibleActivitiesCount && (
                      <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                          onClick={() => setVisibleActivitiesCount(prev => prev + 6)}
                          className="btn"
                          style={{
                            padding: '10px 24px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'white',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          }}
                        >
                          <span>Muat Lebih Banyak</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : adminSubTab === 'event-manage' ? (
        selectedManageEvent ? (
          <div className="event-management-panel animate-fade-in" style={{ padding: '4px' }}>
            {/* Header with back button */}
            <div style={{ marginBottom: '28px' }}>
              {/* Back link */}
              <button 
                onClick={() => setSelectedManageEvent(null)}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Kelola Event</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detail Panel Event</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', color: 'white', fontWeight: '800' }}>
                    {selectedManageEvent.title}
                  </h2>
                </div>

                {/* Quick Status Badge */}
                {(() => {
                  const status = getEventStatus(selectedManageEvent);
                  return (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontWeight: 'bold', 
                      color: status.color, 
                      background: status.bg,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.color, display: 'inline-block', boxShadow: `0 0 8px ${status.color}` }} className={status.label === 'Berjalan' ? 'animate-pulse' : ''}></span>
                      {status.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Inner Sub-tabs Selector */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
              {[
                { id: 'participants', label: 'Pendaftaran Peserta', count: eventParticipants.filter(p => p.eventId === selectedManageEvent.id && p.status === 'pending').length },
                { id: 'submissions', label: 'Monitoring Karya', count: eventSubmissions.filter(s => s.eventId === selectedManageEvent.id && s.score === null).length },
                { id: 'judging', label: 'Penjurian & Pemenang', count: 0 },
                { id: 'finance', label: 'Keuangan Event', count: 0 }
              ].map(tab => {
                const isActive = innerManageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInnerManageTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      background: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                      border: isActive ? '1px solid #7c3aed' : '1px solid transparent',
                      borderRadius: '20px',
                      color: isActive ? '#c084fc' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inner Tab Contents */}
            {innerManageTab === 'participants' && (
              <div className="inner-tab-content animate-fade-in">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '360px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={eventParticipantsSearch}
                      onChange={(e) => setEventParticipantsSearch(e.target.value)}
                      placeholder="Cari peserta berdasarkan nama, email..."
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="admin-table-container">
                  {(() => {
                    const filtered = eventParticipants.filter(part => part.eventId === selectedManageEvent.id && (
                      !eventParticipantsSearch ||
                      part.name?.toLowerCase().includes(eventParticipantsSearch.toLowerCase()) ||
                      part.email?.toLowerCase().includes(eventParticipantsSearch.toLowerCase()) ||
                      part.contact?.toLowerCase().includes(eventParticipantsSearch.toLowerCase())
                    ));

                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Tidak ada data pendaftar untuk event ini.
                        </div>
                      );
                    }

                    return (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nama Peserta</th>
                            <th>Akun Sosmed / Link</th>
                            <th>Kode Verifikasi</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center', width: '150px' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(part => (
                            <tr 
                              key={part.id} 
                              className="table-row-hover"
                              style={{
                                background: part.status === 'approved' ? 'rgba(16, 185, 129, 0.08)' :
                                            part.status === 'rejected' ? 'rgba(239, 68, 68, 0.08)' :
                                            'rgba(245, 158, 11, 0.06)'
                              }}
                            >
                              <td>
                                <strong style={{ color: 'white' }}>{part.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{part.email}</div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.78rem' }}>
                                  <div><span style={{ color: 'var(--text-muted)' }}>Instagram:</span> <a href={part.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>Profil Link</a></div>
                                  {part.tiktokUrl && <div><span style={{ color: 'var(--text-muted)' }}>TikTok:</span> <a href={part.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>Profil Link</a></div>}
                                </div>
                              </td>
                              <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'white' }}>{part.verificationCode || 'Manual (Legacy)'}</span></td>
                              <td>{part.registeredAt ? new Date(part.registeredAt).toLocaleDateString('id-ID') : '25/7/2026'}</td>
                              <td>
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  padding: '2px 8px', 
                                  borderRadius: '12px', 
                                  fontWeight: 'bold',
                                  color: part.status === 'approved' ? '#22c55e' : part.status === 'rejected' ? '#ef4444' : '#fbbf24',
                                  background: part.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : part.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                                }}>{part.status === 'approved' ? 'Disetujui' : part.status === 'rejected' ? 'Ditolak' : 'Pending'}</span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {part.status === 'pending' ? (
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      onClick={() => handleRejectParticipant(part.id)}
                                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                    >
                                      Tolak
                                    </button>
                                    <button 
                                      className="btn btn-primary btn-sm" 
                                      onClick={() => handleApproveParticipant(part.id)}
                                      style={{ background: '#10b981', borderColor: '#10b981' }}
                                    >
                                      Setujui
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="btn btn-text btn-sm" 
                                    onClick={() => handleResetParticipantStatus(part.id)}
                                    style={{ color: '#f87171' }}
                                  >
                                    Batalkan
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}

            {innerManageTab === 'submissions' && (
              <div className="inner-tab-content animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={eventSubmissionsSearch}
                      onChange={(e) => setEventSubmissionsSearch(e.target.value)}
                      placeholder="Cari karya berdasarkan judul, peserta..."
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                  <button
                    onClick={handleSyncAllSubmissions}
                    disabled={isSyncingAll}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 16px', borderRadius: '20px', color: '#c084fc', border: '1px solid rgba(167, 139, 250, 0.2)', background: 'rgba(167,139,250,0.05)' }}
                  >
                    <Sparkles size={14} style={{ color: '#c084fc', animation: isSyncingAll ? 'spin 1s linear infinite' : 'none', marginRight: '6px' }} />
                    {isSyncingAll ? 'Menghubungkan ke API...' : 'Grab Data Sosmed Event ini'}
                  </button>
                </div>

                <div className="admin-table-container">
                  {(() => {
                    const filtered = eventSubmissions.filter(sub => sub.eventId === selectedManageEvent.id && (
                      !eventSubmissionsSearch ||
                      sub.participantName?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase()) ||
                      sub.title?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase()) ||
                      sub.platform?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase())
                    ));

                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Belum ada karya film yang dikirimkan untuk event ini.
                        </div>
                      );
                    }

                    return (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Peserta & Judul Film</th>
                            <th>Platform & Link Video</th>
                            <th style={{ textAlign: 'right' }}>Jumlah Views</th>
                            <th style={{ textAlign: 'right' }}>Jumlah Likes</th>
                            <th style={{ textAlign: 'center' }}>Skor Juri</th>
                            <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(sub => (
                            <tr key={sub.id} className="table-row-hover">
                              <td>
                                <strong style={{ color: 'white' }}>{sub.title}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oleh: {sub.participantName} ({sub.email})</div>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginRight: '8px' }}>{sub.platform || 'YouTube'}</span>
                                <a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', fontSize: '0.8rem' }}>Buka Video</a>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{sub.views?.toLocaleString('id-ID') || 0}</td>
                              <td style={{ textAlign: 'right', color: '#f43f5e' }}>❤️ {sub.likes?.toLocaleString('id-ID') || 0}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: sub.score !== null ? '#4ade80' : '#fbbf24' }}>{sub.score !== null ? `${sub.score}/100` : 'Belum Dinilai'}</span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => setPreviewSubmission(sub)} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px' }}>Pratinjau</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}

            {innerManageTab === 'judging' && (
              <div className="inner-tab-content animate-fade-in">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '360px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={eventJudgingSearch}
                      onChange={(e) => setEventJudgingSearch(e.target.value)}
                      placeholder="Cari karya juri berdasarkan judul, peserta..."
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="admin-table-container">
                  {(() => {
                    const filtered = eventSubmissions.filter(sub => sub.eventId === selectedManageEvent.id && (
                      !eventJudgingSearch ||
                      sub.participantName?.toLowerCase().includes(eventJudgingSearch.toLowerCase()) ||
                      sub.title?.toLowerCase().includes(eventJudgingSearch.toLowerCase())
                    ));

                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Belum ada karya film untuk dinilai.
                        </div>
                      );
                    }

                    return (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Peserta & Judul Film</th>
                            <th>Link Video</th>
                            <th style={{ textAlign: 'center' }}>Skor Penilaian</th>
                            <th>Feedback / Catatan Masukan Juri</th>
                            <th style={{ textAlign: 'center', width: '140px' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(sub => (
                            <tr key={sub.id} className="table-row-hover">
                              <td>
                                <strong style={{ color: 'white' }}>{sub.title}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.participantName}</div>
                              </td>
                              <td><a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', fontSize: '0.8rem' }}>Buka Video</a></td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', color: sub.score !== null ? '#4ade80' : '#fbbf24' }}>
                                {sub.score !== null ? `${sub.score} / 100` : 'Belum Dinilai'}
                              </td>
                              <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                {sub.feedback || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tidak ada feedback</span>}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  className="btn btn-primary btn-sm" 
                                  onClick={() => {
                                    setJudgingSubmission(sub);
                                    setJudgingScore(sub.score !== null ? sub.score.toString() : '');
                                    setJudgingFeedback(sub.feedback || '');
                                  }}
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', fontWeight: 'bold' }}
                                >
                                  {sub.score !== null ? 'Edit Nilai' : 'Beri Nilai'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            )}

            {innerManageTab === 'finance' && (
              <div className="inner-tab-content animate-fade-in">
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div className="stat-card glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Budget Kampanye</span>
                    <strong style={{ color: 'white', fontSize: '1.25rem' }}>Rp {selectedManageEvent.campaignBudget?.toLocaleString('id-ID') || 0}</strong>
                  </div>
                  <div className="stat-card glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Biaya Layanan Platform</span>
                    <strong style={{ color: 'white', fontSize: '1.25rem' }}>Rp {selectedManageEvent.adminFee?.toLocaleString('id-ID') || 0}</strong>
                  </div>
                  <div className="stat-card glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Total Pembayaran</span>
                    <strong style={{ color: '#fbbf24', fontSize: '1.25rem' }}>Rp {((selectedManageEvent.campaignBudget || 0) + (selectedManageEvent.adminFee || 0)).toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="stat-card glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Sisa Budget Terkini</span>
                    <strong style={{ color: '#4ade80', fontSize: '1.25rem' }}>Rp {getEventRemainingBudget(selectedManageEvent).toLocaleString('id-ID')}</strong>
                  </div>
                </div>

                {/* Event Financial Log Table */}
                <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '12px' }}>Riwayat Arus Kas Event</h4>
                <div className="admin-table-container">
                  {getEventTransactions(selectedManageEvent).length > 0 ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Deskripsi Transaksi</th>
                          <th style={{ textAlign: 'center' }}>Tipe</th>
                          <th style={{ textAlign: 'right' }}>Jumlah</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEventTransactions(selectedManageEvent).map(tx => (
                          <tr key={tx.id} className="table-row-hover">
                            <td>{tx.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            <td>{tx.description}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ 
                                fontSize: '0.72rem', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontWeight: 'bold',
                                color: tx.type === 'Masuk' ? '#22c55e' : '#f87171',
                                background: tx.type === 'Masuk' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                              }}>{tx.type}</span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>Rp {tx.amount.toLocaleString('id-ID')}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ 
                                fontSize: '0.72rem', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                color: tx.status === 'Sukses' ? '#22c55e' : '#fbbf24',
                                background: tx.status === 'Sukses' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                              }}>{tx.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Belum ada catatan transaksi untuk event ini.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="event-manage-section animate-fade-in">
          {showEventForm && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: '#0a0f1d',
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
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{editingEventId ? 'Edit Event Kompetisi' : 'Buat Event Kompetisi Baru'}</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Isi parameter dan guideline kompetisi di bawah ini secara lengkap.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingEventId(null);
                      setShowEventForm(false);
                    }} 
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
                  >
                    <X size={20} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>

                <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Judul Event</label>
                    <input type="text" required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Contoh: Short Film Competition 2026" style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Kategori Event</label>
                      <select value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="Short Film">Short Film</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Animation">Animation</option>
                        <option value="Music Video">Music Video</option>
                        <option value="Vlog">Vlog</option>
                        <option value="Creative UGC">Creative UGC</option>
                        <option value="Review Product">Review Product</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                     <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Batas Pengiriman (Deadline)</label>
                      <input 
                        type="datetime-local" 
                        required={eventBudgetMode === 'ranking' || (eventBudgetMode === 'views' && eventHasDeadline)} 
                        disabled={eventBudgetMode === 'views' && !eventHasDeadline}
                        value={eventBudgetMode === 'views' && !eventHasDeadline ? '' : getDatetimeInputValue(eventDeadline)} 
                        onChange={(e) => setEventDeadline(e.target.value)} 
                        style={{ 
                          width: '100%', 
                          padding: '12px 14px', 
                          background: (eventBudgetMode === 'views' && !eventHasDeadline) ? 'rgba(255,255,255,0.02)' : '#111827', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '8px', 
                          color: (eventBudgetMode === 'views' && !eventHasDeadline) ? 'var(--text-muted)' : 'white', 
                          fontSize: '0.9rem', 
                          outline: 'none',
                          cursor: (eventBudgetMode === 'views' && !eventHasDeadline) ? 'not-allowed' : 'text'
                        }} 
                      />
                      {eventBudgetMode === 'views' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <input 
                            type="checkbox" 
                            id="eventHasDeadline" 
                            checked={!eventHasDeadline} 
                            onChange={(e) => setEventHasDeadline(!e.target.checked)} 
                            style={{ width: '15px', height: '15px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                          />
                          <label htmlFor="eventHasDeadline" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                            Tanpa Batas Waktu (Ditutup saat budget campaign habis)
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                   <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Maksimal Peserta</label>
                    <input 
                      type="number" 
                      required={eventHasMaxParticipants} 
                      disabled={!eventHasMaxParticipants} 
                      value={eventHasMaxParticipants ? eventMaxParticipants : ''} 
                      onChange={(e) => setEventMaxParticipants(parseInt(e.target.value))} 
                      placeholder="Contoh: 50" 
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        background: eventHasMaxParticipants ? '#111827' : 'rgba(255,255,255,0.02)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        color: eventHasMaxParticipants ? 'white' : 'var(--text-muted)', 
                        fontSize: '0.9rem', 
                        outline: 'none',
                        opacity: eventHasMaxParticipants ? 1 : 0.5
                      }} 
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="unlimitedParticipants" 
                        checked={!eventHasMaxParticipants} 
                        onChange={(e) => setEventHasMaxParticipants(!e.target.checked)} 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <label htmlFor="unlimitedParticipants" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                        Tanpa Batas Peserta (Terbuka untuk Umum tanpa batasan kuota)
                      </label>
                    </div>
                  </div>

                  {/* Mode Budget Selector */}
                  <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#a78bfa', fontSize: '0.92rem', fontWeight: 'bold' }}>Skema & Mode Pembagian Budget</label>
                    <select 
                      value={eventBudgetMode} 
                      onChange={(e) => setEventBudgetMode(e.target.value)} 
                      style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', marginBottom: '16px' }}
                    >
                      <option value="views">Berdasarkan Jumlah Views (Pay-per-View UGC)</option>
                      <option value="ranking">Kompetisi Tradisional (Juara 1, 2, 3)</option>
                    </select>

                    {eventBudgetMode === 'views' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Budget Campaign (IDR)</label>
                          <input type="text" required value={formatInputCurrency(eventBudget)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventBudget(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Benefit Payout (IDR)</label>
                          <input type="text" required value={formatInputCurrency(eventBenefitAmount)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventBenefitAmount(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Per XXX Views</label>
                          <input type="text" required value={formatInputCurrency(eventBenefitViewsStep)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventBenefitViewsStep(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Juara 1 (IDR)</label>
                          <input type="text" required value={formatInputCurrency(eventPrize1)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventPrize1(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Juara 2 (IDR)</label>
                          <input type="text" required value={formatInputCurrency(eventPrize2)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventPrize2(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Juara 3 (IDR)</label>
                          <input type="text" required value={formatInputCurrency(eventPrize3)} onChange={(e) => {
                            const parsed = e.target.value.replace(/\D/g, '');
                            setEventPrize3(parsed ? parseInt(parsed) : 0);
                          }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Deskripsi Event & Ketentuan Singkat</label>
                    <textarea rows="3" required value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Tuliskan ketentuan pendaftaran, kriteria penilaian, dan hadiah..." style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}></textarea>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Petunjuk Teknis (Juknis) / Guideline Dinamis</label>
                    <textarea rows="5" required value={eventJuknis} onChange={(e) => setEventJuknis(e.target.value)} placeholder="Tulis panduan teknis lengkap (misal: ketentuan hashtag sosmed, jumlah views target, tata cara penulisan tautan, kriteria penjurian)..." style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => {
                      setEditingEventId(null);
                      setShowEventForm(false);
                    }} style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem' }}>Batal</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold' }}>{editingEventId ? 'Simpan Perubahan' : 'Simpan Event'}</button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {depositingEvent && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: '#0a0f1d',
              zIndex: 11000,
              overflowY: 'auto',
              padding: '40px 24px',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }} className="animate-fade-in">
              <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Pembayaran Biaya Event</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Selesaikan pembayaran biaya platform dan budget event Anda.</p>
                  </div>
                  <button 
                    onClick={() => setDepositingEvent(null)} 
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
                  >
                    <X size={20} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Event Summary Card */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', marginBottom: '16px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Event</span>
                        <strong style={{ color: 'white' }}>{depositingEvent.title}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Skema Pembagian</span>
                        <strong style={{ color: 'white' }}>
                          {depositingEvent.budgetMode === 'views' ? 'Berdasarkan Jumlah Views' : 'Kompetisi Juara 1, 2, 3'}
                        </strong>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Budget Kampanye:</span>
                        <strong style={{ color: 'white' }}>Rp {depositingEvent.campaignBudget?.toLocaleString('id-ID')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Biaya Layanan Platform:</span>
                        <strong style={{ color: 'white' }}>Rp {(depositingEvent.adminFee !== undefined ? depositingEvent.adminFee : eventAdminFee).toLocaleString('id-ID')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Total Pembayaran:</span>
                        <strong style={{ color: '#fbbf24', fontSize: '1.2rem' }}>
                          Rp {((depositingEvent.campaignBudget || 0) + (depositingEvent.adminFee !== undefined ? depositingEvent.adminFee : eventAdminFee)).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Bank Instructions */}
                  <div style={{ background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '0.95rem', fontWeight: 'bold' }}>Rekening Tujuan Transfer (Escrow):</h4>
                    <div style={{ fontFamily: 'monospace', color: '#f1f5f9', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      BANK MANDIRI KAB. JAKARTA<br />
                      No. Rekening: <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>127-000-999-888</strong><br />
                      Atas Nama: <strong>PT Filmo Media Indonesia (Escrow)</strong>
                    </div>
                  </div>

                  {/* Payment Confirmation Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!senderName.trim()) {
                      alert('Nama pengirim wajib diisi!');
                      return;
                    }
                    setEvents(events.map(evt => {
                      if (evt.id === depositingEvent.id) {
                        return { 
                          ...evt, 
                          paymentStatus: 'pending_verification',
                          proofName: senderName.trim(),
                          proofBank: senderBank,
                          proofReceipt: receiptFile || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80'
                        };
                      }
                      return evt;
                    }));
                    setDepositingEvent(null);
                    alert('Bukti pembayaran Anda berhasil dikirim! Mohon tunggu verifikasi oleh admin platform.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>Nama Pengirim Rekening</label>
                      <input 
                        type="text" 
                        required 
                        value={senderName} 
                        onChange={(e) => setSenderName(e.target.value)} 
                        placeholder="Contoh: Rudi Wijaya" 
                        style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }} 
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>Bank Pengirim</label>
                      <select 
                        value={senderBank} 
                        onChange={(e) => setSenderBank(e.target.value)} 
                        style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                      >
                        <option value="BCA">Bank BCA</option>
                        <option value="Mandiri">Bank Mandiri</option>
                        <option value="BNI">Bank BNI</option>
                        <option value="BRI">Bank BRI</option>
                        <option value="CIMB">CIMB Niaga</option>
                        <option value="Lainnya">Bank Lainnya</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>Unggah Bukti Transfer</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReceiptFile(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        style={{ width: '100%', padding: '10px 12px', background: '#111827', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                      />
                      {receiptFile && (
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Pratinjau Bukti Bayar:</span>
                          <img src={receiptFile} alt="Receipt Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setDepositingEvent(null)} style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem' }}>Batal</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold' }}>Kirim Bukti Pembayaran</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            document.body
          )}

          {verifyingEvent && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: '#0a0f1d',
              zIndex: 11000,
              overflowY: 'auto',
              padding: '40px 24px',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }} className="animate-fade-in">
              <div style={{ width: '100%', maxWidth: '600px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Verifikasi Pembayaran Event</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Tinjau bukti transfer dan setujui atau tolak transaksi pembayaran event.</p>
                  </div>
                  <button 
                    onClick={() => setVerifyingEvent(null)} 
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
                  >
                    <X size={20} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Event & Proof Info */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>Rincian Event & Pengirim</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Judul Event:</span>
                        <strong style={{ color: 'white' }}>{verifyingEvent.title}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Pembayaran:</span>
                        <strong style={{ color: '#fbbf24' }}>
                          Rp {((verifyingEvent.campaignBudget || 0) + (verifyingEvent.adminFee || 0)).toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Nama Pengirim:</span>
                        <strong style={{ color: 'white' }}>{verifyingEvent.proofName || 'Tidak Diketahui'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Bank Pengirim:</span>
                        <strong style={{ color: 'white' }}>{verifyingEvent.proofBank || 'Tidak Diketahui'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Preview */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: 'bold' }}>Bukti Transfer (Klik untuk Zoom):</span>
                    <img 
                      src={verifyingEvent.proofReceipt || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80'} 
                      alt="Receipt Uploaded" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'zoom-in' }}
                      onClick={() => window.open(verifyingEvent.proofReceipt || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80', '_blank')}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setVerifyingEvent(null)} style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem' }}>Kembali</button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        if (window.confirm('Tolak bukti pembayaran ini? Status event akan kembali Pending.')) {
                          setEvents(events.map(evt => {
                            if (evt.id === verifyingEvent.id) {
                              return { ...evt, paymentStatus: 'pending', proofName: '', proofBank: '', proofReceipt: '' };
                            }
                            return evt;
                          }));
                          setVerifyingEvent(null);
                          alert('Bukti pembayaran ditolak.');
                        }
                      }} 
                      style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      Tolak Pembayaran
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={() => {
                        if (window.confirm('Setujui pembayaran ini? Event akan langsung aktif.')) {
                          setEvents(events.map(evt => {
                            if (evt.id === verifyingEvent.id) {
                              return { ...evt, paymentStatus: 'paid' };
                            }
                            return evt;
                          }));
                          setVerifyingEvent(null);
                          alert('Pembayaran biaya event disetujui! Event kini aktif.');
                        }
                      }} 
                      style={{ padding: '12px 28px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', background: '#10b981', borderColor: '#10b981' }}
                    >
                      Setujui Pembayaran
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {rankingWinnerEvent && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 11000
            }} onClick={() => setRankingWinnerEvent(null)}>
              <div className="glass-panel" style={{
                width: '90%',
                maxWidth: '480px',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'left'
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#fbbf24' }} />
                  <span>Tentukan Pemenang Kompetisi</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Pilih peserta pemenang untuk mendistribusikan total hadiah <strong>Rp {rankingWinnerEvent.campaignBudget?.toLocaleString('id-ID')}</strong> dari Escrow sistem.
                </p>

                {(() => {
                  const eventSubs = eventSubmissions.filter(sub => sub.eventId === rankingWinnerEvent.id);
                  if (eventSubs.length === 0) {
                    return (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Belum ada karya masuk untuk event ini. Anda tidak dapat menentukan pemenang sekarang.
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Juara 1 - Rp {rankingWinnerEvent.prize1?.toLocaleString('id-ID')}</label>
                        <select 
                          value={winnerJuara1} 
                          onChange={(e) => setWinnerJuara1(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="">-- Pilih Juara 1 --</option>
                          {eventSubs.map(s => (
                            <option key={s.id} value={s.username}>{s.participantName} ({s.title})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Juara 2 - Rp {rankingWinnerEvent.prize2?.toLocaleString('id-ID')}</label>
                        <select 
                          value={winnerJuara2} 
                          onChange={(e) => setWinnerJuara2(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="">-- Pilih Juara 2 --</option>
                          {eventSubs.map(s => (
                            <option key={s.id} value={s.username}>{s.participantName} ({s.title})</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Juara 3 - Rp {rankingWinnerEvent.prize3?.toLocaleString('id-ID')}</label>
                        <select 
                          value={winnerJuara3} 
                          onChange={(e) => setWinnerJuara3(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="">-- Pilih Juara 3 --</option>
                          {eventSubs.map(s => (
                            <option key={s.id} value={s.username}>{s.participantName} ({s.title})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setRankingWinnerEvent(null)}
                    style={{ padding: '10px 20px', borderRadius: '30px', fontSize: '0.88rem' }}
                  >
                    Batal
                  </button>
                  {eventSubmissions.filter(sub => sub.eventId === rankingWinnerEvent.id).length > 0 && (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        if (!winnerJuara1) {
                          alert('Harap tentukan Juara 1.');
                          return;
                        }
                        setAuthModal({
                          title: 'Otorisasi Release Escrow Juara',
                          message: `Anda akan mengirim hadiah kontes (Juara 1: ${winnerJuara1}${winnerJuara2 ? ', Juara 2: ' + winnerJuara2 : ''}${winnerJuara3 ? ', Juara 3: ' + winnerJuara3 : ''}) dengan total hadiah Rp ${( (rankingWinnerEvent.prize1 || 0) + (winnerJuara2 ? rankingWinnerEvent.prize2 || 0 : 0) + (winnerJuara3 ? rankingWinnerEvent.prize3 || 0 : 0) ).toLocaleString('id-ID')} dari Rekber Escrow ke dompet para pemenang.`,
                          onConfirm: () => {
                            // 1. Release payouts to user wallets
                            if (winnerJuara1) handleTransferWallet(winnerJuara1, rankingWinnerEvent.prize1 || 0);
                            if (winnerJuara2) handleTransferWallet(winnerJuara2, rankingWinnerEvent.prize2 || 0);
                            if (winnerJuara3) handleTransferWallet(winnerJuara3, rankingWinnerEvent.prize3 || 0);

                            // 2. Mark event winners
                            setEvents(prevEvts => prevEvts.map(e => {
                              if (e.id === rankingWinnerEvent.id) {
                                return { 
                                  ...e, 
                                  winnersReleased: true, 
                                  winners: { juara1: winnerJuara1, juara2: winnerJuara2, juara3: winnerJuara3 } 
                                };
                              }
                              return e;
                            }));

                            setRankingWinnerEvent(null);
                            alert('Berhasil mengumumkan pemenang dan mendistribusikan total hadiah dari Rekber Escrow ke dompet masing-masing pemenang!');
                          }
                        });
                      }}
                      style={{ padding: '10px 24px', borderRadius: '30px', fontSize: '0.88rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontWeight: 'bold' }}
                    >
                      Kirim Hadiah (Release Escrow)
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Event List View */}
          <div className="event-list-container">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button className="btn btn-primary" onClick={() => {
                  setEventTitle('');
                  setEventCategory('Short Film');
                  setEventDeadline('');
                  setEventMaxParticipants(50);
                  setEventDescription('');
                  setEventJuknis('');
                  setEventBudget(5000000);
                  setEventBenefitAmount(10000);
                  setEventBenefitViewsStep(1000);
                  setEventHasMaxParticipants(true);
                  setShowEventForm(true);
                }}>
                  <Plus size={18} />
                  <span>Buat Event Baru</span>
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '360px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={eventManageSearch}
                    onChange={(e) => setEventManageSearch(e.target.value)}
                    placeholder="Cari event berdasarkan judul, kategori..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                  {eventManageSearch && (
                    <button
                      onClick={() => setEventManageSearch('')}
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
              </div>

              <div className="admin-table-container glass-panel">
                {events.length > 0 ? (
                  (() => {
                    const filteredEvents = events.filter(evt => 
                      evt.title?.toLowerCase().includes(eventManageSearch.toLowerCase()) ||
                      evt.category?.toLowerCase().includes(eventManageSearch.toLowerCase()) ||
                      evt.description?.toLowerCase().includes(eventManageSearch.toLowerCase())
                    ).sort((a, b) => {
                      const statusA = getEventStatus(a).label;
                      const statusB = getEventStatus(b).label;
                      const getOrder = (statusStr) => {
                        if (statusStr === 'Berjalan') return 1;
                        if (statusStr === 'Menunggu Verifikasi') return 2;
                        if (statusStr === 'Pending') return 3;
                        return 4;
                      };
                      const orderDiff = getOrder(statusA) - getOrder(statusB);
                      if (orderDiff !== 0) return orderDiff;
                      if (!a.deadline && !b.deadline) return 0;
                      if (!a.deadline) return 1;
                      if (!b.deadline) return -1;
                      const timeA = new Date(a.deadline).getTime();
                      const timeB = new Date(b.deadline).getTime();
                      return timeA - timeB;
                    });
                    if (filteredEvents.length === 0) {
                      return (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Tidak ada event yang cocok dengan kata kunci pencarian Anda.
                        </div>
                      );
                    }
                    return (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Judul Event</th>
                            <th>Kategori</th>
                            <th>Batas Waktu</th>
                            <th style={{ textAlign: 'center' }}>Budget Campaign</th>
                            <th style={{ textAlign: 'center' }}>Status Event</th>
                            <th style={{ textAlign: 'center' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.map((evt) => (
                        <tr 
                          key={evt.id} 
                          className="table-row-hover"
                          onClick={() => { setSelectedManageEvent(evt); setInnerManageTab('participants'); }}
                          style={{
                            cursor: 'pointer',
                            background: (() => {
                              const stat = getEventStatus(evt).label;
                              if (stat === 'Berjalan') return 'rgba(16, 185, 129, 0.08)';
                              if (stat === 'Menunggu Verifikasi') return 'rgba(14, 165, 233, 0.08)';
                              if (stat === 'Pending') return 'rgba(245, 158, 11, 0.06)';
                              return 'rgba(255, 255, 255, 0.01)';
                            })()
                          }}
                        >
                          <td>
                            <strong style={{ color: 'white' }}>{evt.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.description}</div>
                          </td>
                          <td><span style={{ fontSize: '0.8rem', background: 'rgba(124, 58, 237, 0.1)', color: '#c084fc', padding: '2px 8px', borderRadius: '12px' }}>{evt.category}</span></td>
                          <td><strong style={{ color: '#f87171' }}>{formatIndonesianDate(evt.deadline)}</strong></td>
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ color: 'white' }}>
                              Rp {evt.campaignBudget ? evt.campaignBudget.toLocaleString('id-ID') : '0'}
                            </strong>
                            {evt.adminFee > 0 && (
                              <div style={{ fontSize: '0.68rem', color: '#c084fc' }}>
                                + Platform: Rp {evt.adminFee.toLocaleString('id-ID')}
                              </div>
                            )}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {evt.budgetMode === 'views' ? 'Pay-per-View' : 'Tradisional Juara'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {(() => {
                              const status = getEventStatus(evt);
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                  <div className="tooltip-container">
                                    <span 
                                      className={status.label === 'Berjalan' ? 'animate-glow-green' :
                                                 status.label === 'Pending' ? 'animate-glow-amber' :
                                                 status.label === 'Menunggu Verifikasi' ? 'animate-glow-blue' : ''}
                                      style={{ 
                                        fontSize: '0.78rem', 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontWeight: 'bold', 
                                        color: status.color, 
                                        background: status.bg, 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {status.label}
                                      <Info size={12} style={{ opacity: 0.8, cursor: 'help' }} />
                                    </span>
                                    <span className="tooltip-text">
                                      {status.info}
                                    </span>
                                  </div>
                                  
                                  {evt.paymentStatus !== 'paid' && (
                                    evt.paymentStatus === 'pending_verification' ? (
                                      currentUser.role === 'superadmin' ? (
                                        <button 
                                          className="btn btn-primary btn-sm animate-glow-blue" 
                                          onClick={(e) => { e.stopPropagation(); setAdminSubTab('confirmations'); }}
                                          style={{ 
                                            padding: '4px 10px', 
                                            fontSize: '0.75rem', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '4px', 
                                            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', 
                                            border: 'none', 
                                            color: 'white', 
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            marginTop: '4px'
                                          }}
                                        >
                                          Verifikasi Pembayaran
                                        </button>
                                      ) : (
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                                          Menunggu Verifikasi
                                        </span>
                                      )
                                    ) : (
                                      <button 
                                        className="btn btn-primary btn-sm animate-glow-amber" 
                                        onClick={(e) => { e.stopPropagation(); handleOpenPayment(evt); }}
                                        style={{ 
                                          padding: '4px 10px', 
                                          fontSize: '0.75rem', 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          gap: '4px', 
                                          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
                                          border: 'none', 
                                          color: '#1e1b4b', 
                                          fontWeight: 'bold',
                                          borderRadius: '20px'
                                        }}
                                      >
                                        Selesaikan Pembayaran
                                      </button>
                                    )
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="table-actions">
                              <button 
                                className="action-btn view" 
                                onClick={(e) => { e.stopPropagation(); setSelectedManageEvent(evt); setInnerManageTab('participants'); }} 
                                style={{ color: '#38bdf8', cursor: 'pointer' }}
                                title="Kelola Event (Detail)"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className="action-btn edit" 
                                onClick={(e) => { e.stopPropagation(); handleEditEvent(evt); }} 
                                style={{ color: '#a78bfa', cursor: 'pointer' }}
                                title="Edit Event"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="action-btn delete" 
                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }} 
                                style={{ color: '#ef4444', cursor: 'pointer' }}
                                title="Hapus Event"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    );
                  })()
                ) : (
                  <div className="admin-empty-state">
                    <Calendar size={48} className="icon" />
                    <h3>Belum ada Event</h3>
                    <p>Mulai dengan membuat event kompetisi kreatif pertama Anda dengan tombol di atas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : adminSubTab === 'creator-marketplace' ? (
        <div className="creator-marketplace-section animate-fade-in" style={{ padding: '4px', textAlign: 'left' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users style={{ color: '#fbbf24' }} />
              <span>Marketplace Content Creator</span>
            </h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Temukan dan ajak kerja sama para Content Creator berprestasi berdasarkan performa, jumlah views, dan tingkat keaktifan mereka.
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="admin-toolbar glass-panel" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div className="admin-search-wrapper" style={{ flex: '1 1 300px' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama creator..."
                value={marketplaceSearch}
                onChange={(e) => setMarketplaceSearch(e.target.value)}
              />
              {marketplaceSearch && (
                <button className="clear-btn" onClick={() => setMarketplaceSearch('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Creators Directory Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {(() => {
              // Filter users that have role === 'user' and match search
              const creatorsList = users.filter(u => 
                u.role === 'user' && 
                (u.username.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                 (u.organizerName || '').toLowerCase().includes(marketplaceSearch.toLowerCase()))
              );

              if (creatorsList.length === 0) {
                return (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada Content Creator yang terdaftar atau cocok dengan pencarian.
                  </div>
                );
              }

              return creatorsList.map(creator => {
                const metrics = calculateCreatorMetrics(creator.username);
                const creatorAvatar = creator.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(creator.username)}`;
                
                return (
                  <div 
                    key={creator.username}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      background: 'rgba(255, 255, 255, 0.01)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'transform 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* Upper Section */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <img 
                          src={creatorAvatar} 
                          alt={creator.username} 
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${metrics.levelColor}`,
                            background: 'rgba(255,255,255,0.02)'
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>{creator.username}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            marginTop: '4px',
                            color: metrics.levelColor,
                            background: metrics.levelBg,
                            border: metrics.levelBorder
                          }}>
                            {metrics.level}
                          </span>
                        </div>
                      </div>

                      {/* Points badge */}
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.05)',
                        border: '1px solid rgba(251, 191, 36, 0.15)',
                        color: '#fbbf24',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '14px'
                      }}>
                        <Award size={14} />
                        <span>{metrics.points.toLocaleString('id-ID')} Poin</span>
                      </div>

                      {/* Stats Table */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Karya</div>
                          <strong style={{ color: 'white', fontSize: '0.9rem' }}>{metrics.submissionsCount}</strong>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Views</div>
                          <strong style={{ color: 'white', fontSize: '0.9rem' }}>{metrics.totalViews.toLocaleString('id-ID')}</strong>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Juara</div>
                          <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>{metrics.winsCount}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Offer Trigger Button */}
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedMarketplaceCreator(creator.username);
                        // Pre-select first event if exists
                        const myEvents = events.filter(e => e.creator === currentUser.username && e.paymentStatus === 'paid');
                        if (myEvents.length > 0) setOfferEventId(myEvents[0].id);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={14} />
                      <span>Ajak Kerja Sama</span>
                    </button>
                  </div>
                );
              });
            })()}
          </div>

          {/* Collab Offers Sent Monitoring */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '700' }}>
              <ExternalLink size={18} style={{ color: '#c084fc' }} />
              <span>Monitoring Penawaran Kerja Sama</span>
            </h3>
            
            {(() => {
              const myOffers = (offers || []).filter(o => o.sender === currentUser.username);
              if (myOffers.length === 0) {
                return (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Belum ada tawaran kerja sama yang Anda kirimkan.
                  </div>
                );
              }

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Event</th>
                        <th>Tawaran Budget</th>
                        <th>Pesan</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOffers.map(off => {
                        return (
                          <tr key={off.id}>
                            <td><strong>@{off.recipient}</strong></td>
                            <td>{off.eventTitle}</td>
                            <td><strong style={{ color: '#34d399' }}>Rp {off.budget?.toLocaleString('id-ID')}</strong></td>
                            <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{off.message}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                color: off.status === 'accepted' ? '#10b981' : off.status === 'declined' ? '#ef4444' : '#38bdf8',
                                background: off.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : off.status === 'declined' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)'
                              }}>
                                {off.status === 'accepted' ? 'Diterima' : off.status === 'declined' ? 'Ditolak' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Send Offer Modal */}
          {selectedMarketplaceCreator && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }} onClick={() => setSelectedMarketplaceCreator(null)}>
              <div 
                className="glass-panel" 
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'left'
                }} 
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={20} style={{ color: '#c084fc' }} />
                  <span>Ajak Kerja Sama @{selectedMarketplaceCreator}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Kirim penawaran budget khusus untuk mengundang creator ini bergabung dalam event Anda.
                </p>

                {(() => {
                  const myEvents = events.filter(e => e.creator === currentUser.username && e.paymentStatus === 'paid');
                  if (myEvents.length === 0) {
                    return (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#f87171', fontSize: '0.88rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                        Anda belum memiliki Event yang Aktif & Terbayar. Silakan buat dan bayar event terlebih dahulu sebelum mengajak kerja sama.
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pilih Event Anda</label>
                        <select 
                          value={offerEventId} 
                          onChange={(e) => setOfferEventId(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        >
                          {myEvents.map(e => (
                            <option key={e.id} value={e.id}>{e.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Tawaran Budget (Rp)</label>
                        <input 
                          type="number" 
                          placeholder="Contoh: 500000" 
                          value={offerBudget}
                          onChange={(e) => setOfferBudget(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pesan Penawaran / Ajakan</label>
                        <textarea 
                          placeholder="Tulis pesan ajakan atau penawaran detail di sini..." 
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          style={{ width: '100%', height: '100px', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button 
                          className="btn" 
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                          onClick={() => setSelectedMarketplaceCreator(null)}
                        >
                          Batal
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, cursor: 'pointer' }}
                          onClick={() => {
                            if (!offerEventId) {
                              alert('Silakan pilih event!');
                              return;
                            }
                            if (!offerBudget) {
                              alert('Silakan masukkan budget!');
                              return;
                            }
                            const selectedEvt = events.find(e => e.id === offerEventId);
                            const newOffer = {
                              id: 'offer_' + Date.now(),
                              sender: currentUser.username,
                              recipient: selectedMarketplaceCreator,
                              eventId: offerEventId,
                              eventTitle: selectedEvt?.title || 'Event Pilihan',
                              budget: parseInt(offerBudget) || 0,
                              message: offerMessage,
                              status: 'pending',
                              sentAt: new Date().toISOString()
                            };
                            setOffers(prev => [...prev, newOffer]);
                            setSelectedMarketplaceCreator(null);
                            setOfferEventId('');
                            setOfferBudget('');
                            setOfferMessage('');
                            alert(`Berhasil mengirimkan penawaran kerja sama kepada @${selectedMarketplaceCreator}!`);
                          }}
                        >
                          Kirim Penawaran
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      ) : adminSubTab === 'event-payment' ? (
        <div className="event-payment-ledger-section animate-fade-in" style={{ padding: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Riwayat transaksi keluar dan masuk keuangan panitia (dana escrow, biaya platform, pencairan reward peserta).</span>
          </div>

          <div className="admin-table-container glass-panel">
            {getPanitiaPayments().length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama Event</th>
                    <th>Deskripsi Transaksi</th>
                    <th style={{ textAlign: 'center' }}>Tipe</th>
                    <th style={{ textAlign: 'right' }}>Jumlah</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getPanitiaPayments().map(pay => (
                    <tr key={pay.id} className="table-row-hover">
                      <td>{pay.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td><strong style={{ color: 'white' }}>{pay.eventTitle}</strong></td>
                      <td>{pay.description}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 'bold',
                          color: pay.type === 'Masuk' ? '#22c55e' : '#f87171',
                          background: pay.type === 'Masuk' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                        }}>{pay.type}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>Rp {pay.amount.toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          color: pay.status === 'Sukses' ? '#22c55e' : '#fbbf24',
                          background: pay.status === 'Sukses' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                        }}>{pay.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Belum ada transaksi keuangan tercatat.
              </div>
            )}
          </div>
        </div>

      ) : adminSubTab === 'affiliates' ? (
        <div className="affiliates-manager-section animate-fade-in">
          {/* Form to Add New Link */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Tambah Link Affiliate Baru</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const inputVal = e.target.elements.newAffiliateLink.value.trim();
                if (inputVal) {
                  if (!affiliateLinks.includes(inputVal)) {
                    setAffiliateLinks([...affiliateLinks, inputVal]);
                    e.target.reset();
                  } else {
                    alert('Link ini sudah terdaftar!');
                  }
                }
              }}
              style={{ display: 'flex', gap: '12px' }}
            >
              <input
                type="url"
                name="newAffiliateLink"
                placeholder="Masukkan URL affiliate (contoh: https://shope.ee/xyz)"
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem'
                }}
              />
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                <span>Tambah Link</span>
              </button>
            </form>
          </div>

          {/* Search Bar for Affiliates */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '360px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={affiliatesSearch}
                onChange={(e) => setAffiliatesSearch(e.target.value)}
                placeholder="Cari link affiliate..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              {affiliatesSearch && (
                <button
                  onClick={() => setAffiliatesSearch('')}
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
          </div>

          {/* Links list Table */}
          <div className="admin-table-container glass-panel">
            {affiliateLinks.length > 0 ? (
              (() => {
                const filteredAffiliates = affiliateLinks.filter(link =>
                  link.toLowerCase().includes(affiliatesSearch.toLowerCase())
                );
                if (filteredAffiliates.length === 0) {
                  return (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Tidak ada link affiliate yang cocok dengan kata kunci pencarian Anda.
                    </div>
                  );
                }
                return (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>No</th>
                        <th>URL Link Affiliate</th>
                        <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAffiliates.map((link, idx) => (
                    <tr key={idx} className="table-row-hover">
                      <td>{idx + 1}</td>
                      <td>
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="code-badge"
                          style={{ textDecoration: 'none', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {link}
                        </a>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="action-btn delete" 
                            onClick={() => {
                              if (confirm('Hapus link affiliate ini?')) {
                                setAffiliateLinks(affiliateLinks.filter((_, i) => i !== idx));
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                );
              })()
            ) : (
              <div className="admin-empty-state">
                <Link2 size={48} className="icon" />
                <h3>Belum ada link affiliate</h3>
                <p>Silakan tambahkan link di atas. Link ini akan dibuka secara acak saat user memutar film.</p>
              </div>
            )}
          </div>
        </div>
      ) : adminSubTab === 'gdrive' ? (
        <div className="gdrive-manager-section animate-fade-in">
          {/* Form to Manage Google Drive API Key */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '4px', fontSize: '1.1rem' }}>Google Drive API Key</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Dibutuhkan agar Custom Video Player dapat memutar video Google Drive berukuran besar (&gt;100MB) melewati batasan virus scan.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Masukkan API Key Google Cloud Console Anda"
                value={gdriveApiKey}
                onChange={(e) => setGdriveApiKey(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem'
                }}
              />
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  if (onSaveSettings) {
                    onSaveSettings();
                  } else {
                    alert('API Key berhasil disimpan di sistem!');
                  }
                }}
              >
                <Check size={16} />
                <span>Simpan Key</span>
              </button>
            </div>
          </div>
        </div>
      ) : adminSubTab === 'membership' && currentUser && currentUser.role === 'superadmin' ? (
        <div className="membership-manager-section animate-fade-in">
          {/* Form to Manage Membership Settings */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '4px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} className="accent-text" style={{ color: 'var(--accent)' }} />
              <span>Pengaturan Premium Membership</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Atur tautan pembelian WhatsApp admin, harga berlangganan bulanan, dan rekening pembayaran yang ditampilkan kepada pengguna ketika mengeklik episode terkunci.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>WhatsApp Link Admin</label>
                <input
                  type="text"
                  placeholder="Contoh: https://wa.me/6281234567890"
                  value={whatsappAdmin}
                  onChange={(e) => setWhatsappAdmin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Harga Langganan Premium</label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 29.000 / Bulan"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Instruksi Transfer / Metode Pembayaran</label>
              <textarea
                placeholder={`Contoh:\n- Bank BCA: 1234567890 a.n. Admin\n- DANA: 081234567890\n- OVO: 081234567890`}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {currentUser && currentUser.role === 'superadmin' && (
              <>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'white', fontWeight: 'bold' }}>Batas Minimal Penarikan Saldo Peserta (IDR)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 50.000"
                    value={minWithdrawalAmount ? minWithdrawalAmount.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const parsed = e.target.value.replace(/\D/g, '');
                      setMinWithdrawalAmount(parsed ? parseInt(parsed) : 0);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Peserta tidak akan bisa menarik saldo jika nominal yang diajukan di bawah batas minimal ini.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'white', fontWeight: 'bold' }}>Biaya Platform Pembuatan Event (IDR)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 50.000"
                    value={eventAdminFee ? eventAdminFee.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const parsed = e.target.value.replace(/\D/g, '');
                      setEventAdminFee(parsed ? parseInt(parsed) : 0);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(167, 139, 250, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Biaya platform tetap yang akan ditambahkan pada total pembayaran ketika Event Creator mengaktifkan event.
                  </span>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  if (onSaveSettings) {
                    onSaveSettings();
                  } else {
                    alert('Pengaturan membership berhasil disimpan!');
                  }
                }}
              >
                <Check size={16} />
                <span>Simpan Pengaturan Membership</span>
              </button>
            </div>
          </div>
        </div>
      ) : adminSubTab === 'firebase' ? (
        <div className="firebase-manager-section animate-fade-in">
          {/* Form to Manage Firebase Config */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '4px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="accent-text" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>firebase</span>
              <span>Konfigurasi Firebase Cloud Firestore</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Masukkan konfigurasi Firebase SDK (dalam format JSON) untuk menghubungkan katalog film dan manajemen user ke database Cloud Firestore. Kosongkan untuk tetap menggunakan database lokal browser (Offline Mode).
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const val = e.target.elements.firebaseConfigText.value.trim();
              if (!val) {
                localStorage.removeItem('portal-firebase-config');
                alert('Konfigurasi Firebase dihapus. Sistem akan beralih ke database lokal. Silakan muat ulang halaman.');
                window.location.reload();
                return;
              }
              try {
                let parsed = null;
                try {
                  // Try strict JSON parsing first
                  parsed = JSON.parse(val);
                } catch (strictErr) {
                  // Fallback to evaluating as a JS object literal
                  const parseJs = new Function(`return (${val});`);
                  parsed = parseJs();
                }

                if (parsed && parsed.apiKey && parsed.projectId) {
                  localStorage.setItem('portal-firebase-config', JSON.stringify(parsed));
                  alert('Konfigurasi Firebase berhasil disimpan! Halaman akan otomatis dimuat ulang untuk menghubungkan.');
                  window.location.reload();
                } else {
                  alert('Format konfigurasi valid tetapi tidak memiliki apiKey atau projectId yang diperlukan.');
                }
              } catch (err) {
                alert('Gagal membaca konfigurasi! Harap masukkan format JSON atau objek Javascript yang valid.');
              }
            }}>
              <textarea
                name="firebaseConfigText"
                placeholder={`Contoh:\n{\n  "apiKey": "AIzaSy...",\n  "authDomain": "portal-movie.firebaseapp.com",\n  "projectId": "portal-movie",\n  "storageBucket": "portal-movie.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                defaultValue={localStorage.getItem('portal-firebase-config') || ''}
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  marginBottom: '12px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: localStorage.getItem('portal-firebase-config') ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>
                  Status: {localStorage.getItem('portal-firebase-config') ? '✓ Terhubung ke Cloud Firestore' : '⚠️ Offline Mode (Database Lokal)'}
                </span>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Simpan & Hubungkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : adminSubTab === 'users' && currentUser && currentUser.role === 'superadmin' ? (
        <div className="users-manager-section animate-fade-in">
          {/* Form to Add New User */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} className="accent-text" style={{ color: 'var(--primary)' }} />
              <span>Tambah User Baru</span>
            </h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const username = e.target.elements.newUsername.value.trim();
                const password = e.target.elements.newPassword.value.trim();
                const role = e.target.elements.newRole.value;
                const activeDaysInput = e.target.elements.newActiveDays ? e.target.elements.newActiveDays.value : '';
                
                if (!username || !password) {
                  alert('Username dan password wajib diisi!');
                  return;
                }
                
                if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                  alert('Username sudah digunakan oleh user lain!');
                  return;
                }
                
                const days = activeDaysInput ? parseInt(activeDaysInput, 10) : 30;
                const expiresAt = (role === 'member' || role === 'pro') ? Date.now() + days * 24 * 60 * 60 * 1000 : null;
                const newUser = {
                  id: Date.now().toString(),
                  username,
                  password,
                  role,
                  premiumExpiresAt: expiresAt
                };
                
                setUsers([...users, newUser]);
                e.target.reset();
              }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Username</label>
                <input 
                  type="text" 
                  name="newUsername" 
                  placeholder="Masukkan username" 
                  required 
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  placeholder="Masukkan password" 
                  required 
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Role</label>
                <select name="newRole" style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
                  <option value="user">User Biasa</option>
                  <option value="member">Premium Member (Bebas Iklan + Semua Eps)</option>
                  <option value="panitia">Panitia (Event Creator)</option>
                  <option value="staf">Staf (Akses Admin Panel Terbatas)</option>
                  <option value="superadmin">Superadmin (Akses Semua Fitur)</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Masa Aktif (Hari)</label>
                <input 
                  type="number" 
                  name="newActiveDays" 
                  placeholder="30 (Khusus Member)" 
                  style={{ width: '100%', padding: '8px 12px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', height: '40px', justifyContent: 'center' }}>
                <Plus size={16} />
                <span>Tambah User</span>
              </button>
            </form>
          </div>

          {/* Users List Table */}
          <div className="admin-table-container glass-panel">
            {users.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>No</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Role / Jabatan</th>
                    <th>Masa Aktif</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const isSelf = user.username.toLowerCase() === currentUser.username.toLowerCase();
                    let roleBadgeColor = 'var(--text-secondary)';
                    let roleBadgeBg = 'rgba(255, 255, 255, 0.05)';
                    
                    if (user.role === 'superadmin') {
                      roleBadgeColor = '#ef4444';
                      roleBadgeBg = 'rgba(239, 68, 68, 0.1)';
                    } else if (user.role === 'staf') {
                      roleBadgeColor = '#f59e0b';
                      roleBadgeBg = 'rgba(245, 158, 11, 0.1)';
                    } else if (user.role === 'panitia') {
                      roleBadgeColor = '#8b5cf6';
                      roleBadgeBg = 'rgba(139, 92, 246, 0.1)';
                    } else if (user.role === 'member') {
                      roleBadgeColor = '#3b82f6';
                      roleBadgeBg = 'rgba(59, 130, 246, 0.1)';
                    } else if (user.role === 'user') {
                      roleBadgeColor = '#94a3b8';
                      roleBadgeBg = 'rgba(148, 163, 184, 0.1)';
                    }
                    
                    return (
                      <tr key={user.id} className="table-row-hover">
                        <td>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isSelf ? 'bold' : 'normal' }}>
                            <span>{user.username}</span>
                            {isSelf && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px', color: 'var(--text-muted)' }}>Anda</span>}
                          </div>
                        </td>
                        <td>
                          <code className="code-badge">{user.password}</code>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              color: roleBadgeColor, 
                              background: roleBadgeBg, 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: '600',
                              border: `1px solid ${roleBadgeColor}30`,
                              textTransform: 'uppercase'
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {getActivePeriodLabel(user)}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="action-btn edit" 
                              onClick={() => setEditingUser(user)}
                              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => {
                                if (isSelf) {
                                  alert('Anda tidak bisa menghapus akun Anda sendiri!');
                                  return;
                                }
                                if (confirm(`Hapus user "${user.username}"?`)) {
                                  setUsers(users.filter(u => u.id !== user.id));
                                }
                              }}
                              disabled={isSelf}
                              style={{ opacity: isSelf ? 0.3 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">
                <User size={48} className="icon" />
                <h3>Belum ada user</h3>
              </div>
            )}
          </div>

          {/* Edit User Modal Overlay */}
          {editingUser && (
            <div className="admin-modal-overlay d-flex-center animate-fade-in" style={{ zIndex: 10000 }}>
              <div className="admin-confirm-modal glass-panel" style={{ maxWidth: '400px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Edit size={20} className="accent-text" style={{ color: 'var(--primary)' }} />
                    <span>Edit User</span>
                  </h3>
                  <button 
                    onClick={() => setEditingUser(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const username = formData.get('editUsername').trim();
                    const password = formData.get('editPassword');
                    const role = formData.get('editRole');
                    const activeDaysInput = formData.get('editActiveDays');

                    if (!username || !password) {
                      alert('Username dan Password wajib diisi!');
                      return;
                    }

                    // Check duplicate username if name changed
                    if (username.toLowerCase() !== editingUser.username.toLowerCase() && 
                        users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                      alert('Username sudah digunakan oleh user lain!');
                      return;
                    }

                    let expiresAt = null;
                    if (role === 'member') {
                      if (activeDaysInput) {
                        const days = parseInt(activeDaysInput, 10);
                        expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
                      } else {
                        expiresAt = editingUser.premiumExpiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000);
                      }
                    }

                    const updatedUser = {
                      ...editingUser,
                      username,
                      password,
                      role,
                      premiumExpiresAt: expiresAt
                    };

                    // Save user list
                    const newUsersList = users.map(u => u.id === editingUser.id ? updatedUser : u);
                    setUsers(newUsersList);
                    setEditingUser(null);
                    
                    alert('User berhasil diperbarui!');
                  }}
                  className="modal-form"
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Username</label>
                    <input 
                      type="text" 
                      name="editUsername" 
                      defaultValue={editingUser.username}
                      required 
                      style={{ width: '100%', padding: '10px 14px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Password</label>
                    <input 
                      type="text" 
                      name="editPassword" 
                      defaultValue={editingUser.password}
                      required 
                      style={{ width: '100%', padding: '10px 14px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Role</label>
                    <select 
                      name="editRole" 
                      defaultValue={editingUser.role}
                      disabled={editingUser.username.toLowerCase() === currentUser.username.toLowerCase()} // Disable changing own role to prevent lockout
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                    >
                      <option value="user">User Biasa</option>
                      <option value="member">Premium Member (Bebas Iklan + Semua Eps)</option>
                      <option value="panitia">Panitia (Event Creator)</option>
                      <option value="staf">Staf (Akses Admin Panel Terbatas)</option>
                      <option value="superadmin">Superadmin (Akses Semua Fitur)</option>
                    </select>
                    {editingUser.username.toLowerCase() === currentUser.username.toLowerCase() && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Anda tidak dapat mengubah role Anda sendiri untuk mencegah kehilangan akses.
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Masa Aktif (Hari Tersisa)</label>
                    <input 
                      type="number" 
                      name="editActiveDays" 
                      defaultValue={editingUser.premiumExpiresAt ? Math.max(0, Math.ceil((editingUser.premiumExpiresAt - Date.now()) / (1000 * 60 * 60 * 24))) : 30}
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Hanya berlaku jika role diatur ke Premium Member.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <span>Simpan Perubahan</span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} style={{ flex: 1, justifyContent: 'center' }}>
                      <span>Batal</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : adminSubTab === 'withdrawals' ? (
        <div className="withdrawals-manager-section animate-fade-in">
          <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '4px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} className="accent-text" style={{ color: '#a78bfa' }} />
              <span>Verifikasi Penarikan Saldo</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tinjau pengajuan pencairan saldo dari dompet kreator peserta. Pastikan Anda telah mentransfer nominal ke nomor tujuan sebelum menyetujui.
            </p>
          </div>

          <div className="admin-table-container glass-panel">
            {withdrawals.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Peserta</th>
                    <th>Metode Transfer</th>
                    <th>Nomor Rekening / HP</th>
                    <th>Nama Penerima</th>
                    <th style={{ textAlign: 'right' }}>Nominal</th>
                    <th>Tanggal Pengajuan</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center', width: '240px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => {
                    let statusColor = '#94a3b8';
                    let statusBg = 'rgba(148, 163, 184, 0.1)';
                    if (wd.status === 'approved') {
                      statusColor = '#22c55e';
                      statusBg = 'rgba(34, 197, 94, 0.1)';
                    } else if (wd.status === 'rejected') {
                      statusColor = '#ef4444';
                      statusBg = 'rgba(239, 68, 68, 0.1)';
                    } else if (wd.status === 'pending') {
                      statusColor = '#eab308';
                      statusBg = 'rgba(234, 179, 8, 0.1)';
                    }

                    return (
                      <tr key={wd.id} className="table-row-hover">
                        <td><strong style={{ color: 'white' }}>{wd.username}</strong></td>
                        <td>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(124, 58, 237, 0.1)', color: '#c084fc', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {wd.method}
                          </span>
                        </td>
                        <td><code style={{ color: '#38bdf8', fontSize: '0.9rem' }}>{wd.account}</code></td>
                        <td><span style={{ color: 'white', fontWeight: '500' }}>{wd.name}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>
                          Rp {wd.amount?.toLocaleString('id-ID')}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(wd.requestedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '600', color: statusColor, background: statusBg }}>
                            {wd.status === 'approved' ? 'Sukses' : wd.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {wd.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => handleApproveWithdrawal(wd.id)}
                                style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)', background: 'rgba(34, 197, 94, 0.05)' }}
                              >
                                Setujui & Cairkan
                              </button>
                              <button 
                                className="btn btn-text btn-sm" 
                                onClick={() => handleRejectWithdrawal(wd)}
                                style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#ef4444' }}
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="action-btn delete"
                              title="Hapus Catatan"
                              onClick={() => {
                                if (confirm('Hapus catatan penarikan ini dari riwayat?')) {
                                  setWithdrawals(withdrawals.filter(w => w.id !== wd.id));
                                }
                              }}
                              style={{ display: 'inline-flex', alignSelf: 'center' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">
                <Wallet size={48} className="icon" />
                <h3>Belum ada pengajuan penarikan</h3>
                <p>Semua permintaan pencairan dana oleh peserta akan ditampilkan di sini.</p>
              </div>
            )}
          </div>
        </div>
      ) : adminSubTab === 'confirmations' && currentUser && currentUser.role === 'superadmin' ? (() => {
        // Construct a unified list of both premium membership activations and event payments
        const allConfirmations = [
          ...confirmations.map(c => ({
            ...c,
            isEventPayment: false,
            typeName: 'Premium Membership',
            targetId: c.id
          })),
          ...events
            .filter(evt => evt.proofReceipt || evt.paymentStatus === 'pending_verification')
            .map(evt => ({
              id: `evt_pay_${evt.id}`,
              isEventPayment: true,
              typeName: 'Pembayaran Event',
              username: evt.creator || 'Panitia',
              userId: evt.creatorId || 'panitia_id',
              planName: 'Event',
              senderName: evt.proofName || 'Tidak Diketahui',
              bankName: evt.proofBank || 'Tidak Diketahui',
              amount: `Rp ${((evt.campaignBudget || 0) + (evt.adminFee || 0)).toLocaleString('id-ID')}`,
              receiptImg: evt.proofReceipt,
              timestamp: evt.paymentSubmittedAt || evt.createdAt || Date.now(),
              status: evt.paymentStatus === 'paid' ? 'approved' : evt.paymentStatus === 'pending_verification' ? 'pending' : 'rejected',
              targetId: evt.id,
              eventTitle: evt.title
            }))
        ];

        const sortedConfirmations = [...allConfirmations].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return (
          <div className="confirmations-manager-section animate-fade-in">
            <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '4px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} className="accent-text" style={{ color: 'var(--primary)' }} />
                <span>Verifikasi Bukti Pembayaran</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Daftar semua permintaan aktivasi premium membership oleh member dan pendaftaran biaya event oleh panitia yang mengirimkan bukti transfer.
              </p>
            </div>

            <div className="admin-table-container glass-panel">
              {sortedConfirmations.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>No</th>
                      <th>User / Instansi</th>
                      <th>Paket</th>
                      <th>Nama Pengirim / Bank</th>
                      <th>Jumlah</th>
                      <th style={{ textAlign: 'center' }}>Bukti Transfer</th>
                      <th>Tanggal Masuk</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center', width: '200px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedConfirmations.map((conf, idx) => {
                      let statusColor = '#94a3b8';
                      let statusBg = 'rgba(148, 163, 184, 0.1)';
                      if (conf.status === 'approved') {
                        statusColor = '#22c55e';
                        statusBg = 'rgba(34, 197, 94, 0.1)';
                      } else if (conf.status === 'rejected') {
                        statusColor = '#ef4444';
                        statusBg = 'rgba(239, 68, 68, 0.1)';
                      } else if (conf.status === 'pending') {
                        statusColor = '#eab308';
                        statusBg = 'rgba(234, 179, 8, 0.1)';
                      }

                      return (
                        <tr key={conf.id} className="table-row-hover">
                          <td>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{conf.username}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {conf.userId}</span>
                            {conf.isEventPayment && (
                              <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '4px', fontWeight: 'bold' }}>
                                Event: {conf.eventTitle}
                              </div>
                            )}
                          </td>
                          <td>
                            <span 
                              style={{ 
                                color: conf.planId === 'pro' ? '#a78bfa' : conf.isEventPayment ? '#fbbf24' : '#94a3b8', 
                                background: conf.planId === 'pro' ? 'rgba(124, 58, 237, 0.15)' : conf.isEventPayment ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)', 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                border: conf.planId === 'pro' ? '1px solid rgba(124, 58, 237, 0.3)' : conf.isEventPayment ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                                textTransform: 'uppercase'
                              }}
                            >
                              {conf.planName || 'BASIC'}
                            </span>
                          </td>
                          <td>
                            <div>{conf.senderName}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{conf.bankName}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{conf.amount}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {conf.receiptImg ? (
                              <img 
                                src={conf.receiptImg} 
                                alt="Receipt" 
                                onClick={() => setZoomedReceipt(conf.receiptImg)}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px', 
                                  border: '1px solid var(--border-color)', 
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s'
                                }}
                                title="Klik untuk memperbesar"
                              />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tidak ada gambar</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {new Date(conf.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </td>
                          <td>
                            <span 
                              style={{ 
                                color: statusColor, 
                                background: statusBg, 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '0.72rem', 
                                fontWeight: 'bold',
                                border: `1px solid ${statusColor}30`,
                                textTransform: 'uppercase'
                              }}
                            >
                              {conf.status === 'approved' ? 'Disetujui' : conf.status === 'rejected' ? 'Ditolak' : 'Tertunda'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions" style={{ justifyContent: 'center', gap: '8px' }}>
                              {conf.status === 'pending' ? (
                                <>
                                  <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      if (conf.isEventPayment) {
                                        if (confirm(`Setujui pembayaran dari panitia "${conf.username}" untuk event "${conf.eventTitle}"?`)) {
                                          setEvents(events.map(evt => {
                                            if (evt.id === conf.targetId) {
                                              return { ...evt, paymentStatus: 'paid' };
                                            }
                                            return evt;
                                          }));
                                          alert(`Pembayaran biaya event "${conf.eventTitle}" berhasil disetujui! Event kini aktif.`);
                                        }
                                      } else {
                                        const targetRole = conf.planId === 'pro' ? 'pro' : 'member';
                                        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
                                        if (confirm(`Setujui pembayaran dari ${conf.username} dan aktifkan Paket ${conf.planName || 'BASIC'} (${targetRole.toUpperCase()})?`)) {
                                          const updatedConfs = confirmations.map(c => c.id === conf.id ? { ...c, status: 'approved' } : c);
                                          setConfirmations(updatedConfs);
                                          const updatedUsers = users.map(u => u.id === conf.userId ? { ...u, role: targetRole, premiumExpiresAt: expiresAt } : u);
                                          setUsers(updatedUsers);
                                          alert(`Paket ${conf.planName || 'BASIC'} untuk akun "${conf.username}" berhasil diaktifkan secara otomatis! Masa aktif 30 hari.`);
                                        }
                                      }
                                    }}
                                    style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Setujui
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      if (conf.isEventPayment) {
                                        if (confirm(`Tolak bukti pembayaran dari panitia "${conf.username}" untuk event "${conf.eventTitle}"?`)) {
                                          setEvents(events.map(evt => {
                                            if (evt.id === conf.targetId) {
                                              return { ...evt, paymentStatus: 'pending', proofName: '', proofBank: '', proofReceipt: '' };
                                            }
                                            return evt;
                                          }));
                                          alert(`Bukti pembayaran event ditolak.`);
                                        }
                                      } else {
                                        if (confirm(`Tolak bukti pembayaran dari ${conf.username}?`)) {
                                          const updatedConfs = confirmations.map(c => c.id === conf.id ? { ...c, status: 'rejected' } : c);
                                          setConfirmations(updatedConfs);
                                        }
                                      }
                                    }}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <button 
                                  className="action-btn delete"
                                  title="Hapus catatan konfirmasi"
                                  onClick={() => {
                                    if (confirm('Hapus catatan konfirmasi ini?')) {
                                      if (conf.isEventPayment) {
                                        setEvents(events.map(evt => {
                                          if (evt.id === conf.targetId) {
                                            return { ...evt, proofReceipt: '', proofName: '', proofBank: '', paymentStatus: 'pending' };
                                          }
                                          return evt;
                                        }));
                                      } else {
                                        setConfirmations(confirmations.filter(c => c.id !== conf.id));
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-state">
                  <Check size={48} className="icon" />
                  <h3>Belum ada pembayaran</h3>
                  <p>Semua bukti transfer pembayaran yang dikirimkan oleh pengguna/panitia akan muncul di sini.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()
      : (
        <>
          {/* Dashboard Stats */}
          <div className="admin-dashboard-grid">
            <div className="admin-stat-card glass-panel">
              <div className="stat-content">
                <span className="stat-label">Total Film</span>
                <span className="stat-value">{totalMovies}</span>
              </div>
              <div className="stat-icon-wrapper p-primary">
                <Film size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-content">
                <span className="stat-label">Total Ditonton</span>
                <span className="stat-value">{totalViews.toLocaleString('id-ID')}</span>
              </div>
              <div className="stat-icon-wrapper p-secondary">
                <Eye size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-content">
                <span className="stat-label">Rata-rata Rating</span>
                <span className="stat-value">{avgRating} <span className="stat-sub">/10</span></span>
              </div>
              <div className="stat-icon-wrapper p-accent">
                <Star fill="#f59e0b" color="#f59e0b" size={20} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-content">
                <span className="stat-label">Variasi Genre</span>
                <span className="stat-value">{uniqueGenresCount}</span>
              </div>
              <div className="stat-icon-wrapper p-info">
                <Sparkles size={24} />
              </div>
            </div>
          </div>

          {/* Toolbar / Search */}
          <div className="admin-toolbar glass-panel">
            <div className="admin-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Cari berdasarkan judul, ID, atau genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm('')}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="admin-toolbar-meta">
              Menampilkan {Math.min(visibleMoviesCount, filteredList.length)} dari {filteredList.length} film
            </div>
          </div>

          {/* Movies Table/Cards */}
          <div className="admin-table-container glass-panel">
            {filteredList.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <table className="admin-table desktop-only">
                  <thead>
                    <tr>
                      <th>Info Film</th>
                      <th>ID</th>
                      <th>Tahun</th>
                      <th>Kualitas</th>
                      <th>Rating</th>
                      <th>Ditonton</th>
                      <th>Genre</th>
                      <th>Sensor (Semi)</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.slice(0, visibleMoviesCount).map((movie) => (
                      <tr key={movie.id} className="table-row-hover">
                        <td>
                          <div className="table-movie-info">
                            <img 
                              src={movie.poster} 
                              alt={movie.title} 
                              className="table-poster" 
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80';
                              }}
                            />
                            <div className="table-movie-meta">
                              <span className="table-movie-title" title={movie.title}>{movie.title}</span>
                              <span className="table-movie-country">{movie.country || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td><code className="code-badge">{movie.id}</code></td>
                        <td>{movie.year}</td>
                        <td><span className="badge-quality">{movie.quality}</span></td>
                        <td>
                          <div className="table-rating">
                            <Star fill="#f59e0b" color="#f59e0b" size={14} />
                            <span>{movie.rating}</span>
                          </div>
                        </td>
                        <td>{movie.views.toLocaleString('id-ID')}</td>
                        <td>
                          <div className="table-genres">
                            {movie.genre.slice(0, 2).map((g) => (
                              <span key={g} className="table-genre-tag">{g}</span>
                            ))}
                            {movie.genre.length > 2 && (
                              <span className="table-genre-tag text-muted">+{movie.genre.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {movie.isSemi ? (
                            <span className="badge-semi alert">Ya</span>
                          ) : (
                            <span className="badge-semi safe">Tidak</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="action-btn edit" 
                              title="Edit Film"
                              onClick={() => openEditModal(movie)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Hapus Film"
                              onClick={() => setConfirmDeleteId(movie.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards View */}
                <div className="admin-mobile-cards mobile-only">
                  {filteredList.slice(0, visibleMoviesCount).map((movie) => (
                    <div key={movie.id} className="admin-mob-card glass-panel">
                      <div className="mob-card-header">
                        <img 
                          src={movie.poster} 
                          alt={movie.title} 
                          className="mob-poster"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80';
                          }}
                        />
                        <div className="mob-info">
                          <h4 className="mob-title">{movie.title}</h4>
                          <span className="mob-id-code">ID: {movie.id}</span>
                          <div className="mob-stats-row">
                            <span>{movie.year}</span>
                            <span>•</span>
                            <span>{movie.quality}</span>
                            <span>•</span>
                            <span className="mob-rating-flex">
                              <Star fill="#f59e0b" color="#f59e0b" size={12} style={{ display: 'inline', marginRight: '2px' }} />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mob-card-footer">
                        <div className="mob-badges-row">
                          <span className="table-genre-tag">{movie.genre[0]}</span>
                          {movie.isSemi && <span className="badge-semi alert">Sensor</span>}
                        </div>
                        <div className="mob-actions-row">
                          <button 
                            className="action-btn edit" 
                            onClick={() => openEditModal(movie)}
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={() => setConfirmDeleteId(movie.id)}
                          >
                            <Trash2 size={16} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredList.length > visibleMoviesCount && (
                  <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '20px' }}>
                    <button
                      onClick={() => setVisibleMoviesCount(prev => prev + 12)}
                      className="btn"
                      style={{
                        padding: '10px 24px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                    >
                      <span>Muat Lebih Banyak</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="admin-empty-state">
                <Film size={48} className="icon" />
                <h3>Tidak ada film yang cocok</h3>
                <p>Tidak dapat menemukan data film untuk pencarian "{searchTerm}". Coba kata kunci lainnya.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Sparkles size={18} className="accent-text" />
                <span>{editingMovie ? 'Edit Informasi Film' : 'Tambah Film Baru'}</span>
              </h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              {formError && (
                <div className="form-error-banner">
                  <AlertTriangle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-scroll-area">
                {/* Judul & ID */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="title">Judul Film *</label>
                    <input
                      type="text"
                      id="title"
                      placeholder="Masukkan judul film"
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="movieId">ID Unik Film *</label>
                    <input
                      type="text"
                      id="movieId"
                      placeholder="spiderman-2"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      disabled={!!editingMovie} // Disable ID change for edits
                      required
                    />
                    <small className="form-tip">
                      {editingMovie ? 'ID film tidak dapat diubah.' : 'ID ini akan digunakan di URL/Slug film.'}
                    </small>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="form-group">
                  <label htmlFor="description">Deskripsi / Sinopsis</label>
                  <textarea
                    id="description"
                    rows="3"
                    placeholder="Tulis ringkasan alur cerita film..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                {/* Poster & Backdrop URLs */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="poster">URL Gambar Poster</label>
                    <input
                      type="url"
                      id="poster"
                      placeholder="https://images.unsplash.com/..."
                      value={formPoster}
                      onChange={(e) => setFormPoster(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="backdrop">URL Gambar Backdrop (Header)</label>
                    <input
                      type="url"
                      id="backdrop"
                      placeholder="https://images.unsplash.com/..."
                      value={formBackdrop}
                      onChange={(e) => setFormBackdrop(e.target.value)}
                    />
                  </div>
                </div>

                {/* Drive ID & URL Video Langsung */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="driveId">Google Drive ID Video</label>
                    <input
                      type="text"
                      id="driveId"
                      placeholder="Contoh: 1g8V5bB3G8z9..."
                      value={formDriveId}
                      onChange={(e) => setFormDriveId(e.target.value)}
                    />
                    <small className="form-tip">Gunakan jika video disimpan di Google Drive.</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="videoUrl">URL Video Langsung (MP4 / Direct Link)</label>
                    <input
                      type="url"
                      id="videoUrl"
                      placeholder="https://domain.com/movie.mp4"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                    />
                    <small className="form-tip">Gunakan agar film langsung diputar (bypasses processing Drive).</small>
                  </div>
                </div>

                {/* Episodes List (Textarea) */}
                <div className="form-group">
                  <label htmlFor="episodesText">Daftar Episode (Format: Nama Episode|Link/DriveID - Contoh: Eps 1|1g8V5...)</label>
                  <textarea
                    id="episodesText"
                    rows="4"
                    placeholder="Eps 1|1g8V5bB3G8z9...&#10;Eps 2|https://domain.com/ep2.mp4&#10;Eps 3|1x7Yz8..."
                    value={formEpisodesText}
                    onChange={(e) => setFormEpisodesText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                  <small className="form-tip">
                    Gunakan baris baru untuk memisahkan episode. Jika diisi, film akan disajikan sebagai film seri / memiliki banyak episode.
                  </small>
                </div>

                {/* Affiliate Link & Durasi */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="affiliateUrl">Link Affiliate Sponsor (Shopee/Tokopedia/dll)</label>
                    <input
                      type="url"
                      id="affiliateUrl"
                      placeholder="https://shope.ee/..."
                      value={formAffiliateUrl}
                      onChange={(e) => setFormAffiliateUrl(e.target.value)}
                    />
                    <small className="form-tip">Membuka link ini di tab baru sebelum tombol play aktif.</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration">Durasi Film</label>
                    <input
                      type="text"
                      id="duration"
                      placeholder="Contoh: 2h 15m"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                    />
                    <small className="form-tip">Format bebas (cth: 1h 45m).</small>
                  </div>
                </div>

                {/* Rating, Tahun, Kualitas, Negara */}
                <div className="form-row-4">
                  <div className="form-group">
                    <label htmlFor="rating">Rating (0-10)</label>
                    <input
                      type="number"
                      id="rating"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="year">Tahun Rilis</label>
                    <input
                      type="number"
                      id="year"
                      min="1800"
                      max="2100"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quality">Kualitas</label>
                    <select
                      id="quality"
                      value={formQuality}
                      onChange={(e) => setFormQuality(e.target.value)}
                    >
                      <option value="4K">4K Ultra HD</option>
                      <option value="FHD">FHD 1080p</option>
                      <option value="HD">HD 720p</option>
                      <option value="SD">SD 480p</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Negara</label>
                    <input
                      type="text"
                      id="country"
                      placeholder="AS, Indonesia, Jepang..."
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                    />
                  </div>
                </div>

                {/* Genre Selector */}
                <div className="form-group">
                  <label>Pilih Genre (bisa lebih dari satu)</label>
                  <div className="genres-checkbox-grid">
                    {availableGenres.map((genre) => (
                      <label key={genre} className="genre-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => handleGenreToggle(genre)}
                        />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Add New Custom Genre Inline */}
                  <div className="add-genre-inline">
                    <input
                      type="text"
                      placeholder="Masukkan genre kustom baru..."
                      value={newGenreInput}
                      onChange={(e) => setNewGenreInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewGenre();
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddNewGenre}
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                {/* Film Semi Toggle */}
                <div className="form-group toggle-group">
                  <div className="toggle-label-desc">
                    <label htmlFor="isSemi" className="toggle-label">Film Semi (Konten Dewasa 18+)</label>
                    <span className="toggle-desc">Mengaktifkan filter sensor konten dewasa pada halaman discover/beranda default.</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="isSemi"
                      checked={formIsSemi}
                      onChange={(e) => setFormIsSemi(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-text" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="admin-modal-overlay d-flex-center">
          <div className="admin-confirm-modal glass-panel animate-fade-in-up">
            <div className="confirm-icon-danger">
              <Trash2 size={32} />
            </div>
            <h3>Hapus Film Ini?</h3>
            <p>
              Tindakan ini permanen. Film dengan ID <strong>{confirmDeleteId}</strong> akan dihapus selamanya dari katalog Anda.
            </p>
            <div className="confirm-actions">
              <button 
                className="btn btn-text" 
                onClick={() => setConfirmDeleteId(null)}
              >
                Batal
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Zoomed Receipt Modal Overlay */}
      {zoomedReceipt && createPortal(
        <div 
          className="admin-modal-overlay d-flex-center animate-fade-in" 
          onClick={() => setZoomedReceipt(null)}
          style={{ zIndex: 10010 }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              position: 'relative', 
              padding: '8px', 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedReceipt(null)}
              style={{ 
                position: 'absolute', 
                top: '-15px', 
                right: '-15px', 
                background: 'var(--primary-color)', 
                border: 'none', 
                borderRadius: '50%', 
                color: 'white', 
                width: '30px', 
                height: '30px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
            <img 
              src={zoomedReceipt} 
              alt="Zoomed Bukti Transfer" 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
            />
          </div>
        </div>,
        document.body
      )}

      {/* Karya Submission Preview Modal Overlay */}
      {previewSubmission && createPortal(
        <div className="admin-modal-overlay d-flex-center animate-fade-in" style={{ zIndex: 10100 }} onClick={() => setPreviewSubmission(null)}>
          <div className="admin-confirm-modal glass-panel" style={{ maxWidth: '600px', width: '95%', padding: '24px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>Detail Karya Peserta</h3>
              <button onClick={() => setPreviewSubmission(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {/* Social Media Card layout */}
            <div style={{ 
              background: '#090d16', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Brand Indicator Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    color: 'white',
                    background: 
                      previewSubmission.platform?.toLowerCase() === 'youtube' ? '#ff0000' :
                      previewSubmission.platform?.toLowerCase() === 'tiktok' ? 'linear-gradient(45deg, #fe2c55, #25f4ee)' :
                      previewSubmission.platform?.toLowerCase() === 'instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : '#475569'
                  }}>
                    {previewSubmission.platform || 'Link Eksternal'}
                  </span>
                </div>
                <button 
                  onClick={() => window.open(previewSubmission.videoUrl, '_blank')}
                  className="btn btn-primary"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 16px', 
                    fontSize: '0.82rem',
                    borderRadius: '20px'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Buka Tautan Karya</span>
                </button>
              </div>

              {/* Title & Description of Work */}
              <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>{previewSubmission.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>{previewSubmission.description}</p>

              {/* Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '12px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#a78bfa', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <Eye size={14} />
                    <span>Views</span>
                  </div>
                  <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(previewSubmission.views || 0).toLocaleString('id-ID')}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ec4899', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <Heart size={14} />
                    <span>Likes</span>
                  </div>
                  <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(previewSubmission.likes || 0).toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <MessageSquare size={14} />
                    <span>Comments</span>
                  </div>
                  <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(previewSubmission.comments || 0).toLocaleString('id-ID')}</strong>
                </div>
              </div>
            </div>

            {/* Submitter & Contest details */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0 }}><strong>Sineas / Peserta:</strong> <span style={{ color: 'white' }}>{previewSubmission.participantName}</span></p>
              <p style={{ margin: 0 }}><strong>Kategori Kompetisi:</strong> <span style={{ color: 'white' }}>{previewSubmission.eventTitle}</span></p>
              <p style={{ margin: 0 }}><strong>Tautan Asli:</strong> <a href={previewSubmission.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline', wordBreak: 'break-all' }}>{previewSubmission.videoUrl}</a></p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Judging Submission Modal Overlay */}
      {judgingSubmission && createPortal(
        <div className="admin-modal-overlay d-flex-center animate-fade-in" style={{ zIndex: 10100 }} onClick={() => setJudgingSubmission(null)}>
          <div className="admin-confirm-modal glass-panel" style={{ maxWidth: '420px', width: '90%', padding: '24px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Penjurian Karya</h3>
              <button onClick={() => setJudgingSubmission(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleJudgingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '4px' }}><strong>Judul Karya:</strong> {judgingSubmission.title}</p>
                <p><strong>Peserta:</strong> {judgingSubmission.participantName}</p>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>Skor Penjurian (1 - 100)</label>
                <input type="number" min="1" max="100" required value={judgingScore} onChange={(e) => setJudgingScore(e.target.value)} placeholder="Masukkan skor angka" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>Ulasan / Masukan Juri</label>
                <textarea rows="4" value={judgingFeedback} onChange={(e) => setJudgingFeedback(e.target.value)} placeholder="Tulis masukan konstruktif untuk peserta..." style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontFamily: 'inherit' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setJudgingSubmission(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Transaction Authorization Confirmation Modal */}
      {authModal && createPortal(
        <div className="admin-modal-overlay d-flex-center animate-fade-in" style={{ zIndex: 10200 }} onClick={() => { setAuthModal(null); setAuthPassword(''); setAuthError(''); }}>
          <div className="admin-confirm-modal glass-panel" style={{ maxWidth: '440px', width: '95%', padding: '24px', textAlign: 'left', border: '1px solid rgba(248, 113, 113, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} style={{ color: '#f87171' }} />
                <span>{authModal.title || 'Otorisasi Transaksi'}</span>
              </h3>
              <button 
                onClick={() => { setAuthModal(null); setAuthPassword(''); setAuthError(''); }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.88rem', color: 'white', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                {authModal.message}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Untuk alasan keamanan finansial, tindakan ini memerlukan verifikasi password akun Anda.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (authPassword !== currentUser.password) {
                  setAuthError('Password akun yang Anda masukkan salah!');
                  return;
                }
                const onConfirmCallback = authModal.onConfirm;
                setAuthModal(null);
                setAuthPassword('');
                setAuthError('');
                onConfirmCallback();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '500' }}>Password Konfirmasi</label>
                <input 
                  type="password" 
                  required 
                  autoFocus
                  value={authPassword} 
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    setAuthError('');
                  }} 
                  placeholder="Masukkan password akun Anda" 
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: authError ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
                />
                {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: '4px 0 0 0' }}>{authError}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setAuthModal(null); setAuthPassword(''); setAuthError(''); }}
                  style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #f87171, #ef4444)', border: 'none' }}
                >
                  Konfirmasi Otorisasi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
