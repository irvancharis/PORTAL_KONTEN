---
name: improvement-documentation
description: Use when generating technical walkthroughs, change logs, release documentation, user guides, and updating feature walkthrough coach marks in featuresWalkthrough.ts.
---

# Improvement Documentation Skill

Gunakan skill ini untuk menyusun dokumentasi teknis, catatan rilis (*changelog*), dan panduan pengguna (*coach marks*) setiap kali terjadi penambahan atau pembaruan fitur.

## 1. Protokol Dokumentasi Wajib (AGENTS.md Compliance)
Setiap penambahan atau modifikasi fitur wajib mengikuti protokol berikut:
1. **Pendaftaran Coach Marks (Feature Announcement)**:
   - Buka file `frontend/src/config/featuresWalkthrough.ts`.
   - Berikan atribut unik `id="tour-[nama-fitur]-[nama-elemen]"` pada elemen antarmuka frontend.
   - Daftarkan objek `FeatureAnnouncement` baru ke dalam array `FEATURE_ANNOUNCEMENTS` di posisi paling atas:
     - `id`: Format `feature-[nama-fitur]-[bulan-tahun]`.
     - `title`: Judul fitur yang informatif dan ramah pengguna.
     - `description`: Ringkasan fungsi dan manfaat fitur.
     - `details`: 2–4 poin keunggulan atau cara pemakaian fitur.
     - `requiredPermission`: Kode hak akses RBAC (misal `ISSUE:DELETE`, `GRN:VIEW`, dll.).
     - `targetTab`: Tab navigasi target di mana fitur berada.
     - `steps`: Urutan langkah penyorotan elemen (`targetSelector`, `title`, `description`, `position`).

2. **Penyusunan Walkthrough Teknis**:
   - Cantumkan rincian komponen yang dimodifikasi.
   - Cantumkan bukti pengujian dan verifikasi kompilasi status 0.
   - Sediakan panduan visual bagi tim operasional dan administrator sistem.

