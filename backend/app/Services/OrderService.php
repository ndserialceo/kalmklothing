<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected ShippingService $shippingService;

    protected CouponService $couponService;

    protected NotificationService $notificationService;

    public function __construct(
        ShippingService $shippingService,
        CouponService $couponService,
        NotificationService $notificationService
    ) {
        $this->shippingService = $shippingService;
        $this->couponService = $couponService;
        $this->notificationService = $notificationService;
    }

    public function createOrder(int $userId, array $cartItems, array $shippingAddress, ?string $couponCode = null): Order
    {
        return DB::transaction(function () use ($userId, $cartItems, $shippingAddress, $couponCode) {
            $subtotal = 0;
            $orderItems = [];
            $totalWeight = 0;

            foreach ($cartItems as $item) {
                $product = Product::findOrFail($item['product_id']);
                $variant = isset($item['variant_id'])
                    ? ProductVariant::findOrFail($item['variant_id'])
                    : null;

                $unitPrice = $variant && $variant->price
                    ? $variant->price
                    : $product->effective_price;

                $itemTotal = $unitPrice * $item['quantity'];
                $subtotal += $itemTotal;
                $totalWeight += ($product->weight ?? 0.5) * $item['quantity'];

                $primaryImage = $product->images()->where('is_primary', true)->first();
                $productImage = $primaryImage?->image_url ?? $product->images()->first()?->image_url;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'product_image' => $productImage,
                    'size' => $variant?->size,
                    'color' => $variant?->color,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                ];
            }

            $discountAmount = 0;
            $couponId = null;

            if ($couponCode) {
                $coupon = $this->couponService->validateAndApply(
                    $couponCode,
                    $userId,
                    $subtotal,
                    $cartItems
                );

                if ($coupon) {
                    $discountAmount = $coupon['discount_amount'];
                    $couponId = $coupon['coupon_id'];
                }
            }

            $shippingAmount = $this->shippingService->calculateShipping(
                $shippingAddress['state'] ?? '',
                $subtotal,
                $totalWeight
            );

            $total = max(0, $subtotal - $discountAmount + $shippingAmount);

            $order = Order::create([
                'user_id' => $userId,
                'full_name' => $shippingAddress['full_name'] ?? '',
                'email' => $shippingAddress['email'] ?? '',
                'phone' => $shippingAddress['phone'] ?? '',
                'whatsapp' => $shippingAddress['whatsapp'] ?? null,
                'shipping_address' => $shippingAddress,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_amount' => $shippingAmount,
                'tax_amount' => 0,
                'total' => $total,
                'currency' => 'NGN',
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'notes' => $shippingAddress['notes'] ?? null,
            ]);

            foreach ($orderItems as $orderItem) {
                OrderItem::create(array_merge($orderItem, ['order_id' => $order->id]));

                if ($orderItem['product_variant_id']) {
                    ProductVariant::where('id', $orderItem['product_variant_id'])
                        ->decrement('stock_quantity', $orderItem['quantity']);
                } else {
                    Product::where('id', $orderItem['product_id'])
                        ->decrement('stock_quantity', $orderItem['quantity']);
                }

                $this->checkLowStock(
                    $orderItem['product_variant_id']
                        ? ProductVariant::find($orderItem['product_variant_id'])
                        : Product::find($orderItem['product_id'])
                );
            }

            if ($couponId) {
                $this->couponService->recordUsage($couponId, $userId, $order->id);
            }

            $order->load(['items.product', 'items.variant']);

            return $order;
        });
    }

    public function updateOrderStatus(Order $order, string $newStatus): Order
    {
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['processing', 'cancelled'],
            'processing' => ['ready_for_dispatch', 'cancelled'],
            'ready_for_dispatch' => ['shipped'],
            'shipped' => ['delivered'],
            'delivered' => ['returned'],
            'returned' => ['refunded'],
        ];

        $currentStatus = $order->order_status;

        if (! isset($validTransitions[$currentStatus]) || ! in_array($newStatus, $validTransitions[$currentStatus])) {
            throw new \InvalidArgumentException(
                "Cannot transition from '{$currentStatus}' to '{$newStatus}'"
            );
        }

        $oldStatus = $order->order_status;

        $updateData = ['order_status' => $newStatus];

        if ($newStatus === 'shipped') {
            $updateData['shipped_at'] = now();
        }

        if ($newStatus === 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        $this->notificationService->sendOrderStatusUpdate($order, $oldStatus);

        return $order->fresh();
    }

    public function cancelOrder(Order $order): Order
    {
        $cancellableStatuses = ['pending', 'confirmed', 'processing'];

        if (! in_array($order->order_status, $cancellableStatuses)) {
            throw new \RuntimeException(
                "Order cannot be cancelled in '{$order->order_status}' status"
            );
        }

        return DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    ProductVariant::where('id', $item->product_variant_id)
                        ->increment('stock_quantity', $item->quantity);
                } else {
                    Product::where('id', $item->product_id)
                        ->increment('stock_quantity', $item->quantity);
                }
            }

            $order->update([
                'order_status' => 'cancelled',
            ]);

            $this->notificationService->sendOrderStatusUpdate($order, 'pending');

            return $order->fresh();
        });
    }

    protected function checkLowStock($model): void
    {
        if ($model instanceof Product && $model->stock_quantity <= $model->low_stock_threshold) {
            $this->notificationService->sendLowStockAlert($model);
        }
    }
}
