<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.address_line_1' => ['required', 'string', 'max:500'],
            'shipping_address.address_line_2' => ['nullable', 'string', 'max:500'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state' => ['required', 'string', 'max:100'],
            'shipping_address.country' => ['required', 'string', 'max:100'],
            'delivery_method' => ['nullable', 'string', 'in:standard,express'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Please provide your full name.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'phone.required' => 'Phone number is required.',
            'shipping_address.required' => 'Please provide a shipping address.',
            'shipping_address.address_line_1.required' => 'Address line 1 is required.',
            'shipping_address.city.required' => 'City is required.',
            'shipping_address.state.required' => 'State is required.',
            'shipping_address.country.required' => 'Country is required.',
        ];
    }
}
