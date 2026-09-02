"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Package,
  ShoppingCart,
} from "lucide-react";
import { admin } from "@/lib/api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import type { User, Order } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      admin.customers.get(customerId),
      admin.orders.list({ customer: customerId, page_size: 50 }),
    ])
      .then(([customerRes, ordersRes]) => {
        setCustomer(customerRes.data.data);
        setOrders(ordersRes.data.results);
      })
      .catch(() => {
        toast.error("Failed to load customer");
        router.push("/admin/customers");
      })
      .finally(() => setLoading(false));
  }, [customerId, router]);

  const totalSpending = orders.reduce(
    (sum, o) => sum + parseFloat(o.total),
    0
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-brand-800 rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-brand-900 border border-brand-800 rounded-xl p-6">
            <div className="h-6 w-32 bg-brand-800 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-brand-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Customer Details</h1>
      </div>

      <div className="bg-brand-900 border border-brand-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {customer.first_name?.[0]}{customer.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {customer.first_name} {customer.last_name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-brand-300">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(customer.date_joined)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium rounded-full",
                  customer.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {customer.is_active ? "Active" : "Inactive"}
              </span>
              {customer.is_staff && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-accent-500/20 text-accent-400">
                  Staff
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-brand-400">Total Orders</p>
              <p className="text-xl font-bold text-white">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-brand-400">Total Spending</p>
              <p className="text-xl font-bold text-white">
                {formatPrice(totalSpending)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <p className="text-sm text-brand-400">Last Order</p>
              <p className="text-sm font-bold text-white">
                {orders.length > 0
                  ? formatDate(orders[0].created_at)
                  : "No orders"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-900 border border-brand-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-800">
          <h3 className="text-lg font-semibold text-white">Order History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brand-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = ORDER_STATUSES[order.status] || {
                    label: order.status,
                    color: "bg-brand-800 text-brand-300",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-brand-800/50">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-accent-400 hover:text-accent-300"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-brand-300">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-white">
                        {formatPrice(parseFloat(order.total))}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                            statusInfo.color
                          )}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
