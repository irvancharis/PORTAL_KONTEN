import React from 'react';
import { Check, Sparkles, Shield, Crown, Building2, ArrowRight, Lock, Landmark } from 'lucide-react';

export default function PricingCatalogSection({ onSelectPlan, onOpenLegal }) {
  const plans = [
    {
      id: 'creator_starter',
      name: 'Creator Basic',
      category: 'Kreator Pemula',
      price: 'Gratis',
      period: '/ Selamanya',
      description: 'Akses pendaftaran kampanye publik dan submit karya video kreatif.',
      badge: null,
      icon: Sparkles,
      iconColor: '#94a3b8',
      features: [
        'Ikuti hingga 3 kampanye aktif',
        'Submit karya video & shorts',
        'Pencairan reward standar',
        'Dukungan komunitas kreator'
      ],
      ctaText: 'Mulai Gratis',
      isPopular: false
    },
    {
      id: 'creator_pro',
      name: 'Creator PRO Pass',
      category: 'Kreator Profesional',
      price: 'Rp 29.000',
      period: '/ bulan',
      description: 'Maksimalkan potensi cuan dengan analisis performa AI dan prioritas kurasi.',
      badge: 'Paling Populer',
      icon: Crown,
      iconColor: '#f59e0b',
      features: [
        'Ikuti SEMUA kampanye tanpa batas',
        'Badge PRO di profil & leaderboard',
        'AI Video Insight & Trend Predictor',
        'Prioritas kurasi karya oleh Brand',
        'Bebas biaya admin penarikan reward (0%)',
        'Support Customer Service Prioritas 24/7'
      ],
      ctaText: 'Langganan PRO Sekarang',
      isPopular: true
    },
    {
      id: 'brand_campaign',
      name: 'Brand Campaign Pass',
      category: 'Penyelenggara / Brand',
      price: 'Rp 250.000',
      period: '/ kampanye',
      description: 'Luncurkan kompetisi kreasi konten dengan sistem pengelolaan terstruktur.',
      badge: 'Untuk Bisnis & Brand',
      icon: Building2,
      iconColor: '#06b6d4',
      features: [
        'Publikasi kampanye ke ribuan kreator',
        'Sistem Alokasi Budget Hadiah Transparan',
        'Dashboard kurasi karya & analitik video',
        'Verifikasi karya otomatis & plagiarisme check',
        'Kanal distribusi hadiah multi-bank/e-wallet',
        'Laporan performa & jangkauan kampanye'
      ],
      ctaText: 'Buat Campaign Sekarang',
      isPopular: false
    }
  ];

  return (
    <section id="pricing-catalog" className="pricing-section-container">
      <div className="pricing-inner-wrap">
        {/* Header Title */}
        <div className="pricing-header-box">
          <div className="pricing-badge-pill">
            <Shield size={14} /> Transparan & Resmi
          </div>
          <h2 className="pricing-main-title">
            Katalog Layanan & Paket Harga <span style={{ color: '#06b6d4' }}>ngonten.id</span>
          </h2>
          <p className="pricing-main-subtitle">
            Pilih solusi terbaik untuk kebutuhan kolaborasi kreator maupun publikasi brand Anda dengan alur transaksi yang jelas.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-cards-grid">
          {plans.map((plan) => {
            const IconComp = plan.icon;
            return (
              <div
                key={plan.id}
                className={`pricing-card-item ${plan.isPopular ? 'pricing-card-popular' : ''}`}
              >
                {plan.badge && (
                  <div className="pricing-tag-float">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="pricing-card-header">
                    <div>
                      <span className="pricing-card-cat">{plan.category}</span>
                      <h3 className="pricing-card-name">{plan.name}</h3>
                    </div>
                    <div className="pricing-card-icon" style={{ color: plan.iconColor }}>
                      <IconComp size={24} />
                    </div>
                  </div>

                  <p className="pricing-card-desc">{plan.description}</p>

                  <div className="pricing-price-wrap">
                    <span className="pricing-price-amount">{plan.price}</span>
                    <span className="pricing-price-period">{plan.period}</span>
                  </div>

                  {/* Feature List */}
                  <ul className="pricing-features-list">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="pricing-feature-item">
                        <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <button
                    onClick={() => onSelectPlan && onSelectPlan(plan)}
                    className={`pricing-btn-action ${plan.isPopular ? 'pricing-btn-primary' : 'pricing-btn-secondary'}`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Badges Banner */}
        <div className="pricing-security-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '10px', color: '#60a5fa' }}>
              <Landmark size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Pembayaran Resmi Bank Mandiri
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Transfer langsung ke rekening Bank Mandiri resmi PT Ngonten Media Indonesia.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenLegal && onOpenLegal('refund')}
              style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Kebijakan Refund
            </button>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <button
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Syarat & Ketentuan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
