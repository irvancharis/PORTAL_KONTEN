import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Check, X, XCircle, QrCode, Landmark, Wallet, Hourglass } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('plans');
      setSelectedPlan(null);
      setSelectedPayMethod(null);
      setSenderBank('');
      setSenderName('');
      setTransferReceipt('');
      setFormSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatAmountWithUnique = (priceStr, uCode) => {
    if (!priceStr) return 'Rp 0';
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return priceStr;
    const finalAmount = num + uCode;
    return `Rp ${finalAmount.toLocaleString('id-ID')}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit to 2MB
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

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!senderBank.trim() || !senderName.trim()) {
      alert('Nama Bank/E-wallet dan Nama Pengirim wajib diisi!');
      return;
    }
    if (!transferReceipt) {
      alert('Harap unggah bukti transfer/pembayaran Anda!');
      return;
    }

    setFormSubmitting(true);
    const newConfirmation = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.id,
      username: currentUser.username,
      bankName: senderBank.trim(),
      senderName: senderName.trim(),
      receiptImg: transferReceipt,
      status: 'pending',
      amount: formatAmountWithUnique(selectedPlan.price, uniqueCode),
      timestamp: new Date().toISOString()
    };

    try {
      if (setConfirmations) {
        await setConfirmations(prev => [newConfirmation, ...prev]);
      }
      alert('Konfirmasi pembayaran dikirim! Admin akan segera memverifikasi tontonan Anda.');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim bukti pembayaran.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const hasPending = currentUser && confirmations.some(c => c.userId === currentUser.id && c.status === 'pending');
  const pendingConf = hasPending ? confirmations.find(c => c.userId === currentUser.id && c.status === 'pending') : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#020202',
      zIndex: 10000,
      overflowY: 'auto',
      padding: '40px 24px',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }} className="animate-fade-in" onClick={onClose}>
      <div 
        className="admin-modal glass-panel" 
        style={{ 
          background: '#020202',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: 'none',
          boxShadow: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: '100%', maxWidth: '640px' }}>
          {/* Close Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
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
              <XCircle size={18} />
            </button>
          </div>

        {hasPending ? (
          <div style={{ padding: '10px 0' }}>
            <div style={{ color: '#ffffff', marginBottom: '16px', display: 'inline-block' }}>
              <div style={{ width: '56px', height: '56px', border: '2px dashed rgba(255, 255, 255, 0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 12s linear infinite' }}>
                <Hourglass size={24} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>Menunggu Persetujuan Admin</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '24px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
              Registrasi akun <strong>{currentUser.username}</strong> telah selesai! Saat ini admin sedang memproses bukti transfer pembayaran untuk mengaktifkan status Premium Anda.
            </p>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nama Pengguna:</span>
                <strong style={{ color: 'white' }}>{currentUser.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Paket Pilihan:</span>
                <strong style={{ color: 'white' }}>Paket {pendingConf?.planName || 'PREMIUM'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Jumlah Transfer:</span>
                <strong style={{ color: 'white' }}>{pendingConf?.amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status Akun:</span>
                <strong style={{ color: 'white' }}>MENUNGGU PERSETUJUAN</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', minWidth: '120px', justifyContent: 'center' }}
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'var(--primary-color)', marginBottom: '10px', display: 'inline-block' }}>
                <Sparkles size={40} className="animate-pulse" style={{ color: '#ffffff' }} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>Pilih Paket Langganan Premium</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Dapatkan akses tanpa batas ke server streaming berkecepatan tinggi.
              </p>
            </div>

            {/* Notice if not logged in */}
            {!currentUser && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '20px', fontSize: '0.82rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <AlertTriangle size={16} />
                <span>Harap pendaftaran / masuk akun dahulu sebelum melakukan pembayaran.</span>
              </div>
            )}

            {/* Step 1: Plans Grid Selector */}
            {checkoutStep === 'plans' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="plan-card glass-panel" style={{ padding: '28px 24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.02)', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.05)', textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '-32px', background: '#ffffff', color: '#020202', fontSize: '0.62rem', fontWeight: 'bold', padding: '4px 30px', transform: 'rotate(45deg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    PREMIUM
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Paket PREMIUM</span>
                        <Sparkles size={14} style={{ color: '#ffffff' }} />
                      </span>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>{premiumPrice}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: '16px' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} style={{ color: '#ffffff' }} />
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Akses Full Seluruh Karya & Film (Tanpa Iklan)</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} style={{ color: '#ffffff' }} />
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Biaya Admin Payout Wallet Hanya 5% (Hemat 50%)</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} style={{ color: '#ffffff' }} />
                        <span>Featured Portfolio & Badge Verified di Profil</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={16} style={{ color: '#ffffff' }} />
                        <span>Akses Prioritas & Kuota Khusus Event Eksklusif</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => {
                      if (!currentUser) {
                        onLoginClick('register');
                        onClose();
                        return;
                      }
                      setSelectedPlan({ id: 'premium', name: 'PREMIUM', price: premiumPrice });
                      setCheckoutStep('payment');
                    }}
                    className="btn btn-primary"
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '12px', 
                      background: '#ffffff',
                      border: '1px solid #ffffff',
                      color: '#020202',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <span>{currentUser ? 'Berlangganan Sekarang' : 'Daftar & Berlangganan'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={onClose}
                    className="btn btn-text"
                    style={{ padding: '8px 24px' }}
                  >
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Gateway Options Selection */}
            {checkoutStep === 'payment' && selectedPlan && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Paket Terpilih</span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>Paket {selectedPlan.name}</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedPlan.price}</span>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Pilih Metode Pembayaran</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                  <button 
                    onClick={() => {
                      setSelectedPayMethod({ id: 'qris', name: 'QRIS (Instant QR)', type: 'qris' });
                      setCheckoutStep('instructions');
                    }}
                    className="payment-method-card glass-panel"
                    style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid #ffffff', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.06)', boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)' }}
                  >
                    <QrCode size={24} style={{ color: '#ffffff' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>QRIS (Otomatis)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedPayMethod({ id: 'bca', name: 'Bank BCA', type: 'bank', number: '1234567890', recipient: 'ngonten.id' });
                      setCheckoutStep('instructions');
                    }}
                    className="payment-method-card glass-panel"
                    style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}
                  >
                    <Landmark size={24} style={{ color: '#ffffff' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>Transfer BCA</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedPayMethod({ id: 'dana', name: 'DANA E-wallet', type: 'wallet', number: '081234567890', recipient: 'Admin' });
                      setCheckoutStep('instructions');
                    }}
                    className="payment-method-card glass-panel"
                    style={{ padding: '16px 12px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}
                  >
                    <Wallet size={24} style={{ color: '#ffffff' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>DANA / OVO</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setCheckoutStep('plans')}
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <span>Kembali</span>
                  </button>
                  <button 
                    onClick={onClose}
                    className="btn btn-text"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <span>Batal</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Instructions */}
            {checkoutStep === 'instructions' && selectedPlan && selectedPayMethod && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Paket & Metode:</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{selectedPlan.name} via {selectedPayMethod.name}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Pembayaran:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>
                      {formatAmountWithUnique(selectedPlan.price, uniqueCode)}
                    </span>
                  </div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'center' }}>
                    💡 *Penting: Transfer nominal di atas secara tepat (termasuk 3 digit kode unik).*
                  </span>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Panduan Penyelesaian Transfer
                </h4>

                {/* QRIS specific scanner code layout */}
                {selectedPayMethod.type === 'qris' ? (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', border: '2px solid #000000' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#000000' }}>QRIS</span>
                        <span style={{ fontSize: '0.55rem', color: '#6b7280', fontWeight: 'bold' }}>NMID: ID100050809</span>
                      </div>
                      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: 'bold' }}>NGONTEN.ID PREMIUM</h4>
                      </div>
                      
                      {/* SVG representation of standard QRIS code */}
                      <svg width="150" height="150" viewBox="0 0 100 100" style={{ background: '#fff' }}>
                        <rect x="0" y="0" width="20" height="20" fill="#111827" />
                        <rect x="2" y="2" width="16" height="16" fill="#fff" />
                        <rect x="5" y="5" width="10" height="10" fill="#111827" />
                        
                        <rect x="80" y="0" width="20" height="20" fill="#111827" />
                        <rect x="82" y="2" width="16" height="16" fill="#fff" />
                        <rect x="85" y="5" width="10" height="10" fill="#111827" />
                        
                        <rect x="0" y="80" width="20" height="20" fill="#111827" />
                        <rect x="2" y="82" width="16" height="16" fill="#fff" />
                        <rect x="5" y="85" width="10" height="10" fill="#111827" />

                        <rect x="40" y="40" width="20" height="20" fill="#000000" rx="2" />
                        <text x="50" y="52" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">PM</text>

                        {/* Random pattern data dots */}
                        <rect x="25" y="5" width="5" height="10" fill="#111827" />
                        <rect x="45" y="5" width="10" height="5" fill="#111827" />
                        <rect x="65" y="0" width="5" height="20" fill="#111827" />
                        <rect x="5" y="25" width="15" height="5" fill="#111827" />
                        <rect x="15" y="35" width="10" height="10" fill="#111827" />
                        <rect x="35" y="30" width="5" height="5" fill="#111827" />
                        <rect x="75" y="25" width="10" height="5" fill="#111827" />
                        <rect x="85" y="35" width="10" height="5" fill="#111827" />
                        <rect x="5" y="50" width="20" height="5" fill="#111827" />
                        <rect x="30" y="70" width="5" height="20" fill="#111827" />
                        <rect x="40" y="80" width="20" height="5" fill="#111827" />
                        <rect x="50" y="60" width="5" height="10" fill="#111827" />
                        <rect x="70" y="65" width="10" height="5" fill="#111827" />
                        <rect x="80" y="75" width="5" height="15" fill="#111827" />
                      </svg>
                      <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: '6px' }}>Scan barcode diatas untuk melakukan pembayaran</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Nomor Rekening / HP Tujuan:</span>
                      <strong style={{ fontSize: '1.15rem', color: 'white', letterSpacing: '0.5px' }}>{selectedPayMethod.number}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Nama Penerima:</span>
                      <strong style={{ fontSize: '0.95rem', color: 'white' }}>{selectedPayMethod.recipient}</strong>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setCheckoutStep('payment')}
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <span>Kembali</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSenderBank(selectedPayMethod.name);
                      setCheckoutStep('form');
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <span>Saya Sudah Bayar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Submission Form */}
            {checkoutStep === 'form' && selectedPlan && selectedPayMethod && (
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                  Konfirmasi Pembayaran Anda
                </h3>
                
                <form onSubmit={handleConfirmSubmit}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Metode Transfer Pembayaran
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
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Nama Pemilik Rekening / Pengirim
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Budi Santoso"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Unggah Gambar Bukti Transfer (Max 2MB)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    />
                    {transferReceipt && (
                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <img 
                          src={transferReceipt} 
                          alt="Bukti Transfer Preview" 
                          style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', objectFit: 'contain' }} 
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setCheckoutStep('instructions')}
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={formSubmitting}
                    >
                      Kembali
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
