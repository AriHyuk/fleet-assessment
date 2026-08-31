<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Unit;
use Carbon\Carbon;

class BookingService
{
    /**
     * Cek apakah ada booking yang overlap dengan rentang tanggal yang diminta.
     *
     * Formula (business-logic.md §1 — JANGAN DIUBAH):
     *   existing.tanggal_mulai <= new.tanggal_selesai
     *   AND existing.tanggal_selesai >= new.tanggal_mulai
     *
     * Derivasi dari negasi kondisi non-overlap:
     *   NOT (existing.end < new.start OR existing.start > new.end)
     *   = existing.start <= new.end AND existing.end >= new.start
     *
     * Boundary inclusive: tanggal yang sama = overlap (tidak ada granularitas jam).
     *
     * @param int      $unitId            ID unit yang dicek
     * @param Carbon   $start             Tanggal mulai booking baru
     * @param Carbon   $end               Tanggal selesai booking baru
     * @param int|null $excludeBookingId  Exclude booking ID ini (untuk kasus edit)
     */
    public function hasOverlap(int $unitId, Carbon $start, Carbon $end, ?int $excludeBookingId = null): bool
    {
        return Booking::where('unit_id', $unitId)
            ->where('tanggal_mulai', '<=', $end->toDateString())
            ->where('tanggal_selesai', '>=', $start->toDateString())
            ->when($excludeBookingId, fn ($q) => $q->where('id', '!=', $excludeBookingId))
            ->exists();
    }

    /**
     * Hitung pricing booking berdasarkan unit dan rentang tanggal.
     *
     * Formula (business-logic.md §2 & §3 — JANGAN DIUBAH):
     *   durasi_hari          = selesai - mulai + 1  (inclusive kedua ujung)
     *   harga_sebelum_diskon = unit.harga_sewa_per_hari * durasi_hari
     *   diskon_persen        = durasi_hari > 7 ? 10.00 : 0.00
     *   total_harga          = harga_sebelum_diskon * (durasi_hari > 7 ? 0.9 : 1.0)
     *
     * Threshold: STRICTLY > 7. Durasi 7 hari TIDAK mendapat diskon.
     * Durasi 8 hari mendapat diskon 10%.
     */
    public function calculatePricing(Unit $unit, Carbon $start, Carbon $end): array
    {
        $durasiHari = (int) $start->diffInDays($end) + 1;

        $hargaSebelumDiskon = (float) $unit->harga_sewa_per_hari * $durasiHari;

        $diskonPersen = $durasiHari > 7 ? 10.00 : 0.00;

        $totalHarga = $diskonPersen > 0
            ? $hargaSebelumDiskon * 0.9
            : $hargaSebelumDiskon;

        return [
            'durasi_hari'          => $durasiHari,
            'harga_sebelum_diskon' => round($hargaSebelumDiskon, 2),
            'diskon_persen'        => $diskonPersen,
            'total_harga'          => round($totalHarga, 2),
        ];
    }

    /**
     * Buat booking baru setelah validasi overlap.
     *
     * Overlap check dilakukan di sini (service layer) — bukan di frontend.
     * Frontend hanya boleh preview kalkulasi, nilai akhir selalu dari sini.
     *
     * @throws \App\Exceptions\BookingOverlapException
     */
    public function createBooking(Unit $unit, Carbon $start, Carbon $end): Booking
    {
        if ($this->hasOverlap($unit->id, $start, $end)) {
            throw new \App\Exceptions\BookingOverlapException(
                "Unit {$unit->plat_nomor} tidak tersedia untuk periode " .
                "{$start->toDateString()} s/d {$end->toDateString()}."
            );
        }

        $pricing = $this->calculatePricing($unit, $start, $end);

        return Booking::create([
            'unit_id'         => $unit->id,
            'tanggal_mulai'   => $start->toDateString(),
            'tanggal_selesai' => $end->toDateString(),
            ...$pricing,
        ]);
    }
}
