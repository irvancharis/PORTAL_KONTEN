import React, { useState } from 'react';
import { 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Unlock, 
  Lock, 
  Award, 
  CheckCircle2, 
  Users, 
  UserPlus, 
  Search 
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

export default function CommunitiesPage({
  communities,
  currentUser,
  selectedCommunityId,
  setSelectedCommunityId,
  handleToggleJoinCommunity,
  isRegularUser,
  slugify,
  regions,
  handleOpenLoginModal,
  handleOpenEditProfile,
  handleTabChange,
  isJoined,
  target,
  current,
  isActive,
  percentage,
  formatIndonesianDate,
  setZoomImage,
  communitySearchQuery,
  setCommunitySearchQuery,
  communityRegionalFilter,
  setCommunityRegionalFilter,
  handleApproveMember,
  handleRejectMember,
  handleSaveAgenda
}) {
  if (selectedCommunityId) {
    const comm = communities.find(c => c.id === selectedCommunityId);
    if (!comm) {
      return (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Komunitas tidak ditemukan.
          <button onClick={() => setSelectedCommunityId(null)} className="btn btn-primary" style={{ marginTop: '12px' }}>Kembali</button>
        </div>
      );
    }

    const members = comm.joinedMembers || [];
    const isJoinedLocal = currentUser && members.includes(currentUser.username);
    const targetLocal = Number(comm.activeMembersCount || 0);
    const currentLocal = members.length;
    const isActiveLocal = currentLocal >= targetLocal;
    const percentageLocal = targetLocal > 0 ? (currentLocal / targetLocal) * 100 : 0;
    const isRegularUserLocal = currentUser && !(currentUser.isCommunity || currentUser.role === 'panitia');

    return (
      <div className="community-portal-container animate-fade-in" style={{ width: '100%', padding: '4px', textAlign: 'left' }}>
        {currentUser && currentUser.role === 'user' && (!currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio) && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#f59e0b" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 'bold' }}>Profil Belum Lengkap!</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  lengkapi profil Anda terlebih dahulu agar dapat bergabung dengan komunitas dan mendaftar sebagai peserta event.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenEditProfile}
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                borderRadius: '20px',
                fontWeight: 'bold',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={14} />
              <span>Lengkapi Profil Sekarang</span>
            </button>
          </div>
        )}
        {/* Back button */}
        <button 
          onClick={() => {
            window.history.pushState(null, '', '/communities');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-glow)',
            border: '1px solid var(--border-color)',
            padding: '10px 20px',
            borderRadius: '30px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '28px',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--bg-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-glow)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          ← Kembali ke Daftar Komunitas
        </button>

        <div className="community-detail-card glass-panel">
          {/* Community Header Block */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ffffff', color: '#020202', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', border: '3px solid var(--border-color)', flexShrink: 0 }}>
              {comm.avatar ? (
                <img src={comm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                comm.name?.charAt(0) || comm.username?.charAt(0)
              )}
            </div>
            <div>
              {currentUser && currentUser.username === comm.username && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    background: 'var(--primary-glow)', 
                    color: 'var(--text-primary)', 
                    padding: '5px 14px', 
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    border: '1px solid var(--border-color)',
                    letterSpacing: '0.5px'
                  }}>
                    {isActiveLocal ? 'KOMUNITAS AKTIF' : 'KOMUNITAS BELUM AKTIF'}
                  </span>
                </div>
              )}
              <h2 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '2.2rem', 
                fontWeight: '800', 
                margin: 0, 
                letterSpacing: '-0.8px'
              }}>{comm.name || comm.username}</h2>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="event-detail-grid" style={{ marginTop: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Bio / Deskripsi</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  {comm.description || 'Belum ada deskripsi profil.'}
                </p>
              </div>

              {comm.activityImages && comm.activityImages.length > 0 && (
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Foto Kegiatan & Dokumentasi</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '12px' }}>
                    {comm.activityImages.map((imgUrl, imgIdx) => (
                      <div 
                        key={imgIdx} 
                        onClick={() => setZoomImage(imgUrl)}
                        style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '16/10', background: 'var(--bg-main)', cursor: 'zoom-in' }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Kegiatan ${imgIdx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda Kegiatan Komunitas */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Agenda Kegiatan</h3>
                {(() => {
                  const allAgendas = comm.agendas || [];
                  const isOwner = currentUser && currentUser.username === comm.username;
                  const isMember = isJoinedLocal || isOwner;

                  if (allAgendas.length > 0) {
                    return (
                      <>
                        {/* Desktop Table View */}
                        <div className="table-responsive agenda-desktop-table" style={{ marginTop: '12px', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 'bold' }}>Waktu / Tanggal</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 'bold' }}>Agenda / Keterangan</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 'bold' }}>Lokasi</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 'bold', textAlign: 'right' }}>Akses</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allAgendas.map((agenda) => {
                                const canViewDetails = agenda.publishTo === 'public' || isMember;
                                return (
                                  <tr key={agenda.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'top' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                                          <strong style={{ fontWeight: 'bold' }}>{formatIndonesianDate(agenda.date)}</strong>
                                        </div>
                                        {agenda.time && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '20px' }}>
                                            <Clock size={12} />
                                            <span>Pukul {agenda.time}</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'top' }}>
                                      <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.92rem' }}>
                                        {canViewDetails ? (
                                          agenda.title
                                        ) : (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                            <Lock size={13} /> Agenda Khusus Anggota
                                          </span>
                                        )}
                                      </div>
                                      {canViewDetails ? (
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                          {agenda.description || '-'}
                                        </div>
                                      ) : (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                          Detail agenda hanya terlihat oleh anggota resmi komunitas ini.
                                        </div>
                                      )}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-primary)', verticalAlign: 'top' }}>
                                      {canViewDetails ? (
                                        agenda.location ? (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                            <span>{agenda.location}</span>
                                          </div>
                                        ) : '-'
                                      ) : '-'}
                                    </td>
                                    <td style={{ padding: '16px', whiteSpace: 'nowrap', verticalAlign: 'top', textAlign: 'right' }}>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.72rem',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        background: agenda.publishTo === 'public' ? 'var(--primary-glow)' : 'rgba(0,0,0,0.04)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)'
                                      }}>
                                        {agenda.publishTo === 'public' ? <Unlock size={10} /> : <Lock size={10} />}
                                        {agenda.publishTo === 'public' ? 'Publik' : 'Anggota'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards List View */}
                        <div className="agenda-mobile-list">
                          {allAgendas.map((agenda) => {
                            const canViewDetails = agenda.publishTo === 'public' || isMember;
                            return (
                              <div 
                                key={agenda.id} 
                                style={{ 
                                  background: 'var(--primary-glow)', 
                                  border: '1px solid var(--border-color)', 
                                  borderRadius: '12px', 
                                  padding: '16px', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '12px',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                                      <strong style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formatIndonesianDate(agenda.date)}</strong>
                                    </div>
                                    {agenda.time && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '20px' }}>
                                        <Clock size={12} />
                                        <span>Pukul {agenda.time}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.68rem',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    background: agenda.publishTo === 'public' ? 'var(--primary-glow)' : 'rgba(0,0,0,0.04)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    flexShrink: 0
                                  }}>
                                    {agenda.publishTo === 'public' ? <Unlock size={9} /> : <Lock size={9} />}
                                    {agenda.publishTo === 'public' ? 'Publik' : 'Anggota'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                    {canViewDetails ? (
                                      agenda.title
                                    ) : (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                        <Lock size={13} /> Agenda Khusus Anggota
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                    {canViewDetails ? (
                                      agenda.description || '-'
                                    ) : (
                                      <span style={{ fontStyle: 'italic' }}>Detail agenda hanya terlihat oleh anggota resmi komunitas ini.</span>
                                    )}
                                  </div>
                                </div>

                                {canViewDetails && agenda.location && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                                    <MapPin size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-primary)' }}>{agenda.location}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  }

                  return (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Belum ada agenda kegiatan yang dijadwalkan.</p>
                  );
                })()}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                {currentUser && currentUser.username === comm.username ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <Award size={18} style={{ color: 'var(--text-primary)' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Status Keaktifan</h3>
                    </div>

                    <div className="owner-stats-grid">
                      <div className="owner-stat-box">
                        <span className="owner-stat-label">Target Anggota</span>
                        <span className="owner-stat-value">{targetLocal} Orang</span>
                      </div>
                      <div className="owner-stat-box">
                        <span className="owner-stat-label">Tergabung</span>
                        <span className="owner-stat-value">{currentLocal} Orang</span>
                      </div>
                    </div>

                    <div className="owner-progress-container">
                      <div className="owner-progress-header">
                        <span>Progress Target</span>
                        <strong>{Math.min(100, Math.round(percentageLocal))}%</strong>
                      </div>
                      <div className="owner-progress-track">
                        <div 
                          className="owner-progress-bar" 
                          style={{ width: `${Math.min(100, percentageLocal)}%` }} 
                        />
                      </div>
                    </div>

                    {!isActiveLocal ? (
                      <div className="owner-status-banner inactive">
                        <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Kurang <strong>{targetLocal - currentLocal}</strong> anggota aktif untuk memverifikasi keaktifan komunitas.</span>
                      </div>
                    ) : (
                      <div className="owner-status-banner active">
                        <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>✓ Komunitas terverifikasi aktif. Target crew telah tercapai.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <Users size={18} style={{ color: 'var(--text-primary)' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Keanggotaan</h3>
                    </div>

                    {isRegularUserLocal && (() => {
                      const pending = comm.pendingMembers || [];
                      const isPending = pending.includes(currentUser?.username);

                      if (isJoinedLocal) {
                        return (
                          <div className="membership-card-container">
                            <div className="membership-status-card">
                              <div className="membership-status-header">
                                <div className="membership-status-icon-wrapper joined">
                                  <CheckCircle2 size={22} />
                                </div>
                                <div className="membership-status-info">
                                  <span className="membership-status-title">Sudah Terdaftar</span>                                              
                                </div>
                              </div>
                              <p className="membership-status-desc">
                                Anda telah bergabung sebagai anggota resmi di komunitas ini. Nikmati akses kolaborasi eksklusif.
                              </p>                                          
                            </div>
                          </div>
                        );
                      }

                      if (isPending) {
                        return (
                          <div className="membership-card-container">
                            <div className="membership-status-card">
                              <div className="membership-status-header">
                                <div className="membership-status-icon-wrapper pending">
                                  <Clock size={22} />
                                </div>
                                <div className="membership-status-info">
                                  <span className="membership-status-title">Menunggu Persetujuan</span>
                                  <span className="membership-status-badge pending">Pending</span>
                                </div>
                              </div>
                              <p className="membership-status-desc">
                                Permintaan gabung Anda telah terkirim dan sedang ditinjau oleh pengelola komunitas.
                              </p>
                              <button 
                                onClick={() => handleToggleJoinCommunity(comm.username)}
                                className="btn-membership-action cancel"
                              >
                                Batalkan Permintaan
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="membership-card-container">
                          <div className="membership-status-card">
                            <div className="membership-status-header">
                              <div className="membership-status-icon-wrapper guest">
                                <UserPlus size={22} />
                              </div>
                              <div className="membership-status-info">
                                <span className="membership-status-title">Kreator Tamu</span>
                                <span className="membership-status-badge" style={{ background: 'var(--primary-glow)', color: 'var(--text-secondary)' }}>Belum Gabung</span>
                              </div>
                            </div>
                            <p className="membership-status-desc">
                              Bergabunglah dengan komunitas ini untuk berkolaborasi dalam kampanye, project, dan terhubung dengan kreator lainnya.
                            </p>
                            <button 
                              onClick={() => handleToggleJoinCommunity(comm.username)}
                              className="btn-membership-action join"
                            >
                              Gabung Komunitas
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Daftar Anggota ({currentLocal} Orang)</h3>
                {members.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {members.map((m, idx) => (
                      <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-glow)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {m.charAt(0)}
                        </div>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Belum ada anggota yang bergabung.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="community-portal-container animate-fade-in" style={{ width: '100%', padding: '4px', textAlign: 'left' }}>
      {currentUser && currentUser.role === 'user' && (!currentUser.organizerName || !currentUser.organizerPhone || !currentUser.userPortfolio) && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 'bold' }}>Profil Belum Lengkap!</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                lengkapi profil Anda terlebih dahulu agar dapat bergabung dengan komunitas dan mendaftar sebagai peserta event.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenEditProfile}
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={14} />
            <span>Lengkapi Profil Sekarang</span>
          </button>
        </div>
      )}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 100 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 8px 0', color: 'white' }}>Direktori Komunitas & Instansi</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Temukan komunitas kreatif pilihan dan bergabunglah untuk mengikuti event/kompetisi khusus anggota mereka.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text"
              placeholder="Cari nama atau deskripsi komunitas..."
              value={communitySearchQuery}
              onChange={(e) => setCommunitySearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '30px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', whiteSpace: 'nowrap' }}>Regional:</span>
            <div style={{ flex: 1 }}>
              <SearchableSelect 
                value={communityRegionalFilter}
                onChange={(val) => setCommunityRegionalFilter(val === "Semua Regional" ? "" : val)}
                placeholder="Semua Regional"
                options={["Semua Regional", ...regions]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="community-portal-list-container">
        {(() => {
          const filtered = communities
            .filter(comm => !currentUser || comm.username.toLowerCase() !== currentUser.username.toLowerCase())
            .filter(comm => {
              if (!communityRegionalFilter) return true;
              return comm.userRegional && comm.userRegional.toLowerCase().trim() === communityRegionalFilter.toLowerCase().trim();
            })
            .filter(comm => {
              const query = communitySearchQuery.toLowerCase().trim();
              if (!query) return true;
              return (comm.name || '').toLowerCase().includes(query) || 
                     (comm.username || '').toLowerCase().includes(query) || 
                     (comm.description || '').toLowerCase().includes(query);
            });

          if (filtered.length === 0) {
            return (
              <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Tidak ada komunitas yang cocok dengan pencarian Anda.
              </div>
            );
          }

          return filtered.map(comm => {
            const members = comm.joinedMembers || [];
            const targetLocal = Number(comm.activeMembersCount || 0);
            const currentLocal = members.length;
            const percentageLocal = targetLocal > 0 ? (currentLocal / targetLocal) * 100 : 0;
            const commSlug = slugify(comm.name || comm.username) + '-' + comm.id;

            return (
              <div 
                key={comm.id}
                className="glass-panel community-portal-card"
                onClick={() => {
                  if (!currentUser) {
                    handleOpenLoginModal('register');
                    return;
                  }
                  setSelectedCommunityId(comm.id);
                  window.history.pushState(null, '', '/community/' + commSlug);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                style={{ 
                  borderRadius: '12px', 
                  padding: '18px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(15, 15, 15, 0.45)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  flexWrap: 'wrap',
                  width: '100%',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 15, 15, 0.45)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
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
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={comm.name || comm.username}>
                      {comm.name || comm.username}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Kategori: Agensi / Komunitas</span>
                  </div>
                </div>

                {/* 2. Middle Block: Recruitment & Positions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px', flex: '1.5', textAlign: 'left' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', flex: '1', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Kekuatan Crew:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{currentLocal}/{targetLocal}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--primary-glow)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, percentageLocal)}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
