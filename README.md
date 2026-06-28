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
- `styles.css` - styling dan layout
- `script.js` - interaksi halaman
- `assets/` - gambar dan aset pendukung
- `robots.txt` - instruksi crawl untuk search engine
- `sitemap.xml` - daftar URL untuk Google

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
