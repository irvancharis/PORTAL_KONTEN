---
name: application-analysis
description: Use when analyzing the overall software application, tech stack, data flows, components, dependency health, and module interactions across frontend and backend.
---

# Application Analysis Skill

Gunakan skill ini untuk melakukan audit menyeluruh terhadap arsitektur aplikasi, kesehatan ketergantungan (dependencies), pemetaan rute API, alur data komponen frontend, dan pipeline backend.

## 1. Protokol Analisis Sistem
Saat menganalisis aplikasi:
1. **Pemetaan Stack & Runtime**:
   - Identifikasi environment Node.js, framework backend (Express + TypeScript + Prisma), dan frontend (React + Vite + Tailwind CSS).
2. **Katalog Modul & Rute**:
   - Petakan setiap endpoint API di `backend/src/routes/` beserta middleware autentikasi dan RBAC-nya.
   - Petakan halaman frontend di `frontend/src/pages/` dan keterhubungannya dengan layanan API `frontend/src/services/`.
3. **Alur Transaksi Kritis**:
   - Analisis alur mutasi barang: Permintaan (FPPGS) ➔ Penerimaan (GRN) ➔ Pengeluaran (MIR) ➔ Peminjaman Antarperusahaan ➔ Disposisi/Retur ➔ Stock Opname.
4. **Evaluasi Hambatan (Bottlenecks & Technical Debt)**:
   - Identifikasi kode duplikasi, query N+1 pada database ORM, dan bundle size frontend yang melebihi batas.

## 2. Format Laporan Analisis
Setiap kali menghasilkan laporan analisis aplikasi, gunakan struktur berikut:
- **Ringkasan Arsitektur** (Tech Stack, Versi, Status Runtime).
- **Matriks Modul & Ketergantungan** (Frontend Page ↔ Backend Service ↔ Database Models).
- **Temuan Kritis & Rekomendasi Peningkatan** (Prioritas: Tinggi / Sedang / Rendah).

