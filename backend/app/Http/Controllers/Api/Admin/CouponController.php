<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $coupons = Coupon::withCount('usages')
                ->latest()
                ->get();

            return response()->json(['data' => $coupons]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch coupons',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
                'type' => ['required', 'in:fixed,percent'],
                'value' => ['required', 'numeric', 'min:0'],
                'minimum_order' => ['nullable', 'numeric', 'min:0'],
                'maximum_discount' => ['nullable', 'numeric', 'min:0'],
                'usage_limit' => ['nullable', 'integer', 'min:1'],
                'per_customer_limit' => ['nullable', 'integer', 'min:1'],
                'applicable_products' => ['nullable', 'array'],
                'applicable_categories' => ['nullable', 'array'],
                'starts_at' => ['nullable', 'date'],
                'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
                'is_active' => ['boolean'],
            ]);

            $validated['code'] = strtoupper($validated['code']);

            $coupon = Coupon::create($validated);

            return response()->json([
                'message' => 'Coupon created successfully',
                'data' => $coupon,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create coupon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);

            $validated = $request->validate([
                'code' => ['sometimes', 'string', 'max:50', 'unique:coupons,code,'.$id],
                'type' => ['sometimes', 'in:fixed,percent'],
                'value' => ['sometimes', 'numeric', 'min:0'],
                'minimum_order' => ['nullable', 'numeric', 'min:0'],
                'maximum_discount' => ['nullable', 'numeric', 'min:0'],
                'usage_limit' => ['nullable', 'integer', 'min:1'],
                'per_customer_limit' => ['nullable', 'integer', 'min:1'],
                'applicable_products' => ['nullable', 'array'],
                'applicable_categories' => ['nullable', 'array'],
                'starts_at' => ['nullable', 'date'],
                'expires_at' => ['nullable', 'date'],
                'is_active' => ['boolean'],
            ]);

            if (isset($validated['code'])) {
                $validated['code'] = strtoupper($validated['code']);
            }

            $coupon->update($validated);

            return response()->json([
                'message' => 'Coupon updated successfully',
                'data' => $coupon->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coupon not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update coupon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);

            if ($coupon->usages()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete coupon that has been used',
                ], 422);
            }

            $coupon->delete();

            return response()->json([
                'message' => 'Coupon deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coupon not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete coupon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);

            $coupon->update(['is_active' => ! $coupon->is_active]);

            return response()->json([
                'message' => $coupon->is_active ? 'Coupon activated' : 'Coupon deactivated',
                'data' => $coupon->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coupon not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to toggle coupon status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
