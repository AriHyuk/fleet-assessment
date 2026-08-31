<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'unit_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'durasi_hari',
        'harga_sebelum_diskon',
        'diskon_persen',
        'total_harga',
    ];

    protected $casts = [
        'tanggal_mulai'        => 'date',
        'tanggal_selesai'      => 'date',
        'durasi_hari'          => 'integer',
        'harga_sebelum_diskon' => 'decimal:2',
        'diskon_persen'        => 'decimal:2',
        'total_harga'          => 'decimal:2',
    ];

    /**
     * Setiap booking terkait ke satu unit kendaraan.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
