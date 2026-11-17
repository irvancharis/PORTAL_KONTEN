---
name: ui-ux-improvement
description: Use when polishing web UI components, forms, tables, modals, interactive filters, typography, and responsive ergonomics in React and Tailwind CSS.
---

# UI/UX Improvement Skill

Skill ini menyinergikan prinsip **`frontend-design`**, **`web-design-guidelines`**, dan **`impeccable`** untuk antarmuka sistem enterprise inventaris suku cadang.

## 1. Standar Ergonomi Antarmuka
1. **Modal Dialog (Operate Mode)**:
   - Header gelap kontras (`bg-slate-900`) dengan ikon identitas modul, status badge, dan tombol tutup (Esc/X).
   - Lebar proporsional (`max-w-2xl` hingga `max-w-4xl`) agar rincian tabel part tidak sesak.
   - Ringkasan metadata dalam kartu grid (Tanggal, Aktor, Lokasi Bin, Total Qty).
   - Tombol aksi primer di pojok kanan bawah dengan label yang eksplisit (misal "Konfirmasi Hapus", bukan "OK").
2. **Data Tables (`DataTable.tsx`)**:
   - Pola baris selang-seling halus (*zebra striping*) dan efek hover lembut.
   - Angka kuantitas dan saldo rata-kanan (*tabular-nums*).
   - Indikator status berupa pill badge semantik (Hijau: Sukses/Accepted, Kuning: Warning/Hold/Pending, Merah: Bahaya/Rejected/Delete).
3. **Filter Bar & Form**:
   - Field pencarian dengan ikon kaca pembesar dan focus ring yang lembut sesuai warna tema modul.
   - Dropdown filter terpadu (Periode Bulan & Tahun) dengan tombol shortcut "Bulan Ini" dan "Reset Filter".

## 2. Aksesibilitas & Tipografi
- Kontras teks rasio minimal 4.5:1.
- Font monospaced (`font-mono`) hanya digunakan untuk data teknis: Nomor Form, SKU, No. Seri, Kode Bin, UUID, dan Waktu.

