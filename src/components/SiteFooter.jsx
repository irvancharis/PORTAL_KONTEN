import React from 'react';
import { Mail, Lock } from 'lucide-react';

export default function SiteFooter({ onOpenLegal }) {
  return (
    <footer style={{
      width: '100%',
      background: 'var(--bg-card, #ffffff)',
      borderTop: '1px solid var(--border-color, #e2e8f0)',
      color: 'var(--text-secondary, #64748b)',
      fontFamily: "'Outfit', -apple-system, sans-serif",
      boxSizing: 'border-box',
      marginTop: 'auto',
      padding: '24px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Top Minimalist Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Brand & Brief */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.3px' }}>
              ngonten.id
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              • Ekosistem Kolaborasi & Campaign Kreator
            </span>
          </div>

          {/* Quick Legal Links (Inline & Clean) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '0.82rem'
          }}>
            <button 
              onClick={() => onOpenLegal && onOpenLegal('terms')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #64748b)', cursor: 'pointer', padding: 0, fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary, #0f172a)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary, #64748b)'}
            >
              Syarat & Ketentuan
            </button>
            <span style={{ color: 'var(--border-color, #cbd5e1)' }}>•</span>
            <button 
              onClick={() => onOpenLegal && onOpenLegal('privacy')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #64748b)', cursor: 'pointer', padding: 0, fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary, #0f172a)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary, #64748b)'}
            >
              Kebijakan Privasi
            </button>
            <span style={{ color: 'var(--border-color, #cbd5e1)' }}>•</span>
            <button 
              onClick={() => onOpenLegal && onOpenLegal('refund')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary, #64748b)', cursor: 'pointer', padding: 0, fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary, #0f172a)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary, #64748b)'}
            >
              Kebijakan Refund
            </button>
            <span style={{ color: 'var(--border-color, #cbd5e1)' }}>•</span>
            <a 
              href="mailto:harusbisangonten@gmail.com"
              style={{ textDecoration: 'none', color: 'var(--text-secondary, #64748b)', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary, #0f172a)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary, #64748b)'}
            >
              <Mail size={13} />
              <span>Bantuan</span>
            </a>
          </div>
        </div>

        {/* Bottom Sub-row */}
        <div style={{
          borderTop: '1px solid var(--border-color, #f1f5f9)',
          paddingTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #94a3b8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} style={{ color: '#10b981' }} />
            <span>256-Bit SSL Secured</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} ngonten.id. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
