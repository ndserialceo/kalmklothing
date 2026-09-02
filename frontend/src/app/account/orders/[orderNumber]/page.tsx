"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, RotateCcw } from "lucide-react";
import { orders as ordersApi } from "@/lib/api";
import { formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";

const ORDER_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => ordersApi.getOrder(orderNumber),
  });

  const order = data?.data?.data;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-brand-100 p-6 animate-pulse">
        <div className="h-6 w-40 bg-brand-100 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-brand-100 rounded" />
          <div className="h-4 w-3/4 bg-brand-100 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg border border-brand-100 p-8 text-center">
        <Package className="h-12 w-12 text-brand-200 mx-auto mb-3" />
        <p className="text-brand-500 mb-4">Order not found.</p>
        <Link href="/account/orders">
          <Button variant="secondary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const currentStepIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="p-2 rounded-lg hover:bg-brand-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-brand-600" />
        </Link>
        <div>
          <h2 className="font-heading text-lg font-semibold text-brand-900">Order #{order.order_number}</h2>
          <p className="text-xs text-brand-400">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="ml-auto">
          <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium", status.color)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h3 className="text-sm font-medium text-brand-900 mb-5">Order Status</h3>
        <div className="flex items-center justify-between">
          {ORDER_STEPS.map((step, i) => {
            const stepStatus = ORDER_STATUSES[step];
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex-1 relative">
                {i > 0 && (
                  <div className={cn("absolute top-4 right-1/2 w-full h-0.5 -translate-x-1/2",
                    isCompleted ? "bg-brand-900" : "bg-brand-200")} />
                )}
                <div className="relative flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center z-10 text-xs font-medium",
                    isCompleted ? "bg-brand-900 text-white" : "bg-brand-100 text-brand-400",
                    isCurrent && "ring-2 ring-brand-900 ring-offset-2")}>
                    {isCompleted ? "✓" : i + 1}
                  </div>
                  <p className={cn("text-[11px] mt-2 text-center font-medium",
                    isCompleted ? "text-brand-900" : "text-brand-400")}>
                    {stepStatus.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h3 className="text-sm font-medium text-brand-900 mb-5">Items</h3>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-16 h-20 bg-brand-50 rounded overflow-hidden flex-shrink-0">
                {item.product_image && (
                  <Image src={getImageUrl(item.product_image)} alt={item.product_name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-900 line-clamp-1">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-brand-400 mt-0.5">{item.variant_name}</p>
                )}
                <p className="text-xs text-brand-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-brand-900">{formatPrice(parseFloat(item.total))}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-white rounded-lg border border-brand-100 p-6">
            <h3 className="text-sm font-medium text-brand-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" />
              Shipping Address
            </h3>
            <div className="text-sm text-brand-600 space-y-0.5">
              <p className="font-medium text-brand-900">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address_line_1}</p>
              {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.country}</p>
              <p className="pt-1">{order.shipping_address.phone}</p>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-white rounded-lg border border-brand-100 p-6">
          <h3 className="text-sm font-medium text-brand-900 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-400" />
            Payment Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-500">Subtotal</span>
              <span className="text-brand-900">{formatPrice(parseFloat(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-500">Shipping</span>
              <span className="text-brand-900">{formatPrice(parseFloat(order.shipping_cost))}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(parseFloat(order.discount))}</span>
              </div>
            )}
            <hr className="border-brand-100" />
            <div className="flex justify-between font-semibold">
              <span className="text-brand-900">Total</span>
              <span className="text-brand-900">{formatPrice(parseFloat(order.total))}</span>
            </div>
            {order.payment_method && (
              <p className="text-xs text-brand-400 pt-1">via {order.payment_method}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/shop">
          <Button variant="secondary" size="sm">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reorder
          </Button>
        </Link>
        {order.tracking_number && (
          <Button variant="secondary" size="sm">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            Track Order
          </Button>
        )}
      </div>
    </div>
  );
}
