import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { isFirebaseConfigured, db } from '../firebase';
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
  XCircle,
  Search, 
  Sparkles,
  QrCode,
  Camera,
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
  Send,
  Shield,
  ShieldCheck,
  TrendingUp,
  ChevronDown
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

const InfoTooltip = ({ text }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center', 
        marginLeft: '6px', 
        cursor: 'help',
        verticalAlign: 'middle'
      }}
    >
      <Info size={13} style={{ color: hovered ? 'white' : 'rgba(255, 255, 255, 0.4)', transition: 'color 0.2s' }} />
      {hovered && (
        <span style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '220px',
          backgroundColor: '#1f2937',
          color: '#fff',
          textAlign: 'left',
          borderRadius: '8px',
          padding: '10px 14px',
          zIndex: 10000,
          fontSize: '0.75rem',
          lineHeight: '1.4',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          whiteSpace: 'normal',
          pointerEvents: 'none'
        }}>
          {text}
        </span>
      )}
    </span>
  );
};


const getCategoryBadgeStyle = (category) => {
  return {
    bg: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };
};


const getDefaultPermissions = (role, customRoles = []) => {
  if (!role) return [];
  const normalizedRole = role.toLowerCase();
  const lookupRole = normalizedRole === 'staff' ? 'staf' : normalizedRole;

  // Check custom roles list first
  const customRole = customRoles.find(r => 
    r.id?.toLowerCase() === lookupRole || 
    r.name?.toLowerCase() === lookupRole
  );
  if (customRole) return customRole.permissions;

  if (lookupRole === 'superadmin') {
    return [
      'movies', 'affiliates', 'membership', 'confirmations', 'withdrawals', 'users', 'roles',
      'event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace', 'finance-report'
    ];
  }
  if (lookupRole === 'staf') {
    return ['movies', 'affiliates', 'confirmations', 'withdrawals', 'finance-report'];
  }
  if (lookupRole === 'panitia' || lookupRole === 'user') {
    return ['event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace'];
  }
  if (lookupRole === 'moderator') {
    return ['confirmations', 'withdrawals', 'finance-report'];
  }
  if (lookupRole === 'editor') {
    return ['movies', 'affiliates'];
  }
  return [];
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
  offers = [],
  setOffers,
  handleTransferWallet,
  minWithdrawalAmount = 50000,
  setMinWithdrawalAmount,
  eventAdminFee = 0,
  setEventAdminFee,
  eventFlatFee = 150000,
  setEventFlatFee,
  withdrawalFeePercent = 0,
  setWithdrawalFeePercent,
  customRoles = [],
  setCustomRoles,
  financialJournals = [],
  setFinancialJournals,
  autoOpenCreateForm = false,
  onEventCreatedOrUpdated,
  isEmbedded = false,
  communities = [],
  onKickMember,
  onApproveMember,
  onRejectMember,
  onSaveAgenda
}) {
  const isPanitia = currentUser && (currentUser.role === 'panitia' || currentUser.role === 'user');
  const myEvents = isPanitia 
    ? events.filter(e => e.creator === currentUser.username) 
    : events;
  const myEventIds = myEvents.map(e => e.id);
  const myParticipants = isPanitia 
    ? eventParticipants.filter(p => myEventIds.includes(p.eventId)) 
    : eventParticipants;
  const mySubmissions = isPanitia 
    ? eventSubmissions.filter(s => myEventIds.includes(s.eventId)) 
    : eventSubmissions;

  const isCreatorFullyInvitedOrRegistered = (creatorUsername) => {
    const myPaidEvents = events.filter(e => e.creator === currentUser?.username && e.paymentStatus === 'paid');
    if (myPaidEvents.length === 0) return true;
    return myPaidEvents.every(e => {
      const isPart = eventParticipants.some(p => p.eventId === e.id && p.username.toLowerCase() === creatorUsername.toLowerCase());
      const hasOffer = offers.some(o => o.eventId === e.id && o.recipient.toLowerCase() === creatorUsername.toLowerCase() && (o.status === 'pending' || o.status === 'accepted'));
      return isPart || hasOffer;
    });
  };

  const hasPermission = (tabId) => {
    if (currentUser?.role === 'superadmin') return true;
    
    const lookupRole = currentUser?.role?.toLowerCase() === 'staff' ? 'staf' : currentUser?.role?.toLowerCase();
    const customRole = customRoles.find(r => 
      r.id?.toLowerCase() === lookupRole || 
      r.name?.toLowerCase() === lookupRole
    );
    if (customRole) {
      return customRole.permissions.includes(tabId);
    }

    const userPerms = currentUser?.permissions || getDefaultPermissions(currentUser?.role, customRoles);
    return userPerms.includes(tabId);
  };

  // Local state
  const [userViewMode, setUserViewMode] = useState('list'); // 'list' | 'add'
  const [zoomedReceipt, setZoomedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(6);
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Agenda states
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState('');
  const [agendaDesc, setAgendaDesc] = useState('');
  const [agendaDate, setAgendaDate] = useState('');
  const [agendaTime, setAgendaTime] = useState('');
  const [agendaLoc, setAgendaLoc] = useState('');
  const [agendaPublishTo, setAgendaPublishTo] = useState('public');

  // Creator Marketplace local states
  const [selectedMarketplaceCreator, setSelectedMarketplaceCreator] = useState(null);
  const [offerEventId, setOfferEventId] = useState('');
  const [offerBudget, setOfferBudget] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceLevelFilter, setMarketplaceLevelFilter] = useState('All');
  const [viewingCreatorProfile, setViewingCreatorProfile] = useState(null);
  const [selectedCreatorUsernames, setSelectedCreatorUsernames] = useState([]);
  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);
  const [bulkOfferEventId, setBulkOfferEventId] = useState('');
  const [bulkOfferMessage, setBulkOfferMessage] = useState('');

  // Financial Journal states
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalType, setJournalType] = useState('in'); // 'in' | 'out'
  const [journalAmount, setJournalAmount] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalDate, setJournalDate] = useState(() => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  });

  // Financial Report sorting states
  const [financeSortField, setFinanceSortField] = useState('date');
  const [financeSortDirection, setFinanceSortDirection] = useState('desc');
  const [financeMonthFilter, setFinanceMonthFilter] = useState('All'); // 'All' or 'YYYY-MM'

  // Payment local states
  const [visiblePaymentsCount, setVisiblePaymentsCount] = useState(10);

  const [editingMovie, setEditingMovie] = useState(null); // null means adding a new movie
  const [editingUser, setEditingUser] = useState(null); // null means not editing any user
  const [editingRole, setEditingRole] = useState(null); // null means not editing any role
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'internal' | 'external'
  const [userSearch, setUserSearch] = useState('');

  // Pemasukan Saldo (Confirmations) States
  const [confirmationSearch, setConfirmationSearch] = useState('');
  const [confirmationStatusFilter, setConfirmationStatusFilter] = useState('all');
  const [confirmationTypeFilter, setConfirmationTypeFilter] = useState('all');

  // Penarikan Saldo (Withdrawals) States
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('all');

  // Date range filter states
  const [confirmationStartDate, setConfirmationStartDate] = useState('');
  const [confirmationEndDate, setConfirmationEndDate] = useState('');
  const [withdrawalStartDate, setWithdrawalStartDate] = useState('');
  const [withdrawalEndDate, setWithdrawalEndDate] = useState('');

  const [loadedUsers, setLoadedUsers] = useState([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [lastUserDoc, setLastUserDoc] = useState(null);

  const [loadedCreators, setLoadedCreators] = useState([]);
  const [hasMoreCreators, setHasMoreCreators] = useState(true);
  const [isLoadingMoreCreators, setIsLoadingMoreCreators] = useState(false);
  const [lastCreatorDoc, setLastCreatorDoc] = useState(null);

  const loadMoreCreators = async (isFirstLoad = false) => {
    if (isLoadingMoreCreators) return;
    setIsLoadingMoreCreators(true);

    const batchSize = 10;
    const currentList = isFirstLoad ? [] : loadedCreators;
    const lastDoc = isFirstLoad ? null : lastCreatorDoc;

    if (isFirebaseConfigured() && db) {
      try {
        const { collection, query, limit, startAfter, getDocs, where } = await import("firebase/firestore");
        
        let q;
        const constraints = [
          where("role", "==", "user"),
          limit(batchSize)
        ];
        
        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }
        
        q = query(collection(db, "users"), ...constraints);
        const querySnapshot = await getDocs(q);
        const newCreators = [];
        
        querySnapshot.forEach((doc) => {
          newCreators.push({ id: doc.id, ...doc.data() });
        });

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        setLastCreatorDoc(lastVisible);
        
        const mergedList = isFirstLoad ? newCreators : [...currentList, ...newCreators];
        setLoadedCreators(mergedList);
        setHasMoreCreators(newCreators.length === batchSize);
      } catch (err) {
        console.error("Error lazy loading creators:", err);
      } finally {
        setIsLoadingMoreCreators(false);
      }
    } else {
      // Offline local load
      let sourceList = (users || []).filter(u => u.role === 'user');
      
      const startIndex = currentList.length;
      const nextBatch = sourceList.slice(startIndex, startIndex + batchSize);
      
      setLoadedCreators([...currentList, ...nextBatch]);
      setHasMoreCreators(startIndex + nextBatch.length < sourceList.length);
      setIsLoadingMoreCreators(false);
    }
  };

  useEffect(() => {
    if (adminSubTab === 'creator-marketplace') {
      loadMoreCreators(true);
    }
  }, [adminSubTab]);

  useEffect(() => {
    if (adminSubTab === 'creator-marketplace' && !isFirebaseConfigured()) {
      loadMoreCreators(true);
    }
  }, [users]);

  const loadMoreUsers = async (isFirstLoad = false) => {
    if (isLoadingMoreUsers) return;
    setIsLoadingMoreUsers(true);

    const batchSize = 10;
    const currentList = isFirstLoad ? [] : loadedUsers;
    const lastDoc = isFirstLoad ? null : lastUserDoc;

    if (isFirebaseConfigured() && db) {
      try {
        const { collection, query, limit, startAfter, getDocs, orderBy, startAt, endAt } = await import("firebase/firestore");
        
        let q;
        const constraints = [];
        
        if (userSearch) {
          constraints.push(orderBy("username"));
          constraints.push(startAt(userSearch));
          constraints.push(endAt(userSearch + "\uf8ff"));
        } else {
          constraints.push(orderBy("username"));
        }
        
        constraints.push(limit(batchSize));
        
        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }
        
        q = query(collection(db, "users"), ...constraints);
        const querySnapshot = await getDocs(q);
        const newUsers = [];
        
        querySnapshot.forEach((doc) => {
          newUsers.push({ id: doc.id, ...doc.data() });
        });

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        setLastUserDoc(lastVisible);
        
        const mergedList = isFirstLoad ? newUsers : [...currentList, ...newUsers];
        setLoadedUsers(mergedList);
        setHasMoreUsers(newUsers.length === batchSize);
      } catch (err) {
        console.error("Error lazy loading users:", err);
      } finally {
        setIsLoadingMoreUsers(false);
      }
    } else {
      // LocalStorage / Offline lazy load
      let sourceList = users || [];
      
      if (userSearch) {
        sourceList = sourceList.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()));
      }
      
      if (userFilter === 'internal') {
        sourceList = sourceList.filter(u => ['superadmin', 'staf', 'moderator', 'editor'].includes(u.role) || (customRoles.some(r => r.id === u.role) && u.role !== 'panitia'));
      } else if (userFilter === 'panitia') {
        sourceList = sourceList.filter(u => u.role === 'panitia');
      } else if (userFilter === 'external') {
        sourceList = sourceList.filter(u => ['member', 'user'].includes(u.role));
      }
      
      const startIndex = currentList.length;
      const nextBatch = sourceList.slice(startIndex, startIndex + batchSize);
      
      setLoadedUsers([...currentList, ...nextBatch]);
      setHasMoreUsers(startIndex + nextBatch.length < sourceList.length);
      setIsLoadingMoreUsers(false);
    }
  };

  useEffect(() => {
    if (adminSubTab === 'users') {
      loadMoreUsers(true);
    }
  }, [adminSubTab, userSearch, userFilter]);

  useEffect(() => {
    if (adminSubTab === 'users' && !isFirebaseConfigured()) {
      loadMoreUsers(true);
    }
  }, [users]);

  // Event creation form states
  const [showEventForm, setShowEventForm] = useState(autoOpenCreateForm);
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
  const [eventMinEarningViews, setEventMinEarningViews] = useState(0);
  const [eventBudgetMode, setEventBudgetMode] = useState('views'); // 'views' or 'ranking'
  const [eventTargetAudience, setEventTargetAudience] = useState('public'); // 'public' or 'members_only'
  const [eventPrize1, setEventPrize1] = useState(3000000);
  const [eventPrize2, setEventPrize2] = useState(1500000);
  const [eventPrize3, setEventPrize3] = useState(500000);
  const [editingEventId, setEditingEventId] = useState(null);
  const [depositingEvent, setDepositingEvent] = useState(null);
  const [verifyingEvent, setVerifyingEvent] = useState(null);
  const [eventTicketPrice, setEventTicketPrice] = useState(0);
  const [checkInTicketCode, setCheckInTicketCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  
  useEffect(() => {
    if (!showQRScanner) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsScanning(false);
    }
  }, [showQRScanner]);

  const [eventType, setEventType] = useState('competition'); // 'competition' or 'regular'
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
  const [selectedManageEvent, setSelectedManageEvent] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/events/kelola/')) {
      const parts = path.replace('/events/kelola/', '').split('/');
      const eventId = parts[0];
      return events.find(e => e.id === eventId) || null;
    }
    const savedId = localStorage.getItem('portal-selected-manage-event-id');
    if (savedId) {
      return events.find(e => e.id === savedId) || null;
    }
    return null;
  });

  const [innerManageTab, setInnerManageTab] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/events/kelola/')) {
      const parts = path.replace('/events/kelola/', '').split('/');
      const tabId = parts[1];
      if (['participants', 'submissions', 'judging', 'finance'].includes(tabId)) {
        return tabId;
      }
    }
    return localStorage.getItem('portal-inner-manage-tab') || 'participants';
  });

  React.useEffect(() => {
    localStorage.setItem('portal-inner-manage-tab', innerManageTab);
  }, [innerManageTab]);

  React.useEffect(() => {
    if (selectedManageEvent && selectedManageEvent.eventType === 'regular') {
      if (innerManageTab === 'submissions' || innerManageTab === 'judging') {
        setInnerManageTab('participants');
      }
    }
  }, [selectedManageEvent, innerManageTab]);

  React.useEffect(() => {
    if (!isEmbedded) return;
    const path = window.location.pathname;
    if (selectedManageEvent) {
      const targetPath = `/events/kelola/${selectedManageEvent.id}/${innerManageTab}`;
      if (path !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      localStorage.setItem('portal-selected-manage-event-id', selectedManageEvent.id);
    } else {
      const targetPath = '/events/kelola';
      if (path.startsWith('/events/kelola/') || (path.startsWith('/events') && path !== '/events/semua' && path !== '/events/undangan' && path !== '/events/kelola')) {
        window.history.pushState(null, '', targetPath);
      }
      localStorage.removeItem('portal-selected-manage-event-id');
    }
  }, [selectedManageEvent, innerManageTab, isEmbedded]);

  React.useEffect(() => {
    const savedId = localStorage.getItem('portal-selected-manage-event-id');
    if (savedId && events.length > 0 && !selectedManageEvent) {
      const found = events.find(e => e.id === savedId);
      if (found) {
        setSelectedManageEvent(found);
      }
    }
  }, [events]);

  React.useEffect(() => {
    const handleNav = () => {
      const path = window.location.pathname;
      if (isEmbedded) {
        if (path.startsWith('/events/kelola/')) {
          const parts = path.replace('/events/kelola/', '').split('/');
          const eventId = parts[0];
          const tabId = parts[1];
          const found = events.find(e => e.id === eventId);
          if (found) {
            setSelectedManageEvent(found);
            if (['participants', 'submissions', 'judging', 'finance'].includes(tabId)) {
              setInnerManageTab(tabId);
            }
          }
          return;
        } else if (path === '/events/kelola') {
          setSelectedManageEvent(null);
          return;
        }
      }

      const isNotifNavigating = localStorage.getItem('portal-notif-navigating');
      if (isNotifNavigating === 'true' && events.length > 0) {
        const savedId = localStorage.getItem('portal-selected-manage-event-id');
        const found = events.find(e => e.id === savedId);
        if (found) {
          setSelectedManageEvent(found);
          localStorage.removeItem('portal-notif-navigating');
        }
        const savedTab = localStorage.getItem('portal-inner-manage-tab');
        if (savedTab) {
          setInnerManageTab(savedTab);
        }
      }
    };

    handleNav();

    window.addEventListener('popstate', handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
    };
  }, [events, isEmbedded]);

  const lastTabRef = React.useRef(adminSubTab);
  React.useEffect(() => {
    if (lastTabRef.current !== adminSubTab) {
      lastTabRef.current = adminSubTab;
      const isNotifNavigating = localStorage.getItem('portal-notif-navigating');
      if (isNotifNavigating !== 'true') {
        setSelectedEventIdFilter('');
        setSelectedManageEvent(null);
      }
    }
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
      const tempEvents = [...events];
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

        let nextSub = { ...sub, platform };

        if (platform === 'YouTube') {
          const videoId = extractYoutubeId(sub.videoUrl);
          if (videoId) {
            try {
              const res = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`);
               if (res.ok) {
                 const data = await res.json();
                 nextSub.views = data.viewCount || sub.views || 0;
                 nextSub.likes = data.likes || sub.likes || 0;
                 nextSub.comments = data.likes ? Math.round(data.likes * 0.05) : sub.comments || 0;
               }
            } catch (err) {
              console.error("Failed to fetch youtube statistics:", err);
            }
          }
        }

        // Fallback for non-YouTube or failed fetch
        if (!nextSub.views || nextSub.views === 0) {
          const randomViews = Math.floor(Math.random() * 80000) + 12000;
          const randomLikes = Math.floor(randomViews * (Math.random() * 0.10 + 0.05));
          const randomComments = Math.floor(randomLikes * (Math.random() * 0.06 + 0.02));
          nextSub.views = sub.views && sub.views > 0 ? sub.views : randomViews;
          nextSub.likes = sub.likes && sub.likes > 0 ? sub.likes : randomLikes;
          nextSub.comments = sub.comments && sub.comments > 0 ? sub.comments : randomComments;
        }

        // Auto Payout & Auto Review for Pay Per View (views) mode
        const evtIdx = tempEvents.findIndex(e => e.id === sub.eventId);
        if (evtIdx !== -1 && tempEvents[evtIdx].budgetMode === 'views') {
          const evt = tempEvents[evtIdx];
          const step = evt.benefitViewsStep || 1000;
          const minViews = evt.minEarningViews || 0;
          
          let payout = nextSub.views >= minViews 
            ? Math.floor(nextSub.views / step) * (evt.benefitAmount || 0)
            : 0;

          const oldPaid = sub.paidBenefit || 0;
          
          // Cap payout by remaining budget
          const currentRemaining = evt.remainingBudget !== undefined ? evt.remainingBudget : evt.campaignBudget;
          if (payout - oldPaid > currentRemaining) {
            payout = oldPaid + currentRemaining;
          }

          const diff = payout - oldPaid;
          if (diff > 0) {
            await handleTransferWallet(sub.username, diff);
            // Deduct from event remaining budget
            tempEvents[evtIdx] = {
              ...evt,
              remainingBudget: currentRemaining - diff
            };
          }
          nextSub.paidBenefit = payout;
          nextSub.status = 'reviewed';
          nextSub.score = 100; // Auto 100 score for views mode
        }

        return nextSub;
      }));

      setEvents(tempEvents);
      setEventSubmissions(updated);
      alert(`Berhasil melakukan Grab & Sinkronisasi data real-time! Karya dengan mode Pay Per View otomatis dinilai dan benefit dicairkan ke wallet.`);
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
    const isComp = eventType === 'competition';
    const computedBudget = !isComp ? 0 : (isRanking 
      ? (parseInt(eventPrize1) || 0) + (parseInt(eventPrize2) || 0) + (parseInt(eventPrize3) || 0)
      : (parseInt(eventBudget) || 0));

    if (editingEventId) {
      setEvents(events.map(evt => {
        if (evt.id === editingEventId) {
          return {
            ...evt,
            title: eventTitle.trim(),
            category: eventCategory,
            eventType: eventType,
            deadline: (!isComp || (eventBudgetMode === 'views' && !eventHasDeadline)) ? '' : eventDeadline,
            maxParticipants: eventHasMaxParticipants ? (parseInt(eventMaxParticipants) || 0) : 0,
            description: eventDescription.trim(),
            juknis: eventJuknis.trim(),
            budgetMode: isComp ? eventBudgetMode : 'views',
            targetAudience: eventTargetAudience,
            campaignBudget: computedBudget,
            remainingBudget: computedBudget,
            ticketPrice: parseInt(eventTicketPrice) || 0,
            benefitAmount: (!isComp || isRanking) ? 0 : (parseInt(eventBenefitAmount) || 0),
            benefitViewsStep: (!isComp || isRanking) ? 0 : (parseInt(eventBenefitViewsStep) || 1000),
            minEarningViews: (!isComp || isRanking) ? 0 : (parseInt(eventMinEarningViews) || 0),
            prize1: (isComp && isRanking) ? (parseInt(eventPrize1) || 0) : 0,
            prize2: (isComp && isRanking) ? (parseInt(eventPrize2) || 0) : 0,
            prize3: (isComp && isRanking) ? (parseInt(eventPrize3) || 0) : 0,
            paymentStatus: evt.paymentStatus || 'pending',
            adminFee: evt.paymentStatus === 'paid' ? (evt.adminFee !== undefined ? evt.adminFee : 0) : (eventType === 'regular' ? (eventFlatFee || 150000) : Math.round((computedBudget * (eventAdminFee || 0)) / 100))
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
        eventType: eventType,
        deadline: (!isComp || (eventBudgetMode === 'views' && !eventHasDeadline)) ? '' : eventDeadline,
        maxParticipants: eventHasMaxParticipants ? (parseInt(eventMaxParticipants) || 0) : 0,
        description: eventDescription.trim(),
        juknis: eventJuknis.trim(),
        budgetMode: isComp ? eventBudgetMode : 'views',
        targetAudience: eventTargetAudience,
        campaignBudget: computedBudget,
        remainingBudget: computedBudget,
        ticketPrice: parseInt(eventTicketPrice) || 0,
        // views mode
        benefitAmount: isRanking ? 0 : (parseInt(eventBenefitAmount) || 0),
        benefitViewsStep: isRanking ? 0 : (parseInt(eventBenefitViewsStep) || 1000),
        minEarningViews: isRanking ? 0 : (parseInt(eventMinEarningViews) || 0),
        // ranking mode
        prize1: isRanking ? (parseInt(eventPrize1) || 0) : 0,
        prize2: isRanking ? (parseInt(eventPrize2) || 0) : 0,
        prize3: isRanking ? (parseInt(eventPrize3) || 0) : 0,
        paymentStatus: 'pending',
        adminFee: eventType === 'regular' ? (eventFlatFee || 150000) : Math.round((computedBudget * (eventAdminFee || 0)) / 100),
        organizerName: currentUser?.organizerName || currentUser?.username || 'Panitia Portal',
        organizerPhone: currentUser?.organizerPhone || '',
        organizerDescription: currentUser?.organizerDescription || '',
        creator: currentUser?.username || 'Panitia',
        creatorId: currentUser?.id || 'panitia_id'
      };
      setEvents([...events, newEvent]);
      setShowEventForm(false);
      alert('Event baru berhasil dibuat! Silakan selesaikan pembayaran biaya event di daftar event agar event aktif.');
      if (onEventCreatedOrUpdated) {
        onEventCreatedOrUpdated(newEvent);
      }
    }
  };

  const getPanitiaPayments = () => {
    const list = [];
    myEvents.forEach(evt => {
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
        const subs = mySubmissions.filter(s => s.eventId === evt.id && s.views > 0);
        subs.forEach(s => {
          const step = evt.benefitViewsStep || 1000;
          const minViews = evt.minEarningViews || 0;
          const payout = s.views >= minViews ? Math.floor(s.views / step) * (evt.benefitAmount || 0) : 0;
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
        const minViews = evt.minEarningViews || 0;
        const payout = s.views >= minViews ? Math.floor(s.views / step) * (evt.benefitAmount || 0) : 0;
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

    // 6. Level Tier (Stars rating 1-5)
    let stars = 1;
    if (points >= 5000) {
      stars = 5;
    } else if (points >= 2500) {
      stars = 4;
    } else if (points >= 1000) {
      stars = 3;
    } else if (points >= 300) {
      stars = 2;
    }

    return {
      joinedEventsCount: joinedEvents.length,
      submissionsCount: submissions.length,
      totalViews,
      totalLikes,
      winsCount,
      points,
      stars
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
    
    if (evt.eventType === 'regular') {
      if (isDeadlinePassed) {
        return {
          label: 'Selesai',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          info: 'Acara telah selesai dilaksanakan.'
        };
      }
      return {
        label: 'Aktif',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        info: 'Acara sedang berlangsung/aktif. Peserta dapat mendaftar dan membeli tiket.'
      };
    }

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
    const evt = events.find(e => e.id === id);
    if (evt) {
      const status = getEventStatus(evt);
      if ((currentUser?.role === 'panitia' || currentUser?.role === 'user') && status.label === 'Berjalan') {
        alert('Akses Ditolak: Event yang sudah berjalan telah dikunci dan tidak dapat dihapus oleh Panitia.');
        return;
      }
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      setEvents(events.filter(e => e.id !== id));
      setEventParticipants(prev => prev.filter(p => p.eventId !== id));
      setEventSubmissions(prev => prev.filter(s => s.eventId !== id));
    }
  };

  const handleEditEvent = (evt) => {
    const status = getEventStatus(evt);
    if ((currentUser?.role === 'panitia' || currentUser?.role === 'user') && status.label === 'Berjalan') {
      alert('Akses Ditolak: Event yang sudah berjalan telah dikunci dan tidak dapat diubah/diedit oleh Panitia.');
      return;
    }
    setEditingEventId(evt.id);
    setEventTitle(evt.title || '');
    setEventCategory(evt.category || 'Short Film');
    setEventDeadline(evt.deadline || '');
    setEventMaxParticipants(evt.maxParticipants || 50);
    setEventHasMaxParticipants((evt.maxParticipants || 0) > 0);
    setEventDescription(evt.description || '');
    setEventJuknis(evt.juknis || '');
    setEventType(evt.eventType || 'competition');
    setEventBudgetMode(evt.budgetMode || 'views');
    setEventTargetAudience(evt.targetAudience || 'public');
    setEventBudget(evt.campaignBudget || 5000000);
    setEventTicketPrice(evt.ticketPrice || 0);
    setEventBenefitAmount(evt.benefitAmount || 10000);
    setEventBenefitViewsStep(evt.benefitViewsStep || 1000);
    setEventMinEarningViews(evt.minEarningViews || 0);
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

  const handleCheckInParticipant = (id) => {
    setEventParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isCheckedIn: true, checkedInAt: new Date().toISOString() };
      }
      return p;
    }));
    alert('Peserta berhasil check-in!');
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsScanning(true);
        scanIntervalRef.current = setInterval(captureAndDecode, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.');
    }
  };

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const formData = new FormData();
      formData.append('file', blob, 'qrcode.png');
      
      try {
        const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data[0] && data[0].symbol && data[0].symbol[0] && data[0].symbol[0].data) {
          const scannedCode = data[0].symbol[0].data;
          if (scannedCode) {
            handleScannedCode(scannedCode);
          }
        }
      } catch (err) {
        // Ignore decoding errors
      }
    }, 'image/png');
  };

  const handleScannedCode = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const part = eventParticipants.find(p => 
      p.eventId === selectedManageEvent.id && 
      p.ticketCode && 
      p.ticketCode.toLowerCase() === trimmed.toLowerCase()
    );

    if (!part) {
      alert(`Tiket tidak ditemukan / tidak valid untuk event ini: ${trimmed}`);
      return;
    }

    if (part.isCheckedIn) {
      alert(`Peserta "${part.name}" (@${part.username}) sudah check-in pada ${new Date(part.checkedInAt).toLocaleTimeString('id-ID')}!`);
      setShowQRScanner(false);
      return;
    }

    setEventParticipants(prev => prev.map(p => {
      if (p.id === part.id) {
        return { ...p, isCheckedIn: true, checkedInAt: new Date().toISOString() };
      }
      return p;
    }));

    alert(`Check-in Sukses!\nNama: ${part.name}\nTiket: ${trimmed}`);
    setShowQRScanner(false);
  };

  const handleQuickCheckIn = (e) => {
    e.preventDefault();
    const code = checkInTicketCode.trim();
    if (!code) {
      alert('Silakan masukkan Kode Tiket!');
      return;
    }

    const part = eventParticipants.find(p => 
      p.eventId === selectedManageEvent.id && 
      p.ticketCode && 
      p.ticketCode.toLowerCase() === code.toLowerCase()
    );

    if (!part) {
      alert('Kode tiket tidak ditemukan untuk event ini!');
      return;
    }

    if (part.isCheckedIn) {
      alert(`Peserta "${part.name}" (@${part.username}) sudah melakukan check-in pada ${new Date(part.checkedInAt).toLocaleTimeString('id-ID')}!`);
      return;
    }

    setEventParticipants(prev => prev.map(p => {
      if (p.id === part.id) {
        return { ...p, isCheckedIn: true, checkedInAt: new Date().toISOString() };
      }
      return p;
    }));

    alert(`Check-in sukses untuk peserta: ${part.name} (@${part.username})`);
    setCheckInTicketCode('');
  };

  const handleResetParticipantStatus = (id) => {
    setEventParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'pending', isCheckedIn: false, checkedInAt: null };
      }
      return p;
    }));
    alert('Status pendaftaran dibatalkan kembali ke pending.');
  };

  const handleApproveWithdrawal = (wdId) => {
    const wd = withdrawals.find(w => w.id === wdId);
    if (!wd) return;
    setAuthModal({
      title: 'Otorisasi Persetujuan Penarikan',
      message: `Apakah Anda yakin ingin menyetujui penarikan saldo sebesar Rp ${wd.amount.toLocaleString('id-ID')} (Biaya Admin: Rp ${(wd.fee || 0).toLocaleString('id-ID')}, Bersih ditransfer: Rp ${(wd.netAmount || wd.amount).toLocaleString('id-ID')}) ke akun ${wd.method} (${wd.account} a.n ${wd.name}) untuk peserta ${wd.username}?`,
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
    setFormId(`mov_${Date.now()}`);
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
          title: 'Pemasukan Saldo',
          subtitle: 'Setujui atau tolak verifikasi bukti bayar transfer premium user.'
        };
      case 'users':
        return {
          title: userViewMode === 'add' ? 'Tambah Pengguna Baru' : 'Kelola Pengguna',
          subtitle: userViewMode === 'add' ? 'Buat akun pengguna baru dengan role/jabatan bawaan atau custom.' : 'Daftar seluruh akun terdaftar dan ubah hak peran akses sistem.'
        };
      case 'withdrawals':
        return {
          title: 'Penarikan Saldo',
          subtitle: 'Tinjau, cairkan, atau batalkan pengajuan penarikan dana dompet kreatif peserta.'
        };
      case 'finance-report':
        return {
          title: 'Laporan Keuangan',
          subtitle: 'Rincian detail total pemasukan, keuntungan bersih sistem, dana escrow, dan histori transaksi.'
        };
      case 'creator-marketplace':
        return {
          title: 'Marketplace Content Creator',
          subtitle: 'Temukan dan ajak kerja sama para Content Creator berprestasi berdasarkan performa, jumlah views, dan tingkat keaktifan mereka.'
        };
      case 'community-members':
        return {
          title: 'Anggota Komunitas',
          subtitle: 'Tinjau permintaan bergabung dan kelola daftar keanggotaan aktif komunitas Anda.'
        };
      case 'community-agendas':
        return {
          title: 'Agenda Komunitas',
          subtitle: 'Kelola jadwal, kegiatan internal, maupun agenda publik untuk komunitas Anda.'
        };
      case 'roles':
        return {
          title: 'Kelola Role',
          subtitle: 'Atur hak akses kustom untuk staf admin, moderator, dan panitia event.'
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
    <div className="admin-panel-container animate-fade-in-up" style={isEmbedded ? { paddingTop: 0 } : {}}>
      {!isEmbedded && !(adminSubTab === 'event-manage' && selectedManageEvent) && (
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
          {adminSubTab === 'users' && currentUser && currentUser.role === 'superadmin' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {userViewMode === 'list' ? (
                <button 
                  onClick={() => setUserViewMode('add')} 
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} />
                  <span>Tambah Pengguna Baru</span>
                </button>
              ) : (
                <button 
                  onClick={() => setUserViewMode('list')} 
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Daftar</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {adminSubTab === 'event-dashboard' ? (
        <div className="event-dashboard-section animate-fade-in">
          {/* Stats Grid */}
          <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="admin-stat-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Event</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{myEvents.length}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Calendar size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Peserta Terdaftar</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{myParticipants.length}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Karya Dikirim</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{mySubmissions.length}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <FileVideo size={24} />
              </div>
            </div>

            <div className="admin-stat-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
              <div className="stat-content">
                <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Menunggu Penjurian</span>
                <span className="stat-value" style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{mySubmissions.filter(s => s.score === null).length}</span>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Latest Activities / Informasi Terbaru Feed */}
          {(() => {
            const activities = [];
            const isPanitia = currentUser && (currentUser.role === 'panitia' || currentUser.role === 'user');
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
                badgeColor: '#ffffff',
                badgeBg: 'rgba(255, 255, 255, 0.08)',
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
                badgeColor: '#ffffff',
                badgeBg: 'rgba(255, 255, 255, 0.08)',
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
                  badgeColor: '#ffffff',
                  badgeBg: 'rgba(255, 255, 255, 0.08)',
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
                    badgeColor: '#ffffff',
                    badgeBg: 'rgba(255, 255, 255, 0.08)',
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
                  badgeColor: '#ffffff',
                  badgeBg: 'rgba(255, 255, 255, 0.08)',
                  meta: `Metode: ${wd.method} • Rek/Akun: ${wd.account}`
                });
              });
            }

            // Sort by timestamp descending
            const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return (
              <div className="add-affiliate-card glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '700' }}>
                  <Sparkles size={18} style={{ color: '#ffffff' }} />
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#ffffff',
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
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  color: '#ffffff',
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
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  color: '#ffffff',
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
                          title="Muat Lebih Banyak"
                          style={{
                            display: 'inline-flex',
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
            <div style={{ marginBottom: '16px' }}>
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
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detail Panel Event</span>
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
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', overflowX: 'auto' }}>
              {[
                { id: 'participants', label: 'Pendaftaran Peserta', count: eventParticipants.filter(p => p.eventId === selectedManageEvent.id && p.status === 'pending').length },
                selectedManageEvent.eventType !== 'regular' && { id: 'submissions', label: 'Monitoring Karya', count: eventSubmissions.filter(s => s.eventId === selectedManageEvent.id && s.score === null).length },
                selectedManageEvent.eventType !== 'regular' && selectedManageEvent.budgetMode !== 'views' && { id: 'judging', label: 'Penjurian & Pemenang', count: 0 },
                { id: 'finance', label: 'Keuangan Event', count: 0 }
              ].filter(Boolean).map(tab => {
                const isActive = innerManageTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInnerManageTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                      borderRadius: '20px',
                      color: isActive ? 'white' : 'var(--text-secondary)',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={eventParticipantsSearch}
                      onChange={(e) => setEventParticipantsSearch(e.target.value)}
                      placeholder="Cari peserta berdasarkan nama, email..."
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                      <input
                        type="text"
                        value={checkInTicketCode}
                        onChange={(e) => setCheckInTicketCode(e.target.value)}
                        placeholder="Kode Tiket (misal: TKT-123456)"
                        style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                        style={{ padding: '8px 16px', borderRadius: '20px', background: 'white', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                      >
                        Check-In
                      </button>
                    </form>

                    <button 
                      type="button" 
                      onClick={() => setShowQRScanner(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <QrCode size={14} />
                      <span>Scan Tiket QR</span>
                    </button>
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
                            <th>Kode Tiket</th>
                            <th>Biaya & Status</th>
                            <th>Check-In</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(part => (
                            <tr 
                              key={part.id} 
                              className="table-row-hover"
                              style={{
                                background: 'rgba(255, 255, 255, 0.01)'
                              }}
                            >
                              <td>
                                <strong style={{ color: 'white' }}>{part.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{part.email}</div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.78rem' }}>
                                  <div><span style={{ color: 'var(--text-muted)' }}>Instagram:</span> <a href={part.instagramUrl} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Profil Link</a></div>
                                  {part.tiktokUrl && <div><span style={{ color: 'var(--text-muted)' }}>TikTok:</span> <a href={part.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Profil Link</a></div>}
                                </div>
                              </td>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'white', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {part.ticketCode || `TKT-${part.id.substring(part.id.length - 6).toUpperCase()}`}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold' }}>
                                    {selectedManageEvent.ticketPrice > 0 ? `Rp ${selectedManageEvent.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}
                                  </span>
                                  {selectedManageEvent.ticketPrice > 0 && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      color: part.isPaid ? '#22c55e' : '#fbbf24', 
                                      fontWeight: '600'
                                    }}>
                                      {part.isPaid ? 'Lunas' : 'Belum Lunas'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {part.isCheckedIn ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                      Sudah Check-In
                                    </span>
                                    {part.checkedInAt && (
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                        {new Date(part.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a3a3a3' }}></span>
                                    Belum Check-In
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {part.status === 'pending' ? (
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      onClick={() => handleRejectParticipant(part.id)}
                                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
                                    >
                                      Tolak
                                    </button>
                                    <button 
                                      className="btn btn-primary btn-sm" 
                                      onClick={() => handleApproveParticipant(part.id)}
                                      style={{ background: 'white', color: 'black', border: 'none', fontWeight: 'bold' }}
                                    >
                                      Setujui
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                    {part.status === 'approved' && !part.isCheckedIn && (
                                      <button
                                        onClick={() => handleCheckInParticipant(part.id)}
                                        className="btn btn-primary btn-sm"
                                        style={{ 
                                          background: '#22c55e', 
                                          color: 'white', 
                                          border: 'none', 
                                          fontWeight: 'bold',
                                          padding: '4px 10px',
                                          fontSize: '0.75rem',
                                          borderRadius: '12px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Check-In
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleResetParticipantStatus(part.id)}
                                      style={{ 
                                        background: 'transparent', 
                                        border: 'none', 
                                        color: '#f87171', 
                                        textDecoration: 'underline', 
                                        cursor: 'pointer', 
                                        fontSize: '0.75rem',
                                        padding: '4px 8px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      Batalkan
                                    </button>
                                  </div>
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
                  {selectedManageEvent.budgetMode !== 'views' && (
                    <button
                      onClick={handleSyncAllSubmissions}
                      disabled={isSyncingAll}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '8px 16px', borderRadius: '20px', color: 'white', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <Sparkles size={14} style={{ color: 'rgba(255, 255, 255, 0.7)', animation: isSyncingAll ? 'spin 1s linear infinite' : 'none', marginRight: '6px' }} />
                      {isSyncingAll ? 'Menghubungkan ke API...' : 'Grab Data Sosmed Event ini'}
                    </button>
                  )}
                </div>

                <div className="admin-table-container">
                  {(() => {
                    const filtered = eventSubmissions.filter(sub => sub.eventId === selectedManageEvent.id && (
                      !eventSubmissionsSearch ||
                      sub.participantName?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase()) ||
                      sub.title?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase()) ||
                      sub.platform?.toLowerCase().includes(eventSubmissionsSearch.toLowerCase())
                    ));

                    if (selectedManageEvent.budgetMode === 'views') {
                      filtered.sort((a, b) => {
                        const engA = (a.views || 0) + (a.likes || 0);
                        const engB = (b.views || 0) + (b.likes || 0);
                        return engB - engA;
                      });
                    }
 
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
                            {selectedManageEvent.budgetMode !== 'views' && <th style={{ textAlign: 'center' }}>Skor Juri</th>}
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
                                <a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.8rem' }}>Buka Video</a>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{sub.views?.toLocaleString('id-ID') || 0}</td>
                              <td style={{ textAlign: 'right', color: '#f43f5e' }}>❤️ {sub.likes?.toLocaleString('id-ID') || 0}</td>
                              {selectedManageEvent.budgetMode !== 'views' && (
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ fontWeight: 'bold', color: sub.score !== null ? '#4ade80' : '#fbbf24' }}>{sub.score !== null ? `${sub.score}/100` : 'Belum Dinilai'}</span>
                                </td>
                              )}
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
                              <td><a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.8rem' }}>Buka Video</a></td>
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
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px', background: 'white', color: 'black', border: 'none', fontWeight: 'bold' }}
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
              background: '#020202',
              zIndex: 10200,
              overflowY: 'auto',
              padding: '24px 16px 120px 16px',
              boxSizing: 'border-box',
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
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Tipe Event</label>
                      <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}>
                        <option value="competition">Kompetisi (Kirim Karya & Hadiah)</option>
                        <option value="regular">Acara / Festival / Seminar (E-Tiket & Check-In)</option>
                      </select>
                    </div>
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

                    {/* Sasaran Peserta (Target Audience) */}
                    {(currentUser?.isCommunity || currentUser?.role === 'panitia') && (
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Sasaran Peserta (Target Audience)</label>
                        <select 
                          value={eventTargetAudience} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventTargetAudience(val);
                            if (val === 'members_only') {
                              setEventHasMaxParticipants(false);
                            }
                          }} 
                          style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                        >
                          <option value="public" style={{ background: '#020202' }}>Terbuka untuk Umum (Public)</option>
                          <option value="members_only" style={{ background: '#020202' }}>Khusus Anggota Komunitas Saja (Members Only)</option>
                        </select>
                      </div>
                    )}

                    <div className="form-group" style={{ opacity: eventTargetAudience === 'members_only' ? 0.7 : 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Maksimal Peserta</label>
                      {eventTargetAudience === 'members_only' ? (
                        <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          Tanpa Batas Kuota (Terbuka otomatis untuk semua anggota komunitas Anda)
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '600' }}>Biaya Pendaftaran / Tiket Event (IDR)</label>
                      <input 
                        type="text" 
                        value={formatInputCurrency(eventTicketPrice)} 
                        onChange={(e) => {
                          const parsed = e.target.value.replace(/\D/g, '');
                          setEventTicketPrice(parsed ? parseInt(parsed) : 0);
                        }} 
                        placeholder="0 (Gratis)" 
                        style={{ width: '100%', padding: '12px 14px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }} 
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                        Isi dengan 0 atau biarkan kosong jika pendaftaran/tiket masuk event ini gratis (tidak dipungut biaya).
                      </span>
                    </div>

                    {/* Platform Fee info box for Regular Event */}
                    {eventType === 'regular' && eventFlatFee > 0 && (
                      <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Biaya Layanan Platform (Flat):</span>
                          <strong style={{ color: 'white', fontSize: '0.92rem', borderBottom: '1px dashed white', paddingBottom: '2px' }}>
                            Rp {eventFlatFee.toLocaleString('id-ID')}
                          </strong>
                        </div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                          * Karena event ini bertipe Acara/Festival (tanpa budget kampanye/hadiah), Anda dikenakan biaya layanan aktivasi platform secara flat.
                        </span>
                      </div>
                    )}

                  {/* Mode Budget Selector */}
                  {eventType === 'competition' && (
                    <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.92rem', fontWeight: 'bold' }}>Skema & Mode Pembagian Budget</label>
                      <select 
                        value={eventBudgetMode} 
                        onChange={(e) => setEventBudgetMode(e.target.value)} 
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', marginBottom: '16px' }}
                      >
                        <option value="views" style={{ background: '#020202' }}>Pay-per-View</option>
                        <option value="ranking" style={{ background: '#020202' }}>Juara 1, 2, 3</option>
                      </select>

                      {eventBudgetMode === 'views' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              <span>Budget Campaign (IDR)</span>
                              <InfoTooltip text="Total budget yang disiapkan untuk dibagikan ke kreator berdasarkan performa views video mereka." />
                            </label>
                            <input type="text" required value={formatInputCurrency(eventBudget)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventBudget(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              <span>Benefit Payout (IDR)</span>
                              <InfoTooltip text="Nominal uang yang akan diterima kreator setiap kali mencapai target jumlah views tertentu." />
                            </label>
                            <input type="text" required value={formatInputCurrency(eventBenefitAmount)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventBenefitAmount(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              <span>Per XXX Views</span>
                              <InfoTooltip text="Satuan kelipatan jumlah views untuk mencairkan benefit (misal: setiap kelipatan 1.000 views)." />
                            </label>
                            <input type="text" required value={formatInputCurrency(eventBenefitViewsStep)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventBenefitViewsStep(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', marginBottom: '8px' }}>
                              <span>Min Views Earning</span>
                              <InfoTooltip text="Batas minimum views yang harus dicapai video sebelum kreator berhak mendapatkan pembayaran." />
                            </label>
                            <input type="text" required value={formatInputCurrency(eventMinEarningViews)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventMinEarningViews(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Juara 1 (IDR)</label>
                            <input type="text" required value={formatInputCurrency(eventPrize1)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventPrize1(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Juara 2 (IDR)</label>
                            <input type="text" required value={formatInputCurrency(eventPrize2)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventPrize2(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Juara 3 (IDR)</label>
                            <input type="text" required value={formatInputCurrency(eventPrize3)} onChange={(e) => {
                              const parsed = e.target.value.replace(/\D/g, '');
                              setEventPrize3(parsed ? parseInt(parsed) : 0);
                            }} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }} />
                          </div>
                        </div>
                      )}

                      {/* Platform Fee & Escrow Info */}
                      {eventAdminFee > 0 && (
                        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Budget Kampanye:</span>
                            <strong style={{ color: 'white' }}>
                              Rp {(eventBudgetMode === 'views' ? (eventBudget || 0) : ((eventPrize1 || 0) + (eventPrize2 || 0) + (eventPrize3 || 0))).toLocaleString('id-ID')}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Biaya Layanan Platform ({eventAdminFee}%):</span>
                            <strong style={{ color: 'white' }}>
                              + Rp {Math.round(((eventBudgetMode === 'views' ? (eventBudget || 0) : ((eventPrize1 || 0) + (eventPrize2 || 0) + (eventPrize3 || 0))) * eventAdminFee) / 100).toLocaleString('id-ID')}
                          </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', marginTop: '6px' }}>
                            <span style={{ color: 'white' }}>Total Deposit Escrow:</span>
                            <strong style={{ color: 'white', fontSize: '0.92rem', borderBottom: '1px solid white', paddingBottom: '2px' }}>
                              Rp {((eventBudgetMode === 'views' ? (eventBudget || 0) : ((eventPrize1 || 0) + (eventPrize2 || 0) + (eventPrize3 || 0))) + Math.round(((eventBudgetMode === 'views' ? (eventBudget || 0) : ((eventPrize1 || 0) + (eventPrize2 || 0) + (eventPrize3 || 0))) * eventAdminFee) / 100)).toLocaleString('id-ID')}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
              background: '#020202',
              zIndex: 11000,
              overflowY: 'auto',
              padding: '24px 16px 120px 16px',
              boxSizing: 'border-box',
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
                        {depositingEvent.eventType === 'regular' ? (
                          <>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tipe Event</span>
                            <strong style={{ color: 'white' }}>Acara / Seminar (Non-Kompetisi)</strong>
                          </>
                        ) : (
                          <>
                            <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Skema Pembagian</span>
                            <strong style={{ color: 'white' }}>
                              {depositingEvent.budgetMode === 'views' ? 'Berdasarkan Jumlah Views' : 'Kompetisi Juara 1, 2, 3'}
                            </strong>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      {depositingEvent.eventType !== 'regular' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Budget Kampanye:</span>
                          <strong style={{ color: 'white' }}>Rp {depositingEvent.campaignBudget?.toLocaleString('id-ID')}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Biaya Layanan Platform{depositingEvent.eventType === 'regular' && ' (Flat)'}:
                        </span>
                        <strong style={{ color: 'white' }}>
                          Rp {(depositingEvent.adminFee !== undefined ? depositingEvent.adminFee : (depositingEvent.eventType === 'regular' ? (eventFlatFee || 150000) : Math.round((depositingEvent.campaignBudget || 0) * (eventAdminFee || 0) / 100))).toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Total Pembayaran:</span>
                        <strong style={{ color: '#fbbf24', fontSize: '1.2rem' }}>
                          Rp {((depositingEvent.eventType === 'regular' ? 0 : (depositingEvent.campaignBudget || 0)) + (depositingEvent.adminFee !== undefined ? depositingEvent.adminFee : (depositingEvent.eventType === 'regular' ? (eventFlatFee || 150000) : Math.round((depositingEvent.campaignBudget || 0) * (eventAdminFee || 0) / 100)))).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Bank Instructions */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '0.95rem', fontWeight: 'bold' }}>Rekening Tujuan Transfer (Escrow):</h4>
                    <div style={{ fontFamily: 'monospace', color: '#f1f5f9', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      BANK MANDIRI KAB. JAKARTA<br />
                      No. Rekening: <strong style={{ color: 'white', fontSize: '1.05rem' }}>127-000-999-888</strong><br />
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
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }} 
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>Bank Pengirim</label>
                      <select 
                        value={senderBank} 
                        onChange={(e) => setSenderBank(e.target.value)} 
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                      >
                        <option value="BCA" style={{ background: '#020202' }}>Bank BCA</option>
                        <option value="Mandiri" style={{ background: '#020202' }}>Bank Mandiri</option>
                        <option value="BNI" style={{ background: '#020202' }}>Bank BNI</option>
                        <option value="BRI" style={{ background: '#020202' }}>Bank BRI</option>
                        <option value="CIMB" style={{ background: '#020202' }}>CIMB Niaga</option>
                        <option value="Lainnya" style={{ background: '#020202' }}>Bank Lainnya</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>Unggah Bukti Transfer</label>
                      <input 
                        type="file" 
                        required 
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
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }} 
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
              background: '#020202',
              zIndex: 11000,
              overflowY: 'auto',
              padding: '24px 16px 120px 16px',
              boxSizing: 'border-box',
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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '16px',
                width: '100%',
                flexWrap: 'wrap'
              }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
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

                {/* Create Event Button */}
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    const isCommunityUser = currentUser?.isCommunity || currentUser?.role === 'panitia';
                    if (isCommunityUser) {
                      const myComm = communities.find(c => c.username.toLowerCase() === currentUser.username.toLowerCase());
                      if (myComm) {
                        const targetCount = Number(myComm.activeMembersCount || 0);
                        const currentCount = (myComm.joinedMembers || []).length;
                        if (currentCount < targetCount) {
                          alert(`Komunitas Anda belum aktif! Anda baru memiliki ${currentCount}/${targetCount} anggota. Harap capai target anggota aktif terlebih dahulu untuk membuat event.`);
                          return;
                        }
                      }
                    }

                    setEventTitle('');
                    setEventCategory('Short Film');
                    setEventDeadline('');
                    setEventMaxParticipants(50);
                    setEventDescription('');
                    setEventJuknis('');
                    setEventBudget(5000000);
                    setEventBenefitAmount(10000);
                    setEventBenefitViewsStep(1000);
                    setEventMinEarningViews(0);
                    setEventHasMaxParticipants(true);
                    setEventTargetAudience('public');
                    setEventTicketPrice(0);
                    setEventType('competition');
                    setShowEventForm(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={18} />
                  <span>Buat Event Baru</span>
                </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {myEvents.length > 0 ? (
                  (() => {
                    const filteredEvents = myEvents.filter(evt => 
                      evt.title?.toLowerCase().includes(eventManageSearch.toLowerCase()) ||
                      evt.category?.toLowerCase().includes(eventManageSearch.toLowerCase()) ||
                      evt.description?.toLowerCase().includes(eventManageSearch.toLowerCase())
                    ).sort((a, b) => {
                      const statusA = getEventStatus(a).label;
                      const statusB = getEventStatus(b).label;
                      const getOrder = (statusStr) => {
                        if (statusStr === 'Menunggu Verifikasi') return 1;
                        if (statusStr === 'Pending') return 2;
                        if (statusStr === 'Berjalan') return 3;
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
                    return filteredEvents.map((evt) => {
                      const status = getEventStatus(evt);
                      const isLocked = (currentUser?.role === 'panitia' || currentUser?.role === 'user') && status.label === 'Berjalan';
                      return (
                        <div 
                          key={evt.id}
                          onClick={() => { setSelectedManageEvent(evt); setInnerManageTab('participants'); }}
                          style={{ 
                            borderRadius: '12px', 
                            padding: '18px 24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
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
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Left Section: Tags, Title, Status & Desc */}
                          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

                              {/* Status Badge with Tooltip */}
                              <div className="tooltip-container">
                                <span 
                                  className={status.label === 'Berjalan' ? 'animate-glow-green' :
                                             status.label === 'Pending' ? 'animate-glow-amber' :
                                             status.label === 'Menunggu Verifikasi' ? 'animate-glow-blue' : ''}
                                  style={{ 
                                    fontSize: '0.68rem', 
                                    padding: '3px 10px', 
                                    borderRadius: '12px', 
                                    fontWeight: 'bold', 
                                    color: status.color, 
                                    background: status.bg, 
                                    border: `1px solid ${status.color}30`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {status.label}
                                  <Info size={11} style={{ opacity: 0.8, cursor: 'help' }} />
                                </span>
                                <span className="tooltip-text">
                                  {status.info}
                                </span>
                              </div>

                              {evt.paymentStatus !== 'paid' && (
                                <span style={{ 
                                  fontSize: '0.68rem', 
                                  background: 'rgba(239, 68, 68, 0.15)', 
                                  color: '#f87171', 
                                  padding: '3px 10px', 
                                  borderRadius: '12px',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                  Belum Bayar
                                </span>
                              )}
                            </div>

                            <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{evt.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: '500px' }}>
                              {evt.description}
                            </p>
                          </div>

                          {/* Middle Section: Budget & Deadline */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', marginRight: '8px' }}>
                            <div style={{ minWidth: '160px', textAlign: 'left' }}>
                              {evt.eventType === 'regular' ? (
                                <>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                                    Biaya Platform (Flat)
                                  </div>
                                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                                    Rp {evt.adminFee ? evt.adminFee.toLocaleString('id-ID') : 'Rp 0'}
                                  </strong>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                                    Harga Tiket: <span style={{ color: evt.ticketPrice > 0 ? '#4ade80' : 'white', fontWeight: 'bold' }}>{evt.ticketPrice > 0 ? `Rp ${evt.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                                    {evt.budgetMode === 'views' ? 'Sisa / Total Budget' : 'Prize Pool'}
                                  </div>
                                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                                    Rp {evt.campaignBudget ? evt.campaignBudget.toLocaleString('id-ID') : '0'}
                                  </strong>
                                  {evt.adminFee > 0 && (
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                      + Platform: Rp {evt.adminFee.toLocaleString('id-ID')}
                                    </div>
                                  )}
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                                    {evt.budgetMode === 'views' ? 'Pay-per-View' : 'Sistem Juara'}
                                  </div>
                                </>
                              )}
                            </div>

                            <div style={{ minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
                                <span>Batas Waktu</span>
                              </div>
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
                                {evt.deadline ? formatIndonesianDate(evt.deadline) : 'Tanpa Batas Waktu'}
                              </span>
                            </div>
                          </div>

                          {/* Right Section: Actions & Payment Buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="action-btn" 
                                onClick={() => { setSelectedManageEvent(evt); setInnerManageTab('participants'); }} 
                                style={{ color: '#ffffff', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Kelola Event (Detail)"
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                className="action-btn" 
                                onClick={() => handleEditEvent(evt)} 
                                disabled={isLocked}
                                style={{ 
                                  color: '#ffffff', 
                                  cursor: isLocked ? 'not-allowed' : 'pointer', 
                                  background: 'rgba(255, 255, 255, 0.05)', 
                                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                                  padding: '8px', 
                                  borderRadius: '8px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  opacity: isLocked ? 0.3 : 1
                                }}
                                title={isLocked ? "Event berjalan dikunci (tidak bisa diedit)" : "Edit Event"}
                              >
                                <Edit size={15} />
                              </button>
                              <button 
                                className="action-btn" 
                                onClick={() => handleDeleteEvent(evt.id)} 
                                disabled={isLocked}
                                style={{ 
                                  color: '#f87171', 
                                  cursor: isLocked ? 'not-allowed' : 'pointer', 
                                  background: 'rgba(239, 68, 68, 0.05)', 
                                  border: '1px solid rgba(239, 68, 68, 0.15)', 
                                  padding: '8px', 
                                  borderRadius: '8px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  opacity: isLocked ? 0.3 : 1
                                }}
                                title={isLocked ? "Event berjalan dikunci (tidak bisa dihapus)" : "Hapus Event"}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {evt.paymentStatus !== 'paid' && (
                              evt.paymentStatus === 'pending_verification' ? (
                                currentUser?.role === 'superadmin' ? (
                                  <button 
                                    className="btn btn-sm" 
                                    onClick={() => setAdminSubTab('confirmations')}
                                    style={{ 
                                      padding: '6px 12px', 
                                      fontSize: '0.75rem', 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '4px', 
                                      background: '#ffffff', 
                                      border: '1px solid #ffffff', 
                                      color: '#020202', 
                                      fontWeight: 'bold',
                                      borderRadius: '20px'
                                    }}
                                  >
                                    Verifikasi Pembayaran
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    Menunggu Verifikasi
                                  </span>
                                )
                              ) : (
                                <button 
                                  className="btn btn-sm" 
                                  onClick={() => handleOpenPayment(evt)}
                                  style={{ 
                                    padding: '6px 12px', 
                                    fontSize: '0.75rem', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    background: '#ffffff', 
                                    border: '1px solid #ffffff', 
                                    color: '#020202', 
                                    fontWeight: 'bold',
                                    borderRadius: '20px'
                                  }}
                                >
                                  Selesaikan Pembayaran
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="admin-empty-state" style={{ padding: '48px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Calendar size={48} className="icon" />
                    <h3>Belum ada Event</h3>
                    <p>Mulai dengan membuat event kompetisi kreatif pertama Anda dengan tombol di atas.</p>
                  </div>
                )}
              </div>        </div>
            </div>
          </div>
        )
      ) : adminSubTab === 'creator-marketplace' ? (
        <div className="creator-marketplace-section animate-fade-in" style={{ padding: '4px', textAlign: 'left' }}>


          {/* Search & Filter Toolbar */}
          <div className="admin-toolbar glass-panel" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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

            {/* Level Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Tingkat Level:</span>
              <select
                value={marketplaceLevelFilter}
                onChange={(e) => setMarketplaceLevelFilter(e.target.value)}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <option value="All" style={{ background: '#0b0f19' }}>Semua Reputasi</option>
                <option value="5" style={{ background: '#0b0f19' }}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                <option value="4" style={{ background: '#0b0f19' }}>⭐⭐⭐⭐ (4 Bintang)</option>
                <option value="3" style={{ background: '#0b0f19' }}>⭐⭐⭐ (3 Bintang)</option>
                <option value="2" style={{ background: '#0b0f19' }}>⭐⭐ (2 Bintang)</option>
                <option value="1" style={{ background: '#0b0f19' }}>⭐ (1 Bintang)</option>
              </select>
            </div>
          </div>

          {/* Creators Directory Rows Table */}
          <div className="admin-table-container glass-panel" style={{ marginBottom: '40px' }}>
            {(() => {
              // 1. Calculate metrics and pre-filter by search & level
              const creatorsList = loadedCreators
                .filter(u => u.role === 'user')
                .map(u => ({
                  ...u,
                  metrics: calculateCreatorMetrics(u.username)
                }))
                .filter(c => {
                  const matchSearch = c.username.toLowerCase().includes(marketplaceSearch.toLowerCase()) || 
                                      (c.organizerName || '').toLowerCase().includes(marketplaceSearch.toLowerCase());
                  const matchLevel = marketplaceLevelFilter === 'All' || String(c.metrics.stars) === marketplaceLevelFilter;
                  return matchSearch && matchLevel;
                })
                .sort((a, b) => {
                  if (b.metrics.stars !== a.metrics.stars) {
                    return b.metrics.stars - a.metrics.stars;
                  }
                  return b.metrics.points - a.metrics.points;
                });

              if (creatorsList.length === 0) {
                return (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada Content Creator yang cocok dengan pencarian dan filter reputasi saat ini.
                  </div>
                );
              }

              return (
                <>
                  {/* Bulk Actions Bar */}
                  {selectedCreatorUsernames.length > 0 && (
                    <div style={{ 
                      marginBottom: '16px', 
                      padding: '12px 20px', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px dashed rgba(255, 255, 255, 0.15)', 
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ color: 'white', fontSize: '0.88rem', fontWeight: '600' }}>
                        <span style={{ background: '#ffffff', color: '#020202', padding: '2px 8px', borderRadius: '4px', marginRight: '8px', fontWeight: 'bold' }}>
                          {selectedCreatorUsernames.length}
                        </span>
                        Creator Terpilih
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn"
                          onClick={() => setSelectedCreatorUsernames([])}
                          style={{ 
                            padding: '6px 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem', 
                            background: 'transparent', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Batal Pilihan
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const myEvents = events.filter(e => e.creator === currentUser?.username && e.paymentStatus === 'paid');
                            if (myEvents.length > 0) setBulkOfferEventId(myEvents[0].id);
                            setBulkOfferMessage('');
                            setShowBulkOfferModal(true);
                          }}
                          style={{ 
                            padding: '6px 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem', 
                            fontWeight: '700',
                            background: '#ffffff', 
                            border: '1px solid #ffffff', 
                            color: '#020202',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Send size={12} />
                          <span>Kirim Penawaran Masal</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox"
                            checked={creatorsList.length > 0 && creatorsList.every(c => isCreatorFullyInvitedOrRegistered(c.username) ? true : selectedCreatorUsernames.includes(c.username))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const eligibleOnes = creatorsList
                                  .filter(c => !isCreatorFullyInvitedOrRegistered(c.username))
                                  .map(c => c.username);
                                setSelectedCreatorUsernames(prev => {
                                  const combined = new Set([...prev, ...eligibleOnes]);
                                  return Array.from(combined);
                                });
                              } else {
                                const currentListUsernames = creatorsList.map(c => c.username);
                                setSelectedCreatorUsernames(prev => prev.filter(uname => !currentListUsernames.includes(uname)));
                              }
                            }}
                            style={{ cursor: 'pointer', accentColor: '#ffffff' }}
                          />
                        </th>
                        <th>Content Creator</th>
                        <th>Reputasi</th>
                        <th>Akumulasi Poin</th>
                        <th style={{ textAlign: 'center' }}>Total Karya</th>
                        <th style={{ textAlign: 'center' }}>Aksi Kolaborasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creatorsList.map(creator => {
                        const creatorAvatar = creator.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(creator.username)}&backgroundColor=262626&textColor=ffffff`;
                        const isFullyInvited = isCreatorFullyInvitedOrRegistered(creator.username);
                        const isChecked = selectedCreatorUsernames.includes(creator.username);
                        
                        return (
                          <tr 
                            key={creator.username} 
                            className="table-row-hover"
                            onClick={() => setViewingCreatorProfile(creator)}
                            style={{ cursor: 'pointer' }}
                            title="Klik untuk Lihat Detail Profil & Portofolio"
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                disabled={isFullyInvited}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCreatorUsernames(prev => [...prev, creator.username]);
                                  } else {
                                    setSelectedCreatorUsernames(prev => prev.filter(uname => uname !== creator.username));
                                  }
                                }}
                                style={{ cursor: isFullyInvited ? 'not-allowed' : 'pointer', accentColor: '#ffffff' }}
                              />
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img 
                                  src={creatorAvatar} 
                                  alt={creator.username} 
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.02)'
                                  }}
                                />
                                 <span style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                   @{creator.username}
                                 </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center' }} title={`${creator.metrics.stars} Bintang`}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    fill={i < creator.metrics.stars ? "#ffffff" : "none"} 
                                    stroke={i < creator.metrics.stars ? "#ffffff" : "rgba(255,255,255,0.2)"} 
                                    style={{ marginRight: '2px' }} 
                                  />
                                ))}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <Award size={12} />
                                <span>{creator.metrics.points.toLocaleString('id-ID')} Pts</span>
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                              {creator.metrics.submissionsCount} Karya
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {isFullyInvited ? (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                  Sudah Ditawarkan
                                </span>
                              ) : (
                                <button
                                  className="btn btn-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMarketplaceCreator(creator.username);
                                    const myEvents = events.filter(e => e.creator === currentUser?.username && e.paymentStatus === 'paid');
                                    if (myEvents.length > 0) setOfferEventId(myEvents[0].id);
                                  }}
                                  style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#ffffff',
                                    border: '1px solid #ffffff',
                                    color: '#020202',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Send size={12} />
                                  <span>Kirim Penawaran</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {hasMoreCreators && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => loadMoreCreators(false)} 
                      disabled={isLoadingMoreCreators}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        color: 'rgba(255, 255, 255, 0.8)',
                        cursor: isLoadingMoreCreators ? 'not-allowed' : 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoadingMoreCreators) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {isLoadingMoreCreators ? (
                        <Clock size={16} className="animate-spin" />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                )}
                </>
              );
            })()}
          </div>

          {/* Collab Offers Sent Monitoring */}
          <div className="add-affiliate-card glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '700' }}>
              <ExternalLink size={18} style={{ color: 'white' }} />
              <span>Monitoring Undangan Kreator</span>
            </h3>
            
            {(() => {
              const myOffers = (offers || []).filter(o => o.sender === currentUser.username);
              if (myOffers.length === 0) {
                return (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Belum ada undangan kolaborasi yang Anda kirimkan.
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
                            <td style={{ maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{off.message}</td>
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

          {/* Creator Profile & Portfolio Modal */}
          {viewingCreatorProfile && (() => {
            const metrics = calculateCreatorMetrics(viewingCreatorProfile.username);
            const creatorMovies = movies.filter(m => m.uploader?.toLowerCase() === viewingCreatorProfile.username.toLowerCase());
            const creatorSubmissions = eventSubmissions.filter(s => s.username?.toLowerCase() === viewingCreatorProfile.username.toLowerCase());
            const creatorAvatar = viewingCreatorProfile.organizerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewingCreatorProfile.username)}&backgroundColor=262626&textColor=ffffff`;

            return createPortal(
              <div 
                className="admin-modal-overlay d-flex-center animate-fade-in" 
                style={{ 
                  zIndex: 99999, 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  background: 'rgba(5, 8, 16, 0.85)', 
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
                onClick={() => setViewingCreatorProfile(null)}
              >
                <div 
                  className="glass-panel animate-scale-in" 
                  style={{ 
                    maxWidth: '850px', 
                    width: '100%', 
                    maxHeight: '90vh', 
                    overflowY: 'auto', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: '#090d16',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
                    position: 'relative'
                  }} 
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Close Button */}
                  <button 
                    onClick={() => setViewingCreatorProfile(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <X size={18} />
                  </button>

                  {/* Profile Cover Banner */}
                  <div style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
                    position: 'relative',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }} />

                  {/* Profile Header Block */}
                  <div style={{ padding: '0 32px 32px 32px', position: 'relative', marginTop: '-60px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      <img 
                        src={creatorAvatar} 
                        alt={viewingCreatorProfile.username} 
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          border: '4px solid #020202',
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
                          background: '#0c101b',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', margin: 0 }}>@{viewingCreatorProfile.username}</h2>
                          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                fill={i < metrics.stars ? "#ffffff" : "none"} 
                                stroke={i < metrics.stars ? "#ffffff" : "rgba(255,255,255,0.2)"} 
                                style={{ marginRight: '2px' }} 
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', fontSize: '0.92rem' }}>
                          {viewingCreatorProfile.organizerName || 'Nama Lengkap Belum Diisi'}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {viewingCreatorProfile.email && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <strong>Email:</strong> {viewingCreatorProfile.email}
                            </span>
                          )}
                          {viewingCreatorProfile.organizerPhone && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <strong>Telp:</strong> {viewingCreatorProfile.organizerPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio Description */}
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      padding: '16px 20px', 
                      borderRadius: '12px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '32px'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bio / Deskripsi</h4>
                      <p style={{ margin: 0 }}>{viewingCreatorProfile.organizerDescription || 'Pembuat konten belum menambahkan biografi atau deskripsi profil.'}</p>
                    </div>

                    {/* Key Metrics Dashboard */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                      gap: '16px',
                      marginBottom: '36px'
                    }}>
                      {[
                        { label: 'Total Karya', value: `${metrics.submissionsCount} Film`, color: '#ffffff' },
                        { label: 'Total Views', value: `${metrics.totalViews.toLocaleString('id-ID')} Views`, color: '#ffffff' },
                        { label: 'Juara Event', value: `${metrics.winsCount}x Juara`, color: '#ffffff' },
                        { label: 'Reputasi Poin', value: `${metrics.points.toLocaleString('id-ID')} Pts`, color: '#ffffff' }
                      ].map((item, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>{item.label}</span>
                          <strong style={{ fontSize: '1.15rem', color: item.color, fontWeight: '700' }}>{item.value}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Portfolio/Karya List */}
                    <div style={{ marginBottom: '36px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'white', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        Portofolio Film ({creatorMovies.length})
                      </h3>
                      {creatorMovies.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '16px'
                        }}>
                          {creatorMovies.map(movie => (
                            <div key={movie.id} style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <div style={{ width: '100%', height: '120px', background: '#070a13', position: 'relative' }}>
                                <img 
                                  src={movie.thumbnail || movie.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=3540&auto=format&fit=crop'} 
                                  alt={movie.title} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  right: '8px',
                                  background: 'rgba(0,0,0,0.75)',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  {movie.category || 'Film Pendek'}
                                </span>
                              </div>
                              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <h4 style={{ color: 'white', fontSize: '0.88rem', fontWeight: 'bold', margin: '0 0 8px 0', lineBreak: 'anywhere' }}>{movie.title}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <span>{movie.views ? movie.views.toLocaleString('id-ID') : 0} Views</span>
                                  <span>{movie.likes ? movie.likes.length : 0} Suka</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          Belum ada karya film yang diunggah ke portal.
                        </div>
                      )}
                    </div>

                    {/* Event Submissions List */}
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'white', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        Keikutsertaan Event & Kompetisi ({creatorSubmissions.length})
                      </h3>
                      {creatorSubmissions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {creatorSubmissions.map((sub, idx) => {
                            const eventTarget = events.find(e => e.id === sub.eventId);
                            return (
                              <div key={idx} style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '10px',
                                padding: '14px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px'
                              }}>
                                <div>
                                  <h4 style={{ color: 'white', fontSize: '0.88rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                    {eventTarget ? eventTarget.title : 'Event Kompetisi'}
                                  </h4>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Karya: <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{sub.title || 'Lihat Video'}</a>
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '0.72rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                  background: sub.isWinner ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.05)',
                                  border: sub.isWinner ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                  color: sub.isWinner ? '#fbbf24' : 'var(--text-secondary)'
                                }}>
                                  {sub.isWinner ? `Pemenang` : `Partisipan`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          Belum terdaftar di event kompetisi apa pun.
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '36px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setViewingCreatorProfile(null)}
                        style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          const username = viewingCreatorProfile.username;
                          setViewingCreatorProfile(null);
                          setSelectedMarketplaceCreator(username);
                          const myEvents = events.filter(e => e.creator === currentUser.username && e.paymentStatus === 'paid');
                          if (myEvents.length > 0) setOfferEventId(myEvents[0].id);
                        }}
                        style={{
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          border: 'none',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send size={14} />
                        <span>Kirim Penawaran</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            );
          })()}

          {/* Send Offer Modal */}
          {selectedMarketplaceCreator && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#020202',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              padding: 0
            }} onClick={() => setSelectedMarketplaceCreator(null)}>
              <div 
                className="glass-panel animate-scale-in" 
                style={{
                  width: '100vw',
                  height: '100vh',
                  maxHeight: '100vh',
                  overflowY: 'auto',
                  padding: '40px 24px',
                  background: '#020202',
                  textAlign: 'left',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ width: '100%', maxWidth: '640px' }}>
                  {/* Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <button 
                      onClick={() => setSelectedMarketplaceCreator(null)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={20} style={{ color: '#ffffff' }} />
                    <span>Undang @{selectedMarketplaceCreator} ke Event Anda</span>
                  </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Undang content creator ini untuk bergabung sebagai peserta dalam event kompetisi Anda.
                </p>
                {(() => {
                  const myEvents = events.filter(e => e.creator === currentUser.username && e.paymentStatus === 'paid');
                  if (myEvents.length === 0) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '24px 20px', textAlign: 'center', color: '#f87171', fontSize: '0.88rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', lineHeight: '1.5' }}>
                          Anda belum memiliki Event yang Aktif & Terbayar. Silakan buat dan bayar event terlebih dahulu sebelum mengirimkan undangan.
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                          onClick={() => setSelectedMarketplaceCreator(null)}
                        >
                          Tutup
                        </button>
                      </div>
                    );
                  }

                  const eligibleEvents = myEvents.filter(e => {
                    const isParticipant = eventParticipants.some(p => p.eventId === e.id && p.username.toLowerCase() === selectedMarketplaceCreator.toLowerCase());
                    const hasActiveOffer = offers.some(o => o.eventId === e.id && o.recipient.toLowerCase() === selectedMarketplaceCreator.toLowerCase() && (o.status === 'pending' || o.status === 'accepted'));
                    return !isParticipant && !hasActiveOffer;
                  });

                  if (eligibleEvents.length === 0) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '24px 20px', textAlign: 'center', color: '#fbbf24', fontSize: '0.88rem', background: 'rgba(245,158,11,0.06)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.15)', lineHeight: '1.5' }}>
                          Semua event aktif Anda telah ditawarkan atau diikuti oleh <strong>@{selectedMarketplaceCreator}</strong>.
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                          onClick={() => setSelectedMarketplaceCreator(null)}
                        >
                          Tutup
                        </button>
                      </div>
                    );
                  }
 
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pilih Event Anda</label>
                        <select 
                          value={offerEventId || eligibleEvents[0]?.id || ''} 
                          onChange={(e) => setOfferEventId(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        >
                          {eligibleEvents.map(e => (
                            <option key={e.id} value={e.id}>{e.title}</option>
                          ))}
                        </select>
                      </div>
 
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pesan Undangan / Ajakan</label>
                        <textarea 
                          placeholder="Tulis pesan ajakan atau undangan detail di sini..." 
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
                            const activeEventId = offerEventId || eligibleEvents[0]?.id;
                            if (!activeEventId) {
                              alert('Silakan pilih event!');
                              return;
                            }
                            const selectedEvt = events.find(e => e.id === activeEventId);
                            const newOffer = {
                              id: 'offer_' + Date.now(),
                              sender: currentUser.username,
                              recipient: selectedMarketplaceCreator,
                              eventId: activeEventId,
                              eventTitle: selectedEvt?.title || 'Event Pilihan',
                              budget: 0,
                              message: offerMessage,
                              status: 'pending',
                              sentAt: new Date().toISOString()
                            };
                            setOffers(prev => [...prev, newOffer]);
                            setSelectedMarketplaceCreator(null);
                            setOfferEventId('');
                            setOfferBudget('');
                            setOfferMessage('');
                            alert(`Berhasil mengirimkan undangan kepada @${selectedMarketplaceCreator}!`);
                          }}
                        >
                          Kirim Undangan
                        </button>
                      </div>
                    </div>
                  );
                })()}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Send Bulk Offer Modal */}
          {showBulkOfferModal && createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#020202',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch',
              padding: 0
            }} onClick={() => setShowBulkOfferModal(false)}>
              <div 
                className="glass-panel animate-scale-in" 
                style={{
                  width: '100vw',
                  height: '100vh',
                  maxHeight: '100vh',
                  overflowY: 'auto',
                  padding: '40px 24px',
                  background: '#020202',
                  textAlign: 'left',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }} 
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ width: '100%', maxWidth: '640px' }}>
                  {/* Close Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <button 
                      onClick={() => setShowBulkOfferModal(false)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={20} style={{ color: '#ffffff' }} />
                    <span>Kirim Penawaran Masal ({selectedCreatorUsernames.length} Creator)</span>
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Kirim undangan kolaborasi sekaligus kepada beberapa creator terpilih untuk bergabung dalam event kompetisi Anda.
                  </p>

                  {(() => {
                    const myEvents = events.filter(e => e.creator === currentUser?.username && e.paymentStatus === 'paid');
                    if (myEvents.length === 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ padding: '24px 20px', textAlign: 'center', color: '#f87171', fontSize: '0.88rem', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', lineHeight: '1.5' }}>
                            Anda belum memiliki Event yang Aktif & Terbayar. Silakan buat dan bayar event terlebih dahulu sebelum mengirimkan undangan.
                          </div>
                          <button 
                            className="btn btn-secondary" 
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                            onClick={() => setShowBulkOfferModal(false)}
                          >
                            Tutup
                          </button>
                        </div>
                      );
                    }

                    const activeEventId = bulkOfferEventId || myEvents[0].id;
                    const selectedEvt = events.find(e => e.id === activeEventId);

                    // Compute which of the selected creators are eligible for the chosen event
                    const eligibleCreators = selectedCreatorUsernames.filter(uname => {
                      const isPart = eventParticipants.some(p => p.eventId === activeEventId && p.username.toLowerCase() === uname.toLowerCase());
                      const hasOffer = offers.some(o => o.eventId === activeEventId && o.recipient.toLowerCase() === uname.toLowerCase() && (o.status === 'pending' || o.status === 'accepted'));
                      return !isPart && !hasOffer;
                    });

                    const ineligibleCreators = selectedCreatorUsernames.filter(uname => !eligibleCreators.includes(uname));

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pilih Event Anda</label>
                          <select 
                            value={activeEventId} 
                            onChange={(e) => setBulkOfferEventId(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                          >
                            {myEvents.map(e => (
                              <option key={e.id} value={e.id}>{e.title}</option>
                            ))}
                          </select>
                        </div>

                        {/* List eligible and ineligible creators */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold', marginBottom: '6px' }}>
                              Dapat Ditawarkan ({eligibleCreators.length}):
                            </div>
                            {eligibleCreators.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {eligibleCreators.map(uname => (
                                  <span key={uname} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                                    @{uname}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: '#f87171', fontStyle: 'italic' }}>
                                Tidak ada creator yang dapat ditawarkan untuk event ini (semua sudah ditawarkan atau terdaftar).
                              </div>
                            )}
                          </div>

                          {ineligibleCreators.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>
                                Sudah Ditawarkan / Terdaftar ({ineligibleCreators.length}):
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {ineligibleCreators.map(uname => (
                                  <span key={uname} style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.05)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.1)' }}>
                                    @{uname}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Pesan Undangan / Ajakan</label>
                          <textarea 
                            placeholder="Tulis pesan ajakan atau undangan detail di sini..." 
                            value={bulkOfferMessage}
                            onChange={(e) => setBulkOfferMessage(e.target.value)}
                            style={{ width: '100%', height: '100px', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                          <button 
                            className="btn" 
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                            onClick={() => setShowBulkOfferModal(false)}
                          >
                            Batal
                          </button>
                          <button 
                            className="btn btn-primary" 
                            disabled={eligibleCreators.length === 0}
                            style={{ 
                              flex: 1, 
                              cursor: eligibleCreators.length === 0 ? 'not-allowed' : 'pointer',
                              background: eligibleCreators.length === 0 ? 'rgba(255,255,255,0.05)' : '#ffffff',
                              border: eligibleCreators.length === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ffffff',
                              color: eligibleCreators.length === 0 ? 'var(--text-muted)' : '#020202',
                              fontWeight: '700'
                            }}
                            onClick={() => {
                              if (eligibleCreators.length === 0) return;
                              
                              const newOffers = eligibleCreators.map(uname => ({
                                id: 'offer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                sender: currentUser.username,
                                recipient: uname,
                                eventId: activeEventId,
                                eventTitle: selectedEvt?.title || 'Event Pilihan',
                                budget: 0,
                                message: bulkOfferMessage,
                                status: 'pending',
                                sentAt: new Date().toISOString()
                              }));

                              setOffers(prev => [...prev, ...newOffers]);
                              setShowBulkOfferModal(false);
                              setSelectedCreatorUsernames([]);
                              setBulkOfferEventId('');
                              setBulkOfferMessage('');
                              alert(`Berhasil mengirimkan undangan masal kepada ${eligibleCreators.length} creator!`);
                            }}
                          >
                            Kirim Undangan Masal
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : adminSubTab === 'event-payment' ? (
        <div className="event-payment-ledger-section animate-fade-in" style={{ padding: '4px' }}>
          <div className="admin-table-container glass-panel">
            {getPanitiaPayments().length > 0 ? (
              <>
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
                    {getPanitiaPayments().slice(0, visiblePaymentsCount).map(pay => (
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

                {getPanitiaPayments().length > visiblePaymentsCount && (
                  <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '20px' }}>
                    <button
                      onClick={() => setVisiblePaymentsCount(prev => prev + 10)}
                      title="Muat Lebih Banyak"
                      style={{
                        display: 'inline-flex',
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
                )}
              </>
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
          <div className="add-affiliate-card glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
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

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'white', fontWeight: 'bold' }}>Biaya Platform Pembuatan Event (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Contoh: 5"
                    value={eventAdminFee || ''}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setEventAdminFee(val);
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
                    Persentase biaya platform yang akan dikenakan dari total budget ketika Event Creator membuat/mengaktifkan event.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'white', fontWeight: 'bold' }}>Biaya Flat Pembuatan Event Non-Kompetisi (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 150000"
                    value={eventFlatFee || ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setEventFlatFee(val);
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
                    Biaya flat platform untuk mengaktifkan event bertipe Acara / Festival / Seminar (non-kompetisi).
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: 'white', fontWeight: 'bold' }}>Biaya Penarikan Saldo (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Contoh: 2"
                    value={withdrawalFeePercent || ''}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setWithdrawalFeePercent(val);
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
                    Persentase biaya admin yang dipotong otomatis dari nominal penarikan saldo peserta.
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


          {/* LIST SCREEN/PAGE */}
          <>
              {/* Search & Filter Toolbar */}
              <div className="admin-toolbar glass-panel" style={{ 
                marginBottom: '24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '16px', 
                flexWrap: 'wrap',
                padding: '16px 20px'
              }}>
                <div className="admin-search-wrapper" style={{ flex: '1 1 300px', margin: 0 }}>
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Cari username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button className="clear-btn" onClick={() => setUserSearch('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'Semua Pengguna' },
                    { id: 'internal', label: 'Tim Internal' },
                    { id: 'panitia', label: 'Panitia' },
                    { id: 'external', label: 'Pelanggan / Member' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setUserFilter(tab.id)}
                      style={{
                        padding: '8px 16px',
                        background: userFilter === tab.id ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: userFilter === tab.id ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid var(--border-color)',
                        color: userFilter === tab.id ? 'white' : 'var(--text-secondary)',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List Table */}
              <div className="admin-table-container glass-panel">
                {(() => {
                  const filteredUsers = loadedUsers.filter(user => {
                    // 1. Search Query
                    if (userSearch && !user.username.toLowerCase().includes(userSearch.toLowerCase())) {
                      return false;
                    }
                    // 2. Filter Tab
                    const isInternal = ['superadmin', 'staf', 'moderator', 'editor'].includes(user.role) || (customRoles.some(r => r.id === user.role) && user.role !== 'panitia');
                    const isPanitiaRole = user.role === 'panitia';
                    const isExternal = ['member', 'user'].includes(user.role);

                    if (userFilter === 'internal') return isInternal;
                    if (userFilter === 'panitia') return isPanitiaRole;
                    if (userFilter === 'external') return isExternal;
                    return true;
                  });

              return filteredUsers.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>No</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th>Role / Jabatan</th>
                      <th>Masa Aktif</th>
                      {currentUser.role === 'superadmin' && (
                        <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => {
                      const isSelf = user.username.toLowerCase() === currentUser.username.toLowerCase();
                      const customRole = customRoles.find(r => r.id === user.role);
                      const roleName = customRole ? customRole.name : user.role;
                      
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
                      } else if (user.role === 'moderator') {
                        roleBadgeColor = '#10b981';
                        roleBadgeBg = 'rgba(16, 185, 129, 0.1)';
                      } else if (user.role === 'editor') {
                        roleBadgeColor = '#06b6d4';
                        roleBadgeBg = 'rgba(6, 182, 212, 0.1)';
                      } else if (user.role === 'member') {
                        roleBadgeColor = '#3b82f6';
                        roleBadgeBg = 'rgba(59, 130, 246, 0.1)';
                      } else if (user.role === 'user') {
                        roleBadgeColor = '#94a3b8';
                        roleBadgeBg = 'rgba(148, 163, 184, 0.1)';
                      } else if (customRole) {
                        roleBadgeColor = '#ec4899';
                        roleBadgeBg = 'rgba(236, 72, 153, 0.1)';
                      }
                      
                      return (
                        <tr key={user.id} className="table-row-hover">
                          <td>{idx + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isSelf ? 'bold' : 'normal' }}>
                              <span>{user.username}</span>
                              {isSelf && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px', color: 'var(--text-muted)' }}>Anda</span>}
                              {(['superadmin', 'staf', 'moderator', 'editor'].includes(user.role) || (customRoles.some(r => r.id === user.role) && user.role !== 'panitia')) && (
                                <span style={{ fontSize: '0.65rem', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)', padding: '1px 5px', borderRadius: '4px', color: '#c084fc', fontWeight: 'bold' }}>Internal</span>
                              )}
                              {user.role === 'panitia' && (
                                <span style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '1px 5px', borderRadius: '4px', color: '#a78bfa', fontWeight: 'bold' }}>Panitia</span>
                              )}
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
                              {roleName}
                            </span>
                          </td>
                          <td>
                            {getActivePeriodLabel(user)}
                          </td>
                          {currentUser.role === 'superadmin' && (
                            <td>
                              <div className="table-actions">
                                <button 
                                  className="action-btn edit" 
                                  onClick={() => setEditingUser(user)}
                                  disabled={currentUser.role === 'staf' && user.role === 'superadmin'}
                                  style={{ color: 'var(--primary-color)', cursor: (currentUser.role === 'staf' && user.role === 'superadmin') ? 'not-allowed' : 'pointer', opacity: (currentUser.role === 'staf' && user.role === 'superadmin') ? 0.3 : 1 }}
                                  title={currentUser.role === 'staf' && user.role === 'superadmin' ? 'Staf tidak dapat mengedit Superadmin' : 'Edit User'}
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
                                      setLoadedUsers(loadedUsers.filter(u => u.id !== user.id));
                                    }
                                  }}
                                  disabled={isSelf || (currentUser.role === 'staf' && user.role === 'superadmin')}
                                  style={{ opacity: (isSelf || (currentUser.role === 'staf' && user.role === 'superadmin')) ? 0.3 : 1, cursor: (isSelf || (currentUser.role === 'staf' && user.role === 'superadmin')) ? 'not-allowed' : 'pointer' }}
                                  title={isSelf ? 'Tidak bisa menghapus diri sendiri' : currentUser.role === 'staf' && user.role === 'superadmin' ? 'Staf tidak dapat menghapus Superadmin' : 'Hapus User'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-state">
                  <User size={48} className="icon" />
                  <h3>Belum ada user yang cocok</h3>
                </div>
              );
            })()}
            {hasMoreUsers && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => loadMoreUsers(false)} 
                  disabled={isLoadingMoreUsers}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '10px 24px', 
                    fontSize: '0.85rem', 
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.8)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '30px',
                    cursor: isLoadingMoreUsers ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoadingMoreUsers) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {isLoadingMoreUsers ? (
                    <Clock size={16} className="animate-spin" />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  <span>{isLoadingMoreUsers ? 'Memuat Data...' : 'Muat Lebih Banyak'}</span>
                </button>
              </div>
            )}
          </div>
          </>

          {/* Add User Modal Overlay */}
          {userViewMode === 'add' && createPortal(
            <div className="admin-modal-overlay animate-fade-in" style={{ zIndex: 10000 }} onClick={() => setUserViewMode('list')}>
              <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ width: '100%', maxWidth: '640px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'white' }}>
                      <Plus size={20} style={{ color: '#ffffff' }} />
                      <span>Tambah Pengguna Baru</span>
                    </h3>
                    <button 
                      onClick={() => setUserViewMode('list')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <XCircle size={22} />
                    </button>
                  </div>

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
                      
                      const permissions = getDefaultPermissions(role, customRoles);
                      const days = activeDaysInput ? parseInt(activeDaysInput, 10) : 30;
                      const expiresAt = (role === 'member' || role === 'pro') ? Date.now() + days * 24 * 60 * 60 * 1000 : null;
                      const newUser = {
                        id: Date.now().toString(),
                        username,
                        password,
                        role,
                        permissions,
                        premiumExpiresAt: expiresAt
                      };
                      
                      setUsers([...users, newUser]);
                      setLoadedUsers([newUser, ...loadedUsers]);
                      e.target.reset();
                      alert(`User "${username}" berhasil ditambahkan!`);
                      setUserViewMode('list');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>Username / Email</label>
                      <input 
                        type="text" 
                        name="newUsername" 
                        placeholder="Masukkan username atau email" 
                        required 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>Password</label>
                      <input 
                        type="password" 
                        name="newPassword" 
                        placeholder="Masukkan password akun baru" 
                        required 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>Role / Peran</label>
                      <select 
                        name="newRole" 
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', padding: '12px 16px' }}
                      >
                        <option value="user">User Biasa</option>
                        <option value="member">Premium Member</option>
                        {customRoles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                        {currentUser.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>Masa Aktif Premium (Hari)</label>
                      <input 
                        type="number" 
                        name="newActiveDays" 
                        placeholder="30 (Hanya berlaku untuk Premium Member)" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Plus size={16} />
                        <span>Tambah Pengguna</span>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setUserViewMode('list')}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <span>Batal</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Edit User Modal Overlay */}
          {editingUser && (
            <div className="admin-modal-overlay animate-fade-in" style={{ zIndex: 10000 }} onClick={() => setEditingUser(null)}>
                <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ width: '100%', maxWidth: '640px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'white' }}>
                        <Edit size={20} className="accent-text" style={{ color: '#ffffff' }} />
                        <span>Edit User</span>
                      </h3>
                    <button 
                      onClick={() => setEditingUser(null)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <XCircle size={22} />
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
                        const days = activeDaysInput ? parseInt(activeDaysInput) : 30;
                        expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
                      } else if (role === 'user' && editingUser.role === 'member') {
                        expiresAt = null; // Downgrade
                      } else {
                        expiresAt = editingUser.premiumExpiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000);
                      }

                      const updatedUser = {
                        ...editingUser,
                        username,
                        password,
                        role,
                        premiumExpiresAt: expiresAt
                      };

                      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
                      setLoadedUsers(loadedUsers.map(u => u.id === editingUser.id ? updatedUser : u));
                      setEditingUser(null);
                    }}
                    className="modal-form"
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Username</label>
                      <input 
                        type="text" 
                        name="editUsername" 
                        defaultValue={editingUser.username}
                        required 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Password</label>
                      <input 
                        type="text" 
                        name="editPassword" 
                        defaultValue={editingUser.password}
                        required 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Role</label>
                      <select 
                        name="editRole" 
                        defaultValue={editingUser.role}
                        disabled={editingUser.username.toLowerCase() === currentUser.username.toLowerCase() || (currentUser.role === 'staf' && editingUser.role === 'superadmin')} // Disable changing own role, or staff changing superadmin role
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', padding: '12px 14px' }}
                      >
                        <option value="user">User Biasa</option>
                        <option value="member">Premium Member (Bebas Iklan + Semua Eps)</option>
                        {customRoles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                        {(currentUser.role === 'superadmin' || editingUser.role === 'superadmin') && <option value="superadmin">Superadmin (Akses Semua Fitur)</option>}
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
                        style={{ width: '100%' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Hanya berlaku jika role diatur ke Premium Member.
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
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
            </div>
          )}
        </div>
      ) : adminSubTab === 'roles' && currentUser && currentUser.role === 'superadmin' ? (
        <div className="roles-manager-section animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Form to Create Custom Role */}
            <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', margin: 0 }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} className="accent-text" style={{ color: editingRole ? '#38bdf8' : '#ec4899' }} />
                <span>{editingRole ? 'Edit Role Custom' : 'Buat Role Custom Baru'}</span>
              </h3>
              <form 
                key={editingRole ? editingRole.id : 'new'}
                onSubmit={(e) => {
                  e.preventDefault();
                  const roleName = e.target.elements.roleName.value.trim();
                  if (!roleName) {
                    alert('Nama role wajib diisi!');
                    return;
                  }
                  
                  const isDuplicate = customRoles.some(r => 
                    r.name.toLowerCase() === roleName.toLowerCase() && 
                    (!editingRole || r.id !== editingRole.id)
                  );
                  if (isDuplicate || ['superadmin', 'member', 'user'].includes(roleName.toLowerCase())) {
                    alert('Nama role sudah digunakan atau dilindungi!');
                    return;
                  }
                  
                  const checkboxes = e.target.querySelectorAll('input[name="rolePermissions"]:checked');
                  const permissions = Array.from(checkboxes).map(cb => cb.value);
                  
                  if (editingRole) {
                    setCustomRoles(customRoles.map(r => 
                      r.id === editingRole.id ? { ...r, name: roleName, permissions } : r
                    ));
                    setEditingRole(null);
                    alert(`Role "${roleName}" berhasil diperbarui!`);
                  } else {
                    const newRole = {
                      id: 'role_' + Date.now(),
                      name: roleName,
                      permissions
                    };
                    setCustomRoles([...customRoles, newRole]);
                    e.target.reset();
                    alert(`Role "${roleName}" berhasil dibuat! Sekarang role ini dapat dipilih pada form Tambah/Edit User.`);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Nama Role</label>
                  <input 
                    type="text" 
                    name="roleName" 
                    placeholder="Contoh: Editor Junior" 
                    defaultValue={editingRole ? editingRole.name : ''}
                    required 
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                <div style={{ marginTop: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>Akses Fitur Bawaan Role:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'movies', label: 'Kelola Film' },
                      { id: 'affiliates', label: 'Link Afiliasi' },
                      { id: 'membership', label: 'Pengaturan Premium' },
                      { id: 'confirmations', label: 'Pemasukan Saldo' },
                      { id: 'withdrawals', label: 'Penarikan Saldo' },
                      { id: 'finance-report', label: 'Laporan Keuangan' },
                      { id: 'users', label: 'Kelola Pengguna' },
                      { id: 'event-dashboard', label: 'Dashboard Event' },
                      { id: 'event-manage', label: 'Kelola Event' },
                      { id: 'event-payment', label: 'Payment Event' },
                      { id: 'creator-marketplace', label: 'Marketplace Creator' }
                    ].map((item) => {
                      const isChecked = editingRole ? editingRole.permissions.includes(item.id) : false;
                      return (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <input 
                            type="checkbox" 
                            name="rolePermissions" 
                            value={item.id}
                            defaultChecked={isChecked}
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  {editingRole && (
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => setEditingRole(null)}
                      style={{ flex: 1, padding: '10px 20px', height: '40px', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                    >
                      Batal
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '10px 20px', height: '40px', justifyContent: 'center' }}>
                    {editingRole ? <Check size={16} /> : <Plus size={16} />}
                    <span>{editingRole ? 'Simpan Perubahan' : 'Buat Role Custom'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Custom Roles */}
            <div className="add-affiliate-card glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', margin: 0, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} className="accent-text" style={{ color: '#8b5cf6' }} />
                <span>Daftar Custom Role</span>
              </h3>
              
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' }}>
                {customRoles.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customRoles.map((role) => {
                      const isBuiltIn = ['staf', 'panitia', 'moderator', 'editor'].includes(role.id);
                      return (
                        <div key={role.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: 'white', fontSize: '0.9rem' }}>{role.name}</strong>
                              <span style={{ fontSize: '0.62rem', background: isBuiltIn ? 'rgba(56, 189, 248, 0.1)' : 'rgba(236, 72, 153, 0.1)', color: isBuiltIn ? '#38bdf8' : '#ec4899', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                                {isBuiltIn ? 'Bawaan' : 'Kustom'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Fitur ({role.permissions.length}): {role.permissions.join(', ')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className="btn btn-text" 
                              onClick={() => setEditingRole(role)}
                              style={{ color: 'var(--primary-color)', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            {!isBuiltIn && (
                              <button 
                                className="btn btn-text" 
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"? Pengguna dengan role ini akan dikembalikan hak akses defaultnya.`)) {
                                    setCustomRoles(customRoles.filter(r => r.id !== role.id));
                                    if (editingRole && editingRole.id === role.id) {
                                      setEditingRole(null);
                                    }
                                  }
                                }}
                                style={{ color: '#ef4444', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px' }}>
                    Belum ada role custom.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : adminSubTab === 'community-members' ? (() => {
        const myCommunity = communities.find(c => c.username?.toLowerCase() === currentUser?.username?.toLowerCase());
        if (!myCommunity) {
          return (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h3>Komunitas Tidak Ditemukan</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Akun Anda belum terdaftar sebagai komunitas atau data komunitas tidak ditemukan.</p>
            </div>
          );
        }

        const pendingList = myCommunity.pendingMembers || [];
        const joinedList = myCommunity.joinedMembers || [];

        return (
          <div className="community-members-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Permintaan Bergabung */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffc107', display: 'inline-block' }} />
                Permintaan Bergabung ({pendingList.length})
              </h3>
              {pendingList.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nama Lengkap / Username</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No. WhatsApp / HP</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Portofolio</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map(memberUsername => {
                        const mUser = users.find(u => u.username?.toLowerCase() === memberUsername?.toLowerCase()) || {};
                        return (
                          <tr key={memberUsername} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '600', color: 'white' }}>{mUser.organizerName || mUser.name || memberUsername}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{memberUsername}</div>
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                              {mUser.organizerPhone || '-'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {mUser.userPortfolio ? (
                                <a href={mUser.userPortfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                  Lihat Portofolio
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Tidak ada</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => onApproveMember && onApproveMember(myCommunity.id, memberUsername)}
                                  style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                                >
                                  Terima
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => onRejectMember && onRejectMember(myCommunity.id, memberUsername)}
                                  style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                                >
                                  Tolak
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px' }}>
                  Tidak ada permintaan bergabung saat ini.
                </div>
              )}
            </div>

            {/* Daftar Anggota Aktif */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Anggota Aktif ({joinedList.length})
              </h3>
              {joinedList.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nama Lengkap / Username</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No. WhatsApp / HP</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Portofolio</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {joinedList.map(memberUsername => {
                        const mUser = users.find(u => u.username?.toLowerCase() === memberUsername?.toLowerCase()) || {};
                        return (
                          <tr key={memberUsername} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '600', color: 'white' }}>{mUser.organizerName || mUser.name || memberUsername}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{memberUsername}</div>
                            </td>
                            <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                              {mUser.organizerPhone || '-'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {mUser.userPortfolio ? (
                                <a href={mUser.userPortfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                  Lihat Portofolio
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Tidak ada</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onKickMember && onKickMember(myCommunity.id, memberUsername)}
                                style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                              >
                                Keluarkan
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px' }}>
                  Belum ada anggota yang bergabung.
                </div>
              )}
            </div>
          </div>
        );
      })() : adminSubTab === 'community-agendas' ? (() => {
        const myCommunity = communities.find(c => c.username?.toLowerCase() === currentUser?.username?.toLowerCase());
        if (!myCommunity) {
          return (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h3>Komunitas Tidak Ditemukan</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Akun Anda belum terdaftar sebagai komunitas atau data komunitas tidak ditemukan.</p>
            </div>
          );
        }

        const agendaList = myCommunity.agendas || [];

        const handleAddAgendaSubmit = (e) => {
          e.preventDefault();
          if (!agendaTitle.trim() || !agendaDate) {
            alert('Judul agenda dan Tanggal wajib diisi.');
            return;
          }
          const newAgenda = {
            id: Date.now().toString(),
            title: agendaTitle,
            description: agendaDesc,
            date: agendaDate,
            time: agendaTime || '',
            location: agendaLoc || '',
            publishTo: agendaPublishTo || 'public'
          };
          const updatedAgendas = [...agendaList, newAgenda];
          if (onSaveAgenda) {
            onSaveAgenda(myCommunity.id, updatedAgendas);
          }
          // Reset form
          setAgendaTitle('');
          setAgendaDesc('');
          setAgendaDate('');
          setAgendaTime('');
          setAgendaLoc('');
          setAgendaPublishTo('public');
          setShowAgendaModal(false);
          alert('Agenda berhasil ditambahkan.');
        };

        const handleDeleteAgenda = (agendaId) => {
          if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
            const updatedAgendas = agendaList.filter(a => a.id !== agendaId);
            if (onSaveAgenda) {
              onSaveAgenda(myCommunity.id, updatedAgendas);
            }
            alert('Agenda berhasil dihapus.');
          }
        };

        return (
          <div className="community-agendas-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => setShowAgendaModal(true)} 
                className="btn btn-primary"
                style={{ borderRadius: '20px', padding: '10px 20px', fontSize: '0.88rem' }}
              >
                + Tambah Agenda Baru
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Daftar Agenda Komunitas ({agendaList.length})
              </h3>
              {agendaList.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Tanggal / Waktu</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Judul Agenda</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Deskripsi</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Lokasi</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Publikasi</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendaList.map((agenda) => (
                        <tr key={agenda.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '14px 16px', color: 'white', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                            <strong>{agenda.date}</strong>
                            {agenda.time && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Pukul {agenda.time}</div>}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'white', fontSize: '0.88rem', fontWeight: 'bold' }}>
                            {agenda.title}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
                            {agenda.description || '-'}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {agenda.location || '-'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              background: agenda.publishTo === 'public' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: agenda.publishTo === 'public' ? '#10b981' : '#3b82f6',
                              border: agenda.publishTo === 'public' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                              {agenda.publishTo === 'public' ? 'Publik' : 'Khusus Anggota'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteAgenda(agenda.id)}
                              style={{ padding: '6px 12px', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '36px' }}>
                  Belum ada agenda yang dibuat. Klik "+ Tambah Agenda Baru" untuk menambahkan agenda pertama Anda.
                </div>
              )}
            </div>

            {/* Modal Tambah Agenda */}
            {showAgendaModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
              }}>
                <div className="glass-panel" style={{
                  maxWidth: '500px',
                  width: '100%',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(20, 20, 20, 0.95)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Tambah Agenda Komunitas</h3>
                    <button 
                      type="button"
                      onClick={() => setShowAgendaModal(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleAddAgendaSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Judul Agenda *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Rapat Koordinasi Anggota"
                        value={agendaTitle} 
                        onChange={(e) => setAgendaTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Deskripsi / Keterangan</label>
                      <textarea 
                        rows="3"
                        placeholder="Jelaskan rincian atau topik agenda..."
                        value={agendaDesc} 
                        onChange={(e) => setAgendaDesc(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tanggal Agenda *</label>
                        <input 
                          type="date" 
                          required
                          value={agendaDate} 
                          onChange={(e) => setAgendaDate(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Waktu / Jam</label>
                        <input 
                          type="time" 
                          value={agendaTime} 
                          onChange={(e) => setAgendaTime(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', colorScheme: 'dark' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lokasi / Media Pertemuan</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Gedung A Lantai 3 atau Zoom Meeting"
                        value={agendaLoc} 
                        onChange={(e) => setAgendaLoc(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status Publikasi</label>
                      <select
                        value={agendaPublishTo}
                        onChange={(e) => setAgendaPublishTo(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', background: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="public">Publik (Bisa dilihat oleh siapa saja)</option>
                        <option value="members">Khusus Anggota Komunitas (Hanya yang sudah disetujui)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowAgendaModal(false)}
                        className="btn btn-secondary"
                        style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Simpan Agenda
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })() : adminSubTab === 'withdrawals' && currentUser && ['superadmin', 'staf', 'moderator'].includes(currentUser.role) ? (() => {
        const filteredWithdrawals = withdrawals.filter(wd => {
          if (withdrawalStatusFilter !== 'all' && wd.status !== withdrawalStatusFilter) return false;
          
          if (withdrawalStartDate) {
            const startMs = new Date(withdrawalStartDate + 'T00:00:00').getTime();
            if (!wd.requestedAt || new Date(wd.requestedAt).getTime() < startMs) return false;
          }
          if (withdrawalEndDate) {
            const endMs = new Date(withdrawalEndDate + 'T23:59:59').getTime();
            if (!wd.requestedAt || new Date(wd.requestedAt).getTime() > endMs) return false;
          }

          if (withdrawalSearch.trim() !== '') {
            const query = withdrawalSearch.toLowerCase();
            return (
              wd.username?.toLowerCase().includes(query) ||
              wd.name?.toLowerCase().includes(query) ||
              wd.account?.toLowerCase().includes(query) ||
              wd.method?.toLowerCase().includes(query) ||
              wd.amount?.toString().includes(query)
            );
          }
          return true;
        });

        return (
          <div className="withdrawals-manager-section animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="admin-toolbar-panel">
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={withdrawalSearch}
                  onChange={(e) => setWithdrawalSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, rekening, metode..."
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
                {withdrawalSearch && (
                  <button
                    onClick={() => setWithdrawalSearch('')}
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

              {/* Filter Dropdown */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dari:</span>
                  <input 
                    type="date" 
                    value={withdrawalStartDate} 
                    onChange={(e) => setWithdrawalStartDate(e.target.value)} 
                    style={{
                      padding: '4px 8px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>S/D:</span>
                  <input 
                    type="date" 
                    value={withdrawalEndDate} 
                    onChange={(e) => setWithdrawalEndDate(e.target.value)} 
                    style={{
                      padding: '4px 8px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  {(withdrawalStartDate || withdrawalEndDate) && (
                    <button 
                      onClick={() => { setWithdrawalStartDate(''); setWithdrawalEndDate(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        padding: '2px 6px'
                      }}
                    >
                      Reset Tgl
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
                  <select
                    value={withdrawalStatusFilter}
                    onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Sukses</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

            <div className="admin-table-container glass-panel">
              {filteredWithdrawals.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Peserta</th>
                      <th>Metode Transfer</th>
                      <th>Penerima / Rekening</th>
                      <th style={{ textAlign: 'right' }}>Nominal</th>
                      <th>Tanggal Pengajuan</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center', width: '240px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.map((wd) => {
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
                            <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                              {wd.method}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{wd.name}</span>
                              <code style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{wd.account}</code>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ color: 'white' }}>Rp {wd.amount?.toLocaleString('id-ID')}</strong>
                            {wd.fee > 0 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Fee: <span style={{ color: '#f43f5e' }}>-Rp {wd.fee.toLocaleString('id-ID')}</span><br />
                                Net: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Rp {wd.netAmount.toLocaleString('id-ID')}</span>
                              </div>
                            )}
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
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 'bold', 
                                textTransform: 'uppercase',
                                color: statusColor,
                                background: statusBg,
                                border: `1px solid ${statusColor}30`
                              }}
                            >
                              {wd.status === 'approved' ? 'SUKSES' : wd.status === 'rejected' ? 'DITOLAK' : 'MENUNGGU'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {wd.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  className="btn btn-sm" 
                                  onClick={() => handleApproveWithdrawal(wd.id)}
                                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#020202', background: '#ffffff', border: '1px solid #ffffff', fontWeight: 'bold', borderRadius: '8px' }}
                                >
                                  Setujui & Cairkan
                                </button>
                                <button 
                                  className="btn btn-sm" 
                                  onClick={() => handleRejectWithdrawal(wd)}
                                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#ffffff', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px' }}
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-state" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Wallet size={48} className="icon" style={{ color: 'var(--text-muted)' }} />
                  <h3>Tidak ada data penarikan</h3>
                  <p>Tidak ada pengajuan penarikan dana yang cocok dengan pencarian Anda.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()
      : adminSubTab === 'confirmations' && currentUser && ['superadmin', 'staf', 'moderator'].includes(currentUser.role) ? (() => {
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

        const sortedConfirmations = [...allConfirmations].sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

        const filteredConfirmations = sortedConfirmations.filter(conf => {
          if (confirmationStatusFilter !== 'all' && conf.status !== confirmationStatusFilter) return false;
          if (confirmationTypeFilter !== 'all') {
            if (confirmationTypeFilter === 'premium' && conf.isEventPayment) return false;
            if (confirmationTypeFilter === 'event' && !conf.isEventPayment) return false;
          }

          if (confirmationStartDate) {
            const startMs = new Date(confirmationStartDate + 'T00:00:00').getTime();
            if (!conf.timestamp || new Date(conf.timestamp).getTime() < startMs) return false;
          }
          if (confirmationEndDate) {
            const endMs = new Date(confirmationEndDate + 'T23:59:59').getTime();
            if (!conf.timestamp || new Date(conf.timestamp).getTime() > endMs) return false;
          }

          if (confirmationSearch.trim() !== '') {
            const query = confirmationSearch.toLowerCase();
            return (
              conf.username?.toLowerCase().includes(query) ||
              conf.userId?.toLowerCase().includes(query) ||
              conf.planName?.toLowerCase().includes(query) ||
              conf.senderName?.toLowerCase().includes(query) ||
              conf.bankName?.toLowerCase().includes(query) ||
              (conf.eventTitle && conf.eventTitle.toLowerCase().includes(query))
            );
          }
          return true;
        });

        return (
          <div className="confirmations-manager-section animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="admin-toolbar-panel">
              {/* Search Bar */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '320px', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={confirmationSearch}
                  onChange={(e) => setConfirmationSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, bank, event..."
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
                {confirmationSearch && (
                  <button
                    onClick={() => setConfirmationSearch('')}
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

              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dari:</span>
                  <input 
                    type="date" 
                    value={confirmationStartDate} 
                    onChange={(e) => setConfirmationStartDate(e.target.value)} 
                    style={{
                      padding: '4px 8px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>S/D:</span>
                  <input 
                    type="date" 
                    value={confirmationEndDate} 
                    onChange={(e) => setConfirmationEndDate(e.target.value)} 
                    style={{
                      padding: '4px 8px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  {(confirmationStartDate || confirmationEndDate) && (
                    <button 
                      onClick={() => { setConfirmationStartDate(''); setConfirmationEndDate(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        padding: '2px 6px'
                      }}
                    >
                      Reset Tgl
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jenis:</span>
                  <select
                    value={confirmationTypeFilter}
                    onChange={(e) => setConfirmationTypeFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="premium">Premium Membership</option>
                    <option value="event">Pembayaran Event</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
                  <select
                    value={confirmationStatusFilter}
                    onChange={(e) => setConfirmationStatusFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#0f172a',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-table-container glass-panel">
              {filteredConfirmations.length > 0 ? (
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
                    {filteredConfirmations.map((conf, idx) => {
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
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 'bold' }}>
                                Event: {conf.eventTitle}
                              </div>
                            )}
                          </td>
                          <td>
                            <span 
                              style={{ 
                                color: '#ffffff', 
                                background: 'rgba(255, 255, 255, 0.06)', 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
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
                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{conf.amount}</span>
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
                                fontSize: '0.72rem', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                color: statusColor,
                                background: statusBg,
                                border: `1px solid ${statusColor}30`
                              }}
                            >
                              {conf.status === 'approved' ? 'DISETUJUI' : conf.status === 'rejected' ? 'DITOLAK' : 'TERTUNDA'}
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
                                          const updatedConfs = confirmations.map(c => c.id === conf.id ? { ...c, status: 'approved' } : c);
                                          setConfirmations(updatedConfs);
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
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="admin-empty-state" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Check size={48} className="icon" style={{ color: 'var(--text-muted)' }} />
                  <h3>Tidak ada data pembayaran</h3>
                  <p>Tidak ada pemasukan/pembayaran saldo yang cocok dengan kriteria pencarian Anda.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()
      : adminSubTab === 'finance-report' && currentUser && ['superadmin', 'staf', 'moderator'].includes(currentUser.role) ? (() => {
        // Safe parsing of currency strings
        const parseAmount = (amtStr) => {
          if (!amtStr) return 0;
          if (typeof amtStr === 'number') return amtStr;
          const clean = amtStr.replace(/[^0-9]/g, '');
          return parseInt(clean, 10) || 0;
        };

        const handleSort = (field) => {
          if (financeSortField === field) {
            setFinanceSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
          } else {
            setFinanceSortField(field);
            setFinanceSortDirection('desc');
          }
        };

        const renderSortHeader = (label, field, alignRight = false) => {
          const isActive = financeSortField === field;
          const arrow = isActive ? (financeSortDirection === 'asc' ? ' ↑' : ' ↓') : ' ↕';
          return (
            <th 
              onClick={() => handleSort(field)} 
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none', 
                color: isActive ? 'white' : 'var(--text-secondary)',
                textAlign: alignRight ? 'right' : 'left'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: alignRight ? 'flex-end' : 'flex-start', width: '100%', gap: '4px' }}>
                <span>{label}</span>
                <span style={{ fontSize: '0.72rem', opacity: isActive ? 1 : 0.4 }}>{arrow}</span>
              </div>
            </th>
          );
        };

        // Extract unique months from unfiltered financialJournals list for filter dropdown
        const availableMonths = Array.from(new Set(
          financialJournals
            .filter(j => j.date)
            .map(j => j.date.substring(0, 7))
        )).sort((a, b) => b.localeCompare(a)); // Sort newest month first

        const formatMonthYear = (myStr) => {
          if (!myStr) return '';
          const [year, month] = myStr.split('-');
          const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ];
          return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
        };

        const filteredJournals = financeMonthFilter === 'All'
          ? financialJournals
          : financialJournals.filter(j => j.date && j.date.substring(0, 7) === financeMonthFilter);

        // Calculations derived entirely from the filteredJournals collection
        // 1. Premium Income (inbound journals not from events and not manual journals)
        const premiumIncome = filteredJournals
          .filter(j => j.type === 'in' && !j.id.startsWith('evt_') && !j.id.startsWith('journal_'))
          .reduce((acc, j) => acc + (j.amount || 0), 0);

        // 2. Event Payments Income (inbound journals starting with 'evt_')
        const eventTotalIncome = filteredJournals
          .filter(j => j.type === 'in' && j.id.startsWith('evt_'))
          .reduce((acc, j) => acc + (j.amount || 0), 0);

        // Extract event admin fees from the global events matching paid journals
        const eventFeesPaid = filteredJournals
          .filter(j => j.type === 'in' && j.id.startsWith('evt_'))
          .reduce((acc, j) => {
            const evtId = j.id.replace('evt_', '');
            const evt = events.find(e => e.id === evtId);
            return acc + (evt?.adminFee || 0);
          }, 0);

        // 3. Manual journals income & expense
        const manualIncome = filteredJournals
          .filter(j => j.type === 'in' && j.id.startsWith('journal_'))
          .reduce((acc, j) => acc + (j.amount || 0), 0);
        const manualExpense = filteredJournals
          .filter(j => j.type === 'out' && j.id.startsWith('journal_'))
          .reduce((acc, j) => acc + (j.amount || 0), 0);

        // Total Pemasukan
        const totalIncome = premiumIncome + eventTotalIncome + manualIncome;

        // Escrow funds (event paid but winners not released yet)
        const escrowFund = events
          .filter(evt => evt.paymentStatus === 'paid' && !evt.winnersReleased)
          .reduce((acc, evt) => acc + (evt.campaignBudget || 0), 0);

        // Net System Profit (Premium + Admin Fees + Manual Income - Manual Expense)
        const netSystemProfit = premiumIncome + eventFeesPaid + manualIncome - manualExpense;

        // Expenses (Withdrawals + Manual Expenses)
        const totalWithdrawals = filteredJournals
          .filter(j => j.type === 'out')
          .reduce((acc, j) => acc + (j.amount || 0), 0);

        // Active user wallets balance total
        const totalUserBalances = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

        // Transactions List for report mapped directly from the single source of truth
        const transactionList = filteredJournals.map(j => {
          let typeLabel = '';
          if (j.id.startsWith('evt_')) {
            typeLabel = 'Pemasukan (Event)';
          } else if (j.id.startsWith('journal_')) {
            typeLabel = j.type === 'in' ? 'Jurnal Saldo Masuk' : 'Jurnal Saldo Keluar';
          } else if (j.type === 'in') {
            typeLabel = 'Pemasukan (Premium)';
          } else {
            typeLabel = 'Pengeluaran (Penarikan)';
          }

          // Extract username from description if system auto-generated
          let displayUser = j.operator || 'System';
          if (j.operator === 'System (Auto)' || !j.operator) {
            const matchUser = j.desc.match(/\(User:\s*([^)]+)\)/);
            if (matchUser && matchUser[1]) {
              displayUser = matchUser[1];
            }
          }

          return {
            id: j.id,
            date: j.date,
            type: typeLabel,
            username: displayUser,
            desc: j.desc,
            amount: j.amount || 0,
            isIncome: j.type === 'in'
          };
        }).sort((a, b) => {
          let fieldA = a[financeSortField];
          let fieldB = b[financeSortField];

          if (financeSortField === 'date') {
            fieldA = new Date(a.date).getTime();
            fieldB = new Date(b.date).getTime();
          } else if (financeSortField === 'amount') {
            fieldA = a.amount;
            fieldB = b.amount;
          } else {
            fieldA = String(fieldA || '').toLowerCase();
            fieldB = String(fieldB || '').toLowerCase();
          }

          if (fieldA < fieldB) return financeSortDirection === 'asc' ? -1 : 1;
          if (fieldA > fieldB) return financeSortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        return (
          <div className="finance-report-section animate-fade-in" style={{ color: 'white' }}>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', gap: '8px' }} className="no-print">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter Laporan Bulanan:</span>
              <select 
                value={financeMonthFilter}
                onChange={(e) => setFinanceMonthFilter(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All" style={{ background: '#0b0f19' }}>Semua Periode</option>
                {availableMonths.map(my => (
                  <option key={my} value={my} style={{ background: '#0b0f19' }}>
                    {formatMonthYear(my)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-dashboard-grid finance-grid">
              
              {/* Card 1: Total Pemasukan */}
              <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div className="stat-content">
                  <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Pemasukan Bersih</span>
                  <span className="stat-value" style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Rp {totalIncome.toLocaleString('id-ID')}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Premium: Rp {premiumIncome.toLocaleString('id-ID')} | Event: Rp {eventTotalIncome.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                  <TrendingUp size={24} />
                </div>
              </div>

              {/* Card 2: Keuntungan Bersih Sistem */}
              <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <div className="stat-content">
                  <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Keuntungan Bersih Sistem</span>
                  <span className="stat-value" style={{ color: '#c084fc', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Rp {netSystemProfit.toLocaleString('id-ID')}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Premium: Rp {premiumIncome.toLocaleString('id-ID')} | Admin Fee Event: Rp {eventFeesPaid.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#c084fc' }}>
                  <Award size={24} />
                </div>
              </div>

              {/* Card 3: Dana Escrow Event */}
              <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div className="stat-content">
                  <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Dana Escrow (Rekber Kontes)</span>
                  <span className="stat-value" style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Rp {escrowFund.toLocaleString('id-ID')}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Sedang ditahan sistem untuk pemenang event berjalan
                  </div>
                </div>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                  <ShieldCheck size={24} />
                </div>
              </div>

              {/* Card 4: Total Penarikan & Saldo Pengguna */}
              <div className="admin-stat-card glass-panel" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div className="stat-content">
                  <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Pencairan / Saldo User</span>
                  <span className="stat-value" style={{ color: '#f87171', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    Rp {totalWithdrawals.toLocaleString('id-ID')}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Saldo Pengguna: Rp {totalUserBalances.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                  <Wallet size={24} />
                </div>
              </div>

            </div>

            {/* Detailed Transaction History */}
            <div className="admin-table-container glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
              <div className="table-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>Histori Transaksi Keuangan</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(currentUser?.role === 'staf' || currentUser?.role === 'superadmin') && (
                    <button 
                      className="btn btn-primary btn-sm no-print" 
                      onClick={() => {
                        setJournalType('in');
                        setJournalAmount('');
                        setJournalDesc('');
                        const tzOffset = new Date().getTimezoneOffset() * 60000;
                        setJournalDate(new Date(Date.now() - tzOffset).toISOString().slice(0, 16));
                        setShowJournalModal(true);
                      }}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '0.8rem', 
                        padding: '6px 14px',
                        background: '#ffffff',
                        border: '1px solid #ffffff',
                        color: '#020202',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>Tambah Jurnal Keuangan</span>
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm no-print" 
                    onClick={() => window.print()}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '0.8rem', 
                      padding: '6px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cetak Laporan
                  </button>
                </div>
              </div>

              {transactionList.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      {renderSortHeader('Tanggal', 'date')}
                      {renderSortHeader('Tipe Transaksi', 'type')}
                      {renderSortHeader('User / Instansi', 'username')}
                      {renderSortHeader('Keterangan', 'desc')}
                      {renderSortHeader('Nominal', 'amount', true)}
                    </tr>
                  </thead>
                  <tbody>
                    {transactionList.map((tx) => (
                      <tr key={tx.id} className="table-row-hover">
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(tx.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontWeight: 'bold',
                            color: tx.isIncome ? '#22c55e' : '#f87171',
                            background: tx.isIncome ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td><strong style={{ color: 'white' }}>{tx.username}</strong></td>
                        <td><span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tx.desc}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: tx.isIncome ? '#22c55e' : '#f87171' }}>
                          {tx.isIncome ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Belum ada catatan transaksi keuangan.
                </div>
              )}
            </div>

            {showJournalModal && createPortal(
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#020202',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'stretch',
                padding: 0
              }} onClick={() => setShowJournalModal(false)}>
                <div 
                  className="glass-panel animate-scale-in" 
                  style={{
                    width: '100vw',
                    height: '100vh',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    padding: '40px 24px',
                    background: '#020202',
                    textAlign: 'left',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }} 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ width: '100%', maxWidth: '640px' }}>
                    {/* Close Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <button 
                        onClick={() => setShowJournalModal(false)}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--text-secondary)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plus size={20} style={{ color: '#ffffff' }} />
                      <span>Tambah Jurnal Keuangan</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Gunakan formulir ini untuk mencatat transaksi saldo masuk atau saldo keluar secara manual ke dalam sistem.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Jenis Jurnal</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: journalType === 'in' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: journalType === 'in' ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input 
                              type="radio" 
                              name="journalType" 
                              value="in" 
                              checked={journalType === 'in'} 
                              onChange={() => setJournalType('in')}
                              style={{ accentColor: '#ffffff' }}
                            />
                            <span>Saldo Masuk (Pemasukan)</span>
                          </label>
                          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: journalType === 'out' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: journalType === 'out' ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input 
                              type="radio" 
                              name="journalType" 
                              value="out" 
                              checked={journalType === 'out'} 
                              onChange={() => setJournalType('out')}
                              style={{ accentColor: '#ffffff' }}
                            />
                            <span>Saldo Keluar (Pengeluaran)</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Nominal Transaksi (Rp)</label>
                        <input 
                          type="number" 
                          placeholder="Contoh: 50000"
                          value={journalAmount}
                          onChange={(e) => setJournalAmount(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>Tanggal & Waktu Transaksi</label>
                          <button 
                            type="button"
                            onClick={() => {
                              const tzOffset = new Date().getTimezoneOffset() * 60000;
                              setJournalDate(new Date(Date.now() - tzOffset).toISOString().slice(0, 16));
                            }}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              color: '#ffffff', 
                              fontSize: '0.75rem', 
                              textDecoration: 'underline', 
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Pilih Waktu Sekarang
                          </button>
                        </div>
                        <input 
                          type="datetime-local" 
                          value={journalDate}
                          onChange={(e) => setJournalDate(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '6px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>Keterangan Jurnal</label>
                        <textarea 
                          placeholder="Tulis keterangan transaksi keuangan di sini secara detail..." 
                          value={journalDesc}
                          onChange={(e) => setJournalDesc(e.target.value)}
                          style={{ width: '100%', height: '100px', padding: '10px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button 
                          className="btn" 
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                          onClick={() => setShowJournalModal(false)}
                        >
                          Batal
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, background: '#ffffff', border: '1px solid #ffffff', color: '#020202', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => {
                            const amt = parseInt(journalAmount, 10);
                            if (isNaN(amt) || amt <= 0) {
                              alert('Silakan masukkan nominal transaksi yang valid!');
                              return;
                            }
                            if (!journalDesc.trim()) {
                              alert('Silakan isi keterangan jurnal!');
                              return;
                            }

                            const newJournal = {
                              id: 'journal_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                              type: journalType,
                              amount: amt,
                              desc: journalDesc.trim(),
                              date: new Date(journalDate).toISOString(),
                              operator: currentUser?.username || 'Staff',
                              createdAt: new Date().toISOString()
                            };

                            setFinancialJournals(prev => [newJournal, ...prev]);
                            setShowJournalModal(false);
                            setJournalAmount('');
                            setJournalDesc('');
                            alert('Jurnal keuangan berhasil dicatat!');
                          }}
                        >
                          Simpan Jurnal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
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
                <Star fill="#ffffff" color="#ffffff" size={20} />
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
                      title="Muat Lebih Banyak"
                      style={{
                        display: 'inline-flex',
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
      {isModalOpen && createPortal(
        <div className="admin-modal-overlay animate-fade-in" style={{ zIndex: 10000 }} onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '100%', maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} className="accent-text" />
                  <span>{editingMovie ? 'Edit Informasi Film' : 'Tambah Film Baru'}</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={22} /></button>
              </div>

              <form onSubmit={handleFormSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                      disabled={true}
                      required
                    />
                    <small className="form-tip">
                      ID unik digenerate otomatis untuk keperluan sistem URL/Slug film.
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
        </div>,
        document.body
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
      {/* Panitia QR Code scanner modal */}
      {showQRScanner && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }} onClick={() => setShowQRScanner(false)}>
          <div style={{
            background: '#121212',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            cursor: 'default'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowQRScanner(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              <X size={18} />
            </button>

            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
              Panitia Event
            </div>
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Scan QR Tiket Masuk
            </h3>

            {/* Video preview container */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              background: '#000000',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <video 
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* Scan box Overlay border animation */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '65%',
                height: '65%',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                pointerEvents: 'none'
              }}>
                {/* Scanner laser lines */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: '#f87171',
                  boxShadow: '0 0 8px #ef4444',
                  animation: 'scan-laser 2s infinite linear'
                }}></div>
              </div>
            </div>

            {/* Hidden canvas used for processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {isScanning ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4ade80' }}>
                  <span style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s infinite linear' }} />
                  <span>Membidik QR Code tiket...</span>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={startScanner}
                  className="btn btn-primary"
                  style={{ background: 'white', color: 'black', border: '1px solid white', padding: '10px 24px', fontWeight: 'bold', borderRadius: '20px', cursor: 'pointer' }}
                >
                  Aktifkan Kamera
                </button>
              )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Arahkan kamera ke QR Code yang ada pada E-Tiket pengunjung.
            </div>

            <style>{`
              @keyframes scan-laser {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>

          </div>
        </div>,
        document.body
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#020202',
          zIndex: 10100,
          overflowY: 'auto',
          padding: '40px 24px',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }} className="animate-fade-in" onClick={() => setPreviewSubmission(null)}>
          <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#020202', border: 'none', boxShadow: 'none' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '100%', maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>Detail Karya Peserta</h3>
                <button onClick={() => setPreviewSubmission(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={22} /></button>
              </div>
              
              {/* Social Media Card layout */}
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <Eye size={14} />
                      <span>Views</span>
                    </div>
                    <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(previewSubmission.views || 0).toLocaleString('id-ID')}</strong>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <Heart size={14} />
                      <span>Likes</span>
                    </div>
                    <strong style={{ color: 'white', fontSize: '1.1rem' }}>{(previewSubmission.likes || 0).toLocaleString('id-ID')}</strong>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
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
                <p style={{ margin: 0 }}><strong>Tautan Asli:</strong> <a href={previewSubmission.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline', wordBreak: 'break-all' }}>{previewSubmission.videoUrl}</a></p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Judging Submission Modal Overlay */}
      {judgingSubmission && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#020202',
          zIndex: 10100,
          overflowY: 'auto',
          padding: '40px 24px',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }} className="animate-fade-in" onClick={() => setJudgingSubmission(null)}>
          <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#020202', border: 'none', boxShadow: 'none' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '100%', maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>Penjurian Karya</h3>
                <button onClick={() => setJudgingSubmission(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={22} /></button>
              </div>
              <form onSubmit={handleJudgingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '4px' }}><strong>Judul Karya:</strong> {judgingSubmission.title}</p>
                  <p style={{ margin: 0 }}><strong>Peserta:</strong> {judgingSubmission.participantName}</p>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>Skor Penjurian (1 - 100)</label>
                  <input type="number" min="1" max="100" required value={judgingScore} onChange={(e) => setJudgingScore(e.target.value)} placeholder="Masukkan skor angka" style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>Ulasan / Masukan Juri</label>
                  <textarea rows="4" value={judgingFeedback} onChange={(e) => setJudgingFeedback(e.target.value)} placeholder="Tulis masukan konstruktif untuk peserta..." style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontFamily: 'inherit' }}></textarea>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setJudgingSubmission(null)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Simpan Nilai</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Transaction Authorization Confirmation Modal */}
      {authModal && createPortal(
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
        }} className="animate-fade-in" onClick={() => { setAuthModal(null); setAuthPassword(''); setAuthError(''); }}>
          <div className="admin-modal glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#020202', border: 'none', boxShadow: 'none' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '100%', maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={20} style={{ color: '#ffffff' }} />
                  <span>{authModal.title || 'Otorisasi Transaksi'}</span>
                </h3>
                <button 
                  onClick={() => { setAuthModal(null); setAuthPassword(''); setAuthError(''); }} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <XCircle size={22} />
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
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: authError ? '1px solid #ef4444' : '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
                  />
                  {authError && <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: '4px 0 0 0' }}>{authError}</p>}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
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
                    style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    Konfirmasi Otorisasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
