<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $categories = Category::where('is_active', true)
                ->withCount('products')
                ->orderBy('sort_order')
                ->get();

            return response()->json(['data' => $categories]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('is_active', true)
                ->withCount('products')
                ->firstOrFail();

            $products = $category->products()
                ->active()
                ->with(['images', 'variants'])
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'category' => $category,
                'products' => $products,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function tree(): JsonResponse
    {
        try {
            $categories = Category::where('is_active', true)
                ->with(['children' => function ($q) {
                    $q->where('is_active', true)
                        ->withCount('products')
                        ->orderBy('sort_order');
                }])
                ->whereNull('parent_id')
                ->withCount('products')
                ->orderBy('sort_order')
                ->get();

            return response()->json(['data' => $categories]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch category tree',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
