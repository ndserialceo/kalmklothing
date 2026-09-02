"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  CreditCard,
  StickyNote,
} from "lucide-react";
import { admin } from "@/lib/api";
import { formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const { data } = await admin.orders.get(params.id as string);
      setOrder(data.data);
      setStatus(data.data.status);
      setNotes(data.data.notes || "");
    } catch {
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await admin.orders.updateStatus(order.id, status);
      fetchOrder();
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderStatus = ORDER_STATUSES[order.status];
  const payStatus = PAYMENT_STATUSES[order.payment_status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-gray-400">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Product
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Qty
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Price
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                            {item.product_image ? (
                              <img
                                src={getImageUrl(item.product_image)}
                                alt={item.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {item.product_name}
                            </p>
                            {item.variant_name && (
                              <p className="text-xs text-gray-400">
                                {item.variant_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 text-right">
                        {formatPrice(Number(item.unit_price))}
                      </td>
                      <td className="px-6 py-4 text-sm text-white text-right font-medium">
                        {formatPrice(Number(item.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-300">
                  {formatPrice(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-gray-300">
                  {formatPrice(Number(order.shipping_cost))}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-emerald-400">
                    -{formatPrice(Number(order.discount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-800">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Notes</h2>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
              placeholder="Order notes..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Update Status
            </h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 mb-3"
            >
              {Object.entries(ORDER_STATUSES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || status === order.status}
              className="w-full py-2.5 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Method</span>
                <span className="text-sm text-gray-300">
                  {order.payment_method || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${payStatus?.color || "bg-gray-100 text-gray-800"}`}
                >
                  {payStatus?.label || order.payment_status}
                </span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Reference</span>
                  <span className="text-sm text-gray-300 font-mono">
                    {order.payment_reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">
                Shipping Address
              </h2>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p className="font-medium text-white">
                {order.shipping_address?.first_name}{" "}
                {order.shipping_address?.last_name}
              </p>
              <p>{order.shipping_address?.address_line_1}</p>
              {order.shipping_address?.address_line_2 && (
                <p>{order.shipping_address.address_line_2}</p>
              )}
              <p>
                {order.shipping_address?.city},{" "}
                {order.shipping_address?.state}
              </p>
              <p>{order.shipping_address?.country}</p>
              <p className="text-gray-400">
                {order.shipping_address?.phone}
              </p>
            </div>
          </div>

          {order.tracking_number && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                Tracking
              </h2>
              <p className="text-sm text-gray-300 font-mono">
                {order.tracking_number}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
