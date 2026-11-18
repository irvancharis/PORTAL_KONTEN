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
  CreditCard,
  FileCheck2,
  Calendar,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info
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
    if (!currentUser || (!currentUser.id && !currentUser.username)) {
      setIsOpen(false);
      return;
    }

    const userIdKey = currentUser.id || currentUser.username;
    const tourStorageKey = `portal-tour-completed-${userIdKey}-v3`;
    const isCompleted = localStorage.getItem(tourStorageKey);

    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Langkah-langkah tour lengkap untuk seluruh fitur aplikasi
  const tourSteps = [
    {
      title: "Selamat Datang di ngonten.id",
      subtitle: "Platform Ekosistem Kreatif Terpadu",
      desc: "Selamat datang! ngonten.id hadir untuk menjembatani kreator, komunitas perfilman, dan brand. Ikuti panduan singkat ini untuk memahami alur kerja dan seluruh fitur aplikasi dengan mudah.",
      icon: Sparkles,
      tag: "Langkah 1 • Pengenalan",
      tip: "Navigasi dapat diakses secara fleksibel dari sidebar desktop atau bilah navigasi bawah ponsel.",
      tipIcon: Info,
      targetId: null,
      tab: 'discover'
    },
    {
      title: "Pencarian Cerdas & Terpadu",
      subtitle: "Filter Event, Kompetisi, & Kreator",
      desc: "Temukan kampanye aktif, festival video, kreator berbakat, atau komunitas daerah hanya dengan mengetik kata kunci pada kolom pencarian di bagian atas.",
      icon: Search,
      tag: "Langkah 2 • Navigasi Cepat",
      tip: "Ketik kata kunci dan tekan Enter untuk langsung melihat hasil yang relevan secara instan.",
      tipIcon: Lightbulb,
      targetId: "tour-navbar-search",
      tab: 'discover'
    },
    {
      title: "Eksplorasi Kampanye & Kompetisi",
      subtitle: "Raih Benefit Tunai, Hadiah, & E-Tiket",
      desc: "Halaman Kampanye memuat daftar tantangan video, lomba film, dan event kreatif dengan prize pool jutaan rupiah. Anda dapat memfilter event berdasarkan regional dan kategori.",
      icon: Trophy,
      tag: "Langkah 3 • Fitur Kampanye",
      tip: "Pilih menu Kampanye untuk melihat seluruh tantangan yang sedang aktif dibuka.",
      tipIcon: Zap,
      targetId: "tour-sidebar-events",
      fallbackTargetId: "tour-bottomnav-events",
      tab: 'events'
    },
    {
      title: "Detail & Ketentuan Juknis Event",
      subtitle: "Transparansi Penjurian & Sistem Payout",
      desc: "Setiap kartu event memuat panduan teknis (juknis), batas waktu pendaftaran, model perhitungan views, hingga estimasi reward. Klik salah satu event untuk melihat informasi lengkap.",
      icon: FileCheck2,
      tag: "Langkah 4 • Detail Kompetisi",
      tip: "Pastikan akun media sosial Anda sudah terverifikasi di profil sebelum mendaftar event.",
      tipIcon: Info,
      targetId: "tour-events-first-card",
      fallbackTargetId: "tour-sidebar-events",
      tab: 'events'
    },
    {
      title: "Buat Kampanye & Acara Anda",
      subtitle: "Wadah Publikasi Bagi Penyelenggara & Brand",
      desc: "Punya agenda festival, lomba film, atau kampanye pemasaran? Anda dapat membuat event baru, menentukan hadiah kompetisi, dan menjaring ribuan sineas berbakat di platform ini.",
      icon: Calendar,
      tag: "Langkah 5 • Penyelenggara",
      tip: "Tombol Buat Kampanye memandu Anda langkah demi langkah membuat event resmi.",
      tipIcon: Lightbulb,
      targetId: "tour-events-create-btn",
      fallbackTargetId: "tour-sidebar-events",
      tab: 'events'
    },
    {
      title: "Jejaring Komunitas Daerah",
      subtitle: "Kolaborasi Karya & Temu Kreator",
      desc: "Temukan komunitas videografer, editor, animator, dan fotografer terdekat di kota Anda. Bergabunglah dengan komunitas untuk mengikuti proyek kolaborasi lokal dan agenda meetup.",
      icon: Users,
      tag: "Langkah 6 • Komunitas",
      tip: "Bergabung dengan komunitas daerah membuka akses ke event eksklusif khusus anggota.",
      tipIcon: Zap,
      targetId: "tour-sidebar-communities",
      fallbackTargetId: "tour-bottomnav-communities",
      tab: 'communities'
    },
    {
      title: "Direktori & Profil Komunitas",
      subtitle: "Akses Agenda & Pengajuan Keanggotaan",
      desc: "Lihat daftar komunitas aktif di tiap regional. Anda dapat mengajukan permohonan keanggotaan dan melihat target kru serta agenda temu karya yang sedang dijadwalkan.",
      icon: Users,
      tag: "Langkah 7 • Eksplor Komunitas",
      tip: "Klik salah satu kartu komunitas untuk melihat profil, visi, dan jadwal kegiatannya.",
      tipIcon: Info,
      targetId: "tour-community-first-card",
      fallbackTargetId: "tour-sidebar-communities",
      tab: 'communities'
    },
    {
      title: "Dompet Kreator & Pencairan Dana",
      subtitle: "Transparansi Penuh atas Hasil Karya Anda",
      desc: "Semua reward penayangan (views payout), hadiah juara event, dan fee afiliasi otomatis terkumpul rapi di Dompet Kreator Anda dengan catatan mutasi yang jelas.",
      icon: Wallet,
      tag: "Langkah 8 • Finansial Kreator",
      tip: "Semua saldo di dompet dapat ditarik langsung ke rekening Bank atau E-Wallet.",
      tipIcon: Zap,
      targetId: "tour-sidebar-wallet",
      fallbackTargetId: "tour-bottomnav-wallet",
      tab: 'wallet'
    },
    {
      title: "Pencairan Saldo & Mutasi Transaksi",
      subtitle: "Tarik Dana Tanpa Potongan Tersembunyi",
      desc: "Gunakan tombol Tarik Saldo untuk mengirim dana ke Bank atau E-Wallet Anda (DANA, OVO, GoPay). Pantau status mutasi masuk dan keluar secara realtime pada tabel riwayat.",
      icon: CreditCard,
      tag: "Langkah 9 • Tarik Saldo",
      tip: "Periksa keakuratan nama dan nomor rekening bank penerima sebelum konfirmasi.",
      tipIcon: Lightbulb,
      targetId: "tour-wallet-withdraw-btn",
      fallbackTargetId: "tour-wallet-metrics",
      tab: 'wallet'
    },
    {
      title: "Pusat Notifikasi Realtime",
      subtitle: "Update Seleksi, Persetujuan, & Hadiah",
      desc: "Ikon lonceng akan memberi tahu Anda secara instan saat pendaftaran event disetujui, karya dinilai dewan juri, ada undangan kolaborasi baru, atau pencairan saldo berhasil ditransfer.",
      icon: Bell,
      tag: "Langkah 10 • Notifikasi",
      tip: "Klik lonceng notifikasi untuk langsung diarahkan ke event atau transaksi terkait.",
      tipIcon: Info,
      targetId: "tour-navbar-notif",
      tab: 'discover'
    },
    {
      title: "Upgrade Member Premium & Eksklusif",
      subtitle: "Akses Prioritas Tanpa Batas",
      desc: "Nikmati potongan biaya penarikan lebih hemat, prioritas kurasi karya oleh juri, lencana verified profil, dan akses penuh ke event brand eksklusif tingkat nasional.",
      icon: Crown,
      tag: "Langkah 11 • Fitur Premium",
      tip: "Akun Premium membuka peluang kolaborasi langsung dengan brand terkemuka.",
      tipIcon: Zap,
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
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Re-read rect after scroll adjustment
        const updatedRect = targetEl.getBoundingClientRect();
        setTargetRect({
          top: updatedRect.top,
          left: updatedRect.left,
          width: updatedRect.width,
          height: updatedRect.height,
          bottom: updatedRect.bottom,
          right: updatedRect.right
        });
      } else {
        setTargetRect(null);
      }
    };

    const timer = setTimeout(updateRect, 240);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStep, isOpen, currentStepData]);

  const handleClose = () => {
    if (currentUser) {
      const userIdKey = currentUser.id || currentUser.username;
      localStorage.setItem(`portal-tour-completed-${userIdKey}-v3`, 'true');
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
  const TipIconComponent = currentStepData.tipIcon || Info;
  const isLast = currentStep === tourSteps.length - 1;

  // Cek apakah target ada di layar untuk posisi kartu yang pintar (smart positioning)
  const isTargetAtTop = targetRect && targetRect.top < 220;
  const isTargetAtBottom = targetRect && targetRect.bottom > window.innerHeight - 240;

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
            <mask id="tour-spotlight-mask-v3">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="14"
                ry="14"
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
            mask="url(#tour-spotlight-mask-v3)"
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
            borderRadius: '14px',
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.35), 0 0 25px rgba(255, 255, 255, 0.55)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
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
          alignItems: isTargetAtTop ? 'flex-end' : isTargetAtBottom ? 'flex-start' : 'center',
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
            maxWidth: '470px',
            borderRadius: '24px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.45), 0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            position: 'relative',
            textAlign: 'left'
          }}
        >
          {/* Top Elegant Header Band (Hitam Pekat Kontras Tinggi) */}
          <div style={{
            backgroundColor: '#0f172a',
            padding: '20px 24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
              }}>
                <StepIcon size={22} strokeWidth={2.4} color="#0f172a" />
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
                  fontSize: '0.96rem',
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
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
              <X size={16} color="#ffffff" strokeWidth={2.4} />
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
              color: '#334155',
              lineHeight: '1.65'
            }}>
              {currentStepData.desc}
            </p>

            {/* Smart Friendly Tip Box with Flat Vector Icon */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              color: '#1e293b',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '22px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                <TipIconComponent size={12} strokeWidth={2.5} color="#ffffff" />
              </div>
              <span style={{ lineHeight: '1.5' }}>{currentStepData.tip}</span>
            </div>

            {/* Step Progress Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '22px',
              padding: '0 2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    style={{
                      width: idx === currentStep ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '4px',
                      backgroundColor: idx === currentStep ? '#0f172a' : '#cbd5e1',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer'
                    }}
                    title={`Langkah ${idx + 1}`}
                  />
                ))}
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                color: '#64748b'
              }}>
                {currentStep + 1} dari {tourSteps.length}
              </span>
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
                  <ArrowLeft size={16} strokeWidth={2.4} color="#0f172a" />
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
                    fontWeight: '700',
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
                <span>{isLast ? 'Selesai & Mulai Eksplorasi' : 'Lanjut Panduan'}</span>
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
