"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { User, Mail, Phone, Package, Edit } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { orders as ordersApi } from "@/lib/api";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import Button from "@/components/Button";

export default function AccountPage() {
  const { user } = useAuthStore();

  const { data: ordersData } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => ordersApi.getOrders({ page_size: 3, ordering: "-created_at" }),
  });

  const recentOrders = ordersData?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold text-brand-900">Profile Overview</h2>
          <Link href="/account/profile">
            <Button variant="ghost" size="sm">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
            <User className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-[11px] text-brand-400 uppercase tracking-wider">Name</p>
              <p className="text-sm font-medium text-brand-900">{user?.first_name} {user?.last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
            <Mail className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-[11px] text-brand-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-brand-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
            <Phone className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-[11px] text-brand-400 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-brand-900">{user?.phone || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
            <Package className="h-4 w-4 text-brand-400" />
            <div>
              <p className="text-[11px] text-brand-400 uppercase tracking-wider">Member Since</p>
              <p className="text-sm font-medium text-brand-900">{user?.date_joined ? formatDate(user.date_joined) : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold text-brand-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-accent-600 hover:text-accent-700 font-medium">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-10 w-10 text-brand-200 mx-auto mb-3" />
            <p className="text-sm text-brand-500">No orders yet.</p>
            <Link href="/shop" className="text-sm text-accent-600 hover:text-accent-700 font-medium mt-2 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => {
              const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              return (
                <Link key={order.id} href={`/account/orders/${order.order_number}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-brand-100 hover:border-brand-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Package className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-900">#{order.order_number}</p>
                      <p className="text-xs text-brand-400">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium", status.color)}>
                      {status.label}
                    </span>
                    <p className="text-sm font-medium text-brand-900 mt-1">{formatPrice(parseFloat(order.total))}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


