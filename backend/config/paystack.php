<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Paystack Configuration
    |--------------------------------------------------------------------------
    */

    'public_key' => env('PAYSTACK_PUBLIC_KEY', ''),
    'secret_key' => env('PAYSTACK_SECRET_KEY', ''),
    'callback_url' => env('PAYSTACK_CALLBACK_URL', ''),
    'merchant_email' => env('PAYSTACK_MERCHANT_EMAIL', ''),

];
