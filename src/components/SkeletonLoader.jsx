import React from 'react';

export function MovieCardSkeleton() {
  return (
    <div className="movie-card youtube-style skeleton-card">
      <div className="thumbnail-wrapper">
        <div className="skeleton-box skeleton-thumbnail" />
      </div>
      <div className="movie-info" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton-box skeleton-avatar" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-box skeleton-line" style={{ width: '85%', height: '14px' }} />
            <div className="skeleton-box skeleton-line" style={{ width: '55%', height: '11px' }} />
            <div className="skeleton-box skeleton-line" style={{ width: '40%', height: '10px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="glass-panel skeleton-card" style={{ padding: '16px', borderRadius: '16px' }}>
      <div className="skeleton-box skeleton-thumbnail" style={{ height: '160px', borderRadius: '12px' }} />
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton-box skeleton-line" style={{ width: '75%', height: '16px' }} />
        <div className="skeleton-box skeleton-line" style={{ width: '45%', height: '12px' }} />
        <div className="skeleton-box skeleton-line" style={{ width: '90%', height: '12px' }} />
      </div>
    </div>
  );
}

export function OfflineBanner({ isOffline, onRetry }) {
  if (!isOffline) return null;

  return (
    <div className="offline-floating-bar animate-fade-in">
      <div className="offline-content">
        <span className="offline-dot" />
        <span className="offline-text">Koneksi internet terputus. Mode offline aktif.</span>
      </div>
      {onRetry && (
        <button className="offline-retry-btn" onClick={onRetry}>
          Coba Lagi
        </button>
      )}
    </div>
  );
}
