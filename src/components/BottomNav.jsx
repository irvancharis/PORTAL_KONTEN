import React from 'react';
import { Home, Bookmark, History, LayoutDashboard, Calendar, Wallet, Users, Film, TrendingUp, Trophy } from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  setSelectedGenre,
  currentUser,
  adminSubTab,
  onAdminSubTabChange
}) {
  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setSelectedGenre(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor'].includes(currentUser.role);

  // If user is admin, show admin subtabs in bottom nav
  if (isAdmin) {
    const getAdminNavItems = (role) => {
      const lookupRole = role.toLowerCase() === 'staff' ? 'staf' : role.toLowerCase();
      if (lookupRole === 'panitia') {
        return [
          { id: 'event-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'event-manage', label: 'Kelola Event', icon: Calendar },
          { id: 'event-payment', label: 'Pembayaran', icon: Wallet },
          { id: 'creator-marketplace', label: 'Marketplace', icon: Users }
        ];
      }
      // Defaults/superadmin/staf
      return [
        { id: 'event-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'event-manage', label: 'Event', icon: Calendar },
        { id: 'movies', label: 'Film', icon: Film },
        { id: 'finance-report', label: 'Laporan', icon: TrendingUp }
      ];
    };

    const navItems = getAdminNavItems(currentUser.role);

    return (
      <nav className="bottom-nav glass-panel">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminSubTab === item.id;
          return (
            <button 
              key={item.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (onAdminSubTabChange) onAdminSubTabChange(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Otherwise, render standard public bottom navigation
  return (
    <nav className="bottom-nav glass-panel">
      <button 
        className={`bottom-nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => handleNav('discover')}
      >
        <Home size={20} />
        <span>Beranda</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => handleNav('events')}
      >
        <Trophy size={20} />
        <span>Event</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
        onClick={() => handleNav('watchlist')}
      >
        <Bookmark size={20} />
        <span>Tontonan</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => handleNav('history')}
      >
        <History size={20} />
        <span>Riwayat</span>
      </button>
    </nav>
  );
}
