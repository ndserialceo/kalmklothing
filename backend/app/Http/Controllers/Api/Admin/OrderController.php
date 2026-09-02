<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'items.product', 'payments']);

            if ($request->filled('status')) {
                $query->where('order_status', $request->status);
            }

            if ($request->filled('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            $orders = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $order = Order::with(['user', 'items.product', 'items.variant', 'payments', 'couponUsages.coupon'])
                ->findOrFail($id);

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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'order_status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            ]);

            $statusTransitions = [
                'pending' => ['processing', 'cancelled'],
                'processing' => ['shipped', 'cancelled'],
                'shipped' => ['delivered'],
                'delivered' => [],
                'cancelled' => [],
            ];

            $currentStatus = $order->order_status;
            $newStatus = $validated['order_status'];

            if (! in_array($newStatus, $statusTransitions[$currentStatus] ?? [])) {
                return response()->json([
                    'message' => "Cannot transition from '{$currentStatus}' to '{$newStatus}'",
                ], 422);
            }

            $updateData = ['order_status' => $newStatus];

            if ($newStatus === 'shipped') {
                $updateData['shipped_at'] = now();
            } elseif ($newStatus === 'delivered') {
                $updateData['delivered_at'] = now();
                $updateData['payment_status'] = 'paid';
            }

            $order->update($updateData);

            return response()->json([
                'message' => 'Order status updated',
                'data' => $order->fresh(['user', 'items.product', 'payments']),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update order status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'notes' => ['required', 'string'],
            ]);

            $order->update(['notes' => $validated['notes']]);

            return response()->json([
                'message' => 'Note added to order',
                'data' => $order->fresh(),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Order not found',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add note',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
