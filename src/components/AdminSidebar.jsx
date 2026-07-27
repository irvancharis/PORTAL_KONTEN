import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  FileVideo, 
  Award, 
  Film, 
  Link, 
  CreditCard, 
  CheckSquare, 
  Users, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';

export default function AdminSidebar({
  adminSubTab,
  setAdminSubTab,
  isCollapsed,
  setIsCollapsed,
  currentUser,
  onBackToPortal,
  pendingParticipantsCount = 0,
  pendingSubmissionsCount = 0,
  pendingConfirmationsCount = 0,
  pendingWithdrawalsCount = 0,
  pendingEventsCount = 0
}) {
  // Define menu items for Event Management (available to panitia & superadmin)
  const eventMenuItems = [
    { id: 'event-dashboard', label: 'Dashboard Event', icon: LayoutDashboard },
    { id: 'event-manage', label: 'Kelola Event', icon: Calendar },
    { id: 'event-payment', label: 'Payment', icon: Wallet },
    { id: 'creator-marketplace', label: 'Marketplace Creator', icon: Users }
  ];

  const systemMenuItems = [
    { id: 'movies', label: 'Kelola Film', icon: Film },
    { id: 'affiliates', label: 'Link Afiliasi', icon: Link },
    { id: 'membership', label: 'Pengaturan Premium', icon: CreditCard },
    { id: 'confirmations', label: 'Verifikasi Bukti Bayar', icon: CheckSquare },
    { id: 'withdrawals', label: 'Penarikan Saldo', icon: Wallet },
    { id: 'users', label: 'Kelola Pengguna', icon: Users }
  ];

  const isPanitia = currentUser?.role === 'panitia';
  const isSuperadmin = currentUser?.role === 'superadmin';
  const isStaf = currentUser?.role === 'staf';

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`} style={{ borderRight: '1px solid var(--border-color)', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 8px' }}>
        
        {/* Toggle Collapse Button on Desktop */}
        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', marginBottom: '12px', padding: '0 8px' }}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Section: Event Management (Panitia & Superadmin) */}
        {(isPanitia || isSuperadmin) && (
          <>
            {!isCollapsed && (
              <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px 4px 12px', letterSpacing: '0.5px' }}>
                Event Creator
              </span>
            )}
            {eventMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminSubTab === item.id;
              
              // Determine badge count
              let badgeCount = 0;
              if (item.id === 'event-manage') badgeCount = pendingEventsCount;

              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setAdminSubTab(item.id)}
                  title={item.label}
                  style={{
                    background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} className="sidebar-icon" style={{ color: isActive ? '#a78bfa' : 'var(--text-secondary)' }} />
                    {badgeCount > 0 && (
                      <span 
                        className="animate-glow-red"
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '0.62rem',
                          fontWeight: 'bold',
                          padding: '1px 4px',
                          borderRadius: '8px',
                          minWidth: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                          border: '1.5px solid #0b0f19',
                          zIndex: 2
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="sidebar-label" style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
 
        {/* Section: Portal Administration (Superadmin & Staff) */}
        {(isSuperadmin || isStaf) && (
          <>
            <div style={{ height: '8px' }} />
            {!isCollapsed && (
              <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px 4px 12px', letterSpacing: '0.5px' }}>
                Admin Portal
              </span>
            )}
            {systemMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminSubTab === item.id;
              
              // Determine badge count
              let badgeCount = 0;
              if (item.id === 'confirmations') badgeCount = pendingConfirmationsCount;
              if (item.id === 'withdrawals') badgeCount = pendingWithdrawalsCount;

              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setAdminSubTab(item.id)}
                  title={item.label}
                  style={{
                    background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #ef4444' : '3px solid transparent',
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} className="sidebar-icon" style={{ color: isActive ? '#f87171' : 'var(--text-secondary)' }} />
                    {badgeCount > 0 && (
                      <span 
                        className="animate-glow-red"
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          fontSize: '0.62rem',
                          fontWeight: 'bold',
                          padding: '1px 4px',
                          borderRadius: '8px',
                          minWidth: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                          border: '1.5px solid #0b0f19',
                          zIndex: 2
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="sidebar-label" style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Back to Portal Button at bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-color)' }}>
        <button
          className="sidebar-item"
          onClick={onBackToPortal}
          title="Kembali ke Portal"
          style={{
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            color: 'var(--text-primary)',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <ArrowLeft size={18} className="sidebar-icon" style={{ color: 'var(--text-secondary)' }} />
          <span className="sidebar-label">Kembali ke Portal</span>
        </button>
      </div>
    </aside>
  );
}
