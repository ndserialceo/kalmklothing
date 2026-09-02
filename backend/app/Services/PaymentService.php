<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
    public function generateReference(): string
    {
        return 'KLM-PAY-'.strtoupper(Str::random(8));
    }

    public function initializePaystack(Order $order, string $email, float $amount, string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('paystack.secret_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $email,
            'amount' => (int) ($amount * 100),
            'reference' => $reference,
            'callback_url' => config('paystack.callback_url'),
            'metadata' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        $data = $response->json();

        if (! isset($data['status']) || ! $data['status']) {
            throw new \RuntimeException($data['message'] ?? 'Paystack initialization failed');
        }

        return [
            'authorization_url' => $data['data']['authorization_url'] ?? null,
            'access_code' => $data['data']['access_code'] ?? null,
            'reference' => $reference,
        ];
    }

    public function verifyPaystack(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('paystack.secret_key'),
        ])->get("https://api.paystack.co/transaction/verify/{$reference}");

        $data = $response->json();

        if (isset($data['status']) && $data['status'] && $data['data']['status'] === 'success') {
            return [
                'status' => 'success',
                'data' => $data['data'],
            ];
        }

        return [
            'status' => 'failed',
            'data' => $data['data'] ?? null,
        ];
    }

    public function initializeFlutterwave(Order $order, string $email, float $amount, string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('flutterwave.secret_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => $reference,
            'amount' => $amount,
            'currency' => $order->currency ?? 'NGN',
            'redirect_url' => config('flutterwave.callback_url'),
            'customer' => [
                'email' => $email,
                'name' => $order->full_name,
                'phonenumber' => $order->phone,
            ],
            'meta' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ],
        ]);

        $data = $response->json();

        if (! isset($data['status']) || $data['status'] !== 'success') {
            throw new \RuntimeException($data['message'] ?? 'Flutterwave initialization failed');
        }

        return [
            'authorization_url' => $data['data']['link'] ?? null,
            'reference' => $reference,
        ];
    }

    public function verifyFlutterwave(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('flutterwave.secret_key'),
        ])->get("https://api.flutterwave.com/v3/transactions/verify?tx_ref={$reference}");

        $data = $response->json();

        if (isset($data['status']) && $data['status'] === 'success' && ($data['data']['status'] ?? '') === 'successful') {
            return [
                'status' => 'success',
                'data' => $data['data'],
            ];
        }

        return [
            'status' => 'failed',
            'data' => $data['data'] ?? null,
        ];
    }

    public function verifyPaystackWebhook(string $payload, string $signature): bool
    {
        $secret = config('paystack.secret_key');
        $computed = hash_hmac('sha512', $payload, $secret);

        return hash_equals($signature, $computed);
    }

    public function verifyFlutterwaveWebhook(string $payload, string $hash): bool
    {
        $secret = config('flutterwave.secret_key');
        $computed = hash_hmac('sha256', $payload, $secret);

        return hash_equals($hash, $computed);
    }

    public function handlePaystackWebhook(array $payload): void
    {
        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];

        if ($event !== 'charge.success') {
            return;
        }

        $reference = $data['reference'] ?? null;
        if (! $reference) {
            return;
        }

        $payment = Payment::where('gateway_reference', $reference)->first();
        if (! $payment || $payment->status === 'success') {
            return;
        }

        $payment->update([
            'status' => 'successful',
            'paid_at' => now(),
            'metadata' => array_merge($payment->metadata ?? [], $data),
        ]);

        $payment->order->update([
            'payment_status' => 'paid',
            'order_status' => 'confirmed',
        ]);
    }

    public function handleFlutterwaveWebhook(array $payload): void
    {
        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];

        if ($event !== 'charge.completed' || ($data['status'] ?? '') !== 'successful') {
            return;
        }

        $reference = $data['tx_ref'] ?? null;
        if (! $reference) {
            return;
        }

        $payment = Payment::where('gateway_reference', $reference)->first();
        if (! $payment || $payment->status === 'successful') {
            return;
        }

        $payment->update([
            'status' => 'successful',
            'paid_at' => now(),
            'metadata' => array_merge($payment->metadata ?? [], $data),
        ]);

        $payment->order->update([
            'payment_status' => 'paid',
            'order_status' => 'confirmed',
        ]);
    }
}
