<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $addresses = Address::where('user_id', $request->user()->id)
                ->orderBy('is_default', 'desc')
                ->get();

            return response()->json(['data' => $addresses]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch addresses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'label' => ['nullable', 'string', 'max:50'],
                'full_name' => ['required', 'string', 'max:255'],
                'phone' => ['required', 'string', 'max:20'],
                'address_line_1' => ['required', 'string', 'max:255'],
                'address_line_2' => ['nullable', 'string', 'max:255'],
                'city' => ['required', 'string', 'max:100'],
                'state' => ['required', 'string', 'max:100'],
                'country' => ['required', 'string', 'max:100'],
                'is_default' => ['boolean'],
            ]);

            $validated['user_id'] = $request->user()->id;

            if (! empty($validated['is_default']) && $validated['is_default']) {
                Address::where('user_id', $request->user()->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $address = Address::create($validated);

            return response()->json([
                'message' => 'Address created successfully',
                'data' => $address,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create address',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $address = Address::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $validated = $request->validate([
                'label' => ['nullable', 'string', 'max:50'],
                'full_name' => ['sometimes', 'string', 'max:255'],
                'phone' => ['sometimes', 'string', 'max:20'],
                'address_line_1' => ['sometimes', 'string', 'max:255'],
                'address_line_2' => ['nullable', 'string', 'max:255'],
                'city' => ['sometimes', 'string', 'max:100'],
                'state' => ['sometimes', 'string', 'max:100'],
                'country' => ['sometimes', 'string', 'max:100'],
                'is_default' => ['boolean'],
            ]);

            if (! empty($validated['is_default']) && $validated['is_default']) {
                Address::where('user_id', $request->user()->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $address->update($validated);

            return response()->json([
                'message' => 'Address updated successfully',
                'data' => $address->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Address not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update address',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $address = Address::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $address->delete();

            return response()->json([
                'message' => 'Address deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Address not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete address',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        try {
            $address = Address::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            Address::where('user_id', $request->user()->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $address->update(['is_default' => true]);

            return response()->json([
                'message' => 'Default address updated',
                'data' => $address->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Address not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to set default address',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
