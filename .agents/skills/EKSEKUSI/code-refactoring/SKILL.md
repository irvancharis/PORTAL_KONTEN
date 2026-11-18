---
name: code-refactoring
description: Use when restructuring, modernizing, or simplifying existing code without altering its external behavior (preserving functionality, test coverage, and safety).
---

# Code Refactoring Skill

Gunakan skill ini untuk merapikan, memodernisasi, dan menghilangkan duplikasi kode tanpa mengubah perilaku fungsional yang sudah berjalan.

## 1. Aturan Emas Refactoring (Preserve External Behavior)
1. **Langkah Inkremental & Aman**:
   - Lakukan refactor dalam potongan-potongan kecil yang dapat dibatalkan (*reversible*).
   - Jangan pernah mencampur refactoring struktur kode dengan penambahan fitur bisnis baru dalam satu langkah.
2. **Eliminasi Kode Duplikat (DRY)**:
   - Satukan logika berulang (seperti ekstraksi catatan format token `[SHIFT:...]`, fungsi kalkulasi pagu, atau validasi format form) ke dalam utility terpusat.
3. **Kerapian TypeScript**:
   - Hindari penggunaan tipe `any` tanpa alasan jelas; definisikan `interface` atau `type` yang ketat.
   - Bersihkan unused imports dan unused variables sebelum commit.
4. **Validasi Kompilasi**:
   - Setiap refactoring wajib diakhiri dengan pengujian kompilasi backend (`tsc`) dan frontend (`tsc -b && vite build`) dengan kode keluar status 0 (Zero Errors).

