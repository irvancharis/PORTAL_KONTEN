import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, QrCode, Landmark, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
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
  const [isVerifying, setIsVerifying] = useState(false);
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
    }
  }, [isOpen]);

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

  const handleSelectPlan = (plan) => {
    if (!currentUser) {
      if (onLoginClick) onLoginClick('register');
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setStep('select_method');
  };

  const handleOpenDokuCheckout = () => {
    // Membuka portal DOKU Checkout atau redirect payment
    setStep('pay_screen');
  };

  const handleManualCheckPayment = () => {
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
    }, 1500);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
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
        style={{
          backgroundColor: isLight ? '#ffffff' : '#09090b',
          color: isLight ? '#111827' : '#ffffff',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          border: isLight ? '1px solid #e5e7eb' : '1px solid #27272a',
          boxShadow: isLight ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '28px 24px',
          position: 'relative',
          textAlign: 'left'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: isLight ? '#f3f4f6' : '#18181b',
            border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46',
            color: isLight ? '#111827' : '#ffffff',
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
          <X size={16} color={isLight ? '#111827' : '#ffffff'} />
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
            backgroundColor: isLight ? '#111827' : '#ffffff',
            color: isLight ? '#ffffff' : '#000000',
            marginBottom: '12px'
          }}>
            <Sparkles size={22} color={isLight ? '#ffffff' : '#000000'} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', color: isLight ? '#111827' : '#ffffff' }}>
            {step === 'select_plan' && 'Pilih Paket Langganan'}
            {step === 'select_method' && 'Pilih Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran DOKU'}
            {step === 'success' && 'Pembayaran Berhasil!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: isLight ? '#4b5563' : '#a1a1aa', margin: 0 }}>
            {step === 'select_plan' && 'Dapatkan akses penuh ke fitur kreator, event, & penarikan saldo 2%.'}
            {step === 'select_method' && 'Pilih metode pembayaran resmi DOKU Payment Gateway.'}
            {step === 'pay_screen' && 'Selesaikan pembayaran untuk mengaktifkan status Creator Pro.'}
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
                  backgroundColor: isLight ? '#f9fafb' : '#18181b',
                  border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46',
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
                    backgroundColor: isLight ? '#111827' : '#ffffff',
                    color: isLight ? '#ffffff' : '#000000',
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: isLight ? '#111827' : '#ffffff' }}>
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: isLight ? '#111827' : '#ffffff' }}>
                    {plan.price}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={14} color={isLight ? '#111827' : '#ffffff'} style={{ flexShrink: 0 }} />
                      <span style={{ color: isLight ? '#374151' : '#e4e4e7', fontWeight: '500' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isLight ? '#111827' : '#ffffff',
                    color: isLight ? '#ffffff' : '#000000',
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
                  <ArrowRight size={16} color={isLight ? '#ffffff' : '#000000'} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= STEP 2: PILIH METODE ================= */}
        {step === 'select_method' && selectedPlan && (
          <div>
            {/* Ringkasan Tagihan */}
            <div 
              style={{
                backgroundColor: isLight ? '#f9fafb' : '#18181b',
                border: isLight ? '1px solid #e5e7eb' : '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: isLight ? '#6b7280' : '#a1a1aa' }}>Paket Dipilih:</span>
                <span style={{ fontWeight: '700', color: isLight ? '#111827' : '#ffffff' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: isLight ? '#6b7280' : '#a1a1aa' }}>Merchant DOKU:</span>
                <span style={{ fontWeight: '700', color: isLight ? '#111827' : '#ffffff' }}>ngonten.id</span>
              </div>
              <div style={{ height: '1px', backgroundColor: isLight ? '#e5e7eb' : '#27272a', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isLight ? '#111827' : '#ffffff', fontWeight: '700', fontSize: '0.9rem' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isLight ? '#111827' : '#ffffff' }}>
                  Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: isLight ? '#111827' : '#ffffff', margin: 0 }}>
                Metode Pembayaran
              </h4>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#6b7280' : '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color={isLight ? '#111827' : '#ffffff'} /> DOKU Secured
              </span>
            </div>

            {/* List Metode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              
              {/* Opsi 1: QRIS */}
              <div 
                onClick={() => setSelectedMethod('qris')}
                style={{
                  backgroundColor: isLight 
                    ? (selectedMethod === 'qris' ? '#f3f4f6' : '#ffffff') 
                    : (selectedMethod === 'qris' ? '#27272a' : '#18181b'),
                  border: isLight 
                    ? (selectedMethod === 'qris' ? '2px solid #111827' : '1px solid #e5e7eb') 
                    : (selectedMethod === 'qris' ? '2px solid #ffffff' : '1px solid #3f3f46'),
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={24} color={isLight ? '#111827' : '#ffffff'} />
                  <div>
                    <strong style={{ color: isLight ? '#111827' : '#ffffff', fontSize: '0.88rem', display: 'block' }}>QRIS (Real-Time Otomatis)</strong>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#4b5563' : '#a1a1aa' }}>GoPay, OVO, DANA, BCA, ShopeePay & Semua m-Banking</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${isLight ? '#111827' : '#ffffff'}`,
                  backgroundColor: selectedMethod === 'qris' ? (isLight ? '#111827' : '#ffffff') : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isLight ? '#ffffff' : '#000000' }} />}
                </div>
              </div>

              {/* Opsi 2: VA BCA */}
              <div 
                onClick={() => setSelectedMethod('va_bca')}
                style={{
                  backgroundColor: isLight 
                    ? (selectedMethod === 'va_bca' ? '#f3f4f6' : '#ffffff') 
                    : (selectedMethod === 'va_bca' ? '#27272a' : '#18181b'),
                  border: isLight 
                    ? (selectedMethod === 'va_bca' ? '2px solid #111827' : '1px solid #e5e7eb') 
                    : (selectedMethod === 'va_bca' ? '2px solid #ffffff' : '1px solid #3f3f46'),
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={isLight ? '#111827' : '#ffffff'} />
                  <div>
                    <strong style={{ color: isLight ? '#111827' : '#ffffff', fontSize: '0.88rem', display: 'block' }}>BCA Virtual Account</strong>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#4b5563' : '#a1a1aa' }}>Transfer otomatis via BCA Mobile / KlikBCA / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${isLight ? '#111827' : '#ffffff'}`,
                  backgroundColor: selectedMethod === 'va_bca' ? (isLight ? '#111827' : '#ffffff') : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bca' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isLight ? '#ffffff' : '#000000' }} />}
                </div>
              </div>

              {/* Opsi 3: VA Mandiri */}
              <div 
                onClick={() => setSelectedMethod('va_mandiri')}
                style={{
                  backgroundColor: isLight 
                    ? (selectedMethod === 'va_mandiri' ? '#f3f4f6' : '#ffffff') 
                    : (selectedMethod === 'va_mandiri' ? '#27272a' : '#18181b'),
                  border: isLight 
                    ? (selectedMethod === 'va_mandiri' ? '2px solid #111827' : '1px solid #e5e7eb') 
                    : (selectedMethod === 'va_mandiri' ? '2px solid #ffffff' : '1px solid #3f3f46'),
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} color={isLight ? '#111827' : '#ffffff'} />
                  <div>
                    <strong style={{ color: isLight ? '#111827' : '#ffffff', fontSize: '0.88rem', display: 'block' }}>Mandiri Virtual Account (Livin')</strong>
                    <span style={{ fontSize: '0.75rem', color: isLight ? '#4b5563' : '#a1a1aa' }}>Transfer otomatis via Livin' by Mandiri / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${isLight ? '#111827' : '#ffffff'}`,
                  backgroundColor: selectedMethod === 'va_mandiri' ? (isLight ? '#111827' : '#ffffff') : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_mandiri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isLight ? '#ffffff' : '#000000' }} />}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('select_plan')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isLight ? '#f3f4f6' : 'transparent',
                  color: isLight ? '#111827' : '#ffffff',
                  border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46',
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
                <ArrowLeft size={16} color={isLight ? '#111827' : '#ffffff'} />
                <span>Kembali</span>
              </button>

              <button
                onClick={handleOpenDokuCheckout}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: isLight ? '#111827' : '#ffffff',
                  color: isLight ? '#ffffff' : '#000000',
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
                <ArrowRight size={16} color={isLight ? '#ffffff' : '#000000'} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TAMPILAN PEMBAYARAN ================= */}
        {step === 'pay_screen' && selectedPlan && (
          <div>
            {/* Header Total */}
            <div 
              style={{
                backgroundColor: isLight ? '#f9fafb' : '#18181b',
                border: isLight ? '1px solid #e5e7eb' : '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#6b7280' : '#a1a1aa', display: 'block' }}>Paket & Metode:</span>
                <strong style={{ fontSize: '0.95rem', color: isLight ? '#111827' : '#ffffff' }}>{selectedPlan.name} • {selectedMethod.toUpperCase()}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#6b7280' : '#a1a1aa', display: 'block' }}>Total Tagihan:</span>
                <strong style={{ fontSize: '1.2rem', color: isLight ? '#111827' : '#ffffff' }}>Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Kotak Informasi Gateway DOKU */}
            <div style={{
              backgroundColor: isLight ? '#f3f4f6' : '#18181b',
              border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={32} color={isLight ? '#111827' : '#ffffff'} style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '800', color: isLight ? '#111827' : '#ffffff' }}>
                Gateway Pembayaran DOKU Resmi
              </h4>
              <p style={{ fontSize: '0.8rem', color: isLight ? '#4b5563' : '#a1a1aa', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Merchant: <strong>ngonten.id</strong> (Client ID: {DOKU_CONFIG.clientId})<br />
                Klik tombol di bawah untuk menyelesaikan pembayaran secara instan dan mengaktifkan status Creator Pro.
              </p>

              <button
                onClick={handleManualCheckPayment}
                disabled={isVerifying}
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: isLight ? '#111827' : '#ffffff',
                  color: isLight ? '#ffffff' : '#000000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
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
                    <RefreshCw size={16} className="animate-spin" color={isLight ? '#ffffff' : '#000000'} />
                    <span>Memproses & Mengaktifkan Paket...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} color={isLight ? '#ffffff' : '#000000'} />
                    <span>Konfirmasi Pembayaran DOKU</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep('select_method')}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: isLight ? '#f3f4f6' : 'transparent',
                color: isLight ? '#4b5563' : '#a1a1aa',
                border: isLight ? '1px solid #e5e7eb' : '1px solid #27272a',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Ganti Metode Pembayaran
            </button>
          </div>
        )}

        {/* ================= STEP 4: SUKSES ================= */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isLight ? '#111827' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Check size={32} color={isLight ? '#ffffff' : '#000000'} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: isLight ? '#111827' : '#ffffff' }}>
              Selamat! Paket {selectedPlan?.name} Aktif 🎉
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: isLight ? '#4b5563' : '#d4d4d8', lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              Pembayaran via DOKU Payment Gateway berhasil diverifikasi. Akun Anda kini resmi memiliki status <strong>CREATOR PRO</strong> dengan potongan biaya penarikan dompet hanya 2% dan akses penuh ekosistem ngonten.id.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: isLight ? '#111827' : '#ffffff',
                color: isLight ? '#ffffff' : '#000000',
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
