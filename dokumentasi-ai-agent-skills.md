# Dokumentasi AI Agent Skills

## Tujuan Dokumen

Dokumen ini menjelaskan fungsi, peran, dan konteks penggunaan setiap
skill yang terlihat pada folder `.agents/skills`. Dokumentasi disusun
berdasarkan nama folder skill pada gambar yang diberikan.

> **Catatan penting:** Nama folder memberi petunjuk mengenai cakupan
> skill, tetapi belum menjelaskan instruksi internalnya secara lengkap.
> Karena isi `SKILL.md` masing-masing skill tidak disertakan, uraian di
> bawah merupakan penjelasan fungsional berdasarkan nama dan praktik
> umum pengembangan perangkat lunak. Untuk mengetahui aturan, workflow,
> dan batasan yang benar-benar diterapkan oleh tiap agent, periksa file
> `SKILL.md` di dalam folder skill terkait.

## Ringkasan Skill

  ----------------------------------------------------------------------------------
                           No. Nama Skill                      Fokus Utama
  ---------------------------- ------------------------------- ---------------------
                             1 `application-analysis`          Memahami kondisi,
                                                               struktur, dan
                                                               perilaku aplikasi
                                                               yang sudah ada

                             2 `code-refactoring`              Merapikan dan
                                                               meningkatkan kualitas
                                                               kode tanpa mengubah
                                                               perilaku

                             3 `database-integrity`            Menjaga konsistensi,
                                                               validitas, dan
                                                               keamanan data

                             4 `find-skills`                   Menemukan skill yang
                                                               tepat untuk kebutuhan
                                                               atau tugas tertentu

                             5 `framer-motion-animator`        Membuat animasi
                                                               antarmuka menggunakan
                                                               Framer Motion

                             6 `frontend-design`               Merancang dan
                                                               mengimplementasikan
                                                               tampilan frontend

                             7 `impact-analysis`               Menganalisis dampak
                                                               perubahan sebelum
                                                               implementasi

                             8 `impeccable`                    Meningkatkan mutu
                                                               visual dan detail
                                                               desain antarmuka

                             9 `improvement-documentation`     Mendokumentasikan
                                                               usulan, proses, dan
                                                               hasil improvement

                            10 `qa-regression-testing`         Menguji fitur dan
                                                               memastikan fitur lama
                                                               tidak rusak

                            11 `requirement-analysis`          Mengurai kebutuhan
                                                               menjadi spesifikasi
                                                               yang jelas

                            12 `security-code-review`          Meninjau kode untuk
                                                               menemukan risiko
                                                               keamanan

                            13 `system-architecture`           Merancang dan
                                                               mengevaluasi struktur
                                                               arsitektur sistem

                            14 `ui-ux-improvement`             Meningkatkan
                                                               kemudahan penggunaan
                                                               dan pengalaman
                                                               pengguna

                            15 `vercel-react-best-practices`   Menerapkan praktik
                                                               terbaik pengembangan
                                                               React

                            16 `web-design-guidelines`         Memeriksa kesesuaian
                                                               antarmuka dengan
                                                               pedoman desain web
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

## 1. `application-analysis`

**Fokus:** Analisis aplikasi yang sudah berjalan (*existing
application*).

### Fungsi

-   Memetakan struktur proyek, modul, halaman, komponen, dan dependensi.
-   Menelusuri alur kerja aplikasi dari sisi frontend hingga backend.
-   Memahami hubungan antara UI, API, business logic, dan database.
-   Mengidentifikasi pola implementasi, duplikasi, serta area yang
    berpotensi bermasalah.
-   Menyediakan gambaran kondisi awal sebelum perubahan dilakukan.

### Peran dalam workflow

Skill ini berperan sebagai tahap pengenalan dan investigasi. Agent
sebaiknya memahami cara kerja aplikasi terlebih dahulu sebelum
mengusulkan atau melakukan perubahan.

### Kapan digunakan?

-   Saat pertama kali menangani codebase yang belum dikenal.
-   Sebelum redesign atau improvement aplikasi.
-   Saat mencari penyebab suatu perilaku atau bug.
-   Saat ingin memahami alur transaksi dan keterkaitan antar-modul.

### Contoh prompt

> Analisis aplikasi yang sudah ada. Petakan struktur frontend, backend,
> API, database, serta alur transaksi utama. Jangan mengubah file apa
> pun. Sajikan temuan dan area yang perlu diperhatikan.

------------------------------------------------------------------------

## 2. `code-refactoring`

**Fokus:** Perbaikan struktur dan kualitas kode.

### Fungsi

-   Mengurangi duplikasi kode.
-   Memecah fungsi atau komponen yang terlalu besar.
-   Memperjelas penamaan variabel, fungsi, dan struktur folder.
-   Meningkatkan keterbacaan dan kemudahan pemeliharaan kode.
-   Menyederhanakan implementasi tanpa mengubah hasil atau perilaku
    aplikasi.

### Peran dalam workflow

Skill ini bertugas memperbaiki kualitas internal kode. Refactoring
idealnya tidak mengubah business logic, kontrak API, skema database,
maupun alur pengguna kecuali perubahan tersebut secara eksplisit
diminta.

### Kapan digunakan?

-   Ketika kode sulit dipahami atau dipelihara.
-   Ketika terdapat banyak kode berulang.
-   Ketika komponen atau fungsi terlalu kompleks.
-   Sebelum pengembangan fitur lanjutan yang membutuhkan struktur kode
    lebih sehat.

### Contoh prompt

> Refactor modul ini untuk meningkatkan keterbacaan dan maintainability.
> Pertahankan perilaku, business logic, kontrak API, dan output yang
> sekarang. Jelaskan perubahan yang dilakukan.

------------------------------------------------------------------------

## 3. `database-integrity`

**Fokus:** Konsistensi dan keutuhan data database.

### Fungsi

-   Meninjau relasi antartabel dan aturan referensial.
-   Memeriksa penggunaan primary key, foreign key, unique constraint,
    dan index.
-   Mengidentifikasi risiko data duplikat, data yatim (*orphan
    records*), atau nilai tidak valid.
-   Meninjau transaksi database dan potensi perubahan data yang tidak
    konsisten.
-   Mengevaluasi dampak perubahan model atau migrasi terhadap data yang
    sudah tersimpan.

### Peran dalam workflow

Skill ini menjadi penjaga integritas data. Perubahan pada aplikasi perlu
mempertimbangkan validitas data sebelum dan sesudah proses dijalankan.

### Kapan digunakan?

-   Saat mengubah schema atau relasi database.
-   Saat membuat fitur create, update, delete, atau import data.
-   Saat menggunakan Prisma atau ORM lain.
-   Saat menangani transaksi yang melibatkan beberapa tabel.
-   Saat mengevaluasi migrasi database.

### Contoh prompt

> Tinjau perubahan model Prisma dan relasi database ini. Identifikasi
> risiko terhadap integritas data, constraint, transaksi, dan data lama.
> Jangan jalankan migrasi sebelum analisis selesai.

------------------------------------------------------------------------

## 4. `find-skills`

**Fokus:** Menemukan skill yang relevan untuk suatu pekerjaan.

### Fungsi

-   Membantu mengidentifikasi skill yang sesuai dengan kebutuhan.
-   Mencari skill berdasarkan jenis tugas, misalnya analisis, UI,
    keamanan, atau testing.
-   Membantu menentukan kombinasi skill yang dapat digunakan dalam satu
    workflow.
-   Mengurangi penggunaan skill yang tidak relevan terhadap pekerjaan.

### Peran dalam workflow

Skill ini berperan sebagai pencari atau pengarah penggunaan skill. Ia
membantu menentukan kemampuan pendukung yang perlu dilibatkan sebelum
pekerjaan dimulai.

### Kapan digunakan?

-   Ketika belum mengetahui skill yang tepat untuk suatu tugas.
-   Ketika menangani pekerjaan lintas bidang.
-   Ketika ingin menyusun urutan penggunaan beberapa skill.
-   Ketika ingin mencari skill tambahan yang belum tersedia di proyek.

### Contoh prompt

> Saya ingin melakukan improvement pada halaman inventory tanpa mengubah
> business logic. Identifikasi skill yang paling relevan dari daftar
> yang tersedia dan jelaskan urutan penggunaannya.

------------------------------------------------------------------------

## 5. `framer-motion-animator`

**Fokus:** Animasi antarmuka menggunakan Framer Motion.

### Fungsi

-   Membuat animasi transisi antarhalaman atau komponen.
-   Menambahkan efek masuk dan keluar elemen.
-   Membuat interaksi seperti hover, tap, expand, collapse, dan modal
    transition.
-   Mengatur urutan animasi menggunakan konsep seperti variants dan
    stagger.
-   Membantu membuat gerakan UI terasa lebih halus dan responsif.

### Peran dalam workflow

Skill ini menangani aspek motion atau gerakan antarmuka. Animasi harus
mendukung pemahaman dan interaksi pengguna, bukan sekadar dekorasi.

### Kapan digunakan?

-   Saat membuat dashboard atau landing page yang lebih dinamis.
-   Saat menambahkan transisi modal, drawer, dropdown, atau tab.
-   Saat meningkatkan feedback visual pada tombol dan komponen
    interaktif.
-   Saat membangun micro-interactions.

### Contoh prompt

> Tambahkan animasi Framer Motion pada modal dan transisi konten
> halaman. Gunakan animasi yang halus, singkat, konsisten, dan tidak
> mengubah fungsi komponen.

------------------------------------------------------------------------

## 6. `frontend-design`

**Fokus:** Perancangan dan implementasi tampilan frontend.

### Fungsi

-   Menyusun layout halaman dan hierarki visual.
-   Menentukan komposisi komponen, tipografi, warna, jarak, dan ukuran.
-   Mengimplementasikan desain ke dalam komponen frontend.
-   Membuat tampilan yang konsisten dan responsif.
-   Menyesuaikan desain dengan kebutuhan serta karakter aplikasi.

### Peran dalam workflow

Skill ini berperan sebagai pelaksana desain pada sisi frontend, dari
konsep visual hingga implementasi komponen.

### Kapan digunakan?

-   Saat membuat halaman atau fitur frontend baru.
-   Saat membangun dashboard, tabel, form, navigasi, dan komponen UI.
-   Saat mengimplementasikan desain dari referensi.
-   Saat melakukan redesign tampilan yang sudah ada.

### Contoh prompt

> Rancang ulang tampilan halaman inventory agar lebih modern dan
> profesional. Pertahankan seluruh elemen, fungsi, data, dan alur yang
> sudah ada. Fokus pada layout, tipografi, warna, spacing, dan
> responsivitas.

------------------------------------------------------------------------

## 7. `impact-analysis`

**Fokus:** Analisis dampak dari suatu perubahan.

### Fungsi

-   Mengidentifikasi modul dan komponen yang terdampak.
-   Menelusuri dependensi langsung maupun tidak langsung.
-   Memperkirakan risiko terhadap fitur lain.
-   Mengidentifikasi perubahan yang diperlukan pada frontend, backend,
    API, dan database.
-   Menentukan area yang perlu diuji setelah perubahan.

### Peran dalam workflow

Skill ini berfungsi sebagai pemeriksa konsekuensi sebelum implementasi.
Tujuannya mengurangi efek samping dan mencegah perubahan kecil merusak
bagian aplikasi lain.

### Kapan digunakan?

-   Sebelum mengubah komponen yang digunakan banyak halaman.
-   Sebelum mengubah API atau model database.
-   Saat memperbaiki bug yang berpotensi memengaruhi modul lain.
-   Saat melakukan improvement pada aplikasi yang sudah berjalan.

### Contoh prompt

> Sebelum mengubah komponen ini, lakukan impact analysis. Daftar seluruh
> halaman, modul, API, dan model database yang mungkin terdampak.
> Berikan tingkat risiko serta rekomendasi pengujian.

------------------------------------------------------------------------

## 8. `impeccable`

**Fokus:** Penyempurnaan kualitas visual dan detail antarmuka.

### Fungsi

Secara umum, skill dengan fokus ini dapat digunakan untuk: -
Mengidentifikasi tampilan yang terlihat kurang rapi atau kurang
konsisten. - Menyempurnakan detail visual seperti alignment, spacing,
ukuran, kontras, dan tipografi. - Meningkatkan konsistensi
antar-komponen. - Mengurangi kesan UI yang generik atau belum matang. -
Memberikan perhatian pada detail desain yang memengaruhi persepsi
kualitas produk.

### Peran dalam workflow

Skill ini berperan sebagai penyempurna kualitas visual (*visual
polish*). Fokusnya lebih pada ketelitian dan kualitas hasil akhir
daripada perubahan struktur sistem.

### Kapan digunakan?

-   Setelah implementasi desain awal selesai.
-   Saat UI sudah berfungsi tetapi masih terlihat kurang profesional.
-   Saat melakukan final polishing sebelum aplikasi dirilis.
-   Saat ingin menyelaraskan detail visual antarhalaman.

### Contoh prompt

> Lakukan visual polish pada halaman ini. Perbaiki alignment, spacing,
> tipografi, kontras, konsistensi komponen, dan detail visual. Jangan
> mengubah fungsi, data, atau alur aplikasi.

------------------------------------------------------------------------

## 9. `improvement-documentation`

**Fokus:** Dokumentasi pekerjaan improvement.

### Fungsi

-   Mencatat kondisi sebelum perubahan.
-   Menjelaskan masalah atau alasan dilakukannya improvement.
-   Mendokumentasikan ruang lingkup dan rencana perubahan.
-   Mencatat file, komponen, atau modul yang diubah.
-   Menjelaskan hasil, risiko, pengujian, dan tindak lanjut.

### Peran dalam workflow

Skill ini berperan sebagai pencatat dan penyusun dokumentasi teknis agar
proses improvement dapat ditinjau, dipahami, dan dilanjutkan oleh
developer lain.

### Kapan digunakan?

-   Sebelum dan sesudah improvement.
-   Ketika perubahan menyentuh beberapa modul.
-   Saat membutuhkan catatan perubahan untuk tim.
-   Saat membuat laporan hasil pekerjaan atau handover.

### Keluaran yang dapat diminta

-   Ringkasan masalah.
-   Tujuan dan ruang lingkup.
-   Analisis kondisi awal.
-   Daftar perubahan.
-   Hasil pengujian.
-   Risiko dan rekomendasi lanjutan.

### Contoh prompt

> Buat dokumentasi improvement untuk pekerjaan ini. Sertakan kondisi
> awal, masalah, tujuan, file yang diubah, detail perubahan, hasil
> pengujian, risiko, dan rekomendasi berikutnya.

------------------------------------------------------------------------

## 10. `qa-regression-testing`

**Fokus:** Quality assurance dan pengujian regresi.

### Fungsi

-   Menyusun skenario pengujian berdasarkan kebutuhan dan alur aplikasi.
-   Memeriksa apakah fitur yang baru diubah berjalan sesuai harapan.
-   Memastikan fitur lama tetap berfungsi setelah perubahan.
-   Menguji validasi form, navigasi, hak akses, API, dan alur transaksi.
-   Mencatat hasil pengujian serta bug yang ditemukan.

### Peran dalam workflow

Skill ini berperan sebagai pemeriksa kualitas setelah implementasi.
Fokus regression testing adalah memastikan perubahan baru tidak
menimbulkan kerusakan pada fungsi yang sebelumnya sudah berjalan.

### Kapan digunakan?

-   Setelah bug fixing.
-   Setelah refactoring.
-   Setelah redesign UI.
-   Setelah perubahan API atau database.
-   Sebelum deployment atau release.

### Contoh prompt

> Susun dan jalankan pengujian regresi untuk modul inventory setelah
> perubahan ini. Uji alur utama dan fitur terkait. Laporkan skenario,
> hasil aktual, status lulus/gagal, dan bug yang ditemukan.

------------------------------------------------------------------------

## 11. `requirement-analysis`

**Fokus:** Analisis kebutuhan pengguna dan sistem.

### Fungsi

-   Mengurai permintaan pengguna menjadi kebutuhan yang spesifik.
-   Membedakan kebutuhan fungsional dan nonfungsional.
-   Mengidentifikasi aktor, input, output, aturan bisnis, dan kondisi
    khusus.
-   Menemukan kebutuhan yang belum jelas atau saling bertentangan.
-   Menyusun acceptance criteria sebagai acuan implementasi.

### Peran dalam workflow

Skill ini menjadi penghubung antara permintaan pengguna dan pekerjaan
teknis. Dengan requirement yang jelas, risiko salah implementasi dapat
dikurangi.

### Kapan digunakan?

-   Saat menerima permintaan fitur baru.
-   Saat melakukan perubahan pada fitur yang sudah ada.
-   Saat kebutuhan pengguna masih berupa penjelasan umum.
-   Sebelum membuat estimasi atau rencana pengerjaan.

### Contoh prompt

> Analisis permintaan fitur ini menjadi requirement yang terstruktur.
> Identifikasi aktor, alur utama, validasi, aturan bisnis, kondisi
> gagal, kebutuhan nonfungsional, dan acceptance criteria. Jangan mulai
> coding sebelum analisis selesai.

------------------------------------------------------------------------

## 12. `security-code-review`

**Fokus:** Pemeriksaan keamanan kode aplikasi.

### Fungsi

-   Meninjau validasi dan sanitasi input.
-   Mengidentifikasi risiko SQL injection, XSS, CSRF, dan kerentanan
    umum lain yang relevan.
-   Memeriksa autentikasi, otorisasi, dan kontrol akses.
-   Meninjau pengelolaan session, token, secret, serta konfigurasi
    sensitif.
-   Memeriksa risiko kebocoran data dan penanganan error.
-   Memberikan rekomendasi mitigasi berdasarkan tingkat risiko.

### Peran dalam workflow

Skill ini bertindak sebagai pemeriksa keamanan (*security reviewer*)
untuk menemukan potensi celah sebelum kode digunakan di lingkungan
produksi.

### Kapan digunakan?

-   Saat menambahkan endpoint API.
-   Saat membuat login, role, permission, dan pengelolaan user.
-   Saat menerima input dari pengguna.
-   Saat mengelola file upload atau data sensitif.
-   Sebelum deployment dan audit keamanan.

### Contoh prompt

> Lakukan security code review pada modul autentikasi dan API ini.
> Identifikasi kerentanan, lokasi masalah, tingkat risiko, skenario
> penyalahgunaan, dan rekomendasi perbaikan. Jangan mengungkap atau
> menyalin secret ke laporan.

------------------------------------------------------------------------

## 13. `system-architecture`

**Fokus:** Struktur dan rancangan arsitektur sistem.

### Fungsi

-   Memetakan hubungan antarbagian sistem.
-   Menentukan pembagian tanggung jawab frontend, backend, API, dan
    database.
-   Mengevaluasi pola arsitektur dan struktur modul.
-   Mengidentifikasi ketergantungan yang terlalu erat (*tight
    coupling*).
-   Mempertimbangkan skalabilitas, maintainability, performa, dan
    keamanan.
-   Memberikan rekomendasi struktur sistem untuk kebutuhan saat ini
    maupun pengembangan berikutnya.

### Peran dalam workflow

Skill ini berperan pada tingkat desain sistem secara keseluruhan. Ia
membantu memastikan solusi teknis sesuai dengan kebutuhan dan tidak
menimbulkan kompleksitas yang tidak perlu.

### Kapan digunakan?

-   Saat merancang aplikasi baru.
-   Saat melakukan perubahan arsitektur aplikasi lama.
-   Saat memisahkan modul atau service.
-   Saat mengevaluasi struktur proyek yang semakin besar.
-   Saat merencanakan integrasi sistem.

### Contoh prompt

> Evaluasi arsitektur aplikasi saat ini. Petakan frontend, backend, API,
> database, dan dependensinya. Identifikasi bottleneck serta risiko
> maintainability, lalu berikan rekomendasi tanpa mengubah sistem.

------------------------------------------------------------------------

## 14. `ui-ux-improvement`

**Fokus:** Peningkatan User Interface dan User Experience.

### Fungsi

-   Mengevaluasi kemudahan pengguna dalam menyelesaikan tugas.
-   Menemukan navigasi atau alur interaksi yang membingungkan.
-   Meningkatkan keterbacaan, konsistensi, dan feedback antarmuka.
-   Menyempurnakan form, tabel, filter, pencarian, dialog, dan navigasi.
-   Mempertimbangkan aksesibilitas dan responsivitas.
-   Mengurangi langkah atau hambatan yang tidak diperlukan dalam
    pengalaman pengguna.

### Peran dalam workflow

Skill ini berperan sebagai evaluator pengalaman pengguna sekaligus
pemberi rekomendasi perbaikan UI/UX. Fokusnya bukan hanya tampilan yang
menarik, tetapi juga kemudahan dan kejelasan penggunaan.

### Kapan digunakan?

-   Saat pengguna kesulitan memahami alur aplikasi.
-   Saat dashboard atau form terasa rumit.
-   Saat ingin meningkatkan usability aplikasi internal.
-   Saat melakukan evaluasi tampilan berdasarkan kebutuhan pengguna.

### Contoh prompt

> Evaluasi UI/UX halaman ini dari sudut pandang pengguna. Identifikasi
> masalah usability dan berikan rekomendasi perbaikan. Pertahankan
> seluruh fungsi, data, dan alur bisnis yang sudah ada.

------------------------------------------------------------------------

## 15. `vercel-react-best-practices`

**Fokus:** Praktik terbaik pengembangan React.

### Fungsi

Secara umum, skill ini ditujukan untuk membantu penerapan praktik React
yang baik, seperti: - Pengelolaan komponen dan pemisahan tanggung
jawab. - Penggunaan hooks secara tepat. - Pengelolaan state dan props. -
Menghindari render atau perhitungan yang tidak diperlukan. - Optimasi
pemuatan komponen dan aset. - Memperhatikan performa aplikasi React. -
Mengikuti pola implementasi yang mudah dipelihara.

### Peran dalam workflow

Skill ini berperan sebagai panduan kualitas implementasi React. Namanya
mengindikasikan orientasi pada praktik React yang diasosiasikan dengan
ekosistem Vercel; cakupan aturan pastinya tetap perlu diverifikasi dari
isi skill.

### Kapan digunakan?

-   Saat membuat atau memperbaiki komponen React.
-   Saat melakukan review kode frontend.
-   Saat mengoptimalkan performa.
-   Saat memperbaiki pengelolaan state dan hooks.
-   Saat melakukan refactoring aplikasi React.

### Contoh prompt

> Tinjau implementasi React ini berdasarkan praktik terbaik React.
> Periksa struktur komponen, hooks, state, rendering, dan performa.
> Berikan rekomendasi yang sesuai dengan arsitektur proyek yang sudah
> ada.

------------------------------------------------------------------------

## 16. `web-design-guidelines`

**Fokus:** Evaluasi kepatuhan desain dan implementasi antarmuka web
terhadap pedoman desain.

### Fungsi

-   Memeriksa konsistensi layout dan komponen.
-   Meninjau keterbacaan teks dan hierarki informasi.
-   Memeriksa kontras warna dan kejelasan elemen interaktif.
-   Mengevaluasi responsivitas pada berbagai ukuran layar.
-   Meninjau aspek aksesibilitas dasar.
-   Mengidentifikasi pola UI yang membingungkan atau tidak konsisten.

### Peran dalam workflow

Skill ini berperan sebagai pemeriksa kualitas desain berbasis pedoman.
Ia membantu menemukan ketidaksesuaian yang mungkin terlewat saat proses
implementasi.

### Kapan digunakan?

-   Saat melakukan audit tampilan web.
-   Setelah implementasi halaman frontend.
-   Sebelum release atau demo aplikasi.
-   Saat ingin memastikan konsistensi antarmuka di berbagai halaman dan
    perangkat.

### Contoh prompt

> Audit halaman ini berdasarkan web design guidelines. Periksa
> responsivitas, aksesibilitas, hierarki visual, konsistensi komponen,
> dan usability. Sajikan temuan berdasarkan tingkat prioritas tanpa
> mengubah kode terlebih dahulu.

------------------------------------------------------------------------

## Rekomendasi Urutan Penggunaan Skill

Untuk pekerjaan improvement atau redesign aplikasi yang sudah berjalan,
skill sebaiknya digunakan secara bertahap. Tidak semua skill harus
dipanggil pada setiap pekerjaan; pilih sesuai ruang lingkup perubahan.

  --------------------------------------------------------------------------------
                         Tahap Skill                         Tujuan
  ---------------------------- ----------------------------- ---------------------
                             1 `find-skills`                 Menentukan skill yang
                                                             relevan

                             2 `application-analysis`        Memahami kondisi dan
                                                             cara kerja aplikasi

                             3 `requirement-analysis`        Memastikan kebutuhan
                                                             dan batasan perubahan

                             4 `impact-analysis`             Mengetahui area yang
                                                             terdampak

                             5 `system-architecture`         Mengevaluasi
                                                             konsekuensi pada
                                                             struktur sistem bila
                                                             diperlukan

                             6 `frontend-design` /           Menyusun dan
                               `ui-ux-improvement`           menerapkan perbaikan
                                                             antarmuka

                             7 `framer-motion-animator`      Menambahkan animasi
                                                             jika memang
                                                             dibutuhkan

                             8 `impeccable` /                Melakukan
                               `web-design-guidelines`       penyempurnaan dan
                                                             audit visual

                             9 `code-refactoring`            Merapikan kode bila
                                                             diperlukan

                            10 `database-integrity`          Memeriksa keamanan
                                                             dan konsistensi
                                                             perubahan data bila
                                                             relevan

                            11 `security-code-review`        Meninjau keamanan
                                                             perubahan

                            12 `qa-regression-testing`       Memastikan fitur baru
                                                             dan fitur lama tetap
                                                             berjalan

                            13 `improvement-documentation`   Mendokumentasikan
                                                             perubahan dan hasil
                                                             pekerjaan
  --------------------------------------------------------------------------------

## Rekomendasi Pemilihan Berdasarkan Jenis Pekerjaan

  -----------------------------------------------------------------------
  Jenis pekerjaan                     Skill yang diprioritaskan
  ----------------------------------- -----------------------------------
  Memahami codebase baru              `application-analysis`,
                                      `system-architecture`,
                                      `find-skills`

  Menambahkan fitur baru              `requirement-analysis`,
                                      `impact-analysis`,
                                      `application-analysis`,
                                      `qa-regression-testing`

  Redesign UI tanpa mengubah logic    `application-analysis`,
                                      `impact-analysis`,
                                      `frontend-design`,
                                      `ui-ux-improvement`,
                                      `web-design-guidelines`,
                                      `qa-regression-testing`

  Memoles tampilan                    `impeccable`,
                                      `web-design-guidelines`,
                                      `frontend-design`

  Refactoring kode                    `application-analysis`,
                                      `impact-analysis`,
                                      `code-refactoring`,
                                      `qa-regression-testing`

  Perubahan database                  `requirement-analysis`,
                                      `impact-analysis`,
                                      `database-integrity`,
                                      `security-code-review`,
                                      `qa-regression-testing`

  Audit keamanan                      `security-code-review`,
                                      `database-integrity`,
                                      `system-architecture`

  Optimasi React                      `vercel-react-best-practices`,
                                      `code-refactoring`,
                                      `qa-regression-testing`

  Menambahkan animasi                 `frontend-design`,
                                      `framer-motion-animator`,
                                      `web-design-guidelines`

  Dokumentasi improvement             `improvement-documentation`,
                                      didukung hasil
                                      `application-analysis` dan
                                      `qa-regression-testing`
  -----------------------------------------------------------------------

## Catatan Penggunaan di Antigravity

1.  **Keberadaan folder tidak otomatis menjamin skill dipakai.**
    Mekanisme pemuatan skill bergantung pada konfigurasi dan dukungan
    Antigravity serta format file skill yang digunakan.
2.  **Periksa instruksi asli.** Buka `SKILL.md` di masing-masing folder
    untuk mengetahui deskripsi, aturan, batasan, dan workflow
    sebenarnya.
3.  **Sebutkan skill dalam prompt bila ingin mengarahkan pekerjaan.**
    Contohnya: "Gunakan `application-analysis` dan `impact-analysis`
    terlebih dahulu, lalu tunggu persetujuan sebelum mengubah kode."
4.  **Tetapkan batasan perubahan.** Untuk aplikasi existing, tuliskan
    dengan jelas apakah agent boleh mengubah UI saja, logic, API, schema
    database, atau semuanya.
5.  **Pisahkan analisis dan eksekusi.** Untuk perubahan berisiko, minta
    agent menganalisis dan menyusun rencana terlebih dahulu.
    Implementasi dilakukan setelah rencana disetujui.
6.  **Lakukan pengujian setelah perubahan.** Gunakan pengujian regresi
    dan pemeriksaan manual untuk memastikan fungsi lama tidak terdampak.

## Penutup

Enam belas skill pada daftar ini mencakup area analisis aplikasi,
requirement, arsitektur, frontend, UI/UX, kualitas kode, database,
keamanan, testing, dan dokumentasi. Kombinasi skill yang tepat dapat
membantu pekerjaan pengembangan menjadi lebih terarah, tetapi hasil
akhirnya tetap bergantung pada isi instruksi setiap skill, konteks
codebase, dan batasan yang diberikan dalam prompt.

**Saran:** Jadikan dokumen ini sebagai panduan awal. Setelah isi
`SKILL.md` dari seluruh folder tersedia, dokumentasi dapat diperbarui
agar setiap uraian benar-benar sesuai dengan instruksi skill yang
terpasang, bukan hanya interpretasi berdasarkan nama folder.
