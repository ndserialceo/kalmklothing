<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (strlen($query) < 2) {
                return response()->json(['data' => []]);
            }

            $products = Product::active()
                ->with(['images', 'category'])
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('sku', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%")
                        ->orWhere('short_description', 'like', "%{$query}%")
                        ->orWhere('tags', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'discount_price' => $product->discount_price,
                        'effective_price' => $product->effective_price,
                        'image' => $product->images->first()->image_url ?? null,
                        'category' => $product->category->name ?? null,
                        'is_in_stock' => $product->is_in_stock,
                    ];
                });

            return response()->json(['data' => $products]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Search failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function suggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');

            if (strlen($query) < 2) {
                return response()->json(['data' => []]);
            }

            $suggestions = Product::active()
                ->where('name', 'like', "%{$query}%")
                ->limit(5)
                ->pluck('name')
                ->unique()
                ->values();

            return response()->json(['data' => $suggestions]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch suggestions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
