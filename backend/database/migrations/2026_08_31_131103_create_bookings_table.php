<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->integer('durasi_hari');                    // computed inclusive: selesai - mulai + 1
            $table->decimal('harga_sebelum_diskon', 10, 2);   // unit.harga_sewa_per_hari * durasi_hari
            $table->decimal('diskon_persen', 5, 2)->default(0); // 0 atau 10
            $table->decimal('total_harga', 10, 2);             // setelah diskon

            // Composite index untuk overlap check query — paling sering dieksekusi
            // Query: WHERE unit_id = ? AND tanggal_mulai <= ? AND tanggal_selesai >= ?
            $table->index(['unit_id', 'tanggal_mulai', 'tanggal_selesai'], 'idx_bookings_unit_dates');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
