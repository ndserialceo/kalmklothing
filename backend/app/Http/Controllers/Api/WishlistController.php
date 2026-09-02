<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $wishlist = Wishlist::where('user_id', $request->user()->id)
                ->with(['product.images', 'product.variants'])
                ->latest()
                ->get();

            return response()->json(['data' => $wishlist]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function add(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
            ]);

            $wishlist = Wishlist::create([
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
            ]);

            if (! $wishlist) {
                return response()->json([
                    'message' => 'Product already in wishlist',
                ], 409);
            }

            return response()->json([
                'message' => 'Product added to wishlist',
                'data' => $wishlist->load('product.images'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add to wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function remove(Request $request, int $productId): JsonResponse
    {
        try {
            $deleted = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $productId)
                ->delete();

            if (! $deleted) {
                return response()->json([
                    'message' => 'Product not found in wishlist',
                ], 404);
            }

            return response()->json([
                'message' => 'Product removed from wishlist',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove from wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function check(Request $request, int $productId): JsonResponse
    {
        try {
            $exists = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'is_in_wishlist' => $exists,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
