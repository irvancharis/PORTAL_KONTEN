import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, QrCode, Landmark, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { DOKU_CONFIG, createDokuPaymentOrder } from '../services/dokuPaymentService';

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
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'card'
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit

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

  const handleProceedToPayment = () => {
    setStep('pay_screen');
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
    va_bri: '10208 0812 3456 7890',
    va_bni: '98808 0812 3456 7890'
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
          backgroundColor: '#09090b',
          color: '#ffffff',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          border: '1px solid #27272a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            color: '#ffffff',
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
          <X size={16} color="#ffffff" />
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
            backgroundColor: '#ffffff',
            color: '#000000',
            marginBottom: '12px'
          }}>
            <Sparkles size={22} color="#000000" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
            {step === 'select_plan' && 'Pilih Paket Langganan'}
            {step === 'select_method' && 'Pilih Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran'}
            {step === 'success' && 'Pembayaran Berhasil!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#a1a1aa', margin: 0 }}>
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
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
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
                    backgroundColor: '#ffffff',
                    color: '#000000',
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                    {plan.price}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#e4e4e7' }}>
                      <Check size={14} color="#ffffff" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
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
                  <ArrowRight size={16} color="#000000" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= STEP 2: PILIH METODE PEMBAYARAN ================= */}
        {step === 'select_method' && selectedPlan && (
          <div>
            {/* Ringkasan Tagihan */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#a1a1aa' }}>Paket Dipilih:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#a1a1aa' }}>Merchant DOKU:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>ngonten.id</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#27272a', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.9rem' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>
                  Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Metode Pembayaran
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color="#ffffff" /> DOKU Secured
              </span>
            </div>

            {/* List Metode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              
              {/* Opsi 1: QRIS */}
              <div 
                onClick={() => setSelectedMethod('qris')}
                style={{
                  backgroundColor: selectedMethod === 'qris' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'qris' ? '2px solid #ffffff' : '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={22} color="#ffffff" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>QRIS (Real-Time)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>GoPay, OVO, DANA, BCA, ShopeePay & Semua Bank</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'qris' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
                </div>
              </div>

              {/* Opsi 2: VA BCA */}
              <div 
                onClick={() => setSelectedMethod('va_bca')}
                style={{
                  backgroundColor: selectedMethod === 'va_bca' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'va_bca' ? '2px solid #ffffff' : '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={22} color="#ffffff" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>BCA Virtual Account</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Transfer otomatis via BCA Mobile / KlikBCA / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'va_bca' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bca' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
                </div>
              </div>

              {/* Opsi 3: VA Mandiri */}
              <div 
                onClick={() => setSelectedMethod('va_mandiri')}
                style={{
                  backgroundColor: selectedMethod === 'va_mandiri' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'va_mandiri' ? '2px solid #ffffff' : '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={22} color="#ffffff" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>Mandiri Virtual Account (Livin')</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Transfer otomatis via Livin' by Mandiri / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'va_mandiri' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_mandiri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
                </div>
              </div>

              {/* Opsi 4: VA BRI / BNI */}
              <div 
                onClick={() => setSelectedMethod('va_bri')}
                style={{
                  backgroundColor: selectedMethod === 'va_bri' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'va_bri' ? '2px solid #ffffff' : '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={22} color="#ffffff" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>BRI / BNI Virtual Account (BRIMO)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Transfer otomatis via BRIMO / BNI Mobile</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'va_bri' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
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
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
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

              <button
                onClick={handleProceedToPayment}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
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
                <ArrowRight size={16} color="#000000" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TAMPILAN PEMBAYARAN LIVE ================= */}
        {step === 'pay_screen' && selectedPlan && (
          <div>
            {/* Header Timer & Total */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block' }}>Batas Waktu Pembayaran:</span>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'monospace' }}>{formatTimer(timeLeft)}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block' }}>Total Nominal:</span>
                <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}</strong>
              </div>
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
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
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
                    Buka BCA, Mandiri, GoPay, OVO, DANA lalu Scan QR di atas
                  </div>
                </div>
              </div>
            ) : (
              /* Pembayaran via Virtual Account */
              <div style={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>
                  Nomor Virtual Account ({selectedMethod.replace('va_', '').toUpperCase()}):
                </span>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#09090b',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #27272a',
                  marginBottom: '12px'
                }}>
                  <strong style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {vaNumbers[selectedMethod] || '88708 0812 3456 7890'}
                  </strong>
                  <button
                    onClick={() => handleCopy(vaNumbers[selectedMethod] || '88708 0812 3456 7890')}
                    style={{
                      backgroundColor: '#27272a',
                      color: '#ffffff',
                      border: '1px solid #3f3f46',
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
                    <Copy size={14} color="#ffffff" />
                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#d4d4d8', lineHeight: '1.5' }}>
                  <strong>Cara Pembayaran:</strong>
                  <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                    <li>Buka aplikasi m-Banking atau ATM bank Anda.</li>
                    <li>Pilih menu <strong>Transfer / Pembayaran &gt; Virtual Account</strong>.</li>
                    <li>Masukkan nomor VA di atas dan konfirmasi nama <strong>ngonten.id</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: isVerifying ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255,255,255,0.1)'
                }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} color="#000000" className="animate-spin" />
                    <span>Memverifikasi Pembayaran DOKU...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#000000" />
                    <span>Saya Sudah Bayar (Konfirmasi)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('select_method')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: '1px solid #27272a',
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
              backgroundColor: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={32} color="#000000" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: '#ffffff' }}>
              Selamat! Paket {selectedPlan?.name} Aktif 🎉
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: '#d4d4d8', lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              Pembayaran via DOKU Payment Gateway berhasil diverifikasi. Akun Anda kini resmi memiliki status <strong>CREATOR PRO</strong> dengan biaya penarikan 2% dan akses penuh ekosistem ngonten.id.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#ffffff',
                color: '#000000',
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
