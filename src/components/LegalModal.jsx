import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '88vh',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#1e293b',
          fontFamily: "'Outfit', -apple-system, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                Pusat Kebijakan & Legalitas ngonten.id
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Kepatuhan Standar Penyelenggaraan Sistem Elektronik & Pembayaran</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'terms', label: 'Syarat & Ketentuan', icon: FileText },
            { id: 'privacy', label: 'Kebijakan Privasi', icon: Lock },
            { id: 'refund', label: 'Kebijakan Refund', icon: RefreshCw },
            { id: 'contact', label: 'Kontak Layanan', icon: Phone }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: isActive ? '1px solid #0f172a' : '1px solid transparent',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          fontSize: '0.88rem',
          lineHeight: '1.7',
          color: '#334155',
          maxHeight: 'calc(88vh - 160px)',
          background: '#ffffff'
        }}>
          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>
                  SYARAT DAN KETENTUAN LAYANAN (TERMS OF SERVICE)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pembaruan Terakhir: 5 September 2026</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    1. Definisi & Ruang Lingkup
                  </h4>
                  <p style={{ margin: 0 }}>
                    <strong>ngonten.id</strong> adalah platform ekosistem digital yang memfasilitasi publikasi kampanye konten kreatif, kompetisi video, dan kolaborasi antara Penyelenggara/Brand dengan Konten Kreator.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    2. Akun & Keamanan Transaksi
                  </h4>
                  <p style={{ margin: 0 }}>
                    Pengguna bertanggung jawab atas validitas data akun (email & nomor telepon). Setiap pembayaran layanan atau kampanye yang telah diverifikasi akan tercatat secara permanen pada invoice transaksi resmi.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    3. Metode Pembayaran & Saluran Resmi
                  </h4>
                  <p style={{ margin: '0 0 6px 0' }}>
                    Transaksi pembayaran dilakukan melalui transfer langsung ke Rekening Resmi Bank Mandiri:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li>Bank: <strong>Bank Mandiri</strong></li>
                    <li>No. Rekening: <strong>127-000-999-888</strong></li>
                    <li>Atas Nama: <strong>PT Ngonten Media Indonesia</strong></li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    4. Penyaluran Reward & Perlindungan Karya
                  </h4>
                  <p style={{ margin: 0 }}>
                    Alokasi reward kampanye disalurkan ke akun pemenang setelah kurasi selesai sesuai ketentuan penyelenggara. Platform melarang konten plagiarisme, pornografi, maupun aktivitas ilegal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>
                  KEBIJAKAN PRIVASI & PERLINDUNGAN DATA (PRIVACY POLICY)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Standar Keamanan Enkripsi SSL 256-Bit</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    1. Data yang Dikumpulkan
                  </h4>
                  <p style={{ margin: 0 }}>
                    Kami mengumpulkan data pendaftaran akun (nama, email, nomor WhatsApp) dan detail pencairan reward (nama bank & nomor rekening/e-wallet) untuk memproses verifikasi dan transaksi Anda.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    2. Kerahasiaan & Non-Disclosure
                  </h4>
                  <p style={{ margin: 0 }}>
                    ngonten.id menjamin kerahasiaan data pribadi Anda dan tidak akan pernah menjual atau membagikan informasi pribadi kepada pihak ketiga untuk kepentingan periklanan di luar ekosistem platform.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>
                  KEBIJAKAN PENGEMBALIAN DANA (REFUND & CANCELLATION POLICY)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prosedur Pengembalian Dana Konsumen</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    1. Syarat Pengajuan Pengembalian Dana
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li>Terjadi kendala teknis gateway pembayaran atau tagihan ganda.</li>
                    <li>Layanan langganan PRO atau aktivasi kampanye gagal aktif dalam 1x24 jam.</li>
                    <li>Pembatalan kampanye oleh penyelenggara sebelum jadwal kampanye dimulai.</li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    2. Alur Klaim & Waktu Pengembalian
                  </h4>
                  <p style={{ margin: 0 }}>
                    Kirimkan bukti invoice & mutasi pembayaran ke <strong>harusbisangonten@gmail.com</strong>. Dana yang disetujui akan dikembalikan langsung ke rekening/e-wallet pengirim dalam waktu <strong>1–3 hari kerja</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>
                  KONTAK LAYANAN KONSUMEN & INFORMASI PERUSAHAAN
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bantuan Operasional Resmi ngonten.id</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 'bold', marginBottom: '6px' }}>
                    <Mail size={18} /> Email Dukungan Resmi
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.95rem' }}>harusbisangonten@gmail.com</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Layanan bantuan dan verifikasi pengguna</span>
                </div>

                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: 'bold', marginBottom: '6px' }}>
                    <MapPin size={18} /> Lokasi Usaha
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.95rem' }}>Bululawang, Kabupaten Malang</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Jawa Timur, Indonesia</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
