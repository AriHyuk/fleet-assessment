<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = [
        'plat_nomor',
        'tipe_merk',
        'harga_sewa_per_hari',
        'status',
    ];

    protected $casts = [
        'harga_sewa_per_hari' => 'decimal:2',
    ];

    /**
     * Satu unit bisa memiliki banyak booking.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
