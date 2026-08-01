import React from 'react';
import { Home, Wallet, Users, Trophy } from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  setSelectedGenre,
  currentUser,
  adminSubTab,
  onAdminSubTabChange,
  customRoles
}) {
  const hasPermission = (permId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    
    // Explicit override for community accounts to prevent database/stale value issues
    const isComm = currentUser.isCommunity || currentUser.role === 'panitia';
    if (isComm) {
      return ['event-dashboard', 'event-manage', 'community-members'].includes(permId);
    }
    
    const role = currentUser.role?.toLowerCase();
    const lookupRole = role === 'staff' ? 'staf' : role;
    
    const customRole = (customRoles || []).find(r => 
      r.id?.toLowerCase() === lookupRole || 
      r.name?.toLowerCase() === lookupRole
    );
    if (customRole) {
      return customRole.permissions.includes(permId);
    }
    
    // Default hardcoded permissions per role if not found in customRoles
    if (lookupRole === 'staf') {
      return ['movies', 'finance-report', 'event-payment', 'creator-marketplace'].includes(permId);
    }
    if (lookupRole === 'panitia' || lookupRole === 'user') {
      return ['event-dashboard', 'event-manage', 'event-payment', 'creator-marketplace'].includes(permId);
    }
    if (lookupRole === 'moderator') {
      return ['finance-report', 'event-payment'].includes(permId);
    }
    if (lookupRole === 'editor') {
      return ['movies'].includes(permId);
    }
    return false;
  };

  const handleNavClick = (item) => {
    if (item.isEventCreator) {
      if (onAdminSubTabChange) onAdminSubTabChange(item.id);
      setActiveTab('admin');
    } else {
      setActiveTab(item.id);
      if (setSelectedGenre) setSelectedGenre(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCommunityUser = currentUser && (currentUser.isCommunity || currentUser.role === 'panitia');

  const navItems = [
    { id: 'discover', label: 'Beranda', icon: Home, isEventCreator: false },
    ...(!isCommunityUser ? [
      { id: 'events', label: 'Event', icon: Trophy, isEventCreator: false }
    ] : [])
  ];

  if (currentUser) {
    if (isCommunityUser) {
      navItems.push({ id: 'event-manage', label: 'Kelola Event', icon: Trophy, isEventCreator: true });
    } else if (hasPermission('creator-marketplace')) {
      navItems.push({ id: 'creator-marketplace', label: 'Creator', icon: Users, isEventCreator: true });
    }
    navItems.push({ id: 'wallet', label: 'Dompet Saya', icon: Wallet, isEventCreator: false });
  }

  return (
    <nav className="bottom-nav glass-panel">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isEventCreator 
          ? (activeTab === 'admin' && adminSubTab === item.id)
          : (activeTab === item.id);
        
        return (
          <button 
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
