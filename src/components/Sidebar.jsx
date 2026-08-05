import React from 'react';
import { 
  Home, 
  Bookmark, 
  History, 
  Trophy, 
  Wallet, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Film, 
  Link as LinkIcon, 
  CreditCard, 
  CheckSquare, 
  TrendingUp, 
  Shield 
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  setSelectedGenre,
  isCollapsed,
  setIsCollapsed,
  watchlistCount,
  currentUser,
  adminSubTab,
  setAdminSubTab,
  customRoles = [],
  pendingEventsCount = 0,
  pendingConfirmationsCount = 0,
  pendingWithdrawalsCount = 0
}) {
  const isCommunityUser = currentUser && (currentUser.isCommunity || currentUser.role === 'panitia');

  const generalMenuItems = [
    ...(!isCommunityUser ? [
      { id: 'discover', label: 'Beranda', icon: Home },
      { id: 'events', label: 'Event', icon: Trophy },
      { id: 'communities', label: 'Komunitas', icon: Users }
    ] : [])
  ];

  const eventMenuItems = [
    { id: 'event-dashboard', label: 'Dashboard Event', icon: LayoutDashboard },
    { id: 'event-manage', label: 'Kelola Event', icon: Calendar },
    ...(!isCommunityUser ? [
      { id: 'event-payment', label: 'Verifikasi Pembayaran', icon: CreditCard },
      { id: 'creator-marketplace', label: 'Creator', icon: Users }
    ] : [
      { id: 'community-members', label: 'Anggota Komunitas', icon: Users },
      { id: 'community-agendas', label: 'Agenda Komunitas', icon: Calendar }
    ])
  ];

  const systemMenuItems = [
    { id: 'movies', label: 'Kelola Film', icon: Film },
    { id: 'affiliates', label: 'Link Afiliasi', icon: LinkIcon },
    { id: 'membership', label: 'Pengaturan Premium', icon: CreditCard },
    { id: 'confirmations', label: 'Pemasukan Saldo', icon: CheckSquare },
    { id: 'withdrawals', label: 'Penarikan Saldo', icon: Wallet },
    { id: 'finance-report', label: 'Laporan Keuangan', icon: TrendingUp },
    { id: 'users', label: 'Kelola Pengguna', icon: Users },
    { id: 'roles', label: 'Kelola Role', icon: Shield }
  ];

  const getDefaultPermissions = (role) => {
    if (!role) return [];
    const normalizedRole = role.toLowerCase();
    const lookupRole = normalizedRole === 'staff' ? 'staf' : normalizedRole;

    const customRole = customRoles.find(r => 
      r.id?.toLowerCase() === lookupRole || 
      r.name?.toLowerCase() === lookupRole
    );
    if (customRole) return customRole.permissions;

    if (lookupRole === 'superadmin') {
      return [
        'movies', 'affiliates', 'membership', 'confirmations', 'withdrawals', 'users', 'roles',
        'event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace', 'finance-report', 'community-members'
      ];
    }
    if (lookupRole === 'staf') {
      return ['movies', 'affiliates', 'confirmations', 'withdrawals', 'finance-report'];
    }
    if (lookupRole === 'panitia' || (currentUser && currentUser.isCommunity)) {
      return ['event-dashboard', 'event-manage', 'community-members'];
    }
    if (lookupRole === 'user') {
      return ['creator-marketplace'];
    }
    if (lookupRole === 'moderator') {
      return ['confirmations', 'withdrawals', 'finance-report'];
    }
    if (lookupRole === 'editor') {
      return ['movies', 'affiliates'];
    }
    return [];
  };

  const hasPermission = (tabId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    
    // Explicit override for community accounts to prevent database/stale value issues
    const isComm = currentUser.isCommunity || currentUser.role === 'panitia';
    if (isComm) {
      return ['event-dashboard', 'event-manage', 'community-members', 'community-agendas'].includes(tabId);
    }

    // Explicit override for regular users (creators/participants)
    if (currentUser.role === 'user' && !currentUser.isCommunity) {
      return ['creator-marketplace'].includes(tabId);
    }
    
    const lookupRole = currentUser.role?.toLowerCase() === 'staff' ? 'staf' : currentUser.role?.toLowerCase();
    const customRole = customRoles.find(r => 
      r.id?.toLowerCase() === lookupRole || 
      r.name?.toLowerCase() === lookupRole
    );
    if (customRole) {
      return customRole.permissions.includes(tabId);
    }

    const userPerms = currentUser.permissions || getDefaultPermissions(currentUser.role);
    return userPerms.includes(tabId);
  };

  const handleNav = (itemId, isAdminSubTab = false) => {
    if (isAdminSubTab) {
      setActiveTab(itemId);
    } else {
      setActiveTab(itemId);
      setSelectedGenre(null);
    }
    if (window.innerWidth <= 768 && setIsCollapsed) {
      setIsCollapsed(true);
    }
  };

  const renderItem = (item, isSubTab = false) => {
    const Icon = item.icon;
    const isActive = isSubTab 
      ? (activeTab === 'admin' && adminSubTab === item.id)
      : (activeTab === item.id);

    // Determine badge count
    let badgeCount = item.badge || 0;
    if (item.id === 'event-manage') badgeCount = pendingEventsCount;
    if (item.id === 'confirmations') badgeCount = pendingConfirmationsCount;
    if (item.id === 'withdrawals') badgeCount = pendingWithdrawalsCount;

    return (
      <button
        key={item.id}
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        onClick={() => handleNav(item.id, isSubTab)}
        title={item.label}
        style={{
          background: isActive ? 'var(--primary-glow)' : 'transparent',
          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
          transition: 'all 0.2s ease',
          marginBottom: '2px',
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} className="sidebar-icon" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
          {badgeCount > 0 && (
            <span 
              className={item.id === 'watchlist' ? "sidebar-badge" : "animate-glow-red"}
              style={item.id === 'watchlist' ? undefined : {
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
                border: '1.5px solid var(--bg-main)',
                zIndex: 2
              }}
            >
              {badgeCount}
            </span>
          )}
        </div>
        <span className="sidebar-label" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</span>
      </button>
    );
  };

  const showEventSection = currentUser && eventMenuItems.some(item => hasPermission(item.id));
  const showAdminSection = currentUser && systemMenuItems.some(item => hasPermission(item.id));

  return (
    <aside 
      className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`} 
      style={{ 
        borderRight: '1px solid var(--border-color)', 
        height: 'calc(100vh - 56px)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        overflowY: 'auto'
      }}
    >
      <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 8px', width: '100%' }}>
        {/* General Portal Menu */}
        {generalMenuItems.map(item => renderItem(item, false))}

        {/* Event Creator Menu Items (Rendered inline without separator) */}
        {eventMenuItems.filter(item => hasPermission(item.id)).map(item => renderItem(item, true))}

        {/* Dompet Saya (Rendered at the bottom of user options) */}
        {currentUser && renderItem({ id: 'wallet', label: 'Dompet Saya', icon: Wallet }, false)}

        {/* Section: Admin Portal */}
        {showAdminSection && (
          <>
            <div style={{ height: '8px' }} />
            {!isCollapsed && (
              <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px 4px 12px', letterSpacing: '0.5px' }}>
                Admin Portal
              </span>
            )}
            {systemMenuItems.filter(item => hasPermission(item.id)).map(item => renderItem(item, true))}
          </>
        )}
      </div>
    </aside>
  );
}
