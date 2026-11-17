---
name: system-architecture
description: Use when designing, evaluating, or refactoring the high-level system architecture, service layer boundaries, Clean Architecture patterns, and repository isolation.
---

# System Architecture Skill

Gunakan skill ini untuk merancang atau mengevaluasi arsitektur sistem berbasis Clean Architecture dan Repository-Service Pattern pada aplikasi enterprise inventaris.

## 1. Prinsip Pemisahan Lapisan (Layer Separation)
Setiap modul wajib mengikuti hierarki tanggung jawab yang ketat:
1. **Presentation / Route Layer (`backend/src/routes/`)**:
   - Hanya bertugas mendefinisikan URL endpoint, metode HTTP, dan middleware proteksi (`authenticateJWT`, `requirePermission`).
   - Tidak boleh memuat logika bisnis langsung.
2. **Controller Layer (`backend/src/controllers/`)**:
   - Menerima `req: Request`, memvalidasi schema input menggunakan Validator DTO, memanggil Service, dan merespons `res: Response`.
   - Mengintegrasikan pencatatan audit log `ActivityLogService.record(...)`.
3. **Domain / Service Layer (`backend/src/services/`)**:
   - Memuat 100% *business logic*, kalkulasi kuota pagu, verifikasi status QC, pemindahan nomor seri, dan transaksi atomik database (`prisma.$transaction`).
4. **Data Access / Repository Layer (`backend/src/repositories/`)**:
   - Mengabstraksi kueri database Prisma ORM dari service.
5. **Frontend Modular Layer**:
   - UI Komponen (`components/`), Halaman navigasi (`pages/`), State kontekstual (`context/`), dan Klien API (`services/`).

## 2. Checklist Desain Arsitektur Baru
- [ ] Apakah modul baru memecah fungsi monolitik menjadi Service dan Controller terpisah?
- [ ] Apakah transaksi multi-tabel dibungkus dalam transaksi atomik database?
- [ ] Apakah tidak ada kebocoran detail database ke Controller atau Frontend?

