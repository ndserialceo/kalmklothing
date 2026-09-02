<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function sendOrderConfirmation(Order $order): void
    {
        $this->createNotification(
            $order->user_id,
            'order_confirmation',
            'Order Confirmed',
            "Your order #{$order->order_number} has been confirmed. Total: ₦".number_format($order->total, 2),
            ['order_id' => $order->id, 'order_number' => $order->order_number]
        );

        // TODO: Send email via Mail facade
        // Mail::to($order->email)->send(new OrderConfirmationMail($order));
    }

    public function sendPaymentConfirmation(Order $order): void
    {
        $this->createNotification(
            $order->user_id,
            'payment_confirmation',
            'Payment Received',
            'Payment of ₦'.number_format($order->total, 2)." received for order #{$order->order_number}",
            ['order_id' => $order->id, 'order_number' => $order->order_number]
        );

        // TODO: Send email
    }

    public function sendOrderStatusUpdate(Order $order, string $oldStatus): void
    {
        $statusMessages = [
            'confirmed' => 'Your order has been confirmed and is being prepared.',
            'processing' => 'Your order is now being processed.',
            'ready_for_dispatch' => 'Your order is ready for dispatch.',
            'shipped' => 'Your order has been shipped and is on its way to you.',
            'delivered' => 'Your order has been delivered. Enjoy your purchase!',
            'cancelled' => 'Your order has been cancelled.',
            'returned' => 'Your order return has been initiated.',
            'refunded' => 'Your order has been refunded.',
        ];

        $message = $statusMessages[$order->order_status] ?? "Order status updated to {$order->order_status}";

        $this->createNotification(
            $order->user_id,
            'order_status_update',
            'Order Status Updated',
            $message,
            [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'old_status' => $oldStatus,
                'new_status' => $order->order_status,
            ]
        );

        // TODO: Send email for status updates
    }

    public function sendLowStockAlert(Product $product): void
    {
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();

        foreach ($admins as $admin) {
            $this->createNotification(
                $admin->id,
                'low_stock_alert',
                'Low Stock Alert',
                "{$product->name} (SKU: {$product->sku}) has only {$product->stock_quantity} units remaining.",
                ['product_id' => $product->id, 'stock_quantity' => $product->stock_quantity]
            );
        }

        // TODO: Send WhatsApp notification to store manager
    }

    public function createNotification(int $userId, string $type, string $title, string $message, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    public function sendWhatsAppMessage(string $phone, string $message): void
    {
        // TODO: Integrate with WhatsApp Business API
        // Example: Use WhatsApp Cloud API or a provider like Twilio
    }

    public function sendOrderWhatsAppConfirmation(Order $order): void
    {
        if (! $order->whatsapp) {
            return;
        }

        $message = "Hi {$order->full_name}! Your Kalmklothing order #{$order->order_number} ".
            'has been confirmed. Total: ₦'.number_format($order->total, 2).
            ". We'll notify you when it ships.";

        $this->sendWhatsAppMessage($order->whatsapp, $message);
    }
}
