---
name: qa-regression-testing
description: Use when validating quality assurance, designing regression test scenarios, running verification builds, negative testing, and ensuring zero-defect deployments.
---

# QA Regression Testing Skill

Gunakan skill ini untuk merancang skenario pengujian, memverifikasi ketiadaan cacat (*zero defects*), dan mencegah terjadinya regresi sistem.

## 1. Skenario Pengujian Regresi Wajib
1. **Skenario Alur Transaksi Positif**:
   - Pembuatan data baru (Create): Pastikan data tersimpan di tabel transaksi dan saldo stok bertambah/berkurang dengan benar.
   - Pembaruan data (Update): Pastikan selisih perubahan stok tersinkronisasi otomatis.
   - Penghapusan data (Delete): Pastikan saldo stok dikembalikan ke kondisi semula dan alasan penghapusan tersimpan di log audit.
2. **Skenario Pengujian Negatif (Boundary & Error Cases)**:
   - Pengeluaran stok melebihi ketersediaan saldo fisik (harus gagal dengan pesan validasi yang jelas).
   - Penyerahan nomor seri yang berstatus selain `IN_STOCK` (harus ditolak).
   - Penghapusan transaksi tanpa mengisi alasan wajib (tombol konfirmasi harus terkunci/validasi form gagal).
   - Akses rute/fitur oleh pengguna yang tidak memiliki hak akses RBAC (harus menghasilkan kode 403 Forbidden).
3. **Pemeriksaan Kompilasi & Build**:
   - Backend Build: `npm run build` di direktori `backend/` ➔ status 0.
   - Frontend Build: `npm run build` di direktori `frontend/` ➔ status 0.

