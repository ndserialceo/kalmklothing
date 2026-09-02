# Vercel Deployment Guide — Kalmklothing

## Architecture

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│          VERCEL                  │     │      BACKEND HOST               │
│     (Next.js Frontend)          │     │   (Laravel API)                 │
│                                 │     │   Railway / Render / VPS        │
│  https://kalmklothing.vercel.app│────▶│  https://api.kalmklothing.com   │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

The Next.js frontend deploys on **Vercel**. The Laravel backend deploys on a separate server (Railway, Render, or VPS) since Vercel doesn't run PHP.

---

## Step 1: Deploy the Backend (Laravel)

You need the Laravel API running before deploying the frontend.

### Option A: Railway (Recommended)
1. Go to https://railway.app
2. Create new project → Deploy from GitHub repo
3. Select the `backend/` directory
4. Add a PostgreSQL database plugin
5. Set environment variables (see below)
6. Railway will auto-detect Laravel and deploy

### Option B: Render
1. Go to https://render.com
2. Create Web Service → Connect GitHub
3. Root Directory: `backend`
4. Build Command: `composer install && php artisan migrate --force`
5. Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`
6. Add PostgreSQL database

### Option C: VPS (DigitalOcean / Linode / AWS)
```bash
# SSH into server
# Install PHP 8.5, Composer, Nginx, PostgreSQL
# Clone repo, cd backend
# composer install
# php artisan key:generate
# php artisan migrate --seed
# Configure Nginx to serve via PHP-FPM
```

### Backend Environment Variables (Railway/Render)
```
APP_NAME=Kalmklothing
APP_ENV=production
APP_KEY=base64:generate_with_php_artisan_key_generate
APP_DEBUG=false
APP_URL=https://api.kalmklothing.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

FRONTEND_URL=https://kalmklothing.vercel.app

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=log

PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECKxxx

WHATSAPP_NUMBER=2348012345678
```

After deployment, your backend URL will be something like:
- Railway: `https://kalmklothing-backend.up.railway.app`
- Render: `https://kalmklothing-api.onrender.com`

---

## Step 2: Deploy the Frontend (Vercel)

### Prerequisites
- GitHub account with the repo pushed
- Vercel account (free tier works)

### Method 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `ndserialceo/kalmklothing`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://kalmklothing.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `2348012345678` |
| `NEXT_PUBLIC_BUSINESS_NAME` | `Kalmklothing` |
| `NEXT_PUBLIC_CURRENCY` | `NGN` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_xxx` |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | `FLWPUBK-xxx` |

5. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# From the project root
cd frontend

# Deploy to production
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **kalmklothing**
- Directory with code? **.** (current directory)
- Want to override settings? **Y**
- Build Command? **npm run build**
- Output Directory? **.next**
- Install Command? **npm install**

### Method 3: GitHub Integration (Auto-deploy)

1. Go to https://vercel.com/new
2. Import `ndserialceo/kalmklothing`
3. Set Root Directory to `frontend`
4. Add environment variables
5. Deploy

Every push to `master` will auto-deploy.

---

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard → your project → Settings → Domains
2. Add your domain: `kalmklothing.com`
3. Configure DNS:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21`
4. SSL is automatic

---

## Step 4: Configure CORS on Backend

Make sure your Laravel backend allows requests from Vercel:

In `backend/.env`:
```
FRONTEND_URL=https://kalmklothing.vercel.app
```

In `backend/config/cors.php`:
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
],
```

---

## Step 5: Payment Webhooks

### Paystack
1. Go to Paystack Dashboard → Settings → API Keys
2. Set Webhook URL: `https://your-backend.com/api/payments/webhook`
3. Use LIVE keys for production

### Flutterwave
1. Go to Flutterwave Dashboard → Settings → API Keys
2. Set Webhook URL: `https://your-backend.com/api/payments/webhook`
3. Use LIVE keys for production

---

## Step 6: WhatsApp Business API (Optional)

For automated order notifications:
1. Set up WhatsApp Business account
2. Get API access from Meta
3. Update backend environment variables:
```
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

---

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., https://api.kalmklothing.com/api) |
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend URL (e.g., https://kalmklothing.vercel.app) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | WhatsApp number without + prefix |
| `NEXT_PUBLIC_BUSINESS_NAME` | No | Business name for display |
| `NEXT_PUBLIC_CURRENCY` | No | Currency code (NGN) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Yes | Paystack public key |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Yes | Flutterwave public key |

### Backend (Railway/Render/VPS)
| Variable | Required | Description |
|----------|----------|-------------|
| `APP_KEY` | Yes | Laravel app key |
| `APP_URL` | Yes | Backend URL |
| `DB_HOST` | Yes | Database host |
| `DB_DATABASE` | Yes | Database name |
| `DB_USERNAME` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `FRONTEND_URL` | Yes | Vercel frontend URL for CORS |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack secret key |
| `FLUTTERWAVE_SECRET_KEY` | Yes | Flutterwave secret key |

---

## Post-Deployment Checklist

- [ ] Backend API is accessible at its URL
- [ ] Database migrations have run
- [ ] Database is seeded with sample data
- [ ] CORS is configured for Vercel domain
- [ ] Frontend deploys on Vercel
- [ ] Environment variables are set on Vercel
- [ ] Frontend can communicate with backend API
- [ ] Payment gateways are configured with live keys
- [ ] Webhook URLs are set in payment dashboards
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active
- [ ] Admin login works: admin@kalmklothing.com / password
- [ ] Product browsing works
- [ ] Cart and checkout flow works
- [ ] Payment processing works
- [ ] WhatsApp button works

---

## Troubleshooting

### Build fails on Vercel
- Check that Root Directory is set to `frontend`
- Check build logs for missing dependencies
- Ensure all environment variables are set

### API calls fail from frontend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running and accessible

### Images don't load
- Check `images.remotePatterns` in next.config.ts
- Ensure image URLs are accessible

### Payment webhooks fail
- Verify webhook URL is correct
- Check that webhook secret matches
- Ensure backend is accessible from internet
