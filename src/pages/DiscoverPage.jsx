import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  Trash2, 
  Tag, 
  Flag, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Film, 
  ChevronDown, 
  DollarSign, 
  Clock, 
  Award, 
  HelpCircle, 
  Briefcase,
  Users,
  Tv,
  TrendingUp
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';

export default function DiscoverPage({
  activeTab,
  currentUser,
  movies,
  filteredMovies,
  visibleMoviesCount,
  setVisibleMoviesCount,
  allGenres,
  selectedGenre,
  setSelectedGenre,
  filterYear,
  setFilterYear,
  filterCountry,
  setFilterCountry,
  filterSemi,
  setFilterSemi,
  isFilterOpen,
  setIsFilterOpen,
  allYears,
  allCountries,
  isLoadingDB,
  handleMovieSelect,
  watchlist,
  history,
  clearHistory,
  selectedMovie,
  isPlaying,
  affiliateLinks,
  gdriveApiKey,
  whatsappAdmin,
  premiumPrice,
  paymentInstructions,
  confirmations,
  handleSetConfirmations,
  handleClosePlayer,
  handleOpenLoginModal,
  setShowPremiumModal,
  slugify,
  activeFaqIndex,
  setActiveFaqIndex,
  searchQuery,
  setSearchQuery,
  events,
  eventSubmissions,
  communities,
  handleTabChange,
  users,
  handleToggleJoinCommunity
}) {
  
  const isPlayRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/play/');

  if (isPlayRoute && (!selectedMovie || !isPlaying)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '75vh', 
        gap: '20px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(255,255,255,0.03)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <span style={{ fontSize: '0.95rem', fontWeight: '500', letterSpacing: '0.5px' }}>
          Menyiapkan Pemutar Video...
        </span>
      </div>
    );
  }

  if (selectedMovie && isPlaying) {
    return (
      /* YOUTUBE WATCH PAGE LAYOUT */
      <div className="watch-page-layout animate-fade-in">
        {/* Left Column: Player & Detail Info */}
        <div className="watch-main-column">
          <VideoPlayer 
            movie={selectedMovie} 
            affiliateLinks={affiliateLinks}
            gdriveApiKey={gdriveApiKey}
            whatsappAdmin={whatsappAdmin}
            premiumPrice={premiumPrice}
            paymentInstructions={paymentInstructions}
            currentUser={currentUser}
            confirmations={confirmations}
            setConfirmations={handleSetConfirmations}
            onClose={handleClosePlayer} 
            onLoginClick={(mode) => handleOpenLoginModal(mode)}
            onSubscribeClick={() => setShowPremiumModal(true)}
          />

          <div className="watch-video-details">
            <div className="watch-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
              <h1 className="watch-title" style={{ margin: 0 }}>{selectedMovie.title}</h1>
            </div>
            
            {/* YouTube Styled Video Description Box */}
            <div className="watch-description-box glass-panel">
              <div className="desc-meta">
                <span className="desc-views-count">
                  <Eye size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {selectedMovie.views.toLocaleString('id-ID')} ditonton
                </span>
                <span className="desc-date">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {selectedMovie.year}
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {selectedMovie.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'discover' && searchQuery) {
    return (
      /* UNIFIED SEARCH RESULTS VIEW */
      <div className="search-results-wrapper">
        <div className="search-results-header">
          <h2>Hasil Pencarian: "{searchQuery}"</h2>
          <button 
            className="btn btn-outline" 
            onClick={() => setSearchQuery('')}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.8rem' }}
          >
            <X size={14} style={{ marginRight: '4px' }} />
            <span>Bersihkan Pencarian</span>
          </button>
        </div>

        {/* Category 1: Film & Video */}
        {(() => {
          const results = movies.filter(m => 
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          if (results.length === 0) return null;
          return (
            <div className="search-category-section">
              <h3 className="search-category-title">Film & Video ({results.length})</h3>
              <div className="movie-grid youtube-grid">
                {results.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    currentUser={currentUser}
                    onSelect={handleMovieSelect}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Category 2: Event & Kompetisi */}
        {(() => {
          const results = events.filter(e => 
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (e.description || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (results.length === 0) return null;
          return (
            <div className="search-category-section">
              <h3 className="search-category-title">Event & Kompetisi ({results.length})</h3>
              <div className="split-list">
                {results.map(evt => {
                  const eventSlug = slugify(evt.title) + '-' + evt.id;
                  return (
                    <div 
                      key={evt.id} 
                      className="split-card"
                      onClick={() => {
                        if (!currentUser) {
                          handleOpenLoginModal('register');
                          return;
                        }
                        window.history.pushState(null, '', '/event/' + eventSlug);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="split-card-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{evt.title}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 'bold'
                          }}>
                            {evt.eventType === 'competition' ? 'Kompetisi' : 'Event'}
                          </span>
                        </span>
                        <div className="split-card-meta">
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <Calendar size={13} style={{ marginRight: '5px', opacity: 0.6 }} />
                            <span>{evt.date || evt.deadline || 'Segera'}</span>
                          </span>
                          {evt.location && (
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <MapPin size={13} style={{ marginRight: '5px', opacity: 0.6 }} />
                              <span>{evt.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="split-card-link-text">Lihat →</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Category 3: Komunitas & PH */}
        {(() => {
          const results = communities.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.username.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (results.length === 0) return null;
          return (
            <div className="search-category-section">
              <h3 className="search-category-title">Komunitas & Production House ({results.length})</h3>
              <div className="recruiting-grid">
                {results.map(comm => {
                  const members = comm.joinedMembers || [];
                  const target = Number(comm.activeMembersCount || 0);
                  const current = members.length;
                  const percentage = target > 0 ? (current / target) * 100 : 0;
                  const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;
                  
                  return (
                    <div 
                      key={comm.id} 
                      className="recruiting-card glass-panel"
                      onClick={() => {
                        if (!currentUser) {
                          handleOpenLoginModal('register');
                          return;
                        }
                        window.history.pushState(null, '', '/community/' + commSlug);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', textAlign: 'left' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                          {comm.avatar ? (
                            <img src={comm.avatar} alt={comm.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            comm.name?.charAt(0) || comm.username?.charAt(0)
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'white', display: 'block' }}>{comm.name || comm.username}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{members.length} Anggota</span>
                        </div>
                      </div>
                      <span className="split-card-link-text" style={{ flexShrink: 0, fontWeight: 'bold', fontSize: '0.88rem' }}>
                        Lihat Komunitas →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Category 4: Kreator & Talent */}
        {(() => {
          const results = users.filter(u => 
            u.role !== 'superadmin' && u.role !== 'staf' && !u.isCommunity &&
            (u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (u.organizerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             (u.userCategory || '').toLowerCase().includes(searchQuery.toLowerCase()))
          );
          if (results.length === 0) return null;
          return (
            <div className="search-category-section">
              <h3 className="search-category-title">Kreator & Talent ({results.length})</h3>
              <div className="creators-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {results.map(creator => (
                  <div 
                    key={creator.id} 
                    className="creator-card glass-panel"
                    onClick={() => {
                      alert(`Profil Portofolio Kreator ${creator.organizerName || creator.username} akan segera hadir.`);
                    }}
                  >
                    <div className="creator-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 auto 12px auto', overflow: 'hidden' }}>
                      {creator.organizerAvatar ? (
                        <img src={creator.organizerAvatar} alt={creator.organizerName || creator.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (creator.organizerName || creator.username).charAt(0)
                      )}
                    </div>
                    <div style={{ textalign: 'center' }}>
                      <strong style={{ display: 'block', color: 'white', fontSize: '0.95rem' }}>{creator.organizerName || creator.username}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                        {creator.userCategory || 'Kreator Digital'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Empty Search State */}
        {(() => {
          const mResults = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
          const eResults = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
          const cResults = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
          const kResults = users.filter(u => u.role !== 'superadmin' && u.role !== 'staf' && !u.isCommunity && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
          if (mResults.length === 0 && eResults.length === 0 && cResults.length === 0 && kResults.length === 0) {
            return (
              <div className="empty-state glass-panel" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Tidak ada hasil pencarian yang cocok untuk "{searchQuery}".
                <button 
                  className="btn btn-primary"
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: '16px' }}
                >
                  Kembali ke Beranda
                </button>
              </div>
            );
          }
          return null;
        })()}
      </div>
    );
  }

  // Check if we render the Landing Page / Dashboard view
  const isDefaultDiscover = activeTab === 'discover' && !selectedGenre && filterYear === 'Semua' && filterCountry === 'Semua' && filterSemi === 'Sembunyikan';

  if (isDefaultDiscover) {
    return (
      <div className="dashboard-container">
              {/* 1. Hero Header / CTA Banner */}
              <div className="dashboard-hero">
                <div className="dashboard-hero-content animate-fade-in">
                  <h1 className="dashboard-hero-title">Satu Platform,<br />Solusi Industri Kreatif</h1>
                  <p className="dashboard-hero-subtitle">
                    Bergabung sekarang dan temukan solusi kebutuhan kreatif Anda. Kreator dapat mengikuti kampanye untuk mendapat penghasilan, sedangkan brand dapat membuat kampanye untuk menemukan talenta terbaik secara cepat.
                  </p>
                  <div className="dashboard-hero-ctas">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        if (!currentUser) {
                          handleOpenLoginModal('register');
                        } else {
                          handleTabChange('events');
                        }
                      }}
                      style={{ borderRadius: '30px', padding: '14px 36px', fontWeight: 'bold', fontSize: '0.95rem' }}
                    >
                      {!currentUser ? 'Gabung Sekarang' : 'Jelajahi Event & Kompetisi'}
                    </button>
                  </div>

                  {/* Stats Counter Rows */}
                  <div className="dashboard-stats-row">
                    <div className="stat-item">
                      <span className="stat-number">15+</span>
                      <span className="stat-label">Karya Digital Pilihan</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">Rp 250Jt+</span>
                      <span className="stat-label">Hadiah Lomba</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">50+</span>
                      <span className="stat-label">PH & Studio Kreatif</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">5.000+</span>
                      <span className="stat-label">Kreator Terdaftar</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Film Baru Rilis */}
              <div id="new-releases-section" className="dashboard-section animate-fade-in">
                <div className="dashboard-section-header">
                  <div className="dashboard-section-title-wrapper">
                    <h3>
                      <Tv size={20} />
                      <span>Showcase Karya Kreatif Pilihan</span>
                    </h3>
                    <p>Kumpulan karya digital orisinal (desain, foto, video, animasi) terbaik dari kreator lokal potensial.</p>
                  </div>
                </div>
                <div className="movie-grid youtube-grid">
                  {[...movies]
                    .sort((a, b) => b.year - a.year)
                    .slice(0, 4)
                    .map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        currentUser={currentUser}
                        onSelect={handleMovieSelect}
                      />
                    ))}
                </div>
              </div>

              <div className="section-divider"></div>

              {/* 3. Event & Kompetisi Grid */}
              <div className="dashboard-split-grid animate-fade-in">
                {/* Upcoming Events */}
                <div className="split-column">
                  <div className="dashboard-section-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <div className="dashboard-section-title-wrapper">
                      <h4 className="split-column-title">
                        <Calendar size={18} />
                        <span>Event & Hubungan Komunitas</span>
                      </h4>
                      <p style={{ margin: 0 }}>Ikuti workshop, sharing session, dan kegiatan kolaborasi antarkreator digital.</p>
                    </div>
                  </div>
                  <div className="split-list" style={{ marginTop: '12px' }}>
                    {events.filter(e => {
                      const isRegular = e.eventType === 'regular' || !e.eventType;
                      if (!isRegular) return false;
                      if (e.deadline) {
                        const isDeadlinePassed = e.deadline.includes('T')
                          ? new Date().getTime() > new Date(e.deadline).getTime()
                          : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime();
                        if (isDeadlinePassed) return false;
                      }
                      return true;
                    }).length > 0 ? (
                      events
                        .filter(e => {
                          const isRegular = e.eventType === 'regular' || !e.eventType;
                          if (!isRegular) return false;
                          if (e.deadline) {
                            const isDeadlinePassed = e.deadline.includes('T')
                              ? new Date().getTime() > new Date(e.deadline).getTime()
                              : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime();
                            if (isDeadlinePassed) return false;
                          }
                          return true;
                        })
                        .slice(0, 3)
                        .map(evt => {
                          const eventSlug = slugify(evt.title) + '-' + evt.id;
                          return (
                            <div 
                              key={evt.id} 
                              className="split-card"
                              onClick={() => {
                                if (!currentUser) {
                                  handleOpenLoginModal('register');
                                  return;
                                }
                                window.history.pushState(null, '', '/event/' + eventSlug);
                                window.dispatchEvent(new PopStateEvent('popstate'));
                              }}
                            >
                              <div className="split-card-info">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    background: 'rgba(244, 114, 182, 0.1)',
                                    color: '#f472b6'
                                  }}>
                                    {evt.category || 'Event'}
                                  </span>
                                </div>
                                <span className="split-card-name">{evt.title}</span>
                                <span className="split-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '6px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <Calendar size={13} style={{ marginRight: '6px', opacity: 0.7 }} />
                                    <span>{evt.date ? new Date(evt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Segera'}</span>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <MapPin size={13} style={{ marginRight: '6px', opacity: 0.7 }} />
                                    <span>{evt.location || 'Online'}</span>
                                  </span>
                                </span>
                              </div>
                              <span className="split-card-link-text">Lihat Event →</span>
                            </div>
                          );
                        })
                    ) : (
                      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Belum ada jadwal event terdekat. Ikuti terus pembaruannya!
                      </div>
                    )}
                  </div>
                </div>

                {/* Open Competitions */}
                <div className="split-column">
                  <div className="dashboard-section-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <div className="dashboard-section-title-wrapper">
                      <h4 className="split-column-title">
                        <Award size={18} />
                        <span>Kompetisi & Lomba Kreatif</span>
                      </h4>
                      <p style={{ margin: 0 }}>Ikuti tantangan dari brand nasional, tunjukkan keahlian Anda, dan dapatkan hadiah uang tunai.</p>
                    </div>
                  </div>
                  <div className="split-list" style={{ marginTop: '12px' }}>
                    {events.filter(e => {
                      const isComp = e.eventType === 'competition';
                      if (!isComp) return false;
                      if (e.deadline) {
                        const isDeadlinePassed = e.deadline.includes('T')
                          ? new Date().getTime() > new Date(e.deadline).getTime()
                          : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime();
                        if (isDeadlinePassed) return false;
                      }
                      if (e.budgetMode === 'views') {
                        const initialBudget = e.campaignBudget || 0;
                        const eventSubs = eventSubmissions.filter(s => s.eventId === e.id);
                        const totalPayout = eventSubs.reduce((sum, sub) => {
                          const views = sub.views || 0;
                          const step = e.benefitViewsStep || 1000;
                          const minViews = e.minEarningViews || 0;
                          const amount = e.benefitAmount || 0;
                          const payout = views >= minViews ? Math.floor(views / step) * amount : 0;
                          return sum + payout;
                        }, 0);
                        if (initialBudget - totalPayout <= 0) return false;
                      }
                      return true;
                    }).length > 0 ? (
                      events
                        .filter(e => {
                          const isComp = e.eventType === 'competition';
                          if (!isComp) return false;
                          if (e.deadline) {
                            const isDeadlinePassed = e.deadline.includes('T')
                              ? new Date().getTime() > new Date(e.deadline).getTime()
                              : new Date().getTime() > new Date(e.deadline + 'T23:59:59').getTime();
                            if (isDeadlinePassed) return false;
                          }
                          if (e.budgetMode === 'views') {
                            const initialBudget = e.campaignBudget || 0;
                            const eventSubs = eventSubmissions.filter(s => s.eventId === e.id);
                            const totalPayout = eventSubs.reduce((sum, sub) => {
                              const views = sub.views || 0;
                              const step = e.benefitViewsStep || 1000;
                              const minViews = e.minEarningViews || 0;
                              const amount = e.benefitAmount || 0;
                              const payout = views >= minViews ? Math.floor(views / step) * amount : 0;
                              return sum + payout;
                            }, 0);
                            if (initialBudget - totalPayout <= 0) return false;
                          }
                          return true;
                        })
                        .slice(0, 3)
                        .map(evt => {
                          const eventSlug = slugify(evt.title) + '-' + evt.id;
                          return (
                            <div 
                              key={evt.id} 
                              className="split-card"
                              onClick={() => {
                                if (!currentUser) {
                                  handleOpenLoginModal('register');
                                  return;
                                }
                                window.history.pushState(null, '', '/event/' + eventSlug);
                                window.dispatchEvent(new PopStateEvent('popstate'));
                              }}
                            >
                              <div className="split-card-info">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    background: evt.juknisPlatforms?.GoogleReview ? 'rgba(74, 222, 128, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                                    color: evt.juknisPlatforms?.GoogleReview ? '#4ade80' : '#60a5fa'
                                  }}>
                                    {evt.juknisPlatforms?.GoogleReview ? 'Google Review' : evt.category || 'Kompetisi'}
                                  </span>
                                </div>
                                <span className="split-card-name">{evt.title}</span>
                                <span className="split-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '8px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', color: '#4ade80', fontWeight: '800', fontSize: '1.05rem' }}>
                                    <DollarSign size={15} style={{ marginRight: '2px', opacity: 0.9 }} />
                                    <span>Rp {(evt.campaignBudget || 0).toLocaleString('id-ID')}</span>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#f87171', fontWeight: '600' }}>
                                    <Clock size={13} style={{ marginRight: '5px', opacity: 0.8 }} />
                                    <span>Batas: {evt.deadline ? new Date(evt.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Segera'}</span>
                                  </span>
                                </span>
                              </div>
                              <span className="split-card-link-text">Ikuti Lomba →</span>
                            </div>
                          );
                        })
                    ) : (
                      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Kompetisi baru akan segera hadir. Siapkan ide karyamu!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="section-divider"></div>

              {/* 4. Komunitas / PH Merekrut */}
              <div className="dashboard-section animate-fade-in">
                <div className="dashboard-section-header">
                  <div className="dashboard-section-title-wrapper">
                    <h3>
                      <Briefcase size={20} />
                      <span>Komunitas & Production House</span>
                    </h3>
                    <p>Bergabunglah dengan komunitas atau Production House untuk berkolaborasi dalam proyek baru.</p>
                  </div>
                  <span 
                    className="dashboard-section-link"
                    onClick={() => handleTabChange('communities')}
                  >
                    Cari Komunitas Lain →
                  </span>
                </div>
                <div className="recruiting-grid">
                  {communities.slice(0, 4).map(comm => {
                    const members = comm.joinedMembers || [];
                    const target = Number(comm.activeMembersCount || 0);
                    const current = members.length;
                    const percentage = target > 0 ? (current / target) * 100 : 0;
                    const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;
                    
                    return (
                      <div 
                        key={comm.id} 
                        className="recruiting-card glass-panel"
                        onClick={() => {
                          if (!currentUser) {
                            handleOpenLoginModal('register');
                            return;
                          }
                          window.history.pushState(null, '', '/community/' + commSlug);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                      >
                        {/* 1. Left Block: Avatar & Name */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', textAlign: 'left', minWidth: '220px', flex: '1.2' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                            {comm.avatar ? (
                              <img src={comm.avatar} alt={comm.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              comm.name?.charAt(0) || comm.username?.charAt(0)
                            )}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={comm.name || comm.username}>
                              {comm.name || comm.username}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Kategori: Agensi / Komunitas</span>
                          </div>
                        </div>

                        {/* 2. Middle Block: Recruitment & Positions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px', flex: '1.5' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="recruiting-badge" style={{ margin: 0 }}>OPEN RECRUITMENT</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{members.length} Crew</span>
                          </div>
                          <div className="recruiting-positions" style={{ marginTop: 0 }}>
                            <span className="position-badge">Desainer</span>
                            <span className="position-badge">Fotografer</span>
                            <span className="position-badge">Videografer</span>
                            <span className="position-badge">Animator</span>
                          </div>
                        </div>

                        {/* 3. Strength Block: Crew Progress */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', flex: '1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>Kekuatan Crew:</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{current}/{target}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--primary-glow)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, percentage)}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                          </div>
                        </div>

                        {/* 4. Right Block: Action Link */}
                        <span className="split-card-link-text" style={{ flexShrink: 0, fontWeight: 'bold', fontSize: '0.88rem' }}>
                          Lihat Komunitas →
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-divider"></div>

              {/* 5. Kreator Naik Daun */}
              <div className="dashboard-section animate-fade-in">
                <div className="dashboard-section-header">
                  <div className="dashboard-section-title-wrapper">
                    <h3>
                      <TrendingUp size={20} />
                      <span>Kreator Populer Pekan Ini</span>
                    </h3>
                    <p>Apresiasi bagi desainer, animator, editor, dan talent kreatif yang aktif berkarya di platform kami.</p>
                  </div>
                </div>
                <div className="creators-grid">
                  {(users.filter(u => u.role !== 'superadmin' && u.role !== 'staf' && !u.isCommunity).slice(0, 5).length > 0 ? 
                    users.filter(u => u.role !== 'superadmin' && u.role !== 'staf' && !u.isCommunity).slice(0, 5).map(u => ({
                      id: u.id,
                      username: u.username,
                      name: u.organizerName || u.username,
                      userCategory: u.userCategory || 'Kreator Digital',
                      avatar: u.organizerAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`
                    })) : [
                      { id: 'c1', username: 'andikapra', name: 'Andika Pratama', userCategory: 'Desainer / Ilustrator', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=andika' },
                      { id: 'c2', username: 'sitisarah', name: 'Siti Sarah', userCategory: 'Fotografer / DOP', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sara' },
                      { id: 'c3', username: 'budiarta', name: 'Budi Artawan', userCategory: 'Videografer / Editor', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=budi' },
                      { id: 'c4', username: 'renata_m', name: 'Renata Mauris', userCategory: 'Motion Designer', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=renata' },
                      { id: 'c5', username: 'danur_w', name: 'Danur Wijaya', userCategory: 'Animator 3D', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=danur' }
                    ]
                  ).map(creator => (
                    <div 
                      key={creator.id} 
                      className="creator-card glass-panel"
                      onClick={() => {
                        if (!currentUser) {
                          handleOpenLoginModal('register');
                          return;
                        }
                        alert(`Profil Portofolio Kreator ${creator.name} akan segera hadir.`);
                      }}
                    >
                      <div className="creator-avatar">
                        <img src={creator.avatar} alt={creator.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="creator-info">
                        <span className="creator-name">{creator.name}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                          {creator.userCategory ? creator.userCategory.split(',').map((cat, idx) => (
                            <span key={idx} className="creator-tag">{cat.trim()}</span>
                          )) : <span className="creator-tag">Kreator Digital</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-divider"></div>

              {/* 5.5. Tanya Jawab (FAQ) */}
              <div className="dashboard-section animate-fade-in" style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', width: '100%', padding: '0 16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HelpCircle size={24} style={{ color: 'var(--text-primary)' }} />
                    <span>Tanya Jawab (FAQ)</span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Segala hal yang perlu Anda ketahui tentang ngonten.id
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      q: "Apa itu ngonten.id?",
                      a: "ngonten.id adalah platform kolaborasi pelaku industri kreatif Indonesia yang menghubungkan kreator, komunitas, dan brand dalam satu ekosistem terpadu. Kami mempermudah pemenuhan kebutuhan industri kreatif seperti pameran portofolio, rekrutmen tim, dan penyelenggaraan event kompetisi."
                    },
                    {
                      q: "Bagaimana cara kreator mendapatkan penghasilan di sini?",
                      a: "Kreator dapat memperoleh penghasilan dengan memenangkan kompetisi kreatif yang diadakan oleh brand mitra di platform, serta menerima pembagian hasil (benefit views) dari karya orisinal yang ditayangkan."
                    },
                    {
                      q: "Apakah pendaftaran di ngonten.id dikenakan biaya?",
                      a: "Pendaftaran di ngonten.id adalah 100% gratis. Namun, kami menyediakan keanggotaan Premium bagi kreator yang ingin mendapatkan prioritas akses informasi proyek, unlock detail portofolio (akses kontak & CV lengkap agar memudahkan brand mengevaluasi dan menghubungi Anda), serta potongan admin penarikan saldo yang lebih rendah."
                    },
                    {
                      q: "Bagaimana sistem penarikan saldo (withdrawal)?",
                      a: "Seluruh pendapatan dari kemenangan kompetisi atau benefit views akan masuk ke Dompet Kreator Anda. Anda dapat mencairkan saldo kapan saja ke rekening bank atau e-wallet (minimal Rp 50.000) dengan biaya admin otomatis sebesar 5% untuk akun standar, dan hanya 2% bagi akun Premium."
                    },
                    {
                      q: "Bagaimana cara komunitas atau agensi melakukan rekrutmen?",
                      a: "Komunitas atau agensi dapat mendaftarkan profil mereka, membuka lowongan proyek/crew, dan menetapkan kuota yang dibutuhkan agar kreator lain dapat mendaftar langsung secara praktis."
                    }
                  ].map((faq, idx) => {
                    const isOpen = activeFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          background: 'var(--bg-card)', 
                          border: isOpen ? '1px solid var(--border-hover)' : '1px solid var(--border-color)', 
                          borderRadius: '12px', 
                          overflow: 'hidden',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <button
                          onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            fontWeight: '600',
                            fontSize: '0.92rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            textAlign: 'left',
                            gap: '12px'
                          }}
                        >
                          <span>{faq.q}</span>
                          <span style={{ 
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.2s', 
                            color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <ChevronDown size={18} />
                          </span>
                        </button>
                        <div 
                          style={{ 
                            maxHeight: isOpen ? '200px' : '0px', 
                            overflow: 'hidden', 
                            transition: 'max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: 'var(--secondary-glow)'
                          }}
                        >
                          <p style={{ 
                            margin: 0, 
                            padding: '0 20px 16px 20px', 
                            color: 'var(--text-secondary)', 
                            fontSize: '0.85rem', 
                            lineHeight: '1.6' 
                          }}>
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dashboard-hero" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
                <div style={{ maxWidth: '650px' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.02em' }}>Temukan Solusi Kreatif Anda</h2>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.6' }}>
                    Platform terintegrasi yang mempertemukan kreator dan brand untuk solusi kebutuhan karya digital dan bisnis.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      if (!currentUser) {
                        handleOpenLoginModal('register');
                      } else {
                        handleTabChange('events');
                      }
                    }}
                    style={{ borderRadius: '30px', padding: '14px 36px', fontWeight: 'bold', fontSize: '0.95rem' }}
                  >
                    {!currentUser ? 'Gabung Sekarang' : 'Jelajahi Event & Kompetisi'}
                  </button>
                </div>
              </div>
            </div>
    );
  }

  // Fallback: Watchlist/History or Discover with active filters
  return (
    <div className="catalog-layout">
      {activeTab === 'discover' && (
        <div className="genres-bar">
          <button 
            className={`genre-pill ${!selectedGenre ? 'active' : ''}`}
            onClick={() => setSelectedGenre(null)}
          >
            Semua
          </button>
          {allGenres.map(genre => (
            <button
              key={genre}
              className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <div className="catalog-header">
        <h2>
          {activeTab === 'discover' && (selectedGenre ? `Kategori: ${selectedGenre}` : 'Rekomendasi Utama')}
          {activeTab === 'watchlist' && 'Daftar Tontonan Anda'}
          {activeTab === 'history' && 'Riwayat Menonton'}
        </h2>
        
        {activeTab === 'discover' && (
          <button 
            className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
          </button>
        )}

        {activeTab === 'history' && history.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            <Trash2 size={15} />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* Filter Panel (Slide down search filter panel) */}
      {activeTab === 'discover' && isFilterOpen && (
        <div className="filter-panel animate-slide-down">
          <div className="filter-grid">
            {/* Column 1: Kategori */}
            <div className="filter-column">
              <h4 className="filter-title-label">
                <Tag size={14} className="filter-icon" />
                <span>KATEGORI</span>
              </h4>
              <div className="filter-options">
                <button 
                  className={`filter-option-btn ${!selectedGenre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(null)}
                >
                  Semua
                </button>
                {allGenres.map(g => (
                  <button
                    key={g}
                    className={`filter-option-btn ${selectedGenre === g ? 'active' : ''}`}
                    onClick={() => setSelectedGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Tahun */}
            <div className="filter-column">
              <h4 className="filter-title-label">
                <Calendar size={14} className="filter-icon" />
                <span>TAHUN</span>
              </h4>
              <div className="filter-options">
                <button 
                  className={`filter-option-btn ${filterYear === 'Semua' ? 'active' : ''}`}
                  onClick={() => setFilterYear('Semua')}
                >
                  Semua
                </button>
                {allYears.map(y => (
                  <button
                    key={y}
                    className={`filter-option-btn ${filterYear === y.toString() ? 'active' : ''}`}
                    onClick={() => setFilterYear(y.toString())}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Negara */}
            <div className="filter-column">
              <h4 className="filter-title-label">
                <Flag size={14} className="filter-icon" />
                <span>NEGARA</span>
              </h4>
              <div className="filter-options">
                <button 
                  className={`filter-option-btn ${filterCountry === 'Semua' ? 'active' : ''}`}
                  onClick={() => setFilterCountry('Semua')}
                >
                  Semua
                </button>
                {allCountries.map(c => (
                  <button
                    key={c}
                    className={`filter-option-btn ${filterCountry === c ? 'active' : ''}`}
                    onClick={() => setFilterCountry(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 4: Sensor (Film Semi) */}
            <div className="filter-column">
              <h4 className="filter-title-label">
                {filterSemi === 'Sembunyikan' ? <EyeOff size={14} className="filter-icon" /> : <Eye size={14} className="filter-icon" />}
                <span>FILM SEMI</span>
              </h4>
              <div className="filter-options">
                <button 
                  className={`filter-option-btn ${filterSemi === 'Sembunyikan' ? 'active' : ''}`}
                  onClick={() => setFilterSemi('Sembunyikan')}
                >
                  Sembunyikan
                </button>
                <button 
                  className={`filter-option-btn ${filterSemi === 'Tampilkan' ? 'active' : ''}`}
                  onClick={() => setFilterSemi('Tampilkan')}
                >
                  Tampilkan Semua
                </button>
                <button 
                  className={`filter-option-btn ${filterSemi === 'Hanya' ? 'active' : ''}`}
                  onClick={() => setFilterSemi('Hanya')}
                >
                  Hanya Film Semi
                </button>
              </div>
            </div>
          </div>

          {/* Reset Filters Bar */}
          {(selectedGenre || filterYear !== 'Semua' || filterCountry !== 'Semua' || filterSemi !== 'Sembunyikan') && (
            <div className="filter-footer">
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedGenre(null);
                  setFilterYear('Semua');
                  setFilterCountry('Semua');
                  setFilterSemi('Sembunyikan');
                }}
              >
                <RotateCcw size={14} />
                <span>Riset Semua Filter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {isLoadingDB ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memuat data...</span>
        </div>
      ) : filteredMovies.length > 0 ? (
        <React.Fragment>
          <div className="movie-grid youtube-grid">
            {filteredMovies.slice(0, visibleMoviesCount).map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                currentUser={currentUser}
                onSelect={handleMovieSelect}
              />
            ))}
          </div>
          {filteredMovies.length > visibleMoviesCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '16px' }}>
              <button 
                onClick={() => setVisibleMoviesCount(prev => prev + 12)}
                title="Muat Lebih Banyak"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <ChevronDown size={20} />
              </button>
            </div>
          )}
        </React.Fragment>
      ) : (
        /* Empty States */
        <div className="empty-state glass-panel">
          <Film size={48} className="empty-icon" />
          <h3>Tidak ada video ditemukan</h3>
          <p>
            {activeTab === 'watchlist' && 'Daftar tontonan Anda kosong. Jelajahi film menarik dan favoritkan video untuk menyimpannya di sini.'}
            {activeTab === 'history' && 'Anda belum memutar film apa pun. Film yang Anda putar akan muncul di sini.'}
            {activeTab === 'discover' && 'Kami tidak menemukan film yang cocok dengan pencarian Anda. Coba kata kunci atau filter lain.'}
          </p>
          {(activeTab !== 'discover' || selectedGenre || searchQuery) && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                handleTabChange('discover');
                setSelectedGenre(null);
                setSearchQuery('');
              }}
            >
              Kembali ke Beranda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
