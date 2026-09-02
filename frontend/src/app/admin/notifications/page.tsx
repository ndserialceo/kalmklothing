"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  ShoppingCart,
  Star,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { admin } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const typeIcons: Record<string, typeof Bell> = {
  order: ShoppingCart,
  product: Package,
  review: Star,
  alert: AlertCircle,
  info: Info,
};

const typeColors: Record<string, string> = {
  order: "bg-blue-500/10 text-blue-400",
  product: "bg-purple-500/10 text-purple-400",
  review: "bg-amber-500/10 text-amber-400",
  alert: "bg-red-500/10 text-red-400",
  info: "bg-gray-500/10 text-gray-400",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await admin.notifications.list({
        page,
        page_size: pageSize,
      });
      setNotifications(data.results);
      setTotalCount(data.count);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await admin.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await admin.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              const colorClass =
                typeColors[notification.type] || typeColors.info;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                    !notification.is_read
                      ? "bg-accent-500/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-sm ${
                            !notification.is_read
                              ? "font-semibold text-white"
                              : "font-medium text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="p-1.5 text-gray-400 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 shrink-0 mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-300">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
