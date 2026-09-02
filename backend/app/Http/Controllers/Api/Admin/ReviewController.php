<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Review::with(['user:id,name,email', 'product:id,name,slug']);

            if ($request->filled('status')) {
                if ($request->status === 'pending') {
                    $query->where('is_approved', false);
                } elseif ($request->status === 'approved') {
                    $query->where('is_approved', true);
                }
            }

            if ($request->filled('product_id')) {
                $query->where('product_id', $request->product_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('body', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $reviews = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json($reviews);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function approve(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => true]);

            return response()->json([
                'message' => 'Review approved',
                'data' => $review->fresh(['user:id,name', 'product:id,name']),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve review',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reject(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => false]);

            return response()->json([
                'message' => 'Review rejected',
                'data' => $review->fresh(['user:id,name', 'product:id,name']),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Review not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject review',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
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
