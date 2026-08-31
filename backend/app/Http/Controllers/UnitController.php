<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * GET /api/units
     *
     * Daftar unit dengan optional filter:
     *   ?plat_nomor=B12   → LIKE search
     *   ?tipe_merk=Toyota → LIKE search
     *   ?status=tersedia  → exact match
     */
    public function index(Request $request): JsonResponse
    {
        $query = Unit::query();

        if ($request->filled('plat_nomor')) {
            $query->where('plat_nomor', 'like', '%' . $request->plat_nomor . '%');
        }

        if ($request->filled('tipe_merk')) {
            $query->where('tipe_merk', 'like', '%' . $request->tipe_merk . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('id')->get());
    }

    /**
     * POST /api/units
     */
    public function store(StoreUnitRequest $request): JsonResponse
    {
        $unit = Unit::create($request->validated());

        return response()->json($unit, 201);
    }

    /**
     * GET /api/units/{unit}
     */
    public function show(Unit $unit): JsonResponse
    {
        return response()->json($unit);
    }

    /**
     * PUT /api/units/{unit}
     */
    public function update(UpdateUnitRequest $request, Unit $unit): JsonResponse
    {
        $unit->update($request->validated());

        return response()->json($unit);
    }

    /**
     * DELETE /api/units/{unit}
     */
    public function destroy(Unit $unit): JsonResponse
    {
        $unit->delete();

        return response()->json(['message' => 'Unit berhasil dihapus.']);
    }
}
