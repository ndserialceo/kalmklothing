<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Products (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/best-sellers', [ProductController::class, 'bestSellers']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Categories (public)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/tree', [CategoryController::class, 'tree']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Search
Route::get('/search', [SearchController::class, 'index']);
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);

// Cart (supports guest and authenticated)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'add']);
Route::put('/cart/{itemId}', [CartController::class, 'update']);
Route::delete('/cart/{itemId}', [CartController::class, 'remove']);
Route::delete('/cart', [CartController::class, 'clear']);
Route::post('/cart/coupon', [CartController::class, 'applyCoupon']);
Route::delete('/cart/coupon', [CartController::class, 'removeCoupon']);

// Reviews (public)
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);

// Payment verification (public callback)
Route::get('/payments/verify', [PaymentController::class, 'verify']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'add']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'remove']);
    Route::get('/wishlist/{productId}/check', [WishlistController::class, 'check']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::get('/orders/{orderNumber}/track', [OrderController::class, 'track']);

    // Payments
    Route::post('/payments/{orderId}/initialize', [PaymentController::class, 'initialize']);
    Route::get('/payments/history', [PaymentController::class, 'history']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{reviewId}', [ReviewController::class, 'destroy']);

    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);
});

// Admin routes
Route::prefix('admin')->group(function () {
    // Admin Auth (public)
    Route::post('/auth/login', [AdminAuthController::class, 'login']);

    // Authenticated admin routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
        Route::get('/auth/me', [AdminAuthController::class, 'me']);

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/dashboard/sales-chart', [AdminDashboardController::class, 'salesChart']);
        Route::get('/dashboard/orders-chart', [AdminDashboardController::class, 'ordersChart']);

        // Products
        Route::apiResource('products', AdminProductController::class);
        Route::put('/products/{id}/status', [AdminProductController::class, 'updateStatus']);
        Route::put('/products/{id}/inventory', [AdminProductController::class, 'updateInventory']);

        // Categories
        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/orders/{id}/notes', [AdminOrderController::class, 'addNote']);

        // Customers
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);
        Route::put('/customers/{id}/status', [AdminCustomerController::class, 'updateStatus']);

        // Coupons
        Route::apiResource('coupons', AdminCouponController::class)->except(['show']);
        Route::put('/coupons/{id}/toggle-status', [AdminCouponController::class, 'toggleStatus']);

        // Reviews
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::put('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::put('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

        // Settings
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
        Route::get('/settings/{group}', [AdminSettingController::class, 'getGroup']);

        // Notifications
        Route::get('/notifications', [AdminNotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    });
});
