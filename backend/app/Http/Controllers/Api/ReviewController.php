<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Request $request, int $productId): JsonResponse
    {
        try {
            $reviews = Review::where('product_id', $productId)
                ->approved()
                ->with('user:id,name,avatar')
                ->latest()
                ->paginate($request->get('per_page', 15));

            return response()->json($reviews);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'rating' => ['required', 'integer', 'min:1', 'max:5'],
                'title' => ['nullable', 'string', 'max:255'],
                'body' => ['required', 'string'],
                'image_url' => ['nullable', 'string', 'max:500'],
            ]);

            $hasPurchased = OrderItem::whereHas('order', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->where('payment_status', 'paid');
            })->where('product_id', $validated['product_id'])->exists();

            $review = Review::create([
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'body' => $validated['body'],
                'image_url' => $validated['image_url'] ?? null,
                'is_verified' => $hasPurchased,
                'is_approved' => false,
            ]);

            return response()->json([
                'message' => 'Review submitted successfully. It will be visible after approval.',
                'data' => $review->load('user:id,name,avatar'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create review',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, int $reviewId): JsonResponse
    {
        try {
            $review = Review::where('id', $reviewId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $review->delete();

            return response()->json([
                'message' => 'Review deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete review',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
