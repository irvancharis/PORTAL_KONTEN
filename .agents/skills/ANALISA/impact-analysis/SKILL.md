---
name: impact-analysis
description: Use when assessing the blast radius and downstream effects of proposed changes to database schemas, APIs, shared state, or stock calculation logic before editing code.
---

# Impact Analysis Skill

Gunakan skill ini sebelum melakukan modifikasi pada kode atau skema database untuk mencegah efek samping yang tidak diinginkan (*breaking changes*).

## 1. Analisis Radius Dampak (Blast Radius Analysis)
Sebelum mengubah fungsi atau model:
1. **Dampak Skema Database**:
   - Jika mengubah kolom di `schema.prisma`:
     - Periksa semua endpoint API yang membaca atau menulis ke kolom tersebut.
     - Periksa apakah ada `UNIQUE` constraint, `FOREIGN KEY` cascade, atau indeks yang terpengaruh.
     - Pastikan migrasi tidak menghapus data historis transaksi fisik.
2. **Dampak Saldo Stok (Stock Balance Impact)**:
   - Evaluasi apakah perubahan logika transaksi berpotensi menyebabkan saldo stok menjadi negatif atau selisih kuantitas opname.
3. **Dampak Integrasi Frontend**:
   - Jika response JSON API backend diubah, pastikan TypeScript interface di `frontend/src/services/` dan komponen modal/tabel yang merendernya disesuaikan bersamaan.
4. **Dampak Izin Hak Akses (RBAC Impact)**:
   - Pastikan endpoint yang diperbarui tidak mengunci role yang sebelumnya berhak mengaksesnya.

## 2. Checklist Laporan Dampak
- [ ] File & Baris yang terpengaruh langsung.
- [ ] File turunan (*downstream consumers*) yang perlu disesuaikan.
- [ ] Potensi risiko regresi & mitigasi yang disiapkan.

