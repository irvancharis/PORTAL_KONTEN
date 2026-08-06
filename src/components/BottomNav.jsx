import { Home, Wallet, Users, Trophy, Calendar } from 'lucide-react';

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
      return ['event-dashboard', 'event-manage', 'community-members', 'community-agendas'].includes(permId);
    }

    // Explicit override for regular users (creators/participants)
    if (currentUser.role === 'user' && !currentUser.isCommunity) {
      return ['creator-marketplace'].includes(permId);
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
    setActiveTab(item.id);
    if (!item.isEventCreator && setSelectedGenre) {
      setSelectedGenre(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCommunityUser = currentUser && (currentUser.isCommunity || currentUser.role === 'panitia');

  const navItems = [];

  if (!isCommunityUser) {
    navItems.push(
      { id: 'discover', label: 'Beranda', icon: Home, isEventCreator: false },
      { id: 'events', label: 'Event', icon: Trophy, isEventCreator: false },
      { id: 'communities', label: 'Komunitas', icon: Users, isEventCreator: false }
    );
  } else {
    // Community/Panitia Bottom Navigation
    navItems.push(
      { id: 'event-dashboard', label: 'Dashboard', icon: Home, isEventCreator: true },
      { id: 'event-manage', label: 'Kelola Event', icon: Trophy, isEventCreator: true },
      { id: 'community-members', label: 'Anggota', icon: Users, isEventCreator: true },
      { id: 'community-agendas', label: 'Agenda', icon: Calendar, isEventCreator: true }
    );
  }

  if (currentUser) {
    if (!isCommunityUser && hasPermission('creator-marketplace')) {
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
            <Icon size={20} strokeWidth={isActive ? 2.8 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
