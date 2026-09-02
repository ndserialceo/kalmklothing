"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronDown, Eye, Filter } from "lucide-react";
import { orders as ordersApi } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

const STATUS_OPTIONS = [
  { value: "", label: "All Orders" },
  ...Object.entries(ORDER_STATUSES).map(([value, { label }]) => ({ value, label })),
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const params: Record<string, string | number> = {
    page: currentPage,
    page_size: 10,
    ordering: "-created_at",
  };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.getOrders(params),
  });

  const orders = data?.data?.results || [];
  const totalCount = data?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-brand-100 p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-brand-100 rounded" />
                <div className="h-3 w-32 bg-brand-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-brand-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-heading text-lg font-semibold text-brand-900">Order History</h2>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 border border-brand-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent-500">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders found"
            description={statusFilter ? "No orders match this filter." : "You haven't placed any orders yet."}
            actionLabel={!statusFilter ? "Start Shopping" : undefined}
            onAction={() => setStatusFilter("")}
          />
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order: any) => {
                const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                return (
                  <Link key={order.id} href={`/account/orders/${order.order_number}`}
                    className="block p-4 sm:p-5 rounded-lg border border-brand-100 hover:border-brand-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-brand-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-900">Order #{order.order_number}</p>
                          <p className="text-xs text-brand-400 mt-0.5">{formatDate(order.created_at)}</p>
                          <p className="text-xs text-brand-500 mt-0.5">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium", status.color)}>
                          {status.label}
                        </span>
                        <p className="text-sm font-semibold text-brand-900">{formatPrice(parseFloat(order.total))}</p>
                        <Eye className="h-4 w-4 text-brand-400 hidden sm:block" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-sm text-brand-500 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
