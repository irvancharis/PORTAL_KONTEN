import React from 'react';

export default function PageLoadingSkeleton({ type = 'cards' }) {
  if (type === 'cards') {
    return (
      <div style={{ padding: '24px 0', width: '100%' }} className="animate-fade-in">
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-box" style={{ width: '180px', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '280px', height: '14px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-box" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
        </div>

        {/* Grid Skeleton */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div 
              key={i} 
              style={{ 
                padding: '16px', 
                borderRadius: '14px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--card-bg, rgba(255,255,255,0.02))',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div className="skeleton-box" style={{ width: '100%', height: '140px', borderRadius: '10px' }} />
              <div className="skeleton-box" style={{ width: '70%', height: '18px', borderRadius: '4px' }} />
              <div className="skeleton-box" style={{ width: '90%', height: '12px', borderRadius: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <div className="skeleton-box" style={{ width: '80px', height: '22px', borderRadius: '6px' }} />
                <div className="skeleton-box" style={{ width: '60px', height: '22px', borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generic content skeleton
  return (
    <div style={{ padding: '28px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div className="skeleton-box" style={{ width: '220px', height: '28px', borderRadius: '6px' }} />
      <div className="skeleton-box" style={{ width: '400px', height: '16px', borderRadius: '4px', marginBottom: '16px' }} />
      <div className="skeleton-box" style={{ width: '100%', height: '180px', borderRadius: '12px' }} />
      <div className="skeleton-box" style={{ width: '100%', height: '240px', borderRadius: '12px' }} />
    </div>
  );
}
