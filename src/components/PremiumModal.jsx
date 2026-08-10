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
        'Akses Penuh Seluruh Karya & Film Tanpa Iklan'
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

  const handleVerifyPayment = () => {
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
    }, 1200);
  };

  const vaNumbers = {
    va_bca: '39108 0812 3456 7890',
    va_mandiri: '88708 0812 3456 7890',
    va_bri: '10208 0812 3456 7890'
  };

  // Color tokens
  const tc = {
    modalBg: isLight ? '#ffffff' : '#0f172a',
    modalBorder: isLight ? '#e2e8f0' : '#334155',
    title: isLight ? '#0f172a' : '#ffffff',
    subtitle: isLight ? '#64748b' : '#94a3b8',
    cardBg: isLight ? '#f8fafc' : '#1e293b',
    cardBorder: isLight ? '#e2e8f0' : '#334155',
    cardSelectedBg: isLight ? '#f1f5f9' : '#334155',
    cardSelectedBorder: isLight ? '#0f172a' : '#ffffff',
    btnPrimaryBg: isLight ? '#0f172a' : '#ffffff',
    btnPrimaryText: isLight ? '#ffffff' : '#0f172a',
    btnSecondaryBg: isLight ? '#f1f5f9' : '#1e293b',
    btnSecondaryText: isLight ? '#0f172a' : '#ffffff',
    btnSecondaryBorder: isLight ? '#cbd5e1' : '#475569',
    closeBtnBg: isLight ? '#f1f5f9' : '#1e293b',
    closeBtnColor: isLight ? '#0f172a' : '#ffffff',
    badgeBg: isLight ? '#0f172a' : '#ffffff',
    badgeText: isLight ? '#ffffff' : '#0f172a'
  };

  return (
    <div className="doku-modal-wrapper" onClick={onClose}>
      <div 
        className="doku-modal-card"
        style={{
          backgroundColor: tc.modalBg,
          color: tc.title,
          border: `1px solid ${tc.modalBorder}`
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
            backgroundColor: tc.closeBtnBg,
            border: `1px solid ${tc.modalBorder}`,
            color: tc.closeBtnColor,
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
          <X size={16} color={tc.closeBtnColor} />
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
            backgroundColor: tc.badgeBg,
            color: tc.badgeText,
            marginBottom: '12px'
          }}>
            <Sparkles size={22} color={tc.badgeText} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', color: tc.title }}>
            {step === 'select_plan' && 'Pilih Paket Langganan'}
            {step === 'select_method' && 'Pilih Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran DOKU'}
            {step === 'success' && 'Pembayaran Berhasil!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: tc.subtitle, margin: 0 }}>
            {step === 'select_plan' && 'Dapatkan akses penuh ke fitur kreator, event, & penarikan saldo 2%.'}
            {step === 'select_method' && 'Pilih metode pembayaran resmi yang didukung DOKU Payment Gateway.'}
            {step === 'pay_screen' && 'Scan QRIS atau transfer ke nomor VA di bawah untuk menyelesaikan pembayaran.'}
            {step === 'success' && 'Status keanggotaan Premium Creator Anda telah aktif.'}
          </p>
        </div>

        {/* ================= STEP 1: PILIH PAKET ================= */}
        {step === 'select_plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map(plan => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: tc.cardBg,
                  border: `1px solid ${tc.cardBorder}`,
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
                    backgroundColor: tc.badgeBg,
                    color: tc.badgeText,
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: tc.title }}>
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: tc.title }}>
                    {plan.price}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={14} color={tc.title} style={{ flexShrink: 0 }} />
                      <span style={{ color: tc.title, fontWeight: '500' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: tc.btnPrimaryBg,
                    color: tc.btnPrimaryText,
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
                  <ArrowRight size={16} color={tc.btnPrimaryText} />
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
              style={{
                backgroundColor: tc.cardBg,
                border: `1px solid ${tc.cardBorder}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: tc.subtitle }}>Paket Dipilih:</span>
                <span style={{ fontWeight: '700', color: tc.title }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: tc.subtitle }}>Merchant Resmi:</span>
                <span style={{ fontWeight: '700', color: tc.title }}>ngonten.id (DOKU)</span>
              </div>
              <div style={{ height: '1px', backgroundColor: tc.cardBorder, margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: tc.title, fontWeight: '700', fontSize: '0.9rem' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: tc.title }}>
                  Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: tc.title, margin: 0 }}>
                Pilih Metode Pembayaran
              </h4>
              <span style={{ fontSize: '0.72rem', color: tc.subtitle, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color={tc.title} /> DOKU Secured
              </span>
            </div>

            {/* List Metode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              
              {/* Opsi 1: QRIS */}
              <div 
                onClick={() => setSelectedMethod('qris')}
                style={{
                  backgroundColor: selectedMethod === 'qris' ? tc.cardSelectedBg : tc.cardBg,
                  border: `2px solid ${selectedMethod === 'qris' ? tc.cardSelectedBorder : tc.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={24} color={tc.title} />
                  <div>
                    <strong style={{ color: tc.title, fontSize: '0.88rem', display: 'block' }}>QRIS (Real-Time Scan)</strong>
                    <span style={{ fontSize: '0.75rem', color: tc.subtitle }}>GoPay, OVO, DANA, BCA, ShopeePay & Semua m-Banking</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${tc.title}`,
                  backgroundColor: selectedMethod === 'qris' ? tc.title : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tc.modalBg }} />}
                </div>
              </div>

              {/* Opsi 2: VA BCA */}
              <div 
                onClick={() => setSelectedMethod('va_bca')}
                style={{
                  backgroundColor: selectedMethod === 'va_bca' ? tc.cardSelectedBg : tc.cardBg,
                  border: `2px solid ${selectedMethod === 'va_bca' ? tc.cardSelectedBorder : tc.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={tc.title} />
                  <div>
                    <strong style={{ color: tc.title, fontSize: '0.88rem', display: 'block' }}>BCA Virtual Account</strong>
                    <span style={{ fontSize: '0.75rem', color: tc.subtitle }}>Transfer otomatis via BCA Mobile / KlikBCA / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${tc.title}`,
                  backgroundColor: selectedMethod === 'va_bca' ? tc.title : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bca' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tc.modalBg }} />}
                </div>
              </div>

              {/* Opsi 3: VA Mandiri */}
              <div 
                onClick={() => setSelectedMethod('va_mandiri')}
                style={{
                  backgroundColor: selectedMethod === 'va_mandiri' ? tc.cardSelectedBg : tc.cardBg,
                  border: `2px solid ${selectedMethod === 'va_mandiri' ? tc.cardSelectedBorder : tc.cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={tc.title} />
                  <div>
                    <strong style={{ color: tc.title, fontSize: '0.88rem', display: 'block' }}>Mandiri Virtual Account (Livin')</strong>
                    <span style={{ fontSize: '0.75rem', color: tc.subtitle }}>Transfer otomatis via Livin' by Mandiri / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${tc.title}`,
                  backgroundColor: selectedMethod === 'va_mandiri' ? tc.title : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_mandiri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tc.modalBg }} />}
                </div>
              </div>
            </div>

            {/* Tombol Lanjut */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('select_plan')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: tc.btnSecondaryBg,
                  color: tc.btnSecondaryText,
                  border: `1px solid ${tc.btnSecondaryBorder}`,
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
                <ArrowLeft size={16} color={tc.btnSecondaryText} />
                <span>Kembali</span>
              </button>

              <button
                onClick={() => setStep('pay_screen')}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: tc.btnPrimaryBg,
                  color: tc.btnPrimaryText,
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
                <ArrowRight size={16} color={tc.btnPrimaryText} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TAMPILAN PEMBAYARAN REAL (QRIS / VA) ================= */}
        {step === 'pay_screen' && selectedPlan && (
          <div>
            {/* Header Timer & Total */}
            <div 
              style={{
                backgroundColor: tc.cardBg,
                border: `1px solid ${tc.cardBorder}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: tc.subtitle, display: 'block' }}>Batas Waktu:</span>
                <strong style={{ fontSize: '1.05rem', color: tc.title, fontFamily: 'monospace' }}>{formatTimer(timeLeft)}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: tc.subtitle, display: 'block' }}>Total Pembayaran:</span>
                <strong style={{ fontSize: '1.2rem', color: tc.title }}>Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Pembayaran via QRIS */}
            {selectedMethod === 'qris' ? (
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
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
                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#000000' }}>QRIS</span>
                    <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: '700' }}>DOKU JOKUL • {DOKU_CONFIG.clientId}</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: '700' }}>
                      Nominal: Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* QRIS SVG Vector */}
                  <svg width="170" height="170" viewBox="0 0 100 100" style={{ background: '#fff', display: 'block', margin: '6px auto' }}>
                    <rect x="0" y="0" width="24" height="24" fill="#000000" />
                    <rect x="3" y="3" width="18" height="18" fill="#fff" />
                    <rect x="6" y="6" width="12" height="12" fill="#000000" />
                    
                    <rect x="76" y="0" width="24" height="24" fill="#000000" />
                    <rect x="79" y="3" width="18" height="18" fill="#fff" />
                    <rect x="82" y="6" width="12" height="12" fill="#000000" />
                    
                    <rect x="0" y="76" width="24" height="24" fill="#000000" />
                    <rect x="3" y="79" width="18" height="18" fill="#fff" />
                    <rect x="6" y="82" width="12" height="12" fill="#000000" />

                    <rect x="38" y="38" width="24" height="24" fill="#000000" rx="3" />
                    <text x="50" y="53" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">DOKU</text>

                    <rect x="28" y="6" width="6" height="14" fill="#000000" />
                    <rect x="46" y="6" width="14" height="6" fill="#000000" />
                    <rect x="64" y="0" width="6" height="24" fill="#000000" />
                    <rect x="6" y="28" width="18" height="6" fill="#000000" />
                    <rect x="16" y="38" width="14" height="14" fill="#000000" />
                    <rect x="36" y="30" width="6" height="6" fill="#000000" />
                    <rect x="74" y="28" width="14" height="6" fill="#000000" />
                    <rect x="84" y="38" width="14" height="14" fill="#000000" />
                    <rect x="6" y="54" width="24" height="6" fill="#000000" />
                    <rect x="30" y="72" width="6" height="24" fill="#000000" />
                    <rect x="42" y="82" width="24" height="6" fill="#000000" />
                    <rect x="52" y="64" width="6" height="14" fill="#000000" />
                    <rect x="70" y="68" width="14" height="6" fill="#000000" />
                    <rect x="82" y="76" width="6" height="18" fill="#000000" />
                  </svg>

                  <div style={{ fontSize: '0.7rem', color: '#374151', marginTop: '6px', fontWeight: '600' }}>
                    Buka BCA, Mandiri, GoPay, OVO, DANA lalu Scan QR
                  </div>
                </div>
              </div>
            ) : (
              /* Pembayaran via Virtual Account */
              <div 
                style={{
                  backgroundColor: tc.cardBg,
                  border: `1px solid ${tc.cardBorder}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '18px'
                }}
              >
                <span style={{ fontSize: '0.78rem', color: tc.subtitle, display: 'block', marginBottom: '6px' }}>
                  Nomor Virtual Account ({selectedMethod.replace('va_', '').toUpperCase()}):
                </span>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isLight ? '#ffffff' : '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${tc.cardBorder}`,
                  marginBottom: '14px'
                }}>
                  <strong style={{ fontSize: '1.25rem', color: tc.title, letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {vaNumbers[selectedMethod] || '88708 0812 3456 7890'}
                  </strong>
                  <button
                    onClick={() => handleCopy(vaNumbers[selectedMethod] || '88708 0812 3456 7890')}
                    style={{
                      backgroundColor: tc.btnSecondaryBg,
                      color: tc.btnSecondaryText,
                      border: `1px solid ${tc.btnSecondaryBorder}`,
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
                    <Copy size={14} color={tc.btnSecondaryText} />
                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: tc.subtitle, lineHeight: '1.5' }}>
                  <strong style={{ color: tc.title }}>Cara Pembayaran:</strong>
                  <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: tc.subtitle }}>
                    <li>Buka aplikasi m-Banking atau ATM bank Anda.</li>
                    <li>Pilih menu <strong>Transfer / Pembayaran &gt; Virtual Account</strong>.</li>
                    <li>Masukkan nomor VA di atas dan konfirmasi merchant <strong>ngonten.id</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tombol Cek Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: tc.btnPrimaryBg,
                  color: tc.btnPrimaryText,
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
                    <RefreshCw size={18} color={tc.btnPrimaryText} className="animate-spin" />
                    <span>Memverifikasi ke Gateway DOKU...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color={tc.btnPrimaryText} />
                    <span>Saya Sudah Bayar (Cek Status Sekarang)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('select_method')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: tc.btnSecondaryBg,
                  color: tc.subtitle,
                  border: `1px solid ${tc.cardBorder}`,
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
              backgroundColor: tc.badgeBg,
              color: tc.badgeText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={32} color={tc.badgeText} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: tc.title }}>
              Selamat! Paket {selectedPlan?.name} Aktif 🎉
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: tc.subtitle, lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              Pembayaran via DOKU Payment Gateway berhasil diverifikasi. Akun Anda kini resmi memiliki status <strong>CREATOR PRO</strong> dengan potongan biaya penarikan dompet hanya 2% dan akses penuh ekosistem ngonten.id.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: tc.btnPrimaryBg,
                color: tc.btnPrimaryText,
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
