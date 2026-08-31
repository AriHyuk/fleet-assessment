<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id'         => ['required', 'integer', 'exists:units,id'],
            'tanggal_mulai'   => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'tanggal_selesai' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:tanggal_mulai'],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.exists'                => 'Unit kendaraan tidak ditemukan.',
            'tanggal_mulai.after_or_equal'  => 'Tanggal mulai tidak boleh di masa lalu.',
            'tanggal_selesai.after_or_equal'=> 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}
