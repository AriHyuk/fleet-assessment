# Fleet & Rental System

Sistem manajemen unit kendaraan dan pemesanan sewa berbasis web. Aplikasi ini dirancang untuk memudahkan pencatatan unit kendaraan (CRUD) serta menangani transaksi sewa dengan fitur *overlap detection* dan kalkulasi harga (termasuk diskon) secara real-time.

---

## 🏗️ Arsitektur Sistem

Proyek ini menggunakan pola arsitektur **Decoupled (API Backend + SPA Frontend)**:
- **Backend (Laravel 11)**: Berperan murni sebagai RESTful API. *Business logic* dipisahkan dari controller ke dalam layer `Service` (seperti `BookingService`). Pendekatan ini membuat controller tetap ramping (*thin controllers*), memudahkan *unit testing*, dan meningkatkan *code reusability*.
- **Frontend (React + TypeScript + Vite)**: Berfungsi sebagai *presentation layer*. Penggunaan TypeScript memberikan *type-safety* pada struktur data `Unit` dan `Booking`, mencegah *runtime errors* saat mengkonsumsi data dari API. Antarmuka dibangun menggunakan Tailwind CSS v4 untuk menghasilkan desain modern secara efisien.
- **Database (MySQL 8.0 via Docker)**: Layanan database diisolasi dalam container Docker untuk memastikan konsistensi *environment* pengembangan dan mempermudah proses *setup* tanpa instalasi server MySQL lokal secara manual.

---

## 🧠 Business Logic

### Logika Deteksi Overlap (Jadwal Bentrok)

Untuk memastikan sebuah kendaraan tidak disewa oleh dua pelanggan berbeda di waktu yang bersamaan, sistem menerapkan validasi irisan tanggal (overlap check) sebelum data disimpan. 

Dua transaksi dinyatakan beririsan apabila rentang waktu pemesanan baru tumpang tindih dengan pemesanan yang sudah ada di sistem. Logika SQL yang digunakan:

```sql
existing.tanggal_mulai <= new.tanggal_selesai
AND existing.tanggal_selesai >= new.tanggal_mulai
```

**Kebijakan Inclusive**: Sistem menghitung tanggal secara *inclusive* (tanggal batas ikut dihitung). Jika kondisi overlap di atas terpenuhi, API akan melempar `BookingOverlapException` dan merespon dengan status **HTTP 409 Conflict**.

### Kalkulasi Harga & Diskon

Semua perhitungan harga dilakukan secara otorisatif di sisi Backend (`BookingService`), sehingga nilai dari Frontend hanya digunakan untuk tujuan *preview*.
- **Durasi Sewa:** Dihitung inklusif `(tanggal_selesai - tanggal_mulai) + 1` hari.
- **Diskon Otomatis:** Berlaku threshold *strictly* $> 7$ hari. Durasi 7 hari tidak mendapat diskon, sedangkan 8 hari (dan seterusnya) akan mendapatkan potongan harga sebesar **10%**.

---

## 🤖 Penggunaan AI Assistant

Pengembangan proyek ini didukung oleh penggunaan **Google Antigravity IDE (Gemini)** untuk mempercepat proses *scaffolding*, pembuatan antarmuka (React UI), hingga penulisan _boilerplate_ API. 

**Transparansi & Kontrol AI:**
Untuk memastikan AI tidak melakukan halusinasi atau mengubah aturan bisnis secara sembarangan, *constraints* sistem diatur melalui file [`.agents/rules/business-logic.md`](.agents/rules/business-logic.md). File *rule* ini mengikat AI agent agar patuh 100% terhadap formula kalkulasi diskon dan logika operasional *overlap* yang telah ditetapkan.

---

## 🚀 Cara Setup & Instalasi

### Prasyarat
- PHP 8.2+ & Composer
- Node.js 18+ & npm
- Docker & Docker Compose

### 1. Jalankan Database (Docker)
```bash
docker compose up -d
```
MySQL akan berjalan di port **3307** untuk menghindari konflik dengan port default MySQL lokal.

### 2. Setup Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Pastikan konfigurasi `.env` terhubung ke container Docker:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=fleet_db
DB_USERNAME=fleet_user
DB_PASSWORD=fleet_password
```
Jalankan migrasi database dan *development server*:
```bash
php artisan migrate
php artisan serve
# API beroperasi di http://localhost:8000/api
```

### 3. Setup Frontend (React SPA)
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
# Buka aplikasi di http://localhost:5173
```

---

## 🔌 API Endpoints
Base URL: `http://localhost:8000/api`

* **`GET /units`** : List kendaraan (mendukung query parameter `plat_nomor`, `tipe_merk`, `status`).
* **`POST /units`** : Tambah kendaraan.
* **`GET /bookings`** : Riwayat pemesanan sewa.
* **`POST /bookings`** : Buat pemesanan baru (Terdapat pengecekan *overlap* 409).
* **`GET /bookings/preview`** : Menghitung estimasi biaya dan durasi di Frontend sebelum disubmit (tanpa menyimpan ke database).

---

## 📦 Postman Collection

Untuk memudahkan testing API, kami telah menyediakan **Postman Collection** yang berisi semua *endpoints* beserta contoh payload dan query parameternya.

1. Buka aplikasi Postman.
2. Klik tombol **Import**.
3. Pilih file `docs/Fleet_Rental_System.postman_collection.json` dari repositori ini.
4. Gunakan variabel *environment* `base_url` (secara default sudah di-set ke `http://localhost:8000/api`).
