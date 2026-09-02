<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::where('role', 'customer')
                ->withCount('orders');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            if ($request->filled('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $customers = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json($customers);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $customer = User::where('id', $id)
                ->where('role', 'customer')
                ->with(['orders' => function ($q) {
                    $q->latest()->limit(10);
                }, 'orders.items.product', 'addresses'])
                ->withCount('orders')
                ->firstOrFail();

            return response()->json(['data' => $customer]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch customer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $customer = User::where('id', $id)
                ->where('role', 'customer')
                ->firstOrFail();

            $validated = $request->validate([
                'is_active' => ['required', 'boolean'],
            ]);

            $customer->update(['is_active' => $validated['is_active']]);

            return response()->json([
                'message' => $validated['is_active'] ? 'Customer activated' : 'Customer deactivated',
                'data' => $customer->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Customer not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update customer status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
