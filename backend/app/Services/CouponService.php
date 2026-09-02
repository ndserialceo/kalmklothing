<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Product;
use Carbon\Carbon;

class CouponService
{
    public function validateAndApply(string $code, int $userId, float $cartTotal, array $cartItems): ?array
    {
        $coupon = Coupon::where('code', strtoupper($code))->first();

        if (! $coupon) {
            throw new \InvalidArgumentException('Invalid coupon code.');
        }

        if (! $coupon->is_active) {
            throw new \InvalidArgumentException('This coupon is no longer active.');
        }

        $now = Carbon::now();

        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw new \InvalidArgumentException('This coupon is not yet valid.');
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            throw new \InvalidArgumentException('This coupon has expired.');
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            throw new \InvalidArgumentException('This coupon has reached its usage limit.');
        }

        if ($coupon->per_customer_limit) {
            $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $userId)
                ->count();

            if ($userUsageCount >= $coupon->per_customer_limit) {
                throw new \InvalidArgumentException('You have already used this coupon the maximum number of times.');
            }
        }

        if ($coupon->minimum_order && $cartTotal < $coupon->minimum_order) {
            throw new \InvalidArgumentException(
                'Minimum order of ₦'.number_format($coupon->minimum_order, 2).' required.'
            );
        }

        if ($coupon->applicable_products) {
            $productIds = collect($cartItems)->pluck('product_id')->toArray();
            $applicableProducts = $coupon->applicable_products;

            $hasApplicable = false;
            foreach ($productIds as $productId) {
                if (in_array($productId, $applicableProducts)) {
                    $hasApplicable = true;
                    break;
                }
            }

            if (! $hasApplicable) {
                throw new \InvalidArgumentException('This coupon is not applicable to items in your cart.');
            }
        }

        if ($coupon->applicable_categories) {
            $productIds = collect($cartItems)->pluck('product_id')->toArray();
            $categories = Product::whereIn('id', $productIds)
                ->pluck('category_id')
                ->toArray();

            $hasApplicable = false;
            foreach ($categories as $categoryId) {
                if (in_array($categoryId, $coupon->applicable_categories)) {
                    $hasApplicable = true;
                    break;
                }
            }

            if (! $hasApplicable) {
                throw new \InvalidArgumentException('This coupon is not applicable to items in your cart.');
            }
        }

        $discountAmount = $coupon->getDiscountAmount($cartTotal);

        return [
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'discount_amount' => $discountAmount,
        ];
    }

    public function recordUsage(int $couponId, int $userId, int $orderId): CouponUsage
    {
        Coupon::where('id', $couponId)->increment('used_count');

        return CouponUsage::create([
            'coupon_id' => $couponId,
            'user_id' => $userId,
            'order_id' => $orderId,
            'used_at' => now(),
        ]);
    }
}
