# Build Plan: Fleet & Rental System

> File ini dipakai sebagai context/plan untuk AI Agent (Antigravity). Rujuk balik ke sini kalau eksekusi mulai menyimpang dari scope.

---

## 1. Tujuan

Membangun aplikasi web untuk mengelola:
- **Unit Kendaraan** (CRUD + search/filter)
- **Pemesanan Sewa** (create dengan validasi bisnis: diskon otomatis & overlap check)

Target: working, clean, business logic benar — bukan fitur sebanyak-banyaknya. Prioritas ketepatan overlap check dan discount calculation di atas segalanya, karena itu yang dinilai paling ketat.

---

## 2. Tools & Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Backend | Laravel (PHP) | REST API, familiar, cepat eksekusi |
| Frontend | React (Vite) | Decoupled, familiar, reflex sudah terbentuk |
| Database | MySQL 8.0 | Lebih umum dipakai di industri dibanding SQLite |
| Local DB runtime | Docker Compose (MySQL only, no Dockerfile) | Kurangi friction reviewer setup, effort minimal |
| AI Agent | Antigravity (Gemini) | Dengan workspace rules `.agents/rules/` untuk constrain business logic |

**Tidak full-dockerize.** Backend & frontend jalan native (`php artisan serve`, `npm run dev`). Alasan dan trade-off-nya ditulis di README section improvement.

---

## 3. Entity & Schema

### `units` (Unit Kendaraan)
| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| plat_nomor | varchar, unique | |
| tipe_merk | varchar | |
| harga_sewa_per_hari | decimal(10,2) | |
| status | enum('tersedia','disewa') | default 'tersedia' |
| timestamps | | created_at, updated_at |

### `bookings` (Pemesanan Sewa)
| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint, PK | |
| unit_id | bigint, FK → units.id | |
| tanggal_mulai | date | |
| tanggal_selesai | date | |
| durasi_hari | int | computed saat create |
| harga_sebelum_diskon | decimal(10,2) | |
| diskon_persen | decimal(5,2) | 0 atau 10 |
| total_harga | decimal(10,2) | setelah diskon |
| timestamps | | |

**Index wajib:** composite index di `bookings(unit_id, tanggal_mulai, tanggal_selesai)` — query overlap check ini yang paling sering jalan, harus cepat.

---

## 4. Business Rules (WAJIB, non-negotiable)

### Diskon otomatis
- Durasi sewa dihitung **inclusive** (tanggal_selesai - tanggal_mulai + 1 hari)
- Jika durasi > 7 hari → `total_harga = harga_sebelum_diskon * 0.9`
- Jika tidak → `total_harga = harga_sebelum_diskon`

### Overlap check
- Dua interval `[a_start, a_end]` dan `[b_start, b_end]` overlap jika: `a_start <= b_end AND a_end >= b_start`
- Kebijakan **inclusive**: tanggal yang sama tidak boleh dipakai dua booking berbeda untuk unit yang sama (karena tidak ada granularitas jam)
- Validasi WAJIB di service/repository layer sebelum insert — bukan cuma di frontend
- Kalau overlap terdeteksi → reject dengan pesan error jelas, HTTP 422/409

*(Detail lengkap formula & rasionalnya ada di `.agents/rules/business-logic.md` — itu yang jadi constraint permanen buat AI, file ini cuma plan eksekusi.)*

---

## 5. Build Phases

### Phase 1 — Backend Foundation
- [ ] Init Laravel project, konfigurasi `.env` untuk MySQL
- [ ] Migration: `units`, `bookings`
- [ ] Model + relasi (`Unit hasMany Booking`, `Booking belongsTo Unit`)
- **Acceptance:** `php artisan migrate` sukses, relasi Eloquent bisa diakses di tinker

### Phase 2 — Backend Business Logic
- [ ] Service layer: `BookingService` — overlap check + discount calculation
- [ ] API endpoints: CRUD unit (`GET/POST/PUT/DELETE /api/units`), booking (`GET/POST /api/bookings`)
- [ ] Search/filter endpoint untuk unit (by plat nomor / tipe / status)
- [ ] Validasi request (Form Request class), error response konsisten
- **Acceptance:** Overlap ke-reject dengan pesan jelas; diskon otomatis ter-apply di response; ada test manual (Postman/tinker) yang bukti keduanya jalan

### Phase 3 — Frontend
- [ ] Table unit kendaraan + search/filter
- [ ] Form CRUD unit
- [ ] Form booking (pilih kendaraan, tanggal mulai/selesai, preview harga+diskon sebelum submit)
- [ ] Error handling UI untuk overlap rejection
- **Acceptance:** Semua flow CRUD + booking bisa dilakukan end-to-end dari UI

### Phase 4 — Seeder & Testing Data
- [ ] Seeder unit dummy (~5-10 unit)
- [ ] Seeder booking dengan skenario overlap yang disengaja (buat bukti validasi jalan): partial overlap kiri, partial kanan, containment, edge-touching, dan yang valid (non-overlap)
- **Acceptance:** Seeder jalan, bisa dipakai reviewer untuk verifikasi manual

### Phase 5 — Documentation
- [ ] README: Arsitektur, Logika Overlap, Penggunaan AI Agent (linkan ke `.agents/rules/`)
- [ ] Setup instruction yang environment-agnostic (bukan Herd-specific)
- **Acceptance:** Orang lain bisa clone → ikuti README → jalan tanpa nanya

---

## 6. Out of Scope (sengaja tidak dikerjakan, demi waktu)

- Auth/login (soal tidak minta)
- Full dockerize (Dockerfile app + orchestration penuh)
- Booking cancellation flow / status pemesanan granular
- Concurrency lock di level DB (row locking) untuk race condition booking bersamaan — cukup validasi service-layer

---

## 7. Cara pakai file ini di Antigravity

1. Buka project di Antigravity, pastikan `.agents/rules/business-logic.md` sudah ada dan Always On
2. Mention file ini di awal sesi: "ikuti docs/BUILD_PLAN.md, mulai dari Phase 1"
3. Verifikasi tiap acceptance criteria sebelum lanjut ke phase berikutnya — jangan biarkan AI loncat phase
