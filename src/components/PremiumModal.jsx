import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, QrCode, Landmark, CreditCard, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { DOKU_CONFIG, loadDokuCheckoutScript, createDokuPaymentOrder } from '../services/dokuPaymentService';

export default function PremiumModal({
  isOpen,
  onClose,
  currentUser,
  confirmations,
  setConfirmations,
  premiumPrice = 'Rp 29.000 / Bulan',
  onLoginClick
}) {
  const [step, setStep] = useState('select_plan'); // 'select_plan' | 'checkout'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('qris'); // 'qris' | 'va' | 'card'
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select_plan');
      setSelectedPlan(null);
      setSelectedMethod('qris');
      setIsProcessing(false);
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
        'Biaya Penarikan Saldo Dompet Hanya 2% (Hemat 60%)',
        'Unlock Detail Portofolio & Kontak untuk Brand',
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
        'Prioritas Tampil di Halaman Utama Discover',
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
    setStep('checkout');
  };

  const handlePayWithDoku = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    try {
      const invNum = `INV-DOKU-${Date.now()}`;
      const orderData = createDokuPaymentOrder({
        invoiceNumber: invNum,
        amount: selectedPlan.numericPrice,
        customerName: currentUser?.name || currentUser?.username || 'Kreator ngonten.id',
        customerEmail: currentUser?.email || `${currentUser?.username || 'kreator'}@ngonten.id`,
        description: `Langganan ${selectedPlan.name} ngonten.id`
      });

      console.log('[DOKU] Memproses pembayaran:', orderData);

      // Coba panggil Jokul Checkout JS
      try {
        const jokul = await loadDokuCheckoutScript();
        if (typeof jokul === 'function') {
          jokul(orderData);
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.warn('[DOKU Script Error]', err);
      }

      // Fallback popup konfirmasi
      alert(`[DOKU Payment Gateway]\n\nMerchant: ngonten.id\nClient ID: ${DOKU_CONFIG.clientId}\nInvoice: ${invNum}\nTotal: Rp ${selectedPlan.numericPrice.toLocaleString('id-ID')}\n\nTransaksi pembayaran DOKU telah aktif. Status keanggotaan Premium Anda akan otomatis aktif setelah pembayaran.`);
      
      if (setConfirmations) {
        setConfirmations(prev => [{
          id: `pay_${Date.now()}`,
          userId: currentUser?.id || currentUser?.username,
          username: currentUser?.username,
          bankName: selectedMethod.toUpperCase() + ' (DOKU Gateway)',
          senderName: currentUser?.name || currentUser?.username,
          amount: `Rp ${selectedPlan.numericPrice.toLocaleString('id-ID')}`,
          status: 'pending',
          gateway: 'DOKU',
          timestamp: new Date().toISOString()
        }, ...(prev || [])]);
      }

      setIsProcessing(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi ke payment gateway. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
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
          backgroundColor: '#09090b',
          color: '#ffffff',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          border: '1px solid #27272a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
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
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            color: '#ffffff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} color="#ffffff" />
        </button>

        {/* Header Modal */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            {step === 'select_plan' ? 'Pilih Paket Langganan' : 'Selesaikan Pembayaran'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
            {step === 'select_plan' 
              ? 'Dapatkan akses penuh ke fitur kreator, event, & penarikan saldo 2%.'
              : 'Pembayaran aman & otomatis melalui DOKU Payment Gateway.'}
          </p>
        </div>

        {/* STEP 1: PILIH PAKET */}
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
                    fontSize: '0.7rem',
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
                    fontWeight: '700',
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

        {/* STEP 2: CHECKOUT DOKU */}
        {step === 'checkout' && selectedPlan && (
          <div>
            {/* Ringkasan Tagihan */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#a1a1aa' }}>Paket Langganan:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{selectedPlan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#a1a1aa' }}>Gateway Pembayaran:</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>DOKU Gateway (Resmi)</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#27272a', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.9rem' }}>Total Tagihan:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>
                  Rp {selectedPlan.numericPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Pilihan Metode DOKU */}
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff', margin: '0 0 12px 0' }}>
              Pilih Metode Pembayaran
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
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

              {/* Opsi 2: Virtual Account */}
              <div 
                onClick={() => setSelectedMethod('va')}
                style={{
                  backgroundColor: selectedMethod === 'va' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'va' ? '2px solid #ffffff' : '1px solid #3f3f46',
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
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>Virtual Account Bank</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>BCA, Mandiri, BNI, BRI, Permata & CIMB</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'va' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'va' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
                </div>
              </div>

              {/* Opsi 3: Kartu Kredit / Debit */}
              <div 
                onClick={() => setSelectedMethod('card')}
                style={{
                  backgroundColor: selectedMethod === 'card' ? '#27272a' : '#18181b',
                  border: selectedMethod === 'card' ? '2px solid #ffffff' : '1px solid #3f3f46',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={22} color="#ffffff" />
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block' }}>Kartu Kredit / Debit</strong>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Visa, Mastercard, JCB</span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  backgroundColor: selectedMethod === 'card' ? '#ffffff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === 'card' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }} />}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handlePayWithDoku}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShieldCheck size={18} color="#000000" />
                <span>{isProcessing ? 'Menghubungkan ke DOKU...' : 'Bayar Sekarang via DOKU'}</span>
              </button>

              <button
                onClick={() => setStep('select_plan')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: '1px solid #27272a',
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
                <ArrowLeft size={16} color="#a1a1aa" />
                <span>Ganti Pilihan Paket</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
