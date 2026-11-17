---
name: security-code-review
description: Use when conducting security audits, checking OWASP Top 10 vulnerabilities, inspecting RBAC middleware, input sanitization, SQL injection prevention, and credential handling.
---

# Security Code Review Skill

Gunakan skill ini untuk mengaudit kode terhadap potensi celah keamanan, otorisasi hak akses, dan kepatuhan standar keamanan data enterprise.

## 1. Fokus Audit Keamanan
1. **Otorisasi & Kontrol Akses (Broken Access Control - OWASP A01)**:
   - Pastikan setiap rute API terlindungi dengan middleware `authenticateJWT`.
   - Pastikan aksi mutasi data dilindungi middleware RBAC spesifik: `requirePermission('MODULE:ACTION')`.
   - Pastikan pengguna biasa tidak dapat memanipulasi parameter URL (IDOR) untuk mengubah atau menghapus data milik perusahaan lain.
2. **Pencegahan Injeksi (Injection - OWASP A03)**:
   - Gunakan Prisma ORM dengan parameterized queries bawaan.
   - Jika menggunakan kueri SQL mentah (`$queryRawUnsafe` / `$executeRawUnsafe`), pastikan parameter tidak digabungkan langsung dari input pengguna (*string concatenation*).
3. **Penyimpanan Kredensial & Autentikasi**:
   - Password wajib dienkripsi menggunakan `bcrypt` dengan cost factor yang memadai.
   - Token JWT harus diverifikasi masa berlakunya dan tidak membocorkan informasi sensitif di payload.
4. **Audit Trail & Logging**:
   - Setiap aksi modifikasi dan penghapusan data wajib memanggil `ActivityLogService.record(...)` lengkap dengan identitas aktor, IP address, deskripsi, dan metadata sebelum/sesudah perubahan.

