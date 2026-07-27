# 📖 Panduan Penggunaan Sistem Berdasarkan Peran Aktor
**JAMKOSONG: Panduan Langkah Demi Langkah (Step-by-Step User Journey)**

Dokumen ini menjelaskan alur interaksi dan penggunaan sistem untuk **4 Aktor Utama**: **User (Penonton)**, **Panitia (Penyelenggara)**, **Peserta Event (Kreator)**, dan **Owner (Pemilik)**.

---

## 🎞️ 1. USER (Penonton Film Umum)
Tujuan utama aktor ini adalah menonton konten video/film premium dengan biaya hemat.

```
[ Masuk Portal ] ──► [ Pilih Judul Film ] ──► [ Putar Video ]
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                ▼                                                                     ▼
     [ Nonton Gratisan (Guest) ]                                           [ Nonton Premium Member ]
     * Terkena pengalihan link affiliate                                   * Bayar Rp 10.000 / Bulan via transfer
     * Durasi dibatasi hanya 3 menit                                       * Bebas batas waktu (Full-length)
     * Ditawari upgrade ke Premium                                         * Bebas iklan & konten eksklusif
```

### **Langkah Penggunaan:**
1.  **Akses Portal**: Masuk ke aplikasi PWA Jamkosong melalui tautan web di HP/Laptop.
2.  **Pilih & Putar**: Klik salah satu poster film di halaman katalog.
3.  **Menonton Gratis (Teaser)**: Jika belum berlangganan, pengguna dapat memutar video secara gratis namun akan dialihkan terlebih dahulu ke halaman sponsor (Platform Affiliate) dan pemutaran film akan terkunci secara absolut di **menit ke-3**.
4.  **Aktivasi Premium**:
    *   Klik tombol **"Berlangganan Sekarang"** di modal yang muncul.
    *   Pilih paket (Rp 10.000 / Bulan), salin rekening pembayaran, transfer biaya, dan unggah bukti transfer (struk).
    *   Tunggu persetujuan Owner. Setelah aktif, penonton dapat menikmati seluruh film berdurasi penuh tanpa gangguan.

---

## 🎖️ 2. PANITIA (Penyelenggara / Pembuat Event)
Aktor ini adalah brand lokal, EO, komunitas, atau individu yang ingin menyelenggarakan kompetisi viral.

### **Langkah Penggunaan:**
1.  **Daftar Akun**: Membuat akun penyelenggara di platform Jamkosong.
2.  **Buat Event Baru**: Masuk ke dasbor admin, pilih menu **"Kelola Event"** ➡️ klik **"Tambah Event Baru"**.
3.  **Pengaturan Parameter**:
    *   Isi Judul, Deskripsi, Tanggal Mulai/Selesai, dan Kuota.
    *   Tentukan Tipe Event: *Normal Competition* (Juara 1, 2, 3) atau *Sponsored Ad Pool* (Iklan bersama).
    *   Jika memilih *Ad Pool*: Masukkan **Total Budget** (misal Rp 5.000.000) dan **Nilai CPM** (misal Rp 10.000 per 1.000 views).
4.  **Bayar Biaya Admin**: Membayar biaya administrasi pembuatan event terbuka sebesar **Rp 250.000** ke rekening platform.
5.  **Monitoring & Penjurian**:
    *   Panitia memantau dashboard untuk melihat daftar peserta yang sudah berhasil **mengunci akun sosial medianya**.
    *   Mengecek link karya yang dikirimkan peserta.
    *   Melakukan penilaian akhir (penjurian) dan mencairkan dana *Ad Pool* kepada peserta berdasarkan audit total jangkauan penayangan riil yang terekam di sistem.

---

## 📱 3. PESERTA EVENT (Konten Kreator)
Aktor ini adalah peserta kompetisi/kreator mikro yang ingin mempromosikan produk brand dan dibayar berdasarkan performa jangkauan (*views*).

### **Langkah Penggunaan:**
1.  **Pilih Event**: Memilih event kompetisi/kampanye aktif yang ingin diikuti di halaman utama portal.
2.  **Verifikasi & Kunci Akun (Tahap 1)**:
    *   Masukkan username sosial media (Instagram/TikTok/YouTube) di kolom pendaftaran.
    *   Sistem akan memunculkan kode unik (misal: `JAMKO-X928`).
    *   Peserta membuka aplikasi sosmed mereka, menempelkan kode tersebut di bagian **Bio Profil**.
    *   Kembali ke portal Jamkosong, klik **"Verifikasi & Kunci Akun"**.
    *   Setelah robot sistem berhasil membaca kecocokan kode dan memvalidasi keaktifan akun, akun sosmed peserta **terkunci di sistem**. Kode unik di bio profil kini sudah aman untuk dihapus kembali.
3.  **Posting Karya & Submit Link (Tahap 2)**:
    *   Kreator membuat video/karya promosi sesuai arahan event dan mempostingnya **di akun sosmed yang telah terkunci** tadi.
    *   Salin link postingan karya tersebut, kembali ke portal, lalu kirimkan (*submit*) link tersebut.
    *   *Catatan*: Sistem akan menolak jika link postingan yang dimasukkan berasal dari akun/username sosmed yang berbeda dari yang telah dikunci di Tahap 1.
4.  **Klaim Pembayaran**: Menunggu event berakhir, memantau jumlah penayangan (*views*) karya mereka yang diaudit secara transparan di portal, dan menerima pembayaran hasil kinerja (CPM) mereka.

---

## 👑 4. OWNER (Pemilik Platform Jamkosong)
Aktor ini adalah administrator utama/pendiri platform yang mengelola perputaran ekosistem secara makro.

### **Langkah Penggunaan:**
1.  **Persetujuan Langganan Premium**:
    *   Masuk ke dasbor superadmin, pilih menu **"Verifikasi Bukti Bayar"**.
    *   Mencocokkan struk transfer yang dikirim pengguna dengan mutasi rekening bank platform.
    *   Klik **"Setujui/Approve"** untuk otomatis mengubah role pengguna menjadi Premium Member.
2.  **Persetujuan Pendaftaran Event Terbuka**:
    *   Memeriksa permohonan event baru dari Panitia luar dan memverifikasi pembayaran biaya admin Rp 250.000.
    *   Klik **"Aktifkan Event"** agar event tersebut muncul di beranda utama untuk bisa diikuti publik.
3.  **Bagi Hasil Konten (Profit-Sharing)**:
    *   Meninjau performa jam tayang film-film yang diunggah para sineas mitra di akhir bulan.
    *   Mendistribusikan porsi bagi hasil **70% dari pendapatan premium** kepada para sineas secara transparan sesuai volume durasi tontonan.
4.  **Distribusi Ad Pool**: Memotong komisi administrasi (misal 15%) dari anggaran *Ad Pool* pengiklan, lalu mentransfer sisa dana ke saldo dompet digital kreator pemenang/peserta kompetisi.
5.  **Pengaturan Iklan Afiliasi**: Memperbarui link program **Platform Affiliate** eksternal di halaman kelola iklan agar penonton gratisan selalu diarahkan ke kampanye afiliasi yang sedang aktif dan menghasilkan komisi terbesar.
