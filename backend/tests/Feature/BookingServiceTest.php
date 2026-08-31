<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Unit;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BookingService();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_no_discount_for_duration_7_days_or_less()
    {
        $unit = new Unit();
        $unit->harga_sewa_per_hari = 100000;

        // 7 days: 2026-09-01 to 2026-09-07 (inclusive)
        $start = Carbon::parse('2026-09-01');
        $end = Carbon::parse('2026-09-07');

        $pricing = $this->service->calculatePricing($unit, $start, $end);

        $this->assertEquals(7, $pricing['durasi_hari']);
        $this->assertEquals(700000, $pricing['harga_sebelum_diskon']);
        $this->assertEquals(0, $pricing['diskon_persen']);
        $this->assertEquals(700000, $pricing['total_harga']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_calculates_10_percent_discount_for_duration_greater_than_7_days()
    {
        $unit = new Unit();
        $unit->harga_sewa_per_hari = 100000;

        // 8 days: 2026-09-01 to 2026-09-08 (inclusive)
        $start = Carbon::parse('2026-09-01');
        $end = Carbon::parse('2026-09-08');

        $pricing = $this->service->calculatePricing($unit, $start, $end);

        $this->assertEquals(8, $pricing['durasi_hari']);
        $this->assertEquals(800000, $pricing['harga_sebelum_diskon']);
        $this->assertEquals(10, $pricing['diskon_persen']);
        $this->assertEquals(720000, $pricing['total_harga']); // 800k - 80k
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_detects_overlap_scenarios_correctly()
    {
        $unit = Unit::create([
            'plat_nomor' => 'TEST-123',
            'tipe_merk' => 'Toyota Avanza',
            'harga_sewa_per_hari' => 100000,
            'status' => 'tersedia'
        ]);

        // Existing booking: 10th to 15th
        Booking::create([
            'unit_id' => $unit->id,
            'tanggal_mulai' => '2026-09-10',
            'tanggal_selesai' => '2026-09-15',
            'durasi_hari' => 6,
            'harga_sebelum_diskon' => 600000,
            'diskon_persen' => 0,
            'total_harga' => 600000
        ]);



        // 1. Partial Overlap Left: 8th to 10th (overlaps on 10th)
        $this->assertTrue($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-08'), 
            Carbon::parse('2026-09-10')
        ));

        // 2. Partial Overlap Right: 15th to 18th (overlaps on 15th)
        $this->assertTrue($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-15'), 
            Carbon::parse('2026-09-18')
        ));

        // 3. Containment (New completely inside existing): 11th to 13th
        $this->assertTrue($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-11'), 
            Carbon::parse('2026-09-13')
        ));

        // 4. Containment (Existing completely inside new): 5th to 20th
        $this->assertTrue($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-05'), 
            Carbon::parse('2026-09-20')
        ));

        // 5. No overlap (Before existing): 1st to 9th
        $this->assertFalse($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-01'), 
            Carbon::parse('2026-09-09')
        ));

        // 6. No overlap (After existing): 16th to 20th
        $this->assertFalse($this->service->hasOverlap(
            $unit->id, 
            Carbon::parse('2026-09-16'), 
            Carbon::parse('2026-09-20')
        ));
    }
}
