# Dokumentasi Flowchart - Sistem Peminjaman Alat Musik

Dokumen ini menjelaskan alur kerja utama dalam sistem peminjaman alat musik, yang meliputi proses Login, Peminjaman (Peminjaman), dan Pengembalian (Pengembalian).

---

## 📊 Ikhtisar Visual (Infographic)
Sebuah infografis flowchart profesional telah dibuat untuk referensi cepat:
![Flowcharts Infographic](file:///C:/Users/Lenovo%20X1%20Carbon/.gemini/antigravity/brain/69e29d59-8997-4415-acce-551a31d5a2c2/music_rental_flowcharts_1774970290817.png)

---

## 🔐 1. Alur Login (Login Flowchart)
Proses dimulai saat pengguna memasukkan kredensial untuk mengakses sistem.

```mermaid
graph TD
    A[Mulai] --> B[Masukkan Username & Password]
    B --> C{Validasi Sistem}
    C -- Tidak Valid --> D[Tampilkan Pesan Error]
    D --> B
    C -- Valid --> E[Set Session / JWT Token]
    E --> F{Cek Role}
    F -- Admin/Petugas --> G[Dashboard Admin]
    F -- User --> H[Katalog Alat Musik]
    G --> I[Selesai]
    H --> I
```

---

## 🎸 2. Alur Peminjaman (Rental Flowchart)
Proses dari memilih alat musik hingga mendapatkan persetujuan dari admin.

```mermaid
graph TD
    A[Mulai] --> B[Jelajahi Katalog Instrumen]
    B --> C[Tambah ke Keranjang]
    C --> D[Proses Checkout]
    D --> E[Pilih Tanggal & Metode Bayar]
    E --> F[Kirim Pengajuan Peminjaman]
    F --> G{Status: Pending}
    G --> H[Admin/Petugas Review]
    H --> I{Disetujui?}
    I -- Tidak --> J[Status: Ditolak]
    I -- Ya --> K[Status: Approved]
    K --> L[Ambil Alat Musik]
    L --> M[Selesai]
```

---

## 🔁 3. Alur Pengembalian (Return Flowchart)
Proses pengembalian alat musik dan penyelesaian denda jika terlambat.

```mermaid
graph TD
    A[Mulai] --> B[Pengguna Mengembalikan Alat]
    B --> C[Petugas Cek Kondisi & Tanggal]
    C --> D{Terlambat?}
    D -- Ya --> E[Hitung Denda Otomatis]
    E --> F[Pengguna Bayar Denda]
    F --> G[Status Denda: Lunas]
    G --> H[Update Status: Returned]
    D -- Tidak --> H
    H --> I[Alat Musik Kembali ke Stok]
    I --> J[Selesai]
```

---

> [!NOTE]
> Semua alur di atas terintegrasi dalam database sistem untuk memastikan stok alat musik dan riwayat peminjaman selalu akurat.
