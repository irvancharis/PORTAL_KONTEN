import React from 'react';
import { createPortal } from 'react-dom';
import { X, Star, MapPin, Mail, Phone, Film, Trophy, Eye, Award, ExternalLink, Play } from 'lucide-react';

export default function CreatorProfileModal({
  creator,
  onClose,
  movies = [],
  events = [],
  eventSubmissions = [],
  onSelectMovie
}) {
  if (!creator) return null;

  const username = creator.username || creator.name || 'creator';
  const name = creator.organizerName || creator.name || creator.username;
  const avatar = creator.organizerAvatar || creator.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=262626&textColor=ffffff`;
  const email = creator.email || (creator.username ? `${creator.username}@ngonten.id` : null);
  const phone = creator.organizerPhone || creator.phone || null;
  const description = creator.organizerDescription || creator.bio || creator.description || 'Pembuat konten belum menambahkan biografi atau deskripsi profil.';
  const regional = creator.userRegional || creator.regional || null;

  // Filter movies uploaded by this creator
  const creatorMovies = (movies || []).filter(m => 
    (m.uploader && m.uploader.toLowerCase() === username.toLowerCase()) ||
    (m.creator && m.creator.toLowerCase() === username.toLowerCase())
  );

  // Filter event submissions
  const creatorSubmissions = (eventSubmissions || []).filter(s => 
    s.username && s.username.toLowerCase() === username.toLowerCase()
  );

  const totalViews = creatorMovies.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
  const winsCount = creatorSubmissions.filter(s => s.isWinner).length;
  const points = (creatorMovies.length * 100) + (totalViews * 2) + (winsCount * 500);
  const calculatedStars = Math.min(5, Math.max(1, Math.floor(points / 500) + 1));
  const stars = creator.stars || calculatedStars;

  return createPortal(
    <div 
      className="admin-modal-overlay d-flex-center animate-fade-in" 
      style={{ 
        zIndex: 99999, 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(5, 8, 16, 0.85)', 
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-scale-in" 
        style={{ 
          maxWidth: '850px', 
          width: '100%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          borderRadius: 'var(--radius-lg, 20px)', 
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          background: 'var(--bg-main, #09090b)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          position: 'relative'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--text-secondary, #cbd5e1)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Profile Cover Banner */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg, #1e293b 0%, #09090b 100%)',
          position: 'relative',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))'
        }} />

        {/* Profile Header Block */}
        <div style={{ padding: '0 32px 32px 32px', position: 'relative', marginTop: '-60px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <img 
              src={avatar} 
              alt={username} 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid var(--bg-main, #09090b)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                background: '#18181b',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=262626&textColor=ffffff`;
              }}
            />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary, #ffffff)', margin: 0 }}>
                  @{username}
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < stars ? "#eab308" : "none"} 
                      stroke={i < stars ? "#eab308" : "var(--text-muted, #71717a)"} 
                      style={{ marginRight: '2px' }} 
                    />
                  ))}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted, #a1a1aa)', margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: '500' }}>
                {name}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted, #a1a1aa)' }}>
                {email && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <strong style={{ color: 'var(--text-secondary, #e2e8f0)' }}>Email:</strong> {email}
                  </span>
                )}
                {phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <strong style={{ color: 'var(--text-secondary, #e2e8f0)' }}>Telp:</strong> {phone}
                  </span>
                )}
                {regional && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} style={{ opacity: 0.8 }} /> {regional}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Description */}
          <div style={{ 
            background: 'var(--bg-card, rgba(255,255,255,0.03))', 
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            padding: '16px 20px', 
            borderRadius: '12px',
            color: 'var(--text-secondary, #cbd5e1)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary, #ffffff)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bio / Deskripsi
            </h4>
            <p style={{ margin: 0 }}>{description}</p>
          </div>

          {/* Key Metrics Dashboard */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '16px',
            marginBottom: '36px'
          }}>
            {[
              { label: 'Total Karya', value: `${creatorMovies.length} Film` },
              { label: 'Total Views', value: `${totalViews.toLocaleString('id-ID')} Views` },
              { label: 'Juara Event', value: `${winsCount}x Juara` },
              { label: 'Reputasi Poin', value: `${points.toLocaleString('id-ID')} Pts` }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #a1a1aa)', display: 'block', marginBottom: '6px' }}>{item.label}</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary, #ffffff)', fontWeight: '700' }}>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* Portfolio/Karya List */}
          <div style={{ margin: '0 0 36px 0' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary, #ffffff)', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingBottom: '10px' }}>
              Portofolio Film ({creatorMovies.length})
            </h3>
            {creatorMovies.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                {creatorMovies.map(movie => (
                  <div 
                    key={movie.id} 
                    onClick={() => onSelectMovie && onSelectMovie(movie)}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: onSelectMovie ? 'pointer' : 'default',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div style={{ width: '100%', height: '120px', background: '#070a13', position: 'relative' }}>
                      <img 
                        src={movie.thumbnail || movie.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=3540&auto=format&fit=crop'} 
                        alt={movie.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=3540&auto=format&fit=crop';
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.75)',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {movie.category || 'Film Pendek'}
                      </span>
                    </div>
                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'var(--text-primary, #ffffff)', fontSize: '0.88rem', fontWeight: 'bold', margin: '0 0 8px 0', lineBreak: 'anywhere' }}>
                        {movie.title}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted, #a1a1aa)' }}>
                        <span>{movie.views ? movie.views.toLocaleString('id-ID') : 0} Views</span>
                        <span>{movie.likes ? movie.likes.length : 0} Suka</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--text-muted, #a1a1aa)', fontSize: '0.88rem' }}>
                Belum ada karya film yang diunggah ke portal.
              </div>
            )}
          </div>

          {/* Event Submissions List */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary, #ffffff)', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingBottom: '10px' }}>
              Keikutsertaan Event & Kompetisi ({creatorSubmissions.length})
            </h3>
            {creatorSubmissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {creatorSubmissions.map((sub, idx) => {
                  const eventTarget = (events || []).find(e => e.id === sub.eventId);
                  return (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                      borderRadius: '10px',
                      padding: '14px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <h4 style={{ color: 'var(--text-primary, #ffffff)', fontSize: '0.88rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                          {eventTarget ? eventTarget.title : 'Event Kompetisi'}
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #a1a1aa)' }}>
                          Karya: {sub.videoUrl ? (
                            <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                              {sub.title || 'Lihat Video'}
                            </a>
                          ) : (sub.title || '-')}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        background: sub.isWinner ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: sub.isWinner ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: sub.isWinner ? '#fbbf24' : 'var(--text-secondary, #cbd5e1)'
                      }}>
                        {sub.isWinner ? `Pemenang` : `Partisipan`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--text-muted, #a1a1aa)', fontSize: '0.88rem' }}>
                Belum terdaftar di event kompetisi apa pun.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '36px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ 
                padding: '10px 24px', 
                borderRadius: '8px', 
                fontSize: '0.88rem', 
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
