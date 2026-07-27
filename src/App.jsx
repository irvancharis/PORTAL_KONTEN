import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
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
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  getFirestoreMovies,
  saveFirestoreMovie,
  deleteFirestoreMovie,
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
  deleteFirestoreWithdrawal
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
  AlertTriangle,
  Trash2
} from 'lucide-react';

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
      { id: '1', username: 'admin', password: 'admin', role: 'superadmin' },
      { id: '2', username: 'staff', password: 'staff', role: 'staf' },
      { id: '3', username: 'member', password: 'member', role: 'member' },
      { id: '4', username: 'panitia', password: 'panitia', role: 'panitia' }
    ];
    if (usersList.length === 0) {
      localStorage.setItem('portal-users', JSON.stringify(defaults));
      return defaults;
    } else {
      if (!usersList.some(u => u.username.toLowerCase() === 'panitia')) {
        usersList.push({ id: '4', username: 'panitia', password: 'panitia', role: 'panitia' });
        localStorage.setItem('portal-users', JSON.stringify(usersList));
      }
      return usersList;
    }
  });

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

  // Save current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('portal-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('portal-current-user');
    }
  }, [currentUser]);

  // Automatic premium membership expiration check (30 days limit)
  useEffect(() => {
    const now = Date.now();
    const expiredUsers = users.filter(u => (u.role === 'member' || u.role === 'pro') && u.premiumExpiresAt && now > u.premiumExpiresAt);
    if (expiredUsers.length > 0) {
      handleSetUsers(prev => prev.map(u => {
        if ((u.role === 'member' || u.role === 'pro') && u.premiumExpiresAt && now > u.premiumExpiresAt) {
          const updated = { ...u, role: 'user', premiumExpiresAt: null };
          // If the currently logged in user is one of the expired users, update currentUser state
          if (currentUser && currentUser.id === u.id) {
            setTimeout(() => {
              setCurrentUser(updated);
              alert("Masa aktif berlangganan Premium Anda telah habis (30 Hari). Status akun Anda dikembalikan menjadi user biasa.");
            }, 100);
          }
          return updated;
        }
        return u;
      }));
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
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const usernameInputRef = useRef(null);

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
    if (registerRole === 'panitia') {
      if (!organizerName.trim() || !organizerPhone.trim()) {
        setLoginError('Nama instansi/komunitas dan No. Telepon wajib diisi!');
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
          role: registerRole,
          walletBalance: 0,
          ...(registerRole === 'panitia' ? {
            organizerName: organizerName.trim(),
            organizerPhone: organizerPhone.trim(),
            organizerDescription: organizerDescription.trim(),
            organizerAvatar: organizerAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizerName.trim())}`
          } : {})
        };
        await saveFirestoreUser(newUser);
        setIsLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        setRegisterConfirmPassword('');
        setOrganizerName('');
        setOrganizerPhone('');
        setOrganizerDescription('');
        setOrganizerAvatar('');
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
        role: registerRole,
        ...(registerRole === 'panitia' ? {
          organizerName: organizerName.trim(),
          organizerPhone: organizerPhone.trim(),
          organizerDescription: organizerDescription.trim(),
          organizerAvatar: organizerAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizerName.trim())}`
        } : {})
      };
      await handleSetUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setRegisterConfirmPassword('');
      setOrganizerName('');
      setOrganizerPhone('');
      setOrganizerDescription('');
      setOrganizerAvatar('');
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
      await signInWithPopup(auth, provider);
      setIsLoginModalOpen(false);
      setLoginError('');
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
    } else {
      setCurrentUser(null);
    }
    if (activeTab === 'admin') {
      handleTabChange('discover');
    }
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
              eventAdminFee: dbSettings?.eventAdminFee || 0
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
          }

          // Fetch all other collections once to populate state initially (heavy optimization)
          console.log("Fetching one-time Firestore snapshot for collections...");
          const [
            dbMovies,
            dbUsers,
            dbConfirmations,
            dbEvents,
            dbParticipants,
            dbSubmissions,
            dbWithdrawals
          ] = await Promise.all([
            getFirestoreMovies(),
            getFirestoreUsers(),
            getFirestoreConfirmations(),
            getFirestoreEvents(),
            getFirestoreEventParticipants(),
            getFirestoreEventSubmissions(),
            getFirestoreWithdrawals()
          ]);

          if (dbMovies) setMovies(dbMovies);
          if (dbUsers) {
            setUsers(dbUsers);
            if (currentUser) {
              const updatedMe = dbUsers.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
              if (updatedMe) {
                setCurrentUser(prev => {
                  if (prev && JSON.stringify(prev) !== JSON.stringify(updatedMe)) {
                    return updatedMe;
                  }
                  return prev;
                });
              }
            }
          }
          if (dbConfirmations) setConfirmations(dbConfirmations);
          if (dbEvents) setEvents(dbEvents);
          if (dbParticipants) setEventParticipants(dbParticipants);
          if (dbSubmissions) setEventSubmissions(dbSubmissions);
          if (dbWithdrawals) setWithdrawals(dbWithdrawals);

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

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase user logged in:", firebaseUser.email);
        
        let currentDbUsers = [];
        const dbUsers = await getFirestoreUsers();
        if (dbUsers) {
          currentDbUsers = dbUsers;
        }

        const emailLower = firebaseUser.email.toLowerCase();
        let matchedUser = currentDbUsers.find(
          u => (u.email && u.email.toLowerCase() === emailLower) || u.username.toLowerCase() === emailLower.split('@')[0]
        );

        if (!matchedUser) {
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

  // 1. Initial Hash Route for Tabs (runs immediately on mount)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tabId = hash.replace('#', '');
      if (['discover', 'watchlist', 'history', 'admin'].includes(tabId)) {
        setActiveTab(tabId);
      }
    }
  }, []);

  // 2. Hash-based Router & Event Listener
  useEffect(() => {
    const handleHashRoute = () => {
      const hash = window.location.hash;
      if (hash) {
        if (hash.startsWith('#play=')) {
          const movieId = hash.replace('#play=', '').split('&')[0];
          const foundMovie = movies.find(m => m.id === movieId);
          if (foundMovie) {
            setSelectedMovie(foundMovie);
            setIsPlaying(true);
          }
        } else {
          // If hash matches a tab name
          const tabId = hash.replace('#', '');
          if (['discover', 'watchlist', 'history', 'admin'].includes(tabId)) {
            setActiveTab(tabId);
            setIsPlaying(false);
            setSelectedMovie(null);
          }
        }
      } else {
        // If hash is empty, return to current active tab state
        setIsPlaying(false);
        setSelectedMovie(null);
      }
    };

    if (movies.length > 0) {
      handleHashRoute();
    }
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, [movies]);

  // Handle Tab Change and update URL hash
  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setIsPlaying(false);
    setSelectedMovie(null);
    if (tabId === 'discover') {
      // Clear hash for discover/home
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    } else {
      window.location.hash = `#${tabId}`;
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
    window.location.hash = `#play=${movie.id}`; // Set URL hash!
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close player and clear URL hash
  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedMovie(null);
    if (window.location.hash.startsWith('#play=')) {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  // Format views to YouTube style
  const formatViews = (views) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1).replace('.', ',') + ' rb';
    }
    return views;
  };

  return (
    <div className={`app-container youtube-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
        eventParticipants={eventParticipants}
        eventSubmissions={eventSubmissions}
        confirmations={confirmations}
        withdrawals={withdrawals}
        onAdminSubTabChange={setAdminSubTab}
        events={events}
      />

      <div className="app-body-wrapper">
        {/* Left Sidebar (Desktop) */}
        {activeTab === 'admin' ? (
          <AdminSidebar 
            adminSubTab={adminSubTab}
            setAdminSubTab={setAdminSubTab}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            currentUser={currentUser}
            onBackToPortal={() => handleTabChange('discover')}
            pendingParticipantsCount={eventParticipants.filter(p => p.status === 'pending').length}
            pendingSubmissionsCount={eventSubmissions.filter(s => s.score === null).length}
            pendingConfirmationsCount={
              confirmations.filter(c => c.status === 'pending').length +
              events.filter(e => e.paymentStatus === 'pending_verification').length
            }
            pendingWithdrawalsCount={withdrawals.filter(w => w.status === 'pending').length}
            pendingEventsCount={
              events.filter(e => e.paymentStatus !== 'paid').length +
              events.filter(e => {
                const isDeadlinePassed = e.deadline ? (
                  e.deadline.includes('T')
                    ? new Date().getTime() > new Date(e.deadline).getTime()
                    : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime()
                ) : false;
                return e.budgetMode === 'ranking' && e.paymentStatus === 'paid' && !e.winnersReleased && isDeadlinePassed;
              }).length
            }
          />
        ) : (
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            setSelectedGenre={setSelectedGenre}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            watchlistCount={watchlist.length}
            currentUser={currentUser}
          />
        )}

        {/* Main Content Area */}
        <main className="main-content">
          {activeTab === 'admin' && currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'staf' || currentUser.role === 'panitia') ? (
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
              setAdminSubTab={setAdminSubTab}
              events={events}
              setEvents={handleSetEvents}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              withdrawals={withdrawals}
              setWithdrawals={handleSetWithdrawals}
              handleTransferWallet={handleTransferWallet}
              minWithdrawalAmount={minWithdrawalAmount}
              setMinWithdrawalAmount={setMinWithdrawalAmount}
              eventAdminFee={eventAdminFee}
              setEventAdminFee={setEventAdminFee}
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
            />
          ) : activeTab === 'events' ? (
            <EventsUserPortal 
              currentUser={currentUser}
              onLoginClick={(mode, role, isLocked) => handleOpenLoginModal(mode, role, isLocked)}
              onLogout={handleLogout}
              onCreateEventRedirect={() => {
                setActiveTab('admin');
                setAdminSubTab('event-manage');
              }}
              events={events}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              users={users}
              setUsers={handleSetUsers}

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
                      <button 
                        className={`btn ${watchlist.includes(selectedMovie.id) ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleWatchlist(selectedMovie)}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          padding: '10px 20px', 
                          borderRadius: '30px',
                          fontSize: '0.88rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {watchlist.includes(selectedMovie.id) ? (
                          <>
                            <BookmarkCheck size={16} fill="currentColor" />
                            <span>Tersimpan di Daftar Tontonan</span>
                          </>
                        ) : (
                          <>
                            <Bookmark size={16} />
                            <span>Simpan ke Daftar Tontonan</span>
                          </>
                        )}
                      </button>
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
                        <div className="sidebar-rec-thumbnail">
                          <img src={movie.backdrop} alt={movie.title} />
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
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memuat data dari Firestore...</span>
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
                        className="btn"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '12px 32px',
                          borderRadius: '30px',
                          color: 'var(--text-primary)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Muat Lebih Banyak
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
            background: '#070a13',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 40%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 24px',
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
            <div style={{ background: 'linear-gradient(135deg, #fe2c55, #7c3aed)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(254, 44, 85, 0.3)' }}>
              <Film size={24} color="white" />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '1.5px', background: 'linear-gradient(to right, #ffffff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FILMO</span>
          </div>

          {/* Login Card */}
          <div 
            className="login-card glass-panel" 
            style={{
              width: '100%',
              maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px',
              padding: '32px 28px',
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <User size={18} className="accent-text" style={{ color: 'var(--primary)' }} />
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
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'login' ? '2px solid var(--primary-color)' : 'none', color: loginModalMode === 'login' ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Masuk
              </button>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'register' ? '2px solid var(--primary-color)' : 'none', color: loginModalMode === 'register' ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
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
                // REGISTER MODE
                registerRole === 'panitia' ? (
                  // TWO COLUMNS FOR PANITIA REGISTER
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
                    {/* Left Column: Account Details */}
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
                          <option value="user" style={{ background: '#0f172a' }}>Regular User / Content Creator</option>
                          <option value="panitia" style={{ background: '#0f172a' }}>Panitia / Event Creator</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column: Organizer Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px dashed rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerName" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Nama / Instansi / Komunitas</label>
                        <input 
                          type="text" 
                          id="organizerName"
                          placeholder="Masukkan nama penyelenggara / komunitas"
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
                        <label htmlFor="organizerDescription" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Deskripsi Penyelenggara (Opsional)</label>
                        <textarea 
                          id="organizerDescription"
                          rows="4"
                          placeholder="Tuliskan deskripsi singkat instansi / komunitas Anda..."
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
                            height: '110px'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Upload Logo / Avatar (Opsional)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {organizerAvatar ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img 
                                src={organizerAvatar} 
                                alt="Preview" 
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid rgba(124, 58, 237, 0.5)'
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
                                  justifyContent: 'center',
                                  fontWeight: 'bold'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px dashed var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem'
                            }}>
                              No Img
                            </div>
                          )}
                          <label style={{
                            flex: 1,
                            padding: '10px 14px',
                            background: 'rgba(124, 58, 237, 0.1)',
                            border: '1px dashed rgba(124, 58, 237, 0.3)',
                            borderRadius: '8px',
                            color: '#c084fc',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.18)';
                            e.currentTarget.style.borderColor = '#c084fc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                          }}
                          >
                            Pilih File Gambar
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Maks. 500 KB (Format: JPG, PNG, WEBP)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SINGLE COLUMN FOR USER REGISTER
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
                        <option value="user" style={{ background: '#0f172a' }}>Regular User / Content Creator</option>
                        <option value="panitia" style={{ background: '#0f172a' }}>Panitia / Event Creator</option>
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
