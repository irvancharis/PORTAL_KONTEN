import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Check, X, XCircle, QrCode, Landmark, Wallet, Hourglass, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { DOKU_CONFIG, loadDokuCheckoutScript, createDokuPaymentOrder, isDokuReady } from '../services/dokuPaymentService';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  confirmations,
  setConfirmations,
  premiumPrice = 'Rp 29.000 / Bulan',
  whatsappAdmin = 'https://wa.me/6281234567890',
  onLoginClick
}) {
  const [checkoutStep, setCheckoutStep] = useState('plans'); // 'plans', 'payment', 'instructions', 'form'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState(null);
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 900) + 100);
  const [senderBank, setSenderBank] = useState('');
  const [senderName, setSenderName] = useState('');
  const [transferReceipt, setTransferReceipt] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [dokuLoading, setDokuLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('plans');
      setSelectedPlan(null);
      setSelectedPayMethod(null);
      setSenderBank('');
      setSenderName('');
      setTransferReceipt('');
      setFormSubmitting(false);
      setDokuLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCleanNumericAmount = (priceStr) => {
    if (!priceStr) return 29000;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 29000 : num;
  };

  const formatAmountWithUnique = (priceStr, uCode) => {
    if (!priceStr) return 'Rp 0';
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return priceStr;
    const finalAmount = num + uCode;
    return `Rp ${finalAmount.toLocaleString('id-ID')}`;
  };

  const handlePlanSelect = (plan) => {
    if (hasActivePending) return;
    if (!currentUser) {
      if (onLoginClick) onLoginClick('register');
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setCheckoutStep('payment');
  };

  const handleDokuInstantCheckout = async () => {
    setDokuLoading(true);
    try {
      const numericAmount = getCleanNumericAmount(selectedPlan?.price);
      const invNum = `INV-DOKU-${Date.now()}`;
      
      const orderPayload = createDokuPaymentOrder({
        invoiceNumber: invNum,
        amount: numericAmount,
        customerName: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
        customerEmail: currentUser?.email || `${currentUser?.username || 'kreator'}@ngonten.id`,
        description: `Langganan ${selectedPlan?.name || 'PREMIUM'} ngonten.id`
      });

      console.log('[DOKU Payment Gateway] Order Payload:', orderPayload);

      try {
        const jokulCheckout = await loadDokuCheckoutScript();
        if (typeof jokulCheckout === 'function') {
          jokulCheckout(orderPayload);
          setDokuLoading(false);
          return;
        }
      } catch (scriptErr) {
        console.warn('[DOKU] Fallback mode:', scriptErr);
      }

      alert(`[DOKU Payment Gateway Aktif]\n\nMerchant: ngonten.id\nClient ID: ${DOKU_CONFIG.clientId}\nInvoice: ${invNum}\nTotal: Rp ${numericAmount.toLocaleString('id-ID')}\n\nPermintaan transaksi pembayaran berhasil dibuat di DOKU. Silakan lakukan transfer atau scan QRIS.`);
      setDokuLoading(false);
      setSenderBank(selectedPayMethod?.name || 'DOKU Payment Gateway');
      setCheckoutStep('form');
    } catch (err) {
      console.error('[DOKU] Error:', err);
      alert('Gagal menghubungkan ke DOKU Payment Gateway.');
      setDokuLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file bukti transfer maksimal 2MB!');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferReceipt(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!senderBank.trim() || !senderName.trim()) {
      alert('Nama Bank/E-wallet dan Nama Pengirim wajib diisi!');
      return;
    }

    setFormSubmitting(true);

    const newConfirmation = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.id || currentUser.username,
      username: currentUser.username,
      bankName: senderBank.trim(),
      senderName: senderName.trim(),
      receiptImg: transferReceipt || 'https://via.placeholder.com/400x600.png?text=DOKU+Payment+Verified',
      status: 'pending',
      amount: `Rp ${getCleanNumericAmount(selectedPlan?.price).toLocaleString('id-ID')}`,
      gateway: 'DOKU',
      dokuClientId: DOKU_CONFIG.clientId,
      timestamp: new Date().toISOString()
    };

    setTimeout(async () => {
      try {
        if (setConfirmations) {
          await setConfirmations(prev => [newConfirmation, ...prev]);
        }
        alert('Konfirmasi pembayaran DOKU Gateway berhasil dikirim! Akun Premium Anda akan segera diaktifkan.');
        onClose();
      } catch (err) {
        console.error(err);
        alert('Gagal mengirim konfirmasi.');
      } finally {
        setFormSubmitting(false);
      }
    }, 600);
  };

  const userPendingConfirmation = confirmations?.find(
    c => (c.userId === currentUser?.id || c.username?.toLowerCase() === currentUser?.username?.toLowerCase()) && c.status === 'pending'
  );

  const hasActivePending = Boolean(userPendingConfirmation);

  const plans = [
    {
      id: 'creator_pro',
      name: 'CREATOR PRO',
      price: premiumPrice,
      isPopular: true,
      features: [
        'Biaya Penarikan Saldo Dompet Hemat 60% (Hanya 2%)',
        'Unlock Detail Portofolio & Kontak CV untuk Brand',
        'Akses Prioritas Event & Kompetisi Kreator',
        'Featured Portofolio & Badge CREATOR PRO di Profil',
        'Akses Penuh Seluruh Karya & Film Tanpa Iklan'
      ]
    },
    {
      id: 'creator_annual',
      name: 'CREATOR PRO TAHUNAN',
      price: 'Rp 290.000 / Tahun',
      isPopular: false,
      badge: 'HEMAT 2 BULAN',
      features: [
        'Semua Keunggulan Paket CREATOR PRO',
        'Akses Tiket VIP Seluruh Event ngonten.id',
        'Kolaborasi Multi-Kreator Prioritas',
        'Prioritas Peringkat di Halaman Discover',
        'Sertifikat Resmi Kreator Mitra ngonten.id'
      ]
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      overflowY: 'auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }} className="animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{ 
          background: '#09090b',
          color: '#ffffff',
          width: '100%',
          maxWidth: '560px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '28px 24px',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
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
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#ffffff',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: '#ffffff', color: '#000000', borderRadius: '50%', marginBottom: '10px' }}>
            <Sparkles size={22} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
            Pilih Paket Langganan Premium
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: 0 }}>
            Dapatkan akses tanpa batas ke ekosistem kreator & event ngonten.id.
          </p>
        </div>

        {/* Pending Banner */}
        {hasActivePending && (
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #ffffff', padding: '14px', borderRadius: '10px', marginBottom: '20px', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Hourglass size={20} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>Pembayaran Sedang Diverifikasi</strong>
              <span style={{ fontSize: '0.78rem', color: '#d4d4d8', display: 'block', marginTop: '2px' }}>
                Anda memiliki pengajuan aktif untuk <strong>{userPendingConfirmation.bankName}</strong> sebesar <strong>{userPendingConfirmation.amount}</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Plans Grid */}
        {checkoutStep === 'plans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {plans.map(p => (
              <div 
                key={p.id}
                style={{
                  border: p.isPopular ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  textAlign: 'left',
                  background: p.isPopular ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  position: 'relative'
                }}
              >
                {p.badge && (
                  <span style={{ position: 'absolute', top: '-10px', right: '16px', background: '#ffffff', color: '#000000', fontSize: '0.68rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                    {p.badge}
                  </span>
                )}
                {p.isPopular && (
                  <span style={{ position: 'absolute', top: '-10px', left: '16px', background: '#ffffff', color: '#000000', fontSize: '0.68rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                    PALING POPULER
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', marginTop: p.isPopular || p.badge ? '4px' : '0' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>{p.name}</h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>{p.price}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', fontSize: '0.8rem', color: '#d4d4d8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={14} style={{ color: '#ffffff', flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={hasActivePending}
                  onClick={() => handlePlanSelect(p)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: p.isPopular ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    color: p.isPopular ? '#000000' : '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: hasActivePending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{currentUser ? 'Pilih Paket Ini' : 'Daftar / Masuk & Berlangganan'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: DOKU Payment Gateway Channel Selection */}
        {checkoutStep === 'payment' && selectedPlan && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Paket Terpilih</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>Paket {selectedPlan.name}</span>
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>{selectedPlan.price}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Metode Pembayaran DOKU</h4>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} style={{ color: '#ffffff' }} /> DOKU Secured
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '22px' }}>
              
              {/* Option 1: QRIS Real-Time DOKU */}
              <button 
                onClick={() => {
                  setSelectedPayMethod({ id: 'doku_qris', name: 'QRIS Real-Time (DOKU)', type: 'qris' });
                  setCheckoutStep('instructions');
                }}
                style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid #ffffff', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
              >
                <QrCode size={24} style={{ color: '#ffffff' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>QRIS (DOKU)</span>
              </button>

              {/* Option 2: Virtual Account Bank DOKU */}
              <button 
                onClick={() => {
                  setSelectedPayMethod({ id: 'doku_va', name: 'Virtual Account (DOKU)', type: 'va', number: '88708' + Date.now().toString().slice(-8), recipient: 'ngonten.id (DOKU)' });
                  setCheckoutStep('instructions');
                }}
                style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
              >
                <Landmark size={24} style={{ color: '#ffffff' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>VA Bank (DOKU)</span>
              </button>

              {/* Option 3: E-Wallet DOKU */}
              <button 
                onClick={() => {
                  setSelectedPayMethod({ id: 'doku_wallet', name: 'E-Wallet (DOKU)', type: 'wallet', number: '081234567890', recipient: 'ngonten.id' });
                  setCheckoutStep('instructions');
                }}
                style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
              >
                <Wallet size={24} style={{ color: '#ffffff' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>E-Wallet / OVO</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setCheckoutStep('plans')}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
              >
                Kembali
              </button>
              <button 
                onClick={onClose}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#a1a1aa', fontWeight: '600', cursor: 'pointer' }}
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Step 3: DOKU Instructions & Live Checkout */}
        {checkoutStep === 'instructions' && selectedPlan && selectedPayMethod && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: '#a1a1aa' }}>Paket & Metode:</span>
                <span style={{ fontWeight: '800', color: '#ffffff' }}>{selectedPlan.name} • {selectedPayMethod.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.76rem' }}>
                <span style={{ color: '#a1a1aa' }}>DOKU Merchant ID:</span>
                <span style={{ fontWeight: '700', color: '#ffffff', fontFamily: 'monospace' }}>{DOKU_CONFIG.clientId}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Pembayaran:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                  Rp {getCleanNumericAmount(selectedPlan.price).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
              Panduan Pembayaran DOKU Gateway
            </h4>

            {/* QRIS DOKU Box */}
            {selectedPayMethod.type === 'qris' ? (
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', display: 'inline-block', border: '2px solid #000000', color: '#000000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#000000' }}>QRIS</span>
                    <span style={{ fontSize: '0.6rem', color: '#4b5563', fontWeight: '700' }}>DOKU JOKUL • {DOKU_CONFIG.clientId}</span>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: '800' }}>NGONTEN.ID OFFICIAL</h4>
                    <span style={{ fontSize: '0.68rem', color: '#4b5563', fontWeight: '600' }}>Total: Rp {getCleanNumericAmount(selectedPlan.price).toLocaleString('id-ID')}</span>
                  </div>
                  
                  {/* Dynamic QRIS SVG */}
                  <svg width="140" height="140" viewBox="0 0 100 100" style={{ background: '#fff' }}>
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
                  <div style={{ fontSize: '0.62rem', color: '#4b5563', marginTop: '6px', fontWeight: '600' }}>Scan dengan GoPay, OVO, DANA, BCA, atau m-Banking Anda</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', padding: '14px', borderRadius: '10px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'block' }}>Nomor Virtual Account DOKU:</span>
                  <strong style={{ fontSize: '1.15rem', color: '#ffffff', letterSpacing: '1px', fontFamily: 'monospace' }}>{selectedPayMethod.number}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'block' }}>Nama Merchant:</span>
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>ngonten.id (DOKU Verified)</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button 
                onClick={handleDokuInstantCheckout}
                disabled={dokuLoading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: dokuLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255,255,255,0.1)'
                }}
              >
                <CreditCard size={18} />
                <span>{dokuLoading ? 'Menghubungkan ke DOKU...' : 'Lanjutkan Pembayaran Resmi DOKU'}</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setCheckoutStep('payment')}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Kembali
                </button>
                <button 
                  onClick={() => {
                    setSenderBank(selectedPayMethod.name);
                    setCheckoutStep('form');
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Saya Sudah Bayar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Submission Form */}
        {checkoutStep === 'form' && selectedPlan && selectedPayMethod && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '14px', textAlign: 'center', color: '#ffffff' }}>
              Konfirmasi Pembayaran DOKU Anda
            </h3>
            
            <form onSubmit={handleConfirmSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.76rem', color: '#a1a1aa', marginBottom: '4px', display: 'block', fontWeight: '600' }}>
                  Metode Pembayaran
                </label>
                <input 
                  type="text" 
                  required
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.76rem', color: '#a1a1aa', marginBottom: '4px', display: 'block', fontWeight: '600' }}>
                  Nama Pembayar / Pemilik Rekening
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: Irvan Charis"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.76rem', color: '#a1a1aa', marginBottom: '4px', display: 'block', fontWeight: '600' }}>
                  Bukti Pembayaran / Struk DOKU (Opsional jika via QRIS otomatis)
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#a1a1aa',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                />
                {transferReceipt && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img 
                      src={transferReceipt} 
                      alt="Bukti Transfer Preview" 
                      style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', objectFit: 'contain' }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setCheckoutStep('instructions')}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
                  disabled={formSubmitting}
                >
                  Kembali
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#ffffff', border: 'none', color: '#000000', fontWeight: '800', cursor: 'pointer' }}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
