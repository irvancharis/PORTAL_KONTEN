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
  deleteFirestoreCommunity
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
  Users
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
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
        description: 'Komunitas resmi penyelenggara kompetisi kreatif FILMO.',
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
  const [loginError, setLoginError] = useState('');

  // Edit Profile Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileDescription, setEditProfileDescription] = useState('');
  const [editProfileAvatar, setEditProfileAvatar] = useState('');
  const [editProfileCategory, setEditProfileCategory] = useState('Videografer');
  const [editProfilePortfolio, setEditProfilePortfolio] = useState('');
  const [editProfileActiveMembers, setEditProfileActiveMembers] = useState('');
  const usernameInputRef = useRef(null);

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setEditProfileName(currentUser.organizerName || '');
    setEditProfilePhone(currentUser.organizerPhone || '');
    setEditProfileDescription(currentUser.organizerDescription || '');
    setEditProfileAvatar(currentUser.organizerAvatar || '');
    setEditProfileCategory(currentUser.userCategory || 'Videografer');
    setEditProfilePortfolio(currentUser.userPortfolio || '');
    setEditProfileActiveMembers(currentUser.activeMembersCount || '');
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

    if (!emailOrUser || !password || !confirm) {
      setLoginError('Semua kolom wajib diisi!');
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
          userPortfolio: ''
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
      }
    } else {
      if (users.some(u => u.username.toLowerCase() === emailOrUser.toLowerCase())) {
        setLoginError('Username sudah digunakan oleh user lain!');
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
        userPortfolio: ''
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
      setOrganizerName('');
      setOrganizerPhone('');
      setOrganizerDescription('');
      setOrganizerAvatar('');
      setActiveMembersCount('');
      setUserCategory('Videografer');
      setUserPortfolio('');
      setLoginError('');
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
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
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
              paymentInstructions: dbSettings?.paymentInstructions || '- Bank BCA: 1234567890 a.n. FILMO\n- DANA: 081234567890 a.n. Admin\n- OVO: 081234567890',
              minWithdrawalAmount: dbSettings?.minWithdrawalAmount || 50000,
              eventAdminFee: dbSettings?.eventAdminFee || 0,
              withdrawalFeePercent: dbSettings?.withdrawalFeePercent || 0
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
            dbCommunities
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
            getFirestoreCommunities()
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
                description: 'Komunitas resmi penyelenggara kompetisi kreatif FILMO.',
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
    
    const updatedComm = latestComm.map(c => {
      if (c.username.toLowerCase() === communityUsername.toLowerCase()) {
        const members = c.joinedMembers || [];
        const pending = c.pendingMembers || [];
        
        const isMember = members.includes(currentUser.username);
        const isPending = pending.includes(currentUser.username);
        
        let newMembers = [...members];
        let newPending = [...pending];
        
        if (isMember) {
          newMembers = members.filter(m => m !== currentUser.username);
          alert('Anda telah keluar dari komunitas.');
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
    return localStorage.getItem('portal-payment-instructions') || '- Bank BCA: 1234567890 a.n. FILMO\n- DANA: 081234567890 a.n. Admin\n- OVO: 081234567890';
  });

  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(() => {
    const saved = localStorage.getItem('portal-min-withdrawal');
    return saved ? parseInt(saved) : 50000;
  });

  const [eventAdminFee, setEventAdminFee] = useState(() => {
    const saved = localStorage.getItem('portal-event-admin-fee');
    return saved ? parseInt(saved) : 0;
  });

  const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(() => {
    const saved = localStorage.getItem('portal-withdrawal-fee-percent');
    return saved ? parseInt(saved) : 0;
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
    localStorage.setItem('portal-withdrawal-fee-percent', withdrawalFeePercent.toString());
  }, [withdrawalFeePercent]);

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
            setSelectedCommunityId(foundComm.id);
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
      const titleText = `${selectedMovie.title} - FILMO`;
      document.title = titleText;
      
      const descText = `Saksikan film "${selectedMovie.title}" secara instan tanpa iklan. Sinopsis: ${selectedMovie.description?.substring(0, 120) || 'Nonton streaming film berkualitas di FILMO.'}...`;
      if (metaDesc) {
        metaDesc.setAttribute('content', descText);
      }
      
      // JSON-LD Schema for Movie
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": selectedMovie.title,
        "description": selectedMovie.description || 'Nonton streaming film berkualitas di FILMO.',
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
        const titleText = `${activeEvent.title} - FILMO`;
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
          "description": activeEvent.description || 'Ikuti kompetisi video kreatif di FILMO.',
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
        document.title = 'Event - FILMO';
        if (metaDesc) {
          metaDesc.setAttribute('content', 'Ikuti berbagai kompetisi event video kreatif (Short Film, Music Video, UGC, Dokumenter) dan raih total hadiah jutaan rupiah.');
        }
      }
    } else if (activeTab === 'wallet') {
      document.title = 'Dompet Saya - FILMO';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Kelola pendapatan Anda dari views video dan lakukan penarikan saldo dengan mudah di FILMO.');
      }
    } else if (activeTab === 'watchlist') {
      document.title = 'Daftar Tontonan - FILMO';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Simpan dan kelola film-film favorit Anda untuk ditonton nanti di FILMO.');
      }
    } else if (activeTab === 'history') {
      document.title = 'Riwayat - FILMO';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Lihat riwayat film yang telah Anda tonton sebelumnya di FILMO.');
      }
    } else {
      // General Homepage / Discover
      document.title = 'FILMO';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Platform streaming film berkualitas tinggi tanpa iklan serta portal kompetisi event video kreatif dengan berbagai pilihan kategori dan hadiah menarik di FILMO.');
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
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab, selectedMovie?.id, isPlaying, adminSubTab]);

  // Handle Tab Change and update URL path
  function handleTabChange(tabId) {
    setSelectedCommunityId(null);
    const adminSubTabs = [
      'event-dashboard', 'event-manage', 'creator-marketplace', 
      'movies', 'affiliates', 'membership', 'confirmations', 'withdrawals', 'finance-report', 'users', 'roles'
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
              withdrawalFeePercent={withdrawalFeePercent}
              setWithdrawalFeePercent={setWithdrawalFeePercent}
              customRoles={customRoles}
              setCustomRoles={setCustomRoles}
              financialJournals={financialJournals}
              setFinancialJournals={handleSetFinancialJournals}
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
            />
          ) : activeTab === 'communities' ? (
            (() => {
              if (selectedCommunityId) {
                const comm = communities.find(c => c.id === selectedCommunityId);
                if (!comm) {
                  return (
                    <div className="glass-panel animate-fade-in" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Komunitas tidak ditemukan.
                      <button onClick={() => setSelectedCommunityId(null)} className="btn btn-primary" style={{ marginTop: '12px' }}>Kembali</button>
                    </div>
                  );
                }

                const members = comm.joinedMembers || [];
                const isJoined = currentUser && members.includes(currentUser.username);
                const target = Number(comm.activeMembersCount || 0);
                const current = members.length;
                const isActive = current >= target;
                const percentage = target > 0 ? (current / target) * 100 : 0;
                const isRegularUser = currentUser && !(currentUser.isCommunity || currentUser.role === 'panitia');

                return (
                  <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    {/* Back button */}
                    <button 
                      onClick={() => {
                        window.history.pushState(null, '', '/communities');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
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
                        marginBottom: '28px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                    >
                      ← Kembali ke Daftar Komunitas
                    </button>

                    <div style={{
                      background: 'rgba(15, 15, 15, 0.7)', 
                      backdropFilter: 'blur(20px)', 
                      padding: '32px', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.04)',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                      textAlign: 'left'
                    }}>
                      {/* Community Header Block */}
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ffffff', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', border: '3px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                          {comm.avatar ? (
                            <img src={comm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            comm.name?.charAt(0) || comm.username?.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', 
                              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)', 
                              padding: '5px 14px', 
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              border: '1px solid rgba(255,255,255,0.15)',
                              letterSpacing: '0.5px'
                            }}>
                              {isActive ? 'KOMUNITAS AKTIF' : 'KOMUNITAS BELUM AKTIF'}
                            </span>
                          </div>
                          <h2 style={{ 
                            color: 'white', 
                            fontSize: '2.2rem', 
                            fontWeight: '800', 
                            margin: 0, 
                            letterSpacing: '-0.8px'
                          }}>{comm.name || comm.username}</h2>
                        </div>
                      </div>

                      {/* Detail Grid */}
                      <div className="event-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '24px' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Bio / Deskripsi</h3>
                            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                              {comm.description || 'Belum ada deskripsi profil.'}
                            </p>
                          </div>

                          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Daftar Anggota ({current} Orang)</h3>
                            {members.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                {members.map((m, idx) => (
                                  <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'white' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffffff', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                      {m.charAt(0)}
                                    </div>
                                    <span>{m}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Belum ada anggota yang bergabung.</p>
                            )}
                          </div>
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>Status Keaktifan</h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Target Anggota:</span>
                              <strong style={{ color: 'white' }}>{target} Orang</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Anggota Tergabung:</span>
                              <strong style={{ color: 'white' }}>{current} Orang</strong>
                            </div>

                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                              <div style={{ 
                                width: `${Math.min(100, percentage)}%`, 
                                height: '100%', 
                                background: '#ffffff',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                            
                            {!isActive ? (
                              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', display: 'block', lineHeight: '1.4' }}>
                                *Kurang {target - current} anggota untuk mencapai status aktif
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#ffffff', display: 'block', lineHeight: '1.4', fontWeight: 'bold' }}>
                                ✓ Komunitas telah mencapai target anggota aktif.
                              </span>
                            )}

                            {isRegularUser && (() => {
                              const pending = comm.pendingMembers || [];
                              const isPending = pending.includes(currentUser?.username);
                              return (
                                <div style={{ marginTop: '16px' }}>
                                  <button
                                    onClick={() => handleToggleJoinCommunity(comm.username)}
                                    style={{
                                      width: '100%',
                                      padding: '12px',
                                      fontSize: '0.9rem',
                                      fontWeight: 'bold',
                                      borderRadius: '30px',
                                      border: (isJoined || isPending) ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                      background: (isJoined || isPending) ? 'rgba(255, 255, 255, 0.05)' : 'white',
                                      color: (isJoined || isPending) ? 'white' : 'black',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {isJoined ? 'Keluar Komunitas' : isPending ? 'Menunggu Persetujuan (Batalkan)' : 'Join Komunitas'}
                                  </button>
                                </div>
                              );
                            })()}


                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="profile-view-container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                  <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 8px 0', color: 'white' }}>Direktori Komunitas & Instansi</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Temukan komunitas kreatif pilihan dan bergabunglah untuk mengikuti event/kompetisi khusus anggota mereka.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {communities
                      .filter(comm => !currentUser || comm.username.toLowerCase() !== currentUser.username.toLowerCase())
                      .map(comm => {
                      const members = comm.joinedMembers || [];
                      const target = Number(comm.activeMembersCount || 0);
                      const current = members.length;
                      const isActive = current >= target;

                      return (
                        <div 
                          key={comm.id}
                          className="glass-panel"
                          onClick={() => {
                            const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;
                            window.history.pushState(null, '', '/community/' + commSlug);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                          style={{ 
                            borderRadius: '12px', 
                            padding: '18px 24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            background: 'rgba(15, 15, 15, 0.45)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                            flexWrap: 'wrap',
                            width: '100%',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(15, 15, 15, 0.45)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Left Section: Avatar, Title & Description */}
                          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                              {comm.avatar ? (
                                <img src={comm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                comm.name?.charAt(0) || comm.username?.charAt(0)
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>{comm.name || comm.username}</h3>
                                <span style={{ 
                                  fontSize: '0.68rem', 
                                  padding: '2px 8px', 
                                  borderRadius: '10px', 
                                  fontWeight: 'bold',
                                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', 
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.15)'
                                }}>
                                  {isActive ? 'Aktif' : 'Belum Aktif'}
                                </span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                {comm.description || 'Belum ada deskripsi profil.'}
                              </p>
                            </div>
                          </div>

                          {/* Middle Section: Members Count */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: '120px', textAlign: 'left' }}>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}> Anggota Tergabung </div>
                              <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                                {current} / {target} Orang
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          ) : activeTab === 'profile' ? (
            (() => {
              const isCurrentUserCommunity = currentUser?.isCommunity || currentUser?.role === 'panitia';
              return (
                <div className="profile-view-container animate-fade-in">
                  {/* Profile Header Card */}
                  <div className="profile-card-header glass-panel">
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                      <button 
                        onClick={handleOpenEditProfile}
                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '20px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                      >
                        <Edit size={14} />
                        <span>Edit Profil</span>
                      </button>
                    </div>

                    {/* Avatar */}
                    <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary)', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px', border: '4px solid rgba(255, 255, 255, 0.1)' }}>
                      {currentUser?.organizerAvatar ? (
                        <img src={currentUser.organizerAvatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        currentUser?.username?.charAt(0)
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>{currentUser?.organizerName || currentUser?.username}</h2>
                    {isCurrentUserCommunity && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(255,200,0,0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,200,0,0.2)', fontWeight: 'bold' }}>
                          Komunitas
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Details Container */}
                  <div className="profile-card-details glass-panel">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>Detail Data Profil</h3>
                    
                    {/* Email */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <Mail size={16} />
                        <span style={{ fontSize: '0.85rem' }}>Email</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentUser?.email || '-'}</span>
                    </div>

                    {/* WhatsApp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <Phone size={16} />
                        <span style={{ fontSize: '0.85rem' }}>WhatsApp / HP</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentUser?.organizerPhone || '-'}</span>
                    </div>

                    {/* Kategori Kreator */}
                    {!isCurrentUserCommunity && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                          <User size={16} />
                          <span style={{ fontSize: '0.85rem' }}>Kategori Kreator</span>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentUser?.userCategory || '-'}</span>
                      </div>
                    )}

                    {/* Link Portofolio */}
                    {!isCurrentUserCommunity && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                          <Globe size={16} />
                          <span style={{ fontSize: '0.85rem' }}>Link Portofolio</span>
                        </div>
                        {currentUser?.userPortfolio ? (
                          <a href={currentUser.userPortfolio} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                            Buka Link Portofolio
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum Diisi</span>
                        )}
                      </div>
                    )}

                    {/* Jumlah Anggota (Community only) */}
                    {isCurrentUserCommunity && (() => {
                      const myCommRecord = communities.find(c => c.username.toLowerCase() === currentUser.username.toLowerCase());
                      const myJoinedMembers = myCommRecord ? (myCommRecord.joinedMembers || []) : [];
                      const target = Number(myCommRecord ? (myCommRecord.activeMembersCount || 0) : (currentUser.activeMembersCount || 0));
                      const current = myJoinedMembers.length;
                      const isActive = current >= target;
                      const percentage = target > 0 ? (current / target) * 100 : 0;
                      
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                              <User size={16} />
                              <span style={{ fontSize: '0.85rem' }}>Target Anggota untuk Aktif</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{target} Orang</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                              <Users size={16} />
                              <span style={{ fontSize: '0.85rem' }}>Anggota Tergabung</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{current} Orang</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Keaktifan</span>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                fontWeight: 'bold', 
                                color: isActive ? '#10b981' : '#f59e0b', 
                                background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' 
                              }}>
                                {isActive ? 'AKTIF' : 'BELUM AKTIF'}
                              </span>
                            </div>
                            
                            <div style={{ width: '100%', marginTop: '4px' }}>
                              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${Math.min(100, percentage)}%`, 
                                  height: '100%', 
                                  background: isActive ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              {!isActive && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                                  *Kurang {target - current} anggota untuk mencapai status aktif
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daftar Anggota Komunitas</span>
                            {myJoinedMembers.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                {myJoinedMembers.map((m, idx) => (
                                  <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'white' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                      {m.charAt(0)}
                                    </div>
                                    <span>{m}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada anggota yang bergabung.</span>
                            )}
                          </div>
                        </>
                      );
                    })()}

                {/* Deskripsi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bio / Deskripsi Singkat</span>
                  <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.6', background: 'rgba(255, 255, 255, 0.01)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    {currentUser?.organizerDescription || 'Belum ada deskripsi profil.'}
                  </p>
                </div>
              </div>

              {/* Persetujuan Anggota Baru (Only for community owners) */}
              {isCurrentUserCommunity && (() => {
                const myComm = communities.find(c => c.username.toLowerCase() === currentUser?.username?.toLowerCase());
                const pendingList = myComm ? (myComm.pendingMembers || []) : [];
                return (
                  <div 
                    id="persetujuan-anggota" 
                    className="profile-card-details glass-panel" 
                    style={{ 
                      marginTop: '24px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', color: 'white' }}>
                      Persetujuan Anggota Baru
                    </h3>
                    {pendingList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        {pendingList.map((pendingUser, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: '500' }}>{pendingUser}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleApproveMember(myComm.id, pendingUser)}
                                style={{ background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                              >
                                Setujui
                              </button>
                              <button 
                                onClick={() => handleRejectMember(myComm.id, pendingUser)}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, padding: '8px 0' }}>
                        Tidak ada permintaan bergabung baru yang memerlukan persetujuan Anda.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Join Komunitas Section (For regular users - Show only joined communities) */}
              {!isCurrentUserCommunity && (
                <div className="profile-card-details glass-panel" style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>Komunitas Saya</h3>
                  {(() => {
                    const communitiesList = communities.filter(c => (c.joinedMembers || []).includes(currentUser?.username));
                    if (communitiesList.length === 0) {
                      return (
                        <div style={{ padding: '16px 0', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Anda belum bergabung dengan komunitas mana pun.</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleTabChange('communities')}
                            style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '20px' }}
                          >
                            Jelajahi Komunitas
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {communitiesList.map(comm => {
                          const members = comm.joinedMembers || [];
                          const target = Number(comm.activeMembersCount || 0);
                          const current = members.length;
                          const isActive = current >= target;
                          
                          return (
                            <div key={comm.username} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', gap: '16px' }}>
                              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 300px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                                  {comm.avatar ? (
                                    <img src={comm.avatar} alt={comm.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    comm.name?.charAt(0) || comm.username?.charAt(0)
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <strong style={{ fontSize: '0.95rem', color: 'white' }}>{comm.name || comm.username}</strong>
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      padding: '2px 8px', 
                                      borderRadius: '10px', 
                                      fontWeight: 'bold', 
                                      color: isActive ? '#10b981' : '#f59e0b', 
                                      background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' 
                                    }}>
                                      {isActive ? 'Aktif' : 'Belum Aktif'}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {current} dari {target} Anggota Tergabung
                                  </span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;
                                    window.history.pushState(null, '', '/community/' + commSlug);
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                  }}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  Lihat Detail
                                </button>
                                <button
                                  onClick={() => handleToggleJoinCommunity(comm.username)}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  Keluar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Logout Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '300px',
                    padding: '12px 24px',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          );
        })()
      ) : activeTab === 'events' ? (
            <EventsUserPortal 
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
                  withdrawalFeePercent={withdrawalFeePercent}
                  setWithdrawalFeePercent={setWithdrawalFeePercent}
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
          ) : selectedMovie && isPlaying ? (
            /* YOUTUBE WATCH PAGE LAYOUT */
            <div className="watch-page-layout animate-fade-in">
              {/* Left Column: Player & Detail Info */}
              <div className="watch-main-column">
                <VideoPlayer 
                  movie={selectedMovie} 
                  affiliateLinks={affiliateLinks}
                  gdriveApiKey={gdriveApiKey}
                  whatsappAdmin={whatsappAdmin}
                  premiumPrice={premiumPrice}
                  paymentInstructions={paymentInstructions}
                  currentUser={currentUser}
                  confirmations={confirmations}
                  setConfirmations={handleSetConfirmations}
                  onClose={handleClosePlayer} 
                  onLoginClick={(mode) => handleOpenLoginModal(mode)}
                  onSubscribeClick={() => setShowPremiumModal(true)}
                />

                 <div className="watch-video-details">
                    <div className="watch-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                      <h1 className="watch-title" style={{ margin: 0 }}>{selectedMovie.title}</h1>

                    </div>
                  
                  {/* Actions & Channel Row */}
                  {/* YouTube Styled Video Description Box */}
                  <div className="watch-description-box glass-panel">
                    <div className="desc-meta">
                      <span className="desc-views-count">
                        <Eye size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {selectedMovie.views.toLocaleString('id-ID')} ditonton
                      </span>
                      <span className="desc-date">
                        <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {selectedMovie.year}
                      </span>
                      <span className="desc-rating">
                        <Star fill="#f59e0b" color="#f59e0b" size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {selectedMovie.rating} Rating
                      </span>
                    </div>
                    <p className="desc-text">{selectedMovie.description}</p>
                    <div className="desc-extra">
                      <span><strong>Durasi:</strong> {selectedMovie.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations Sidebar List */}
              <div className="watch-sidebar-column">
                <h2 className="sidebar-title">Rekomendasi Film</h2>
                <div className="sidebar-rec-list">
                  {movies
                    .filter(m => m.id !== selectedMovie.id)
                    .map(movie => (
                      <div 
                        key={movie.id} 
                        className="sidebar-rec-item"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div className="sidebar-rec-thumbnail" style={{ position: 'relative' }}>
                          <img src={movie.backdrop} alt={movie.title} />
                          <div className="thumbnail-hover-overlay">
                            <div className="play-circle-small" style={{ width: '32px', height: '32px' }}>
                              <Play fill="currentColor" size={14} />
                            </div>
                          </div>
                          <span className="rec-duration-badge">{movie.duration}</span>
                        </div>
                        <div className="sidebar-rec-info">
                          <h4 className="rec-title" title={movie.title}>{movie.title}</h4>
                          <span className="rec-channel">{movie.genre.slice(0, 2).join(' / ')}</span>
                          <div className="rec-metadata">
                            <span>{formatViews(movie.views)} ditonton</span>
                            <span>•</span>
                            <span className="rec-rating-stars">
                              <Star fill="#f59e0b" color="#f59e0b" size={10} style={{ display: 'inline', marginRight: '2px' }} />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* CATALOG GRID VIEW */
            <div className="catalog-layout">
              {activeTab === 'discover' && (
                <div className="genres-bar">
                  <button 
                    className={`genre-pill ${!selectedGenre ? 'active' : ''}`}
                    onClick={() => setSelectedGenre(null)}
                  >
                    Semua
                  </button>
                  {allGenres.map(genre => (
                    <button
                      key={genre}
                      className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
                      onClick={() => setSelectedGenre(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}

              <div className="catalog-header">
                <h2>
                  {activeTab === 'discover' && (selectedGenre ? `Kategori: ${selectedGenre}` : 'Rekomendasi Utama')}
                  {activeTab === 'watchlist' && 'Daftar Tontonan Anda'}
                  {activeTab === 'history' && 'Riwayat Menonton'}
                </h2>
                
                {activeTab === 'discover' && (
                  <button 
                    className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <SlidersHorizontal size={16} />
                    <span>Filter</span>
                  </button>
                )}

                {activeTab === 'history' && history.length > 0 && (
                  <button className="clear-history-btn" onClick={clearHistory}>
                    <Trash2 size={15} />
                    <span>Hapus Semua Riwayat</span>
                  </button>
                )}
              </div>

              {/* Filter Panel (Slide down search filter panel) */}
              {activeTab === 'discover' && isFilterOpen && (
                <div className="filter-panel animate-slide-down">
                  <div className="filter-grid">
                    {/* Column 1: Kategori */}
                    <div className="filter-column">
                      <h4 className="filter-title-label">
                        <Tag size={14} className="filter-icon" />
                        <span>KATEGORI</span>
                      </h4>
                      <div className="filter-options">
                        <button 
                          className={`filter-option-btn ${!selectedGenre ? 'active' : ''}`}
                          onClick={() => setSelectedGenre(null)}
                        >
                          Semua
                        </button>
                        {allGenres.map(g => (
                          <button
                            key={g}
                            className={`filter-option-btn ${selectedGenre === g ? 'active' : ''}`}
                            onClick={() => setSelectedGenre(g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Tahun */}
                    <div className="filter-column">
                      <h4 className="filter-title-label">
                        <Calendar size={14} className="filter-icon" />
                        <span>TAHUN</span>
                      </h4>
                      <div className="filter-options">
                        <button 
                          className={`filter-option-btn ${filterYear === 'Semua' ? 'active' : ''}`}
                          onClick={() => setFilterYear('Semua')}
                        >
                          Semua
                        </button>
                        {allYears.map(y => (
                          <button
                            key={y}
                            className={`filter-option-btn ${filterYear === y.toString() ? 'active' : ''}`}
                            onClick={() => setFilterYear(y.toString())}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Negara */}
                    <div className="filter-column">
                      <h4 className="filter-title-label">
                        <Flag size={14} className="filter-icon" />
                        <span>NEGARA</span>
                      </h4>
                      <div className="filter-options">
                        <button 
                          className={`filter-option-btn ${filterCountry === 'Semua' ? 'active' : ''}`}
                          onClick={() => setFilterCountry('Semua')}
                        >
                          Semua
                        </button>
                        {allCountries.map(c => (
                          <button
                            key={c}
                            className={`filter-option-btn ${filterCountry === c ? 'active' : ''}`}
                            onClick={() => setFilterCountry(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 4: Sensor (Film Semi) */}
                    <div className="filter-column">
                      <h4 className="filter-title-label">
                        {filterSemi === 'Sembunyikan' ? <EyeOff size={14} className="filter-icon" /> : <Eye size={14} className="filter-icon" />}
                        <span>FILM SEMI</span>
                      </h4>
                      <div className="filter-options">
                        <button 
                          className={`filter-option-btn ${filterSemi === 'Sembunyikan' ? 'active' : ''}`}
                          onClick={() => setFilterSemi('Sembunyikan')}
                        >
                          Sembunyikan
                        </button>
                        <button 
                          className={`filter-option-btn ${filterSemi === 'Tampilkan' ? 'active' : ''}`}
                          onClick={() => setFilterSemi('Tampilkan')}
                        >
                          Tampilkan Semua
                        </button>
                        <button 
                          className={`filter-option-btn ${filterSemi === 'Hanya' ? 'active' : ''}`}
                          onClick={() => setFilterSemi('Hanya')}
                        >
                          Hanya Film Semi
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reset Filters Bar */}
                  {(selectedGenre || filterYear !== 'Semua' || filterCountry !== 'Semua' || filterSemi !== 'Sembunyikan') && (
                    <div className="filter-footer">
                      <button 
                        className="reset-filters-btn"
                        onClick={() => {
                          setSelectedGenre(null);
                          setFilterYear('Semua');
                          setFilterCountry('Semua');
                          setFilterSemi('Sembunyikan');
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Riset Semua Filter</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isLoadingDB ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memuat data...</span>
                </div>
              ) : filteredMovies.length > 0 ? (
                <React.Fragment>
                  <div className="movie-grid youtube-grid">
                    {filteredMovies.slice(0, visibleMoviesCount).map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        currentUser={currentUser}
                        onSelect={handleMovieSelect}
                      />
                    ))}
                  </div>
                  {filteredMovies.length > visibleMoviesCount && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '16px' }}>
                      <button 
                        onClick={() => setVisibleMoviesCount(prev => prev + 12)}
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
                  )}
                </React.Fragment>
              ) : (
                /* Empty States */
                <div className="empty-state glass-panel">
                  <Film size={48} className="empty-icon" />
                  <h3>Tidak ada video ditemukan</h3>
                  <p>
                    {activeTab === 'watchlist' && 'Daftar tontonan Anda kosong. Jelajahi film menarik dan favoritkan video untuk menyimpannya di sini.'}
                    {activeTab === 'history' && 'Anda belum memutar film apa pun. Film yang Anda putar akan muncul di sini.'}
                    {activeTab === 'discover' && 'Kami tidak menemukan film yang cocok dengan pencarian Anda. Coba kata kunci atau filter lain.'}
                  </p>
                  {(activeTab !== 'discover' || selectedGenre || searchQuery) && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        handleTabChange('discover');
                        setSelectedGenre(null);
                        setSearchQuery('');
                      }}
                    >
                      Kembali ke Beranda
                    </button>
                  )}
                </div>
              )}
            </div>
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
                    userPortfolio: isComm ? '' : editProfilePortfolio.trim()
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
                      joinedMembers: existingComm ? (existingComm.joinedMembers || []) : []
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

                {currentUser.role !== 'panitia' ? (
                  <>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Keahlian / Kategori Utama</label>
                      <select
                        value={editProfileCategory}
                        onChange={(e) => setEditProfileCategory(e.target.value)}
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
                      >
                        <option value="Videografer">Videografer</option>
                        <option value="Content Creator">Content Creator</option>
                        <option value="Animator">Animator</option>
                        <option value="Script Writer">Script Writer</option>
                        <option value="Aktor / Aktris">Aktor / Aktris</option>
                        <option value="Penyelenggara Event">Penyelenggara Event</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Film size={24} color="black" />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff' }}>FILMO</span>
          </div>

          {/* Login Card */}
          <div 
            className="login-card glass-panel" 
            style={{
              width: '100%',
              maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px',
              padding: '32px 28px',
              borderRadius: '16px',
              background: '#020202',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={18} className="accent-text" style={{ color: '#ffffff' }} />
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
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'login' ? '2px solid #ffffff' : 'none', color: loginModalMode === 'login' ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Masuk
              </button>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'register' ? '2px solid #ffffff' : 'none', color: loginModalMode === 'register' ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
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
                    <input 
                      type="password" 
                      id="loginPassword" 
                      placeholder="Masukkan password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                        <input 
                          type="password" 
                          id="loginPassword" 
                          placeholder="Masukkan password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
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
                        <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                        <input 
                          type="password" 
                          id="registerConfirm" 
                          placeholder="Konfirmasi password Anda"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
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
                      <input 
                        type="password" 
                        id="loginPassword" 
                        placeholder="Masukkan password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                      <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                      <input 
                        type="password" 
                        id="registerConfirm" 
                        placeholder="Konfirmasi password Anda"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
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
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
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


      {/* PWA Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
