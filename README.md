# Pangestu Anton Widodo - Personal Portfolio

## Deskripsi

Website portfolio pribadi berbasis HTML, CSS, dan JavaScript untuk menampilkan profil, pendidikan, pengalaman, skill, project, dan kontak.

## Fitur

- Navigasi sticky dengan menu mobile
- Hero section dengan foto dan ringkasan singkat
- Timeline experience dengan search dan filter
- Section skill dan project
- Tombol kontak ke LinkedIn, GitHub, Instagram, dan WhatsApp
- Modal case study project

## Struktur File

- `index.html` - struktur utama halaman
- `experience-archive.html` - arsip pengalaman sekolah
- `css/` - folder file stylesheet (`styles.css`)
- `js/` - folder skrip logika halaman (`config.js`, `script.js`)
- `assets/` - gambar dan aset pendukung
- `love/` - halaman galeri momen pribadi (`/love`)
- `robots.txt` - instruksi crawl untuk search engine
- `sitemap.xml` - daftar URL untuk Google
- `site.webmanifest` - konfigurasi web app manifest

## SEO untuk Google

File berikut sudah disiapkan agar website lebih mudah diindeks oleh Google:

- `robots.txt`
- `sitemap.xml`
- metadata Open Graph dan Twitter Card di `index.html`
- data terstruktur JSON-LD di `index.html`

### Langkah sebelum deploy

1. Pastikan semua URL sudah memakai `https://antonique.web.id/`.
2. Pastikan website sudah bisa diakses publik via HTTPS.
3. Upload file statis ke hosting.
4. Buka Google Search Console.
5. Tambahkan properti domain atau URL prefix website.
6. Verifikasi kepemilikan domain.
7. Submit `https://domain-asli-kamu/sitemap.xml` pada menu Sitemaps.
8. Tunggu Google crawl ulang halaman.

### Hal yang perlu dicek

- `robots.txt` dapat diakses di `https://antonique.web.id/robots.txt`
- `sitemap.xml` dapat diakses di `https://antonique.web.id/sitemap.xml`
- tag `<title>` dan `<meta name="description">` sudah relevan
- gambar utama punya `alt` text
- struktur heading dari `h1` ke `h2` konsisten

## Cara Menjalankan

1. Buka folder project ini.
2. Jalankan `index.html` langsung di browser.
3. Jika ingin pakai local server, gunakan Live Server atau server statis lain.

## Interaksi JavaScript

`js/script.js` menangani tema lintas halaman dan tab, mengikuti tema sistem sampai pengguna memilih tema sendiri, navigasi aktif, menu mobile dengan Escape, indikator progres scroll, reveal saat elemen terlihat, serta animasi masuk kartu dan modal. Foto profil dan orbit mendapat efek miring ringan mengikuti kursor pada perangkat dengan pointer presisi. Smooth scroll, reveal, hover, dan animasi orbit sebelumnya dipertahankan. Efek menghormati `prefers-reduced-motion`; konten tetap terlihat ketika JavaScript tidak berjalan. `css/interactions.css` memakai token warna yang sudah ada di tiap halaman.

Event scroll digabung dalam satu listener pasif dengan `requestAnimationFrame`. Posisi bagian navigasi dihitung ulang ketika layout berubah, dan SVG yang sudah dirender tidak dibuat ulang. Galeri `/love` memakai kontrol tema yang sama, mengembalikan fokus setelah modal ditutup, membatasi waktu tunggu data, serta menyediakan fallback dan tombol coba lagi.

`/schedule` mengingat pilihan kampus dan tampilan secara lokal. Status kuliah yang berlangsung serta sesi berikutnya mengikuti Asia/Jakarta, diperbarui pada pergantian menit tanpa merender ulang seluruh jadwal. Timer berhenti saat tab tersembunyi dan dilanjutkan saat halaman aktif kembali. Preferensi yang rusak atau penyimpanan yang diblokir tidak menghalangi akses jadwal.

## Jadwal perkuliahan

Halaman tersembunyi tersedia di `https://antonique.web.id/schedule`, tanpa tautan di portofolio atau entri sitemap. Metadata `noindex, nofollow` meminta mesin pencari untuk tidak mengindeksnya. Halaman tetap dapat dibuka siapa pun yang mengetahui URL, seperti `/love`.

- `schedule/index.html`: halaman native dengan komponen dan token dari `css/styles.css`.
- `schedule/data.mjs`: seluruh data ITERA dan UNILA. Hari memakai angka 1 (Senin) sampai 7 (Minggu), waktu `HH:mm` dalam WIB, `null` untuk ruangan yang belum tersedia, dan array `courses` untuk sesi gabungan.
- `schedule/utils.mjs`: perhitungan minggu Asia/Jakarta dan benturan waktu.
- `schedule/app.mjs` dan `schedule/styles.css`: interaksi serta layout khusus halaman.
- `tests/schedule.test.mjs`: pengujian data, zona waktu, benturan, dan rute tersembunyi.

Jadwal ITERA milik Pangestu Anton, dan UNILA milik Aura Leviona. Panel **Waktu bersama** membandingkan kedua jadwal pada hari yang dipilih, menampilkan garis waktu kuliah dan jeda yang sama minimal 30 menit dalam rentang 07.00-21.00 WIB. Sesi yang bertumpang tindih digabung sebelum menghitung jeda; hasil hanya berdasarkan jadwal kuliah, tanpa asumsi kegiatan lain atau waktu perjalanan. Bagian **Intip jeda seminggu** menampilkan jeda terpanjang setiap hari.

Jalankan lewat server HTTP, misalnya `python -m http.server 4173`, lalu buka `/schedule/`. Modul JavaScript memerlukan HTTP, bukan membuka file HTML langsung.

Tidak ada framework, dependency runtime tambahan, atau langkah kompilasi/build. Pemeriksaan dapat dijalankan dengan Node.js dan alat pengembangan sementara melalui npm:

```sh
node --test tests/schedule.test.mjs
npx --yes --package eslint eslint --config schedule/eslint.config.mjs schedule/*.mjs js/*.js love/app.js tests/schedule.test.mjs
npx --yes --package typescript tsc --allowJs --checkJs --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext schedule/data.mjs schedule/utils.mjs schedule/app.mjs js/script.js love/app.js
```

Vercel menggunakan `vercel.json` untuk me-rewrite `/schedule` dan `/schedule/` ke `/schedule/index.html`, sehingga akses langsung dan refresh tidak bergantung pada navigasi klien. Pertahankan konfigurasi proyek statis yang ada; tidak ada environment variable atau backend baru.

## Design & Pembuatan

- Desain dasar website ini berasal dari Google Stitch.
- Implementasi dan generasi aset/penyesuaian dilakukan menggunakan Google Antigravity melalui MCP.

## Catatan

- Website ini bersifat statis, tidak memakai backend.
- Konten profil, portofolio, dan CV dipertahankan sesuai data yang sudah ada.

## Teknologi

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Material Symbols
