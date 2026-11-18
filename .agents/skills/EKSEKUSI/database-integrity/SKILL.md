---
name: database-integrity
description: Use when modifying database schemas, writing migrations, verifying unique constraints, foreign keys, non-negative stock balances, and atomic transactions in PostgreSQL and Prisma.
---

# Database Integrity Skill

Gunakan skill ini untuk menjamin integritas relasional data inventaris pada PostgreSQL dan Prisma ORM.

## 1. Aturan Integritas Data Inventaris
1. **Pencegahan Saldo Stok Negatif**:
   - Kolom `qty_on_hand` pada tabel `stock_balances` wajib dilindungi dengan `CHECK (qty_on_hand >= 0)`.
   - Transaksi pengeluaran barang (MIR) harus melakukan pre-flight check stok sebelum mengeksekusi pengurangan saldo.
2. **Constraint Unik Wajib (Unique Constraints)**:
   - Pastikan tabel operasional memiliki unique index yang valid untuk mendukung operasi `upsert` Prisma:
     - `stock_balances`: `UNIQUE(item_id, storage_bin_id)`
     - `permissions`: `UNIQUE(code)`
     - `roles`: `UNIQUE(code)` dan `UNIQUE(name)`
     - `role_permissions`: `UNIQUE(role_id, permission_id)`
     - `user_role_assignments`: `UNIQUE(user_id, role_id)`
3. **Transaksi Atomik (ACID Transactions)**:
   - Setiap mutasi yang melibatkan lebih dari satu tabel (misal: simpan header transaksi, buat item lines, update saldo stok fisik, mutasi nomor seri) **WAJIB** dibungkus dalam `prisma.$transaction(async (tx) => { ... })`.
4. **Migrasi Aman (Zero Data Loss)**:
   - Dilarang menjalankan perintah migrasi destruktif yang menghapus tabel data transaksi riil.
   - Tambahkan skrip *self-healing* SQL (`ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS`) pada proses start server untuk mencegah kegagalan `ON CONFLICT` di PostgreSQL.

