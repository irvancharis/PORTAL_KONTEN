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
    { id: 'event-manage', label: 'Kelola Campaign', icon: Calendar, badge: pendingEventsCount },
    { id: 'confirmations', label: 'Verifikasi Pembayaran', icon: CreditCard, badge: pendingConfirmationsCount },
    { id: 'withdrawals', label: 'Pencairan Dana (Withdrawal)', icon: TrendingUp, badge: pendingWithdrawalsCount },
    { id: 'finance-report', label: 'Jurnal Kas Finansial', icon: CreditCard },
    { id: 'creator-marketplace', label: 'Katalog Kreator', icon: Users },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users },
    { id: 'blacklist', label: 'Peserta Blacklist', icon: Users },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users },
    { id: 'membership', label: 'Konfigurasi Sistem', icon: Settings },
  ];

  const currentRoleObj = customRoles.find(r => r.id === currentUser.role);
  const allowedPermissions = currentUser.role === 'superadmin' ? null : (currentRoleObj?.permissions || []);

  const visibleMenuItems = adminMenuItems.filter(item => {
    if (currentUser.role === 'superadmin') return true;
    if (item.id === 'membership' && currentUser.role !== 'superadmin') return false;
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
      <aside 
        className="admin-sidebar"
        style={{
          width: isSidebarOpen ? '220px' : '64px',
          background: 'var(--bg-navbar, #0b0f19)',
          borderRight: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        {/* Brand Header - Simple & Clean */}
        <div style={{
          padding: isSidebarOpen ? '16px 14px' : '16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {isSidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                N
              </div>
              <h1 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                Admin Center
              </h1>
            </div>
          ) : (
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              N
            </div>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: isSidebarOpen ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Menu Navigation */}
        <div style={{
          flex: 1,
          padding: isSidebarOpen ? '20px 0 20px 14px' : '20px 8px',
          overflowY: 'auto',
          overflowX: 'visible',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {visibleMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = adminSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleAdminSubTabChange(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isSidebarOpen ? '12px 16px' : '12px 0',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.88rem',
                  position: 'relative',
                  textAlign: 'left'
                }}
              >
                <Icon size={19} className="nav-icon" style={{ flexShrink: 0 }} />
                {isSidebarOpen && (
                  <span className="nav-label" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    marginRight: isSidebarOpen ? '14px' : '0',
                    flexShrink: 0
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Simplified Bottom Section - User & Logout Only */}
        <div style={{
          padding: isSidebarOpen ? '12px 14px' : '12px 8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          gap: '8px'
        }}>
          {isSidebarOpen ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  {currentUser.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {currentUser.username}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
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
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Keluar Sesi"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto', background: 'var(--bg-main)' }}>
        {/* Content Body Rendering AdminPanel Component Inside Clean Workspace */}
        <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          <AdminPanel {...props} />
        </main>
      </div>
    </div>
  );
}
