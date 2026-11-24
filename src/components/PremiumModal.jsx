import React, { useState, useEffect, useRef } from 'react';
import { Crown, Check, X, QrCode, Landmark, ShieldCheck, ArrowRight, ArrowLeft, Copy, CheckCircle2, RefreshCw, Smartphone, ExternalLink, Sparkles, Upload, Send, MessageCircle } from 'lucide-react';
import { DUITKU_CONFIG, DUITKU_PAYMENT_METHODS, requestDuitkuInquiry, fetchDuitkuPaymentMethods } from '../services/duitkuPaymentService';
import { createMayarInvoicePayment, checkMayarPaymentStatus, fetchMayarPaymentChannels } from '../services/mayarPaymentService';
import { createTripayPayment, TRIPAY_PAYMENT_METHODS } from '../services/tripayPaymentService';
import { isFirebaseConfigured, saveFirestoreUser } from '../firebase';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  users,
  handleSetUsers,
  confirmations,
  setConfirmations,
  premiumPrice,
  whatsappAdmin = 'https://wa.me/6281234567890',
  paymentInstructions = '',
  platformBankAccounts = [],
  qrisImageUrl = '',
  paymentGatewayMode = 'manual',
  onLoginClick
}) {
  const [step, setStep] = useState('select_plan'); // 'select_plan' | 'select_method' | 'pay_screen' | 'manual_pay' | 'success'
  const modalContainerRef = useRef(null);
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
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
    }
    const wrapper = document.querySelector('.doku-modal-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVerifying(false);
      setIsInitiating(false);
      setCopied(false);
      setCopiedOrderId(false);
      setSenderName(currentUser?.name || currentUser?.username || '');
      setSenderBank('BCA');
      setReceiptFile('');
      setIsSubmittingManual(false);

      // Cek apakah user memiliki transaksi pending aktif (misal dalam 15-30 menit terakhir)
      const userPending = (confirmations || []).find(c => 
        c.status === 'pending' && 
        (c.userId === currentUser?.id || c.username?.toLowerCase() === currentUser?.username?.toLowerCase()) &&
        (Date.now() - new Date(c.timestamp).getTime() < 30 * 60 * 1000)
      );

      const savedSessionStr = localStorage.getItem('portal-active-payment-session');
      let savedSession = null;
      if (savedSessionStr) {
        try {
          const parsed = JSON.parse(savedSessionStr);
          if (parsed && (Date.now() - parsed.createdAt < 30 * 60 * 1000) && 
              (parsed.userId === currentUser?.id || parsed.username === currentUser?.username)) {
            savedSession = parsed;
          }
        } catch (e) {}
      }

      if (savedSession && savedSession.duitkuData?.qrString) {
        setDuitkuData(savedSession.duitkuData);
        setSelectedMethod(savedSession.selectedMethod || 'qris');
        setBillingCycle(savedSession.billingCycle || 'monthly');
        const elapsedSec = Math.floor((Date.now() - savedSession.createdAt) / 1000);
        setTimeLeft(Math.max(60, 900 - elapsedSec));
        setStep('pay_screen');
      } else if (userPending && userPending.qrString) {
        setBillingCycle(userPending.billingDuration?.includes('Tahun') ? 'yearly' : 'monthly');
        setSelectedMethod('qris');
        setDuitkuData({
          merchantOrderId: userPending.orderId,
          reference: userPending.reference || userPending.orderId,
          qrString: userPending.qrString,
          vaNumber: userPending.vaNumber || '',
          paymentUrl: userPending.paymentUrl || '',
          gateway: userPending.gateway || 'MAYAR',
          createdAt: new Date(userPending.timestamp).getTime()
        });
        const elapsedSec = Math.floor((Date.now() - new Date(userPending.timestamp).getTime()) / 1000);
        setTimeLeft(Math.max(60, 900 - elapsedSec));
        setStep('pay_screen');
      } else if (savedSession || userPending) {
        // Jika sesi ada tapi belum punya URL gambar QRIS, buatkan QRIS langsung
        const activeOrderId = savedSession?.duitkuData?.merchantOrderId || userPending?.orderId || `NGONTEN-${Date.now()}`;
        const activePlan = planDetails[savedSession?.billingCycle || (userPending?.billingDuration?.includes('Tahun') ? 'yearly' : 'monthly')];
        
        setBillingCycle(savedSession?.billingCycle || (userPending?.billingDuration?.includes('Tahun') ? 'yearly' : 'monthly'));
        setSelectedMethod('qris');
        setStep('pay_screen');

        createMayarInvoicePayment({
          name: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
          email: currentUser?.email || `${currentUser?.username || 'user'}@ngonten.id`,
          mobile: currentUser?.phone || '081234567890',
          amount: activePlan.numericPrice,
          orderId: activeOrderId
        }).then(res => {
          if (res?.data?.qrCodeUrl) {
            const freshData = {
              merchantOrderId: activeOrderId,
              reference: res.data.id || activeOrderId,
              qrString: res.data.qrCodeUrl,
              vaNumber: '',
              paymentUrl: res.data.link || '',
              gateway: 'MAYAR',
              createdAt: Date.now()
            };
            setDuitkuData(freshData);
            localStorage.setItem('portal-active-payment-session', JSON.stringify({
              userId: currentUser?.id || currentUser?.username,
              username: currentUser?.username,
              duitkuData: freshData,
              selectedMethod: 'qris',
              billingCycle: savedSession?.billingCycle || 'monthly',
              createdAt: Date.now()
            }));
          }
        });
      } else {
        setStep('select_plan');
        setBillingCycle('monthly');
        setSelectedMethod('qris');
        setDuitkuData(null);
        setTimeLeft(900);
      }
    }
  }, [isOpen, currentUser, confirmations]);

  useEffect(() => {
    let timer;
    if (step === 'pay_screen' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

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
      badge: 'FLEKSIBEL',
      durationDays: 30
    },
    yearly: {
      duration: '1 Tahun',
      price: `Rp ${(parsedMonthlyPrice * 10).toLocaleString('id-ID')}`,
      numericPrice: parsedMonthlyPrice * 10,
      periodLabel: '/ tahun',
      badge: 'HEMAT 2 BULAN',
      durationDays: 365
    }
  };

  const currentPlan = planDetails[billingCycle];

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    const orderRef = duitkuData?.reference || duitkuData?.merchantOrderId;
    const expectedAmount = currentPlan?.numericPrice;
    const qrCreatedAt = duitkuData?.createdAt || Date.now();

    try {
      const res = await checkMayarPaymentStatus(orderRef, expectedAmount, qrCreatedAt);
      console.log('🔍 [Hasil checkMayarPaymentStatus]:', res);

      if (res && res.isPaid) {
        setIsVerifying(false);
        setStep('success');

        // 1. Simpan / Perbarui Bukti Transaksi Approved ke Database
        try {
          if (setConfirmations) {
            setConfirmations(prev => {
              const list = prev || [];
              const existingIdx = list.findIndex(c => c.orderId === (duitkuData?.merchantOrderId || orderRef) || (duitkuData?.reference && c.reference === duitkuData.reference));
              const approvedItem = {
                id: duitkuData?.transactionRecordId || `pay_${Date.now()}`,
                orderId: duitkuData?.merchantOrderId || orderRef || `NGONTEN-${Date.now()}`,
                reference: duitkuData?.reference || '',
                userId: currentUser?.id || currentUser?.username || 'user',
                username: currentUser?.username || 'user',
                bankName: (duitkuData?.gateway || 'MAYAR') + ' - ' + selectedMethod.toUpperCase(),
                gateway: duitkuData?.gateway || 'MAYAR',
                senderName: currentUser?.name || currentUser?.username || 'user',
                amount: `Rp ${currentPlan.numericPrice.toLocaleString('id-ID')}`,
                status: 'approved',
                timestamp: new Date().toISOString(),
                billingDuration: currentPlan.duration
              };

              if (existingIdx >= 0) {
                const copy = [...list];
                copy[existingIdx] = { ...copy[existingIdx], ...approvedItem };
                return copy;
              }
              return [approvedItem, ...list];
            });
          }
        } catch (dbErr) {
          console.warn('Simpan konfirmasi error:', dbErr);
        }

        // 2. AKTIFKAN STATUS USER MENJADI MEMBER PREMIUM
        try {
          const durationMs = (currentPlan.durationDays || 30) * 24 * 60 * 60 * 1000;
          const currentExpiry = (currentUser?.premiumExpiresAt && currentUser.premiumExpiresAt > Date.now()) ? currentUser.premiumExpiresAt : Date.now();
          const newExpiresAt = currentExpiry + durationMs;

          if (currentUser && setCurrentUser) {
            const updatedCurrentUser = {
              ...currentUser,
              role: 'member',
              premiumExpiresAt: newExpiresAt
            };
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('portal-current-user', JSON.stringify(updatedCurrentUser));
            localStorage.removeItem('portal-active-payment-session');

            if (isFirebaseConfigured()) {
              saveFirestoreUser(updatedCurrentUser).catch(e => console.warn('Sync user Firestore error:', e));
            }

            if (users && handleSetUsers) {
              const updatedUsers = users.map(u => {
                if (u.id === currentUser.id || u.username?.toLowerCase() === currentUser.username?.toLowerCase()) {
                  return { ...u, role: 'member', premiumExpiresAt: newExpiresAt };
                }
                return u;
              });
              handleSetUsers(updatedUsers);
            }
          }
        } catch (userErr) {
          console.warn('Update user error:', userErr);
        }
      } else {
        setIsVerifying(false);
        alert('⚠️ Pembayaran belum terdeteksi. Silakan selesaikan pembayaran melalui QRIS terlebih dahulu, lalu klik tombol ini lagi.');
      }
    } catch (err) {
      console.error('Verifikasi Payment Error:', err);
      setIsVerifying(false);
      alert('⚠️ Gagal memeriksa status pembayaran: ' + (err.message || 'Terjadi kesalahan sistem'));
    }
  };



  // Fetch dynamic payment methods whenever entering select_method or changing plan
  useEffect(() => {
    if (step === 'select_method' && currentPlan?.numericPrice) {
      setIsLoadingMethods(true);
      fetchMayarPaymentChannels()
        .then(res => {
          if (res.success && Array.isArray(res.channels) && res.channels.length > 0) {
            const formatted = res.channels.map(ch => ({
              paymentMethod: ch.code || ch.channel || ch.id || 'qris',
              paymentName: ch.name || ch.title || (ch.code ? ch.code.toUpperCase() : 'QRIS'),
              paymentImage: ch.icon || ch.logo || '',
              totalFee: ch.fee || 0
            }));
            setDynamicMethods(formatted);
            setSelectedMethod(formatted[0].paymentMethod.toLowerCase());
          } else {
            // Fallback default
            setDynamicMethods([]);
          }
        })
        .catch(err => {
          console.warn('Fetch Mayar methods error:', err);
          setDynamicMethods([]);
        })
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
    // Langsung arahkan ke transfer Bank Mandiri
    setStep('manual_pay');
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

    let resultData = {
      merchantOrderId: orderId,
      reference: orderId,
      qrString: '',
      vaNumber: '',
      paymentUrl: '',
      gateway: selectedMethod === 'qris' ? 'MAYAR' : 'DUITKU',
      createdAt: Date.now()
    };

    try {
      const tripayMethodMap = {
        qris: 'QRIS',
        va_bca: 'BCAVA',
        va_mandiri: 'MANDIRIVA',
        va_bri: 'BRIVA',
        va_bni: 'BNIVA',
        va_permata: 'PERMATAVA',
        ewallet_dana: 'QRIS',
        ewallet_ovo: 'OVO',
        ewallet_shopee: 'SHOPEEPAY'
      };

      const tripayCode = tripayMethodMap[selectedMethod] || 'QRIS';
      const tripayRes = await createTripayPayment({
        method: tripayCode,
        amount: currentPlan.numericPrice,
        customerName: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
        customerEmail: currentUser?.email || `${currentUser?.username || 'user'}@ngonten.id`,
        customerPhone: currentUser?.phone || '081234567890',
        orderItems: [
          {
            sku: 'PREMIUM-' + billingCycle.toUpperCase(),
            name: `User Premium ngonten.id (${currentPlan.duration})`,
            price: currentPlan.numericPrice,
            quantity: 1
          }
        ]
      });

      if (tripayRes && tripayRes.success) {
        resultData = {
          merchantOrderId: tripayRes.merchantRef || orderId,
          reference: tripayRes.reference || orderId,
          qrString: tripayRes.qrUrl || '',
          vaNumber: tripayRes.payCode || '',
          paymentUrl: tripayRes.checkoutUrl || '',
          gateway: 'TRIPAY',
          createdAt: Date.now()
        };
      } else {
        // Fallback jika API sedang dalam proses approval
        resultData = {
          merchantOrderId: orderId,
          reference: orderId,
          qrString: '',
          vaNumber: '',
          paymentUrl: '',
          gateway: 'TRIPAY',
          createdAt: Date.now()
        };
      }
    } catch (e) {
      console.warn('TriPay Payment Exception:', e);
      resultData = {
        merchantOrderId: orderId,
        reference: orderId,
        qrString: '',
        vaNumber: '',
        paymentUrl: '',
        gateway: 'TRIPAY',
        createdAt: Date.now()
      };
    } finally {
      setIsInitiating(false);
      setDuitkuData(resultData);
      setStep('pay_screen');

      // Simpan session aktif ke localStorage
      localStorage.setItem('portal-active-payment-session', JSON.stringify({
        userId: currentUser?.id || currentUser?.username,
        username: currentUser?.username,
        duitkuData: resultData,
        selectedMethod,
        billingCycle,
        createdAt: Date.now()
      }));

      // Catat transaksi awal (pending / unpaid) ke Database & State
      if (setConfirmations) {
        const initialRecord = {
          id: `pay_${Date.now()}`,
          orderId: orderId,
          reference: resultData?.reference || orderId,
          qrString: resultData?.qrString || '',
          vaNumber: resultData?.vaNumber || '',
          paymentUrl: resultData?.paymentUrl || '',
          userId: currentUser?.id || currentUser?.username,
          username: currentUser?.username,
          bankName: (selectedMethod === 'qris' ? 'MAYAR - QRIS' : `DUITKU - ${selectedMethod.toUpperCase()}`),
          gateway: (selectedMethod === 'qris' ? 'MAYAR' : 'DUITKU'),
          senderName: currentUser?.name || currentUser?.username,
          amount: `Rp ${currentPlan.numericPrice.toLocaleString('id-ID')}`,
          status: 'pending',
          timestamp: new Date().toISOString(),
          billingDuration: currentPlan.duration
        };
        setConfirmations(prev => {
          const list = prev || [];
          const exists = list.some(c => c.orderId === orderId);
          if (exists) return list;
          return [initialRecord, ...list];
        });
      }
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
        ref={modalContainerRef}
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>
            {step === 'select_plan' && 'Paket User Premium'}
            {step === 'select_method' && 'Metode Pembayaran'}
            {step === 'pay_screen' && 'Selesaikan Pembayaran'}
            {step === 'manual_pay' && 'Transfer Bank Resmi'}
            {step === 'success' && 'Konfirmasi Terkirim!'}
          </h2>
          <p className="desc-text" style={{ fontSize: '0.84rem', margin: 0, color: '#64748b' }}>
            {step === 'select_plan' && 'Tingkatkan akun ke User Premium untuk akses penuh ekosistem ngonten.id.'}
            {step === 'select_method' && 'Pilih metode pembayaran instan dan terenkripsi.'}
            {step === 'pay_screen' && 'Scan QRIS atau transfer ke nomor VA di bawah untuk aktivasi instan.'}
            {step === 'manual_pay' && 'Silakan transfer sesuai total tagihan ke salah satu rekening resmi di bawah ini.'}
            {step === 'success' && 'Bukti transfer berhasil dikirim. Admin akan segera memverifikasi akun Anda.'}
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
                  {/* Channel 1: QRIS Dinamis */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <QrCode size={22} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '2px' }}>QRIS (Scan Real-Time)</strong>
                        <span className="desc-text" style={{ fontSize: '0.75rem' }}>
                          Mendukung seluruh aplikasi m-Banking & E-Wallet
                        </span>
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

                  {/* QRIS Dinamis Mayar Resmi / Official Uploaded QRIS */}
                  {duitkuData?.qrString?.startsWith('http') ? (
                    <img 
                      src={duitkuData.qrString}
                      alt="Official Mayar QRIS Code"
                      style={{
                        width: '200px',
                        height: '200px',
                        display: 'block',
                        margin: '8px auto',
                        borderRadius: '8px',
                        background: '#ffffff',
                        padding: '4px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : qrisImageUrl ? (
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
                  ) : duitkuData?.qrString ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(duitkuData.qrString)}`}
                      alt="Official QRIS Code"
                      style={{
                        width: '200px',
                        height: '200px',
                        display: 'block',
                        margin: '8px auto',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div style={{ padding: '24px 12px', fontSize: '0.82rem', color: '#ef4444' }}>
                      QRIS sedang dipersiapkan, silakan klik tombol verifikasi setelah membayar.
                    </div>
                  )}

                  {duitkuData?.paymentUrl && (
                    <div style={{ margin: '12px 0 6px 0' }}>
                      <a
                        href={duitkuData.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <span>Bayar Langsung via Gateway Mayar</span>
                        <ExternalLink size={15} color="#ffffff" />
                      </a>
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: '8px', lineHeight: '1.4' }}>
                    📱 Scan QR di atas menggunakan <strong>Kamera HP</strong> atau klik tombol biru di atas untuk menyelesaikan pembayaran QRIS & E-Wallet.
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
                onClick={() => {
                  localStorage.removeItem('portal-active-payment-session');
                  setStep('select_plan');
                }}
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
                Ganti Paket / Mulai Baru
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP: MANUAL PAYMENT TRANSFER & PROOF UPLOAD ================= */}
        {step === 'manual_pay' && (
          <form onSubmit={handleManualPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Ringkasan Tagihan */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '500' }}>Paket Langganan:</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                  User Premium ({currentPlan.duration})
                </span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0 10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {currentPlan.price}
                </span>
              </div>
            </div>

            {/* Kartu Rekening Platform (Dinamis dari platformBankAccounts) */}
            {(() => {
              const activeBanks = (platformBankAccounts && platformBankAccounts.length > 0)
                ? platformBankAccounts
                : [
                    {
                      id: 'default_mandiri',
                      bankName: 'Bank Mandiri',
                      accountNumber: '127000999888',
                      accountNumberFormatted: '127-000-999-888',
                      accountHolder: 'PT Ngonten Media Indonesia',
                      branch: 'KC Jakarta Thamrin',
                      isPrimary: true
                    }
                  ];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeBanks.map((bank, bIdx) => {
                    const isEwallet = bank.accountType === 'ewallet' || ['dana', 'gopay', 'ovo', 'shopeepay', 'linkaja'].some(ew => (bank.bankName || '').toLowerCase().includes(ew));

                    return (
                      <div 
                        key={bank.id || bIdx}
                        className="payment-bank-card"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)'
                        }}
                      >
                        {/* Card Header Brand - Kontras Tinggi Hitam/Putih Monokrom Premium */}
                        <div 
                          className="payment-bank-header"
                          style={{
                            backgroundColor: '#0f172a',
                            padding: '16px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            borderBottom: '1px solid #1e293b'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              className="payment-bank-icon"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {isEwallet ? <Smartphone size={20} strokeWidth={2.5} color="#0f172a" /> : <Landmark size={20} strokeWidth={2.5} color="#0f172a" />}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <h3 
                                className="payment-bank-title"
                                style={{ 
                                  margin: 0, 
                                  fontSize: '1.05rem', 
                                  fontWeight: '900', 
                                  color: '#ffffff', 
                                  letterSpacing: '0.5px',
                                  textAlign: 'left'
                                }}
                              >
                                {(bank.bankName || 'BANK MANDIRI').toUpperCase()}
                              </h3>
                              <span 
                                className="payment-bank-subtitle"
                                style={{ 
                                  fontSize: '0.74rem', 
                                  color: '#cbd5e1', 
                                  fontWeight: '500', 
                                  display: 'block', 
                                  marginTop: '2px',
                                  textAlign: 'left'
                                }}
                              >
                                {bank.branch ? `Rekening Resmi (${bank.branch})` : (isEwallet ? 'Akun E-Wallet Penerima Resmi' : 'Rekening Penerima Pembayaran Resmi')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body dengan Nomor Rekening & Nama Rata Kiri */}
                        <div style={{ padding: '18px 20px', background: '#fafbfc', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                            {isEwallet ? 'Nomor Akun / HP ' : 'Nomor Rekening '}{bank.bankName || ''}
                          </span>
                          
                          <div className="bank-account-copy-box" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            border: '1.5px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
                              fontWeight: '800',
                              color: '#0f172a',
                              letterSpacing: '1px',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                              flex: '1 1 auto',
                              minWidth: '150px'
                            }}>
                              {bank.accountNumberFormatted || bank.accountNumber}
                            </span>

                            <button
                              type="button"
                              className="btn-copy-account"
                              onClick={() => handleCopy(bank.accountNumber ? bank.accountNumber.replace(/\D/g, '') : '')}
                              style={{
                                backgroundColor: copied ? '#10b981' : '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                marginLeft: 'auto',
                                boxShadow: copied ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(15, 23, 42, 0.25)'
                              }}
                            >
                              {copied ? <Check size={14} color="#ffffff" strokeWidth={2.5} /> : <Copy size={14} color="#ffffff" />}
                              <span style={{ color: '#ffffff', fontWeight: '700' }}>{copied ? 'Tersalin!' : (isEwallet ? 'Salin No. HP' : 'Salin Nomor')}</span>
                            </button>
                          </div>

                          {/* Bagian Atas Nama: Dibuat Rata Kiri Bersih & Jelas */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: '10px',
                            textAlign: 'left',
                            alignItems: 'flex-start'
                          }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Atas Nama:
                            </span>
                            <span style={{
                              fontSize: '0.98rem',
                              fontWeight: '800',
                              color: '#0f172a',
                              letterSpacing: '0.2px',
                              textAlign: 'left'
                            }}>
                              {bank.accountHolder || 'PT Ngonten Media Indonesia'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Form Input Detail Pengirim */}
            <div className="vip-sender-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Nama Pemilik Rekening Pengirim
                </label>
                <input 
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Nama sesuai rekening Anda"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Bank / E-Wallet Pengirim
                </label>
                <select
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="MANDIRI">Bank Mandiri</option>
                  <option value="BCA">Bank BCA</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank BSI</option>
                  <option value="CIMB">CIMB Niaga</option>
                  <option value="DANA">DANA</option>
                  <option value="GOPAY">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="SHOPEEPAY">ShopeePay</option>
                  <option value="LAINNYA">Bank Lainnya</option>
                </select>
              </div>
            </div>

            {/* Upload Bukti Transfer */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                Lampirkan Foto / Bukti Struk Transfer
              </label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #94a3b8',
                borderRadius: '12px',
                padding: '20px 16px',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}>
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
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  color: '#ffffff'
                }}>
                  <Upload size={20} color="#ffffff" strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                  {receiptFile ? 'Klik untuk Mengganti Foto Bukti' : 'Pilih Foto Struk / Bukti Transfer'}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Format JPG, PNG, atau screenshot transfer m-Banking
                </span>
              </label>

              {receiptFile && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', padding: '8px 14px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <img 
                    src={receiptFile} 
                    alt="Bukti Bayar" 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #6ee7b7' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: '700' }}>✓ Foto bukti struk terlampir</span>
                    <span style={{ fontSize: '0.72rem', color: '#047857' }}>Siap dikirim untuk verifikasi admin</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep('select_plan')}
                style={{
                  flex: 1,
                  padding: '13px',
                  backgroundColor: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={16} color="#0f172a" />
                <span style={{ color: '#0f172a', fontWeight: '700' }}>Batal</span>
              </button>

              <button
                type="submit"
                disabled={isSubmittingManual}
                className="btn-submit-konfirmasi"
                style={{
                  flex: 2,
                  padding: '13px 18px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
                }}
              >
                {isSubmittingManual ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" color="#ffffff" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>Mengirim Bukti...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} color="#ffffff" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>Kirim Konfirmasi Bayar</span>
                  </>
                )}
              </button>
            </div>
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
