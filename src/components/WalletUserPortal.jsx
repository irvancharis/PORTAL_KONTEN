import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle, Search } from 'lucide-react';

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
  withdrawalFeePercent = 0
}) {
  const [isWdModalOpen, setIsWdModalOpen] = useState(false);
  const [wdAmount, setWdAmount] = useState(0);
  const [wdAccount, setWdAccount] = useState('');
  const [wdName, setWdName] = useState('');
  const [wdMethod, setWdMethod] = useState('Dana');
  const [wdPassword, setWdPassword] = useState('');
  const [txFilter, setTxFilter] = useState('all'); // 'all', 'credit', 'debit'

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Wallet size={48} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ color: 'white' }}>Masuk Akun Diperlukan</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Silakan masuk ke akun Anda terlebih dahulu untuk melihat dompet kreator.</p>
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

  // Combine & Sort Transactions
  const allTransactions = [...creditSubs, ...creditPrizes, ...debitWithdrawals].sort((a, b) => 
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
    const feeAmount = Math.round(amountToWithdraw * (withdrawalFeePercent || 0) / 100);
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
    if (txFilter === 'credit') return tx.type === 'credit';
    if (txFilter === 'debit') return tx.type === 'debit';
    return true;
  });

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
          className="btn btn-primary"
          onClick={() => {
            setWdAmount(0);
            setWdAccount('');
            setWdName('');
            setWdMethod('Dana');
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
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

      {/* Transaction History Section */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Riwayat Mutasi Saldo</h3>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setTxFilter('all')} 
              style={{ padding: '6px 12px', fontSize: '0.8rem', border: 'none', background: txFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent', color: txFilter === 'all' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
            >
              Semua
            </button>
            <button 
              onClick={() => setTxFilter('credit')} 
              style={{ padding: '6px 12px', fontSize: '0.8rem', border: 'none', background: txFilter === 'credit' ? 'rgba(74, 222, 128, 0.1)' : 'transparent', color: txFilter === 'credit' ? '#4ade80' : 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
            >
              Pemasukan
            </button>
            <button 
              onClick={() => setTxFilter('debit')} 
              style={{ padding: '6px 12px', fontSize: '0.8rem', border: 'none', background: txFilter === 'debit' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: txFilter === 'debit' ? '#f87171' : 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
            >
              Penarikan
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          {filteredTxs.length > 0 ? (
            <table className="admin-table" style={{ width: '100%' }}>
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
                      <strong style={{ color: 'white', fontSize: '0.88rem' }}>{tx.description}</strong>
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
                        color: tx.status === 'approved' ? '#22c55e' : '#eab308',
                        background: tx.status === 'approved' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)'
                      }}>
                        {tx.status === 'approved' ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Selesai</span>
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
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Belum ada riwayat transaksi keuangan pada dompet Anda.
            </div>
          )}
        </div>
      </div>

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

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>Metode Penarikan</label>
                <select 
                  value={wdMethod} 
                  onChange={(e) => setWdMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }}
                >
                  <option value="Dana">Dana</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="Bank Transfer">Bank Transfer (Mandiri/BCA)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>Nomor Rekening / No. HP Akun</label>
                <input 
                  type="text" 
                  required 
                  value={wdAccount} 
                  onChange={(e) => setWdAccount(e.target.value.replace(/\D/g, ''))} 
                  placeholder="Contoh: 0812XXXXXXXX / No Rek" 
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>Nama Pemilik Akun</label>
                <input 
                  type="text" 
                  required 
                  value={wdName} 
                  onChange={(e) => setWdName(e.target.value)} 
                  placeholder="Masukkan nama lengkap pemilik akun" 
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.88rem', outline: 'none' }} 
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
                    <span style={{ color: 'var(--text-secondary)' }}>Biaya Penarikan ({(withdrawalFeePercent || 0)}%):</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                      {(withdrawalFeePercent || 0) > 0 ? `- Rp ${Math.round(wdAmount * withdrawalFeePercent / 100).toLocaleString('id-ID')}` : 'Gratis'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', marginTop: '6px' }}>
                    <span style={{ color: 'white' }}>Total Bersih Diterima:</span>
                    <span style={{ color: 'white', fontSize: '0.98rem', borderBottom: '1px solid white', pb: '2px' }}>Rp {Math.max(0, wdAmount - Math.round(wdAmount * (withdrawalFeePercent || 0) / 100)).toLocaleString('id-ID')}</span>
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
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
