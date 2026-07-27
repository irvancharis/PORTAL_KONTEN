import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Film, X, User, Sparkles, ChevronDown, LogOut, Bell } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  activeTab,
  setActiveTab,
  genres,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  currentUser,
  onLoginClick,
  onLogout,
  onSubscribeClick,
  eventParticipants = [],
  eventSubmissions = [],
  confirmations = [],
  withdrawals = [],
  onAdminSubTabChange,
  events = []
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close notification dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const formatTimeAgo = (timestamp) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffHrs < 24) return `${diffHrs}j lalu`;
      if (diffDays < 7) return `${diffDays}h lalu`;
      return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const getNotifications = () => {
    const list = [];
    if (!currentUser) return list;

    // Helper to format date label
    const formatIndonesianDate = (dateString) => {
      if (!dateString) return 'Hingga Budget Habis';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    };

    const isPanitiaOrSuperadmin = currentUser.role === 'panitia' || currentUser.role === 'superadmin';
    const isStafOrSuperadmin = currentUser.role === 'staf' || currentUser.role === 'superadmin';

    // === ADMIN / PANITIA / STAF NOTIFICATIONS ===

    // 1. Pending participants
    if (isPanitiaOrSuperadmin) {
      eventParticipants
        .filter(p => p.status === 'pending')
        .forEach(p => {
          list.push({
            id: p.id,
            type: 'participant',
            title: 'Pendaftaran Baru',
            message: `${p.name} mendaftar di ${p.eventTitle}`,
            timestamp: p.registeredAt || new Date().toISOString(),
            tab: 'event-participants'
          });
        });
    }

    // 2. Pending submissions
    if (isPanitiaOrSuperadmin) {
      eventSubmissions
        .filter(s => s.score === null)
        .forEach(s => {
          list.push({
            id: s.id,
            type: 'submission',
            title: 'Karya Baru Masuk',
            message: `${s.participantName} mengunggah "${s.title}"`,
            timestamp: s.submittedAt || new Date().toISOString(),
            tab: 'event-submissions'
          });
        });
    }

    // 3. Pending confirmations
    if (isStafOrSuperadmin) {
      confirmations
        .filter(c => c.status === 'pending')
        .forEach(c => {
          list.push({
            id: c.id,
            type: 'confirmation',
            title: 'Bukti Bayar Premium',
            message: `${c.username} mengonfirmasi bukti transfer`,
            timestamp: c.timestamp || new Date().toISOString(),
            tab: 'confirmations'
          });
        });

      if (currentUser.role === 'superadmin') {
        events
          .filter(e => e.paymentStatus === 'pending_verification')
          .forEach(e => {
            list.push({
              id: `evt_pay_notif_${e.id}`,
              type: 'confirmation',
              title: 'Bukti Bayar Event',
              message: `${e.creator && e.creator !== 'Panitia' ? `Panitia "${e.creator}"` : 'Panitia'} mengonfirmasi pembayaran event "${e.title}"`,
              timestamp: e.paymentSubmittedAt || e.createdAt || new Date().toISOString(),
              tab: 'confirmations'
            });
          });
      }
    }

    // 4. Pending withdrawals
    if (isStafOrSuperadmin) {
      withdrawals
        .filter(w => w.status === 'pending')
        .forEach(w => {
          list.push({
            id: w.id,
            type: 'withdrawal',
            title: 'Penarikan Saldo Baru',
            message: `${w.username} mengajukan penarikan Rp ${w.amount.toLocaleString('id-ID')}`,
            timestamp: w.requestedAt || new Date().toISOString(),
            tab: 'withdrawals'
          });
        });
    }

    // 5. Pending event payments (belum bayar biaya event) & pending winner releases (completed)
    if (isPanitiaOrSuperadmin) {
      events
        .filter(e => e.paymentStatus !== 'paid')
        .forEach(e => {
          list.push({
            id: e.id,
            type: 'event-payment',
            title: 'Pembayaran Event Pending',
            message: `Event "${e.title}" belum aktif. Harap selesaikan pembayaran biaya event & platform.`,
            timestamp: e.deadline || new Date().toISOString(),
            tab: 'event-manage'
          });
        });

      events
        .filter(e => {
          const isDeadlinePassed = e.deadline ? (
            e.deadline.includes('T')
              ? new Date().getTime() > new Date(e.deadline).getTime()
              : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime()
          ) : false;
          return e.budgetMode === 'ranking' && e.paymentStatus === 'paid' && !e.winnersReleased && isDeadlinePassed;
        })
        .forEach(e => {
          list.push({
            id: `release_${e.id}`,
            type: 'event-winners',
            title: 'Pemenang Belum Ditentukan',
            message: `Event "${e.title}" telah berakhir. Segera tentukan pemenang kompetisi!`,
            timestamp: e.deadline || new Date().toISOString(),
            tab: 'event-manage'
          });
        });
    }

    // === PARTICIPANT / MEMBER NOTIFICATIONS ===

    const userLower = currentUser.username.toLowerCase();

    // 1. Participant registration updates (approved/rejected)
    eventParticipants
      .filter(p => p.username.toLowerCase() === userLower)
      .forEach(p => {
        let title = '';
        let msg = '';
        if (p.status === 'approved') {
          title = 'Pendaftaran Disetujui';
          msg = `Selamat! Pendaftaran Anda di event "${p.eventTitle}" telah disetujui. Anda dapat mengirimkan karya sekarang.`;
        } else if (p.status === 'rejected') {
          title = 'Pendaftaran Ditolak';
          msg = `Maaf, pendaftaran Anda di event "${p.eventTitle}" ditolak. Silakan hubungi panitia.`;
        } else {
          title = 'Pendaftaran Diproses';
          msg = `Pendaftaran Anda di event "${p.eventTitle}" sedang dalam proses verifikasi oleh panitia.`;
        }
        list.push({
          id: `user_part_${p.id}`,
          type: 'user-registration',
          title,
          message: msg,
          timestamp: p.verifiedAt || p.registeredAt || new Date().toISOString(),
          tab: 'user-events'
        });
      });

    // 2. Submission scoring updates
    eventSubmissions
      .filter(s => s.username.toLowerCase() === userLower && s.score !== null)
      .forEach(s => {
        list.push({
          id: `user_eval_${s.id}`,
          type: 'user-evaluation',
          title: 'Karya Telah Dinilai',
          message: `Karya film Anda "${s.title}" pada event "${s.eventTitle}" telah dinilai oleh Juri dengan skor ${s.score}/100.`,
          timestamp: s.submittedAt || new Date().toISOString(),
          tab: 'user-events'
        });
      });

    // 3. User pending submissions
    eventParticipants
      .filter(p => p.username.toLowerCase() === userLower && p.status === 'approved')
      .forEach(p => {
        const submitted = eventSubmissions.some(s => s.eventId === p.eventId && s.username.toLowerCase() === userLower);
        if (!submitted) {
          const evt = events.find(e => e.id === p.eventId);
          if (evt) {
            const isDeadlinePassed = evt.deadline ? (
              evt.deadline.includes('T')
                ? new Date().getTime() > new Date(evt.deadline).getTime()
                : new Date().getTime() > new Date(evt.deadline + 'T23:59:59').getTime()
            ) : false;
            if (!isDeadlinePassed) {
              list.push({
                id: `user_pend_sub_${p.id}`,
                type: 'user-pending-submission',
                title: 'Kirim Karya Diperlukan',
                message: `Anda belum mengirimkan karya untuk event "${p.eventTitle}". Batas waktu: ${formatIndonesianDate(evt.deadline)}.`,
                timestamp: p.verifiedAt || p.registeredAt || new Date().toISOString(),
                tab: 'user-events'
              });
            }
          }
        }
      });

    // 4. Withdrawal status updates
    withdrawals
      .filter(w => w.username.toLowerCase() === userLower)
      .forEach(w => {
        let title = '';
        let msg = '';
        if (w.status === 'approved') {
          title = 'Penarikan Berhasil';
          msg = `Penarikan saldo sebesar Rp ${w.amount.toLocaleString('id-ID')} ke akun ${w.method} Anda telah sukses dicairkan.`;
        } else if (w.status === 'rejected') {
          title = 'Penarikan Ditolak';
          msg = `Penarikan saldo sebesar Rp ${w.amount.toLocaleString('id-ID')} ditolak. Saldo telah dikembalikan ke dompet Anda.`;
        } else {
          title = 'Penarikan Diproses';
          msg = `Pengajuan penarikan Rp ${w.amount.toLocaleString('id-ID')} sedang dalam proses verifikasi admin.`;
        }
        list.push({
          id: `user_wd_${w.id}`,
          type: 'user-withdrawal',
          title,
          message: msg,
          timestamp: w.requestedAt || new Date().toISOString(),
          tab: 'wallet'
        });
      });

    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const notificationsList = getNotifications();
  const unreadCount = notificationsList.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localInput, setLocalInput] = useState(searchQuery);

  // Sync local input with parent searchQuery (e.g. when cleared from outside/clicking logo)
  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localInput);
  };

  return (
    <header className="navbar glass-panel">
      <div className="navbar-container">
        {/* Left: Menu Hamburger + Logo */}
        <div className="navbar-left">
          <button 
            className="menu-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="navbar-logo" onClick={() => {
            setSelectedGenre(null);
            setSearchQuery('');
            setActiveTab('discover');
          }}>
            <Film className="logo-icon" />
            <span className="logo-text">FIL<span className="accent-text" style={{ color: 'var(--primary)' }}>MO</span></span>
          </div>
        </div>

        {/* Center: YouTube style Search Bar */}
        <form 
          onSubmit={handleSearchSubmit}
          className={`navbar-search-wrapper ${isSearchFocused ? 'focused' : ''}`}
        >
          <div className="search-input-container">
            <Search className="search-icon-left" size={16} />
            <input
              type="text"
              placeholder="Telusuri film, genre, deskripsi..."
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {localInput && (
              <button 
                type="button"
                className="clear-btn" 
                onClick={() => {
                  setLocalInput('');
                  setSearchQuery('');
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        {/* Right: User Avatar / Login Button */}
        <div className="navbar-right">
          {currentUser ? (
            <div 
              className="user-logged-in-container" 
              ref={userMenuRef} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
            >
              {/* Notification Bell (All Logged In Users) */}
              {currentUser && (
                <div ref={notificationRef} style={{ position: 'relative', marginRight: '6px' }}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      position: 'relative',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <Bell size={18} style={{ color: unreadCount > 0 ? '#a78bfa' : 'var(--text-secondary)' }} />
                    {unreadCount > 0 && (
                      <span 
                        className="animate-glow-red"
                        style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0f172a'
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div 
                      className="glass-panel animate-fade-in" 
                      style={{ 
                        position: 'absolute', 
                        top: '46px', 
                        right: '0', 
                        width: '320px', 
                        maxHeight: '380px', 
                        overflowY: 'auto', 
                        zIndex: 1000, 
                        borderRadius: '12px', 
                        padding: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(15, 23, 42, 0.96)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'white' }}>Notifikasi Terbaru</span>
                        <span style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(167, 139, 250, 0.2)' }}>{unreadCount} Baru</span>
                      </div>
                      
                      {notificationsList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {notificationsList.map(notif => {
                            // Color mapping for different notification types
                            let indicatorColor = '#94a3b8';
                            if (notif.type === 'participant' || notif.type === 'user-registration') {
                              indicatorColor = '#10b981';
                            } else if (notif.type === 'submission' || notif.type === 'user-evaluation') {
                              indicatorColor = '#a78bfa';
                            } else if (notif.type === 'confirmation' || notif.type === 'event-payment') {
                              indicatorColor = '#fbbf24';
                            } else if (notif.type === 'withdrawal' || notif.type === 'user-withdrawal') {
                              indicatorColor = '#ef4444';
                            }

                            return (
                              <div 
                                key={notif.id} 
                                onClick={() => {
                                  if (notif.tab === 'wallet') {
                                    setActiveTab('wallet');
                                  } else if (notif.tab === 'user-events') {
                                    setActiveTab('events');
                                  } else {
                                    setActiveTab('admin');
                                    if (onAdminSubTabChange) {
                                      onAdminSubTabChange(notif.tab);
                                    }
                                  }
                                  setIsNotificationOpen(false);
                                }}
                                style={{ 
                                  padding: '12px', 
                                  background: 'rgba(255, 255, 255, 0.02)', 
                                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                                  borderLeft: `3.5px solid ${indicatorColor}`,
                                  borderRadius: '8px', 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                  e.currentTarget.style.transform = 'translateX(2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', lineHeight: '1.2' }}>{notif.title}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {formatTimeAgo(notif.timestamp)}
                                  </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{notif.message}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <Bell size={24} style={{ display: 'block', margin: '0 auto 8px auto', opacity: 0.3 }} />
                          Tidak ada notifikasi baru
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button 
                className="user-profile-badge"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  outline: 'none',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div 
                  className="user-avatar-circle"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {currentUser.username.charAt(0)}
                </div>
                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                   <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser.username}</span>
                    <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 'bold' }}>
                      {currentUser.role === 'member' 
                        ? 'Premium Member' 
                        : currentUser.role === 'superadmin' 
                          ? 'Superadmin' 
                          : currentUser.role === 'staf' 
                            ? 'Staff' 
                            : 'Regular User'}
                    </span>
                </div>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </button>

              {isDropdownOpen && (
                <div 
                  className="user-dropdown-menu glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: '0',
                    background: 'rgba(15, 23, 42, 0.93)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    zIndex: 1000,
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255, 255, 255, 0.05) inset',
                    minWidth: '220px',
                    transformOrigin: 'top right'
                  }}
                >
                  {/* User info header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div 
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                      }}
                    >
                      {currentUser.username.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>{currentUser.username}</span>
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          color: currentUser.role === 'member' ? '#c084fc' : '#94a3b8', 
                          fontWeight: '600',
                          background: currentUser.role === 'member' ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          width: 'fit-content',
                          marginTop: '3px',
                          border: currentUser.role === 'member' ? '1px solid rgba(167, 139, 250, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {currentUser.role === 'member' 
                          ? 'Premium Member' 
                          : currentUser.role === 'superadmin' 
                            ? 'Superadmin' 
                            : currentUser.role === 'staf' 
                              ? 'Staff' 
                              : 'Regular User'}
                      </span>
                    </div>
                  </div>

                  {/* Subscribe Premium Option */}
                  {!(currentUser.role === 'member' || currentUser.role === 'superadmin' || currentUser.role === 'staf') && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSubscribeClick();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 14px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                      }}
                    >
                      <Sparkles size={14} style={{ color: '#fbbf24' }} />
                      <span>Berlangganan Premium</span>
                    </button>
                  )}

                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 14px', 
                      fontSize: '0.8rem',
                      color: '#f87171',
                      background: 'rgba(239, 68, 68, 0.03)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                    }}
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onLoginClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px'
              }}
            >
              <User size={16} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
