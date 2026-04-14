# RestockIQ

Shopify inventory monitoring system that automatically sends low-stock alerts to vendors via WhatsApp. When a product falls below the configured minimum stock level, vendors receive an instant WhatsApp message with the product name, image, and current stock count.

---

## How it works

```
Shopify (stock changes)
  → webhook → RestockIQ API
  → check: is stock ≤ minimum?
  → check: has 24h passed since last alert?
  → YES → queue job (Redis) → Worker → WhatsApp message to vendor
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL + Drizzle ORM |
| Queue | BullMQ + Redis (Upstash) |
| Notifications | Twilio (WhatsApp, SMS) |
| Shopify | @shopify/shopify-api |

---

## Services required

You need accounts on the following services before deploying:

### 1. Neon — PostgreSQL database
- Sign up at https://neon.tech (free tier available)
- Create a new project
- Copy the `DATABASE_URL` connection string

### 2. Upstash — Redis queue
- Sign up at https://upstash.com (free tier available)
- Create a new Redis database
- Select **TLS** enabled
- Copy the connection string — must start with `rediss://` (with double `s`)

### 3. Twilio — WhatsApp notifications
- Sign up at https://twilio.com
- For **WhatsApp Sandbox** (free testing):
  - Go to **Messaging → Try it out → Send a WhatsApp message**
  - Note the sandbox number: `+14155238886`
  - Each recipient must join the sandbox by sending `join <keyword>` to that number on WhatsApp
  - Copy `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` from the console
- For **production WhatsApp**:
  - Apply for a WhatsApp Business number through Twilio
  - This requires Meta Business verification (takes a few days)

### 4. Shopify Partners — app registration
- Sign up at https://partners.shopify.com
- Go to **Apps → Create app → Custom app**
- Set **App URL** to your deployment URL (e.g. `https://your-app.vercel.app`)
- Set **Allowed redirection URLs** to `https://your-app.vercel.app/api/auth/callback`
- Copy `API key` → `SHOPIFY_API_KEY`
- Copy `API secret key` → `SHOPIFY_API_SECRET`
- Create a **Development store** for testing (with test data)

### 5. Vercel — Next.js hosting
- Sign up at https://vercel.com
- Import your GitHub repository
- Add all environment variables (see section below)
- Deploy

### 6. Railway — Worker process
- Sign up at https://railway.app
- Create a new project → **Deploy from GitHub repo**
- Set the **Start command** to: `npm run worker`
- Add all environment variables (same as Vercel)
- The worker runs as a separate background process alongside the Vercel deployment

---

## Environment variables

Create a `.env.local` file in the project root (never commit this file):

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL=postgresql://...@....neon.tech/restockiq

# Redis (Upstash) — must use rediss:// (with TLS)
REDIS_URL=rediss://default:...@....upstash.io:6379

# Shopify
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_inventory
# Without https:// — use ngrok URL for local dev, Vercel URL for production
SHOPIFY_APP_HOST=your-app.vercel.app

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+1xxxxxxxxxx
```

---

## Local development

### Prerequisites

```bash
node --version   # v20+ required
npm --version    # v10+
```

### Setup

```bash
# Clone the repo
git clone https://github.com/brankosli/restockiq.git
cd restockiq

# Install dependencies
npm install

# Create and fill environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Run database migrations
npm run db:migrate

# Start the app and worker
npm run dev:all
```

App runs at: **http://localhost:3000**

### Shopify webhooks in local development

Shopify needs a public URL to send webhooks. Use ngrok:

1. Sign up at https://ngrok.com (free static subdomain)
2. Install: https://ngrok.com/download
3. Run:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g. `abc123.ngrok-free.app`)
5. Set in `.env.local`:
   ```
   SHOPIFY_APP_HOST=abc123.ngrok-free.app
   ```
6. Restart the app

---

## Database

```bash
# Apply migrations
npm run db:migrate

# Generate migrations after schema changes
npm run db:generate

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

---

## Available scripts

```bash
npm run dev        # Next.js dev server
npm run worker     # BullMQ notification worker
npm run dev:all    # Both simultaneously
npm run build      # Production build
npm run start      # Production server
npm run db:migrate # Apply DB migrations
npm run db:generate # Generate new migrations
npm run db:studio  # Open DB GUI
npm run type-check # TypeScript check
npm run lint       # ESLint
```

---

## Testing notifications

### Test WhatsApp directly (no queue needed)

```bash
curl -X POST http://localhost:3000/api/test/twilio \
  -H "Content-Type: application/json" \
  -d '{"to": "+38161xxxxxxx", "channel": "whatsapp"}'
```

### Test full queue flow

Requires: vendor with WhatsApp channel assigned to a product in the dashboard.

```bash
curl -X POST http://localhost:3000/api/test/notify \
  -H "Content-Type: application/json" \
  -d '{}'
```

> These endpoints are disabled in production (`NODE_ENV=production`).

---

## Project structure

```
restockiq/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # Shopify OAuth flow
│   │   │   ├── sync/              # Manual inventory sync
│   │   │   ├── variants/          # Variant CRUD
│   │   │   ├── vendors/           # Vendor CRUD
│   │   │   ├── webhooks/
│   │   │   │   └── inventory/     # Shopify stock update webhook
│   │   │   └── test/              # Dev-only test endpoints
│   │   └── dashboard/
│   │       ├── page.tsx           # Inventory view
│   │       ├── vendors/           # Vendor management
│   │       └── alerts/            # Alert log
│   ├── db/
│   │   ├── index.ts               # DB connection
│   │   └── schema.ts              # Table definitions
│   ├── lib/
│   │   ├── queue.ts               # BullMQ + Redis setup
│   │   ├── sync.ts                # Shopify product sync
│   │   ├── shopify.ts             # Shopify API client
│   │   └── notifications/
│   │       ├── index.ts           # Channel router
│   │       ├── email.ts           # Email via Nodemailer
│   │       └── twilio.ts          # WhatsApp + SMS via Twilio
│   └── worker/
│       ├── index.ts               # Worker entry point
│       └── processors/
│           └── notify.ts          # Job processor
├── tsconfig.worker.json           # Worker-specific TS config
├── .env.local                     # Local env vars (not in git)
└── README.md
```

---

## Database schema

| Table | Description |
|---|---|
| `stores` | Connected Shopify stores with OAuth tokens |
| `product_variants` | Inventory items synced from Shopify |
| `vendors` | Suppliers with contact info and notification preferences |
| `alert_logs` | History of all sent/failed notifications |
