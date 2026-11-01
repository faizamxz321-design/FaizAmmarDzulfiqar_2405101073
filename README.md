# Pengumpulan UTS Pemrograman Web Dasar

## Identitas Mahasiswa

- Nama: Faiz Ammar Dzulfiqar
- NIM: 2405101073
- Kelas: 5E
- Program Studi: Teknik Informatika
- Mata Kuliah: Pemrograman Web Dasar
- Tahun Akademik: 2026

## Deskripsi

Repository ini berisi source code, dokumentasi hasil pengerjaan Ujian Tengah Semester (UTS)
mata kuliah Pemrograman Web Dasar.

## Deskripsi Pengerjaan UTS

Aplikasi yang dibuat adalah **StokKu**, sebuah sistem informasi pengelolaan stok barang berbasis website.
StokKu dirancang untuk membantu pemilik usaha kecil mengganti pencatatan stok manual yang rawan salah hitung
dengan pencatatan digital yang rapi, mudah dicari, dan mudah dilaporkan.

Permasalahan yang diselesaikan:

| Masalah | Solusi pada StokKu |
|---|---|
| Pencatatan stok manual rawan salah hitung | Data barang dan stok dikelola melalui website |
| Sulit mengetahui barang yang hampir habis | Dashboard menampilkan peringatan stok minimum |
| Riwayat barang masuk dan keluar tidak tersusun | Setiap perubahan stok dicatat sebagai transaksi |
| Pencarian informasi barang lambat | Fitur pencarian dan filter nama atau kategori |
| Rekap laporan stok dilakukan manual | Laporan stok per periode dan kategori |

Sesuai target UTS, aplikasi ini mencakup **frontend** yang dibuat dengan HTML, CSS, dan JavaScript murni
(tanpa framework): dashboard, tabel barang, form tambah/ubah, pencarian, dan tampilan laporan.
Data disimpan sementara di `localStorage` browser sebagai simulasi database. Struktur datanya mengikuti
rancangan tabel `users`, `categories`, `items`, dan `stock_transactions` agar dapat dilanjutkan dengan
backend PHP dan database MySQL pada tahap UAS.

Teknologi yang digunakan: HTML5, CSS3 (CSS Grid, Flexbox, responsif), dan JavaScript (ES6+).

## Fitur yang Diimplementasikan

1. **Login dan logout admin** (FR-01): halaman aplikasi hanya dapat diakses setelah login.
2. **Dashboard** (FR-02, FR-12): jumlah barang, stok menipis, ringkasan barang masuk dan keluar bulan ini,
   grafik pergerakan stok 7 hari, dan daftar barang yang perlu dipesan ulang.
3. **Data barang** (FR-03 s.d. FR-06): tabel barang dengan pencarian, filter kategori, kondisi stok, dan status,
   pengurutan kolom, form tambah dan ubah barang dengan validasi, serta menonaktifkan atau mengaktifkan barang.
4. **Kategori barang** (FR-07): tambah, ubah, dan nonaktifkan kategori.
5. **Stok masuk** (FR-08): mencatat penambahan stok beserta tanggal dan keterangan sumber.
6. **Stok keluar** (FR-09, FR-10): mencatat pengurangan stok dan menolak transaksi jika jumlah melebihi stok
   sehingga stok tidak pernah negatif.
7. **Riwayat transaksi** (FR-11): daftar tanggal, barang, jenis, jumlah, admin, dan keterangan dengan pencarian
   serta filter jenis dan tanggal.
8. **Laporan stok** (FR-13): filter periode dan kategori, menampilkan stok awal, masuk, keluar, stok akhir,
   dan nilai persediaan; dapat dicetak dan diunduh sebagai CSV.
9. **Profil admin** (FR-14): ubah nama, username, dan kata sandi dengan validasi.

## Struktur Folder

- `uts/`: Source code dan file pendukung UTS.
  - `index.html`: struktur halaman (login, kerangka aplikasi, dialog form).
  - `style.css`: seluruh gaya tampilan, termasuk tampilan responsif dan cetak.
  - `script.js`: logika aplikasi (data, routing halaman, CRUD, transaksi stok, laporan).
- `uts/screenshots/`: Bukti visual hasil implementasi.

## Cara Menjalankan Aplikasi

Aplikasi ini hanya memakai HTML, CSS, dan JavaScript sehingga tidak perlu instalasi apa pun.

1. Unduh atau clone repository ini.
2. Buka folder `uts/`.
3. Buka file `index.html` dengan browser modern (Chrome, Edge, Firefox, atau Safari).
4. Login dengan akun demo:
   - Username: `admin`
   - Kata sandi: `admin123`
5. Jelajahi menu di sisi kiri: Dashboard, Data Barang, Kategori, Stok Masuk, Stok Keluar, Riwayat, Laporan, dan Profil.

Catatan:
- Data tersimpan di browser (`localStorage`). Untuk mengembalikan data contoh awal, buka menu **Profil**
  lalu pilih **Kembalikan ke data contoh**.
- Font dimuat dari Google Fonts, sehingga tampilan terbaik saat terhubung internet. Tanpa internet, font
  bawaan sistem dipakai dan semua fitur tetap berjalan.

## Referensi

- MDN Web Docs: HTML, CSS, JavaScript, Web Storage API (`localStorage`), dan elemen `<dialog>`. https://developer.mozilla.org
- Google Fonts: Bricolage Grotesque dan Figtree. https://fonts.google.com
- Dokumen analisa project: `Analisa_Project_StokKu.xlsx` (analisis permasalahan, kebutuhan fungsional,
  rancangan halaman, dan rancangan database).
