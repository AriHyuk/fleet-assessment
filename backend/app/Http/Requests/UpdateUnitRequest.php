<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $unitId = $this->route('unit');

        return [
            'plat_nomor'          => ['sometimes', 'string', 'max:20', Rule::unique('units', 'plat_nomor')->ignore($unitId)],
            'tipe_merk'           => ['sometimes', 'string', 'max:100'],
            'harga_sewa_per_hari' => ['sometimes', 'numeric', 'min:0'],
            'status'              => ['sometimes', Rule::in(['tersedia', 'disewa'])],
        ];
    }

    public function messages(): array
    {
        return [
            'plat_nomor.unique'       => 'Plat nomor sudah digunakan unit lain.',
            'harga_sewa_per_hari.min' => 'Harga sewa tidak boleh negatif.',
        ];
    }
}
