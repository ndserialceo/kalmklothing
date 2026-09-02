<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $totalSales = Order::where('payment_status', 'paid')->sum('total');
            $todaySales = Order::where('payment_status', 'paid')
                ->whereDate('created_at', today())
                ->sum('total');
            $monthlySales = Order::where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total');

            $orderCount = Order::count();
            $pendingOrders = Order::where('order_status', 'pending')->count();
            $completedOrders = Order::where('order_status', 'delivered')->count();
            $cancelledOrders = Order::where('order_status', 'cancelled')->count();

            $totalCustomers = User::where('role', 'customer')->count();

            $lowStockProducts = Product::active()
                ->where('stock_quantity', '<=', 10)
                ->where('stock_quantity', '>', 0)
                ->with('images')
                ->limit(10)
                ->get();

            $bestSellingProducts = Product::active()
                ->withCount(['orderItems as total_sold' => function ($q) {
                    $q->whereHas('order', function ($q) {
                        $q->where('payment_status', 'paid');
                    });
                }])
                ->orderByDesc('total_sold')
                ->limit(10)
                ->get();

            $recentOrders = Order::with('user')
                ->latest()
                ->limit(10)
                ->get();

            return response()->json([
                'total_sales' => $totalSales,
                'today_sales' => $todaySales,
                'monthly_sales' => $monthlySales,
                'order_count' => $orderCount,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
                'total_customers' => $totalCustomers,
                'low_stock_products' => $lowStockProducts,
                'best_selling_products' => $bestSellingProducts,
                'recent_orders' => $recentOrders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function salesChart(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'daily');
            $startDate = now()->subDays(30);

            if ($period === 'weekly') {
                $startDate = now()->subWeeks(12);
            } elseif ($period === 'monthly') {
                $startDate = now()->subMonths(12);
            }

            $sales = Order::where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total) as total'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json(['data' => $sales]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch sales chart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function ordersChart(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'daily');
            $startDate = now()->subDays(30);

            if ($period === 'weekly') {
                $startDate = now()->subWeeks(12);
            } elseif ($period === 'monthly') {
                $startDate = now()->subMonths(12);
            }

            $orders = Order::where('created_at', '>=', $startDate)
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('order_status'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('date', 'order_status')
                ->orderBy('date')
                ->get();

            return response()->json(['data' => $orders]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch orders chart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
