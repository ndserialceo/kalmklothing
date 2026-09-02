<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'full_name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'phone' => ['required', 'string', 'max:20'],
                'whatsapp' => ['nullable', 'string', 'max:20'],
                'shipping_address' => ['required', 'array'],
                'shipping_address.address_line_1' => ['required', 'string'],
                'shipping_address.city' => ['required', 'string'],
                'shipping_address.state' => ['required', 'string'],
                'shipping_address.country' => ['required', 'string'],
                'notes' => ['nullable', 'string'],
            ]);

            $cart = Cart::where('user_id', $request->user()->id)
                ->with(['items.product', 'items.variant', 'coupon'])
                ->first();

            if (! $cart || $cart->items->isEmpty()) {
                return response()->json([
                    'message' => 'Cart is empty',
                ], 422);
            }

            $order = DB::transaction(function () use ($request, $cart, $validated) {
                $subtotal = $cart->total;
                $discountAmount = 0;
                $shippingAmount = 0;
                $taxAmount = 0;

                if ($cart->coupon) {
                    $discountAmount = $cart->coupon->getDiscountAmount($subtotal);
                }

                $total = $subtotal - $discountAmount + $shippingAmount + $taxAmount;

                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'full_name' => $validated['full_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'whatsapp' => $validated['whatsapp'] ?? null,
                    'shipping_address' => $validated['shipping_address'],
                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'shipping_amount' => $shippingAmount,
                    'tax_amount' => $taxAmount,
                    'total' => $total,
                    'currency' => 'NGN',
                    'payment_status' => 'pending',
                    'order_status' => 'pending',
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($cart->items as $item) {
                    $price = $item->variant && $item->variant->price
                        ? $item->variant->price
                        : $item->product->effective_price;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'product_name' => $item->product->name,
                        'product_image' => $item->product->images->first()->image_url ?? null,
                        'size' => $item->variant->size ?? null,
                        'color' => $item->variant->color ?? null,
                        'quantity' => $item->quantity,
                        'unit_price' => $price,
                        'total_price' => $price * $item->quantity,
                    ]);

                    if ($item->product_variant_id) {
                        $item->variant->decrement('stock_quantity', $item->quantity);
                    } else {
                        $item->product->decrement('stock_quantity', $item->quantity);
                    }
                }

                if ($cart->coupon) {
                    CouponUsage::create([
                        'coupon_id' => $cart->coupon_id,
                        'user_id' => $request->user()->id,
                        'order_id' => $order->id,
                        'used_at' => now(),
                    ]);

                    $cart->coupon->increment('used_count');
                }

                $cart->items()->delete();
                $cart->update(['coupon_id' => null]);

                return $order;
            });

            $order->load(['items.product', 'items.variant']);

            return response()->json([
                'message' => 'Order created successfully',
                'data' => $order,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $orders = Order::where('user_id', $request->user()->id)
                ->with(['items.product', 'payments'])
                ->latest()
                ->paginate($request->get('per_page', 15));

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->where('user_id', $request->user()->id)
                ->with(['items.product', 'items.variant', 'payments'])
                ->firstOrFail();

            return response()->json(['data' => $order]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function track(string $orderNumber): JsonResponse
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->with(['items.product'])
                ->firstOrFail();

            $history = [
                [
                    'status' => $order->order_status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at,
                ],
            ];

            if ($order->shipped_at) {
                $history[] = [
                    'status' => 'shipped',
                    'date' => $order->shipped_at,
                ];
            }

            if ($order->delivered_at) {
                $history[] = [
                    'status' => 'delivered',
                    'date' => $order->delivered_at,
                ];
            }

            return response()->json([
                'order_number' => $order->order_number,
                'order_status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'history' => $history,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to track order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
