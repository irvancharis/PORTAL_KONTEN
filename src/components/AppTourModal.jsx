import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Wallet, 
  Search, 
  Bell, 
  Crown, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Compass,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function AppTourModal({ 
  currentUser, 
  onNavigateTab,
  onOpenPremium
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  // 1. TOUR HANYA MUNCUL BAGI PENGGUNA YANG BERHASIL LOGIN
  useEffect(() => {
    if (!currentUser || !currentUser.id && !currentUser.username) {
      setIsOpen(false);
      return;
    }

    const userIdKey = currentUser.id || currentUser.username;
    const tourStorageKey = `portal-tour-completed-${userIdKey}-v2`;
    const isCompleted = localStorage.getItem(tourStorageKey);

    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const tourSteps = [
    {
      title: "Selamat Datang di ngonten.id!",
      subtitle: "Platform Ekosistem Kreatif Terpadu",
      desc: "Hai kreator! Terima kasih telah bergabung. Mari kenali fitur-fitur penting yang siap membantu Anda mengikuti kampanye berhadiah, berjejaring dengan komunitas, dan mengelola hasil karya secara profesional.",
      icon: Sparkles,
      tag: "Langkah 1 • Pengenalan",
      tip: "💡 Eksplorasi seluruh fitur kapan saja melalui navigasi utama.",
      targetId: null,
      tab: 'discover'
    },
    {
      title: "Pencarian Cerdas & Cepat",
      subtitle: "Temukan Event, Kompetisi, & Kreator",
      desc: "Cari kompetisi video aktif, peluang kolaborasi brand, karya talenta kreatif, atau komunitas daerah Anda hanya dengan mengetik kata kunci pada kolom pencarian di bagian atas.",
      icon: Search,
      tag: "Langkah 2 • Navigasi",
      tip: "🔍 Tekan Enter untuk langsung memfilter hasil pencarian.",
      targetId: "tour-navbar-search",
      tab: 'discover'
    },
    {
      title: "Ikuti Kampanye & Kompetisi Berhadiah",
      subtitle: "Raih Benefit Tunai, Pengakuan, & E-Tiket",
      desc: "Jelajahi beragam event video, festival film, dan tantangan brand. Cek panduan teknis (juknis), kirimkan link karya Anda, dan peroleh e-tiket resmi bertanda tangan digital aman.",
      icon: Trophy,
      tag: "Langkah 3 • Kampanye",
      tip: "🏆 Pastikan akun sosial media Anda sudah terhubung di profil.",
      targetId: "tour-sidebar-events",
      fallbackTargetId: "tour-bottomnav-events",
      tab: 'events'
    },
    {
      title: "Jejaring Komunitas Kreator Daerah",
      subtitle: "Wadah Silaturahmi & Kolaborasi Karya",
      desc: "Bangun koneksi bersama rekan videografer, editor, animator, dan fotografer di kota Anda. Ikuti temu karya, mentoring rutin, dan proyek kolaboratif bersama.",
      icon: Users,
      tag: "Langkah 4 • Komunitas",
      tip: "🤝 Gabung komunitas daerah untuk peluang proyek lokal.",
      targetId: "tour-sidebar-communities",
      fallbackTargetId: "tour-bottomnav-communities",
      tab: 'communities'
    },
    {
      title: "Dompet Kreator & Pencairan Dana",
      subtitle: "Transparansi Penuh atas Hasil Karya Anda",
      desc: "Semua reward event, hadiah kompetisi, dan bonus kemitraan terkumpul rapi di dompet Anda. Anda dapat menarik saldo langsung ke rekening Bank atau E-Wallet tanpa potongan tersembunyi.",
      icon: Wallet,
      tag: "Langkah 5 • Finansial",
      tip: "💳 Pastikan nomor rekening dan nama bank diisi dengan benar.",
      targetId: "tour-bottomnav-wallet",
      tab: 'wallet'
    },
    {
      title: "Pusat Notifikasi Realtime",
      subtitle: "Kabar Persetujuan & Seleksi Tugas",
      desc: "Ikon lonceng ini akan memberi tahu Anda secara instan ketika pendaftaran event disetujui, karya dinilai juri, atau pencairan saldo berhasil dikirim.",
      icon: Bell,
      tag: "Langkah 6 • Notifikasi",
      tip: "🔔 Periksa lonceng secara berkala untuk update penting.",
      targetId: "tour-navbar-notif",
      tab: 'discover'
    },
    {
      title: "Upgrade Member Premium",
      subtitle: "Maksimalkan Peluang Karir Kreatif Anda",
      desc: "Dapatkan akses tanpa batas ke event eksklusif brand ternama, prioritas peninjauan tugas juri, lencana profil terpercaya, dan fasilitas kurasi portofolio unggulan.",
      icon: Crown,
      tag: "Langkah 7 • Akses Eksklusif",
      tip: "⭐ Member Premium menikmati kemudahan akses prioritas.",
      targetId: null,
      tab: 'discover'
    }
  ];

  const currentStepData = tourSteps[currentStep];

  // Efek penyorotan elemen UI target
  useEffect(() => {
    if (!isOpen) return;

    if (currentStepData.tab && onNavigateTab) {
      onNavigateTab(currentStepData.tab);
    }

    const updateRect = () => {
      let targetEl = null;
      if (currentStepData.targetId) {
        targetEl = document.getElementById(currentStepData.targetId);
      }
      if (!targetEl && currentStepData.fallbackTargetId) {
        targetEl = document.getElementById(currentStepData.fallbackTargetId);
      }

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updateRect, 220);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, isOpen, currentStepData]);

  const handleClose = () => {
    if (currentUser) {
      const userIdKey = currentUser.id || currentUser.username;
      localStorage.setItem(`portal-tour-completed-${userIdKey}-v2`, 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Jangan render jika belum login atau tour ditutup
  if (!isOpen || !currentUser) return null;

  const StepIcon = currentStepData.icon;
  const isLast = currentStep === tourSteps.length - 1;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      pointerEvents: 'auto',
      overflow: 'hidden',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>
      {/* Dynamic SVG Spotlight Cutout Backdrop */}
      {targetRect ? (
        <svg
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'auto',
            zIndex: 1
          }}
          onClick={handleClose}
        >
          <defs>
            <mask id="tour-spotlight-mask-v2">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                ry="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.82)"
            mask="url(#tour-spotlight-mask-v2)"
          />
        </svg>
      ) : (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1
          }} 
          onClick={handleClose}
        />
      )}

      {/* Spotlight Ring Border Glow */}
      {targetRect && (
        <div 
          style={{
            position: 'fixed',
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: '16px',
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.3), 0 0 35px rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      )}

      {/* Main Tour Modal Card Container */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="animate-fade-in"
          style={{
            pointerEvents: 'auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            width: '100%',
            maxWidth: '460px',
            borderRadius: '24px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            textAlign: 'left'
          }}
        >
          {/* Top Elegant Header Band (Hitam Pekat Kontras Tinggi) */}
          <div style={{
            backgroundColor: '#0f172a',
            padding: '22px 24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
              }}>
                <StepIcon size={22} strokeWidth={2.5} color="#0f172a" />
              </div>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  display: 'block'
                }}>
                  {currentStepData.tag}
                </span>
                <span style={{
                  fontSize: '0.98rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  display: 'block',
                  marginTop: '1px'
                }}>
                  {currentStepData.subtitle}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Lewati Tur"
            >
              <X size={16} color="#ffffff" />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px 24px 22px 24px' }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.3px',
              lineHeight: '1.3'
            }}>
              {currentStepData.title}
            </h3>

            <p style={{
              margin: '0 0 18px 0',
              fontSize: '0.88rem',
              color: '#475569',
              lineHeight: '1.65'
            }}>
              {currentStepData.desc}
            </p>

            {/* Smart Friendly Tip Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              color: '#334155',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '22px'
            }}>
              <span>{currentStepData.tip}</span>
            </div>

            {/* Step Progress Dots */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '22px'
            }}>
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  style={{
                    width: idx === currentStep ? '24px' : '7px',
                    height: '7px',
                    borderRadius: '4px',
                    backgroundColor: idx === currentStep ? '#0f172a' : '#cbd5e1',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  title={`Langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Tombol Aksi Bawah */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f1f5f9',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <ArrowLeft size={16} color="#0f172a" />
                  <span>Kembali</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Lewati
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: '12px 18px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <span>{isLast ? 'Selesai & Mulai Berkarya' : 'Lanjut Panduan'}</span>
                {isLast ? (
                  <Check size={16} strokeWidth={3} color="#ffffff" />
                ) : (
                  <ArrowRight size={16} strokeWidth={2.5} color="#ffffff" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
