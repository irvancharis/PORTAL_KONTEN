---
name: requirement-analysis
description: Use when analyzing business requirements, translating factory warehouse operations into technical specs, acceptance criteria, and RBAC permission matrices.
---

# Requirement Analysis Skill

Gunakan skill ini saat menerima permintaan fitur baru atau pembaruan alur kerja pergudangan dari pengguna.

## 1. Analisis Kebutuhan Bisnis Pabrik
1. **Identifikasi Aktor & Peran**:
   - Tentukan siapa pengguna fitur ini: `ADMIN` (Superadmin), `SUPERVISOR` (Kepala Gudang), `STAFF_GUDANG` (Warehouseman), `TEKNISI` (Pemohon/Eng), atau `OPERATOR`.
2. **Identifikasi Aturan Domain**:
   - Apakah barang membutuhkan nomor Work Order (WO) atau Target Mesin? (Kategori MC/EL).
   - Apakah barang membutuhkan serial number unik?
   - Apakah transaksi mempengaruhi saldo fisik (`stock_balances`) secara instan atau bersyarat (misal hanya status `ACCEPTED`)?
3. **Penyusunan Acceptance Criteria (Kriteria Keberterimaan)**:
   - Definisikan skenario positif (alur sukses) dan skenario negatif (stok kurang, serial duplikat, alasan kosong).

## 2. Matriks Pemetaan Hak Akses (RBAC)
Setiap kebutuhan baru harus langsung ditentukan kodenya:
- Format: `[NAMA_MODUL]:[VIEW|CREATE|EDIT|DELETE|APPROVE|POST|EXPORT]`
- Tentukan role mana yang mendapatkan izin ini secara default.

