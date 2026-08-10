import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MovieCard from './components/MovieCard';
import VideoPlayer from './components/VideoPlayer';
import PremiumModal from './components/PremiumModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AdminPanel from './components/AdminPanel';
import EventsUserPortal from './components/EventsUserPortal';
import WalletUserPortal from './components/WalletUserPortal';
import DiscoverPage from './pages/DiscoverPage';
import CommunitiesPage from './pages/CommunitiesPage';
import ProfilePage from './pages/ProfilePage';
import SearchableSelect from './components/SearchableSelect';
import useAppState from './hooks/useAppState';
import { slugify, formatIndonesianDate, fetchJSONP } from './utils/helpers';
import { isFirebaseConfigured, auth, saveFirestoreUser } from './firebase';
import { 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Eye, 
  EyeOff,
  Star, 
  SlidersHorizontal, 
  Tag, 
  Flag, 
  ChevronDown, 
  RotateCcw,
  Film,
  User,
  X,
  Play,
  AlertTriangle,
  Trash2,
  LogOut,
  Edit,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Users,
  Search,
  TrendingUp,
  UserPlus,
  Award,
  Briefcase,
  Tv,
  MapPin,
  Clock,
  DollarSign,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';

export default function App() {
  const state = useAppState();

  const {
    movies,
    setMovies,
    affiliateLinks,
    setAffiliateLinks,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    activeTab,
    setActiveTab,
    activeFaqIndex,
    setActiveFaqIndex,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedCommunityId,
    setSelectedCommunityId,
    communitySearchQuery,
    setCommunitySearchQuery,
    communityRegionalFilter,
    setCommunityRegionalFilter,
    theme,
    setTheme,
    isPageLoading,
    setIsPageLoading,
    selectedMovie,
    setSelectedMovie,
    isPlaying,
    setIsPlaying,
    watchlist,
    setWatchlist,
    history,
    setHistory,
    users,
    setUsers,
    events,
    setEvents,
    eventParticipants,
    setEventParticipants,
    eventSubmissions,
    setEventSubmissions,
    confirmations,
    setConfirmations,
    withdrawals,
    setWithdrawals,
    offers,
    setOffers,
    financialJournals,
    setFinancialJournals,
    regions,
    setRegions,
    gdriveApiKey,
    setGdriveApiKey,
    whatsappAdmin,
    setWhatsappAdmin,
    premiumPrice,
    setPremiumPrice,
    withdrawalFeePercent,
    setWithdrawalFeePercent,
    withdrawalFeePercentPremium,
    setWithdrawalFeePercentPremium,
    paymentInstructions,
    setPaymentInstructions,
    customRoles,
    setCustomRoles,
    currentUser,
    setCurrentUser,
    isMobile,
    setIsMobile,
    showPremiumModal,
    setShowPremiumModal,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginModalMode,
    setLoginModalMode,
    loginModalLockedRole,
    setLoginModalLockedRole,
    organizerName,
    setOrganizerName,
    organizerPhone,
    setOrganizerPhone,
    organizerDescription,
    setOrganizerDescription,
    organizerAvatar,
    setOrganizerAvatar,
    activeMembersCount,
    setActiveMembersCount,
    userCategory,
    setUserCategory,
    userPortfolio,
    setUserPortfolio,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loginError,
    setLoginError,
    registerRegional,
    setRegisterRegional,
    registerRole,
    setRegisterRole,
    isEditProfileModalOpen,
    setIsEditProfileModalOpen,
    globalLoadingText,
    setGlobalLoadingText,
    zoomImage,
    setZoomImage,
    toast,
    setToast,
    editProfileName,
    setEditProfileName,
    editProfilePhone,
    setEditProfilePhone,
    editProfileDescription,
    setEditProfileDescription,
    editProfileAvatar,
    setEditProfileAvatar,
    editProfileCategory,
    setEditProfileCategory,
    editProfilePortfolio,
    setEditProfilePortfolio,
    editProfileActiveMembers,
    setEditProfileActiveMembers,
    editProfileActivityImages,
    setEditProfileActivityImages,
    editProfileFacebookHandle,
    setEditProfileFacebookHandle,
    editProfileFacebookVerified,
    setEditProfileFacebookVerified,
    editProfileTiktokHandle,
    setEditProfileTiktokHandle,
    editProfileTiktokVerified,
    setEditProfileTiktokVerified,
    editProfileInstagramHandle,
    setEditProfileInstagramHandle,
    editProfileInstagramVerified,
    setEditProfileInstagramVerified,
    editProfileYoutubeHandle,
    setEditProfileYoutubeHandle,
    editProfileYoutubeVerified,
    setEditProfileYoutubeVerified,
    editProfileRegional,
    setEditProfileRegional,
    verifyingPlatform,
    setVerifyingPlatform,
    verificationStep,
    setVerificationStep,
    uniqueCode,
    setUniqueCode,
    timerSeconds,
    setTimerSeconds,
    verificationError,
    setVerificationError,
    socialUrl,
    setSocialUrl,
    isCopied,
    setIsCopied,
    minWithdrawalAmount,
    setMinWithdrawalAmount,
    eventAdminFee,
    setEventAdminFee,
    eventFlatFee,
    setEventFlatFee,
    isFilterOpen,
    setIsFilterOpen,
    filterYear,
    setFilterYear,
    filterCountry,
    setFilterCountry,
    filterSemi,
    setFilterSemi,
    visibleMoviesCount,
    setVisibleMoviesCount,
    allGenres,
    allYears,
    allCountries,
    isLoadingDB,
    adminSubTab,
    setAdminSubTab,
    handleCheckProfileSocialMedia,
    handleOpenEditProfile,
    handleOpenLoginModal,
    handleLoginSubmit,
    handleAvatarFileChange,
    handleRegisterSubmit,
    handleGoogleLogin,
    handleLogout,
    handleToggleJoinCommunity,
    handleKickMember,
    handleApproveMember,
    handleRejectMember,
    handleSaveAgenda,
    handleTransferWallet,
    handleSetConfirmations,
    handleSaveSettings,
    handleAdminSubTabChange,
    handleTabChange,
    clearHistory,
    getFilteredMovies,
    handleMovieSelect,
    handleClosePlayer,
    communities,
    setCommunities,
    handleSetCommunities,
    usernameInputRef,
    sidebarEvents,
    sidebarParticipants,
    sidebarSubmissions,
    handleSetMovies,
    handleSetAffiliateLinks,
    handleSetUsers,
    handleSetEvents,
    handleSetEventParticipants,
    handleSetEventSubmissions,
    handleSetWithdrawals,
    handleSetOffers,
    handleSetFinancialJournals,
    gifts,
    handleSetGifts,
    handleAwardEventGift,
    handleRedeemGiftCode
  } = state;

    return (
    <div className={`app-container youtube-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isPageLoading && <div className="top-loading-bar" />}
      {/* Header */}
      <Navbar 
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        genres={allGenres}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
        onLoginClick={() => handleOpenLoginModal('login')}
        onLogout={handleLogout}
        onSubscribeClick={() => setShowPremiumModal(true)}
        onEditProfileClick={handleOpenEditProfile}
        eventParticipants={eventParticipants}
        eventSubmissions={eventSubmissions}
        confirmations={confirmations}
        withdrawals={withdrawals}
        onAdminSubTabChange={handleAdminSubTabChange}
        events={events}
        customRoles={customRoles}
        communities={communities}
      />

      <div className="app-body-wrapper">
        {/* Left Sidebar (Desktop) */}
        {!isMobile && (
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            setSelectedGenre={setSelectedGenre}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            watchlistCount={watchlist.length}
            currentUser={currentUser}
            adminSubTab={adminSubTab}
            setAdminSubTab={handleAdminSubTabChange}
            customRoles={customRoles}
            pendingEventsCount={
              sidebarEvents.filter(e => e.paymentStatus !== 'paid').length +
              sidebarEvents.filter(e => {
                const isDeadlinePassed = e.deadline ? (
                  e.deadline.includes('T')
                    ? new Date().getTime() > new Date(e.deadline).getTime()
                    : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime()
                ) : false;
                return e.budgetMode === 'ranking' && e.paymentStatus === 'paid' && !e.winnersReleased && isDeadlinePassed;
              }).length +
              sidebarParticipants.filter(p => p.status === 'pending').length +
              sidebarSubmissions.filter(s => s.score === null).length
            }
            pendingConfirmationsCount={
              confirmations.filter(c => c.status === 'pending').length +
              sidebarEvents.filter(e => e.paymentStatus === 'pending_verification').length
            }
            pendingWithdrawalsCount={withdrawals.filter(w => w.status === 'pending').length}
          />
        )}

        {/* Main Content Area */}
        <main className="main-content">

          {activeTab === 'admin' && currentUser && ['superadmin', 'staf', 'panitia', 'moderator', 'editor', 'user'].includes(currentUser.role) ? (
            <AdminPanel 
              regions={regions}
              movies={movies} 
              setMovies={handleSetMovies} 
              affiliateLinks={affiliateLinks}
              setAffiliateLinks={handleSetAffiliateLinks}
              gdriveApiKey={gdriveApiKey}
              setGdriveApiKey={setGdriveApiKey}
              whatsappAdmin={whatsappAdmin}
              setWhatsappAdmin={setWhatsappAdmin}
              premiumPrice={premiumPrice}
              setPremiumPrice={setPremiumPrice}
              paymentInstructions={paymentInstructions}
              setPaymentInstructions={setPaymentInstructions}
              users={users}
              setUsers={handleSetUsers}
              confirmations={confirmations}
              setConfirmations={handleSetConfirmations}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
              
              adminSubTab={adminSubTab}
              setAdminSubTab={handleAdminSubTabChange}
              events={events}
              setEvents={handleSetEvents}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              withdrawals={withdrawals}
              setWithdrawals={handleSetWithdrawals}
              offers={offers}
              setOffers={handleSetOffers}
              handleTransferWallet={handleTransferWallet}
              minWithdrawalAmount={minWithdrawalAmount}
              setMinWithdrawalAmount={setMinWithdrawalAmount}
              eventAdminFee={eventAdminFee}
              setEventAdminFee={setEventAdminFee}
              eventFlatFee={eventFlatFee}
              setEventFlatFee={setEventFlatFee}
              withdrawalFeePercent={withdrawalFeePercent}
              setWithdrawalFeePercent={setWithdrawalFeePercent}
              withdrawalFeePercentPremium={withdrawalFeePercentPremium}
              setWithdrawalFeePercentPremium={setWithdrawalFeePercentPremium}
              customRoles={customRoles}
              setCustomRoles={setCustomRoles}
              financialJournals={financialJournals}
              setFinancialJournals={handleSetFinancialJournals}
              communities={communities}
              onKickMember={handleKickMember}
              onApproveMember={handleApproveMember}
              onRejectMember={handleRejectMember}
              onSaveAgenda={handleSaveAgenda}
              gifts={gifts}
              setGifts={handleSetGifts}
              handleAwardEventGift={handleAwardEventGift}
              handleRedeemGiftCode={handleRedeemGiftCode}
            />
          ) : activeTab === 'wallet' ? (
            <WalletUserPortal 
              currentUser={currentUser}
              events={events}
              eventSubmissions={eventSubmissions}
              users={users}
              setUsers={handleSetUsers}
              withdrawals={withdrawals}
              setWithdrawals={handleSetWithdrawals}
              minWithdrawalAmount={minWithdrawalAmount}
              withdrawalFeePercent={withdrawalFeePercent}
              withdrawalFeePercentPremium={withdrawalFeePercentPremium}
              eventParticipants={eventParticipants}
              gifts={gifts}
              setGifts={handleSetGifts}
            />
          ) : activeTab === 'communities' ? (
            <CommunitiesPage 
              communities={communities}
              currentUser={currentUser}
              selectedCommunityId={selectedCommunityId}
              setSelectedCommunityId={setSelectedCommunityId}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
              isRegularUser={currentUser && !(currentUser.isCommunity || currentUser.role === 'panitia')}
              slugify={slugify}
              regions={regions}
              handleOpenLoginModal={handleOpenLoginModal}
              handleOpenEditProfile={handleOpenEditProfile}
              handleTabChange={handleTabChange}
              formatIndonesianDate={formatIndonesianDate}
              setZoomImage={setZoomImage}
              communitySearchQuery={communitySearchQuery}
              setCommunitySearchQuery={setCommunitySearchQuery}
              communityRegionalFilter={communityRegionalFilter}
              setCommunityRegionalFilter={setCommunityRegionalFilter}
              handleApproveMember={handleApproveMember}
              handleRejectMember={handleRejectMember}
              handleSaveAgenda={handleSaveAgenda}
            />
          ) : activeTab === 'profile' ? (
            <ProfilePage 
              currentUser={currentUser}
              communities={communities}
              handleOpenEditProfile={handleOpenEditProfile}
              setShowPremiumModal={setShowPremiumModal}
              handleKickMember={handleKickMember}
              handleApproveMember={handleApproveMember}
              handleRejectMember={handleRejectMember}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
              handleLogout={handleLogout}
              handleTabChange={handleTabChange}
              slugify={slugify}
            />
          ) : activeTab === 'events' ? (
            <EventsUserPortal 
              regions={regions}
              currentUser={currentUser}
              onLoginClick={(mode, role, isLocked) => handleOpenLoginModal(mode, role, isLocked)}
              onLogout={handleLogout}
              onEditProfileClick={handleOpenEditProfile}
              events={events}
              eventParticipants={eventParticipants}
              setEventParticipants={handleSetEventParticipants}
              eventSubmissions={eventSubmissions}
              setEventSubmissions={handleSetEventSubmissions}
              users={users}
              setUsers={handleSetUsers}
              offers={offers}
              setOffers={handleSetOffers}
              communities={communities}
              handleAwardEventGift={handleAwardEventGift}
              renderEventManagement={(onSaveSuccess, autoOpenForm) => (
                <AdminPanel 
                  regions={regions}
                  movies={movies} 
                  setMovies={handleSetMovies} 
                  affiliateLinks={affiliateLinks}
                  setAffiliateLinks={handleSetAffiliateLinks}
                  gdriveApiKey={gdriveApiKey}
                  setGdriveApiKey={setGdriveApiKey}
                  whatsappAdmin={whatsappAdmin}
                  setWhatsappAdmin={setWhatsappAdmin}
                  premiumPrice={premiumPrice}
                  setPremiumPrice={setPremiumPrice}
                  paymentInstructions={paymentInstructions}
                  setPaymentInstructions={setPaymentInstructions}
                  users={users}
                  setUsers={handleSetUsers}
                  currentUser={currentUser}
                  onSaveSettings={handleSaveSettings}
                  
                  adminSubTab="event-manage"
                  setAdminSubTab={() => {}}
                  events={events}
                  setEvents={handleSetEvents}
                  eventParticipants={eventParticipants}
                  setEventParticipants={handleSetEventParticipants}
                  eventSubmissions={eventSubmissions}
                  setEventSubmissions={handleSetEventSubmissions}
                  withdrawals={withdrawals}
                  setWithdrawals={handleSetWithdrawals}
                  offers={offers}
                  setOffers={handleSetOffers}
                  handleTransferWallet={handleTransferWallet}
                  minWithdrawalAmount={minWithdrawalAmount}
                  setMinWithdrawalAmount={setMinWithdrawalAmount}
                  eventAdminFee={eventAdminFee}
                  setEventAdminFee={setEventAdminFee}
                  eventFlatFee={eventFlatFee}
                  setEventFlatFee={setEventFlatFee}
                  withdrawalFeePercent={withdrawalFeePercent}
                  setWithdrawalFeePercent={setWithdrawalFeePercent}
                  withdrawalFeePercentPremium={withdrawalFeePercentPremium}
                  setWithdrawalFeePercentPremium={setWithdrawalFeePercentPremium}
                  customRoles={customRoles}
                  setCustomRoles={setCustomRoles}
                  financialJournals={financialJournals}
                  setFinancialJournals={handleSetFinancialJournals}
                  
                  autoOpenCreateForm={autoOpenForm}
                  onEventCreatedOrUpdated={onSaveSuccess}
                  isEmbedded={true}
                  gifts={gifts}
                  setGifts={handleSetGifts}
                  handleAwardEventGift={handleAwardEventGift}
                  handleRedeemGiftCode={handleRedeemGiftCode}
                />
              )}
            />
          ) : (
            <DiscoverPage 
              activeTab={activeTab}
              currentUser={currentUser}
              movies={movies}
              filteredMovies={getFilteredMovies()}
              visibleMoviesCount={visibleMoviesCount}
              setVisibleMoviesCount={setVisibleMoviesCount}
              allGenres={allGenres}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              filterCountry={filterCountry}
              setFilterCountry={setFilterCountry}
              filterSemi={filterSemi}
              setFilterSemi={setFilterSemi}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              allYears={allYears}
              allCountries={allCountries}
              isLoadingDB={isLoadingDB}
              handleMovieSelect={handleMovieSelect}
              watchlist={watchlist}
              history={history}
              clearHistory={clearHistory}
              selectedMovie={selectedMovie}
              isPlaying={isPlaying}
              affiliateLinks={affiliateLinks}
              gdriveApiKey={gdriveApiKey}
              whatsappAdmin={whatsappAdmin}
              premiumPrice={premiumPrice}
              paymentInstructions={paymentInstructions}
              confirmations={confirmations}
              handleSetConfirmations={handleSetConfirmations}
              handleClosePlayer={handleClosePlayer}
              handleOpenLoginModal={handleOpenLoginModal}
              setShowPremiumModal={setShowPremiumModal}
              slugify={slugify}
              activeFaqIndex={activeFaqIndex}
              setActiveFaqIndex={setActiveFaqIndex}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              events={events}
              eventSubmissions={eventSubmissions}
              communities={communities}
              handleTabChange={handleTabChange}
              users={users}
              handleToggleJoinCommunity={handleToggleJoinCommunity}
            />
          )}
        </main>
      </div>


      {/* Bottom Nav for Mobile */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        setSelectedGenre={setSelectedGenre}
        currentUser={currentUser}
        adminSubTab={adminSubTab}
        onAdminSubTabChange={handleAdminSubTabChange}
        customRoles={customRoles}
      />

      {/* Premium Subscription Modal */}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        currentUser={currentUser}
        confirmations={confirmations}
        setConfirmations={handleSetConfirmations}
        premiumPrice={premiumPrice}
        whatsappAdmin={whatsappAdmin}
        onLoginClick={(mode) => handleOpenLoginModal(mode)}
      />

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && currentUser && (
        <div 
          className="full-page-login-container animate-fade-in" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: 'auto 0', 
            width: '100%', 
            maxWidth: '520px'
          }}>
            <div 
              className="login-card glass-panel" 
              style={{
                width: '100%',
                padding: '32px 28px',
                borderRadius: '16px',
                background: '#020202',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'white' }}>
                  <User size={18} />
                  <span>Edit Profil & Portofolio</span>
                </h3>
                <button 
                  onClick={() => setIsEditProfileModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  const isComm = currentUser.role === 'panitia';
                  if (isComm) {
                    if (!editProfileName.trim() || !editProfilePhone.trim() || !editProfileActiveMembers.trim()) {
                      alert('Nama Komunitas, No. WhatsApp, dan Jumlah Member wajib diisi!');
                      return;
                    }
                  } else {
                    if (!editProfileName.trim() || !editProfilePhone.trim() || !editProfilePortfolio.trim()) {
                      alert('Nama Lengkap, No. WhatsApp, dan Link Portofolio wajib diisi!');
                      return;
                    }
                  }

                  if (!editProfileRegional.trim()) {
                    alert('Lokasi Regional wajib diisi!');
                    return;
                  }

                  setGlobalLoadingText('Sedang menyimpan perubahan profil...');
                  try {
                    const updatedUser = {
                      ...currentUser,
                      organizerName: editProfileName.trim(),
                      organizerPhone: editProfilePhone.trim(),
                      organizerDescription: editProfileDescription.trim(),
                      organizerAvatar: editProfileAvatar.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(editProfileName.trim())}&backgroundColor=262626&textColor=ffffff`,
                      activeMembersCount: isComm ? editProfileActiveMembers.trim() : '',
                      isCommunity: isComm,
                      joinedMembers: currentUser.joinedMembers || [],
                      userCategory: isComm ? 'Videografer' : editProfileCategory,
                      userPortfolio: isComm ? '' : editProfilePortfolio.trim(),
                      activityImages: isComm ? editProfileActivityImages.split(',').map(s => s.trim()).filter(Boolean) : [],
                      
                      facebookHandle: editProfileFacebookHandle.trim(),
                      facebookVerified: editProfileFacebookVerified,
                      tiktokHandle: editProfileTiktokHandle.trim(),
                      tiktokVerified: editProfileTiktokVerified,
                      instagramHandle: editProfileInstagramHandle.trim(),
                      instagramVerified: editProfileInstagramVerified,
                      youtubeHandle: editProfileYoutubeHandle.trim(),
                      youtubeVerified: editProfileYoutubeVerified,
                      userRegional: editProfileRegional.trim()
                    };

                    // Update locally
                    setCurrentUser(updatedUser);
                    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
                    
                    if (isComm) {
                      const existingComm = communities.find(c => c.username.toLowerCase() === currentUser.username.toLowerCase());
                      const updatedComm = {
                        id: currentUser.username,
                        username: currentUser.username,
                        name: updatedUser.organizerName,
                        phone: updatedUser.organizerPhone,
                        description: updatedUser.organizerDescription,
                        avatar: updatedUser.organizerAvatar,
                        activeMembersCount: updatedUser.activeMembersCount,
                        joinedMembers: existingComm ? (existingComm.joinedMembers || []) : [],
                        pendingMembers: existingComm ? (existingComm.pendingMembers || []) : [],
                        activityImages: updatedUser.activityImages || []
                      };
                      
                      let updatedCommunities = [...communities];
                      if (existingComm) {
                        updatedCommunities = communities.map(c => c.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedComm : c);
                      } else {
                        updatedCommunities.push(updatedComm);
                      }
                      await handleSetCommunities(updatedCommunities);
                    }

                    // Save to Firestore if available
                    if (isFirebaseConfigured() && auth) {
                      try {
                        await saveFirestoreUser(updatedUser);
                      } catch (err) {
                        console.error("Failed to update profile in firestore:", err);
                      }
                    }

                    setIsEditProfileModalOpen(false);
                    alert('Profil Anda berhasil diperbarui!');
                  } finally {
                    setGlobalLoadingText(null);
                  }
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {currentUser.role === 'panitia' ? 'Nama Komunitas / Instansi' : 'Nama Lengkap'}
                  </label>
                  <input 
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No. Telepon / WhatsApp</label>
                  <input 
                    type="tel"
                    value={editProfilePhone}
                    onChange={(e) => setEditProfilePhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                  <SearchableSelect 
                    value={editProfileRegional}
                    onChange={setEditProfileRegional}
                    placeholder="Pilih lokasi regional..."
                    options={regions}
                  />
                </div>

                {currentUser.role !== 'panitia' ? (
                  <>
                     <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Keahlian / Kategori (Pilih minimal 1)</label>
                      {(() => {
                        const selectedSkills = editProfileCategory ? editProfileCategory.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const allSkills = [
                          "Videografer", 
                          "Sutradara", 
                          "DOP / Kamerawan", 
                          "Editor Video", 
                          "Animator", 
                          "Motion Designer", 
                          "VFX Artist",
                          "Script Writer", 
                          "Sound Engineer", 
                          "Music Producer",
                          "Colorist",
                          "Content Creator", 
                          "KOL / Influencer", 
                          "Voice Over", 
                          "Presenter / Host",
                          "Aktor / Aktris", 
                          "Model", 
                          "Fotografer", 
                          "Desainer Grafis", 
                          "Penyelenggara Event"
                        ];
                        
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {allSkills.map(skill => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  type="button"
                                  key={skill}
                                  className={`skill-select-pill ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    let newSkills;
                                    if (isSelected) {
                                      newSkills = selectedSkills.filter(s => s !== skill);
                                    } else {
                                      newSkills = [...selectedSkills, skill];
                                    }
                                    setEditProfileCategory(newSkills.join(', '));
                                  }}
                                >
                                  {isSelected && <Check size={13} strokeWidth={2.8} />}
                                  <span>{skill}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Link Portofolio Utama</label>
                      <input 
                        type="url"
                        value={editProfilePortfolio}
                        onChange={(e) => setEditProfilePortfolio(e.target.value)}
                        placeholder="Contoh: https://youtube.com/@channelAnda"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Jumlah Anggota / Member Aktif</label>
                    <input 
                      type="number"
                      value={editProfileActiveMembers}
                      onChange={(e) => setEditProfileActiveMembers(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Deskripsi Singkat / Bio (Opsional)</label>
                  <textarea 
                    value={editProfileDescription}
                    onChange={(e) => setEditProfileDescription(e.target.value)}
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.9rem',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {currentUser?.role === 'panitia' && (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Foto Kegiatan / Dokumentasi Prestasi (URL Gambar, pisahkan dengan koma)</label>
                    <textarea 
                      value={editProfileActivityImages}
                      onChange={(e) => setEditProfileActivityImages(e.target.value)}
                      placeholder="Contoh: https://link1.com/img.jpg, https://link2.com/img.jpg"
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        resize: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Avatar / Logo (Opsional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {editProfileAvatar ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                          src={editProfileAvatar} 
                          alt="Preview" 
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 255, 255, 0.2)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditProfileAvatar('')}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        border: '1px dashed var(--border-color)'
                      }}>
                        No Img
                      </div>
                    )}
                    <label style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Pilih Foto
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 500 * 1024) {
                              alert("Ukuran file maksimal adalah 500 KB!");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditProfileAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Social Media Accounts Verification Section */}
                {currentUser.role !== 'panitia' && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>Akun Sosial Media Terverifikasi</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Wajib diverifikasi jika Anda ingin berpartisipasi dalam event kompetisi.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                      {[
                        { id: 'facebook', label: 'Facebook', handle: editProfileFacebookHandle, setHandle: setEditProfileFacebookHandle, verified: editProfileFacebookVerified, setVerified: setEditProfileFacebookVerified, color: '#1877f2' },
                        { id: 'tiktok', label: 'TikTok', handle: editProfileTiktokHandle, setHandle: setEditProfileTiktokHandle, verified: editProfileTiktokVerified, setVerified: setEditProfileTiktokVerified, color: '#00f2fe' },
                        { id: 'instagram', label: 'Instagram', handle: editProfileInstagramHandle, setHandle: setEditProfileInstagramHandle, verified: editProfileInstagramVerified, setVerified: setEditProfileInstagramVerified, color: '#e1306c' },
                        { id: 'youtube', label: 'YouTube', handle: editProfileYoutubeHandle, setHandle: setEditProfileYoutubeHandle, verified: editProfileYoutubeVerified, setVerified: setEditProfileYoutubeVerified, color: '#ff0000' }
                      ].map(platform => {
                        const isVerifying = verifyingPlatform === platform.id;
                        
                        return (
                          <div key={platform.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '12px' }}>
                            {isVerifying ? (
                              /* Active verification box */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: platform.color, textTransform: 'uppercase' }}>Verifikasi {platform.label}</span>
                                
                                {verificationStep === 'input' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input 
                                      type="text" 
                                      placeholder={`Masukkan username / handle ${platform.label}`}
                                      value={socialUrl}
                                      onChange={(e) => setSocialUrl(e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', background: '#020202', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerifyingPlatform(null)}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Batal</button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const val = socialUrl.trim();
                                          if (!val) { alert('Masukkan username!'); return; }
                                          if (val.includes(' ')) { alert('Username tidak boleh ada spasi!'); return; }
                                          const code = `NGONTEN-${Math.floor(1000 + Math.random() * 9000)}`;
                                          setUniqueCode(code);
                                          setVerificationStep('verify');
                                          setTimerSeconds(180);
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Lanjut</button>
                                    </div>
                                  </div>
                                )}

                                {verificationStep === 'verify' && (
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                     <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                       Salin kode unik di bawah ini dan tempelkan di bio profil <strong>{platform.label}</strong> Anda:
                                     </p>
                                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                       <div style={{ flex: 1, padding: '8px', background: '#111', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>
                                         {uniqueCode}
                                       </div>
                                       <button
                                         type="button"
                                         onClick={() => {
                                           navigator.clipboard.writeText(uniqueCode);
                                           setIsCopied(true);
                                           setTimeout(() => setIsCopied(false), 2000);
                                         }}
                                         className="btn btn-secondary"
                                         style={{ 
                                           height: '38px', 
                                           padding: '0 14px', 
                                           fontSize: '0.75rem', 
                                           whiteSpace: 'nowrap', 
                                           display: 'flex', 
                                           alignItems: 'center', 
                                           gap: '6px',
                                           transition: 'all 0.2s ease',
                                           backgroundColor: isCopied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                           borderColor: isCopied ? '#10b981' : 'var(--border-color)',
                                           color: '#fff'
                                         }}
                                       >
                                         {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                         {isCopied ? 'Tersalin!' : 'Salin'}
                                       </button>
                                     </div>
                                     <div style={{ fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
                                      Waktu tersisa: {Math.floor(timerSeconds / 60)}:{( '0' + (timerSeconds % 60) ).slice(-2)}
                                    </div>
                                    {verificationError && (
                                      <div style={{ color: '#f87171', fontSize: '0.75rem', lineHeight: '1.4' }}>{verificationError}</div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerificationStep('input')}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Kembali</button>
                                      <button 
                                        type="button" 
                                        onClick={async () => {
                                          setVerificationStep('loading');
                                          setVerificationError('');
                                          const result = await handleCheckProfileSocialMedia(platform.id, socialUrl, uniqueCode);
                                          if (result && result.status === 'approved') {
                                            const cleanUser = socialUrl.trim().startsWith('@') ? socialUrl.trim().substring(1) : socialUrl.trim();
                                            platform.setHandle(cleanUser);
                                            platform.setVerified(true);
                                            
                                            const updatedUser = {
                                              ...currentUser,
                                              [`${platform.id}Handle`]: cleanUser,
                                              [`${platform.id}Verified`]: true
                                            };
                                            setCurrentUser(updatedUser);
                                            setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
                                            
                                            if (isFirebaseConfigured() && auth) {
                                              try {
                                                await saveFirestoreUser(updatedUser);
                                              } catch (err) {
                                                console.error("Failed to auto-save verified social handle:", err);
                                              }
                                            }
                                            
                                            setVerifyingPlatform(null);
                                            alert(`Verifikasi ${platform.label} berhasil dan tersimpan secara otomatis!`);
                                          } else {
                                            setVerificationError(`Gagal memverifikasi. Pastikan kode unik ${uniqueCode} sudah ditempel di bio profil Anda.`);
                                            setVerificationStep('failed');
                                          }
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Cek Akun</button>
                                    </div>
                                  </div>
                                )}

                                {verificationStep === 'loading' && (
                                  <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Mengecek bio profil Anda, silakan tunggu...
                                  </div>
                                )}

                                {(verificationStep === 'failed' || verificationStep === 'expired') && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#f87171', lineHeight: '1.4' }}>
                                      {verificationStep === 'expired' ? 'Waktu verifikasi habis.' : (verificationError || 'Verifikasi gagal dilakukan.')}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setVerifyingPlatform(null)}
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Batal</button>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setVerificationStep('input');
                                          setVerificationError('');
                                        }}
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                      >Coba Lagi</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Standard state */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>{platform.label}</span>
                                    {platform.verified ? (
                                      <>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{platform.handle}</span>
                                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.2)', fontWeight: '600' }}>Terverifikasi</span>
                                      </>
                                    ) : (
                                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600' }}>Belum Terhubung</span>
                                    )}
                                  </div>
                                  {platform.verified ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Ubah akun ${platform.label}? Anda harus memverifikasi ulang akun baru nantinya.`)) {
                                          platform.setHandle('');
                                          platform.setVerified(false);
                                        }
                                      }}
                                      style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                    >
                                      Ubah
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVerifyingPlatform(platform.id);
                                        setSocialUrl('');
                                        setVerificationStep('input');
                                        setVerificationError('');
                                      }}
                                      style={{ background: 'white', border: 'none', color: 'black', fontSize: '0.75rem', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}
                                    >
                                      Hubungkan
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '10px' }}>
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login / Register Modal - Restructured to Full Page */}
       {isLoginModalOpen && (
        <div 
          className="full-page-login-container animate-fade-in" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100000,
            background: '#020202',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px 120px 16px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: 'auto 0', 
            width: '100%', 
            maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px'
          }}>
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="ngonten.id" style={{ height: '60px', objectFit: 'contain' }} />
          </div>

          {/* Login Card */}
          <div 
            className="login-card glass-panel" 
            style={{
              width: '100%',
              maxWidth: loginModalMode === 'register' && registerRole === 'panitia' ? '680px' : '400px',
              padding: '32px 28px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
                <User size={18} className="accent-text" style={{ color: 'var(--text-primary)' }} />
                <span>{loginModalMode === 'login' ? 'Masuk Akun' : 'Daftar Akun Baru'}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                  setLoginUsername('');
                  setLoginPassword('');
                  setRegisterConfirmPassword('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Tutup & Kembali"
              >
                <X size={20} />
              </button>
            </div>

            {/* Login / Register Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('login'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'login' ? '2px solid var(--primary)' : 'none', color: loginModalMode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Masuk
              </button>
              <button 
                type="button"
                onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', borderBottom: loginModalMode === 'register' ? '2px solid var(--primary)' : 'none', color: loginModalMode === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Daftar
              </button>
            </div>

            <form onSubmit={loginModalMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loginError && (
                <div className="form-error-banner" style={{ margin: '0 0 12px 0' }}>
                  <AlertTriangle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              {loginModalMode === 'login' ? (
                <>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Email / Username</label>
                    <input 
                      type="text"
                      id="loginUsername" 
                      ref={usernameInputRef}
                      placeholder="Masukkan email atau username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="loginPassword" 
                        placeholder="Masukkan password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // REGISTER MODE: SPLIT FORM (USER VS COMMUNITY)
                registerRole === 'panitia' ? (
                  // TWO COLUMNS FOR COMMUNITY/INSTANSI REGISTER
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
                    {/* Left Column: Account Details & Role Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Alamat Email</label>
                        <input 
                          type="email"
                          id="loginUsername" 
                          ref={usernameInputRef}
                          placeholder="Masukkan alamat email aktif"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            id="loginPassword" 
                            placeholder="Masukkan password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            id="registerConfirm" 
                            placeholder="Konfirmasi password Anda"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="registerRole" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Daftar Sebagai</label>
                        <select
                          id="registerRole"
                          value={registerRole}
                          onChange={(e) => setRegisterRole(e.target.value)}
                          disabled={loginModalLockedRole !== null}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: loginModalLockedRole !== null ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: loginModalLockedRole !== null ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: loginModalLockedRole !== null ? 'not-allowed' : 'default'
                          }}
                        >
                          <option value="user" style={{ background: '#020202' }}>User / Kreator</option>
                          <option value="panitia" style={{ background: '#020202' }}>Komunitas / Instansi</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                        <SearchableSelect 
                          value={registerRegional}
                          onChange={setRegisterRegional}
                          placeholder="Pilih lokasi regional..."
                          options={regions}
                        />
                      </div>
                    </div>

                    {/* Right Column: Community Details (Required) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px dashed rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerName" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Nama Komunitas / Instansi</label>
                        <input 
                          type="text" 
                          id="organizerName"
                          placeholder="Nama penyelenggara / komunitas"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerPhone" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No. Telepon / WhatsApp</label>
                        <input 
                          type="tel" 
                          id="organizerPhone"
                          placeholder="Contoh: 08123456789"
                          value={organizerPhone}
                          onChange={(e) => setOrganizerPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="activeMembersCount" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Jumlah Anggota / Member Aktif</label>
                        <input 
                          type="number" 
                          id="activeMembersCount"
                          placeholder="Contoh: 25"
                          value={activeMembersCount}
                          onChange={(e) => setActiveMembersCount(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="organizerDescription" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Deskripsi Singkat Komunitas (Opsional)</label>
                        <textarea 
                          id="organizerDescription"
                          rows="2"
                          placeholder="Tuliskan deskripsi singkat komunitas Anda..."
                          value={organizerDescription}
                          onChange={(e) => setOrganizerDescription(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem',
                            resize: 'none',
                            fontFamily: 'inherit',
                            height: '56px'
                          }}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Upload Logo Komunitas (Opsional)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {organizerAvatar ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img 
                                src={organizerAvatar} 
                                alt="Preview" 
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid rgba(255, 255, 255, 0.2)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setOrganizerAvatar('')}
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              border: '1px dashed var(--border-color)'
                            }}>
                              No Img
                            </div>
                          )}
                          <label style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px dashed rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                          >
                            Pilih Logo
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SINGLE COLUMN FOR USER / KREATOR REGISTER (EMAIL & PASSWORD ONLY)
                  <>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="loginUsername" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Alamat Email</label>
                      <input 
                        type="email"
                        id="loginUsername" 
                        ref={usernameInputRef}
                        placeholder="Masukkan alamat email aktif"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="loginPassword" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="loginPassword" 
                          placeholder="Masukkan password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="registerConfirm" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          id="registerConfirm" 
                          placeholder="Konfirmasi password Anda"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="registerRole" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Daftar Sebagai</label>
                      <select
                        id="registerRole"
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        disabled={loginModalLockedRole !== null}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: loginModalLockedRole !== null ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: loginModalLockedRole !== null ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          cursor: loginModalLockedRole !== null ? 'not-allowed' : 'default'
                        }}
                      >
                        <option value="user" style={{ background: '#020202' }}>User / Kreator</option>
                        <option value="panitia" style={{ background: '#020202' }}>Komunitas / Instansi</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Lokasi Regional</label>
                      <SearchableSelect 
                        value={registerRegional}
                        onChange={setRegisterRegional}
                        placeholder="Pilih lokasi regional..."
                        options={regions}
                      />
                    </div>
                  </>
                )
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px' }}>
                <span>{loginModalMode === 'login' ? 'Masuk' : 'Daftar Sekarang'}</span>
              </button>

              {isFirebaseConfigured() && auth && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>atau</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--primary-glow)',
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--border-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--primary-glow)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.53l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Masuk dengan Google</span>
                  </button>
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem' }}>
                {loginModalMode === 'login' ? (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Belum punya akun?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setLoginModalMode('register'); setLoginError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                    >
                      Daftar Baru
                    </button>
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Sudah memiliki akun?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setLoginModalMode('login'); setLoginError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                    >
                      Masuk disini
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
          
          {/* Back to Home Link */}
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setLoginError('');
              setLoginUsername('');
              setLoginPassword('');
              setRegisterConfirmPassword('');
            }}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <span>← Kembali ke Beranda</span>
          </button>
          </div>
        </div>
      )}


      {/* Global Loading Overlay */}
      {globalLoadingText && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            gap: '16px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 254, 0.15)',
            borderTop: '4px solid #fffffe',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span className="badge" style={{ color: '#fffffe', fontSize: '1.05rem', fontWeight: '600', letterSpacing: '0.5px' }}>
            {globalLoadingText}
          </span>
        </div>
      )}

      {/* Lightbox Image Zoom Overlay */}
      {zoomImage && (
        <div 
          className="lightbox-overlay"
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            cursor: 'zoom-out'
          }}
        >
          <button 
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            ✕
          </button>
          <img 
            className="lightbox-image"
            src={zoomImage} 
            alt="Kegiatan Zoom" 
            style={{
              maxWidth: '90%',
              maxHeight: '85%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          />
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className={`custom-toast ${toast.type || 'success'}`}>
          <div className="custom-toast-icon">
            {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div style={{ flex: 1 }}>
            <p className="custom-toast-message">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="custom-toast-close"
          >
            ✕
          </button>
        </div>
      )}

      {/* PWA Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

