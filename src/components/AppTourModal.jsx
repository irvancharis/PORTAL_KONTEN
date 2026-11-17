import React, { useState, useEffect, useRef } from 'react';
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
  Compass
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'portal-user-tour-completed-v1';

export default function AppTourModal({ 
  currentUser, 
  onNavigateTab,
  onOpenPremium
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const isCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const tourSteps = [
    {
      title: "Selamat Datang di ngonten.id!",
      subtitle: "Pusat Kolaborasi Kreator, Brand, & Komunitas",
      desc: "ngonten.id menghubungkan ekosistem kreatif di seluruh Indonesia. Anda dapat berpartisipasi dalam kampanye berhadiah, membangun komunitas, memantau penghasilan dompet, dan menerbitkan e-tiket resmi.",
      icon: Sparkles,
      tag: "Pengenalan Platform",
      actionLabel: "Mulai Tur Eksplorasi",
      targetId: null,
      tab: 'discover'
    },
    {
      title: "Pencarian Cerdas & Eksplorasi Cepat",
      subtitle: "Navigasi Instan ke Konten & Kampanye",
      desc: "Gunakan kolom pencarian di header atas untuk menemukan event lomba, kompetisi video aktif, profil kreator idola, atau topik komunitas lokal secara instan.",
      icon: Search,
      tag: "Fitur Pencarian",
      actionLabel: "Lanjut ke Menu Kampanye",
      targetId: "tour-navbar-search",
      tab: 'discover'
    },
    {
      title: "Jelajahi & Ikuti Kampanye Kreatif",
      subtitle: "Raih Hadiah, Sertifikat, & E-Tiket Resmi",
      desc: "Menu Kampanye memuat daftar kompetisi video, event workshop, dan tantangan brand sponsor. Klik untuk membaca petunjuk teknis (juknis), mendaftar, dan mengunggah karya Anda.",
      icon: Trophy,
      tag: "Menu Utama: Kampanye",
      actionLabel: "Lanjut ke Komunitas",
      targetId: "tour-sidebar-events",
      fallbackTargetId: "tour-bottomnav-events",
      tab: 'events'
    },
    {
      title: "Jejaring Komunitas Kreator Indonesia",
      subtitle: "Wadah Silaturahmi & Kolaborasi Karya",
      desc: "Temukan wadah komunitas videografer, editor, animator, dan content creator sesuai kota domisili Anda. Bergabunglah untuk mengikuti agenda temu karya dan mentoring berkala.",
      icon: Users,
      tag: "Menu Utama: Komunitas",
      actionLabel: "Lanjut ke Dompet",
      targetId: "tour-sidebar-communities",
      fallbackTargetId: "tour-bottomnav-communities",
      tab: 'communities'
    },
    {
      title: "Dompet Finansial & Transparansi Benefit",
      subtitle: "Pantau Saldo & Tarik Dana Langsung",
      desc: "Seluruh reward kemenangan event, insentif kreator, dan komisi afiliasi tercatat transparan di menu Dompet. Anda dapat mencairkan saldo kapan saja langsung ke rekening Bank Anda.",
      icon: Wallet,
      tag: "Menu Dompet & Benefit",
      actionLabel: "Lanjut ke Notifikasi",
      targetId: "tour-bottomnav-wallet",
      tab: 'wallet'
    },
    {
      title: "Pemberitahuan & Update Otomatis",
      subtitle: "Informasi Seleksi & Persetujuan Tugas",
      desc: "Ikon Lonceng di pojok kanan atas akan memberi kabar secara realtime saat karya Anda dinilai juri, tiket masuk disetujui panitia, atau pencairan saldo berhasil diproses.",
      icon: Bell,
      tag: "Pusat Notifikasi",
      actionLabel: "Lanjut ke Member Premium",
      targetId: "tour-navbar-notif",
      tab: 'discover'
    },
    {
      title: "Upgrade Member Premium",
      subtitle: "Buka Potensi Maksimal Karya Anda",
      desc: "Jadilah Member Premium untuk menikmati prioritas review karya, verifikasi profil eksklusif, e-tiket VIP, serta akses ke seluruh kompetisi brand berhadiah tinggi.",
      icon: Crown,
      tag: "Akses Eksklusif",
      actionLabel: "Siap Mulai Berkarya!",
      targetId: null,
      tab: 'discover'
    }
  ];

  const currentStepData = tourSteps[currentStep];

  // Efek untuk mencari dan menyorot elemen UI target
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

    const timer = setTimeout(updateRect, 250);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, isOpen, currentStepData]);

  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
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

  if (!isOpen) return null;

  const StepIcon = currentStepData.icon;
  const isLast = currentStep === tourSteps.length - 1;

  let popoverStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '430px',
    margin: 'auto'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      pointerEvents: 'auto',
      overflow: 'hidden'
    }}>
      {/* Dynamic Cutout Overlay Backdrop */}
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
            <mask id="tour-spotlight-mask">
              {/* Putih menutup seluruh layar */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Hitam melubangi elemen yang disorot */}
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
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
            fill="rgba(0, 0, 0, 0.78)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      ) : (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1
          }} 
          onClick={handleClose}
        />
      )}

      {/* Spotlight Ring Border Animasi di Sekitar Elemen yang Disorot */}
      {targetRect && (
        <div 
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: '14px',
            border: '2.5px solid #ffffff',
            boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.25), 0 0 25px rgba(255, 255, 255, 0.5)',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      )}

      {/* Main Tour Card Dialog Container */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="tour-card animate-fade-in"
          style={{
            ...popoverStyle,
            pointerEvents: 'auto',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid #334155',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0,0,0,0.5)',
            padding: '26px 22px',
            textAlign: 'left'
          }}
        >
          {/* Tombol Tutup / Lewati */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
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
            <X size={18} color="#cbd5e1" />
          </button>

          {/* Tag & Info Langkah */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {currentStepData.tag}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '600' }}>
              Langkah {currentStep + 1} dari {tourSteps.length}
            </span>
          </div>

          {/* Icon & Judul Utama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
            }}>
              <StepIcon size={24} strokeWidth={2.4} color="#0f172a" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.3' }}>
                {currentStepData.title}
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: '500', display: 'block', marginTop: '2px' }}>
                {currentStepData.subtitle}
              </span>
            </div>
          </div>

          {/* Deskripsi Edukasi Fitur */}
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '0.86rem',
            color: '#cbd5e1',
            lineHeight: '1.6',
            borderTop: '1px solid #1e293b',
            paddingTop: '12px'
          }}>
            {currentStepData.desc}
          </p>

          {/* Step Indicators Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  backgroundColor: idx === currentStep ? '#ffffff' : '#334155',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {/* Navigasi Aksi Bawah */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  flex: 1,
                  padding: '11px',
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={16} color="#ffffff" />
                <span>Kembali</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '11px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  cursor: 'pointer'
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
                padding: '11px 16px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)'
              }}
            >
              <span>{isLast ? 'Selesai & Mulai' : 'Lanjut'}</span>
              {isLast ? <Check size={16} strokeWidth={3} color="#0f172a" /> : <ArrowRight size={16} strokeWidth={2.5} color="#0f172a" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
