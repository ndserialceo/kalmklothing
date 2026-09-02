<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Please select a product to review.',
            'product_id.exists' => 'The selected product does not exist.',
            'rating.required' => 'Please provide a rating.',
            'rating.integer' => 'Rating must be a whole number.',
            'rating.between' => 'Rating must be between 1 and 5.',
            'title.required' => 'Please provide a review title.',
            'body.required' => 'Please write your review.',
            'image.image' => 'Please upload a valid image file.',
            'image.max' => 'Image must not exceed 2MB.',
        ];
    }
}
