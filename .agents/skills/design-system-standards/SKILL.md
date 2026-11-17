---
name: design-system-standards
description: Standarisasi Design System Monokrom (Hitam & Putih) untuk seluruh antarmuka aplikasi ngonten.id. Gunakan aturan ini untuk memverifikasi kontras teks, hierarki warna, kartu, tombol, dan form input agar selalu tajam, mudah dibaca, dan konsisten.
---

# Standarisasi Design System: Monokrom Premium (Hitam & Putih)

Dokumen ini merupakan panduan utama antarmuka pengguna (UI/UX) untuk platform **ngonten.id**. Semua komponen, modal, halaman, kartu, tombol, dan form input wajib mengikuti standar kontras tinggi berikut ini.

---

## 1. Filosofi & Palet Warna Dasar

Prinsip utama: **Keterbacaan Mutlak (Zero Low-Contrast Text)**. Tidak boleh ada teks gelap di atas latar belakang gelap, atau teks terang/pucat di atas latar belakang putih.

### A. Palet Monokrom Utama
- **Hitam Pekat (Deep Black)**: `#020202` / `#0a0a0a` / `#0f172a`
  - Digunakan sebagai: Latar belakang aplikasi utama, tombol primer berbobot tinggi, teks judul utama pada kartu putih.
- **Putih Bersih (Pure White)**: `#ffffff`
  - Digunakan sebagai: Background kartu kontras tinggi, teks utama di atas elemen gelap, badge aktif.
- **Abu-abu Gelap (Slate Text)**: `#1e293b` / `#334155` / `#475569`
  - Digunakan sebagai: Teks subjudul, isi paragraf, dan label form pada latar belakang kartu putih.
- **Border / Garis Pemisah Kontras**: `#cbd5e1` (di latar putih) & `rgba(255, 255, 255, 0.15)` (di latar gelap).
  - Hindari garis border transparan tipis yang membuat batas kartu hilang.

### B. Warna Aksen & Status Fungsional (Tetap Tegas & Kontras)
- **Primary Accent**: `#0f172a` (Black) / `#ffffff` (White)
- **Sukses / Terverifikasi**: `#10b981` (Teks di background gelap: `#34d399`, teks di background terang: `#047857`)
- **Peringatan / Perhatian**: `#f59e0b` (Teks di background terang: `#b45309`)
- **Error / Hapus**: `#ef4444` (Teks di background terang: `#b91c1c`)

---

## 2. Aturan Komponen UI

### A. Kartu & Panel (Cards & Containers)
1. **Kartu Terang (Light Card / Modal Dialog)**:
   - Background: `#ffffff`
   - Border: `1.5px solid #e2e8f0` atau `#cbd5e1`
   - Shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.08)`
   - Seluruh teks di dalam kartu ini WAJIB menggunakan warna gelap (`#0f172a` untuk judul, `#334155` untuk deskripsi, `#64748b` untuk keterangan sekunder).
   - DILARANG menggunakan teks putih atau abu-abu transparan (`rgba(255,255,255,0.7)`) di dalam kartu putih.
2. **Kartu Header Gelap (Dark Header Banner)**:
   - Background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
   - Seluruh teks judul dan subjudul di dalam header gelap WAJIB putih murni (`#ffffff`) atau `#f8fafc`. Dilarang menggunakan teks hitam/navy gelap di dalam header gelap!

### B. Form Inputs & Dropdown
- Background: `#ffffff`
- Border: `1.5px solid #cbd5e1` (fokus: `2px solid #0f172a`)
- Teks Input: `#0f172a` dengan ketebalan font `600` / `700`
- Placeholder: `#94a3b8`
- Label: `#1e293b` dengan font weight `700`

### C. Tombol (Buttons)
1. **Tombol Primer (Primary)**:
   - Background: `#0f172a` (Hitam pekat)
   - Teks: `#ffffff` (Putih murni) dengan weight `700`
   - Hover: `#1e293b` dengan sedikit translasi / shadow tajam
2. **Tombol Sekunder (Secondary / Outline)**:
   - Background: `#f8fafc`
   - Border: `1.5px solid #cbd5e1`
   - Teks: `#1e293b` dengan weight `700`
3. **Tombol Salin (Copy Button)**:
   - Default: Background `#0f172a`, Teks `#ffffff`, Ikon `#ffffff`
   - Aktif / Tersalin: Background `#10b981`, Teks `#ffffff`, Ikon `#ffffff`

### D. Tampilan Data Monospace (Nomor Rekening / Kode Voucher)
- Font: `monospace`
- Ukuran: minimal `1.3rem`
- Warna: `#0f172a` (di latar putih) atau `#ffffff` (di latar gelap)
- Container: Diberi border putus-putus (`border: 1.5px dashed #cbd5e1`) dan background netral lembut (`#f8fafc`).

---

## 3. Checklist Verifikasi Sebelum Rilis
- [ ] Apakah ada teks gelap di atas background hitam/gelap? (Harus 0)
- [ ] Apakah ada teks putih di atas background terang? (Harus 0)
- [ ] Apakah judul bank/e-wallet di header kartu terlihat jelas dengan kontras 100%?
- [ ] Apakah tombol aksi (Salin, Kirim, Batal, Simpan) memiliki teks yang kontras tajam terhadap background tombol?
- [ ] Apakah badge status (Utama / Opsi Transfer) terbaca dengan mudah tanpa menyilaukan atau pudar?
