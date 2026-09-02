<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    private function getCart(Request $request): Cart
    {
        if ($request->user()) {
            $cart = Cart::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['session_id' => null]
            );
        } else {
            $sessionId = $request->header('X-Session-ID') ?? session()->getId();
            $cart = Cart::firstOrCreate(
                ['session_id' => $sessionId],
                ['user_id' => null]
            );
        }

        return $cart->load(['items.product.images', 'items.variant']);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $cart = $this->getCart($request);

            return response()->json([
                'data' => array_merge($cart->toArray(), [
                    'total' => $cart->total,
                    'item_count' => $cart->item_count,
                ]),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function add(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'variant_id' => ['nullable', 'exists:product_variants,id'],
                'quantity' => ['required', 'integer', 'min:1'],
            ]);

            $product = Product::findOrFail($validated['product_id']);

            if (! $product->is_in_stock) {
                return response()->json([
                    'message' => 'Product is out of stock',
                ], 422);
            }

            if (isset($validated['variant_id'])) {
                $variant = ProductVariant::findOrFail($validated['variant_id']);

                if (! $variant->is_active || $variant->stock_quantity < $validated['quantity']) {
                    return response()->json([
                        'message' => 'Selected variant is not available in requested quantity',
                    ], 422);
                }
            } else {
                if ($product->stock_quantity < $validated['quantity']) {
                    return response()->json([
                        'message' => 'Insufficient stock',
                    ], 422);
                }
            }

            $cart = $this->getCart($request);

            $existingItem = $cart->items()
                ->where('product_id', $validated['product_id'])
                ->where('product_variant_id', $validated['variant_id'] ?? null)
                ->first();

            if ($existingItem) {
                $newQuantity = $existingItem->quantity + $validated['quantity'];
                $stock = isset($validated['variant_id'])
                    ? ProductVariant::find($validated['variant_id'])->stock_quantity
                    : $product->stock_quantity;

                if ($newQuantity > $stock) {
                    return response()->json([
                        'message' => 'Insufficient stock for requested quantity',
                    ], 422);
                }

                $existingItem->update(['quantity' => $newQuantity]);
            } else {
                $cart->items()->create([
                    'product_id' => $validated['product_id'],
                    'product_variant_id' => $validated['variant_id'] ?? null,
                    'quantity' => $validated['quantity'],
                ]);
            }

            $cart->load(['items.product.images', 'items.variant']);

            return response()->json([
                'message' => 'Item added to cart',
                'data' => array_merge($cart->toArray(), [
                    'total' => $cart->total,
                    'item_count' => $cart->item_count,
                ]),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity' => ['required', 'integer', 'min:1'],
            ]);

            $cart = $this->getCart($request);
            $item = $cart->items()->findOrFail($itemId);

            $stock = $item->variant
                ? $item->variant->stock_quantity
                : $item->product->stock_quantity;

            if ($validated['quantity'] > $stock) {
                return response()->json([
                    'message' => 'Insufficient stock',
                ], 422);
            }

            $item->update(['quantity' => $validated['quantity']]);

            $cart->load(['items.product.images', 'items.variant']);

            return response()->json([
                'message' => 'Cart updated',
                'data' => array_merge($cart->toArray(), [
                    'total' => $cart->total,
                    'item_count' => $cart->item_count,
                ]),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Cart item not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function remove(Request $request, int $itemId): JsonResponse
    {
        try {
            $cart = $this->getCart($request);
            $item = $cart->items()->findOrFail($itemId);
            $item->delete();

            $cart->load(['items.product.images', 'items.variant']);

            return response()->json([
                'message' => 'Item removed from cart',
                'data' => array_merge($cart->toArray(), [
                    'total' => $cart->total,
                    'item_count' => $cart->item_count,
                ]),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Cart item not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove item',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function clear(Request $request): JsonResponse
    {
        try {
            $cart = $this->getCart($request);
            $cart->items()->delete();
            $cart->update(['coupon_id' => null]);

            return response()->json([
                'message' => 'Cart cleared',
                'data' => array_merge($cart->toArray(), [
                    'total' => 0,
                    'item_count' => 0,
                ]),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => ['required', 'string'],
            ]);

            $coupon = Coupon::where('code', strtoupper($validated['code']))
                ->where('is_active', true)
                ->first();

            if (! $coupon) {
                return response()->json([
                    'message' => 'Invalid coupon code',
                ], 404);
            }

            $cart = $this->getCart($request);
            $user = $request->user();

            if (! $coupon->isValidForUse($user, $cart)) {
                return response()->json([
                    'message' => 'Coupon is not valid for this cart',
                ], 422);
            }

            $cart->update(['coupon_id' => $coupon->id]);

            $discountAmount = $coupon->getDiscountAmount($cart->total);

            return response()->json([
                'message' => 'Coupon applied successfully',
                'discount_amount' => $discountAmount,
                'coupon' => $coupon,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to apply coupon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        try {
            $cart = $this->getCart($request);
            $cart->update(['coupon_id' => null]);

            return response()->json([
                'message' => 'Coupon removed',
                'data' => array_merge($cart->toArray(), [
                    'total' => $cart->total,
                    'item_count' => $cart->item_count,
                ]),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove coupon',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
