<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'images', 'variants']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            $products = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
                'description' => ['nullable', 'string'],
                'short_description' => ['nullable', 'string', 'max:500'],
                'category_id' => ['required', 'exists:categories,id'],
                'price' => ['required', 'numeric', 'min:0'],
                'discount_price' => ['nullable', 'numeric', 'min:0'],
                'cost_price' => ['nullable', 'numeric', 'min:0'],
                'weight' => ['nullable', 'numeric'],
                'dimensions' => ['nullable', 'string'],
                'status' => ['sometimes', 'in:active,draft'],
                'is_featured' => ['boolean'],
                'is_new_arrival' => ['boolean'],
                'is_best_seller' => ['boolean'],
                'stock_quantity' => ['required', 'integer', 'min:0'],
                'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
                'meta_title' => ['nullable', 'string', 'max:255'],
                'meta_description' => ['nullable', 'string'],
                'tags' => ['nullable', 'array'],
                'images' => ['nullable', 'array'],
                'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
                'variants' => ['nullable', 'array'],
                'variants.*.color' => ['required_with:variants', 'string'],
                'variants.*.color_hex' => ['nullable', 'string', 'max:7'],
                'variants.*.size' => ['required_with:variants', 'string'],
                'variants.*.sku' => ['nullable', 'string'],
                'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
                'variants.*.stock_quantity' => ['required_with:variants', 'integer', 'min:0'],
                'variants.*.image_url' => ['nullable', 'string'],
                'variants.*.is_active' => ['boolean'],
            ]);

            $product = DB::transaction(function () use ($validated, $request) {
                $product = Product::create([
                    'name' => $validated['name'],
                    'sku' => $validated['sku'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'short_description' => $validated['short_description'] ?? null,
                    'category_id' => $validated['category_id'],
                    'price' => $validated['price'],
                    'discount_price' => $validated['discount_price'] ?? null,
                    'cost_price' => $validated['cost_price'] ?? null,
                    'weight' => $validated['weight'] ?? null,
                    'dimensions' => $validated['dimensions'] ?? null,
                    'status' => $validated['status'] ?? 'active',
                    'is_featured' => $validated['is_featured'] ?? false,
                    'is_new_arrival' => $validated['is_new_arrival'] ?? false,
                    'is_best_seller' => $validated['is_best_seller'] ?? false,
                    'stock_quantity' => $validated['stock_quantity'],
                    'low_stock_threshold' => $validated['low_stock_threshold'] ?? 10,
                    'meta_title' => $validated['meta_title'] ?? null,
                    'meta_description' => $validated['meta_description'] ?? null,
                    'tags' => $validated['tags'] ?? null,
                ]);

                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $index => $image) {
                        $path = $image->store('products', 'public');
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_url' => Storage::disk('public')->url($path),
                            'alt_text' => $validated['name'],
                            'sort_order' => $index,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }

                if (! empty($validated['variants'])) {
                    foreach ($validated['variants'] as $variantData) {
                        $product->variants()->create($variantData);
                    }
                }

                return $product;
            });

            $product->load(['category', 'images', 'variants']);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $product = Product::with(['category', 'images', 'variants', 'reviews' => function ($q) {
                $q->with('user:id,name,avatar')->latest();
            }])->findOrFail($id);

            return response()->json(['data' => $product]);
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

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'name' => ['sometimes', 'string', 'max:255'],
                'sku' => ['sometimes', 'string', 'max:100', 'unique:products,sku,'.$id],
                'description' => ['nullable', 'string'],
                'short_description' => ['nullable', 'string', 'max:500'],
                'category_id' => ['sometimes', 'exists:categories,id'],
                'price' => ['sometimes', 'numeric', 'min:0'],
                'discount_price' => ['nullable', 'numeric', 'min:0'],
                'cost_price' => ['nullable', 'numeric', 'min:0'],
                'weight' => ['nullable', 'numeric'],
                'dimensions' => ['nullable', 'string'],
                'status' => ['sometimes', 'in:active,draft'],
                'is_featured' => ['boolean'],
                'is_new_arrival' => ['boolean'],
                'is_best_seller' => ['boolean'],
                'stock_quantity' => ['sometimes', 'integer', 'min:0'],
                'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
                'meta_title' => ['nullable', 'string', 'max:255'],
                'meta_description' => ['nullable', 'string'],
                'tags' => ['nullable', 'array'],
                'images' => ['nullable', 'array'],
                'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
                'variants' => ['nullable', 'array'],
                'variants.*.id' => ['nullable', 'integer'],
                'variants.*.color' => ['required_with:variants', 'string'],
                'variants.*.color_hex' => ['nullable', 'string', 'max:7'],
                'variants.*.size' => ['required_with:variants', 'string'],
                'variants.*.sku' => ['nullable', 'string'],
                'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
                'variants.*.stock_quantity' => ['required_with:variants', 'integer', 'min:0'],
                'variants.*.image_url' => ['nullable', 'string'],
                'variants.*.is_active' => ['boolean'],
            ]);

            DB::transaction(function () use ($product, $validated, $request) {
                $product->update(collect($validated)->only([
                    'name', 'sku', 'description', 'short_description', 'category_id',
                    'price', 'discount_price', 'cost_price', 'weight', 'dimensions',
                    'status', 'is_featured', 'is_new_arrival', 'is_best_seller',
                    'stock_quantity', 'low_stock_threshold', 'meta_title', 'meta_description', 'tags',
                ])->toArray());

                if ($request->hasFile('images')) {
                    foreach ($product->images as $image) {
                        $path = str_replace('/storage/', '', $image->image_url);
                        Storage::disk('public')->delete($path);
                        $image->delete();
                    }

                    foreach ($request->file('images') as $index => $image) {
                        $path = $image->store('products', 'public');
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_url' => Storage::disk('public')->url($path),
                            'alt_text' => $product->name,
                            'sort_order' => $index,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }

                if (isset($validated['variants'])) {
                    $existingIds = collect($validated['variants'])->pluck('id')->filter()->toArray();

                    $product->variants()->whereNotIn('id', $existingIds)->each(function ($variant) {
                        $variant->delete();
                    });

                    foreach ($validated['variants'] as $variantData) {
                        if (! empty($variantData['id'])) {
                            ProductVariant::where('id', $variantData['id'])
                                ->where('product_id', $product->id)
                                ->update(collect($variantData)->except('id')->toArray());
                        } else {
                            $product->variants()->create($variantData);
                        }
                    }
                }
            });

            $product->load(['category', 'images', 'variants']);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'status' => ['required', 'in:active,draft'],
            ]);

            $product->update(['status' => $validated['status']]);

            return response()->json([
                'message' => 'Product status updated',
                'data' => $product->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update product status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateInventory(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'stock_quantity' => ['required', 'integer', 'min:0'],
            ]);

            $product->update(['stock_quantity' => $validated['stock_quantity']]);

            return response()->json([
                'message' => 'Inventory updated',
                'data' => $product->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
