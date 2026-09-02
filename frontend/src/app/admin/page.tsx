"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { admin } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import type { DashboardStats } from "@/lib/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await admin.dashboard();
      setStats(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Sales",
      value: stats ? formatPrice(Number(stats.total_revenue)) : "₦0",
      change: stats?.revenue_growth ?? 0,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Total Orders",
      value: stats?.total_orders?.toLocaleString() ?? "0",
      change: stats?.order_growth ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Customers",
      value: stats?.total_customers?.toLocaleString() ?? "0",
      change: 0,
      icon: Users,
      color: "bg-purple-500/10 text-purple-400",
    },
    {
      label: "Products",
      value: stats?.total_products?.toLocaleString() ?? "0",
      change: 0,
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-400",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="h-6 bg-gray-800 rounded w-40 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            {card.change !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {card.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`text-xs font-medium ${
                    card.change > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {card.change > 0 ? "+" : ""}
                  {card.change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Revenue Chart</h2>
          </div>
          <div className="p-6">
            {stats?.revenue_by_day && stats.revenue_by_day.length > 0 ? (
              <div className="flex items-end gap-2 h-48">
                {stats.revenue_by_day.slice(-14).map((day, i) => {
                  const maxVal = Math.max(
                    ...stats.revenue_by_day.map((d) => Number(d.amount))
                  );
                  const height = maxVal > 0 ? (Number(day.amount) / maxVal) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-accent-600 rounded-t min-h-[4px] transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString("en", { day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 70, 80].map(
                  (h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gray-700 rounded-t min-h-[4px]"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Orders by Status</h2>
          </div>
          <div className="p-6 space-y-3">
            {stats?.orders_by_status && stats.orders_by_status.length > 0
              ? stats.orders_by_status.map((s) => {
                  const status = ORDER_STATUSES[s.status];
                  const total = stats.total_orders || 1;
                  const pct = (s.count / total) * 100;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">
                          {status?.label || s.status}
                        </span>
                        <span className="text-sm text-gray-500">{s.count}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-accent-600 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              : [
                  { label: "Pending", count: 12, color: "bg-yellow-500" },
                  { label: "Processing", count: 8, color: "bg-blue-500" },
                  { label: "Shipped", count: 15, color: "bg-purple-500" },
                  { label: "Delivered", count: 45, color: "bg-green-500" },
                  { label: "Cancelled", count: 3, color: "bg-red-500" },
                ].map((s) => {
                  const pct = (s.count / 83) * 100;
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{s.label}</span>
                        <span className="text-sm text-gray-500">{s.count}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`${s.color} h-2 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-sm text-accent-400 hover:text-accent-300"
          >
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.map((order) => {
                  const status = ORDER_STATUSES[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {order.shipping_address?.first_name}{" "}
                        {order.shipping_address?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status?.color || "bg-gray-100 text-gray-800"}`}
                        >
                          {status?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
