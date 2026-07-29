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
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`} style={{ borderRight: '1px solid var(--border-color)', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 8px', width: '100%' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
              title={item.label}
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
                transition: 'all 0.2s ease',
                marginBottom: '2px',
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
            >
              <Icon size={20} className="sidebar-icon" style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }} />
              <span className="sidebar-label" style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}>{item.label}</span>
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
