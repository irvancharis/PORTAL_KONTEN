import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Trophy, 
  Users, 
  Wallet, 
  Crown, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  X 
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'portal-user-tour-completed-v1';

export default function AppTourModal({ 
  currentUser, 
  onNavigateTab,
  onOpenPremium
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Cek apakah user sudah pernah menyelesaikan atau menutup tour
    const isCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!isCompleted) {
      // Buka otomatis dengan jeda singkat agar halaman selesai render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const tourSteps = [
    {
      title: "Selamat Datang di ngonten.id!",
      subtitle: "Platform Ekosistem Industri Kreatif Indonesia",
      desc: "Wadah kolaborasi terbaik yang mempertemukan Brand & Penyelenggara Kampanye dengan Kreator Konten, Komunitas, dan Talenta Kreatif secara langsung.",
      icon: Sparkles,
      tag: "Pengenalan Platform",
      actionLabel: "Mulai Jelajahi Fitur",
      highlightTab: "discover"
    },
    {
      title: "Ikuti Kampanye & Kompetisi Berhadiah",
      subtitle: "Asah Kreativitas & Raih Penghargaan",
      desc: "Temukan berbagai kompetisi video, event kreatif, dan tugas kampanye brand. Dapatkan hadiah tunai, poin reputasi, dan e-tiket resmi yang terverifikasi.",
      icon: Trophy,
      tag: "Fitur Kampanye",
      actionLabel: "Lihat Fitur Kampanye",
      highlightTab: "events"
    },
    {
      title: "Bangun Jejaring dengan Komunitas",
      subtitle: "Kolaborasi Antar Kreator & Kota",
      desc: "Bergabunglah dengan komunitas kreator lokal di berbagai daerah Indonesia. Ikuti agenda rutin, temu karya, dan sharing session bersama praktisi industri.",
      icon: Users,
      tag: "Fitur Komunitas",
      actionLabel: "Eksplor Komunitas",
      highlightTab: "communities"
    },
    {
      title: "Dompet Kreator & Penarikan Otomatis",
      subtitle: "Transparansi Finansial & Hasil Karya",
      desc: "Pantau penghasilan benefit reward, hadiah kompetisi, dan transfer saldo langsung ke rekening Bank Anda dengan aman tanpa potongan tersembunyi.",
      icon: Wallet,
      tag: "Dompet & Finansial",
      actionLabel: "Paham Finansial",
      highlightTab: "wallet"
    },
    {
      title: "Upgrade Premium & Buka Peluang Eksklusif",
      subtitle: "Keuntungan Maksimal untuk Kreator Aktif",
      desc: "Nikmati akses tanpa batas ke seluruh event sponsor, prioritas review tugas, sertifikat digital resmi, dan lencana Member Premium terpercaya.",
      icon: Crown,
      tag: "Akses Eksklusif",
      actionLabel: "Siap Mulai Berkarya!",
      highlightTab: null
    }
  ];

  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      
      const nextStep = tourSteps[nextIndex];
      if (nextStep.highlightTab && onNavigateTab) {
        onNavigateTab(nextStep.highlightTab);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      
      const prevStep = tourSteps[prevIndex];
      if (prevStep.highlightTab && onNavigateTab) {
        onNavigateTab(prevStep.highlightTab);
      }
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === tourSteps.length - 1;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="tour-card animate-fade-in"
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '20px',
          border: '1.5px solid #334155',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          padding: '28px 24px',
          position: 'relative',
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
          title="Lewati Tour"
        >
          <X size={18} color="#cbd5e1" />
        </button>

        {/* Tag / Badge Kategori Step */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '0.72rem',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {step.tag}
          </span>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: '600' }}>
            Langkah {currentStep + 1} dari {tourSteps.length}
          </span>
        </div>

        {/* Icon & Judul Utama */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)'
          }}>
            <StepIcon size={26} strokeWidth={2.4} color="#0f172a" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.3' }}>
              {step.title}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500', display: 'block', marginTop: '2px' }}>
              {step.subtitle}
            </span>
          </div>
        </div>

        {/* Deskripsi */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '0.88rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          borderTop: '1px solid #1e293b',
          paddingTop: '14px'
        }}>
          {step.desc}
        </p>

        {/* Step Indicators (Dots) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (tourSteps[idx].highlightTab && onNavigateTab) {
                  onNavigateTab(tourSteps[idx].highlightTab);
                }
              }}
              style={{
                width: idx === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentStep ? '#ffffff' : '#334155',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {/* Tombol Navigasi Bawah */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} color="#ffffff" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '10px',
                fontSize: '0.88rem',
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
              padding: '12px 18px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.92rem',
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
  );
}
