import React from 'react';
import { Home, Bookmark, History, Heart, SlidersHorizontal, Trophy, Wallet } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  setSelectedGenre,
  isCollapsed,
  setIsCollapsed,
  watchlistCount,
  currentUser
}) {
  const menuItems = [
    { id: 'discover', label: 'Beranda', icon: Home },
    { id: 'events', label: 'Event', icon: Trophy }
  ];

  if (currentUser) {
    menuItems.push({ id: 'wallet', label: 'Dompet Saya', icon: Wallet });
  }

  menuItems.push(
    { id: 'watchlist', label: 'Daftar Tontonan', icon: Bookmark, badge: watchlistCount },
    { id: 'history', label: 'Riwayat', icon: History }
  );

  if (currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'staf' || currentUser.role === 'panitia')) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: SlidersHorizontal });
  }

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setSelectedGenre(null);
    if (window.innerWidth <= 768 && setIsCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
              title={item.label}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
              {item.badge > 0 && !isCollapsed && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
