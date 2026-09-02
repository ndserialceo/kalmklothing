<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::active()
                ->with(['category', 'images', 'variants']);

            if ($request->filled('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            if ($request->filled('gender')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('name', 'like', '%'.$request->gender.'%');
                });
            }

            if ($request->filled('size')) {
                $query->whereHas('variants', function ($q) use ($request) {
                    $q->where('size', $request->size)->where('is_active', true);
                });
            }

            if ($request->filled('color')) {
                $query->whereHas('variants', function ($q) use ($request) {
                    $q->where('color', $request->color)->where('is_active', true);
                });
            }

            if ($request->filled('min_price')) {
                $query->where(function ($q) use ($request) {
                    $q->where('price', '>=', $request->min_price)
                        ->orWhere('discount_price', '>=', $request->min_price);
                });
            }

            if ($request->filled('max_price')) {
                $query->where(function ($q) use ($request) {
                    $q->where('price', '<=', $request->max_price)
                        ->orWhere('discount_price', '<=', $request->max_price);
                });
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $sort = $request->get('sort', 'newest');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'best_sellers':
                    $query->orderBy('is_best_seller', 'desc');
                    break;
                case 'featured':
                    $query->orderBy('is_featured', 'desc');
                    break;
                default:
                    $query->latest();
            }

            $perPage = $request->get('per_page', 15);
            $products = $query->paginate($perPage);

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $product = Product::active()
                ->where('slug', $slug)
                ->with(['category', 'images', 'variants', 'reviews' => function ($q) {
                    $q->approved()->with('user')->latest();
                }])
                ->firstOrFail();

            return response()->json([
                'data' => array_merge($product->toArray(), [
                    'average_rating' => $product->average_rating,
                    'review_count' => $product->review_count,
                    'is_in_stock' => $product->is_in_stock,
                    'effective_price' => $product->effective_price,
                    'discount_percentage' => $product->discount_percentage,
                ]),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function featured(): JsonResponse
    {
        try {
            $products = Product::active()
                ->featured()
                ->with(['category', 'images', 'variants'])
                ->limit(8)
                ->get();

            return response()->json(['data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch featured products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function newArrivals(): JsonResponse
    {
        try {
            $products = Product::active()
                ->newArrivals()
                ->with(['category', 'images', 'variants'])
                ->limit(8)
                ->latest()
                ->get();

            return response()->json(['data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch new arrivals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bestSellers(): JsonResponse
    {
        try {
            $products = Product::active()
                ->bestSellers()
                ->with(['category', 'images', 'variants'])
                ->limit(8)
                ->get();

            return response()->json(['data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch best sellers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            $products = Product::active()
                ->with(['images'])
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('sku', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('tags', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get();

            return response()->json(['data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Search failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
