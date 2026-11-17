import React from 'react';
import { Shield, Mail, Lock, CheckCircle2, Globe } from 'lucide-react';

export default function SiteFooter({ onOpenLegal }) {
  return (
    <footer style={{
      width: '100%',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      color: '#475569',
      fontFamily: "'Outfit', -apple-system, sans-serif",
      boxSizing: 'border-box',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px 24px 24px'
      }}>
        {/* Main 3 Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '36px',
          marginBottom: '36px'
        }}>
          
          {/* Col 1: Platform Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000000', letterSpacing: '-0.3px' }}>
                ngonten.id
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: '1.6' }}>
              Platform ekosistem kreatif terpadu di Indonesia yang menghubungkan Brand & Penyelenggara Kampanye dengan Kreator Konten secara langsung.
            </p>
          </div>

          {/* Col 2: Legalitas & Kebijakan */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
              Pusat Kebijakan & Legal
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('terms')} 
                  style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.84rem', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', fontWeight: '500' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  <Shield size={14} style={{ color: '#0284c7' }} /> Syarat & Ketentuan Layanan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('privacy')} 
                  style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.84rem', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', fontWeight: '500' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  <Lock size={14} style={{ color: '#0284c7' }} /> Kebijakan Privasi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('refund')} 
                  style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.84rem', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', fontWeight: '500' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  <CheckCircle2 size={14} style={{ color: '#0284c7' }} /> Kebijakan Refund & Pembatalan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenLegal && onOpenLegal('contact')} 
                  style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.84rem', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', fontWeight: '500' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  <Globe size={14} style={{ color: '#0284c7' }} /> Kontak Layanan Konsumen
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Pelanggan & Kontak */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
              Kontak Customer Service
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ fontWeight: '500' }}>harusbisangonten@gmail.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontWeight: '500' }}>
              <Lock size={13} style={{ color: '#059669' }} /> 256-Bit SSL Encrypted
            </span>
          </div>
          <div>
            <span>© 2026 <strong>ngonten.id</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
