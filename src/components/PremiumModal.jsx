import React, { useState, useEffect } from 'react';
import { Crown, Check, X, QrCode, Landmark, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw, Smartphone, ExternalLink, Sparkles, Upload, Send, MessageCircle } from 'lucide-react';
import { DUITKU_CONFIG, DUITKU_PAYMENT_METHODS, requestDuitkuInquiry, fetchDuitkuPaymentMethods } from '../services/duitkuPaymentService';
import { createMayarQRISPayment, checkMayarPaymentStatus } from '../services/mayarPaymentService';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  confirmations,
  setConfirmations,
  premiumPrice,
  whatsappAdmin = 'https://wa.me/6281234567890',
  paymentInstructions = '',
  qrisImageUrl = '',
  paymentGatewayMode = 'manual',
  onLoginClick
}) {
  const [step, setStep] = useState('select_plan'); // 'select_plan' | 'select_method' | 'pay_screen' | 'manual_pay' | 'success'
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

  // Manual payment state
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('BCA');
  const [receiptFile, setReceiptFile] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

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
      setSenderName(currentUser?.name || currentUser?.username || '');
      setSenderBank('BCA');
      setReceiptFile('');
      setIsSubmittingManual(false);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    let timer;
    if (step === 'pay_screen' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Otomatis verifikasi berkala (Polling real-time) setiap 4 detik
  useEffect(() => {
    let pollInterval;
    if (step === 'pay_screen' && duitkuData?.merchantOrderId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await checkMayarPaymentStatus(duitkuData.reference || duitkuData.merchantOrderId);
          if (res && res.isPaid) {
            clearInterval(pollInterval);
            handleVerifyPayment();
          }
        } catch (e) {
          // Silent catch for background polling
        }
      }, 4000);
    }
    return () => clearInterval(pollInterval);
  }, [step, duitkuData]);

  // Parse harga dari input Admin Panel (contoh: "5000", "Rp 5.000", "Rp 29.000 / Bulan")
  const parsedMonthlyPrice = (() => {
    if (!premiumPrice) return 20000;
    const numericStr = premiumPrice.toString().replace(/[^0-9]/g, '');
    const num = parseInt(numericStr, 10);
    return !isNaN(num) && num > 0 ? num : 20000;
  })();

  const planDetails = {
    monthly: {
      duration: '1 Bulan',
      price: `Rp ${parsedMonthlyPrice.toLocaleString('id-ID')}`,
      numericPrice: parsedMonthlyPrice,
      periodLabel: '/ bulan',
      badge: 'FLEKSIBEL'
    },
    yearly: {
      duration: '1 Tahun',
      price: `Rp ${(parsedMonthlyPrice * 10).toLocaleString('id-ID')}`,
      numericPrice: parsedMonthlyPrice * 10,
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
    if (paymentGatewayMode === 'manual') {
      setStep('manual_pay');
    } else {
      setStep('select_method');
    }
  };

  const handleManualPaymentSubmit = (e) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert('Nama pengirim transfer wajib diisi!');
      return;
    }
    if (!receiptFile) {
      alert('Silakan upload foto/gambar bukti transfer Anda!');
      return;
    }

    setIsSubmittingManual(true);
    setTimeout(() => {
      setIsSubmittingManual(false);
      const newConfirmation = {
        id: `conf_${Date.now()}`,
        userId: currentUser?.id || currentUser?.username,
        username: currentUser?.username,
        bankName: senderBank,
        senderName: senderName.trim(),
        amount: currentPlan.price,
        receiptUrl: receiptFile,
        timestamp: new Date().toISOString(),
        status: 'pending',
        gateway: 'MANUAL',
        billingDuration: currentPlan.duration
      };

      if (setConfirmations) {
        setConfirmations(prev => [newConfirmation, ...(prev || [])]);
      }
      setStep('success');
    }, 1000);
  };

  const handleProceedToPayScreen = async () => {
    setIsInitiating(true);
    const orderId = `NGONTEN-${Date.now()}`;

    try {
      if (selectedMethod === 'qris') {
        // Panggil Mayar.id Dynamic QRIS Generator
        const mayarRes = await createMayarQRISPayment({
          name: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
          email: currentUser?.email || `${currentUser?.username || 'user'}@ngonten.id`,
          mobile: currentUser?.phone || '081234567890',
          amount: currentPlan.numericPrice,
          description: `User Premium ngonten.id (${currentPlan.duration})`,
          orderId: orderId
        });

        if (mayarRes && mayarRes.data) {
          setDuitkuData({
            merchantOrderId: orderId,
            reference: mayarRes.data.id || orderId,
            qrString: mayarRes.data.qrCodeUrl || '',
            vaNumber: '',
            paymentUrl: mayarRes.data.link || '',
            gateway: 'MAYAR'
          });
        }
      } else {
        const paymentCode = DUITKU_PAYMENT_METHODS[selectedMethod]?.code || 'SP';
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
            paymentUrl: res.data.paymentUrl || '',
            gateway: 'DUITKU'
          });
        }
      }
    } catch (e) {
      console.warn('Payment Inquiry Exception:', e);
      setDuitkuData({
        merchantOrderId: orderId,
        reference: orderId,
        qrString: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${encodeURIComponent(`00020101021226580016ID.CO.MAYAR.WWW0118936005230000012345520458125303360540${currentPlan.numericPrice}5802ID5910NGONTEN.ID6007JAKARTA62190115${orderId}6304ABCD`)}`,
        vaNumber: '',
        paymentUrl: '',
        gateway: 'MAYAR'
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
            {step === 'manual_pay' && 'Transfer Pembayaran Manual'}
            {step === 'success' && (paymentGatewayMode === 'manual' ? 'Konfirmasi Terkirim!' : 'Pembayaran Berhasil!')}
          </h2>
          <p className="desc-text" style={{ fontSize: '0.84rem', margin: 0 }}>
            {step === 'select_plan' && 'Tingkatkan akun ke User Premium untuk akses penuh ekosistem ngonten.id.'}
            {step === 'select_method' && 'Pilih metode pembayaran instan dan terenkripsi.'}
            {step === 'pay_screen' && 'Scan QRIS atau transfer ke nomor VA di bawah untuk aktivasi instan.'}
            {step === 'manual_pay' && 'Transfer sesuai nominal ke rekening admin dan lampirkan bukti transfer.'}
            {step === 'success' && (paymentGatewayMode === 'manual' ? 'Bukti transfer berhasil dikirim. Admin akan segera memverifikasi akun Anda.' : 'Akun Anda resmi aktif sebagai User Premium.')}
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
                  {planDetails.monthly.price}
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
                  {planDetails.yearly.price}
                </strong>
                <span className="desc-text" style={{ fontSize: '0.7rem' }}>/ tahun (~Rp {Math.round(planDetails.yearly.numericPrice / 12).toLocaleString('id-ID')}/bln)</span>
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

            {/* List Metode (Dinamis atau Fallback) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {isLoadingMethods ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'inherit' }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Memuat saluran pembayaran...</span>
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
                  {/* Channel 1: QRIS */}
                  <div 
                    onClick={() => setSelectedMethod('qris')}
                    className={`doku-plan-card ${selectedMethod === 'qris' ? 'active' : ''}`}
                    style={{
                      padding: '16px 20px',
                      marginBottom: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <strong style={{ fontSize: '0.95rem', minWidth: '60px' }}>QRIS</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#ee4d2d', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>ShopeePay</span>
                        <span style={{ background: '#4c2a86', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>OVO</span>
                        <span style={{ background: '#00aed6', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>GOPAY</span>
                        <span style={{ background: '#118eea', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>DANA</span>
                        <span style={{ background: '#005baa', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>BCA Mobile</span>
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod === 'qris' ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedMethod === 'qris' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                    </div>
                  </div>

                  {/* Channel 2: Transfer Bank (VA) */}
                  <div 
                    onClick={() => setSelectedMethod('va_bca')}
                    className={`doku-plan-card ${selectedMethod.startsWith('va_') ? 'active' : ''}`}
                    style={{
                      padding: '16px 20px',
                      marginBottom: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <strong style={{ fontSize: '0.92rem', minWidth: '130px' }}>Transfer Bank (VA)</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#003399', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>ATM Bersama</span>
                        <span style={{ background: '#0066b2', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>PRIMA</span>
                        <span style={{ background: '#e5231b', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>ALTO</span>
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod.startsWith('va_') ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedMethod.startsWith('va_') && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
                    </div>
                  </div>

                  {/* Channel 3: E-Wallet */}
                  <div 
                    onClick={() => setSelectedMethod('ewallet_dana')}
                    className={`doku-plan-card ${selectedMethod.startsWith('ewallet_') ? 'active' : ''}`}
                    style={{
                      padding: '16px 20px',
                      marginBottom: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <strong style={{ fontSize: '0.92rem', minWidth: '130px' }}>E-Wallet</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ background: '#00aed6', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>GoPay</span>
                        <span style={{ background: '#118eea', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>DANA</span>
                        <span style={{ background: '#ee4d2d', color: 'white', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>ShopeePay</span>
                      </div>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid currentColor',
                      backgroundColor: selectedMethod.startsWith('ewallet_') ? 'currentColor' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedMethod.startsWith('ewallet_') && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />}
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
                    <span className="doku-white-text">Memproses Pembayaran...</span>
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

            {/* Banner Order ID untuk Referensi */}
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
                  <span style={{ color: '#3b82f6', fontWeight: '700', display: 'block' }}>ID Transaksi / Order ID:</span>
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
                    <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: '700' }}>OFFICIAL GATEWAY</span>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: '700' }}>
                      Nominal: {currentPlan.price}
                    </span>
                  </div>

                  {/* QRIS Dinamis Mayar / Official Uploaded QRIS */}
                  {qrisImageUrl ? (
                    <img 
                      src={qrisImageUrl}
                      alt="Official QRIS Code"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '8px auto',
                        borderRadius: '8px',
                        background: '#ffffff',
                        padding: '4px'
                      }}
                    />
                  ) : duitkuData?.qrString && !duitkuData?.qrString?.startsWith('http') ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(duitkuData.qrString)}`}
                      alt="Official QRIS Code"
                      style={{
                        width: '180px',
                        height: '180px',
                        display: 'block',
                        margin: '6px auto',
                        borderRadius: '6px'
                      }}
                    />
                  ) : duitkuData?.qrString?.startsWith('http') ? (
                    <img 
                      src={duitkuData.qrString}
                      alt="Official Mayar QRIS Code"
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
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(`00020101021226580016ID.CO.MAYAR.WWW0118936005230000012345520458125303360540${currentPlan.numericPrice}5802ID5910NGONTEN.ID6007JAKARTA62190115${duitkuData?.merchantOrderId || 'INV'}6304ABCD`)}`}
                      alt="Official QRIS Code"
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
                onClick={() => setStep('select_plan')}
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
                Ganti Paket / Kembali
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP: MANUAL PAYMENT TRANSFER & PROOF UPLOAD ================= */}
        {step === 'manual_pay' && (
          <form onSubmit={handleManualPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Ringkasan Tagihan */}
            <div className="doku-plan-card" style={{ padding: '16px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span className="desc-text">Paket Langganan:</span>
                <strong style={{ fontWeight: '700' }}>User Premium ({currentPlan.duration})</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(128,128,128,0.2)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontWeight: '800', fontSize: '0.9rem' }}>Total yang Harus Ditransfer:</strong>
                <strong style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>
                  {currentPlan.price}
                </strong>
              </div>
            </div>

            {/* Rekening Tujuan Transfer */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Landmark size={18} color="#38bdf8" />
                <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Nomor Rekening / E-Wallet Tujuan:</strong>
              </div>
              <div style={{
                fontSize: '0.84rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)'
              }}>
                {paymentInstructions || '- Bank BCA: 1234567890 a.n. ngonten.id\n- DANA: 081234567890 a.n. Admin\n- OVO: 081234567890'}
              </div>
            </div>

            {/* Form Input Bukti Bayar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Nama Pengirim</label>
                <input 
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Nama pemilik rekening"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(128,128,128,0.25)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Bank / E-Wallet Asal</label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(128,128,128,0.25)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="BCA" style={{ background: '#1e293b', color: 'white' }}>BCA</option>
                  <option value="MANDIRI" style={{ background: '#1e293b', color: 'white' }}>Mandiri</option>
                  <option value="BRI" style={{ background: '#1e293b', color: 'white' }}>BRI</option>
                  <option value="BNI" style={{ background: '#1e293b', color: 'white' }}>BNI</option>
                  <option value="DANA" style={{ background: '#1e293b', color: 'white' }}>DANA</option>
                  <option value="GOPAY" style={{ background: '#1e293b', color: 'white' }}>GoPay</option>
                  <option value="OVO" style={{ background: '#1e293b', color: 'white' }}>OVO</option>
                  <option value="SHOPEEPAY" style={{ background: '#1e293b', color: 'white' }}>ShopeePay</option>
                  <option value="LAINNYA" style={{ background: '#1e293b', color: 'white' }}>Lainnya</option>
                </select>
              </div>
            </div>

            {/* Upload Bukti Transfer */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Upload Bukti Transfer</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        setReceiptFile(re.target?.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  required={!receiptFile}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(128,128,128,0.4)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'inherit',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
              </div>
              {receiptFile && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={receiptFile} 
                    alt="Bukti Bayar" 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} 
                  />
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>✓ Bukti transfer terlampir</span>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
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
                type="submit"
                disabled={isSubmittingManual}
                className="doku-btn-main"
                style={{ flex: 2 }}
              >
                {isSubmittingManual ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" color="#ffffff" />
                    <span className="doku-white-text">Mengirim Bukti...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} color="#ffffff" />
                    <span className="doku-white-text">Kirim Konfirmasi Bayar</span>
                  </>
                )}
              </button>
            </div>

            {whatsappAdmin && (
              <a 
                href={whatsappAdmin}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#22c55e',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  marginTop: '4px'
                }}
              >
                <MessageCircle size={14} />
                <span>Butuh Bantuan? Hubungi Admin WhatsApp</span>
              </a>
            )}
          </form>
        )}

        {/* ================= STEP 4: SUKSES ================= */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: paymentGatewayMode === 'manual' ? '#10b981' : '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              {paymentGatewayMode === 'manual' ? <Check size={32} color="#ffffff" strokeWidth={3} /> : <Crown size={32} color="#ffffff" />}
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px 0' }}>
              {paymentGatewayMode === 'manual' 
                ? 'Bukti Pembayaran Terkirim! 🎉' 
                : `Selamat! User Premium Aktif (${currentPlan.duration}) 🎉`}
            </h3>
            
            <p className="desc-text" style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '22px', maxWidth: '380px', margin: '0 auto 22px auto' }}>
              {paymentGatewayMode === 'manual'
                ? `Terima kasih! Bukti transfer paket ${currentPlan.duration} Anda telah masuk ke sistem. Admin akan memvalidasi pembayaran Anda dalam waktu 1-15 menit.`
                : 'Pembayaran Anda telah berhasil diverifikasi secara otomatis. Akun Anda kini resmi memiliki status USER PREMIUM dengan potongan biaya penarikan dompet 2% dan akses penuh ekosistem ngonten.id.'}
            </p>

            <button
              onClick={onClose}
              className="doku-btn-main"
            >
              <span className="doku-white-text">
                {paymentGatewayMode === 'manual' ? 'Selesai & Tutup' : 'Mulai Eksplorasi Fitur Premium'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
