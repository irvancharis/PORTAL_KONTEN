import React from 'react';
import { Home, LayoutDashboard, Calendar, Wallet, Users, Film, TrendingUp, Trophy } from 'lucide-react';

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

  const isCurrentlyInAdminTab = activeTab === 'admin';
  const isAdmin = currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor', 'user'].includes(currentUser.role);

  // If user is admin, show admin subtabs in bottom nav (for regular user role, only when in admin tab)
  if (isAdmin && (isCurrentlyInAdminTab || currentUser.role !== 'user')) {
    const getAdminNavItems = (role) => {
      const lookupRole = role.toLowerCase() === 'staff' ? 'staf' : role.toLowerCase();
      if (lookupRole === 'panitia' || lookupRole === 'user') {
        return [
          { id: 'event-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'event-manage', label: 'Kelola Event', icon: Calendar },
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

      {currentUser && (
        <button 
          className={`bottom-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => handleNav('wallet')}
        >
          <Wallet size={20} />
          <span>Dompet Saya</span>
        </button>
      )}
    </nav>
  );
}
