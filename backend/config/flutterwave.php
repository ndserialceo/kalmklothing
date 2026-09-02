<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Flutterwave Configuration
    |--------------------------------------------------------------------------
    */

    'public_key' => env('FLUTTERWAVE_PUBLIC_KEY', ''),
    'secret_key' => env('FLUTTERWAVE_SECRET_KEY', ''),
    'encryption_key' => env('FLUTTERWAVE_ENCRYPTION_KEY', ''),
    'callback_url' => env('FLUTTERWAVE_CALLBACK_URL', ''),

];
