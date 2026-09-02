<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function initialize(Request $request, int $orderId): JsonResponse
    {
        try {
            $order = Order::where('id', $orderId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            if ($order->payment_status === 'paid') {
                return response()->json([
                    'message' => 'Order is already paid',
                ], 422);
            }

            $reference = 'KLM-'.Str::upper(Str::random(8)).'-'.time();

            $gateway = config('services.payment.default', 'paystack');

            if ($gateway === 'paystack') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.config('services.paystack.secret_key'),
                    'Content-Type' => 'application/json',
                ])->post('https://api.paystack.co/transaction/initialize', [
                    'email' => $order->email,
                    'amount' => (int) ($order->total * 100),
                    'reference' => $reference,
                    'callback_url' => config('services.payment.callback_url'),
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                ]);

                $data = $response->json();

                if (! isset($data['status']) || ! $data['status']) {
                    return response()->json([
                        'message' => 'Payment initialization failed',
                        'error' => $data['message'] ?? 'Unknown error',
                    ], 422);
                }

                Payment::create([
                    'order_id' => $order->id,
                    'amount' => $order->total,
                    'currency' => $order->currency ?? 'NGN',
                    'payment_method' => 'card',
                    'payment_gateway' => 'paystack',
                    'gateway_reference' => $reference,
                    'status' => 'pending',
                    'metadata' => $data['data'] ?? null,
                ]);

                $order->update([
                    'payment_reference' => $reference,
                    'payment_gateway' => 'paystack',
                ]);

                return response()->json([
                    'message' => 'Payment initialized',
                    'data' => [
                        'authorization_url' => $data['data']['authorization_url'] ?? null,
                        'reference' => $reference,
                        'access_code' => $data['data']['access_code'] ?? null,
                    ],
                ]);
            }

            if ($gateway === 'flutterwave') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.config('services.flutterwave.secret_key'),
                    'Content-Type' => 'application/json',
                ])->post('https://api.flutterwave.com/v3/payments', [
                    'tx_ref' => $reference,
                    'amount' => $order->total,
                    'currency' => $order->currency ?? 'NGN',
                    'redirect_url' => config('services.payment.callback_url'),
                    'customer' => [
                        'email' => $order->email,
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
                    return response()->json([
                        'message' => 'Payment initialization failed',
                        'error' => $data['message'] ?? 'Unknown error',
                    ], 422);
                }

                Payment::create([
                    'order_id' => $order->id,
                    'amount' => $order->total,
                    'currency' => $order->currency ?? 'NGN',
                    'payment_method' => 'card',
                    'payment_gateway' => 'flutterwave',
                    'gateway_reference' => $reference,
                    'status' => 'pending',
                    'metadata' => $data['data'] ?? null,
                ]);

                $order->update([
                    'payment_reference' => $reference,
                    'payment_gateway' => 'flutterwave',
                ]);

                return response()->json([
                    'message' => 'Payment initialized',
                    'data' => [
                        'authorization_url' => $data['data']['link'] ?? null,
                        'reference' => $reference,
                    ],
                ]);
            }

            return response()->json([
                'message' => 'Unsupported payment gateway',
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment initialization failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function verify(Request $request): JsonResponse
    {
        try {
            $reference = $request->query('reference') ?? $request->query('tx_ref');

            if (! $reference) {
                return response()->json([
                    'message' => 'Reference is required',
                ], 422);
            }

            $payment = Payment::where('gateway_reference', $reference)->firstOrFail();
            $order = $payment->order;

            $gateway = $payment->payment_gateway;

            if ($gateway === 'paystack') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.config('services.paystack.secret_key'),
                ])->get("https://api.paystack.co/transaction/verify/{$reference}");

                $data = $response->json();

                if (isset($data['status']) && $data['status'] && $data['data']['status'] === 'success') {
                    $payment->update([
                        'status' => 'success',
                        'paid_at' => now(),
                        'metadata' => array_merge($payment->metadata ?? [], $data['data']),
                    ]);

                    $order->update([
                        'payment_status' => 'paid',
                        'order_status' => 'processing',
                    ]);

                    return response()->json([
                        'message' => 'Payment verified successfully',
                        'order' => $order->fresh(['items', 'payments']),
                    ]);
                }
            }

            if ($gateway === 'flutterwave') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.config('services.flutterwave.secret_key'),
                ])->get("https://api.flutterwave.com/v3/transactions/verify?tx_ref={$reference}");

                $data = $response->json();

                if (isset($data['status']) && $data['status'] === 'success' && $data['data']['status'] === 'successful') {
                    $payment->update([
                        'status' => 'success',
                        'paid_at' => now(),
                        'metadata' => array_merge($payment->metadata ?? [], $data['data']),
                    ]);

                    $order->update([
                        'payment_status' => 'paid',
                        'order_status' => 'processing',
                    ]);

                    return response()->json([
                        'message' => 'Payment verified successfully',
                        'order' => $order->fresh(['items', 'payments']),
                    ]);
                }
            }

            $payment->update(['status' => 'failed']);
            $order->update(['payment_status' => 'failed']);

            return response()->json([
                'message' => 'Payment verification failed',
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Payment not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment verification failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function webhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();

            if ($request->header('X-Paystack-Signature')) {
                $signature = $request->header('X-Paystack-Signature');
                $secret = config('services.paystack.secret_key');
                $computed = hash_hmac('sha512', $request->getContent(), $secret);

                if (! hash_equals($signature, $computed)) {
                    return response()->json(['message' => 'Invalid signature'], 400);
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'charge.success') {
                    $reference = $data['reference'] ?? null;

                    if ($reference) {
                        $payment = Payment::where('gateway_reference', $reference)->first();

                        if ($payment && $payment->status !== 'success') {
                            $payment->update([
                                'status' => 'success',
                                'paid_at' => now(),
                                'metadata' => array_merge($payment->metadata ?? [], $data),
                            ]);

                            $payment->order->update([
                                'payment_status' => 'paid',
                                'order_status' => 'processing',
                            ]);
                        }
                    }
                }
            }

            if ($request->header('Flutterwave-Webhook-Hash')) {
                $hash = $request->header('Flutterwave-Webhook-Hash');
                $secret = config('services.flutterwave.secret_key');
                $computed = hash_hmac('sha256', $request->getContent(), $secret);

                if (! hash_equals($hash, $computed)) {
                    return response()->json(['message' => 'Invalid signature'], 400);
                }

                $event = $payload['event'] ?? '';
                $data = $payload['data'] ?? [];

                if ($event === 'charge.completed' && ($data['status'] ?? '') === 'successful') {
                    $reference = $data['tx_ref'] ?? null;

                    if ($reference) {
                        $payment = Payment::where('gateway_reference', $reference)->first();

                        if ($payment && $payment->status !== 'success') {
                            $payment->update([
                                'status' => 'success',
                                'paid_at' => now(),
                                'metadata' => array_merge($payment->metadata ?? [], $data),
                            ]);

                            $payment->order->update([
                                'payment_status' => 'paid',
                                'order_status' => 'processing',
                            ]);
                        }
                    }
                }
            }

            return response()->json(['message' => 'Webhook processed']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function history(Request $request): JsonResponse
    {
        try {
            $payments = Payment::whereHas('order', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
                ->with('order')
                ->latest()
                ->paginate($request->get('per_page', 15));

            return response()->json($payments);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payment history',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
