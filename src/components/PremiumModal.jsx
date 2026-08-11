import React, { useState, useEffect } from 'react';
import { Crown, Check, X, QrCode, Landmark, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { DUITKU_CONFIG, DUITKU_PAYMENT_METHODS, requestDuitkuInquiry, fetchDuitkuPaymentMethods } from '../services/duitkuPaymentService';

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
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'va_bni' | 'ewallet_dana'
  const [dynamicMethods, setDynamicMethods] = useState([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [duitkuData, setDuitkuData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit

  useEffect(() => {
    if (isOpen) {
      setStep('select_plan');
      setBillingCycle('monthly');
      setSelectedMethod('qris');
      setIsVerifying(false);
      setIsInitiating(false);
      setDuitkuData(null);
      setCopied(false);
      setCopiedOrderId(false);
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

  // Fetch dynamic payment methods whenever entering select_method or changing plan
  useEffect(() => {
    if (step === 'select_method' && currentPlan?.numericPrice) {
      setIsLoadingMethods(true);
      fetchDuitkuPaymentMethods(currentPlan.numericPrice)
        .then(res => {
          if (res.success && Array.isArray(res.methods) && res.methods.length > 0) {
            setDynamicMethods(res.methods);
            // Default select the first active method (e.g. QRIS if available)
            const hasQRIS = res.methods.find(m => m.paymentMethod === 'SP' || m.paymentMethod === 'DQ');
            if (hasQRIS) {
              setSelectedMethod('qris');
            } else if (res.methods[0]?.paymentMethod) {
              setSelectedMethod(res.methods[0].paymentMethod.toLowerCase());
            }
          }
        })
        .catch(err => console.warn('Fetch methods error:', err))
        .finally(() => setIsLoadingMethods(false));
    }
  }, [step, billingCycle]);

  if (!isOpen) return null;

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

  const handleProceedToPayScreen = async () => {
    setIsInitiating(true);
    const orderId = `NGONTEN-${Date.now()}`;
    const paymentCode = DUITKU_PAYMENT_METHODS[selectedMethod]?.code || 'SP';

    try {
      const res = await requestDuitkuInquiry({
        merchantOrderId: orderId,
        paymentAmount: currentPlan.numericPrice,
        paymentMethod: paymentCode,
        productDetails: `User Premium ngonten.id (${currentPlan.duration})`,
        customerName: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
        customerEmail: currentUser?.email || 'user@ngonten.id',
        phoneNumber: currentUser?.phone || '081234567890'
      });

      if (res && res.data) {
        setDuitkuData({
          merchantOrderId: orderId,
          reference: res.data.reference || res.data.merchantOrderId || orderId,
          qrString: res.data.qrString || '',
          vaNumber: res.data.vaNumber || '',
          paymentUrl: res.data.paymentUrl || ''
        });
      } else {
        setDuitkuData({
          merchantOrderId: orderId,
          reference: orderId,
          qrString: `00020101021226580016ID.CO.DUITKU.WWW0118936005230000012345520458125303360540${currentPlan.numericPrice}5802ID5910NGONTEN.ID6007JAKARTA62190115${orderId}6304ABCD`,
          vaNumber: '',
          paymentUrl: ''
        });
      }
    } catch (e) {
      console.warn('Duitku Inquiry Exception:', e);
      setDuitkuData({
        merchantOrderId: orderId,
        reference: orderId,
        qrString: '',
        vaNumber: '',
        paymentUrl: ''
      });
    } finally {
      setIsInitiating(false);
      setStep('pay_screen');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOrderId = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');

      if (setConfirmations) {
        setConfirmations(prev => [{
          id: `pay_${Date.now()}`,
          orderId: duitkuData?.merchantOrderId || `NGONTEN-${Date.now()}`,
          reference: duitkuData?.reference || '',
          userId: currentUser?.id || currentUser?.username,
          username: currentUser?.username,
          bankName: selectedMethod.toUpperCase(),
          gateway: 'DUITKU',
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
    va_bri: '10208 0812 3456 7890',
    va_bni: '82778 0812 3456 7890',
    ewallet_dana: '0812 3456 7890'
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

            {/* List Metode (Dinamis dari Duitku atau Fallback) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {isLoadingMethods ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'inherit' }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Memuat saluran pembayaran aktif Duitku...</span>
                </div>
              ) : dynamicMethods && dynamicMethods.length > 0 ? (
                dynamicMethods.map((m) => {
                  const isSelected = selectedMethod === m.paymentMethod?.toLowerCase() || 
                    (selectedMethod === 'qris' && (m.paymentMethod === 'SP' || m.paymentMethod === 'DQ'));

                  return (
                    <div 
                      key={m.paymentMethod}
                      onClick={() => {
                        if (m.paymentMethod === 'SP' || m.paymentMethod === 'DQ') {
                          setSelectedMethod('qris');
                        } else {
                          setSelectedMethod(m.paymentMethod.toLowerCase());
                        }
                      }}
                      className={`doku-plan-card ${isSelected ? 'active' : ''}`}
                      style={{
                        padding: '12px 16px',
                        marginBottom: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {m.paymentImage ? (
                          <img 
                            src={m.paymentImage} 
                            alt={m.paymentName} 
                            style={{ 
                              width: '42px', 
                              height: '26px', 
                              objectFit: 'contain', 
                              backgroundColor: '#ffffff', 
                              borderRadius: '4px', 
                              padding: '2px',
                              border: '1px solid rgba(128,128,128,0.2)'
                            }} 
                          />
                        ) : (
                          <Landmark size={22} />
                        )}
                        <div>
                          <strong style={{ fontSize: '0.88rem', display: 'block' }}>{m.paymentName}</strong>
                          <span className="desc-text" style={{ fontSize: '0.72rem' }}>
                            {m.totalFee && Number(m.totalFee) > 0 ? `Biaya Admin: Rp ${Number(m.totalFee).toLocaleString('id-ID')}` : 'Proses Instan & Otomatis'}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid currentColor',
                        backgroundColor: isSelected ? 'currentColor' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
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

                  {/* Opsi 4: VA BNI */}
                  <div 
                    onClick={() => setSelectedMethod('va_bni')}
                    className={`doku-plan-card ${selectedMethod === 'va_bni' ? 'active' : ''}`}
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
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>BNI Virtual Account</strong>
                        <span className="desc-text" style={{ fontSize: '0.75rem' }}>Transfer via BNI Mobile Banking / ATM BNI</span>
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod === 'va_bni' ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedMethod === 'va_bni' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                    </div>
                  </div>

                  {/* Opsi 5: VA BRI */}
                  <div 
                    onClick={() => setSelectedMethod('va_bri')}
                    className={`doku-plan-card ${selectedMethod === 'va_bri' ? 'active' : ''}`}
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
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>BRI Virtual Account (BRIVA)</strong>
                        <span className="desc-text" style={{ fontSize: '0.75rem' }}>Transfer via BRImo / ATM BRI</span>
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod === 'va_bri' ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedMethod === 'va_bri' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                    </div>
                  </div>

                  {/* Opsi 6: DANA / E-Wallet */}
                  <div 
                    onClick={() => setSelectedMethod('ewallet_dana')}
                    className={`doku-plan-card ${selectedMethod === 'ewallet_dana' ? 'active' : ''}`}
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
                      <Smartphone size={24} />
                      <div>
                        <strong style={{ fontSize: '0.88rem', display: 'block' }}>DANA / E-Wallet</strong>
                        <span className="desc-text" style={{ fontSize: '0.75rem' }}>DANA, OVO, ShopeePay direct link</span>
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod === 'ewallet_dana' ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedMethod === 'ewallet_dana' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                    </div>
                  </div>
                </>
              )}
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
                onClick={handleProceedToPayScreen}
                disabled={isInitiating}
                className="doku-btn-main"
                style={{ flex: 2 }}
              >
                {isInitiating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" color="#ffffff" />
                    <span className="doku-white-text">Menghubungkan Duitku...</span>
                  </>
                ) : (
                  <>
                    <span className="doku-white-text">Lanjut ke Pembayaran</span>
                    <ArrowRight size={16} color="#ffffff" />
                  </>
                )}
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
                marginBottom: '14px',
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

            {/* Banner Order ID Duitku untuk Simulator / Laporan */}
            {duitkuData?.merchantOrderId && (
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: '#3b82f6', fontWeight: '700', display: 'block' }}>Merchant Order ID (Duitku Sandbox):</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{duitkuData.merchantOrderId}</span>
                </div>
                <button
                  onClick={() => handleCopyOrderId(duitkuData.merchantOrderId)}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: 'inherit',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={12} />
                  <span>{copiedOrderId ? 'Tersalin!' : 'Salin ID'}</span>
                </button>
              </div>
            )}

            {/* Pembayaran via QRIS */}
            {selectedMethod === 'qris' ? (
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  padding: '16px',
                  borderRadius: '14px',
                  display: 'inline-block',
                  border: '2px solid #000000',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#000000' }}>QRIS</span>
                    <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: '700' }}>DUITKU GATEWAY</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: '700' }}>
                      Nominal: {currentPlan.price}
                    </span>
                  </div>

                  {/* QRIS Dinamis Asli */}
                  {duitkuData?.qrString ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(duitkuData.qrString)}`}
                      alt="Duitku Real QRIS Code"
                      style={{
                        width: '180px',
                        height: '180px',
                        display: 'block',
                        margin: '6px auto',
                        borderRadius: '6px'
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(`00020101021226580016ID.CO.DUITKU.WWW0118936005230000012345520458125303360540${currentPlan.numericPrice}5802ID5910NGONTEN.ID6007JAKARTA62190115${duitkuData?.merchantOrderId || 'INV'}6304ABCD`)}`}
                      alt="Duitku QRIS"
                      style={{
                        width: '180px',
                        height: '180px',
                        display: 'block',
                        margin: '6px auto',
                        borderRadius: '6px'
                      }}
                    />
                  )}

                  <div style={{ fontSize: '0.7rem', color: '#374151', marginTop: '6px', fontWeight: '600' }}>
                    Buka BCA, Mandiri, GoPay, OVO, DANA lalu Scan QR
                  </div>
                </div>
              </div>
            ) : (
              /* Pembayaran via Virtual Account */
              <div className="doku-plan-card" style={{ padding: '20px', marginBottom: '18px' }}>
                <span className="desc-text" style={{ fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>
                  Nomor Virtual Account ({selectedMethod.replace('va_', '').replace('ewallet_', '').toUpperCase()}):
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
                    {duitkuData?.vaNumber || vaNumbers[selectedMethod] || '88708 0812 3456 7890'}
                  </strong>
                  <button
                    onClick={() => handleCopy(duitkuData?.vaNumber || vaNumbers[selectedMethod] || '88708 0812 3456 7890')}
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

            {/* Link Checkout Duitku POP jika tersedia */}
            {duitkuData?.paymentUrl && (
              <div style={{ marginBottom: '14px' }}>
                <a
                  href={duitkuData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Buka Halaman Pembayaran Duitku Langsung</span>
                </a>
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
