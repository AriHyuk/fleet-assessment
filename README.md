# Fleet & Rental System

Aplikasi web untuk mengelola unit kendaraan dan pemesanan sewa.  
Dibangun sebagai take-home assessment dengan fokus pada **ketepatan business logic**: overlap check dan discount calculation.

---

## Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 11 (PHP) |
| Frontend | React + Vite |
| Database | MySQL 8.0 (via Docker) |
| DB Runtime | Docker Compose (MySQL only — backend & frontend jalan native) |

---

## Cara Setup & Jalankan

### Prasyarat

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- Docker & Docker Compose

### 1. Clone & masuk ke folder

```bash
git clone git@github.com:AriHyuk/fleet-assessment.git
cd fleet-assessment
```

### 2. Jalankan MySQL via Docker

```bash
docker compose up -d
```

MySQL akan jalan di port **3307** (bukan 3306 default — untuk hindari konflik dengan MySQL lokal).

### 3. Setup Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` — pastikan DB config seperti ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=fleet_db
DB_USERNAME=fleet_user
DB_PASSWORD=fleet_password
```

Jalankan migration:

```bash
php artisan migrate
```

Jalankan dev server:

```bash
php artisan serve
# API tersedia di http://localhost:8000/api
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
# UI tersedia di http://localhost:5173
```

---

## API Endpoints

Base URL: `http://localhost:8000/api`

### Units

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/units` | Daftar unit (filter: `?plat_nomor=`, `?tipe_merk=`, `?status=`) |
| `POST` | `/units` | Tambah unit baru |
| `GET` | `/units/{id}` | Detail unit |
| `PUT` | `/units/{id}` | Update unit |
| `DELETE` | `/units/{id}` | Hapus unit |

### Bookings

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/bookings` | Daftar semua booking |
| `POST` | `/bookings` | Buat booking baru (overlap check + diskon otomatis) |
| `GET` | `/bookings/{id}` | Detail booking |
| `GET` | `/bookings/preview` | Preview harga tanpa simpan (untuk UI) |

---

## Business Logic

### Overlap Check

Dua booking overlap jika dan hanya jika:

```
existing.tanggal_mulai <= new.tanggal_selesai
AND existing.tanggal_selesai >= new.tanggal_mulai
```

Kebijakan **inclusive**: tanggal yang sama tidak boleh dipakai dua booking berbeda untuk unit yang sama. Tidak ada granularitas jam.

Jika overlap terdeteksi → `HTTP 409 Conflict` dengan pesan error spesifik.

### Kalkulasi Durasi & Diskon

```
durasi_hari          = tanggal_selesai - tanggal_mulai + 1   (inclusive)
harga_sebelum_diskon = unit.harga_sewa_per_hari × durasi_hari
diskon_persen        = durasi_hari > 7 ? 10% : 0%
total_harga          = harga_sebelum_diskon × (1 - diskon_persen/100)
```

- Threshold: **strictly > 7**. Durasi 7 hari **tidak** dapat diskon; durasi 8 hari dapat 10%.
- Semua kalkulasi dilakukan di backend (`BookingService`) — nilai dari frontend diabaikan saat submit.
- Field `harga_sebelum_diskon`, `diskon_persen`, dan `total_harga` disimpan terpisah di DB.

> Detail lengkap formula & rasional: [`.agents/rules/business-logic.md`](.agents/rules/business-logic.md)

---

## Struktur Folder

```
fleet-assessment/
├── backend/                  # Laravel 11
│   ├── app/
│   │   ├── Exceptions/
│   │   │   └── BookingOverlapException.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── UnitController.php
│   │   │   │   └── BookingController.php
│   │   │   └── Requests/
│   │   │       ├── StoreUnitRequest.php
│   │   │       ├── UpdateUnitRequest.php
│   │   │       └── StoreBookingRequest.php
│   │   ├── Models/
│   │   │   ├── Unit.php
│   │   │   └── Booking.php
│   │   └── Services/
│   │       └── BookingService.php
│   ├── database/migrations/
│   │   ├── ..._create_units_table.php
│   │   └── ..._create_bookings_table.php
│   └── routes/
│       └── api.php
├── frontend/                 # React + Vite
├── docker-compose.yml        # MySQL 8.0 only
├── .agents/rules/
│   └── business-logic.md     # Constraint permanen untuk AI agent
└── docs/
    └── BUILD_PLAN.md
```

---

## Catatan Desain

- **Tidak full-dockerize** — backend & frontend jalan native untuk kemudahan setup reviewer. MySQL saja yang via Docker karena paling friction untuk install.
- **Tidak ada auth** — di luar scope assessment.
- **Concurrency** — overlap check di service layer (bukan DB-level row lock). Cukup untuk use case assessment; disebutkan sebagai known limitation di `BUILD_PLAN.md`.
