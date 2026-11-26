import React from 'react';
import { Mail } from 'lucide-react';

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
      padding: '12px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.76rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary, #0f172a)' }}>
            ngonten.id
          </strong>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: '500', fontSize: 'inherit' }}
          >
            Syarat &amp; Ketentuan
          </button>
          <span style={{ opacity: 0.4 }}>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: '500', fontSize: 'inherit' }}
          >
            Kebijakan Privasi
          </button>
          <span style={{ opacity: 0.4 }}>•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('refund')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: '500', fontSize: 'inherit' }}
          >
            Kebijakan Refund
          </button>
          <span style={{ opacity: 0.4 }}>•</span>
          <a
            href="mailto:support@ngonten.id"
            style={{ color: 'inherit', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Mail size={12} />
            <span>Bantuan</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
