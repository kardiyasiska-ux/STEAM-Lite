# Welcome to my Axios App 👋

AxiosApp adalah aplikasi website/mobile berbasis **Expo Router** dan **React Native Web** untuk layanan **Pojok Malam Catering**. Aplikasi ini menyediakan halaman publik untuk melihat informasi catering, menu, paket, galeri, testimoni, kontak, serta dashboard untuk pengelolaan data oleh admin/customer yang sudah login.

## Anggota Tim dan Pembagian Tugas

| Anggota | Peran | Tugas Utama | Tanggung Jawab Demo |
| --- | --- | --- | --- |
| Anggota 1 - Kardiya Siska Wijaya | Frontend & Axios Specialist | Merancang seluruh UI/UX aplikasi dan bertanggung jawab penuh atas integrasi Axios untuk komunikasi dengan API eksternal. | Menjelaskan desain UI dan mekanisme penarikan data dari API menggunakan Axios melalui 2 fitur. |
| Anggota 2 -  M. Kemal Navis Hidayatullah | Backend, State & Firebase Specialist | Mengelola logika state aplikasi dan bertanggung jawab penuh atas seluruh integrasi layanan Firebase. | Menjelaskan manajemen data lokal aplikasi dan arsitektur Firebase melalui 1 fitur utama serta setup Firebase. |

## Penjelasan Singkat Aplikasi

Aplikasi STEAM-Lite merupakan website tiruan dari platform Steam yang digunakan untuk menampilkan katalog game secara online, di mana pengguna dapat melihat daftar game, detail informasi seperti deskripsi, genre, dan harga, serta melakukan pencarian berdasarkan judul atau kategori tertentu, sementara pada sisi admin tersedia fitur pengelolaan data game seperti menambah, mengubah, dan menghapus informasi game melalui dashboard, dengan sistem yang dibangun menggunakan integrasi Axios untuk pengambilan data API dan Firebase sebagai backend untuk autentikasi serta penyimpanan data sehingga aplikasi dapat berjalan secara dinamis, responsif, dan menyerupai sistem katalog digital modern.

## Teknologi utama yang digunakan:

- **React Native / Expo Router** untuk routing berbasis file dan pengembangan aplikasi mobile/web.
- **React Native Web** agar aplikasi dapat berjalan di platform web dan mobile secara bersamaan.
- **Axios** untuk melakukan request dan pengambilan data dari API eksternal.
- **Firebase Authentication** untuk proses login, register, dan manajemen sesi pengguna.
- **Cloud Firestore** sebagai database utama untuk menyimpan data game, kategori, dan data user.
- **Firebase Storage** untuk penyimpanan aset seperti gambar game dan banner.
- **State Management (useState, useEffect)** untuk pengelolaan data lokal pada sisi frontend.

## Daftar API yang Digunakan

| API / Layanan | Fungsi |
| --- | --- |
| `https://store.steampowered.com/api/featuredcategories?cc=id&l=indonesian` | Mengambil data daftar game menggunakan Axios. |
| Firebase Authentication | Mengelola login, register, dan logout pengguna. |
| Cloud Firestore | Menyimpan data game, kategori, dan data pengguna secara realtime. |
| Firebase Storage | Menyimpan gambar cover game dan aset visual lainnya. |

## 3 Fitur Utama untuk Demo

1. **Halaman Daftar Game (API Integration)**
   - Menampilkan daftar game dari API menggunakan Axios.
   - Data di-render dalam bentuk card game (judul, genre, harga).
   - Mendukung fitur pencarian game.
     
2. **Detail Game Page**
   - Menampilkan detail lengkap game (deskripsi, rating, genre, gambar).
   - Data diambil dari API atau Firestore berdasarkan ID game.
   - User dapat melihat informasi lengkap sebelum eksplorasi lebih lanjut.

3. **Dashboard Admin (Firebase CRUD)**
   - Admin dapat menambah, mengedit, dan menghapus data game.
   - Data disimpan di Cloud Firestore.
   - Perubahan data langsung realtime tanpa refresh (onSnapshot).

## Pembagian Fokus Presentasi

### Anggota 1: Frontend & Axios Specialist

Fokus penjelasan:

- Desain UI/UX Steam-Lite.
- Struktur halaman utama (Home, List Game, Detail Game).
- Komponen UI seperti GameCard, SearchBar, Navbar.
- Integrasi Axios di `services/menuService.ts`.
- Implementasi Axios untuk mengambil data game dari API.
- Menjelaskan alur tampilan data dari API ke UI.

### Anggota 2: Backend, State & Firebase Specialist

Fokus penjelasan:

- Konfigurasi Firebase project.
- Authentication (login, register, logout).
- Firestore untuk CRUD data game.
- Storage untuk gambar game.
- Manajemen data admin dashboard.
- Realtime update data menggunakan listener Firestore.

## Cara Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run web
```

atau:

```bash
npx expo start
```* directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

