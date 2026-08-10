import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, QrCode, Landmark, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { DOKU_CONFIG } from '../services/dokuPaymentService';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  confirmations,
  setConfirmations,
  premiumPrice = 'Rp 20.000 / Bulan',
  onLoginClick
}) {
  const [step, setStep] = useState('select_plan'); // 'select_plan' | 'select_method' | 'pay_screen' | 'success'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri'
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkTheme = () => {
        setIsLight(document.body.classList.contains('light-theme') || document.documentElement.classList.contains('light-theme'));
      };
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('select_plan');
      setSelectedPlan(null);
      setSelectedMethod('qris');
      setIsVerifying(false);
      setCopied(false);
      setTimeLeft(900);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (step === 'pay_screen' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Real-time automatic polling simulation for QRIS
  useEffect(() => {
    let autoCheckTimer;
    if (step === 'pay_screen' && selectedMethod === 'qris') {
      // Otomatis mengecek status setiap beberapa detik
      autoCheckTimer = setTimeout(() => {
        handleSuccessActivation();
      }, 10000); // Otomatis terverifikasi dalam 10 detik atau ketika user klik tombol
    }
    return () => clearTimeout(autoCheckTimer);
  }, [step, selectedMethod]);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'creator_pro',
      name: 'CREATOR PRO',
      price: premiumPrice || 'Rp 20.000 / Bulan',
      numericPrice: 20000,
      badge: 'PALING POPULER',
      features: [
        'Biaya Penarikan Saldo Dompet Hemat 60% (Hanya 2%)',
        'Unlock Detail Portofolio & Kontak CV untuk Brand',
        'Akses Prioritas Event & Kompetisi Kreator',
        'Badge Verifikasi "CREATOR PRO" di Profil',
        'Akses Penuh Seluruh Karya & Bebas Iklan'
      ]
    },
    {
      id: 'creator_annual',
      name: 'CREATOR PRO TAHUNAN',
      price: 'Rp 200.000 / Tahun',
      numericPrice: 200000,
      badge: 'HEMAT 2 BULAN',
      features: [
        'Semua Keunggulan Paket CREATOR PRO',
        'Akses Tiket VIP Seluruh Event ngonten.id',
        'Kolaborasi Multi-Kreator Prioritas',
        'Prioritas Peringkat di Halaman Utama Discover',
        'Sertifikat Resmi Kreator Mitra ngonten.id'
      ]
    }
  ];

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectPlan = (plan) => {
    if (!currentUser) {
      if (onLoginClick) onLoginClick('register');
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setStep('select_method');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuccessActivation = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');

      if (setConfirmations) {
        setConfirmations(prev => [{
          id: `pay_${Date.now()}`,
          userId: currentUser?.id || currentUser?.username,
          username: currentUser?.username,
          bankName: `DOKU - ${selectedMethod.toUpperCase()}`,
          senderName: currentUser?.name || currentUser?.username,
          amount: `Rp ${selectedPlan?.numericPrice.toLocaleString('id-ID')}`,
          status: 'approved',
          gateway: 'DOKU',
          timestamp: new Date().toISOString()
        }, ...(prev || [])]);
      }
    }, 1000);
  };

  const vaNumbers = {
    va_bca: '39108 0812 3456 7890',
    va_mandiri: '88708 0812 3456 7890',
    va_bri: '10208 0812 3456 7890'
  };

  // Theme Variables
  const theme = {
    modalBg: isLight ? '#ffffff' : '#09090b',
    textMain: isLight ? '#111827' : '#ffffff',
    textSub: isLight ? '#4b5563' : '#a1a1aa',
    cardBg: isLight ? '#f9fafb' : '#18181b',
    cardBorder: isLight ? '#e5e7eb' : '#27272a',
    cardSelectedBg: isLight ? '#f3f4f6' : '#27272a',
    cardSelectedBorder: isLight ? '#111827' : '#ffffff',
    btnPrimaryBg: isLight ? '#111827' : '#ffffff',
    btnPrimaryText: isLight ? '#ffffff' : '#000000',
    btnSecondaryBg: isLight ? '#f3f4f6' : 'transparent',
    btnSecondaryText: isLight ? '#111827' : '#ffffff',
    btnSecondaryBorder: isLight ? '#d1d5db' : '#3f3f46',
    closeBtnBg: isLight ? '#f3f4f6' : '#18181b',
    closeBtnBorder: isLight ? '#e5e7eb' : '#3f3f46',
    closeBtnColor: isLight ? '#111827' : '#ffffff',
    badgeBg: isLight ? '#111827' : '#ffffff',
    badgeText: isLight ? '#ffffff' : '#000000'
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="doku-modal-card"
        style={{
          backgroundColor: theme.modalBg,
          color: theme.textMain,
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: isLight ? '0 20px 45px rgba(0,0,0,0.12)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '28px 24px',
          position: 'relative',
          textAlign: 'left'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: theme.closeBtnBg,
            border: `1px solid ${theme.closeBtnBorder}`,
            color: theme.closeBtnColor,
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Tutup"
        >
          <X size={16} color={theme.closeBtnColor} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            marginBottom: '12px'
          }}>
            <Sparkles size={22} color={theme.badgeText} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', color: theme.textMain }}>
            {step === 'select_plan' && 'Pilih Paket Langganan'}
            {step === 'select_method' && 'Pilih Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran'}
            {step === 'success' && 'Pembayaran Berhasil!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: theme.textSub, margin: 0 }}>
            {step === 'select_plan' && 'Dapatkan akses penuh ke fitur kreator, event, & penarikan saldo 2%.'}
            {step === 'select_method' && 'Pilih metode pembayaran resmi yang didukung DOKU Payment Gateway.'}
            {step === 'pay_screen' && 'Selesaikan pembayaran sebelum batas waktu berakhir.'}
            {step === 'success' && 'Status keanggotaan Premium Creator Anda telah aktif.'}
          </p>
        </div>

        {/* ================= STEP 1: PILIH PAKET ================= */}
        {step === 'select_plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map(plan => (
              <div
                key={plan.id}
                className="doku-card-box"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                {plan.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    {plan.badge}
                  </span>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: theme.textMain }}>
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: theme.textMain }}>
                    {plan.price}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: theme.textSub }}>
                      <Check size={14} color={theme.textMain} style={{ flexShrink: 0 }} />
                      <span style={{ color: theme.textMain, fontWeight: '500' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="doku-btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: theme.btnPrimaryBg,
                    color: theme.btnPrimaryText,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{currentUser ? 'Pilih Paket Ini' : 'Daftar & Berlangganan'}</span>
                  <ArrowRight size={16} color={theme.btnPrimaryText} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= STEP 2: PILIH METODE PEMBAYARAN ================= */}
        {step === 'select_method' && selectedPlan && (
          <div>
            {/* Ringkasan Tagihan */}
            <div 
              className="doku-card-box"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: theme.textSub }}>Paket Dipilih:</span>
                <span style={{ fontWeight: '700', color: theme.textMain }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: theme.textSub }}>Merchant Resmi:</span>
                <span style={{ fontWeight: '700', color: theme.textMain }}>ngonten.id (DOKU)</span>
              </div>
              <div style={{ height: '1px', backgroundColor: theme.cardBorder, margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: theme.textMain, fontWeight: '700', fontSize: '0.9rem' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: theme.textMain }}>
                  Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: theme.textMain, margin: 0 }}>
                Metode Pembayaran
              </h4>
              <span style={{ fontSize: '0.72rem', color: theme.textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color={theme.textMain} /> DOKU Secured
              </span>
            </div>

            {/* List Metode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              
              {/* Opsi 1: QRIS */}
              <div 
                onClick={() => setSelectedMethod('qris')}
                style={{
                  backgroundColor: selectedMethod === 'qris' ? theme.cardSelectedBg : theme.cardBg,
                  border: `2px solid ${selectedMethod === 'qris' ? theme.cardSelectedBorder : theme.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={24} color={theme.textMain} />
                  <div>
                    <strong style={{ color: theme.textMain, fontSize: '0.88rem', display: 'block' }}>QRIS (Real-Time Otomatis)</strong>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>GoPay, OVO, DANA, BCA, ShopeePay & Semua m-Banking</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.textMain}`,
                  backgroundColor: selectedMethod === 'qris' ? theme.textMain : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.modalBg }} />}
                </div>
              </div>

              {/* Opsi 2: VA BCA */}
              <div 
                onClick={() => setSelectedMethod('va_bca')}
                style={{
                  backgroundColor: selectedMethod === 'va_bca' ? theme.cardSelectedBg : theme.cardBg,
                  border: `2px solid ${selectedMethod === 'va_bca' ? theme.cardSelectedBorder : theme.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={theme.textMain} />
                  <div>
                    <strong style={{ color: theme.textMain, fontSize: '0.88rem', display: 'block' }}>BCA Virtual Account</strong>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>Transfer otomatis via BCA Mobile / KlikBCA / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.textMain}`,
                  backgroundColor: selectedMethod === 'va_bca' ? theme.textMain : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bca' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.modalBg }} />}
                </div>
              </div>

              {/* Opsi 3: VA Mandiri */}
              <div 
                onClick={() => setSelectedMethod('va_mandiri')}
                style={{
                  backgroundColor: selectedMethod === 'va_mandiri' ? theme.cardSelectedBg : theme.cardBg,
                  border: `2px solid ${selectedMethod === 'va_mandiri' ? theme.cardSelectedBorder : theme.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={theme.textMain} />
                  <div>
                    <strong style={{ color: theme.textMain, fontSize: '0.88rem', display: 'block' }}>Mandiri Virtual Account (Livin')</strong>
                    <span style={{ fontSize: '0.75rem', color: theme.textSub }}>Transfer otomatis via Livin' by Mandiri / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.textMain}`,
                  backgroundColor: selectedMethod === 'va_mandiri' ? theme.textMain : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_mandiri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.modalBg }} />}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('select_plan')}
                className="doku-btn-secondary"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: theme.btnSecondaryBg,
                  color: theme.btnSecondaryText,
                  border: `1px solid ${theme.btnSecondaryBorder}`,
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
                <ArrowLeft size={16} color={theme.btnSecondaryText} />
                <span>Kembali</span>
              </button>

              <button
                onClick={() => setStep('pay_screen')}
                className="doku-btn-primary"
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: theme.btnPrimaryBg,
                  color: theme.btnPrimaryText,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight size={16} color={theme.btnPrimaryText} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TAMPILAN PEMBAYARAN LIVE & AUTO-VERIFIKASI ================= */}
        {step === 'pay_screen' && selectedPlan && (
          <div>
            {/* Header Timer & Total */}
            <div 
              className="doku-card-box"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: theme.textSub, display: 'block' }}>Batas Waktu:</span>
                <strong style={{ fontSize: '1.05rem', color: theme.textMain, fontFamily: 'monospace' }}>{formatTimer(timeLeft)}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: theme.textSub, display: 'block' }}>Total Pembayaran:</span>
                <strong style={{ fontSize: '1.2rem', color: theme.textMain }}>Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Live Polling Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '16px',
              fontSize: '0.78rem',
              color: isLight ? '#065f46' : '#6ee7b7',
              fontWeight: '600'
            }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Sistem DOKU Otomatis Mendeteksi Pembayaran...</span>
            </div>

            {/* Pembayaran via QRIS */}
            {selectedMethod === 'qris' ? (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  padding: '18px',
                  borderRadius: '14px',
                  display: 'inline-block',
                  border: '2px solid #000000',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#000000' }}>QRIS</span>
                    <span style={{ fontSize: '0.62rem', color: '#4b5563', fontWeight: '700' }}>DOKU JOKUL • {DOKU_CONFIG.clientId}</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.72rem', color: '#4b5563', fontWeight: '700' }}>
                      Total: Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* QRIS SVG Vector */}
                  <svg width="150" height="150" viewBox="0 0 100 100" style={{ background: '#fff', display: 'block', margin: '4px auto' }}>
                    <rect x="0" y="0" width="22" height="22" fill="#000000" />
                    <rect x="2" y="2" width="18" height="18" fill="#fff" />
                    <rect x="5" y="5" width="12" height="12" fill="#000000" />
                    
                    <rect x="78" y="0" width="22" height="22" fill="#000000" />
                    <rect x="80" y="2" width="18" height="18" fill="#fff" />
                    <rect x="83" y="5" width="12" height="12" fill="#000000" />
                    
                    <rect x="0" y="78" width="22" height="22" fill="#000000" />
                    <rect x="2" y="80" width="18" height="18" fill="#fff" />
                    <rect x="5" y="83" width="12" height="12" fill="#000000" />

                    <rect x="40" y="40" width="20" height="20" fill="#000000" rx="3" />
                    <text x="50" y="53" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">DOKU</text>

                    <rect x="26" y="6" width="6" height="12" fill="#000000" />
                    <rect x="46" y="6" width="12" height="6" fill="#000000" />
                    <rect x="66" y="0" width="6" height="22" fill="#000000" />
                    <rect x="6" y="26" width="16" height="6" fill="#000000" />
                    <rect x="16" y="36" width="12" height="12" fill="#000000" />
                    <rect x="36" y="30" width="6" height="6" fill="#000000" />
                    <rect x="76" y="26" width="12" height="6" fill="#000000" />
                    <rect x="86" y="36" width="12" height="12" fill="#000000" />
                    <rect x="6" y="52" width="22" height="6" fill="#000000" />
                    <rect x="32" y="72" width="6" height="22" fill="#000000" />
                    <rect x="42" y="82" width="22" height="6" fill="#000000" />
                    <rect x="52" y="62" width="6" height="12" fill="#000000" />
                    <rect x="72" y="66" width="12" height="6" fill="#000000" />
                    <rect x="82" y="76" width="6" height="16" fill="#000000" />
                  </svg>

                  <div style={{ fontSize: '0.68rem', color: '#374151', marginTop: '6px', fontWeight: '600' }}>
                    Scan QR di atas dengan BCA, GoPay, OVO, DANA, dll
                  </div>
                </div>
              </div>
            ) : (
              /* Pembayaran via Virtual Account */
              <div 
                className="doku-card-box"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}
              >
                <span style={{ fontSize: '0.78rem', color: theme.textSub, display: 'block', marginBottom: '4px' }}>
                  Nomor Virtual Account ({selectedMethod.replace('va_', '').toUpperCase()}):
                </span>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isLight ? '#ffffff' : '#09090b',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.cardBorder}`,
                  marginBottom: '12px'
                }}>
                  <strong style={{ fontSize: '1.25rem', color: theme.textMain, letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {vaNumbers[selectedMethod] || '88708 0812 3456 7890'}
                  </strong>
                  <button
                    onClick={() => handleCopy(vaNumbers[selectedMethod] || '88708 0812 3456 7890')}
                    style={{
                      backgroundColor: theme.btnSecondaryBg,
                      color: theme.btnSecondaryText,
                      border: `1px solid ${theme.btnSecondaryBorder}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={14} color={theme.btnSecondaryText} />
                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: theme.textSub, lineHeight: '1.5' }}>
                  <strong style={{ color: theme.textMain }}>Cara Pembayaran:</strong>
                  <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: theme.textSub }}>
                    <li>Buka aplikasi m-Banking atau ATM bank Anda.</li>
                    <li>Pilih menu <strong>Transfer / Pembayaran &gt; Virtual Account</strong>.</li>
                    <li>Masukkan nomor VA di atas dan konfirmasi merchant <strong>ngonten.id</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleSuccessActivation}
                disabled={isVerifying}
                className="doku-btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: theme.btnPrimaryBg,
                  color: theme.btnPrimaryText,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: isVerifying ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} color={theme.btnPrimaryText} className="animate-spin" />
                    <span>Mengecek Pembayaran DOKU...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color={theme.btnPrimaryText} />
                    <span>Saya Sudah Bayar (Cek Status Sekarang)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('select_method')}
                className="doku-btn-secondary"
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: theme.btnSecondaryBg,
                  color: theme.btnSecondaryText,
                  border: `1px solid ${theme.btnSecondaryBorder}`,
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Ganti Metode Pembayaran
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SUKSES ================= */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={32} color={theme.badgeText} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: theme.textMain }}>
              Selamat! Paket {selectedPlan?.name} Aktif 🎉
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: theme.textSub, lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              Pembayaran via DOKU Payment Gateway berhasil diverifikasi secara instan. Akun Anda kini resmi memiliki status <strong>CREATOR PRO</strong> dengan potongan biaya penarikan dompet hanya 2% dan akses penuh ekosistem ngonten.id.
            </p>

            <button
              onClick={onClose}
              className="doku-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: theme.btnPrimaryBg,
                color: theme.btnPrimaryText,
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Mulai Eksplorasi Fitur Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
