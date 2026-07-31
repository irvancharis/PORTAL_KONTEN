# Bagan Alur Sistem (System Flowcharts)

Dokumen ini berisi flowchart alur sistem dari berbagai sisi pengguna di dalam platform **Portal Movie / Portal Konten**.

---

## 1. Alur User Menjadi Member Premium

Alur proses dari saat user biasa melakukan transaksi peningkatan akun hingga menjadi status Premium.

```mermaid
graph TD
    A["Mulai (User Masuk Halaman Premium/Pricing)"] --> B["Pilih Paket Membership (Bulanan/Tahunan)"]
    B --> C["Masukkan Informasi Pembayaran (Transfer Bank/E-Wallet)"]
    C --> D["Kirim Bukti Pembayaran (Upload Receipt)"]
    D --> E["Sistem Membuat Transaksi Baru (Status: 'Pending')"]
    E --> F["Notifikasi Terkirim ke Admin/Staf"]
    F --> G["Staf Memverifikasi Bukti Pembayaran"]
    G --> H{"Apakah Bukti Pembayaran Valid?"}
    H -- "Tidak (Ditolak)" --> I["Staf Mengubah Status Transaksi menjadi 'Rejected'"]
    I --> J["User Menerima Notifikasi Penolakan & Dapat Mengunggah Ulang"]
    H -- "Ya (Disetujui)" --> K["Staf Mengubah Status Transaksi menjadi 'Approved'"]
    K --> L["Sistem Mengubah Role User Menjadi 'Premium'"]
    L --> M["Sistem Mengisi Masa Kedaluwarsa Membership"]
    M --> N["User Menerima Notifikasi Keberhasilan & Mendapat Akses Premium"]
    J --> O["Selesai"]
    N --> O
```

---

## 2. Alur Pendaftaran Content Creator & Peserta Event

Proses ketika pengguna mendaftar sebagai pembuat konten, dilanjutkan dengan mendaftar ke suatu kompetisi/event.

```mermaid
graph TD
    A["Mulai (User Masuk Profil)"] --> B["Klik 'Daftar Sebagai Creator'"]
    B --> C["Masukkan Username Sosmed & Platform (YouTube/TikTok/IG)"]
    C --> D["Sistem Menghasilkan Kode Verifikasi Unik (Bio Code)"]
    D --> E["User Menempelkan Kode ke Bio Sosial Medianya"]
    E --> F["User Klik 'Verifikasi Akun Saya'"]
    F --> G["Google Apps Script Memvalidasi Profil & Kode di Bio"]
    G --> H{"Verifikasi Sukses?"}
    H -- "Tidak" --> I["Tampilkan Pesan Error (Kode tidak cocok / profil tidak ditemukan)"]
    I --> J["User Memperbaiki Posisi Kode di Bio Sosmed"]
    J --> F
    H -- "Ya" --> K["Role User Berubah Menjadi 'Creator'"]
    
    K --> L["Creator Memilih Event/Kompetisi yang Aktif"]
    L --> M{"Apakah Creator Ditawari Langsung oleh Panitia?"}
    
    M -- "Ya (Ditawari Langsung)" --> N["Creator Mendapatkan Notifikasi Penawaran Khusus"]
    N --> O["Creator Menerima Tawaran di Halaman Notifikasi"]
    O --> P["Sistem Otomatis Mendaftarkan Creator sebagai Peserta tanpa Form Tambahan"]
    
    M -- "Tidak (Daftar Mandiri)" --> Q["Creator Mengisi Form Pendaftaran Event"]
    Q --> R["Menunggu Persetujuan Pendaftaran oleh Panitia"]
    R --> S{"Panitia Menyetujui?"}
    S -- "Ditolak" --> T["Creator Menerima Notifikasi Penolakan"]
    S -- "Disetujui" --> P
    
    P --> U["Creator Mengunggah Karya Video (Tautan YouTube/TikTok/IG)"]
    U --> V["Selesai (Karya Terdaftar)"]
```

---

## 3. Alur Pendaftaran Event Creator & Pembuatan Event

Proses bagi penyelenggara untuk mendaftar sebagai pembuat event dan merilis kompetisi baru.

```mermaid
graph TD
    A["Mulai (User Masuk Halaman Event)"] --> B["Daftar Menjadi Penyelenggara (Event Creator)"]
    B --> C["Mengisi Data Profil Organisasi / Panitia"]
    C --> D["Menunggu Validasi Kelayakan oleh Superadmin"]
    D --> E{"Apakah Disetujui?"}
    E -- "Tidak" --> F["Menerima Notifikasi Penolakan & Memperbaiki Profil"]
    F --> B
    E -- "Ya" --> G["Akses Menu 'Kelola Event' Terbuka"]
    
    G --> H["Buat Event Baru"]
    H --> I["Isi Detail Event (Judul, Banner, Deskripsi, Tanggal)"]
    I --> J["Pilih Metode Anggaran (Ranking vs Pay Per View)"]
    
    J --> K{"Metode Anggaran?"}
    
    K -- "Ranking (Juara 1, 2, 3)" --> L["Isi Anggaran untuk Hadiah Ranking & Tentukan Juri"]
    K -- "Pay Per View (Views)" --> M["Isi Campaign Budget, Nilai Per View (benefitAmount), & Minimal Kelipatan View (benefitViewsStep)"]
    
    L --> N["Event Dibuat dalam Status 'Draft' / Menunggu Pembayaran Anggaran"]
    M --> N
    
    N --> O["Panitia Membayar Biaya Anggaran Event ke Admin Platform"]
    O --> P["Staf Menyetujui Pembayaran Keuangan Masuk Event"]
    P --> Q["Status Event Berubah Menjadi 'Berjalan' (Aktif untuk Publik)"]
    Q --> R["Selesai"]
```

---

## 4. Alur Validasi Staf - Keuangan Masuk (Deposit & Membership)

Proses kerja staf internal dalam memverifikasi dan menyetujui transaksi dana masuk dari pengguna (deposit saldo atau pendaftaran membership premium).

```mermaid
graph TD
    M1["Mulai: User Mengunggah Bukti Transfer"] --> M2["Bukti Masuk ke Tab 'Konfirmasi Pembayaran' Staf"]
    M2 --> M3["Staf Membuka Detail Transaksi & Mengunduh Bukti Transfer"]
    M3 --> M4["Staf Membuka Mutasi Rekening Bank/E-Wallet Perusahaan"]
    M4 --> M5["Cocokkan Nominal Transfer & Nama Pengirim"]
    M5 --> M6{"Apakah Uang Benar-Benar Masuk & Nominal Sesuai?"}
    
    M6 -- "Tidak Sesuai / Palsu" --> M7["Staf Memilih Tombol 'Tolak Transaksi'"]
    M7 --> M8["Staf Menuliskan Alasan Penolakan secara Spesifik"]
    M8 --> M9["Sistem Mengubah Status menjadi 'Rejected'"]
    M9 --> M10["User Mendapat Notifikasi Penolakan & Dapat Mengunggah Ulang Bukti"]
    
    M6 -- "Ya (Valid)" --> M11["Staf Memilih Tombol 'Setujui Pembayaran'"]
    M11 --> M12["Sistem Mengubah Status menjadi 'Approved'"]
    M12 --> M13["Sistem Menambahkan Saldo ke Wallet User atau Mengaktifkan Status Premium"]
    M13 --> M14["User Menerima Notifikasi Keberhasilan Transaksi"]
    
    M10 --> M15["Selesai"]
    M14 --> M15
```

---

## 5. Alur Validasi Staf - Keuangan Keluar (Penarikan Dana / Withdrawals)

Proses verifikasi, transfer manual, hingga penyelesaian pembayaran keluar oleh staf untuk pencairan saldo dompet peserta/creator.

```mermaid
graph TD
    K1["Mulai: Peserta/Creator Mengajukan Tarik Saldo Wallet"] --> K2["Pengajuan Masuk ke Tab 'Penarikan Dana' Staf"]
    K2 --> K3["Staf Membuka Detail Rekening Tujuan & Jumlah Penarikan"]
    K3 --> K4["Staf Memeriksa Kelayakan Akun (Bukan Fraud/Spam)"]
    K4 --> K5{"Apakah Akun & Data Penarikan Valid?"}
    
    K5 -- "Tidak Valid / Indikasi Fraud" --> K6["Staf Memilih Tombol 'Tolak Penarikan'"]
    K6 --> K7["Staf Memasukkan Alasan Penolakan secara Jelas"]
    K7 --> K8["Sistem Mengembalikan Saldo Terkunci ke Wallet User"]
    K8 --> K9["User Menerima Notifikasi Pembatalan Penarikan"]
    
    K5 -- "Valid" --> K10["Staf Melakukan Transfer Manual via Internet Banking/E-Wallet ke Rekening Tujuan"]
    K10 --> K11["Staf Mengunduh Bukti Transfer (Resi Transfer)"]
    K11 --> K12["Staf Mengunggah Bukti Transfer Tersebut ke Sistem"]
    K12 --> K13["Staf Mengklik Tombol 'Setujui & Cairkan'"]
    
    K13 --> K14["Sistem Mengubah Status Penarikan menjadi 'Approved'"]
    K14 --> K15["Sistem Memotong Saldo Wallet User secara Permanen"]
    K15 --> K16["User Menerima Notifikasi Transfer Sukses Beserta Gambar Bukti Transfer"]
    
    K9 --> K17["Selesai"]
    K16 --> K17
```
