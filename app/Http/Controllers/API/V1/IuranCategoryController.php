<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\IuranCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IuranCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = IuranCategory::withCount('periods')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori iuran berhasil diambil.',
            'data' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);
        $category = IuranCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil dibuat.',
            'data' => $category->loadCount('periods'),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $category = IuranCategory::findOrFail($id);
        $validated = $this->validatedPayload($request, $category);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil diperbarui.',
            'data' => $category->fresh()->loadCount('periods'),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $category = IuranCategory::withCount('periods')->findOrFail($id);

        if ($category->periods_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori sudah dipakai periode iuran dan tidak bisa dihapus.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil dihapus.',
        ]);
    }

    private function validatedPayload(Request $request, ?IuranCategory $category = null): array
    {
        $request->merge([
            'slug' => Str::slug($request->input('slug') ?: $request->input('name')),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('iuran_categories', 'slug')->ignore($category?->category_id, 'category_id'),
            ],
            'type' => ['required', Rule::in(['MONTHLY', 'INCIDENTAL'])],
            'default_amount' => ['required', 'numeric', 'min:0'],
        ]);

        return $validated;
    }
}
