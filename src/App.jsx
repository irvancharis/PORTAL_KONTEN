import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MovieCard from './components/MovieCard';
import VideoPlayer from './components/VideoPlayer';
import PremiumModal from './components/PremiumModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import moviesData from './data/movies.json';
import AdminPanel from './components/AdminPanel';
import EventsUserPortal from './components/EventsUserPortal';
import WalletUserPortal from './components/WalletUserPortal';
import DiscoverPage from './pages/DiscoverPage';
import CommunitiesPage from './pages/CommunitiesPage';
import ProfilePage from './pages/ProfilePage';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  isFirebaseConfigured,
  db,
  auth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  getFirestoreMovies,
  saveFirestoreMovie,
  deleteFirestoreMovie,
  getFirestoreUser,
  getFirestoreUsers,
  saveFirestoreUser,
  deleteFirestoreUser,
  getFirestoreSettings,
  saveFirestoreSettings,
  getFirestoreConfirmations,
  saveFirestoreConfirmation,
  deleteFirestoreConfirmation,
  getFirestoreEvents,
  saveFirestoreEvent,
  deleteFirestoreEvent,
  getFirestoreEventParticipants,
  saveFirestoreEventParticipant,
  deleteFirestoreEventParticipant,
  getFirestoreEventSubmissions,
  saveFirestoreEventSubmission,
  deleteFirestoreEventSubmission,
  getFirestoreWithdrawals,
  saveFirestoreWithdrawal,
  deleteFirestoreWithdrawal,
  getFirestoreOffers,
  saveFirestoreOffer,
  deleteFirestoreOffer,
  getFirestoreFinancialJournals,
  saveFirestoreFinancialJournal,
  deleteFirestoreFinancialJournal,
  getFirestoreCommunities,
  saveFirestoreCommunity,
  deleteFirestoreCommunity,
  getFirestoreRegions,
  seedFirestoreRegions
} from './firebase';
import { 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Eye, 
  EyeOff,
  Star, 
  SlidersHorizontal, 
  Tag, 
  Flag, 
  ChevronDown, 
  RotateCcw,
  Film,
  User,
  X,
  Play,
  AlertTriangle,
  Trash2,
  LogOut,
  Edit,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Users,
  Search,
  TrendingUp,
  UserPlus,
  Award,
  Briefcase,
  Tv,
  MapPin,
  Clock,
  DollarSign,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';

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

const INDONESIAN_REGIONS = [
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
              <div style={{ padding: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const formatIndonesianDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  } catch (e) {
    console.error(e);
  }
  return dateStr;
};

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbww9byb9H5SIW_HknSEVJJe-oY9S--NaeKSPjcQ6IBACzoQc38oZ36bQqm__60gncIxxA/exec';

const fetchJSONP = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      const scriptTag = document.getElementById(callbackName);
      if (scriptTag) document.body.removeChild(scriptTag);
      resolve(data);
    };

    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const separator = url.includes('?') ? '&' : '?';
    const finalUrl = `${url}${separator}${queryString}&callback=${callbackName}`;

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = finalUrl;
    script.onerror = () => {
      delete window[callbackName];
      const scriptTag = document.getElementById(callbackName);
      if (scriptTag) document.body.removeChild(scriptTag);
      reject(new Error('JSONP request failed'));
    };
    document.body.appendChild(script);
  });
};

export default function App() {
  // Movie database state loaded from localStorage, fallback to movies.json
  const [movies, setMovies] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-movies');
    return saved ? JSON.parse(saved) : moviesData;
  });

  // Global affiliate links state loaded from localStorage
  const [affiliateLinks, setAffiliateLinks] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-affiliate-links');
    return saved ? JSON.parse(saved) : [
      'https://shopee.co.id',
      'https://tokopedia.com'
    ];
  });

  // Navigation & Sidebar states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('portal-active-tab') || 'discover';
  }); // 'discover', 'watchlist', 'history', 'admin'
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [communityRegionalFilter, setCommunityRegionalFilter] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portal-theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('portal-theme', theme);
  }, [theme]);

  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Movie selection (watch page) states
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Watchlist & History States
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);

  // Users state loaded from localStorage or initialized with defaults
  const [users, setUsers] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-users');
    let usersList = saved ? JSON.parse(saved) : [];
    const defaults = [
      { id: '1', username: 'admin', password: 'admin', role: 'superadmin', isCommunity: false, joinedMembers: [] },
      { id: '2', username: 'staff', password: 'staff', role: 'staf', isCommunity: false, joinedMembers: [] },
      { id: '3', username: 'member', password: 'member', role: 'member', isCommunity: false, joinedMembers: [] },
      { id: '4', username: 'panitia', password: 'panitia', role: 'panitia', isCommunity: true, activeMembersCount: '5', joinedMembers: [] },
      { id: '5', username: 'moderator', password: 'moderator', role: 'moderator', isCommunity: false, joinedMembers: [] },
      { id: '6', username: 'editor', password: 'editor', role: 'editor', isCommunity: false, joinedMembers: [] }
    ];
    if (usersList.length === 0) {
      localStorage.setItem('portal-users', JSON.stringify(defaults));
      return defaults;
    } else {
      let changed = false;
      if (!usersList.some(u => u.username.toLowerCase() === 'panitia')) {
        usersList.push({ id: '4', username: 'panitia', password: 'panitia', role: 'panitia', isCommunity: true, activeMembersCount: '5', joinedMembers: [] });
        changed = true;
      }
      if (!usersList.some(u => u.username.toLowerCase() === 'moderator')) {
        usersList.push({ id: '5', username: 'moderator', password: 'moderator', role: 'moderator', isCommunity: false, joinedMembers: [] });
        changed = true;
      }
      if (!usersList.some(u => u.username.toLowerCase() === 'editor')) {
        usersList.push({ id: '6', username: 'editor', password: 'editor', role: 'editor', isCommunity: false, joinedMembers: [] });
        changed = true;
      }
      
      // Ensure all users have sanitized fields
      usersList = usersList.map(u => {
        const isComm = u.role === 'panitia';
        return {
          ...u,
          isCommunity: u.isCommunity !== undefined ? u.isCommunity : isComm,
          activeMembersCount: u.activeMembersCount || (isComm ? '5' : ''),
          joinedMembers: u.joinedMembers || []
        };
      });
      
      if (changed) {
        localStorage.setItem('portal-users', JSON.stringify(usersList));
      }
      return usersList;
    }
  });

  const [communities, setCommunities] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-communities');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'panitia',
        username: 'panitia',
        name: 'Panitia Portal',
        phone: '081234567890',
        description: 'Komunitas resmi penyelenggara kompetisi kreatif ngonten.id.',
        avatar: '',
        activeMembersCount: '5',
        joinedMembers: []
      }
    ];
  });

  const handleSetCommunities = async (newCommunities) => {
    if (isFirebaseConfigured()) {
      if (typeof newCommunities === 'function') {
        setCommunities(prev => {
          const updated = newCommunities(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(c => c.id);
              const deleted = prev.filter(c => !remainingIds.includes(c.id));
              for (const c of deleted) {
                await deleteFirestoreCommunity(c.id);
              }
            } else {
              for (const c of updated) {
                const existing = prev.find(old => old.id === c.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(c)) {
                  await saveFirestoreCommunity(c);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = communities;
        setCommunities(newCommunities);
        if (newCommunities.length < prev.length) {
          const remainingIds = newCommunities.map(c => c.id);
          const deleted = prev.filter(c => !remainingIds.includes(c.id));
          for (const c of deleted) {
            await deleteFirestoreCommunity(c.id);
          }
        } else {
          for (const c of newCommunities) {
            const existing = prev.find(old => old.id === c.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(c)) {
              await saveFirestoreCommunity(c);
            }
          }
        }
      }
    } else {
      const value = typeof newCommunities === 'function' ? newCommunities(communities) : newCommunities;
      setCommunities(value);
      localStorage.setItem('portal-communities', JSON.stringify(value));
    }
  };

  const [customRoles, setCustomRoles] = useState(() => {
    const saved = localStorage.getItem('portal-custom-roles');
    return saved ? JSON.parse(saved) : [
      { id: 'staf', name: 'Staf', permissions: ['movies', 'affiliates', 'confirmations', 'withdrawals', 'finance-report'] },
      { id: 'panitia', name: 'Panitia', permissions: ['event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace'] },
      { id: 'moderator', name: 'Moderator', permissions: ['confirmations', 'withdrawals'] },
      { id: 'editor', name: 'Editor', permissions: ['movies', 'affiliates'] },
      { id: 'user', name: 'User / Creator', permissions: ['event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace'] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('portal-custom-roles', JSON.stringify(customRoles));
  }, [customRoles]);

  // Migration to ensure 'staf' custom role has 'finance-report' permission and 'user' role exists
  useEffect(() => {
    let changed = false;
    let updated = customRoles.map(role => {
      if (role.id === 'staf' && !role.permissions.includes('finance-report')) {
        changed = true;
        return { ...role, permissions: [...role.permissions, 'finance-report'] };
      }
      return role;
    });

    if (!updated.some(role => role.id === 'user')) {
      updated.push({ id: 'user', name: 'User / Creator', permissions: ['event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace'] });
      changed = true;
    }

    if (changed) {
      setCustomRoles(updated);
    }
  }, [customRoles]);

  // Event creator states
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('portal-events');
    let list = saved ? JSON.parse(saved) : [];
    // Filter out dummy items to ensure a clean start
    list = list.filter(e => e.id !== 'evt_1' && e.id !== 'evt_2');
    localStorage.setItem('portal-events', JSON.stringify(list));
    return list;
  });

  const [eventParticipants, setEventParticipants] = useState(() => {
    const saved = localStorage.getItem('portal-event-participants');
    let list = saved ? JSON.parse(saved) : [];
    // Filter out dummy items to ensure a clean start
    list = list.filter(p => p.id !== 'part_1' && p.id !== 'part_2');
    localStorage.setItem('portal-event-participants', JSON.stringify(list));
    return list;
  });

  const [eventSubmissions, setEventSubmissions] = useState(() => {
    const saved = localStorage.getItem('portal-event-submissions');
    let list = saved ? JSON.parse(saved) : [];
    // Filter out dummy items to ensure a clean start
    list = list.filter(s => s.id !== 'sub_1');
    localStorage.setItem('portal-event-submissions', JSON.stringify(list));
    return list;
  });

  // Effects to save event states
  useEffect(() => {
    localStorage.setItem('portal-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('portal-event-participants', JSON.stringify(eventParticipants));
  }, [eventParticipants]);

  useEffect(() => {
    localStorage.setItem('portal-event-submissions', JSON.stringify(eventSubmissions));
  }, [eventSubmissions]);

  const [withdrawals, setWithdrawals] = useState(() => {
    const saved = localStorage.getItem('portal-withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('portal-offers');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSetOffers = async (newOffers) => {
    if (isFirebaseConfigured()) {
      if (typeof newOffers === 'function') {
        setOffers(prev => {
          const updated = newOffers(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(o => o.id);
              const deleted = prev.filter(o => !remainingIds.includes(o.id));
              for (const o of deleted) {
                await deleteFirestoreOffer(o.id);
              }
            } else {
              for (const o of updated) {
                const existing = prev.find(old => old.id === o.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(o)) {
                  await saveFirestoreOffer(o);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = offers;
        const updated = newOffers;
        setOffers(updated);
        if (updated.length < prev.length) {
          const remainingIds = updated.map(o => o.id);
          const deleted = prev.filter(o => !remainingIds.includes(o.id));
          for (const o of deleted) {
            await deleteFirestoreOffer(o.id);
          }
        } else {
          for (const o of updated) {
            const existing = prev.find(old => old.id === o.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(o)) {
              await saveFirestoreOffer(o);
            }
          }
        }
      }
    } else {
      if (typeof newOffers === 'function') {
        setOffers(prev => {
          const updated = newOffers(prev);
          localStorage.setItem('portal-offers', JSON.stringify(updated));
          return updated;
        });
      } else {
        setOffers(newOffers);
        localStorage.setItem('portal-offers', JSON.stringify(newOffers));
      }
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      localStorage.setItem('portal-offers', JSON.stringify(offers));
    }
  }, [offers]);

  const handleSetWithdrawals = async (newWithdrawals) => {
    if (isFirebaseConfigured()) {
      if (typeof newWithdrawals === 'function') {
        setWithdrawals(prev => {
          const updated = newWithdrawals(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(w => w.id);
              const deleted = prev.filter(w => !remainingIds.includes(w.id));
              for (const w of deleted) {
                await deleteFirestoreWithdrawal(w.id);
              }
            } else {
              for (const w of updated) {
                const existing = prev.find(old => old.id === w.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(w)) {
                  await saveFirestoreWithdrawal(w);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = withdrawals;
        setWithdrawals(newWithdrawals);
        if (newWithdrawals.length < prev.length) {
          const remainingIds = newWithdrawals.map(w => w.id);
          const deleted = prev.filter(w => !remainingIds.includes(w.id));
          for (const w of deleted) {
            await deleteFirestoreWithdrawal(w.id);
          }
        } else {
          for (const w of newWithdrawals) {
            const existing = prev.find(old => old.id === w.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(w)) {
              await saveFirestoreWithdrawal(w);
            }
          }
        }
      }
    } else {
      setWithdrawals(newWithdrawals);
    }
  };

  useEffect(() => {
    localStorage.setItem('portal-withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  const [adminSubTab, setAdminSubTab] = useState(() => {
    return localStorage.getItem('portal-admin-sub-tab') || 'event-dashboard';
  });

  useEffect(() => {
    localStorage.setItem('portal-admin-sub-tab', adminSubTab);
  }, [adminSubTab]);

  // Financial journals state for manual income/expense inputs
  const [financialJournals, setFinancialJournals] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-financial-journals');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSetFinancialJournals = async (newJournals) => {
    if (isFirebaseConfigured()) {
      if (typeof newJournals === 'function') {
        setFinancialJournals(prev => {
          const updated = newJournals(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(j => j.id);
              const deleted = prev.filter(j => !remainingIds.includes(j.id));
              for (const j of deleted) {
                await deleteFirestoreFinancialJournal(j.id);
              }
            } else {
              for (const j of updated) {
                const existing = prev.find(old => old.id === j.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(j)) {
                  await saveFirestoreFinancialJournal(j);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = financialJournals;
        setFinancialJournals(newJournals);
        if (newJournals.length < prev.length) {
          const remainingIds = newJournals.map(j => j.id);
          const deleted = prev.filter(j => !remainingIds.includes(j.id));
          for (const j of deleted) {
            await deleteFirestoreFinancialJournal(j.id);
          }
        } else {
          for (const j of newJournals) {
            const existing = prev.find(old => old.id === j.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(j)) {
              await saveFirestoreFinancialJournal(j);
            }
          }
        }
      }
    } else {
      if (typeof newJournals === 'function') {
        setFinancialJournals(prev => {
          const updated = newJournals(prev);
          localStorage.setItem('portal-financial-journals', JSON.stringify(updated));
          return updated;
        });
      } else {
        setFinancialJournals(newJournals);
        localStorage.setItem('portal-financial-journals', JSON.stringify(newJournals));
      }
    }
  };

  // Payment confirmations state
  const [confirmations, setConfirmations] = useState(() => {
    if (isFirebaseConfigured()) return [];
    const saved = localStorage.getItem('portal-confirmations');
    return saved ? JSON.parse(saved) : [];
  });

  // Current logged in user state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('portal-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('portal-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('portal-current-user');
    }
  }, [currentUser]);

  const prevUserRef = useRef(null);
  useEffect(() => {
    if (currentUser && !prevUserRef.current) {
      window.scrollTo(0, 0);
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // Automatic premium membership expiration check (30 days limit) for current user
  useEffect(() => {
    if (currentUser && (currentUser.role === 'member' || currentUser.role === 'pro') && currentUser.premiumExpiresAt) {
      const now = Date.now();
      if (now > currentUser.premiumExpiresAt) {
        const updated = { ...currentUser, role: 'user', premiumExpiresAt: null };
        setCurrentUser(updated);
        if (isFirebaseConfigured()) {
          saveFirestoreUser(updated);
        } else {
          handleSetUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        }
        alert("Masa aktif berlangganan Premium Anda telah habis (30 Hari). Status akun Anda dikembalikan menjadi user biasa.");
      }
    }
  }, [currentUser]);

  // Sync currentUser with latest user details from users list (for offline mode)
  useEffect(() => {
    if (!isFirebaseConfigured() && currentUser && users.length > 0) {
      const latestUser = users.find(u => u.id === currentUser.id);
      if (latestUser && JSON.stringify(latestUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(latestUser);
      }
    }
  }, [users, currentUser]);

  // Save users state changes
  useEffect(() => {
    localStorage.setItem('portal-users', JSON.stringify(users));
  }, [users]);



  // Save confirmations state changes
  useEffect(() => {
    localStorage.setItem('portal-confirmations', JSON.stringify(confirmations));
  }, [confirmations]);

  // Loading state for Firestore DB
  const [isLoadingDB, setIsLoadingDB] = useState(() => {
    return isFirebaseConfigured();
  });

  // Login Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('login'); // 'login' or 'register'
  const [registerRole, setRegisterRole] = useState('user'); // 'user' or 'panitia'
  const [loginModalLockedRole, setLoginModalLockedRole] = useState(null); // 'user', 'panitia', or null
  const [organizerName, setOrganizerName] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [organizerDescription, setOrganizerDescription] = useState('');
  const [organizerAvatar, setOrganizerAvatar] = useState('');
  const [activeMembersCount, setActiveMembersCount] = useState('');
  const [userCategory, setUserCategory] = useState('Videografer');
  const [userPortfolio, setUserPortfolio] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerRegional, setRegisterRegional] = useState('');

  // Edit Profile Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [globalLoadingText, setGlobalLoadingText] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.setGlobalLoading = setGlobalLoadingText;
    
    // Override default alert with custom beautiful toast
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const lower = msg.toLowerCase();
      let type = 'success';
      const errorKeywords = ['gagal', 'salah', 'tidak', 'belum', 'wajib', 'ditolak', 'batal', 'error', 'habis', 'kurang', 'ditutup', 'maksimal', 'spasi', 'warning', 'peringatan', 'kosong'];
      const hasErrorWord = errorKeywords.some(keyword => lower.includes(keyword));
      if (hasErrorWord) {
        type = 'error';
      }
      setToast({ message: msg, type: type });
      // auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    };

    return () => {
      window.setGlobalLoading = null;
      window.alert = originalAlert;
    };
  }, []);

  const [editProfileName, setEditProfileName] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileDescription, setEditProfileDescription] = useState('');
  const [editProfileAvatar, setEditProfileAvatar] = useState('');
  const [editProfileCategory, setEditProfileCategory] = useState('Videografer');
  const [editProfilePortfolio, setEditProfilePortfolio] = useState('');
  const [editProfileActiveMembers, setEditProfileActiveMembers] = useState('');
  const [editProfileActivityImages, setEditProfileActivityImages] = useState('');
  const [editProfileFacebookHandle, setEditProfileFacebookHandle] = useState('');
  const [editProfileFacebookVerified, setEditProfileFacebookVerified] = useState(false);
  const [editProfileTiktokHandle, setEditProfileTiktokHandle] = useState('');
  const [editProfileTiktokVerified, setEditProfileTiktokVerified] = useState(false);
  const [editProfileInstagramHandle, setEditProfileInstagramHandle] = useState('');
  const [editProfileInstagramVerified, setEditProfileInstagramVerified] = useState(false);
  const [editProfileYoutubeHandle, setEditProfileYoutubeHandle] = useState('');
  const [editProfileYoutubeVerified, setEditProfileYoutubeVerified] = useState(false);
  const [editProfileRegional, setEditProfileRegional] = useState('');
  const [regions, setRegions] = useState(INDONESIAN_REGIONS);

  // Social Verification Temp states
  const [verifyingPlatform, setVerifyingPlatform] = useState(null); // 'facebook' | 'tiktok' | 'instagram' | 'youtube' | null
  const [verificationStep, setVerificationStep] = useState('input'); // 'input' | 'verify' | 'loading' | 'success' | 'failed' | 'expired'
  const [uniqueCode, setUniqueCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [verificationError, setVerificationError] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Social Media Verification Timer countdown
  useEffect(() => {
    let interval = null;
    if (verifyingPlatform && verificationStep === 'verify' && timerSeconds > 0) {
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
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verifyingPlatform, verificationStep, timerSeconds]);

  const usernameInputRef = useRef(null);

  const handleCheckProfileSocialMedia = async (platform, username, code) => {
    let cleanUsername = username.trim();
    if (cleanUsername.startsWith('@')) {
      cleanUsername = cleanUsername.substring(1);
    }
    
    // Test simulation accounts
    const isTestMockSuccess = cleanUsername.toLowerCase() === 'rudiwijaya' || cleanUsername.toLowerCase() === 'sanaminnulloh';
    const isTestMockFailure = cleanUsername.toLowerCase() === 'notfound' || 
                              cleanUsername.toLowerCase() === 'invalid' || 
                              cleanUsername.toLowerCase() === 'tidakditemukan' || 
                              cleanUsername.toLowerCase() === 'error';
    if (isTestMockSuccess) {
      return { exists: true, codeFound: true, status: 'approved' };
    }
    if (isTestMockFailure) {
      return { exists: false, codeFound: false, status: 'failed' };
    }

    try {
      if (GOOGLE_APPS_SCRIPT_URL) {
        try {
          const result = await fetchJSONP(GOOGLE_APPS_SCRIPT_URL, {
            platform: platform,
            username: cleanUsername,
            code: code
          });
          if (result && result.status) {
            return result;
          }
        } catch (scriptErr) {
          console.warn("Apps Script verification failed, trying client-side fallback:", scriptErr);
        }
      }
      
      // Fallback
      if (platform === 'tiktok') {
        const tikwmUrl = `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(cleanUsername)}`;
        const response = await fetch(tikwmUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.code === 0 && data.data && data.data.user) {
            const signature = data.data.user.signature || '';
            const containsCode = signature.toLowerCase().includes(code.toLowerCase());
            return {
              exists: true,
              codeFound: containsCode,
              status: containsCode ? 'approved' : 'failed'
            };
          }
        }
      } else if (platform === 'youtube') {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/@${cleanUsername}`)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          const html = data.contents || '';
          const containsCode = html.toLowerCase().includes(code.toLowerCase());
          return {
            exists: html.includes('ytInitialData') && !html.includes('This channel does not exist'),
            codeFound: containsCode,
            status: containsCode ? 'approved' : 'failed'
          };
        }
      } else {
        // Instagram / Facebook search
        const searchUrl = `https://html.duckduckgo.com/html/?q=site:${platform === 'instagram' ? 'instagram.com' : 'facebook.com'}/${cleanUsername}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          const html = data.contents || '';
          const hasResults = html.includes('class="result__body"') || html.includes('result__snippet');
          const containsCode = html.toLowerCase().includes(code.toLowerCase());
          return {
            exists: hasResults,
            codeFound: containsCode,
            status: containsCode ? 'approved' : 'failed'
          };
        }
      }
    } catch (e) {
      console.warn("Verification check failed:", e);
    }
    return { exists: false, codeFound: false, status: 'failed' };
  };

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setEditProfileName(currentUser.organizerName || '');
    setEditProfilePhone(currentUser.organizerPhone || '');
    setEditProfileDescription(currentUser.organizerDescription || '');
    setEditProfileAvatar(currentUser.organizerAvatar || '');
    setEditProfileCategory(currentUser.userCategory || 'Videografer');
    setEditProfilePortfolio(currentUser.userPortfolio || '');
    setEditProfileActiveMembers(currentUser.activeMembersCount || '');
    setEditProfileActivityImages(currentUser.activityImages ? currentUser.activityImages.join(', ') : '');
    setEditProfileRegional(currentUser.userRegional || '');
    
    // Social handles
    setEditProfileFacebookHandle(currentUser.facebookHandle || '');
    setEditProfileFacebookVerified(!!currentUser.facebookVerified);
    setEditProfileTiktokHandle(currentUser.tiktokHandle || '');
    setEditProfileTiktokVerified(!!currentUser.tiktokVerified);
    setEditProfileInstagramHandle(currentUser.instagramHandle || '');
    setEditProfileInstagramVerified(!!currentUser.instagramVerified);
    setEditProfileYoutubeHandle(currentUser.youtubeHandle || '');
    setEditProfileYoutubeVerified(!!currentUser.youtubeVerified);

    // Reset verification states
    setVerifyingPlatform(null);
    setVerificationStep('input');
    setVerificationError('');
    setSocialUrl('');
    setUniqueCode('');

    setIsEditProfileModalOpen(true);
  };

  // Open login/register modal
  const handleOpenLoginModal = (mode = 'login', role = 'user', isLocked = false) => {
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
    setLoginError('');
    setLoginUsername('');
    setLoginPassword('');
    setRegisterConfirmPassword('');
    setOrganizerName('');
    setOrganizerPhone('');
    setOrganizerDescription('');
    setOrganizerAvatar('');
    setRegisterRole(role);
    setLoginModalLockedRole(isLocked ? role : null);
  };

  // Autofocus username input when login modal opens
  useEffect(() => {
    if (isLoginModalOpen && usernameInputRef.current) {
      const timer = setTimeout(() => {
        usernameInputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoginModalOpen]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const emailOrUser = loginUsername.trim();
    const password = loginPassword;
    setGlobalLoadingText('Sedang masuk ke akun Anda...');

    if (isFirebaseConfigured() && auth) {
      try {
        // Assume emailOrUser is email. If it does not contain '@', append a dummy domain for local-like experience
        const email = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@jamkosong.com`;
        await signInWithEmailAndPassword(auth, email, password);
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setLoginError('');
      } catch (err) {
        // Fallback: Check if user exists in the Firestore database users list (e.g. legacy username-only account)
        let foundUser = null;
        try {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          // Check by username
          let q = query(collection(db, "users"), where("username", "==", emailOrUser));
          let querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.password === password) {
              foundUser = { id: doc.id, ...data };
            }
          });
          // If not found and input contains '@', check by email
          if (!foundUser && emailOrUser.includes('@')) {
            q = query(collection(db, "users"), where("email", "==", emailOrUser));
            querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.password === password) {
                foundUser = { id: doc.id, ...data };
              }
            });
          }
        } catch (dbErr) {
          console.error("Firestore legacy user check failed:", dbErr);
        }

        if (foundUser) {
          setCurrentUser(foundUser);
          setIsLoginModalOpen(false);
          setLoginUsername('');
          setLoginPassword('');
          setLoginError('');
          if (activeTab === 'admin' && foundUser.role === 'member') {
            handleTabChange('discover');
          }
        } else {
          console.error("Firebase Login failed:", err);
          setLoginError('Email/Username atau password salah.');
        }
      } finally {
        setGlobalLoadingText(null);
      }
    } else {
      const foundUser = users.find(
        u => u.username.toLowerCase() === emailOrUser.toLowerCase() && u.password === password
      );
      if (foundUser) {
        setCurrentUser(foundUser);
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setLoginError('');
        if (activeTab === 'admin' && foundUser.role === 'member') {
          handleTabChange('discover');
        }
      } else {
        setLoginError('Username atau password salah.');
      }
      setGlobalLoadingText(null);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Ukuran file maksimal adalah 500 KB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrganizerAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const emailOrUser = loginUsername.trim();
    const password = loginPassword.trim();
    const confirm = registerConfirmPassword.trim();

    if (!emailOrUser || !password || !confirm || !registerRegional.trim()) {
      setLoginError('Semua kolom wajib diisi, termasuk Lokasi Regional!');
      return;
    }
    if (password !== confirm) {
      setLoginError('Konfirmasi password tidak cocok!');
      return;
    }

    const isComm = registerRole === 'panitia';
    if (isComm) {
      if (!organizerName.trim() || !organizerPhone.trim() || !activeMembersCount.trim()) {
        setLoginError('Nama Komunitas, No. Telepon, dan Jumlah Anggota Aktif wajib diisi!');
        return;
      }
    }

    setGlobalLoadingText('Sedang mendaftarkan akun baru...');

    if (isFirebaseConfigured() && auth) {
      try {
        const email = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@jamkosong.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = {
          id: userCredential.user.uid,
          username: email.split('@')[0],
          email: email.toLowerCase(),
          password,
          role: registerRole, // 'user' (Kreator) or 'panitia' (Komunitas)
          walletBalance: 0,
          organizerName: isComm ? organizerName.trim() : '',
          organizerPhone: isComm ? organizerPhone.trim() : '',
          organizerDescription: isComm ? organizerDescription.trim() : '',
          organizerAvatar: isComm ? (organizerAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizerName.trim())}&backgroundColor=262626&textColor=ffffff`) : '',
          activeMembersCount: isComm ? activeMembersCount.trim() : '',
          isCommunity: isComm,
          joinedMembers: [],
          userCategory: 'Videografer',
          userPortfolio: '',
          userRegional: registerRegional.trim()
        };
        await saveFirestoreUser(newUser);
        if (isComm) {
          const newComm = {
            id: newUser.username,
            username: newUser.username,
            name: newUser.organizerName,
            phone: newUser.organizerPhone,
            description: newUser.organizerDescription,
            avatar: newUser.organizerAvatar,
            activeMembersCount: newUser.activeMembersCount,
            joinedMembers: []
          };
          await saveFirestoreCommunity(newComm);
          setCommunities(prev => [...prev, newComm]);
        }
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setRegisterConfirmPassword('');
        setRegisterRegional('');
        setOrganizerName('');
        setOrganizerPhone('');
        setOrganizerDescription('');
        setOrganizerAvatar('');
        setActiveMembersCount('');
        setUserCategory('Videografer');
        setUserPortfolio('');
        setLoginError('');
      } catch (err) {
        console.error("Firebase registration failed:", err);
        if (err.code === 'auth/email-already-in-use') {
          setLoginError('Email sudah terdaftar oleh user lain!');
        } else if (err.code === 'auth/weak-password') {
          setLoginError('Password minimal harus 6 karakter!');
        } else {
          setLoginError('Pendaftaran gagal: ' + err.message);
        }
      } finally {
        setGlobalLoadingText(null);
      }
    } else {
      if (users.some(u => u.username.toLowerCase() === emailOrUser.toLowerCase())) {
        setLoginError('Username sudah digunakan oleh user lain!');
        setGlobalLoadingText(null);
        return;
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        username: emailOrUser,
        password,
        role: registerRole, // 'user' or 'panitia'
        organizerName: isComm ? organizerName.trim() : '',
        organizerPhone: isComm ? organizerPhone.trim() : '',
        organizerDescription: isComm ? organizerDescription.trim() : '',
        organizerAvatar: isComm ? (organizerAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizerName.trim())}&backgroundColor=262626&textColor=ffffff`) : '',
        activeMembersCount: isComm ? activeMembersCount.trim() : '',
        isCommunity: isComm,
        joinedMembers: [],
        userCategory: 'Videografer',
        userPortfolio: '',
        userRegional: registerRegional.trim()
      };
      await handleSetUsers(prev => [...prev, newUser]);
      if (isComm) {
        const newComm = {
          id: newUser.username,
          username: newUser.username,
          name: newUser.organizerName,
          phone: newUser.organizerPhone,
          description: newUser.organizerDescription,
          avatar: newUser.organizerAvatar,
          activeMembersCount: newUser.activeMembersCount,
          joinedMembers: []
        };
        await handleSetCommunities(prev => [...prev, newComm]);
      }
      setCurrentUser(newUser);
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setRegisterConfirmPassword('');
      setRegisterRegional('');
      setOrganizerName('');
      setOrganizerPhone('');
      setOrganizerDescription('');
      setOrganizerAvatar('');
      setActiveMembersCount('');
      setUserCategory('Videografer');
      setUserPortfolio('');
      setLoginError('');
      setGlobalLoadingText(null);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured() || !auth) {
      alert('Firebase Authentication tidak aktif di sistem lokal.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      // Use redirect on mobile/Safari iOS to avoid popup block/stuck promise issues
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
      
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        setIsLoginModalOpen(false);
        setLoginError('');
      }
    } catch (err) {
      console.error("Google Login failed:", err);
      setLoginError('Google Sign-In gagal: ' + err.message);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Signout failed:", err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('portal-current-user');
    setActiveTab('discover');
    setIsPlaying(false);
    setSelectedMovie(null);
    window.location.hash = '';
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Fetch initial data from Firestore if configured
  useEffect(() => {
    const initFirestore = async () => {
      if (isFirebaseConfigured()) {
        console.log("Checking Firestore initialization...");
        try {
          // Fetch settings first to check if database has already been initialized
          let dbSettings = await getFirestoreSettings();
          const needsInitialization = !dbSettings || dbSettings.dbInitialized !== true;

          if (needsInitialization) {
            console.log("Firestore is not initialized. Performing first-time seeding...");
            
            // 1. Seed movies if empty
            const dbMovies = await getFirestoreMovies();
            if (!dbMovies || dbMovies.length === 0) {
              for (const movie of moviesData) {
                await saveFirestoreMovie(movie);
              }
            }

            // 2. Seed users if empty
            const dbUsers = await getFirestoreUsers();
            if (!dbUsers || dbUsers.length === 0) {
              const defaultUsers = [
                { id: '1', username: 'admin', password: 'admin', role: 'superadmin' },
                { id: '2', username: 'staff', password: 'staff', role: 'staf' },
                { id: '3', username: 'member', password: 'member', role: 'member' }
              ];
              for (const u of defaultUsers) {
                await saveFirestoreUser(u);
              }
            }

            // Save settings with dbInitialized = true
            const initialSettings = {
              dbInitialized: true,
              gdriveApiKey: dbSettings?.gdriveApiKey || "",
              affiliateLinks: dbSettings?.affiliateLinks || [
                'https://shopee.co.id',
                'https://tokopedia.com'
              ],
              whatsappAdmin: dbSettings?.whatsappAdmin || 'https://wa.me/6281234567890',
              premiumPrice: dbSettings?.premiumPrice || 'Rp 29.000 / Bulan',
              paymentInstructions: dbSettings?.paymentInstructions || '- Bank BCA: 1234567890 a.n. ngonten.id\n- DANA: 081234567890 a.n. Admin\n- OVO: 081234567890',
              minWithdrawalAmount: dbSettings?.minWithdrawalAmount || 50000,
              eventAdminFee: dbSettings?.eventAdminFee || 0,
              withdrawalFeePercent: dbSettings?.withdrawalFeePercent !== undefined ? dbSettings.withdrawalFeePercent : 5,
              withdrawalFeePercentPremium: dbSettings?.withdrawalFeePercentPremium !== undefined ? dbSettings.withdrawalFeePercentPremium : 2
            };
            await saveFirestoreSettings(initialSettings);
            dbSettings = initialSettings;
          }
          
          if (dbSettings) {
            if (dbSettings.affiliateLinks) {
              setAffiliateLinks(dbSettings.affiliateLinks);
            }
            if (dbSettings.gdriveApiKey) {
              setGdriveApiKey(dbSettings.gdriveApiKey);
            }
            if (dbSettings.whatsappAdmin) {
              setWhatsappAdmin(dbSettings.whatsappAdmin);
            }
            if (dbSettings.premiumPrice) {
              setPremiumPrice(dbSettings.premiumPrice);
            }
            if (dbSettings.paymentInstructions) {
              setPaymentInstructions(dbSettings.paymentInstructions);
            }
            if (dbSettings.minWithdrawalAmount !== undefined) {
              setMinWithdrawalAmount(dbSettings.minWithdrawalAmount);
            }
            if (dbSettings.eventAdminFee !== undefined) {
              setEventAdminFee(dbSettings.eventAdminFee);
            }
            if (dbSettings.withdrawalFeePercent !== undefined) {
              setWithdrawalFeePercent(dbSettings.withdrawalFeePercent);
            }
            if (dbSettings.withdrawalFeePercentPremium !== undefined) {
              setWithdrawalFeePercentPremium(dbSettings.withdrawalFeePercentPremium);
            }
          }

          // Fetch all other collections once to populate state initially (heavy optimization)
          console.log("Fetching one-time Firestore snapshot for collections...");
          const [
            dbMovies,
            dbConfirmations,
            dbEvents,
            dbParticipants,
            dbSubmissions,
            dbWithdrawals,
            dbOffers,
            dbUsers,
            dbFinancialJournals,
            dbCommunities,
            dbRegions
          ] = await Promise.all([
            getFirestoreMovies(),
            getFirestoreConfirmations(),
            getFirestoreEvents(),
            getFirestoreEventParticipants(),
            getFirestoreEventSubmissions(),
            getFirestoreWithdrawals(),
            getFirestoreOffers(),
            getFirestoreUsers(),
            getFirestoreFinancialJournals(),
            getFirestoreCommunities(),
            getFirestoreRegions()
          ]);
 
          if (dbMovies) setMovies(dbMovies);
          
          if (currentUser) {
            const updatedMe = await getFirestoreUser(currentUser.id);
            if (updatedMe) {
              setCurrentUser(prev => {
                if (prev && JSON.stringify(prev) !== JSON.stringify(updatedMe)) {
                  return updatedMe;
                }
                return prev;
              });
            }
          }
          if (dbConfirmations) setConfirmations(dbConfirmations);
          if (dbEvents) setEvents(dbEvents);
          if (dbParticipants) setEventParticipants(dbParticipants);
          if (dbSubmissions) setEventSubmissions(dbSubmissions);
          if (dbWithdrawals) setWithdrawals(dbWithdrawals);
          if (dbOffers) setOffers(dbOffers);
          if (dbUsers) setUsers(dbUsers);
          if (dbFinancialJournals) setFinancialJournals(dbFinancialJournals);
          
          if (dbCommunities) {
            if (dbCommunities.length === 0) {
              const defaultComm = {
                id: 'panitia',
                username: 'panitia',
                name: 'Panitia Portal',
                phone: '081234567890',
                description: 'Komunitas resmi penyelenggara kompetisi kreatif ngonten.id.',
                avatar: '',
                activeMembersCount: '5',
                joinedMembers: []
              };
              await saveFirestoreCommunity(defaultComm);
              setCommunities([defaultComm]);
            } else {
              setCommunities(dbCommunities);
            }
          }

          if (dbRegions) {
            if (dbRegions.length === 0) {
              await seedFirestoreRegions(INDONESIAN_REGIONS);
              setRegions(INDONESIAN_REGIONS);
            } else {
              const loadedRegionsList = dbRegions.map(r => r.name).sort();
              setRegions(loadedRegionsList);
            }
          }

        } catch (err) {
          console.error("Firestore initialization failed:", err);
        } finally {
          setIsLoadingDB(false);
        }
      } else {
        setIsLoadingDB(false);
      }
    };

    initFirestore();
  }, [currentUser]);

  // General Ledger sync and auto-migration trigger
  useEffect(() => {
    if (isLoadingDB) return;

    let updatedJournals = [...financialJournals];
    let changed = false;

    // Helper to check if journal already exists
    const hasJournal = (id) => updatedJournals.some(j => j.id === id || j.id === `evt_${id}`);

    // 1. Auto-journal approved confirmations
    confirmations.forEach(c => {
      if (c.status === 'approved' && !hasJournal(c.id)) {
        const parseAmount = (amtStr) => {
          if (!amtStr) return 0;
          if (typeof amtStr === 'number') return amtStr;
          const clean = amtStr.replace(/[^0-9]/g, '');
          return parseInt(clean, 10) || 0;
        };

        updatedJournals.push({
          id: c.id,
          type: 'in',
          amount: parseAmount(c.amount),
          desc: `Premium Membership - Paket ${c.planName || 'BASIC'} (User: ${c.username})`,
          date: new Date(c.timestamp || Date.now()).toISOString(),
          operator: 'System (Auto)',
          createdAt: new Date().toISOString()
        });
        changed = true;
      }
    });

    // 2. Auto-journal paid events
    events.forEach(evt => {
      if (evt.paymentStatus === 'paid' && !hasJournal(evt.id)) {
        const amount = (evt.campaignBudget || 0) + (evt.adminFee || 0);
        updatedJournals.push({
          id: `evt_${evt.id}`,
          type: 'in',
          amount: amount,
          desc: `Event: ${evt.title} (Budget: Rp ${evt.campaignBudget?.toLocaleString('id-ID')} + Admin Fee: Rp ${evt.adminFee?.toLocaleString('id-ID')})`,
          date: new Date(evt.paymentSubmittedAt || evt.createdAt || Date.now()).toISOString(),
          operator: 'System (Auto)',
          createdAt: new Date().toISOString()
        });
        changed = true;
      }
    });

    // 3. Auto-journal approved withdrawals
    withdrawals.forEach(w => {
      if (w.status === 'approved' && !hasJournal(w.id)) {
        updatedJournals.push({
          id: w.id,
          type: 'out',
          amount: w.amount || 0,
          desc: `Withdrawal ke ${w.method} (${w.account}) a.n ${w.name} (User: ${w.username})`,
          date: new Date(w.requestedAt || Date.now()).toISOString(),
          operator: 'System (Auto)',
          createdAt: new Date().toISOString()
        });
        changed = true;
      }
    });

    if (changed) {
      handleSetFinancialJournals(updatedJournals);
    }
  }, [confirmations, events, withdrawals, financialJournals, isLoadingDB]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    // Check redirect result (needed for mobile/Safari redirect flows)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Firebase redirect login success:", result.user.email);
        }
      })
      .catch((err) => {
        console.error("Firebase redirect login failed:", err);
        setLoginError('Google Sign-In gagal: ' + err.message);
        setIsLoginModalOpen(true);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase user logged in:", firebaseUser.email);
        
        let matchedUser = await getFirestoreUser(firebaseUser.uid);

        if (!matchedUser) {
          const emailLower = firebaseUser.email.toLowerCase();
          let targetRole = 'user';
          if (emailLower === 'admin@gmail.com' || emailLower === 'admin@jamkosong.web.app' || emailLower.startsWith('admin@')) {
            targetRole = 'superadmin';
          }

          matchedUser = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            password: 'firebase-auth-managed',
            role: targetRole,
            walletBalance: 0
          };
          
          await saveFirestoreUser(matchedUser);
        }

        setCurrentUser(matchedUser);
        
        // Auto-close modal and reset fields upon login detection
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setRegisterConfirmPassword('');
        setOrganizerName('');
        setOrganizerPhone('');
        setOrganizerDescription('');
        setOrganizerAvatar('');
        setLoginError('');
      } else {
        const savedUser = JSON.parse(localStorage.getItem('portal-current-user') || 'null');
        if (savedUser && savedUser.password === 'firebase-auth-managed') {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Intercept movie changes and sync to Firestore
  const handleSetMovies = async (newMovies) => {
    if (isFirebaseConfigured()) {
      if (typeof newMovies === 'function') {
        setMovies(prev => {
          const updated = newMovies(prev);
          // Async sync
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(m => m.id);
              const deleted = prev.filter(m => !remainingIds.includes(m.id));
              for (const m of deleted) {
                await deleteFirestoreMovie(m.id);
              }
            } else {
              for (const m of updated) {
                const existing = prev.find(old => old.id === m.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(m)) {
                  await saveFirestoreMovie(m);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = movies;
        setMovies(newMovies);
        if (newMovies.length < prev.length) {
          const remainingIds = newMovies.map(m => m.id);
          const deleted = prev.filter(m => !remainingIds.includes(m.id));
          for (const m of deleted) {
            await deleteFirestoreMovie(m.id);
          }
        } else {
          for (const m of newMovies) {
            const existing = prev.find(old => old.id === m.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(m)) {
              await saveFirestoreMovie(m);
            }
          }
        }
      }
    } else {
      setMovies(newMovies);
    }
  };

  // Intercept user changes and sync to Firestore
  const handleSetUsers = async (newUsers) => {
    if (isFirebaseConfigured()) {
      if (typeof newUsers === 'function') {
        setUsers(prev => {
          const updated = newUsers(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(u => u.id);
              const deleted = prev.filter(u => !remainingIds.includes(u.id));
              for (const u of deleted) {
                await deleteFirestoreUser(u.id);
              }
            } else {
              for (const u of updated) {
                const existing = prev.find(old => old.id === u.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(u)) {
                  await saveFirestoreUser(u);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = users;
        setUsers(newUsers);
        if (newUsers.length < prev.length) {
          const remainingIds = newUsers.map(u => u.id);
          const deleted = prev.filter(u => !remainingIds.includes(u.id));
          for (const u of deleted) {
            await deleteFirestoreUser(u.id);
          }
        } else {
          for (const u of newUsers) {
            const existing = prev.find(old => old.id === u.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(u)) {
              await saveFirestoreUser(u);
            }
          }
        }
      }
    } else {
      setUsers(newUsers);
    }
  };

  const handleToggleJoinCommunity = async (communityUsername) => {
    if (!currentUser) return;
    
    let latestComm = [...communities];
    if (isFirebaseConfigured()) {
      const dbComm = await getFirestoreCommunities();
      if (dbComm) {
        latestComm = dbComm;
      }
    }
    
    const targetComm = latestComm.find(c => c.username.toLowerCase() === communityUsername.toLowerCase());
    if (!targetComm) return;

    const members = targetComm.joinedMembers || [];
    const pending = targetComm.pendingMembers || [];
    const isMember = members.includes(currentUser.username);
    const isPending = pending.includes(currentUser.username);

    if (!isMember && !isPending) {
      const isProfileIncomplete = !currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio;
      if (isProfileIncomplete) {
        alert("Profil Belum Lengkap! Silakan lengkapi profil Anda (Nama, WhatsApp/HP, dan Portofolio) terlebih dahulu agar dapat bergabung dengan komunitas.");
        handleOpenEditProfile();
        return;
      }
    }

    let reason = '';
    if (isMember) {
      const inputReason = prompt("Masukkan alasan Anda keluar dari komunitas ini:");
      if (inputReason === null) return; // User clicked Cancel
      if (!inputReason.trim()) {
        alert("Alasan harus diisi untuk keluar dari komunitas.");
        return;
      }
      reason = inputReason.trim();
    }
    
    const updatedComm = latestComm.map(c => {
      if (c.username.toLowerCase() === communityUsername.toLowerCase()) {
        const pending = c.pendingMembers || [];
        const isPending = pending.includes(currentUser.username);
        
        let newMembers = [...members];
        let newPending = [...pending];
        
        if (isMember) {
          newMembers = members.filter(m => m !== currentUser.username);
          alert(`Anda telah keluar dari komunitas. Alasan: "${reason}"`);
        } else if (isPending) {
          newPending = pending.filter(m => m !== currentUser.username);
          alert('Permintaan bergabung dibatalkan.');
        } else {
          newPending = [...pending, currentUser.username];
          alert('Permintaan bergabung telah dikirim. Menunggu persetujuan dari pemilik komunitas.');
        }
          
        return {
          ...c,
          joinedMembers: newMembers,
          pendingMembers: newPending
        };
      }
      return c;
    });

    await handleSetCommunities(updatedComm);
  };

  const handleKickMember = async (communityId, memberUsername) => {
    if (!confirm(`Apakah Anda yakin ingin mengeluarkan anggota "${memberUsername}" dari komunitas?`)) {
      return;
    }
    let latestComm = [...communities];
    if (isFirebaseConfigured()) {
      const dbComm = await getFirestoreCommunities();
      if (dbComm) {
        latestComm = dbComm;
      }
    }
    const updatedComm = latestComm.map(c => {
      if (c.id === communityId) {
        const joined = c.joinedMembers || [];
        return {
          ...c,
          joinedMembers: joined.filter(m => m !== memberUsername)
        };
      }
      return c;
    });
    await handleSetCommunities(updatedComm);
    alert(`Anggota "${memberUsername}" telah dikeluarkan.`);
  };

  const handleApproveMember = async (communityId, memberUsername) => {
    let latestComm = [...communities];
    if (isFirebaseConfigured()) {
      const dbComm = await getFirestoreCommunities();
      if (dbComm) {
        latestComm = dbComm;
      }
    }
    const updatedComm = latestComm.map(c => {
      if (c.id === communityId) {
        const pending = c.pendingMembers || [];
        const joined = c.joinedMembers || [];
        if (pending.includes(memberUsername)) {
          alert(`Persetujuan berhasil: ${memberUsername} kini bergabung di komunitas.`);
          return {
            ...c,
            pendingMembers: pending.filter(m => m !== memberUsername),
            joinedMembers: joined.includes(memberUsername) ? joined : [...joined, memberUsername]
          };
        }
      }
      return c;
    });
    await handleSetCommunities(updatedComm);
  };

  const handleRejectMember = async (communityId, memberUsername) => {
    let latestComm = [...communities];
    if (isFirebaseConfigured()) {
      const dbComm = await getFirestoreCommunities();
      if (dbComm) {
        latestComm = dbComm;
      }
    }
    const updatedComm = latestComm.map(c => {
      if (c.id === communityId) {
        const pending = c.pendingMembers || [];
        alert(`Persetujuan ditolak untuk ${memberUsername}.`);
        return {
          ...c,
          pendingMembers: pending.filter(m => m !== memberUsername)
        };
      }
      return c;
    });
    await handleSetCommunities(updatedComm);
  };

  const handleSaveAgenda = async (communityId, agendas) => {
    let latestComm = [...communities];
    if (isFirebaseConfigured()) {
      const dbComm = await getFirestoreCommunities();
      if (dbComm) {
        latestComm = dbComm;
      }
    }
    const updatedComm = latestComm.map(c => {
      if (c.id === communityId) {
        return {
          ...c,
          agendas: agendas
        };
      }
      return c;
    });
    await handleSetCommunities(updatedComm);
  };

  const handleTransferWallet = async (username, amount) => {
    let latestUsers = [...users];
    if (isFirebaseConfigured()) {
      const dbUsers = await getFirestoreUsers();
      if (dbUsers) {
        latestUsers = dbUsers;
      }
    }

    let userFound = false;
    const updatedUsers = latestUsers.map(u => {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        userFound = true;
        return { ...u, walletBalance: (u.walletBalance || 0) + amount };
      }
      return u;
    });

    await handleSetUsers(updatedUsers);
  };

  // Intercept confirmation changes and sync to Firestore
  const handleSetConfirmations = async (newConfirmations) => {
    if (isFirebaseConfigured()) {
      if (typeof newConfirmations === 'function') {
        setConfirmations(prev => {
          const updated = newConfirmations(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(c => c.id);
              const deleted = prev.filter(c => !remainingIds.includes(c.id));
              for (const c of deleted) {
                await deleteFirestoreConfirmation(c.id);
              }
            } else {
              for (const c of updated) {
                const existing = prev.find(old => old.id === c.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(c)) {
                  await saveFirestoreConfirmation(c);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = confirmations;
        setConfirmations(newConfirmations);
        if (newConfirmations.length < prev.length) {
          const remainingIds = newConfirmations.map(c => c.id);
          const deleted = prev.filter(c => !remainingIds.includes(c.id));
          for (const c of deleted) {
            await deleteFirestoreConfirmation(c.id);
          }
        } else {
          for (const c of newConfirmations) {
            const existing = prev.find(old => old.id === c.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(c)) {
              await saveFirestoreConfirmation(c);
            }
          }
        }
      }
    } else {
      setConfirmations(newConfirmations);
    }
  };

  // Intercept events changes and sync to Firestore
  const handleSetEvents = async (newEvents) => {
    if (isFirebaseConfigured()) {
      if (typeof newEvents === 'function') {
        setEvents(prev => {
          const updated = newEvents(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(e => e.id);
              const deleted = prev.filter(e => !remainingIds.includes(e.id));
              for (const e of deleted) {
                await deleteFirestoreEvent(e.id);
              }
            } else {
              for (const e of updated) {
                const existing = prev.find(old => old.id === e.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(e)) {
                  await saveFirestoreEvent(e);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = events;
        setEvents(newEvents);
        if (newEvents.length < prev.length) {
          const remainingIds = newEvents.map(e => e.id);
          const deleted = prev.filter(e => !remainingIds.includes(e.id));
          for (const e of deleted) {
            await deleteFirestoreEvent(e.id);
          }
        } else {
          for (const e of newEvents) {
            const existing = prev.find(old => old.id === e.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(e)) {
              await saveFirestoreEvent(e);
            }
          }
        }
      }
    } else {
      setEvents(newEvents);
    }
  };

  // Intercept event participants changes and sync to Firestore
  const handleSetEventParticipants = async (newParticipants) => {
    if (isFirebaseConfigured()) {
      if (typeof newParticipants === 'function') {
        setEventParticipants(prev => {
          const updated = newParticipants(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(p => p.id);
              const deleted = prev.filter(p => !remainingIds.includes(p.id));
              for (const p of deleted) {
                await deleteFirestoreEventParticipant(p.id);
              }
            } else {
              for (const p of updated) {
                const existing = prev.find(old => old.id === p.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
                  await saveFirestoreEventParticipant(p);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = eventParticipants;
        setEventParticipants(newParticipants);
        if (newParticipants.length < prev.length) {
          const remainingIds = newParticipants.map(p => p.id);
          const deleted = prev.filter(p => !remainingIds.includes(p.id));
          for (const p of deleted) {
            await deleteFirestoreEventParticipant(p.id);
          }
        } else {
          for (const p of newParticipants) {
            const existing = prev.find(old => old.id === p.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(p)) {
              await saveFirestoreEventParticipant(p);
            }
          }
        }
      }
    } else {
      setEventParticipants(newParticipants);
    }
  };

  // Intercept event submissions changes and sync to Firestore
  const handleSetEventSubmissions = async (newSubmissions) => {
    if (isFirebaseConfigured()) {
      if (typeof newSubmissions === 'function') {
        setEventSubmissions(prev => {
          const updated = newSubmissions(prev);
          (async () => {
            if (updated.length < prev.length) {
              const remainingIds = updated.map(s => s.id);
              const deleted = prev.filter(s => !remainingIds.includes(s.id));
              for (const s of deleted) {
                await deleteFirestoreEventSubmission(s.id);
              }
            } else {
              for (const s of updated) {
                const existing = prev.find(old => old.id === s.id);
                if (!existing || JSON.stringify(existing) !== JSON.stringify(s)) {
                  await saveFirestoreEventSubmission(s);
                }
              }
            }
          })();
          return updated;
        });
      } else {
        const prev = eventSubmissions;
        setEventSubmissions(newSubmissions);
        if (newSubmissions.length < prev.length) {
          const remainingIds = newSubmissions.map(s => s.id);
          const deleted = prev.filter(s => !remainingIds.includes(s.id));
          for (const s of deleted) {
            await deleteFirestoreEventSubmission(s.id);
          }
        } else {
          for (const s of newSubmissions) {
            const existing = prev.find(old => old.id === s.id);
            if (!existing || JSON.stringify(existing) !== JSON.stringify(s)) {
              await saveFirestoreEventSubmission(s);
            }
          }
        }
      }
    }
  };



  // Intercept affiliate links changes
  const handleSetAffiliateLinks = async (newLinks) => {
    if (isFirebaseConfigured()) {
      if (typeof newLinks === 'function') {
        setAffiliateLinks(prev => {
          const updated = newLinks(prev);
          saveFirestoreSettings({
            gdriveApiKey,
            affiliateLinks: updated
          });
          return updated;
        });
      } else {
        setAffiliateLinks(newLinks);
        await saveFirestoreSettings({
          gdriveApiKey,
          affiliateLinks: newLinks
        });
      }
    } else {
      setAffiliateLinks(newLinks);
    }
  };

  // Explicit Save settings trigger
  const handleSaveSettings = async () => {
    if (isFirebaseConfigured()) {
      const success = await saveFirestoreSettings({
        gdriveApiKey,
        affiliateLinks,
        whatsappAdmin,
        premiumPrice,
        paymentInstructions,
        minWithdrawalAmount,
        eventAdminFee,
        withdrawalFeePercent,
        withdrawalFeePercentPremium,
        dbInitialized: true
      });
      if (success) {
        alert('Pengaturan Google Drive, Affiliate, & Membership berhasil disimpan di Cloud Firestore!');
      } else {
        alert('Gagal menyimpan pengaturan ke Cloud Firestore.');
      }
    } else {
      alert('Pengaturan berhasil disimpan di sistem lokal!');
    }
  };

  // Save movies to localStorage when modified
  useEffect(() => {
    localStorage.setItem('portal-movies', JSON.stringify(movies));
  }, [movies]);

  // Save affiliate links to localStorage when modified
  useEffect(() => {
    localStorage.setItem('portal-affiliate-links', JSON.stringify(affiliateLinks));
  }, [affiliateLinks]);

  // Google Drive API Key state loaded from localStorage
  const [gdriveApiKey, setGdriveApiKey] = useState(() => {
    return localStorage.getItem('portal-gdrive-api-key') || '';
  });

  // Save Google Drive API Key to localStorage when modified
  useEffect(() => {
    localStorage.setItem('portal-gdrive-api-key', gdriveApiKey);
  }, [gdriveApiKey]);

  // Membership & Subscription Settings states
  const [whatsappAdmin, setWhatsappAdmin] = useState(() => {
    return localStorage.getItem('portal-whatsapp-admin') || 'https://wa.me/6281234567890';
  });

  const [premiumPrice, setPremiumPrice] = useState(() => {
    return localStorage.getItem('portal-premium-price') || 'Rp 29.000 / Bulan';
  });

  const [paymentInstructions, setPaymentInstructions] = useState(() => {
    return localStorage.getItem('portal-payment-instructions') || '- Bank BCA: 1234567890 a.n. ngonten.id\n- DANA: 081234567890 a.n. Admin\n- OVO: 081234567890';
  });

  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(() => {
    const saved = localStorage.getItem('portal-min-withdrawal');
    return saved ? parseInt(saved) : 50000;
  });

  const [eventAdminFee, setEventAdminFee] = useState(() => {
    const saved = localStorage.getItem('portal-event-admin-fee');
    return saved ? parseInt(saved) : 0;
  });

  const [eventFlatFee, setEventFlatFee] = useState(() => {
    const saved = localStorage.getItem('portal-event-flat-fee');
    return saved ? parseInt(saved) : 150000;
  });

  const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(() => {
    const saved = localStorage.getItem('portal-withdrawal-fee-percent');
    return saved ? parseInt(saved) : 5;
  });

  const [withdrawalFeePercentPremium, setWithdrawalFeePercentPremium] = useState(() => {
    const saved = localStorage.getItem('portal-withdrawal-fee-percent-premium');
    return saved ? parseInt(saved) : 2;
  });

  // Save Membership & Subscription Settings to localStorage when modified
  useEffect(() => {
    localStorage.setItem('portal-whatsapp-admin', whatsappAdmin);
  }, [whatsappAdmin]);

  useEffect(() => {
    localStorage.setItem('portal-premium-price', premiumPrice);
  }, [premiumPrice]);

  useEffect(() => {
    localStorage.setItem('portal-payment-instructions', paymentInstructions);
  }, [paymentInstructions]);

  useEffect(() => {
    localStorage.setItem('portal-min-withdrawal', minWithdrawalAmount.toString());
  }, [minWithdrawalAmount]);

  useEffect(() => {
    localStorage.setItem('portal-event-admin-fee', eventAdminFee.toString());
  }, [eventAdminFee]);

  useEffect(() => {
    localStorage.setItem('portal-event-flat-fee', eventFlatFee.toString());
  }, [eventFlatFee]);

  useEffect(() => {
    localStorage.setItem('portal-withdrawal-fee-percent', withdrawalFeePercent.toString());
  }, [withdrawalFeePercent]);

  useEffect(() => {
    localStorage.setItem('portal-withdrawal-fee-percent-premium', withdrawalFeePercentPremium.toString());
  }, [withdrawalFeePercentPremium]);

  // Save activeTab to localStorage when modified
  useEffect(() => {
    localStorage.setItem('portal-active-tab', activeTab);
  }, [activeTab]);

  // Search Filter States (YouTube search-filters style)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterYear, setFilterYear] = useState('Semua');
  const [filterCountry, setFilterCountry] = useState('Semua');
  const [filterSemi, setFilterSemi] = useState('Sembunyikan'); // 'Sembunyikan', 'Tampilkan', 'Hanya'

  // Lazyload pagination states
  const [visibleMoviesCount, setVisibleMoviesCount] = useState(12);

  useEffect(() => {
    setVisibleMoviesCount(12);
  }, [searchQuery, selectedGenre, activeTab, filterYear, filterCountry, filterSemi]);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    
    // Initial call
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable pinch-to-zoom and gesture zoom on mobile devices (especially iOS Safari)
  useEffect(() => {
    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const handleGestureStart = (event) => {
      event.preventDefault();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);

  // Close player and return to catalog if user searches
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      handleTabChange('discover');
    }
  }, [searchQuery]);

  // Load Watchlist & History from localStorage on mount
  useEffect(() => {
    const savedWatchlist = JSON.parse(localStorage.getItem('portal-watchlist')) || [];
    const savedHistory = JSON.parse(localStorage.getItem('portal-history')) || [];
    setWatchlist(savedWatchlist);
    setHistory(savedHistory);
  }, []);

  // Helper to change admin sub-tab and update URL hash
  const handleAdminSubTabChange = (subTabId) => {
    setAdminSubTab(subTabId);
    if (activeTab === 'admin') {
      window.history.pushState(null, '', `/admin/${subTabId}`);
    }
  };

  // 1. Initial Path Route for Tabs (runs immediately on mount or user change)
  useEffect(() => {
    if (currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor'].includes(currentUser.role)) {
      setActiveTab('admin');
      window.history.replaceState(null, '', `/admin/${adminSubTab}`);
      return;
    }
    const path = window.location.pathname;
    if (path && path !== '/') {
      if (path.startsWith('/event/')) {
        setActiveTab('events');
      } else if (path.startsWith('/play/')) {
        setActiveTab('discover');
      } else {
        const parts = path.split('/');
        const tabId = parts[1];
        const subTabId = parts[2];
        if (['discover', 'events', 'wallet', 'watchlist', 'history', 'admin'].includes(tabId)) {
          if (tabId === 'admin') {
            setActiveTab('discover');
            window.history.replaceState(null, '', '/');
          } else {
            setActiveTab(tabId);
            if (tabId === 'admin' && subTabId) {
              setAdminSubTab(subTabId);
            }
          }
        }
      }
    }
  }, [currentUser]);

  // 2. Path-based Router & Event Listener
  useEffect(() => {
    const handlePathRoute = () => {
      window.scrollTo(0, 0);
      const path = window.location.pathname;

      if (path && path !== '/') {
        if (path.startsWith('/play/')) {
          const movieParam = path.replace('/play/', '').split('&')[0];
          const foundMovie = movies.find(m => m.id === movieParam || movieParam.endsWith(m.id));
          if (foundMovie) {
            setSelectedMovie(foundMovie);
            setIsPlaying(true);
            setActiveTab('discover');
          }
        } else if (path.startsWith('/events') || path.startsWith('/event/')) {
          setActiveTab('events');
          setIsPlaying(false);
          setSelectedMovie(null);
        } else if (path.startsWith('/community/')) {
          setActiveTab('communities');
          setIsPlaying(false);
          setSelectedMovie(null);
          const commParam = path.replace('/community/', '').split('&')[0];
          const parts = commParam.split('-');
          const lastPart = parts[parts.length - 1];
          const foundComm = communities.find(c => c.id === commParam || c.id === lastPart || c.username?.toLowerCase() === commParam.toLowerCase());
          if (foundComm) {
            if (!currentUser) {
              window.history.replaceState(null, '', '/communities');
              setSelectedCommunityId(null);
              handleOpenLoginModal('register');
            } else {
              setSelectedCommunityId(foundComm.id);
            }
          }
        } else if (path.startsWith('/communities')) {
          setActiveTab('communities');
          setIsPlaying(false);
          setSelectedMovie(null);
          setSelectedCommunityId(null);
        } else if (path.startsWith('/creator/') || path === '/creator') {
          if (currentUser) {
            setActiveTab('admin');
            setIsPlaying(false);
            setSelectedMovie(null);
            const subTabId = path.replace('/creator/', '').replace('/creator', '');
            if (subTabId) {
              setAdminSubTab(subTabId);
            }
          } else {
            setActiveTab('discover');
            window.history.replaceState(null, '', '/');
          }
        } else if (path.startsWith('/admin/') || path === '/admin') {
          if (currentUser) {
            setActiveTab('admin');
            setIsPlaying(false);
            setSelectedMovie(null);
            const subTabId = path.replace('/admin/', '').replace('/admin', '');
            if (subTabId) {
              setAdminSubTab(subTabId);
            }
            window.history.replaceState(null, '', `/creator/${subTabId || adminSubTab}`);
          } else {
            setActiveTab('discover');
            window.history.replaceState(null, '', '/');
          }
        } else {
          // Parse regular tabs: discover, events, wallet, profile, communities
          const parts = path.split('/');
          const firstSegment = parts[1];
          if (firstSegment === 'events') {
            setActiveTab('events');
            setIsPlaying(false);
            setSelectedMovie(null);
          } else if (firstSegment === 'community') {
            setActiveTab('communities');
            setIsPlaying(false);
            setSelectedMovie(null);
          } else if (['discover', 'wallet', 'profile', 'communities'].includes(firstSegment)) {
            setActiveTab(firstSegment);
            setIsPlaying(false);
            setSelectedMovie(null);
          } else {
            setActiveTab('discover');
            window.history.replaceState(null, '', '/');
          }
        }
      } else {
        // Root path
        setActiveTab('discover');
        setIsPlaying(false);
        setSelectedMovie(null);
      }
    };

    if (movies.length > 0) {
      handlePathRoute();
    }
    window.addEventListener('popstate', handlePathRoute);
    return () => window.removeEventListener('popstate', handlePathRoute);
  }, [movies, currentUser, adminSubTab, communities]);

  // 3. Dynamic SEO Title, Meta Description, and Structured JSON-LD Schema
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    
    // Remove old schema tag if exists
    const oldSchema = document.getElementById('seo-structured-data');
    if (oldSchema) oldSchema.remove();
    
    let schemaData = null;
    
    if (selectedMovie && isPlaying && activeTab === 'discover') {
      // Nonton Film Page
      const titleText = `${selectedMovie.title} - ngonten.id`;
      document.title = titleText;
      
      const descText = `Saksikan film "${selectedMovie.title}" secara instan tanpa iklan. Sinopsis: ${selectedMovie.description?.substring(0, 120) || 'Nonton streaming film berkualitas di ngonten.id.'}...`;
      if (metaDesc) {
        metaDesc.setAttribute('content', descText);
      }
      
      // JSON-LD Schema for Movie
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": selectedMovie.title,
        "description": selectedMovie.description || 'Nonton streaming film berkualitas di ngonten.id.',
        "image": selectedMovie.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80',
        "genre": selectedMovie.genre || [],
        "dateCreated": selectedMovie.year || new Date().getFullYear(),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedMovie.rating || 8.0,
          "bestRating": "10",
          "worstRating": "1",
          "ratingCount": 128
        }
      };
    } else if (activeTab === 'events') {
      const path = window.location.pathname;
      let activeEvent = null;
      if (path.startsWith('/event/')) {
        const eventParam = path.replace('/event/', '').split('&')[0];
        activeEvent = events.find(e => eventParam && (e.id === eventParam || eventParam.endsWith(e.id)));
      }
      
      if (activeEvent) {
        // Event Detail Page
        const titleText = `${activeEvent.title} - ngonten.id`;
        document.title = titleText;
        
        const descText = `Ikuti kompetisi video "${activeEvent.title}" kategori ${activeEvent.category || 'UGC'}. Batas pendaftaran: ${activeEvent.deadline || 'Segera'}.`;
        if (metaDesc) {
          metaDesc.setAttribute('content', descText);
        }
        
        // JSON-LD Schema for Event
        schemaData = {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": activeEvent.title,
          "description": activeEvent.description || 'Ikuti kompetisi video kreatif di ngonten.id.',
          "startDate": new Date().toISOString().split('T')[0],
          "endDate": activeEvent.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
          "location": {
            "@type": "VirtualLocation",
            "url": window.location.href
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "price": "0",
            "priceCurrency": "IDR",
            "availability": "https://schema.org/InStock",
            "validFrom": new Date().toISOString().split('T')[0]
          }
        };
      } else {
        // General Events Page
        document.title = 'Kampanye & Event Kreatif - ngonten.id';
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Ikuti berbagai kampanye kreatif, kompetisi video, UGC, dan temukan kolaborasi proyek bernilai tinggi dengan hadiah jutaan rupiah.');
        }
      }
    } else if (activeTab === 'wallet') {
      document.title = 'Dompet Saya - ngonten.id';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Kelola pendapatan Anda dari hasil kemenangan kampanye dan lakukan penarikan saldo dengan mudah di ngonten.id.');
      }
    } else if (activeTab === 'watchlist') {
      document.title = 'Daftar Tontonan - ngonten.id';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Simpan dan kelola film-film favorit Anda untuk ditonton nanti di ngonten.id.');
      }
    } else if (activeTab === 'history') {
      document.title = 'Riwayat - ngonten.id';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Lihat riwayat film yang telah Anda tonton sebelumnya di ngonten.id.');
      }
    } else {
      // General Homepage / Discover
      document.title = 'ngonten.id - Satu Platform, Solusi Industri Kreatif';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Wadah kolaborasi terbaik untuk ikut dan buat kampanye kreatif. Temukan berbagai solusi proyek video, konten kreatif, dan temukan talenta terbaik dengan mudah di ngonten.id.');
      }
    }
    
    // Inject dynamic JSON-LD structured schema script
    if (schemaData) {
      const script = document.createElement('script');
      script.id = 'seo-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }
  }, [selectedMovie, isPlaying, activeTab, events]);

  // 4. Trigger top loading bar animation on page/tab/subtab changes
  useEffect(() => {
    setIsPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab, selectedMovie?.id, isPlaying, adminSubTab]);

  // Handle Tab Change and update URL path
  function handleTabChange(tabId) {
    setSelectedCommunityId(null);
    window.scrollTo(0, 0);
    const adminSubTabs = [
      'event-dashboard', 'event-manage', 'creator-marketplace', 
      'movies', 'affiliates', 'membership', 'confirmations', 'withdrawals', 'finance-report', 'users', 'roles', 'community-members', 'community-agendas'
    ];

    if (adminSubTabs.includes(tabId)) {
      setActiveTab('admin');
      setAdminSubTab(tabId);
      setIsPlaying(false);
      setSelectedMovie(null);
      window.history.pushState(null, '', `/creator/${tabId}`);
      return;
    }

    if (tabId === 'admin') {
      setActiveTab('admin');
      setIsPlaying(false);
      setSelectedMovie(null);
      window.history.pushState(null, '', `/creator/${adminSubTab}`);
      return;
    }
    
    setActiveTab(tabId);
    setIsPlaying(false);
    setSelectedMovie(null);
    if (tabId === 'discover') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/${tabId}`);
    }
  }

  // Toggle Watchlist
  const toggleWatchlist = (movie) => {
    let updated;
    if (watchlist.includes(movie.id)) {
      updated = watchlist.filter(id => id !== movie.id);
    } else {
      updated = [...watchlist, movie.id];
    }
    setWatchlist(updated);
    localStorage.setItem('portal-watchlist', JSON.stringify(updated));
  };

  // Add to History
  const addToHistory = (movie) => {
    const updated = [movie.id, ...history.filter(id => id !== movie.id)].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('portal-history', JSON.stringify(updated));
  };

  // Clear History
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('portal-history');
  };

  // Get unique genres list
  const allGenres = Array.from(
    new Set(movies.flatMap(movie => movie.genre))
  );

  // Get unique years list (sorted descending)
  const allYears = Array.from(
    new Set(movies.map(movie => movie.year).filter(Boolean))
  ).sort((a, b) => b - a);

  // Get unique countries list
  const allCountries = Array.from(
    new Set(movies.map(movie => movie.country).filter(Boolean))
  );

  // Filter movies (genre, year, country, adult-content, search query)
  const getFilteredMovies = () => {
    let list = movies;

    if (activeTab === 'watchlist') {
      list = movies.filter(m => watchlist.includes(m.id));
    } else if (activeTab === 'history') {
      list = history
        .map(id => movies.find(m => m.id === id))
        .filter(Boolean);
    }

    // Filters active only in the discover tab
    if (activeTab === 'discover') {
      // Check if we are on the default home page (no active search or sidebar filters)
      const isDefaultHome = !selectedGenre && filterYear === 'Semua' && filterCountry === 'Semua' && searchQuery.trim() === '';

      if (isDefaultHome) {
        if (history.length > 0) {
          // Get watched movie objects
          const watchedMovies = history
            .map(id => movies.find(m => m.id === id))
            .filter(Boolean);

          // Calculate genre frequencies in watch history
          const genreWeights = {};
          watchedMovies.forEach(m => {
            if (m.genre && Array.isArray(m.genre)) {
              m.genre.forEach(g => {
                genreWeights[g] = (genreWeights[g] || 0) + 1;
              });
            }
          });

          // Score each movie in the database based on genre overlap
          const scored = movies.map(m => {
            // Exclude already watched movies from recommendations
            if (history.includes(m.id)) {
              return { movie: m, score: -1 };
            }
            
            let score = 0;
            if (m.genre && Array.isArray(m.genre)) {
              m.genre.forEach(g => {
                score += genreWeights[g] || 0;
              });
            }
            return { movie: m, score };
          });

          // Sort by score first, then by views count descending (tie-breaker)
          let related = scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score || (b.movie.views || 0) - (a.movie.views || 0))
            .map(item => item.movie);

          // Fill up to 20 movies using most viewed if we don't have enough related ones
          if (related.length < 20) {
            const extra = movies
              .filter(m => !history.includes(m.id) && !related.some(r => r.id === m.id))
              .sort((a, b) => (b.views || 0) - (a.views || 0));
            related = [...related, ...extra];
          }

          // If still under 20 movies (e.g. if catalog size is small and all are in history), fill with watched movies
          if (related.length < 20) {
            const historyExtra = movies
              .filter(m => !related.some(r => r.id === m.id))
              .sort((a, b) => (b.views || 0) - (a.views || 0));
            related = [...related, ...historyExtra];
          }

          related = related.slice(0, 20);
          list = related;
        } else {
          // Default: Sort by views descending (most watched first)
          list = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        // Apply adult content filter to the recommended list
        if (filterSemi === 'Sembunyikan') {
          list = list.filter(m => !m.isSemi);
        } else if (filterSemi === 'Hanya') {
          list = list.filter(m => m.isSemi);
        }
        
        return list;
      }

      if (selectedGenre) {
        list = list.filter(m => m.genre.includes(selectedGenre));
      }
      if (filterYear !== 'Semua') {
        list = list.filter(m => m.year === parseInt(filterYear));
      }
      if (filterCountry !== 'Semua') {
        list = list.filter(m => m.country === filterCountry);
      }
      if (filterSemi === 'Sembunyikan') {
        list = list.filter(m => !m.isSemi);
      } else if (filterSemi === 'Hanya') {
        list = list.filter(m => m.isSemi);
      }
    } else {
      // By default in other lists, hide adult content unless specifically allowed
      if (filterSemi === 'Sembunyikan') {
        list = list.filter(m => !m.isSemi);
      }
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.genre.some(g => g.toLowerCase().includes(query))
      );
    }

    return list;
  };

  const filteredMovies = getFilteredMovies();

  // Increment views count in state and sync to Firestore
  const incrementMovieViews = async (movie) => {
    const updatedViews = (movie.views || 0) + 1;
    
    // Update local movies state
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, views: updatedViews } : m));
    
    // Update selected movie state
    setSelectedMovie(prev => prev && prev.id === movie.id ? { ...prev, views: updatedViews } : prev);
    
    // Sync update to Firestore if online
    if (isFirebaseConfigured()) {
      try {
        const { id, ...data } = movie;
        await saveFirestoreMovie({ ...movie, views: updatedViews });
      } catch (err) {
        console.error("Failed to sync updated movie views to Firestore:", err);
      }
    }
  };

  // Watch page select movie
  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setIsPlaying(true); // Auto play!
    addToHistory(movie);
    incrementMovieViews(movie); // Increment views!
    const movieSlug = slugify(movie.title) + '-' + movie.id;
    window.history.pushState(null, '', `/play/${movieSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close player and clear URL path
  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedMovie(null);
    window.history.pushState(null, '', '/');
  };

  // Format views to YouTube style
  const formatViews = (views) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1).replace('.', ',') + ' rb';
    }
    return views;
  };

  const isPanitia = currentUser && (currentUser.role === 'panitia' || currentUser.role === 'user');
  const sidebarEvents = isPanitia 
    ? events.filter(e => e.creator === currentUser.username) 
    : events;
  const sidebarEventIds = sidebarEvents.map(e => e.id);
  const sidebarParticipants = isPanitia 
    ? eventParticipants.filter(p => sidebarEventIds.includes(p.eventId)) 
    : eventParticipants;
  const sidebarSubmissions = isPanitia 
    ? eventSubmissions.filter(s => sidebarEventIds.includes(s.eventId)) 
    : eventSubmissions;

  return (
    <div className={`app-container youtube-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isPageLoading && <div className="top-loading-bar" />}
      {/* Header */}
      <Navbar 
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        genres={allGenres}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
        onLoginClick={() => handleOpenLoginModal('login')}
        onLogout={handleLogout}
        onSubscribeClick={() => setShowPremiumModal(true)}
        onEditProfileClick={handleOpenEditProfile}
        eventParticipants={eventParticipants}
        eventSubmissions={eventSubmissions}
        confirmations={confirmations}
        withdrawals={withdrawals}
        onAdminSubTabChange={handleAdminSubTabChange}
        events={events}
        customRoles={customRoles}
        communities={communities}
      />

      <div className="app-body-wrapper">
        {/* Left Sidebar (Desktop) */}
        {!isMobile && (
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            setSelectedGenre={setSelectedGenre}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            watchlistCount={watchlist.length}
            currentUser={currentUser}
            adminSubTab={adminSubTab}
            setAdminSubTab={handleAdminSubTabChange}
            customRoles={customRoles}
            pendingEventsCount={
              sidebarEvents.filter(e => e.paymentStatus !== 'paid').length +
              sidebarEvents.filter(e => {
                const isDeadlinePassed = e.deadline ? (
                  e.deadline.includes('T')
                    ? new Date().getTime() > new Date(e.deadline).getTime()
                    : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime()
                ) : false;
                return e.budgetMode === 'ranking' && e.paymentStatus === 'paid' && !e.winnersReleased && isDeadlinePassed;
              }).length +
              sidebarParticipants.filter(p => p.status === 'pending').length +
              sidebarSubmissions.filter(s => s.score === null).length
            }
            pendingConfirmationsCount={
              confirmations.filter(c => c.status === 'pending').length +
              sidebarEvents.filter(e => e.paymentStatus === 'pending_verification').length
            }
            pendingWithdrawalsCount={withdrawals.filter(w => w.status === 'pending').length}
          />
        )}

        {/* Main Content Area */}
        <main className="main-content">

          {activeTab === 'admin' && currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor', 'user'].includes(currentUser.role) ? (
            <AdminPanel 
              regions={regions}
              movies={movies} 
              setMovies={handleSetMovies} 
              affiliateLinks={affiliateLinks}
              setAffiliateLinks={handleSetAffiliateLinks}
              gdriveApiKey={gdriveApiKey}
              setGdriveApiKey={setGdriveApiKey}
              whatsappAdmin={whatsappAdmin}
              setWhatsappAdmin={setWhatsappAdmin}
              premiumPrice={premiumPrice}
              setPremiumPrice={setPremiumPrice}
              paymentInstructions={paymentInstructions}
              setPaymentInstructions={setPaymentInstructions}
              users={users}
              setUsers={handleSetUsers}
              confirmations={confirmations}
              setConfirmations={handleSetConfirmations}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
              
              adminSubTab={adminSubTab}
              setAdminSubTab={handleAdminSubTabChange}
              events={events}
              setEvents={handleSetEvents}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              withdrawals={withdrawals}
              setWithdrawals={handleSetWithdrawals}
              offers={offers}
              setOffers={handleSetOffers}
              handleTransferWallet={handleTransferWallet}
              minWithdrawalAmount={minWithdrawalAmount}
              setMinWithdrawalAmount={setMinWithdrawalAmount}
              eventAdminFee={eventAdminFee}
              setEventAdminFee={setEventAdminFee}
              eventFlatFee={eventFlatFee}
              setEventFlatFee={setEventFlatFee}
              withdrawalFeePercent={withdrawalFeePercent}
              setWithdrawalFeePercent={setWithdrawalFeePercent}
              withdrawalFeePercentPremium={withdrawalFeePercentPremium}
              setWithdrawalFeePercentPremium={setWithdrawalFeePercentPremium}
              customRoles={customRoles}
              setCustomRoles={setCustomRoles}
              financialJournals={financialJournals}
              setFinancialJournals={handleSetFinancialJournals}
              communities={communities}
              onKickMember={handleKickMember}
              onApproveMember={handleApproveMember}
              onRejectMember={handleRejectMember}
              onSaveAgenda={handleSaveAgenda}
            />
          ) : activeTab === 'wallet' ? (
            <WalletUserPortal 
              currentUser={currentUser}
              events={events}
              eventSubmissions={eventSubmissions}
              users={users}
              setUsers={handleSetUsers}
              withdrawals={withdrawals}
              setWithdrawals={handleSetWithdrawals}
              minWithdrawalAmount={minWithdrawalAmount}
              withdrawalFeePercent={withdrawalFeePercent}
              withdrawalFeePercentPremium={withdrawalFeePercentPremium}
              eventParticipants={eventParticipants}
            />
          ) : activeTab === 'communities' ? (
            <CommunitiesPage 
              communities={communities}
              currentUser={currentUser}
              selectedCommunityId={selectedCommunityId}
              setSelectedCommunityId={setSelectedCommunityId}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
              isRegularUser={currentUser && !(currentUser.isCommunity || currentUser.role === 'panitia')}
              slugify={slugify}
              regions={regions}
              handleOpenLoginModal={handleOpenLoginModal}
              handleOpenEditProfile={handleOpenEditProfile}
              handleTabChange={handleTabChange}
              formatIndonesianDate={formatIndonesianDate}
              setZoomImage={setZoomImage}
              communitySearchQuery={communitySearchQuery}
              setCommunitySearchQuery={setCommunitySearchQuery}
              communityRegionalFilter={communityRegionalFilter}
              setCommunityRegionalFilter={setCommunityRegionalFilter}
              handleApproveMember={handleApproveMember}
              handleRejectMember={handleRejectMember}
              handleSaveAgenda={handleSaveAgenda}
            />
          ) : activeTab === 'profile' ? (
            <ProfilePage 
              currentUser={currentUser}
              communities={communities}
              handleOpenEditProfile={handleOpenEditProfile}
              setShowPremiumModal={setShowPremiumModal}
              handleKickMember={handleKickMember}
              handleApproveMember={handleApproveMember}
              handleRejectMember={handleRejectMember}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
              handleLogout={handleLogout}
              handleTabChange={handleTabChange}
              slugify={slugify}
            />
          ) : activeTab === 'events' ? (
            <EventsUserPortal 
              regions={regions}
              currentUser={currentUser}
              onLoginClick={(mode, role, isLocked) => handleOpenLoginModal(mode, role, isLocked)}
              onLogout={handleLogout}
              onEditProfileClick={handleOpenEditProfile}
              events={events}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              users={users}
              setUsers={handleSetUsers}
              offers={offers}
              setOffers={handleSetOffers}
              communities={communities}
              renderEventManagement={(onSaveSuccess, autoOpenForm) => (
                <AdminPanel 
                  regions={regions}
                  movies={movies} 
                  setMovies={handleSetMovies} 
                  affiliateLinks={affiliateLinks}
                  setAffiliateLinks={handleSetAffiliateLinks}
                  gdriveApiKey={gdriveApiKey}
                  setGdriveApiKey={setGdriveApiKey}
                  whatsappAdmin={whatsappAdmin}
                  setWhatsappAdmin={setWhatsappAdmin}
                  premiumPrice={premiumPrice}
                  setPremiumPrice={setPremiumPrice}
                  paymentInstructions={paymentInstructions}
                  setPaymentInstructions={setPaymentInstructions}
                  users={users}
                  setUsers={handleSetUsers}
                  currentUser={currentUser}
                  onSaveSettings={handleSaveSettings}
                  
                  adminSubTab="event-manage"
                  setAdminSubTab={() => {}}
                  events={events}
                  setEvents={handleSetEvents}
                  eventParticipants={eventParticipants}
                  setEventParticipants={handleSetEventParticipants}
                  eventSubmissions={eventSubmissions}
                  setEventSubmissions={handleSetEventSubmissions}
                  withdrawals={withdrawals}
                  setWithdrawals={handleSetWithdrawals}
                  offers={offers}
                  setOffers={handleSetOffers}
                  handleTransferWallet={handleTransferWallet}
                  minWithdrawalAmount={minWithdrawalAmount}
                  setMinWithdrawalAmount={setMinWithdrawalAmount}
                  eventAdminFee={eventAdminFee}
                  setEventAdminFee={setEventAdminFee}
                  eventFlatFee={eventFlatFee}
                  setEventFlatFee={setEventFlatFee}
                  withdrawalFeePercent={withdrawalFeePercent}
                  setWithdrawalFeePercent={setWithdrawalFeePercent}
                  withdrawalFeePercentPremium={withdrawalFeePercentPremium}
                  setWithdrawalFeePercentPremium={setWithdrawalFeePercentPremium}
                  customRoles={customRoles}
                  setCustomRoles={setCustomRoles}
                  financialJournals={financialJournals}
                  setFinancialJournals={handleSetFinancialJournals}
                  
                  autoOpenCreateForm={autoOpenForm}
                  onEventCreatedOrUpdated={onSaveSuccess}
                  isEmbedded={true}
                />
              )}
            />
          ) : (
            <DiscoverPage 
              activeTab={activeTab}
              currentUser={currentUser}
              movies={movies}
              filteredMovies={getFilteredMovies()}
              visibleMoviesCount={visibleMoviesCount}
              setVisibleMoviesCount={setVisibleMoviesCount}
              allGenres={allGenres}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              filterCountry={filterCountry}
              setFilterCountry={setFilterCountry}
              filterSemi={filterSemi}
              setFilterSemi={setFilterSemi}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              allYears={allYears}
              allCountries={allCountries}
              isLoadingDB={isLoadingDB}
              handleMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              history={history}
              clearHistory={clearHistory}
              selectedMovie={selectedMovie}
              isPlaying={isPlaying}
              affiliateLinks={affiliateLinks}
              gdriveApiKey={gdriveApiKey}
              whatsappAdmin={whatsappAdmin}
              premiumPrice={premiumPrice}
              paymentInstructions={paymentInstructions}
              confirmations={confirmations}
              handleSetConfirmations={handleSetConfirmations}
              handleClosePlayer={handleClosePlayer}
              handleOpenLoginModal={handleOpenLoginModal}
              setShowPremiumModal={setShowPremiumModal}
              slugify={slugify}
              activeFaqIndex={activeFaqIndex}
              setActiveFaqIndex={setActiveFaqIndex}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              events={events}
              eventSubmissions={eventSubmissions}
              communities={communities}
              handleTabChange={handleTabChange}
              users={users}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
            />
          )}
        </main>
      </div>


      {/* Bottom Nav for Mobile */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setSelectedGenre={setSelectedGenre}
        currentUser={currentUser}
        adminSubTab={adminSubTab}
        onAdminSubTabChange={handleAdminSubTabChange}
        customRoles={customRoles}
      />

      {/* Premium Subscription Modal */}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        currentUser={currentUser}
        confirmations={confirmations}
        setConfirmations={handleSetConfirmations}
        premiumPrice={premiumPrice}
        whatsappAdmin={whatsappAdmin}
        onLoginClick={(mode) => handleOpenLoginModal(mode)}
      />

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && currentUser && (
        <div 
          className="full-page-login-container animate-fade-in" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: 'auto 0', 
            width: '100%', 
            maxWidth: '520px'
          }}>
            <div 
              className="login-card glass-panel" 
              style={{
                width: '100%',
                padding: '32px 28px',
                borderRadius: '16px',
                background: '#020202',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'white' }}>
                  <User size={18} />
                  <span>Edit Profil & Portofolio</span>
                </h3>
                <button 
                  onClick={() => setIsEditProfileModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  const isComm = currentUser.role === 'panitia';
                  if (isComm) {
                    if (!editProfileName.trim() || !editProfilePhone.trim() || !editProfileActiveMembers.trim()) {
                      alert('Nama Komunitas, No. WhatsApp, dan Jumlah Member wajib diisi!');
                      return;
                    }
                  } else {
                    if (!editProfileName.trim() || !editProfilePhone.trim() || !editProfilePortfolio.trim()) {
                      alert('Nama Lengkap, No. WhatsApp, dan Link Portofolio wajib diisi!');
                      return;
                    }
                  }

                  if (!editProfileRegional.trim()) {
                    alert('Lokasi Regional wajib diisi!');
                    return;
                  }

                  setGlobalLoadingText('Sedang menyimpan perubahan profil...');
                  try {
                    const updatedUser = {
                      ...currentUser,
                      organizerName: editProfileName.trim(),
                      organizerPhone: editProfilePhone.trim(),
                      organizerDescription: editProfileDescription.trim(),
                      organizerAvatar: editProfileAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editProfileName.trim())}&backgroundColor=262626&textColor=ffffff`,
                      activeMembersCount: isComm ? editProfileActiveMembers.trim() : '',
                      isCommunity: isComm,
                      joinedMembers: currentUser.joinedMembers || [],
                      userCategory: isComm ? 'Videografer' : editProfileCategory,
                      userPortfolio: isComm ? '' : editProfilePortfolio.trim(),
                      activityImages: isComm ? editProfileActivityImages.split(',').map(s => s.trim()).filter(Boolean) : [],
                      
                      facebookHandle: editProfileFacebookHandle.trim(),
                      facebookVerified: editProfileFacebookVerified,
                      tiktokHandle: editProfileTiktokHandle.trim(),
                      tiktokVerified: editProfileTiktokVerified,
                      instagramHandle: editProfileInstagramHandle.trim(),
                      instagramVerified: editProfileInstagramVerified,
                      youtubeHandle: editProfileYoutubeHandle.trim(),
                      youtubeVerified: editProfileYoutubeVerified,
                      userRegional: editProfileRegional.trim()
                    };

                    // Update locally
                    setCurrentUser(updatedUser);
                    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
                    
                    if (isComm) {
                      const existingComm = communities.find(c => c.username.toLowerCase() === currentUser.username.toLowerCase());
                      const updatedComm = {
                        id: currentUser.username,
                        username: currentUser.username,
                        name: updatedUser.organizerName,
                        phone: updatedUser.organizerPhone,
                        description: updatedUser.organizerDescription,
                        avatar: updatedUser.organizerAvatar,
                        activeMembersCount: updatedUser.activeMembersCount,
                        joinedMembers: existingComm ? (existingComm.joinedMembers || []) : [],
                        pendingMembers: existingComm ? (existingComm.pendingMembers || []) : [],
                        activityImages: updatedUser.activityImages || []
                      };
                      
                      let updatedCommunities = [...communities];
                      if (existingComm) {
                        updatedCommunities = communities.map(c => c.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedComm : c);
                      } else {
                        updatedCommunities.push(updatedComm);
                      }
                      await handleSetCommunities(updatedCommunities);
                    }

                    // Save to Firestore if available
                    if (isFirebaseConfigured() && auth) {
                      try {
                        await saveFirestoreUser(updatedUser);
                      } catch (err) {
                        console.error("Failed to update profile in firestore:", err);
                      }
                    }

                    setIsEditProfileModalOpen(false);
                    alert('Profil Anda berhasil diperbarui!');
                  } finally {
                    setGlobalLoadingText(null);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {currentUser.role === 'panitia' ? 'Nama Komunitas / Instansi' : 'Nama Lengkap'}
                  </label>
                  <input 
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No. Telepon / WhatsApp</label>
                  <input 
                    type="tel"
                    value={editProfilePhone}
                    onChange={(e) => setEditProfilePhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                  <SearchableSelect 
                    value={editProfileRegional}
                    onChange={setEditProfileRegional}
                    placeholder="Pilih lokasi regional..."
                    options={regions}
                  />
                </div>

                {currentUser.role !== 'panitia' ? (
                  <>
                     <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Keahlian / Kategori (Pilih minimal 1)</label>
                      {(() => {
                        const selectedSkills = editProfileCategory ? editProfileCategory.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const allSkills = [
                          "Videografer", 
                          "Sutradara", 
                          "DOP / Kamerawan", 
                          "Editor Video", 
                          "Animator", 
                          "Motion Designer", 
                          "VFX Artist",
                          "Script Writer", 
                          "Sound Engineer", 
                          "Music Producer",
                          "Colorist",
                          "Content Creator", 
                          "KOL / Influencer", 
                          "Voice Over", 
                          "Presenter / Host",
                          "Aktor / Aktris", 
                          "Model", 
                          "Fotografer", 
                          "Desainer Grafis", 
                          "Penyelenggara Event"
                        ];
                        
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {allSkills.map(skill => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  type="button"
                                  key={skill}
                                  onClick={() => {
                                    let newSkills;
                                    if (isSelected) {
                                      newSkills = selectedSkills.filter(s => s !== skill);
                                    } else {
                                      newSkills = [...selectedSkills, skill];
                                    }
                                    setEditProfileCategory(newSkills.join(', '));
                                  }}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.82rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: isSelected ? 'white' : 'rgba(255, 255, 255, 0.05)',
                                    border: isSelected ? '1px solid white' : '1px solid rgba(255, 255, 255, 0.1)',
                                    color: isSelected ? 'black' : 'var(--text-secondary)'
                                  }}
                                >
                                  {skill}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Link Portofolio Utama</label>
                      <input 
                        type="url"
                        value={editProfilePortfolio}
                        onChange={(e) => setEditProfilePortfolio(e.target.value)}
                        placeholder="Contoh: https://youtube.com/@channelAnda"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Jumlah Anggota / Member Aktif</label>
                    <input 
                      type="number"
                      value={editProfileActiveMembers}
                      onChange={(e) => setEditProfileActiveMembers(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Deskripsi Singkat / Bio (Opsional)</label>
                  <textarea 
                    value={editProfileDescription}
                    onChange={(e) => setEditProfileDescription(e.target.value)}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {currentUser?.role === 'panitia' && (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Foto Kegiatan / Dokumentasi Prestasi (URL Gambar, pisahkan dengan koma)</label>
                    <textarea 
                      value={editProfileActivityImages}
                      onChange={(e) => setEditProfileActivityImages(e.target.value)}
                      placeholder="Contoh: https://link1.com/img.jpg, https://link2.com/img.jpg"
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        resize: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Avatar / Logo (Opsional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {editProfileAvatar ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                          src={editProfileAvatar} 
                          alt="Preview" 
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 255, 255, 0.2)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditProfileAvatar('')}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        border: '1px dashed var(--border-color)'
                      }}>
                        No Img
                      </div>
                    )}
                    <label style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Pilih Foto
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 500 * 1024) {
                              alert("Ukuran file maksimal adalah 500 KB!");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditProfileAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Social Media Accounts Verification Section */}
                {currentUser.role !== 'panitia' && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>Akun Sosial Media Terverifikasi</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Wajib diverifikasi jika Anda ingin berpartisipasi dalam event kompetisi.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                      {[
                        { id: 'facebook', label: 'Facebook', handle: editProfileFacebookHandle, setHandle: setEditProfileFacebookHandle, verified: editProfileFacebookVerified, setVerified: setEditProfileFacebookVerified, color: '#1877f2' },
                        { id: 'tiktok', label: 'TikTok', handle: editProfileTiktokHandle, setHandle: setEditProfileTiktokHandle, verified: editProfileTiktokVerified, setVerified: setEditProfileTiktokVerified, color: '#00f2fe' },
                        { id: 'instagram', label: 'Instagram', handle: editProfileInstagramHandle, setHandle: setEditProfileInstagramHandle, verified: editProfileInstagramVerified, setVerified: setEditProfileInstagramVerified, color: '#e1306c' },
                        { id: 'youtube', label: 'YouTube', handle: editProfileYoutubeHandle, setHandle: setEditProfileYoutubeHandle, verified: editProfileYoutubeVerified, setVerified: setEditProfileYoutubeVerified, color: '#ff0000' }
                      ].map(platform => {
                        const isVerifying = verifyingPlatform === platform.id;
                        
                        return (
                          <div key={platform.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '12px' }}>
                            {isVerifying ? (
                              /* Active verification box */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: platform.color, textTransform: 'uppercase' }}>Verifikasi {platform.label}</span>
                                
                                {verificationStep === 'input' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input 
                                      type="text" 
                                      placeholder={`Masukkan username / handle ${platform.label}`}
                                      value={socialUrl}
                                      onChange={(e) => setSocialUrl(e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', background: '#020202', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerifyingPlatform(null)}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Batal</button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const val = socialUrl.trim();
                                          if (!val) { alert('Masukkan username!'); return; }
                                          if (val.includes(' ')) { alert('Username tidak boleh ada spasi!'); return; }
                                          const code = `NGONTEN-${Math.floor(1000 + Math.random() * 9000)}`;
                                          setUniqueCode(code);
                                          setVerificationStep('verify');
                                          setTimerSeconds(180);
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Lanjut</button>
                                    </div>
                                  </div>
                                )}

                                {verificationStep === 'verify' && (
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                     <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                       Salin kode unik di bawah ini dan tempelkan di bio profil <strong>{platform.label}</strong> Anda:
                                     </p>
                                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                       <div style={{ flex: 1, padding: '8px', background: '#111', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>
                                         {uniqueCode}
                                       </div>
                                       <button
                                         type="button"
                                         onClick={() => {
                                           navigator.clipboard.writeText(uniqueCode);
                                           setIsCopied(true);
                                           setTimeout(() => setIsCopied(false), 2000);
                                         }}
                                         className="btn btn-secondary"
                                         style={{ 
                                           height: '38px', 
                                           padding: '0 14px', 
                                           fontSize: '0.75rem', 
                                           whiteSpace: 'nowrap', 
                                           display: 'flex', 
                                           alignItems: 'center', 
                                           gap: '6px',
                                           transition: 'all 0.2s ease',
                                           backgroundColor: isCopied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                           borderColor: isCopied ? '#10b981' : 'var(--border-color)',
                                           color: '#fff'
                                         }}
                                       >
                                         {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                         {isCopied ? 'Tersalin!' : 'Salin'}
                                       </button>
                                     </div>
                                     <div style={{ fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
                                      Waktu tersisa: {Math.floor(timerSeconds / 60)}:{( '0' + (timerSeconds % 60) ).slice(-2)}
                                    </div>
                                    {verificationError && (
                                      <div style={{ color: '#f87171', fontSize: '0.75rem', lineHeight: '1.4' }}>{verificationError}</div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerificationStep('input')}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Kembali</button>
                                      <button 
                                        type="button" 
                                        onClick={async () => {
                                          setVerificationStep('loading');
                                          setVerificationError('');
                                          const result = await handleCheckProfileSocialMedia(platform.id, socialUrl, uniqueCode);
                                          if (result && result.status === 'approved') {
                                            const cleanUser = socialUrl.trim().startsWith('@') ? socialUrl.trim().substring(1) : socialUrl.trim();
                                            platform.setHandle(cleanUser);
                                            platform.setVerified(true);
                                            setVerifyingPlatform(null);
                                            alert(`Verifikasi ${platform.label} berhasil!`);
                                          } else {
                                            setVerificationError(`Gagal memverifikasi. Pastikan kode unik ${uniqueCode} sudah ditempel di bio profil Anda.`);
                                            setVerificationStep('failed');
                                          }
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Cek Akun</button>
                                    </div>
                                  </div>
                                )}

                                {verificationStep === 'loading' && (
                                  <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Mengecek bio profil Anda, silakan tunggu...
                                  </div>
                                )}

                                {(verificationStep === 'failed' || verificationStep === 'expired') && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#f87171', lineHeight: '1.4' }}>
                                      {verificationStep === 'expired' ? 'Waktu verifikasi habis.' : (verificationError || 'Verifikasi gagal dilakukan.')}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerifyingPlatform(null)}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Batal</button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setVerificationStep('input');
                                          setVerificationError('');
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Coba Lagi</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Standard state */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>{platform.label}</span>
                                    {platform.verified ? (
                                      <>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{platform.handle}</span>
                                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.2)', fontWeight: '600' }}>Terverifikasi</span>
                                      </>
                                    ) : (
                                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600' }}>Belum Terhubung</span>
                                    )}
                                  </div>
                                  {platform.verified ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Ubah akun ${platform.label}? Anda harus memverifikasi ulang akun baru nantinya.`)) {
                                          platform.setHandle('');
                                          platform.setVerified(false);
                                        }
                                      }}
                                      style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                    >
                                      Ubah
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVerifyingPlatform(platform.id);
                                        setSocialUrl('');
                                        setVerificationStep('input');
                                        setVerificationError('');
                                      }}
                                      style={{ background: 'white', border: 'none', color: 'black', fontSize: '0.75rem', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}
                                    >
                                      Hubungkan
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '10px' }}>
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login / Register Modal - Restructured to Full Page */}
       {isLoginModalOpen && (
        <div 
          className="full-page-login-container animate-fade-in" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100000,
            background: '#020202',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px 120px 16px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: 'auto 0', 
            width: '100%', 
            maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px'
          }}>
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="ngonten.id" style={{ height: '60px', objectFit: 'contain' }} />
          </div>

          {/* Login Card */}
          <div 
            className="login-card glass-panel" 
            style={{
              width: '100%',
              maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px',
              padding: '32px 28px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
                <User size={18} className="accent-text" style={{ color: 'var(--text-primary)' }} />
                <span>{loginModalMode === 'login' ? 'Masuk Akun' : 'Daftar Akun Baru'}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                  setLoginUsername('');
                  setLoginPassword('');
                  setRegisterConfirmPassword('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Tutup & Kembali"
              >
                <X size={20} />
              </button>
            </div>

            {/* Login / Register Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('login'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'login' ? '2px solid var(--primary)' : 'none', color: loginModalMode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Masuk
              </button>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'register' ? '2px solid var(--primary)' : 'none', color: loginModalMode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={loginModalMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loginError && (
                <div className="form-error-banner" style={{ margin: '0 0 12px 0' }}>
                  <AlertTriangle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              {loginModalMode === 'login' ? (
                <>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Email / Username</label>
                    <input 
                      type="text"
                      id="loginUsername" 
                      ref={usernameInputRef}
                      placeholder="Masukkan email atau username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="loginPassword" 
                        placeholder="Masukkan password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // REGISTER MODE: SPLIT FORM (USER VS COMMUNITY)
                registerRole === 'panitia' ? (
                  // TWO COLUMNS FOR COMMUNITY/INSTANSI REGISTER
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
                    {/* Left Column: Account Details & Role Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Alamat Email</label>
                        <input 
                          type="email"
                          id="loginUsername" 
                          ref={usernameInputRef}
                          placeholder="Masukkan alamat email aktif"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            id="loginPassword" 
                            placeholder="Masukkan password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            id="registerConfirm" 
                            placeholder="Konfirmasi password Anda"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="registerRole" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Daftar Sebagai</label>
                        <select
                          id="registerRole"
                          value={registerRole}
                          onChange={(e) => setRegisterRole(e.target.value)}
                          disabled={loginModalLockedRole !== null}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: loginModalLockedRole !== null ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: loginModalLockedRole !== null ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: loginModalLockedRole !== null ? 'not-allowed' : 'default'
                          }}
                        >
                          <option value="user" style={{ background: '#020202' }}>User / Kreator</option>
                          <option value="panitia" style={{ background: '#020202' }}>Komunitas / Instansi</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                        <SearchableSelect 
                          value={registerRegional}
                          onChange={setRegisterRegional}
                          placeholder="Pilih lokasi regional..."
                          options={regions}
                        />
                      </div>
                    </div>

                    {/* Right Column: Community Details (Required) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px dashed rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerName" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Nama Komunitas / Instansi</label>
                        <input 
                          type="text" 
                          id="organizerName"
                          placeholder="Nama penyelenggara / komunitas"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerPhone" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No. Telepon / WhatsApp</label>
                        <input 
                          type="tel" 
                          id="organizerPhone"
                          placeholder="Contoh: 08123456789"
                          value={organizerPhone}
                          onChange={(e) => setOrganizerPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="activeMembersCount" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Jumlah Anggota / Member Aktif</label>
                        <input 
                          type="number" 
                          id="activeMembersCount"
                          placeholder="Contoh: 25"
                          value={activeMembersCount}
                          onChange={(e) => setActiveMembersCount(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerDescription" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Deskripsi Singkat Komunitas (Opsional)</label>
                        <textarea 
                          id="organizerDescription"
                          rows="2"
                          placeholder="Tuliskan deskripsi singkat komunitas Anda..."
                          value={organizerDescription}
                          onChange={(e) => setOrganizerDescription(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem',
                            resize: 'none',
                            fontFamily: 'inherit',
                            height: '56px'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Upload Logo Komunitas (Opsional)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {organizerAvatar ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img 
                                src={organizerAvatar} 
                                alt="Preview" 
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid rgba(255, 255, 255, 0.2)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setOrganizerAvatar('')}
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              border: '1px dashed var(--border-color)'
                            }}>
                              No Img
                            </div>
                          )}
                          <label style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px dashed rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                          >
                            Pilih Logo
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SINGLE COLUMN FOR USER / KREATOR REGISTER (EMAIL & PASSWORD ONLY)
                  <>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Alamat Email</label>
                      <input 
                        type="email"
                        id="loginUsername" 
                        ref={usernameInputRef}
                        placeholder="Masukkan alamat email aktif"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="loginPassword" 
                          placeholder="Masukkan password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          id="registerConfirm" 
                          placeholder="Konfirmasi password Anda"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="registerRole" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Daftar Sebagai</label>
                      <select
                        id="registerRole"
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        disabled={loginModalLockedRole !== null}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: loginModalLockedRole !== null ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: loginModalLockedRole !== null ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          cursor: loginModalLockedRole !== null ? 'not-allowed' : 'default'
                        }}
                      >
                        <option value="user" style={{ background: '#020202' }}>User / Kreator</option>
                        <option value="panitia" style={{ background: '#020202' }}>Komunitas / Instansi</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                      <SearchableSelect 
                        value={registerRegional}
                        onChange={setRegisterRegional}
                        placeholder="Pilih lokasi regional..."
                        options={regions}
                      />
                    </div>
                  </>
                )
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px' }}>
                <span>{loginModalMode === 'login' ? 'Masuk' : 'Daftar Sekarang'}</span>
              </button>

              {isFirebaseConfigured() && auth && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>atau</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--primary-glow)',
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--border-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--primary-glow)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.53l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Masuk dengan Google</span>
                  </button>
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem' }}>
                {loginModalMode === 'login' ? (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Belum punya akun?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                    >
                      Daftar Baru
                    </button>
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Sudah memiliki akun?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setLoginModalMode('login'); setLoginError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                    >
                      Masuk disini
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
          
          {/* Back to Home Link */}
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setLoginError('');
              setLoginUsername('');
              setLoginPassword('');
              setRegisterConfirmPassword('');
            }}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <span>← Kembali ke Beranda</span>
          </button>
          </div>
        </div>
      )}


      {/* Global Loading Overlay */}
      {globalLoadingText && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            gap: '16px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 254, 0.15)',
            borderTop: '4px solid #fffffe',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span className="badge" style={{ color: '#fffffe', fontSize: '1.05rem', fontWeight: '600', letterSpacing: '0.5px' }}>
            {globalLoadingText}
          </span>
        </div>
      )}

      {/* Lightbox Image Zoom Overlay */}
      {zoomImage && (
        <div 
          className="lightbox-overlay"
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            cursor: 'zoom-out'
          }}
        >
          <button 
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            ✕
          </button>
          <img 
            className="lightbox-image"
            src={zoomImage} 
            alt="Kegiatan Zoom" 
            style={{
              maxWidth: '90%',
              maxHeight: '85%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          />
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className={`custom-toast ${toast.type || 'success'}`}>
          <div className="custom-toast-icon">
            {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div style={{ flex: 1 }}>
            <p className="custom-toast-message">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="custom-toast-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* PWA Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
