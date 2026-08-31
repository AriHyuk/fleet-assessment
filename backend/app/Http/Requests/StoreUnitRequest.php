<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plat_nomor'          => ['required', 'string', 'max:20', 'unique:units,plat_nomor'],
            'tipe_merk'           => ['required', 'string', 'max:100'],
            'harga_sewa_per_hari' => ['required', 'numeric', 'min:0'],
            'status'              => ['sometimes', Rule::in(['tersedia', 'disewa'])],
        ];
    }

    public function messages(): array
    {
        return [
            'plat_nomor.unique'          => 'Plat nomor sudah terdaftar.',
            'harga_sewa_per_hari.min'    => 'Harga sewa tidak boleh negatif.',
        ];
    }
}
