# Kalmklothing E-Commerce Platform

A premium, fully-responsive e-commerce website for **Kalmklothing** — a modern African fashion brand optimized for Nigeria and Africa.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + TypeScript + Tailwind CSS v4 |
| **Backend** | Laravel 13 (PHP 8.5) |
| **Database** | SQLite (dev) / PostgreSQL (production) |
| **Auth** | Laravel Sanctum (token-based) |
| **Payments** | Paystack + Flutterwave |
| **State** | Zustand + React Query |
| **Icons** | Lucide React + React Icons |

---

## Project Structure

```
Kalklothing/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Models/                 # Eloquent Models (18)
│   │   └── Services/              # Business logic
│   ├── config/                 # App + payment configs
│   ├── database/
│   │   ├── migrations/         # 18 migrations
│   │   └── seeders/            # Sample data seeder
│   └── routes/api.php          # 60+ API endpoints
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/                # Pages (40+ routes)
│   │   │   ├── (homepage)
│   │   │   ├── shop/
│   │   │   ├── products/[slug]/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/
│   │   │   └── admin/
│   │   ├── components/         # Shared UI (16 components)
│   │   ├── lib/                # API, types, utils, constants
│   │   └── store/              # Zustand stores (3)
│   └── .env.local
└── README.md
```

---

## Getting Started

### Prerequisites

- PHP 8.5+
- Composer 2.x
- Node.js 20+
- npm 10+

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Run migrations and seed
php artisan migrate:fresh --seed

# Start development server
php artisan serve --port=8000
```

**Backend runs at: http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs at: http://localhost:3000**

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | admin@kalmklothing.com | password |
| **Customer** | customer@example.com | password |

---

## API Endpoints (60+)

### Public
- `GET /api/products` — List products (filterable, paginated)
- `GET /api/products/featured` — Featured products
- `GET /api/products/new-arrivals` — New arrivals
- `GET /api/products/best-sellers` — Best sellers
- `GET /api/products/{slug}` — Product details
- `GET /api/categories` — List categories
- `GET /api/categories/tree` — Category tree
- `POST /api/auth/register` — Customer registration
- `POST /api/auth/login` — Customer login

### Authenticated
- `POST /api/cart` — Add to cart
- `PUT /api/cart/{id}` — Update cart item
- `DELETE /api/cart/{id}` — Remove cart item
- `POST /api/orders` — Create order
- `POST /api/payments/{orderId}/initialize` — Initialize payment
- `GET /api/wishlist` — Get wishlist
- `POST /api/reviews` — Submit review
- `GET /api/addresses` — Manage addresses

### Admin
- `POST /api/admin/auth/login` — Admin login
- `GET /api/admin/dashboard` — Dashboard stats
- `POST /api/admin/products` — Create product
- `PUT /api/admin/products/{id}` — Update product
- `GET /api/admin/orders` — List all orders
- `PUT /api/admin/orders/{id}/status` — Update order status
- `GET /api/admin/customers` — List customers
- `POST /api/admin/coupons` — Create coupon
- `GET /api/admin/settings` — Manage settings

---

## Features Implemented

### Customer-Facing
- [x] Homepage with hero, categories, products, promotions
- [x] Shop page with filters (category, gender, size, color, price)
- [x] Product details with gallery, variants, reviews, size guide
- [x] Shopping cart (localStorage + API sync)
- [x] Slide-out mini-cart
- [x] Checkout with Paystack/Flutterwave
- [x] Customer accounts (register, login, profile)
- [x] Order history and tracking
- [x] Wishlist (add, remove, move to cart)
- [x] Coupon system
- [x] Product reviews and ratings
- [x] WhatsApp integration (floating button)
- [x] Search with suggestions
- [x] Mobile-first responsive design
- [x] SEO metadata on all pages

### Admin Dashboard
- [x] Dashboard with sales stats and charts
- [x] Product management (CRUD, variants, images)
- [x] Order management (status updates, notes)
- [x] Customer management
- [x] Coupon management
- [x] Review moderation
- [x] Settings (business, shipping, payment, email)
- [x] Notification system

### Technical
- [x] Token-based authentication (Sanctum)
- [x] Role-based access control
- [x] Guest cart + logged-in sync
- [x] Inventory tracking by variant
- [x] Order status workflow
- [x] Payment webhook handling
- [x] CORS configuration
- [x] SQLite (dev) / PostgreSQL (prod) support
- [x] 18 database migrations
- [x] 12 sample products seeded

---

## Payment Configuration

### Paystack
1. Create account at https://paystack.com
2. Get API keys from dashboard
3. Update `.env`:
```
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx
```

### Flutterwave
1. Create account at https://flutterwave.com
2. Get API keys from dashboard
3. Update `.env`:
```
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxx
```

---

## Production Deployment

### Backend (Laravel)

1. **Server Requirements**: PHP 8.5+, PostgreSQL, Nginx/Apache
2. **Environment**:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Configure PostgreSQL in `DB_*` settings
   - Set real payment keys
   - Configure mail driver (SMTP/SES)

3. **Database**:
   ```bash
   php artisan migrate --force
   php artisan db:seed  # Optional: seed initial data
   ```

4. **Optimize**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Frontend (Next.js)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy** to Vercel, Netlify, or any Node.js host
3. Set environment variables on hosting platform

### Domain & SSL
- Configure domain to point to frontend
- Frontend proxies API calls to backend
- SSL certificate (Let's Encrypt or hosting provider)

---

## Currency

Primary: **Nigerian Naira (₦)**
Format: ₦45,000

---

## WhatsApp Integration

- Floating WhatsApp button on all pages
- Order via WhatsApp on product pages
- Pre-populated messages with product details
- WhatsApp number configurable from admin settings

---

## License

Proprietary — Kalmklothing. All rights reserved.
