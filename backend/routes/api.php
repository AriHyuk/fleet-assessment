<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Fleet & Rental System
|--------------------------------------------------------------------------
|
| Semua route di sini diakses via /api/* prefix (dikonfigurasi di
| bootstrap/app.php). Tidak ada auth — sesuai scope BUILD_PLAN.md.
|
*/

// ─── Units ───────────────────────────────────────────────────────────────────
// GET    /api/units              → index (dengan filter: plat_nomor, tipe_merk, status)
// POST   /api/units              → store
// GET    /api/units/{unit}       → show
// PUT    /api/units/{unit}       → update
// DELETE /api/units/{unit}       → destroy
Route::apiResource('units', UnitController::class);

// ─── Bookings ─────────────────────────────────────────────────────────────────
// GET  /api/bookings/preview     → preview harga tanpa simpan (HARUS sebelum resource)
// GET  /api/bookings             → index
// POST /api/bookings             → store (overlap check + diskon otomatis)
// GET  /api/bookings/{booking}   → show
Route::get('bookings/preview', [BookingController::class, 'preview']);
Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);
