import { useState, useEffect, useRef } from 'react';
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
} from '../firebase';
import moviesData from '../data/movies.json';
import { slugify, formatIndonesianDate, fetchJSONP, INDONESIAN_REGIONS } from '../utils/helpers';

export default function useAppState() {
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


  return {
    movies,
    setMovies,
    affiliateLinks,
    setAffiliateLinks,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    activeTab,
    setActiveTab,
    activeFaqIndex,
    setActiveFaqIndex,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedCommunityId,
    setSelectedCommunityId,
    communitySearchQuery,
    setCommunitySearchQuery,
    communityRegionalFilter,
    setCommunityRegionalFilter,
    theme,
    setTheme,
    isPageLoading,
    setIsPageLoading,
    selectedMovie,
    setSelectedMovie,
    isPlaying,
    setIsPlaying,
    watchlist,
    setWatchlist,
    history,
    setHistory,
    users,
    setUsers,
    events,
    setEvents,
    eventParticipants,
    setEventParticipants,
    eventSubmissions,
    setEventSubmissions,
    confirmations,
    setConfirmations,
    withdrawals,
    setWithdrawals,
    offers,
    setOffers,
    financialJournals,
    setFinancialJournals,
    regions,
    setRegions,
    gdriveApiKey,
    setGdriveApiKey,
    whatsappAdmin,
    setWhatsappAdmin,
    premiumPrice,
    setPremiumPrice,
    withdrawalFeePercent,
    setWithdrawalFeePercent,
    withdrawalFeePercentPremium,
    setWithdrawalFeePercentPremium,
    paymentInstructions,
    setPaymentInstructions,
    customRoles,
    setCustomRoles,
    currentUser,
    setCurrentUser,
    isMobile,
    setIsMobile,
    showPremiumModal,
    setShowPremiumModal,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginModalMode,
    setLoginModalMode,
    loginModalLockedRole,
    setLoginModalLockedRole,
    organizerName,
    setOrganizerName,
    organizerPhone,
    setOrganizerPhone,
    organizerDescription,
    setOrganizerDescription,
    organizerAvatar,
    setOrganizerAvatar,
    activeMembersCount,
    setActiveMembersCount,
    userCategory,
    setUserCategory,
    userPortfolio,
    setUserPortfolio,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loginError,
    setLoginError,
    registerRegional,
    setRegisterRegional,
    isEditProfileModalOpen,
    setIsEditProfileModalOpen,
    globalLoadingText,
    setGlobalLoadingText,
    zoomImage,
    setZoomImage,
    toast,
    setToast,
    editProfileName,
    setEditProfileName,
    editProfilePhone,
    setEditProfilePhone,
    editProfileDescription,
    setEditProfileDescription,
    editProfileAvatar,
    setEditProfileAvatar,
    editProfileCategory,
    setEditProfileCategory,
    editProfilePortfolio,
    setEditProfilePortfolio,
    editProfileActiveMembers,
    setEditProfileActiveMembers,
    editProfileActivityImages,
    setEditProfileActivityImages,
    editProfileFacebookHandle,
    setEditProfileFacebookHandle,
    editProfileFacebookVerified,
    setEditProfileFacebookVerified,
    editProfileTiktokHandle,
    setEditProfileTiktokHandle,
    editProfileTiktokVerified,
    setEditProfileTiktokVerified,
    editProfileInstagramHandle,
    setEditProfileInstagramHandle,
    editProfileInstagramVerified,
    setEditProfileInstagramVerified,
    editProfileYoutubeHandle,
    setEditProfileYoutubeHandle,
    editProfileYoutubeVerified,
    setEditProfileYoutubeVerified,
    editProfileRegional,
    setEditProfileRegional,
    verifyingPlatform,
    setVerifyingPlatform,
    verificationStep,
    setVerificationStep,
    uniqueCode,
    setUniqueCode,
    timerSeconds,
    setTimerSeconds,
    verificationError,
    setVerificationError,
    socialUrl,
    setSocialUrl,
    isCopied,
    setIsCopied,
    minWithdrawalAmount,
    setMinWithdrawalAmount,
    eventAdminFee,
    setEventAdminFee,
    eventFlatFee,
    setEventFlatFee,
    isFilterOpen,
    setIsFilterOpen,
    filterYear,
    setFilterYear,
    filterCountry,
    setFilterCountry,
    filterSemi,
    setFilterSemi,
    visibleMoviesCount,
    setVisibleMoviesCount,
    allGenres,
    allYears,
    allCountries,
    isLoadingDB,
    adminSubTab,
    setAdminSubTab,
    handleCheckProfileSocialMedia,
    handleOpenEditProfile,
    handleOpenLoginModal,
    handleLoginSubmit,
    handleAvatarFileChange,
    handleRegisterSubmit,
    handleGoogleLogin,
    handleLogout,
    handleToggleJoinCommunity,
    handleKickMember,
    handleApproveMember,
    handleRejectMember,
    handleSaveAgenda,
    handleTransferWallet,
    handleSetConfirmations,
    handleSaveSettings,
    handleAdminSubTabChange,
    handleTabChange,
    clearHistory,
    getFilteredMovies,
    handleMovieSelect,
    handleClosePlayer,
    communities,
    setCommunities,
    sidebarEvents,
    sidebarParticipants,
    sidebarSubmissions
  };
}
