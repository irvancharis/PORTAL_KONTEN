import React from 'react';
import { Home, Bookmark, History, SlidersHorizontal } from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  setSelectedGenre,
  currentUser
}) {
  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setSelectedGenre(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAdmin = currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'staf');

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

      {showAdmin && (
        <button 
          className={`bottom-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleNav('admin')}
        >
          <SlidersHorizontal size={20} />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
}
