<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'string', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'minimum_order' => ['sometimes', 'numeric', 'min:0'],
            'maximum_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['nullable', 'integer', 'min:1'],
            'applicable_products' => ['nullable', 'array'],
            'applicable_products.*' => ['integer', 'exists:products,id'],
            'applicable_categories' => ['nullable', 'array'],
            'applicable_categories.*' => ['integer', 'exists:categories,id'],
            'starts_at' => ['nullable', 'date', 'after_or_equal:today'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Coupon code is required.',
            'code.unique' => 'This coupon code already exists.',
            'type.required' => 'Coupon type is required.',
            'type.in' => 'Coupon type must be either percentage or fixed.',
            'value.required' => 'Coupon value is required.',
            'value.numeric' => 'Value must be a valid number.',
            'value.min' => 'Value cannot be negative.',
            'minimum_order.numeric' => 'Minimum order must be a valid number.',
            'maximum_discount.numeric' => 'Maximum discount must be a valid number.',
            'usage_limit.integer' => 'Usage limit must be a whole number.',
            'per_customer_limit.integer' => 'Per customer limit must be a whole number.',
            'starts_at.date' => 'Start date must be a valid date.',
            'starts_at.after_or_equal' => 'Start date cannot be in the past.',
            'expires_at.date' => 'Expiry date must be a valid date.',
            'expires_at.after' => 'Expiry date must be after the start date.',
        ];
    }
}
