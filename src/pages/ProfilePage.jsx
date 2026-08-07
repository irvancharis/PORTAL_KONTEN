import React from 'react';
import { 
  Edit, 
  Mail, 
  User, 
  MapPin, 
  Sparkles, 
  Phone, 
  Globe, 
  Users, 
  LogOut,
  Calendar
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  communities,
  handleOpenEditProfile,
  setShowPremiumModal,
  handleKickMember,
  handleApproveMember,
  handleRejectMember,
  handleToggleJoinCommunity,
  handleLogout,
  handleTabChange,
  slugify
}) {
  const isCurrentUserCommunity = currentUser?.isCommunity || currentUser?.role === 'panitia';

  return (
    <div className="profile-view-container animate-fade-in">
      {/* Profile Header Card */}
      <div className="profile-card-header glass-panel">
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <button 
            onClick={handleOpenEditProfile}
            style={{ background: 'var(--primary-glow)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '20px', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-card)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-glow)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <Edit size={14} />
            <span>Edit Profil</span>
          </button>
        </div>

        {/* Avatar */}
        <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px', border: '4px solid var(--border-color)' }}>
          {currentUser?.organizerAvatar ? (
            <img src={currentUser.organizerAvatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            currentUser?.username?.charAt(0)
          )}
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{currentUser?.organizerName || currentUser?.username}</h2>
        {isCurrentUserCommunity ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
              Komunitas / Instansi
            </span>
          </div>
        ) : (() => {
          const isPremium = currentUser && (currentUser.role === 'member' || currentUser.role === 'pro') && currentUser.premiumExpiresAt;
          if (isPremium) {
            const expiryDateStr = new Date(currentUser.premiumExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 14px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  ★ Premium Aktif s.d. {expiryDateStr}
                </span>
              </div>
            );
          } else {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  Akun belum Premium
                </span>
                <button
                  onClick={() => setShowPremiumModal(true)}
                  style={{
                    background: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--bg-main)',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Upgrade ke Premium
                </button>
              </div>
            );
          }
        })()}
      </div>

      {/* Profile Details Container */}
      <div className="profile-card-details glass-panel">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 8px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>Detail Data Profil</h3>
        
        {/* Email */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <Mail size={16} />
            <span style={{ fontSize: '0.85rem' }}>Email</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser?.email || '-'}</span>
        </div>

        {/* Status User */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <User size={16} />
            <span style={{ fontSize: '0.85rem' }}>Status User</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isCurrentUserCommunity ? 'Komunitas / Instansi' : 'Kreator / User'}
          </span>
        </div>

        {/* Lokasi Regional */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <MapPin size={16} />
            <span style={{ fontSize: '0.85rem' }}>Lokasi Regional</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser?.userRegional || '-'}</span>
        </div>

        {/* Status Akun */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.85rem' }}>Status Akun</span>
          </div>
          {(() => {
            const isPremium = currentUser && (currentUser.role === 'member' || currentUser.role === 'pro') && currentUser.premiumExpiresAt;
            if (isPremium) {
              const expiryDateStr = new Date(currentUser.premiumExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ★ Premium
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Berlaku s.d. {expiryDateStr}</span>
                </div>
              );
            } else {
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Standar / Gratis</span>
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    style={{
                      background: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--bg-main)',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade
                  </button>
                </div>
              );
            }
          })()}
        </div>

        {/* Masa Aktif Premium (Only for Premium Users) */}
        {(() => {
          const isPremium = currentUser && (currentUser.role === 'member' || currentUser.role === 'pro') && currentUser.premiumExpiresAt;
          if (isPremium) {
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Masa Aktif Premium</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  s.d. {new Date(currentUser.premiumExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            );
          }
          return null;
        })()}

        {/* WhatsApp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
            <Phone size={16} />
            <span style={{ fontSize: '0.85rem' }}>WhatsApp / HP</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentUser?.organizerPhone || '-'}</span>
        </div>

        {/* Kategori Kreator */}
        {!isCurrentUserCommunity && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <User size={16} />
              <span style={{ fontSize: '0.85rem' }}>Kategori Kreator</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end', maxWidth: '60%' }}>
              {currentUser?.userCategory ? currentUser.userCategory.split(',').map((cat, idx) => (
                <span key={idx} style={{ fontSize: '0.78rem', padding: '3px 8px', background: 'var(--primary-glow)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500' }}>{cat.trim()}</span>
              )) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
            </div>
          </div>
        )}

        {/* Link Portofolio */}
        {!isCurrentUserCommunity && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <Globe size={16} />
              <span style={{ fontSize: '0.85rem' }}>Link Portofolio</span>
            </div>
            {currentUser?.userPortfolio ? (
              <a href={currentUser.userPortfolio} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                Buka Link Portofolio
              </a>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Belum Diisi</span>
            )}
          </div>
        )}

        {/* Connected Social Media */}
        {!isCurrentUserCommunity && (() => {
          const connectedPlatforms = [
            { id: 'facebook', label: 'Facebook', handle: currentUser?.facebookHandle, verified: currentUser?.facebookVerified, color: '#1877f2', link: `https://facebook.com/${currentUser?.facebookHandle}` },
            { id: 'tiktok', label: 'TikTok', handle: currentUser?.tiktokHandle, verified: currentUser?.tiktokVerified, color: '#00f2fe', link: `https://tiktok.com/@${currentUser?.tiktokHandle}` },
            { id: 'instagram', label: 'Instagram', handle: currentUser?.instagramHandle, verified: currentUser?.instagramVerified, color: '#e1306c', link: `https://instagram.com/${currentUser?.instagramHandle}` },
            { id: 'youtube', label: 'YouTube', handle: currentUser?.youtubeHandle, verified: currentUser?.youtubeVerified, color: '#ff0000', link: `https://youtube.com/@${currentUser?.youtubeHandle}` }
          ].filter(p => p.handle && p.verified);

          if (connectedPlatforms.length === 0) return null;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>Akun Sosial Media Terhubung</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {connectedPlatforms.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-glow)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.label}</span>
                      <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                        @{p.handle}
                      </a>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      Terverifikasi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Jumlah Anggota (Community only) */}
        {isCurrentUserCommunity && (() => {
          const myCommRecord = communities.find(c => c.username?.toLowerCase() === currentUser?.username?.toLowerCase());
          const myJoinedMembers = myCommRecord ? (myCommRecord.joinedMembers || []) : [];
          const target = Number(myCommRecord ? (myCommRecord.activeMembersCount || 0) : (currentUser?.activeMembersCount || 0));
          const current = myJoinedMembers.length;
          const isActive = current >= target;
          const percentage = target > 0 ? (current / target) * 100 : 0;
          
          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <User size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Target Anggota untuk Aktif</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{target} Orang</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <Users size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Anggota Tergabung</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{current} Orang</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Keaktifan</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    color: isActive ? '#10b981' : '#f59e0b', 
                    background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' 
                  }}>
                    {isActive ? 'AKTIF' : 'BELUM AKTIF'}
                  </span>
                </div>
                
                <div style={{ width: '100%', marginTop: '4px' }}>
                  <div style={{ width: '100%', height: '8px', background: 'var(--primary-glow)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(100, percentage)}%`, 
                      height: '100%', 
                      background: isActive ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {!isActive && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                      *Kurang {target - current} anggota untuk mencapai status aktif
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daftar Anggota Komunitas</span>
                {myJoinedMembers.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {myJoinedMembers.map((m, idx) => (
                      <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-glow)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {m.charAt(0)}
                        </div>
                        <span>{m}</span>
                        <button
                          onClick={() => handleKickMember(myCommRecord.id, m)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: '0 2px',
                            fontWeight: 'bold',
                            marginLeft: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Keluarkan Anggota"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada anggota yang bergabung.</span>
                )}
              </div>
            </>
          );
        })()}

        {/* Deskripsi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bio / Deskripsi Singkat</span>
          <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.6', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            {currentUser?.organizerDescription || 'Belum ada deskripsi profil.'}
          </p>
        </div>
      </div>

      {/* Persetujuan Anggota Baru (Only for community owners) */}
      {isCurrentUserCommunity && (() => {
        const myComm = communities.find(c => c.username?.toLowerCase() === currentUser?.username?.toLowerCase());
        const pendingList = myComm ? (myComm.pendingMembers || []) : [];
        return (
          <div 
            id="persetujuan-anggota" 
            className="profile-card-details glass-panel" 
            style={{ 
              marginTop: '24px',
              transition: 'all 0.3s ease',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
              Persetujuan Anggota Baru
            </h3>
            {pendingList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {pendingList.map((pendingUser, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-glow)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>{pendingUser}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleApproveMember(myComm.id, pendingUser)}
                        style={{ background: 'var(--primary)', color: 'var(--bg-main)', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Setujui
                      </button>
                      <button 
                        onClick={() => handleRejectMember(myComm.id, pendingUser)}
                        style={{ background: 'var(--primary-glow)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, padding: '8px 0' }}>
                Tidak ada permintaan bergabung baru yang memerlukan persetujuan Anda.
              </p>
            )}
          </div>
        );
      })()}

      {/* Join Komunitas Section (For regular users - Show only joined communities) */}
      {!isCurrentUserCommunity && (
        <div className="profile-card-details glass-panel" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>Komunitas Saya</h3>
          {(() => {
            const communitiesList = communities.filter(c => (c.joinedMembers || []).includes(currentUser?.username));
            if (communitiesList.length === 0) {
              return (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Anda belum bergabung dengan komunitas mana pun.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleTabChange('communities')}
                    style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '20px' }}
                  >
                    Jelajahi Komunitas
                  </button>
                </div>
              );
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {communitiesList.map(comm => {
                  const members = comm.joinedMembers || [];
                  const target = Number(comm.activeMembersCount || 0);
                  const current = members.length;
                  const isActive = current >= target;
                  
                  return (
                    <div key={comm.username} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-glow)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 300px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                          {comm.avatar ? (
                            <img src={comm.avatar} alt={comm.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            comm.name?.charAt(0) || comm.username?.charAt(0)
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{comm.name || comm.username}</strong>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {comm.description || 'Komunitas Terdaftar'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;
                            window.history.pushState(null, '', '/community/' + commSlug);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--primary-glow)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => handleToggleJoinCommunity(comm.username)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            borderRadius: '20px',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Keluar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '300px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            color: '#ffffff',
            background: '#ef4444',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
          }}
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
}
