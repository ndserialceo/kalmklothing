<?php

namespace App\Services;

use App\Models\Order;

class InvoiceService
{
    public function generateInvoice(Order $order): string
    {
        $data = $this->getInvoiceData($order);

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice '.$data['order_number'].'</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; }
        .brand h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
        .brand p { color: #666; margin: 5px 0 0; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { color: #e94560; margin: 0; font-size: 24px; }
        .invoice-title p { color: #666; margin: 5px 0 0; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .details .box { width: 48%; }
        .details .box h3 { color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .details .box p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1a1a2e; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #ddd; }
        .totals { text-align: right; margin-top: 20px; }
        .totals table { width: 300px; margin-left: auto; }
        .totals td { padding: 8px 12px; }
        .totals .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #1a1a2e; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <h1>KALMKLOTHING</h1>
            <p>Premium Nigerian Fashion</p>
            <p>Lagos, Nigeria</p>
            <p>hello@kalmklothing.com</p>
        </div>
        <div class="invoice-title">
            <h2>INVOICE</h2>
            <p><strong>Invoice #: </strong>'.$data['order_number'].'</p>
            <p><strong>Date: </strong>'.$data['date'].'</p>
            <p><strong>Status: </strong>'.ucfirst($data['payment_status']).'</p>
        </div>
    </div>

    <div class="details">
        <div class="box">
            <h3>Bill To:</h3>
            <p>'.e($data['customer_name']).'</p>
            <p>'.e($data['customer_email']).'</p>
            <p>'.e($data['customer_phone']).'</p>
            <p>'.e($data['shipping_address']).'</p>
        </div>
        <div class="box">
            <h3>Payment Info:</h3>
            <p><strong>Method: </strong>'.e($data['payment_method'] ?? 'Pay on Delivery').'</p>
            <p><strong>Gateway: </strong>'.e($data['payment_gateway'] ?? 'N/A').'</p>
            <p><strong>Reference: </strong>'.e($data['payment_reference'] ?? 'N/A').'</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Size/Color</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>';

        foreach ($data['items'] as $item) {
            $html .= '<tr>
                <td>'.e($item['name']).'</td>
                <td>'.e($item['variant']).'</td>
                <td>'.$item['quantity'].'</td>
                <td>₦'.number_format($item['unit_price'], 2).'</td>
                <td>₦'.number_format($item['total_price'], 2).'</td>
            </tr>';
        }

        $html .= '</tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td>₦'.number_format($data['subtotal'], 2).'</td>
            </tr>';

        if ($data['discount_amount'] > 0) {
            $html .= '<tr>
                <td>Discount:</td>
                <td>-₦'.number_format($data['discount_amount'], 2).'</td>
            </tr>';
        }

        $html .= '<tr>
                <td>Shipping:</td>
                <td>'.($data['shipping_amount'] > 0 ? '₦'.number_format($data['shipping_amount'], 2) : 'FREE').'</td>
            </tr>
            <tr class="grand-total">
                <td>Total:</td>
                <td>₦'.number_format($data['total'], 2).'</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Thank you for shopping with Kalmklothing!</p>
        <p>For inquiries, contact us at hello@kalmklothing.com or +234 XXX XXX XXXX</p>
    </div>
</body>
</html>';

        return $html;
    }

    public function getInvoiceData(Order $order): array
    {
        $order->load(['items.product', 'items.variant', 'payments']);

        $items = $order->items->map(function ($item) {
            $variantInfo = collect([$item->size, $item->color])->filter()->implode(' / ');

            return [
                'name' => $item->product_name,
                'variant' => $variantInfo ?: '-',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
            ];
        })->toArray();

        $shipping = $order->shipping_address;
        $shippingAddress = collect([
            $shipping['address_line_1'] ?? null,
            $shipping['city'] ?? null,
            $shipping['state'] ?? null,
            $shipping['country'] ?? 'Nigeria',
        ])->filter()->implode(', ');

        $lastPayment = $order->payments->last();

        return [
            'order_number' => $order->order_number,
            'date' => $order->created_at->format('M d, Y'),
            'payment_status' => $order->payment_status,
            'customer_name' => $order->full_name,
            'customer_email' => $order->email,
            'customer_phone' => $order->phone,
            'shipping_address' => $shippingAddress,
            'payment_method' => $lastPayment?->payment_method,
            'payment_gateway' => $lastPayment?->payment_gateway,
            'payment_reference' => $order->payment_reference,
            'items' => $items,
            'subtotal' => (float) $order->subtotal,
            'discount_amount' => (float) $order->discount_amount,
            'shipping_amount' => (float) $order->shipping_amount,
            'tax_amount' => (float) $order->tax_amount,
            'total' => (float) $order->total,
            'currency' => $order->currency,
        ];
    }
}
