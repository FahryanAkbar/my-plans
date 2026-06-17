# Notion Clone — Prototype

Notion Clone adalah prototipe aplikasi catatan/produktivitas yang meniru beberapa konsep dasar Notion, dibuat sebagai proyek percobaan untuk mempelajari arsitektur aplikasi modern dengan Next.js dan Convex sebagai backend.

**Tujuan proyek**: menyediakan kerangka kerja (starter) berisi UI komponen, rute autentikasi, template pemasaran, dan integrasi Convex untuk logika backend ringan.

## Fitur (ringkas)

- Template pemasaran (landing page) dan komponen UI terstruktur.
- Halaman autentikasi: register & login (lihat `app/(auth)`).
- Struktur komponen yang dapat digunakan ulang di `components/`.
- Integrasi backend ringan menggunakan Convex (folder `convex/`).
- Styling menggunakan PostCSS / konfigurasi global di `app/globals.css`.

## Teknologi

- Next.js 13 (App Router)
- TypeScript
- Convex (backend)
- PostCSS / CSS global
- React + komponen tersusun (components/)

## Mulai cepat (development)

1. Pasang dependensi:

```bash
npm install
# atau: pnpm install
```

2. Jalankan server development:

```bash
npm run dev
# atau: pnpm dev
```

3. Buka http://localhost:3000 di browser.

Catatan: jika Anda menggunakan Convex remote atau lokal, pastikan konfigurasi Convex tersedia di folder `convex/` dan ikuti petunjuk di `convex/README.md` untuk menyiapkan environment.

## Struktur penting

- `app/` — rute aplikasi (termasuk area `(auth)`, marketing, dan halaman utama)
- `components/` — atoms, molecules, organisms, templates
- `convex/` — kode backend dan konfigurasi Convex
- `public/` — aset statis

## Kontribusi

Semua kontribusi diterima. Untuk perubahan besar, silakan buka issue terlebih dahulu untuk mendiskusikan rancangan. Buat pull request dengan deskripsi perubahan dan langkah pengujian singkat.

## Lisensi

Periksa file `LICENSE` di repositori ini. Jika tidak ada, tambahkan lisensi yang sesuai sebelum penggunaan publik.

---