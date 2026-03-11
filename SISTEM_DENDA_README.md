# Sistem Denda - Music Rental System

## Fitur Utama

Sistem denda telah berhasil diimplementasikan dengan fitur-fitur berikut:

### 1. **Perhitungan Denda Otomatis**
- Denda dihitung otomatis saat alat dikembalikan melewati batas waktu
- Grace period 24 jam sebelum denda dikenakan
- Denda default: Rp 10,000 per hari keterlambatan

### 2. **Manajemen Denda oleh Petugas**
- Halaman khusus `/fines` untuk admin dan petugas
- Melihat semua data denda dengan detail peminjam dan alat musik
- Statistik denda (total denda, nilai total, belum dibayar, rata-rata keterlambatan)

### 3. **Pengaturan Denda (Admin Only)**
- Mengubah harga denda per hari
- Mengatur grace period
- Hanya admin yang dapat mengubah pengaturan

### 4. **Fitur Pembayaran Denda**
- Menandai denda sebagai sudah dibayar
- Tracking status pembayaran (pending/completed/failed)

### 5. **API Endpoints**
```
GET    /api/fines              - Get all fines
GET    /api/fines/settings     - Get fine settings
PUT    /api/fines/settings     - Update fine settings (admin)
POST   /api/fines/:id/calculate - Calculate fine manually
PUT    /api/fines/:id/pay      - Mark fine as paid
GET    /api/fines/stats        - Get fine statistics
```

### 6. **Database Schema**
Kolom baru di tabel `rentals`:
- `late_fee_per_day` (DECIMAL) - Denda per hari
- `late_days` (INT) - Jumlah hari terlambat
- `late_fee_total` (DECIMAL) - Total denda

## Cara Penggunaan

1. **Untuk Petugas:**
   - Akses menu "Denda" di navbar
   - Lihat daftar denda dan statistik
   - Tandai denda sebagai sudah dibayar

2. **Untuk Admin:**
   - Semua fitur petugas
   - Mengubah pengaturan denda melalui tombol "Pengaturan Denda"
   - Menghitung denda manual jika diperlukan

3. **Proses Otomatis:**
   - Saat mengubah status peminjaman menjadi "returned", sistem otomatis menghitung denda
   - Denda hanya dihitung jika pengembalian melewati grace period 24 jam

## Default Settings
- Denda per hari: Rp 10,000
- Grace period: 24 jam
- Admin dapat mengubah setting ini sesuai kebutuhan