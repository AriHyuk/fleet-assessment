<?php

namespace App\Http\Controllers;

use App\Exceptions\BookingOverlapException;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Unit;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {}

    /**
     * GET /api/bookings
     *
     * Daftar semua booking beserta data unit-nya.
     */
    public function index(): JsonResponse
    {
        $bookings = Booking::with('unit')->orderBy('tanggal_mulai')->get();

        return response()->json($bookings);
    }

    /**
     * POST /api/bookings
     *
     * Buat booking baru.
     *
     * Kalkulasi pricing (durasi, diskon, total) dilakukan SELURUHNYA
     * di BookingService — nilai dari client diabaikan.
     * Overlap check dilakukan sebelum INSERT.
     *
     * Error responses:
     *   422 — validasi input gagal (FormRequest)
     *   409 — overlap terdeteksi
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $unit  = Unit::findOrFail($request->unit_id);
        $start = Carbon::parse($request->tanggal_mulai);
        $end   = Carbon::parse($request->tanggal_selesai);

        try {
            $booking = $this->bookingService->createBooking($unit, $start, $end);
        } catch (BookingOverlapException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);
        }

        return response()->json($booking->load('unit'), 201);
    }

    /**
     * GET /api/bookings/{booking}
     */
    public function show(Booking $booking): JsonResponse
    {
        return response()->json($booking->load('unit'));
    }

    /**
     * GET /api/bookings/preview
     *
     * Preview kalkulasi harga tanpa menyimpan booking.
     * Dipakai frontend untuk menampilkan estimasi sebelum submit.
     * TIDAK melakukan overlap check (hanya kalkulasi matematis).
     */
    public function preview(StoreBookingRequest $request): JsonResponse
    {
        $unit    = Unit::findOrFail($request->unit_id);
        $start   = Carbon::parse($request->tanggal_mulai);
        $end     = Carbon::parse($request->tanggal_selesai);
        $pricing = $this->bookingService->calculatePricing($unit, $start, $end);

        return response()->json([
            'unit'    => $unit,
            'pricing' => $pricing,
        ]);
    }
}
