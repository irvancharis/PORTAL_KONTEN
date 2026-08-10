import React, { useState, useEffect } from 'react';
import { Crown, Check, X, QrCode, Landmark, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  confirmations,
  setConfirmations,
  onLoginClick
}) {
  const [step, setStep] = useState('select_plan'); // 'select_plan' | 'select_method' | 'pay_screen' | 'success'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri'
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit

  useEffect(() => {
    if (isOpen) {
      setStep('select_plan');
      setBillingCycle('monthly');
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

  const planDetails = {
    monthly: {
      duration: '1 Bulan',
      price: 'Rp 20.000',
      numericPrice: 20000,
      periodLabel: '/ bulan',
      badge: 'FLEKSIBEL'
    },
    yearly: {
      duration: '1 Tahun',
      price: 'Rp 200.000',
      numericPrice: 200000,
      periodLabel: '/ tahun',
      badge: 'HEMAT 2 BULAN'
    }
  };

  const currentPlan = planDetails[billingCycle];

  const premiumFeatures = [
    'Akses Penuh Seluruh Karya, Film & Konten Eksklusif Bebas Iklan',
    'Unlock Portofolio Lengkap & Kontak Langsung Kreator / Brand',
    'Akses Prioritas Tiket & Undangan Event Eksklusif ngonten.id',
    'Biaya Penarikan Dompet Hemat 60% (Hanya 2%)',
    'Badge Verifikasi Mahkota "PREMIUM MEMBER" di Profil'
  ];

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProceedToMethod = () => {
    if (!currentUser) {
      if (onLoginClick) onLoginClick('register');
      onClose();
      return;
    }
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
          bankName: selectedMethod.toUpperCase(),
          senderName: currentUser?.name || currentUser?.username,
          amount: `Rp ${currentPlan.numericPrice.toLocaleString('id-ID')}`,
          status: 'approved',
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

  return (
    <div className="doku-modal-wrapper" onClick={onClose}>
      <div 
        className="doku-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(128,128,128,0.12)',
            border: '1px solid rgba(128,128,128,0.2)',
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
          <X size={16} />
        </button>

        {/* Header Modal */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            marginBottom: '12px'
          }}>
            <Crown size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>
            {step === 'select_plan' && 'Paket User Premium'}
            {step === 'select_method' && 'Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran'}
            {step === 'success' && 'Pembayaran Berhasil!'}
          </h2>
          <p className="desc-text" style={{ fontSize: '0.84rem', margin: 0 }}>
            {step === 'select_plan' && 'Tingkatkan akun ke User Premium untuk akses penuh ekosistem ngonten.id.'}
            {step === 'select_method' && 'Pilih metode pembayaran instan dan terenkripsi.'}
            {step === 'pay_screen' && 'Scan QRIS atau transfer ke nomor VA di bawah untuk aktivasi instan.'}
            {step === 'success' && 'Akun Anda resmi aktif sebagai User Premium.'}
          </p>
        </div>

        {/* ================= STEP 1: PILIH MASA AKTIF USER PREMIUM ================= */}
        {step === 'select_plan' && (
          <div>
            {/* Pilihan Durasi (1 Bulan / 1 Tahun) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '18px'
            }}>
              {/* Opsi 1 Bulan */}
              <div
                onClick={() => setBillingCycle('monthly')}
                className={`doku-plan-card ${billingCycle === 'monthly' ? 'active' : ''}`}
                style={{
                  padding: '16px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {billingCycle === 'monthly' && (
                  <div 
                    className="doku-white-badge"
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '12px',
                      zIndex: 2
                    }}
                  >
                    <span className="doku-white-text">✓ DIPILIH</span>
                  </div>
                )}
                
                <span className="desc-text" style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Masa Aktif 1 Bulan
                </span>
                <strong className="price" style={{ fontSize: '1.25rem', fontWeight: '900', display: 'block' }}>
                  Rp 20.000
                </strong>
                <span className="desc-text" style={{ fontSize: '0.7rem' }}>/ bulan</span>
              </div>

              {/* Opsi 1 Tahun */}
              <div
                onClick={() => setBillingCycle('yearly')}
                className={`doku-plan-card ${billingCycle === 'yearly' ? 'active' : ''}`}
                style={{
                  padding: '16px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {billingCycle === 'yearly' && (
                  <div 
                    className="doku-white-badge"
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '12px',
                      zIndex: 2
                    }}
                  >
                    <span className="doku-white-text">✓ DIPILIH</span>
                  </div>
                )}

                <div 
                  className="doku-white-badge"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    zIndex: 2
                  }}
                >
                  <span className="doku-white-text">HEMAT 2 BULAN</span>
                </div>
                
                <span className="desc-text" style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Masa Aktif 1 Tahun
                </span>
                <strong className="price" style={{ fontSize: '1.25rem', fontWeight: '900', display: 'block' }}>
                  Rp 200.000
                </strong>
                <span className="desc-text" style={{ fontSize: '0.7rem' }}>/ tahun (~16.600/bln)</span>
              </div>
            </div>

            {/* Kotak Rincian Keuntungan User Premium */}
            <div className="doku-plan-card" style={{ padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.86rem', fontWeight: '800' }}>
                  Keuntungan User Premium ({currentPlan.duration}):
                </strong>
                <strong style={{ fontSize: '1rem', fontWeight: '900' }}>{currentPlan.price}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {premiumFeatures.map((feat, idx) => (
                  <div key={idx} className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                    <Check size={16} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: '600' }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Lanjut */}
            <button
              onClick={handleProceedToMethod}
              className="doku-btn-main"
            >
              <span className="doku-white-text">{currentUser ? `Lanjut Pembayaran (${currentPlan.duration})` : 'Daftar & Berlangganan'}</span>
              <ArrowRight size={16} color="#ffffff" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: PILIH METODE PEMBAYARAN ================= */}
        {step === 'select_method' && (
          <div>
            {/* Ringkasan Tagihan */}
            <div className="doku-plan-card" style={{ marginBottom: '18px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span className="desc-text">Paket Langganan:</span>
                <strong style={{ fontWeight: '700' }}>User Premium ({currentPlan.duration})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span className="desc-text">Merchant:</span>
                <strong style={{ fontWeight: '700' }}>ngonten.id Official</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(128,128,128,0.2)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontWeight: '800', fontSize: '0.9rem' }}>Total Tagihan:</strong>
                <strong style={{ fontSize: '1.25rem', fontWeight: '900' }}>
                  {currentPlan.price}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', margin: 0 }}>
                Pilih Metode Pembayaran
              </h4>
              <span className="desc-text" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Terenkripsi & Aman
              </span>
            </div>

            {/* List Metode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              
              {/* Opsi 1: QRIS */}
              <div 
                onClick={() => setSelectedMethod('qris')}
                className={`doku-plan-card ${selectedMethod === 'qris' ? 'active' : ''}`}
                style={{
                  padding: '14px 16px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={24} />
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>QRIS (Scan Real-Time)</strong>
                    <span className="desc-text" style={{ fontSize: '0.75rem' }}>BCA, GoPay, OVO, DANA, ShopeePay & Semua Bank</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  backgroundColor: selectedMethod === 'qris' ? 'currentColor' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                </div>
              </div>

              {/* Opsi 2: VA BCA */}
              <div 
                onClick={() => setSelectedMethod('va_bca')}
                className={`doku-plan-card ${selectedMethod === 'va_bca' ? 'active' : ''}`}
                style={{
                  padding: '14px 16px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} />
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>BCA Virtual Account</strong>
                    <span className="desc-text" style={{ fontSize: '0.75rem' }}>Transfer via BCA Mobile / KlikBCA / ATM BCA</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  backgroundColor: selectedMethod === 'va_bca' ? 'currentColor' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_bca' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                </div>
              </div>

              {/* Opsi 3: VA Mandiri */}
              <div 
                onClick={() => setSelectedMethod('va_mandiri')}
                className={`doku-plan-card ${selectedMethod === 'va_mandiri' ? 'active' : ''}`}
                style={{
                  padding: '14px 16px',
                  marginBottom: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Landmark size={24} />
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>Mandiri Virtual Account (Livin')</strong>
                    <span className="desc-text" style={{ fontSize: '0.75rem' }}>Transfer via Livin' by Mandiri / ATM</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  backgroundColor: selectedMethod === 'va_mandiri' ? 'currentColor' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va_mandiri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep('select_plan')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'rgba(128,128,128,0.1)',
                  border: '1px solid rgba(128,128,128,0.2)',
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
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>

              <button
                onClick={() => setStep('pay_screen')}
                className="doku-btn-main"
                style={{ flex: 2 }}
              >
                <span className="doku-white-text">Lanjut ke Pembayaran</span>
                <ArrowRight size={16} color="#ffffff" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TAMPILAN PEMBAYARAN REAL ================= */}
        {step === 'pay_screen' && (
          <div>
            {/* Header Timer & Total */}
            <div 
              className="doku-plan-card"
              style={{
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span className="desc-text" style={{ fontSize: '0.75rem', display: 'block' }}>Batas Waktu:</span>
                <strong style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>{formatTimer(timeLeft)}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="desc-text" style={{ fontSize: '0.75rem', display: 'block' }}>Total Pembayaran:</span>
                <strong style={{ fontSize: '1.2rem' }}>{currentPlan.price}</strong>
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
                    <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: '700' }}>PEMBAYARAN RESMI</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: '700' }}>
                      Nominal: {currentPlan.price}
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
                    <text x="50" y="53" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">QRIS</text>

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
              <div className="doku-plan-card" style={{ padding: '20px', marginBottom: '18px' }}>
                <span className="desc-text" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>
                  Nomor Virtual Account ({selectedMethod.replace('va_', '').toUpperCase()}):
                </span>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(128,128,128,0.1)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(128,128,128,0.2)',
                  marginBottom: '14px'
                }}>
                  <strong style={{ fontSize: '1.25rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    {vaNumbers[selectedMethod] || '88708 0812 3456 7890'}
                  </strong>
                  <button
                    onClick={() => handleCopy(vaNumbers[selectedMethod] || '88708 0812 3456 7890')}
                    style={{
                      backgroundColor: 'rgba(128,128,128,0.2)',
                      color: 'inherit',
                      border: '1px solid rgba(128,128,128,0.25)',
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
                    <Copy size={14} />
                    <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>

                <div className="desc-text" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                  <strong style={{ color: 'inherit' }}>Cara Pembayaran:</strong>
                  <ol style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                    <li>Buka aplikasi m-Banking atau ATM bank Anda.</li>
                    <li>Pilih menu <strong>Transfer / Pembayaran &gt; Virtual Account</strong>.</li>
                    <li>Masukkan nomor VA di atas dan konfirmasi nama merchant <strong>ngonten.id</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tombol Cek Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="doku-btn-main"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" color="#ffffff" />
                    <span className="doku-white-text">Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#ffffff" />
                    <span className="doku-white-text">Saya Sudah Bayar (Cek Status Sekarang)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('select_method')}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(128,128,128,0.2)',
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
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Crown size={32} color="#ffffff" />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px 0' }}>
              Selamat! User Premium Aktif ({currentPlan.duration}) 🎉
            </h3>
            
            <p className="desc-text" style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              Pembayaran Anda telah berhasil diverifikasi. Akun Anda kini resmi memiliki status <strong>USER PREMIUM</strong> dengan potongan biaya penarikan dompet 2% dan akses penuh ekosistem ngonten.id.
            </p>

            <button
              onClick={onClose}
              className="doku-btn-main"
            >
              <span className="doku-white-text">Mulai Eksplorasi Fitur Premium</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
