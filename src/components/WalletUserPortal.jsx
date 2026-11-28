import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle, Search, X, Download, Calendar, ChevronDown, Check } from 'lucide-react';

const formatInputCurrency = (num) => {
  if (num === 0 || !num) return '';
  return num.toLocaleString('id-ID');
};

export default function WalletUserPortal({
  currentUser,
  events = [],
  eventSubmissions = [],
  users = [],
  setUsers,
  withdrawals = [],
  setWithdrawals,
  minWithdrawalAmount = 50000,
  withdrawalFeePercent = 0,
  withdrawalFeePercentPremium = 5,
  eventParticipants = [],
  gifts = [],
  setGifts,
  onEditProfileClick
}) {
  const [isWdModalOpen, setIsWdModalOpen] = useState(false);
  const [wdAmount, setWdAmount] = useState(0);
  const [wdAccount, setWdAccount] = useState('');
  const [wdName, setWdName] = useState('');
  const [wdMethod, setWdMethod] = useState('Dana');
  const [wdPassword, setWdPassword] = useState('');
  const [txFilter, setTxFilter] = useState('all'); // 'all', 'credit', 'debit'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const [activeWalletTab, setActiveWalletTab] = useState('transactions'); // 'transactions', 'gifts'
  const [selectedVoucherGift, setSelectedVoucherGift] = useState(null);

  // Close date picker dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const isPremium = currentUser && currentUser.isPremium === true;
  const activeFeePercent = isPremium ? withdrawalFeePercentPremium : withdrawalFeePercent;

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Wallet size={48} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ color: 'white' }}>Masuk Akun Diperlukan</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Silakan masuk ke akun Anda terlebih dahulu untuk melihat dompet Anda.</p>
      </div>
    );
  }

  // 1. Credits from views payout
  const creditSubs = eventSubmissions.filter(sub => 
    sub.username.toLowerCase() === currentUser.username.toLowerCase() && 
    (sub.paidBenefit || 0) > 0
  ).map(sub => ({
    id: `sub_${sub.id}`,
    date: sub.submittedAt || new Date().toISOString(),
    description: `Benefit Views: ${sub.title} (Event: ${sub.eventTitle})`,
    type: 'credit',
    amount: sub.paidBenefit,
    status: 'approved'
  }));

  // 2. Credits from ranking wins
  const creditPrizes = [];
  events.forEach(evt => {
    // Check if event is paid, ranking mode, and deadline has passed
    const isDeadlinePassed = evt.deadline ? (
      evt.deadline.includes('T')
        ? new Date().getTime() > new Date(evt.deadline).getTime()
        : new Date().getTime() > new Date(evt.deadline + 'T23:59:59').getTime()
    ) : false;

    if (evt.budgetMode === 'ranking' && evt.paymentStatus === 'paid' && isDeadlinePassed) {
      // Find all submissions for this event
      const eventSubs = eventSubmissions.filter(sub => sub.eventId === evt.id);
      // Sort submissions by views (highest first)
      const sortedSubs = [...eventSubs].sort((a, b) => (b.views || 0) - (a.views || 0));
      
      const userLower = currentUser.username.toLowerCase();
      
      // Winner 1
      if (sortedSubs[0] && sortedSubs[0].username.toLowerCase() === userLower) {
        creditPrizes.push({
          id: `prize1_${evt.id}`,
          date: evt.deadline,
          description: `Hadiah Juara 1: ${evt.title}`,
          type: 'credit',
          amount: evt.prize1 || 0,
          status: 'approved'
        });
      }
      // Winner 2
      if (sortedSubs[1] && sortedSubs[1].username.toLowerCase() === userLower) {
        creditPrizes.push({
          id: `prize2_${evt.id}`,
          date: evt.deadline,
          description: `Hadiah Juara 2: ${evt.title}`,
          type: 'credit',
          amount: evt.prize2 || 0,
          status: 'approved'
        });
      }
      // Winner 3
      if (sortedSubs[2] && sortedSubs[2].username.toLowerCase() === userLower) {
        creditPrizes.push({
          id: `prize3_${evt.id}`,
          date: evt.deadline,
          description: `Hadiah Juara 3: ${evt.title}`,
          type: 'credit',
          amount: evt.prize3 || 0,
          status: 'approved'
        });
      }
    }
  });

  // 3. Debits from withdrawals
  const debitWithdrawals = withdrawals.filter(wd => 
    wd.username.toLowerCase() === currentUser.username.toLowerCase()
  ).map(wd => ({
    id: wd.id,
    date: wd.requestedAt || new Date().toISOString(),
    description: `Penarikan Dana via ${wd.method} (${wd.account})`,
    type: 'debit',
    amount: wd.amount,
    fee: wd.fee || 0,
    netAmount: wd.netAmount || wd.amount,
    status: wd.status // 'pending' or 'approved'
  }));

  // 4. Debits from event payments (deposits) made by this user (organizer)
  const debitEventPayments = events.filter(evt => 
    evt.creator?.toLowerCase() === currentUser.username.toLowerCase() &&
    (evt.paymentStatus === 'paid' || evt.paymentStatus === 'pending_verification')
  ).map(evt => ({
    id: `evt_pay_${evt.id}`,
    date: evt.deadline ? new Date(evt.deadline).toISOString() : new Date().toISOString(),
    description: `Pembayaran Event: ${evt.title}`,
    type: 'debit',
    amount: (evt.campaignBudget || 0) + (evt.adminFee || 0),
    status: evt.paymentStatus === 'paid' ? 'approved' : 'pending'
  }));

  // 5. Debits from ticket purchases (pembelian tiket)
  const debitTicketPurchases = eventParticipants.filter(part => 
    part.username.toLowerCase() === currentUser.username.toLowerCase() &&
    part.ticketPrice > 0
  ).map(part => ({
    id: `tkt_buy_${part.id}`,
    date: part.registeredAt || new Date().toISOString(),
    description: `Pembelian Tiket Event: ${part.eventTitle || 'Event Kompetisi'}`,
    type: 'debit',
    amount: part.ticketPrice,
    status: 'approved'
  }));

  // 6. Credits from ticket sales (penjualan tiket) & Debits for 5% admin fee
  const approvedTicketSales = eventParticipants.filter(part => {
    const evt = events.find(e => e.id === part.eventId);
    return evt && evt.creator?.toLowerCase() === currentUser.username.toLowerCase() && part.ticketPrice > 0 && part.status === 'approved';
  });

  const creditTicketSales = approvedTicketSales.map(part => ({
    id: `tkt_sale_${part.id}`,
    date: part.registeredAt || new Date().toISOString(),
    description: `Penjualan Tiket Event: ${part.eventTitle || 'Event'} (oleh @${part.username})`,
    type: 'credit',
    amount: part.ticketPrice,
    status: 'approved'
  }));

  const debitTicketFees = approvedTicketSales.map(part => {
    const feePercent = typeof eventTicketFeePercent === 'number' ? eventTicketFeePercent : 5;
    const fee = Math.round(part.ticketPrice * (feePercent / 100));
    return {
      id: `tkt_fee_${part.id}`,
      date: part.registeredAt || new Date().toISOString(),
      description: `Potongan Biaya Admin (${feePercent}%) Penjualan Tiket: ${part.eventTitle || 'Event'} (oleh @${part.username})`,
      type: 'debit',
      amount: fee,
      status: 'approved'
    };
  });

  // Combine & Sort Transactions
  const allTransactions = [...creditSubs, ...creditPrizes, ...debitWithdrawals, ...debitEventPayments, ...debitTicketPurchases, ...creditTicketSales, ...debitTicketFees].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const userProfile = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
  const walletBalance = userProfile ? (userProfile.walletBalance || 0) : (currentUser ? (currentUser.walletBalance || 0) : 0);

  // Metrics
  const totalCompletedWd = debitWithdrawals.filter(w => w.status === 'approved').reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalPendingWd = debitWithdrawals.filter(w => w.status === 'pending').reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalIncome = walletBalance + totalPendingWd + totalCompletedWd;

  // Handle Withdrawal Form Submit
  const handleWithdrawClick = (e) => {
    e.preventDefault();
    
    if (currentUser.password !== 'firebase-auth-managed' && wdPassword !== currentUser.password) {
      alert('Verifikasi Gagal: Password akun yang Anda masukkan salah!');
      return;
    }

    const amountToWithdraw = parseInt(wdAmount) || 0;

    if (amountToWithdraw < minWithdrawalAmount) {
      alert(`Nominal penarikan minimal adalah Rp ${minWithdrawalAmount.toLocaleString('id-ID')}.`);
      return;
    }

    if (amountToWithdraw <= 0) {
      alert('Nominal penarikan harus lebih besar dari 0.');
      return;
    }

    if (amountToWithdraw > walletBalance) {
      alert(`Saldo dompet tidak mencukupi. Saldo maksimal Anda adalah Rp ${walletBalance.toLocaleString('id-ID')}.`);
      return;
    }

    // 1. Deduct balance from user wallet
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.username.toLowerCase() === currentUser.username.toLowerCase()) {
        const bal = u.walletBalance || 0;
        return { ...u, walletBalance: Math.max(0, bal - amountToWithdraw) };
      }
      return u;
    }));

    // 2. Add withdrawal request
    const feeAmount = Math.round(amountToWithdraw * (activeFeePercent || 0) / 100);
    const netAmount = amountToWithdraw - feeAmount;
    const newWd = {
      id: `wd_${Date.now()}`,
      username: currentUser.username,
      method: wdMethod,
      account: wdAccount,
      name: wdName,
      amount: amountToWithdraw,
      fee: feeAmount,
      netAmount: netAmount,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setWithdrawals([newWd, ...withdrawals]);

    setIsWdModalOpen(false);
    alert(`Pengajuan penarikan dana Rp ${amountToWithdraw.toLocaleString('id-ID')} (Biaya Admin: Rp ${feeAmount.toLocaleString('id-ID')}, Bersih diterima: Rp ${netAmount.toLocaleString('id-ID')}) ke akun ${wdMethod} (${wdAccount} a.n ${wdName}) sukses diajukan. Mohon tunggu verifikasi admin!`);
  };

  // Filtered transactions
  const filteredTxs = allTransactions.filter(tx => {
    if (txFilter === 'credit' && tx.type !== 'credit') return false;
    if (txFilter === 'debit' && tx.type !== 'debit') return false;

    if (startDate) {
      const txTime = new Date(tx.date).getTime();
      const startTime = new Date(`${startDate}T00:00:00`).getTime();
      if (txTime < startTime) return false;
    }

    if (endDate) {
      const txTime = new Date(tx.date).getTime();
      const endTime = new Date(`${endDate}T23:59:59`).getTime();
      if (txTime > endTime) return false;
    }

    return true;
  });

  const myGifts = gifts.filter(g => g.recipientUsername?.toLowerCase() === currentUser.username.toLowerCase());

  // Export CSV Helper
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      alert('Tidak ada riwayat mutasi untuk diekspor.');
      return;
    }

    const headers = ['Tanggal', 'Keterangan Transaksi', 'Tipe', 'Nominal', 'Status'];
    const rows = filteredTxs.map(tx => [
      `"${new Date(tx.date).toLocaleString('id-ID')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type === 'credit' ? 'Pemasukan' : 'Penarikan',
      tx.amount,
      tx.status || 'Berhasil'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mutasi_Dompet_${currentUser.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wallet-portal-container animate-fade-in-up" style={{ color: 'var(--text-primary)' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ 
        padding: '32px', 
        borderRadius: 'var(--radius-md)', 
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            <Wallet size={18} />
            <span>Dompet Kreator</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Kelola Pendapatan & Saldo Anda</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: '1.5' }}>
            Pantau pembayaran benefit, hasil kemenangan kompetisi, dan status pencairan saldo secara real-time.
          </p>
        </div>

        <button 
          id="tour-wallet-withdraw-btn"
          className="btn btn-primary"
          onClick={() => {
            setWdAmount(0);
            setWdAccount(currentUser?.payoutAccount || '');
            setWdName(currentUser?.payoutAccountName || currentUser?.organizerName || '');
            const bankName = currentUser?.payoutBank || (currentUser?.payoutMethod && currentUser?.payoutMethod !== 'Bank Transfer' ? currentUser?.payoutMethod : 'Mandiri');
            setWdMethod(`Bank ${bankName}`);
            setWdPassword('');
            setIsWdModalOpen(true);
          }}
          style={{
            padding: '12px 28px',
            fontSize: '0.9rem',
            borderRadius: '30px',
            background: 'white',
            color: 'black',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Tarik Saldo Dompet
        </button>
      </div>




      {/* Metrics Cards Grid */}
      <div id="tour-wallet-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Card 1: Saldo */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Saldo Aktif (Dapat Ditarik)</span>
          <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            Rp {walletBalance.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Card 2: Total Pendapatan */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Akumulasi Pemasukan</span>
          <h2 style={{ fontSize: '1.8rem', color: '#4ade80', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            Rp {totalIncome.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Card 3: Menunggu Verifikasi */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Dalam Proses Penarikan</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fbbf24', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            Rp {totalPendingWd.toLocaleString('id-ID')}
          </h2>
        </div>

        {/* Card 4: Berhasil Ditarik */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Berhasil Cair / Dibayarkan</span>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-muted)', fontWeight: 'bold', margin: '8px 0 0 0' }}>
            Rp {totalCompletedWd.toLocaleString('id-ID')}
          </h2>
        </div>
      </div>

      {/* Tab Switching Headers */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveWalletTab('transactions')}
          style={{
            background: 'none',
            border: 'none',
            color: activeWalletTab === 'transactions' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '8px 16px 12px 16px',
            cursor: 'pointer',
            borderBottom: activeWalletTab === 'transactions' ? '3px solid var(--text-primary)' : 'none',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        >
          Mutasi Saldo
        </button>
        <button
          onClick={() => setActiveWalletTab('gifts')}
          style={{
            background: 'none',
            border: 'none',
            color: activeWalletTab === 'gifts' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '8px 16px 12px 16px',
            cursor: 'pointer',
            borderBottom: activeWalletTab === 'gifts' ? '3px solid var(--text-primary)' : 'none',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        >
          Gift & Voucher Saya ({myGifts.length})
        </button>
      </div>

      {/* Transaction History Section */}
      {activeWalletTab === 'transactions' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Riwayat Mutasi Saldo</h3>
          
          {/* Filters & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Professional Date Range Filter Trigger & Popup */}
            <div ref={datePickerRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  background: (startDate || endDate) ? 'var(--primary-glow, rgba(59, 130, 246, 0.08))' : 'var(--card-bg, rgba(255, 255, 255, 0.04))',
                  border: (startDate || endDate) ? '1px solid var(--primary, #3b82f6)' : '1px solid var(--border-color)',
                  borderRadius: '24px',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Calendar size={14} style={{ color: (startDate || endDate) ? 'var(--primary, #3b82f6)' : 'var(--text-muted)' }} />
                <span>
                  {startDate && endDate ? (
                    `${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  ) : startDate ? (
                    `Dari ${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  ) : endDate ? (
                    `Hingga ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  ) : (
                    'Semua Tanggal'
                  )}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isDatePickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Date Filter Dropdown Card */}
              {isDatePickerOpen && (
                <div 
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 200,
                    minWidth: '290px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--bg-card, #141b2d)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(20px)',
                    animation: 'scale-up-center 0.15s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pilih Periode Mutasi</span>
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {/* Preset Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setStartDate(today);
                        setEndDate(today);
                      }}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg, rgba(255,255,255,0.03))',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setStartDate(start.toISOString().split('T')[0]);
                        setEndDate(end.toISOString().split('T')[0]);
                      }}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg, rgba(255,255,255,0.03))',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      7 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setStartDate(start.toISOString().split('T')[0]);
                        setEndDate(end.toISOString().split('T')[0]);
                      }}
                      style={{
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg, rgba(255,255,255,0.03))',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      30 Hari
                    </button>
                  </div>

                  {/* Custom Range Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500' }}>Dari Tanggal:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-main)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500' }}>Sampai Tanggal:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-main)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    style={{
                      width: '100%',
                      marginTop: '14px',
                      padding: '8px',
                      background: 'var(--text-primary)',
                      color: 'var(--bg-main)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Terapkan
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              title="Unduh Laporan Mutasi Saldo (CSV)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: 'var(--card-bg, rgba(255, 255, 255, 0.04))',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--bg-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card-bg, rgba(255, 255, 255, 0.04))';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>

            <div style={{ display: 'flex', gap: '4px', background: 'var(--card-bg, rgba(255,255,255,0.04))', padding: '3px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setTxFilter('all')} 
                style={{ 
                  padding: '5px 12px', 
                  fontSize: '0.8rem', 
                  border: 'none', 
                  background: txFilter === 'all' ? 'var(--text-primary)' : 'transparent', 
                  color: txFilter === 'all' ? 'var(--bg-main)' : 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  borderRadius: '18px', 
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Semua
              </button>
              <button 
                onClick={() => setTxFilter('credit')} 
                style={{ 
                  padding: '5px 12px', 
                  fontSize: '0.8rem', 
                  border: 'none', 
                  background: txFilter === 'credit' ? 'rgba(74, 222, 128, 0.15)' : 'transparent', 
                  color: txFilter === 'credit' ? '#16a34a' : 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  borderRadius: '18px', 
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Pemasukan
              </button>
              <button 
                onClick={() => setTxFilter('debit')} 
                style={{ 
                  padding: '5px 12px', 
                  fontSize: '0.8rem', 
                  border: 'none', 
                  background: txFilter === 'debit' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', 
                  color: txFilter === 'debit' ? '#dc2626' : 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  borderRadius: '18px', 
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Penarikan
              </button>
            </div>
          </div>
        </div>

        <div className="admin-table-container">
          {filteredTxs.length > 0 ? (
            <table className="admin-table wallet-mutasi-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Tanggal</th>
                  <th>Keterangan Transaksi</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Tipe</th>
                  <th style={{ textAlign: 'right', width: '180px' }}>Nominal</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="table-row-hover">
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{tx.description}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        color: tx.type === 'credit' ? '#22c55e' : '#ef4444',
                        background: tx.type === 'credit' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                      }}>
                        {tx.type === 'credit' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '0.92rem', color: tx.type === 'credit' ? '#4ade80' : '#f87171' }}>
                      <div>{tx.type === 'credit' ? '+' : '-'} Rp {tx.amount?.toLocaleString('id-ID')}</div>
                      {tx.type === 'debit' && tx.fee > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 'normal' }}>
                          Potongan: Rp {tx.fee.toLocaleString('id-ID')}<br />
                          Diterima: Rp {tx.netAmount.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: tx.status === 'approved' ? '#22c55e' : tx.status === 'rejected' ? '#ef4444' : '#eab308',
                        background: tx.status === 'approved' ? 'rgba(34, 197, 94, 0.08)' : tx.status === 'rejected' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(234, 179, 8, 0.08)'
                      }}>
                        {tx.status === 'approved' ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Selesai</span>
                          </>
                        ) : tx.status === 'rejected' ? (
                          <>
                            <XCircle size={12} />
                            <span>Ditolak</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            <span>Menunggu</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {txFilter === 'debit' ? (
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '460px' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Belum ada riwayat penarikan saldo.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Penarikan dapat dilakukan dengan minimal <strong>Rp {minWithdrawalAmount.toLocaleString('id-ID')}</strong> ke rekening Bank atau E-Wallet (DANA/GoPay/OVO) terdaftar. Proses pencairan 1x24 jam kerja.
                  </p>
                </div>
              ) : txFilter === 'credit' ? (
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Belum ada riwayat pemasukan saldo.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Pendapatan dari benefit view atau hadiah kompetisi akan tercatat otomatis di sini.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: '460px' }}>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Belum ada riwayat transaksi keuangan pada dompet Anda.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Minimal penarikan saldo adalah <strong>Rp {minWithdrawalAmount.toLocaleString('id-ID')}</strong> (Admin: {activeFeePercent > 0 ? `${activeFeePercent}%` : '0%'} • Proses: 1x24 jam).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Gifts & Vouchers Section */}
      {activeWalletTab === 'gifts' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>Daftar Hadiah Tambahan (Gift & Voucher)</h3>
          <div className="admin-table-container">
            {myGifts.length > 0 ? (
              <table className="admin-table wallet-mutasi-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Tanggal</th>
                    <th style={{ width: '120px' }}>Tipe Gift</th>
                    <th>Nama Hadiah (Gift)</th>
                    <th>Kode Voucher</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th>Event Kompetisi</th>
                    <th>Keterangan / Cara Klaim</th>
                  </tr>
                </thead>
                <tbody>
                  {myGifts.map((g) => (
                    <tr 
                      key={g.id} 
                      className="table-row-hover"
                      onClick={() => g.giftType === 'voucher' && setSelectedVoucherGift(g)}
                      style={{ cursor: g.giftType === 'voucher' ? 'pointer' : 'default' }}
                      title={g.giftType === 'voucher' ? 'Klik untuk melihat detail e-voucher' : ''}
                    >
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {new Date(g.createdAt || Date.now()).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          color: g.giftType === 'cash' ? '#4ade80' : g.giftType === 'voucher' ? '#38bdf8' : g.giftType === 'product' ? '#f472b6' : '#a78bfa',
                          background: g.giftType === 'cash' ? 'rgba(74,222,128,0.1)' : g.giftType === 'voucher' ? 'rgba(56,189,248,0.1)' : g.giftType === 'product' ? 'rgba(244,114,182,0.1)' : 'rgba(167,139,250,0.1)'
                        }}>
                          {g.giftType === 'cash' ? 'Saldo Dompet' : g.giftType === 'voucher' ? 'Voucher' : g.giftType === 'product' ? 'Produk/Merch' : 'Lainnya'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {/^\d+$/.test(String(g.giftName).trim()) ? `Rp ${parseInt(g.giftName).toLocaleString('id-ID')}` : g.giftName.replace(/\b\d{4,}\b/g, m => parseInt(m).toLocaleString('id-ID'))}
                        </strong>
                        {g.giftValue > 0 && (
                          <div style={{ fontSize: '0.75rem', color: g.giftType === 'cash' ? '#4ade80' : '#38bdf8' }}>
                            {g.giftType === 'cash' ? '+' : ''} Rp {g.giftValue.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {g.giftCode || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {g.giftType === 'cash' ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>-</span>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            color: g.status === 'used' ? 'var(--text-muted)' : '#4ade80',
                            background: g.status === 'used' ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.1)'
                          }}>
                            {g.status === 'used' ? 'Sudah Ditukar' : 'Aktif'}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{g.eventTitle}</td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{g.giftDescription || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada hadiah tambahan yang diklaim untuk akun Anda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voucher Ticket Modal (Phone Size Card) */}
      {selectedVoucherGift && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 2, 2, 0.9)',
          backdropFilter: 'blur(8px)',
          zIndex: 10500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--text-primary)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            overflow: 'hidden',
            color: 'var(--text-primary)'
          }}>
            {/* Ticket Notches */}
            <div style={{ position: 'absolute', left: '-12px', top: '220px', width: '24px', height: '24px', borderRadius: '50%', background: '#020202', borderRight: '2px solid var(--text-primary)' }}></div>
            <div style={{ position: 'absolute', right: '-12px', top: '220px', width: '24px', height: '24px', borderRadius: '50%', background: '#020202', borderLeft: '2px solid var(--text-primary)' }}></div>

            {/* Header */}
            <div style={{ padding: '24px 24px 16px 24px', borderBottom: '2px dashed var(--border-color)', textAlign: 'center', position: 'relative' }}>
              <button 
                onClick={() => setSelectedVoucherGift(null)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
              
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                E-VOUCHER HADIAH RESMI
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '12px 0 4px 0', color: 'var(--text-primary)' }}>
                {/^\d+$/.test(String(selectedVoucherGift.giftName).trim()) ? `Rp ${parseInt(selectedVoucherGift.giftName).toLocaleString('id-ID')}` : selectedVoucherGift.giftName.replace(/\b\d{4,}\b/g, m => parseInt(m).toLocaleString('id-ID'))}
              </h3>
              <span style={{
                fontSize: '0.7rem',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 'bold',
                background: selectedVoucherGift.status === 'used' ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.1)',
                color: selectedVoucherGift.status === 'used' ? 'var(--text-muted)' : '#4ade80',
                border: `1px solid ${selectedVoucherGift.status === 'used' ? 'var(--border-color)' : 'rgba(74,222,128,0.2)'}`,
                display: 'inline-block',
                marginTop: '6px'
              }}>
                {selectedVoucherGift.status === 'used' ? 'SUDAH DITUKARKAN' : 'AKTIF / BELUM DITUKAR'}
              </span>
            </div>

            {/* Ticket Body / QR Section */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: 'var(--shadow-premium)',
                width: '180px',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedVoucherGift.giftCode)}`}
                  alt="Voucher QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ textAlign: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>KODE VOUCHER</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginTop: '4px' 
                }}>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '1.25rem', 
                    fontWeight: '800', 
                    color: 'var(--text-primary)',
                    letterSpacing: '1px' 
                  }}>
                    {selectedVoucherGift.giftCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedVoucherGift.giftCode);
                      alert('Kode voucher berhasil disalin!');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }}
                  >
                    Salin
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Footer (Info) */}
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>EVENT PENYELENGGARA</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedVoucherGift.eventTitle}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>PENERIMA</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedVoucherGift.recipientName} (@{selectedVoucherGift.recipientUsername})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>PETUNJUK KLAIM</span>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.72rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {selectedVoucherGift.giftDescription || 'Tunjukkan QR Code ini kepada petugas/panitia saat melakukan transaksi.'}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                fontSize: '0.62rem', 
                color: 'var(--text-muted)',
                lineHeight: '1.4'
              }}>
                * Voucher ini hanya berlaku satu kali penukaran. Status akan berubah otomatis setelah diproses oleh panitia.
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Withdrawal Form Modal */}
      {isWdModalOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#020202',
          zIndex: 10200,
          overflowY: 'auto',
          padding: '40px 24px',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }} className="animate-fade-in">
          <div style={{ width: '100%', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} style={{ color: '#ffffff' }} />
                <span>Tarik Saldo Dompet</span>
              </h3>
              <button onClick={() => setIsWdModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={22} /></button>
            </div>
            
            <form onSubmit={handleWithdrawClick} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Saldo Tersedia:</span>{' '}
                <strong style={{ color: 'white', fontSize: '1.1rem' }}>Rp {walletBalance.toLocaleString('id-ID')}</strong>
              </div>

              {/* Alert jika belum ada rekening di profil */}
              {!currentUser?.payoutAccount ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '16px',
                  margin: '8px 0'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24'
                  }}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#fbbf24', fontSize: '1rem', fontWeight: 'bold' }}>
                      Metode Pencairan Belum Diatur
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '420px' }}>
                      Untuk keamanan dan kenyamanan penarikan saldo, silakan atur rekening Bank Anda terlebih dahulu pada profil Anda.
                    </p>
                  </div>
                  {onEditProfileClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsWdModalOpen(false);
                        onEditProfileClick();
                        setTimeout(() => {
                          document.getElementById('profile-bank-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 250);
                      }}
                      style={{
                        background: '#fbbf24',
                        color: '#000000',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '24px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                      }}
                    >
                      Atur Rekening Pencairan di Profil
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div style={{
                    background: 'rgba(74, 222, 128, 0.06)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        Tujuan pencairan: <strong>Bank {currentUser.payoutBank || currentUser.payoutMethod || 'Mandiri'} ({currentUser.payoutAccount})</strong> a.n <strong>{currentUser.payoutAccountName || currentUser.organizerName}</strong>
                      </div>
                    </div>
                    {onEditProfileClick && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsWdModalOpen(false);
                          onEditProfileClick();
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Ubah Rekening
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>Metode Penarikan Terdaftar</label>
                    <input 
                      type="text" 
                      disabled 
                      value={`Bank ${currentUser.payoutBank || currentUser.payoutMethod || 'Mandiri'} - ${currentUser.payoutAccount} (a.n ${currentUser.payoutAccountName || currentUser.organizerName})`} 
                      style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none', cursor: 'not-allowed' }} 
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>Nominal Penarikan (IDR)</label>
                    <input 
                      type="text" 
                      required 
                      value={formatInputCurrency(wdAmount)} 
                      onChange={(e) => {
                        const parsed = e.target.value.replace(/\D/g, '');
                        setWdAmount(parsed ? parseInt(parsed) : 0);
                      }} 
                      placeholder="Masukkan nominal, cth: 50.000" 
                      style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
                    />
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Batas minimal penarikan: <strong>Rp {minWithdrawalAmount.toLocaleString('id-ID')}</strong>
                    </span>
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Biaya Penarikan ({(activeFeePercent || 0)}%):</span>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>
                          {(activeFeePercent || 0) > 0 ? `Rp ${Math.round(wdAmount * activeFeePercent / 100).toLocaleString('id-ID')}` : 'Gratis'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', marginTop: '6px' }}>
                        <span style={{ color: 'white' }}>Total Bersih Diterima:</span>
                        <span style={{ color: 'white', fontSize: '0.98rem', borderBottom: '1px solid white', pb: '2px' }}>Rp {Math.max(0, wdAmount - Math.round(wdAmount * (activeFeePercent || 0) / 100)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {currentUser.password !== 'firebase-auth-managed' ? (
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', color: '#ffffff', fontSize: '0.85rem', fontWeight: '600' }}>Verifikasi Keamanan: Password Akun</label>
                      <input 
                        type="password" 
                        required 
                        value={wdPassword} 
                        onChange={(e) => setWdPassword(e.target.value)} 
                        placeholder="Masukkan password akun Anda untuk verifikasi" 
                        style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
                      />
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#ffffff', borderRadius: '8px', fontSize: '0.82rem', color: '#000000', lineHeight: '1.4', fontWeight: '500' }}>
                      <strong>Verifikasi Keamanan:</strong> Akun Anda terverifikasi menggunakan <strong>Google Auth</strong>. Penarikan dapat langsung dilanjutkan dengan aman tanpa password tambahan.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setIsWdModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      Ajukan Penarikan
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
