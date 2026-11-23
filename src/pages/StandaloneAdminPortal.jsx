import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Film, 
  CreditCard, 
  Users, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import AdminPanel from '../components/AdminPanel';

export default function StandaloneAdminPortal(props) {
  const {
    currentUser,
    handleLogout,
    handleTabChange,
    adminSubTab,
    handleAdminSubTabChange,
    customRoles,
    events = [],
    confirmations = [],
    withdrawals = [],
    theme = 'dark',
    setTheme
  } = props;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Guard: pastikan hanya role berwenang yang dapat mengakses
  const isAuthorized = currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor'].includes(currentUser.role?.toLowerCase());

  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '440px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '36px 28px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: '#ef4444'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Akses Terbatas</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
            Halaman ini khusus pengelola sistem, admin, dan panitia resmi ngonten.id. Anda harus masuk dengan akun administrator.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                window.history.pushState(null, '', '/');
                handleTabChange('discover');
              }}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                background: '#ffffff',
                color: '#090d16',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Kembali ke Portal Publik
            </button>
            {currentUser && (
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Keluar Akun
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pending counters
  const pendingEventsCount = events.filter(e => e.paymentStatus === 'pending_verification' || e.paymentStatus === 'pending').length;
  const pendingConfirmationsCount = confirmations.filter(c => c.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  const adminMenuItems = [
    { id: 'event-dashboard', label: 'Ringkasan & Metrik', icon: LayoutDashboard },
    { id: 'event-manage', label: 'Kelola Kampanye & Event', icon: Calendar, badge: pendingEventsCount },
    { id: 'confirmations', label: 'Verifikasi Pembayaran', icon: CreditCard, badge: pendingConfirmationsCount },
    { id: 'withdrawals', label: 'Pencairan Dana (Withdrawal)', icon: TrendingUp, badge: pendingWithdrawalsCount },
    { id: 'finance-report', label: 'Jurnal Kas Finansial', icon: CreditCard },
    { id: 'creator-marketplace', label: 'Katalog Kreator', icon: Users },
    { id: 'movies', label: 'Katalog Konten Film', icon: Film },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users },
    { id: 'roles', label: 'Pengaturan Role Akses', icon: ShieldCheck },
    { id: 'membership', label: 'Konfigurasi Sistem', icon: Settings },
  ];

  const currentRoleObj = customRoles.find(r => r.id === currentUser.role);
  const allowedPermissions = currentUser.role === 'superadmin' ? null : (currentRoleObj?.permissions || []);

  const visibleMenuItems = adminMenuItems.filter(item => {
    if (currentUser.role === 'superadmin') return true;
    if (item.id === 'membership' && currentUser.role !== 'superadmin') return false;
    if (item.id === 'roles' && currentUser.role !== 'superadmin') return false;
    if (item.id === 'users' && !['superadmin', 'staf'].includes(currentUser.role)) return false;
    return allowedPermissions ? allowedPermissions.includes(item.id) : true;
  });

  return (
    <div className={`standalone-admin-portal ${theme === 'light' ? 'light-theme' : ''}`} style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-main, #090d16)',
      color: 'var(--text-primary, #ffffff)',
      fontFamily: 'inherit'
    }}>
      {/* Sidebar Admin Eksklusif */}
      <aside style={{
        width: isSidebarOpen ? '260px' : '72px',
        background: 'var(--card-bg, #0b0f19)',
        borderRight: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))'
        }}>
          {isSidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '1rem'
              }}>
                N
              </div>
              <div>
                <h1 style={{ fontSize: '0.98rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Admin Center</h1>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ngonten.id Control Panel</span>
              </div>
            </div>
          ) : (
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '1rem'
            }}>
              N
            </div>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: isSidebarOpen ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <div style={{ flex: 1, padding: '16px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {visibleMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = adminSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleAdminSubTabChange(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isSidebarOpen ? '10px 14px' : '10px 0',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                  borderRadius: '8px',
                  background: isActive ? 'var(--primary, #0284c7)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.86rem',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {isSidebarOpen && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {item.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    borderRadius: '9999px',
                    padding: '2px 7px',
                    marginLeft: 'auto',
                    flexShrink: 0
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Portal Switcher */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              handleTabChange('discover');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center'
            }}
            title="Buka Website Publik"
          >
            <ArrowLeft size={15} />
            {isSidebarOpen && <span>Portal Publik</span>}
          </button>

          {isSidebarOpen && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 4px',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  {currentUser.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {currentUser.username}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar Sesi"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          background: 'var(--card-bg, #0b0f19)',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Dashboard / Admin Panel</span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {visibleMenuItems.find(m => m.id === adminSubTab)?.label || 'Kelola Sistem'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {setTheme && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Ganti Tema"
                style={{
                  background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

            <button
              onClick={() => {
                window.history.pushState(null, '', '/');
                handleTabChange('discover');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <span>Lihat Portal</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </header>

        {/* Content Body Rendering AdminPanel Component Inside Clean Workspace */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          <AdminPanel {...props} />
        </main>
      </div>
    </div>
  );
}
