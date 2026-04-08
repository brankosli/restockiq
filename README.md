# RestockIQ

Automatski sistem za restock alertove baziran na Shopify inventory podacima. Super-admin platforma koja omogućava slanje prilagođenih notifikacija vendorima putem Email, WhatsApp, Viber, SMS i Slack kanala.

---

## Tech stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 15 (App Router) |
| API | tRPC + Zod |
| Auth | Clerk (Organizations za multi-tenancy) |
| Baza | PostgreSQL + Drizzle ORM |
| Queue | BullMQ + Redis |
| Billing | Stripe |
| Shopify | @shopify/shopify-api |
| Lokalni email | Mailpit |

---

## Preduslovi

Provjeri da li imaš instalirano:

```bash
node --version    # v20+ obavezno
npm --version     # v10+
docker --version  # Docker Desktop ili Docker Engine
git --version
```

Ako nemaš Node.js: https://nodejs.org (preporučujem instalaciju putem `nvm`)

---

## Instalacija

### 1. Kloniraj repozitorij

```bash
git clone https://github.com/tvoj-username/restockiq.git
cd restockiq
```

### 2. Instaliraj dependencies

```bash
npm install
```

### 3. Postavi environment varijable

```bash
cp .env.example .env.local
```

Otvori `.env.local` i popuni minimalne vrijednosti za lokalni razvoj:

```env
DATABASE_URL=postgresql://restockiq:restockiq_secret@localhost:5432/restockiq_dev
REDIS_URL=redis://localhost:6379
```

Ostale varijable (Shopify, Clerk, Stripe) popunjavaš kako budeš postavljao svaki servis — pogledaj sekciju [Postavljanje servisa](#postavljanje-servisa) ispod.

### 4. Pokreni Docker servise

```bash
docker compose up -d
```

Ovo pokreće PostgreSQL, Redis, Mailpit (email) i Redis Commander (UI).

Provjeri da li sve radi:

```bash
docker compose ps
```

Svi servisi trebaju biti u statusu `running`.

### 5. Pokreni database migracije

```bash
npm run db:migrate
```

Opciono — popuni bazu test podacima:

```bash
npm run db:seed
```

### 6. Pokreni aplikaciju

```bash
# Pokreće Next.js i BullMQ worker istovremeno
npm run dev:all
```

Ili odvojeno u dva terminala:

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — BullMQ worker
npm run worker
```

Aplikacija je dostupna na: **http://localhost:3000**

---

## Lokalni servisi

| Servis | URL | Opis |
|---|---|---|
| Aplikacija | http://localhost:3000 | RestockIQ dashboard |
| Mailpit UI | http://localhost:8025 | Preview svih poslatih emailova |
| Redis Commander | http://localhost:8081 | Pregled Redis queue-ova |
| Drizzle Studio | http://localhost:4983 | GUI za bazu (pokrenuti posebno) |

### Drizzle Studio (DB GUI)

```bash
npm run db:studio
```

---

## Shopify lokalni razvoj

Za Shopify webhooks potreban ti je javni URL. Koristimo ngrok:

### Instalacija ngrok

```bash
npm install -g ngrok
# ili
brew install ngrok  # macOS
```

Registracija je besplatna na https://ngrok.com — dobijаš fiksni subdomain.

### Pokretanje ngrok tunela

```bash
ngrok http 3000
```

Dobit ćeš URL oblika `https://abc123.ngrok-free.app`. Taj URL ide u:
1. `.env.local` → `SHOPIFY_APP_HOST=abc123.ngrok-free.app` (bez https://)
2. Shopify Partners Dashboard → App setup → App URL

### Shopify Partners setup

1. Napravi account na https://partners.shopify.com
2. **Apps** → **Create app** → **Custom app**
3. Kopiraj `API key` i `API secret` u `.env.local`
4. **Stores** → **Add store** → **Development store** → izaberi "Populated with test data"
5. Instaliraj app na development store

---

## Git workflow

### Inicijalni setup (ako praviš novi repo)

```bash
cd restockiq
git init
git add .
git commit -m "feat: initial project setup"
```

Napravi repo na GitHub (https://github.com/new) pa povezi:

```bash
git remote add origin https://github.com/tvoj-username/restockiq.git
git branch -M main
git push -u origin main
```

### Preporučeni branch model

```
main          → stabilna verzija, uvijek deployable
dev           → aktivni razvoj, merge ovde
feature/xyz   → nova funkcionalnost
fix/xyz       → bugfix
```

```bash
# Novi feature
git checkout -b feature/shopify-webhook-handler
# ... razvoj ...
git add .
git commit -m "feat: add inventory webhook handler with dedup"
git push origin feature/shopify-webhook-handler
# → otvori Pull Request prema dev branchu
```

### Commit konvencija

```
feat:     nova funkcionalnost
fix:      bugfix
chore:    tooling, dependencies
docs:     dokumentacija
refactor: refaktor bez promjene funkcionalnosti
```

---

## Postavljanje servisa

### Clerk (Auth)

1. https://dashboard.clerk.com → **Create application**
2. Uključi **Organizations** u settings (potrebno za Agency tier)
3. Kopiraj `Publishable key` i `Secret key` u `.env.local`

### Stripe (Billing)

1. https://dashboard.stripe.com
2. **Products** → napravi 3 proizvoda: Starter (€29), Growth (€79), Agency (€199)
3. Kopiraj Price ID-ove u `.env.local`
4. Za webhooks lokalno: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   (potreban [Stripe CLI](https://stripe.com/docs/stripe-cli))

### WhatsApp (Test)

1. https://developers.facebook.com → Create app → Business
2. Dodaj WhatsApp product
3. Kopiraj `Phone Number ID` i temporary access token u `.env.local`
4. Dodaj do 5 test brojeva u Meta konzoli

---

## Korisne komande

```bash
# Docker
docker compose up -d          # Pokreni sve servise
docker compose down           # Zaustavi sve
docker compose logs -f        # Pratiti logove

# Database
npm run db:generate           # Generiši migracije nakon izmjena sheme
npm run db:migrate            # Primijeni migracije
npm run db:studio             # Otvori Drizzle Studio GUI

# Development
npm run dev:all               # Next.js + Worker istovremeno
npm run type-check            # TypeScript provjera bez builda
npm run lint                  # ESLint provjera
```

---

## Struktura projekta

```
restockiq/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Zaštićene rute
│   │   ├── api/              # API routes
│   │   │   ├── trpc/         # tRPC handler
│   │   │   └── webhooks/     # Shopify + Stripe webhooks
│   │   └── layout.tsx
│   ├── server/
│   │   ├── db/               # Drizzle schema + queries
│   │   ├── trpc/             # tRPC routers
│   │   └── queue/            # BullMQ job definitions
│   ├── worker/
│   │   └── index.ts          # BullMQ worker process
│   ├── lib/
│   │   ├── shopify/          # Shopify API klijent
│   │   └── notifications/    # Sending adapteri (email, WhatsApp...)
│   └── components/           # React komponente
├── docker-compose.yml
├── .env.example
├── .env.local                # Tvoje varijable (nije u gitu!)
├── package.json
└── README.md
```

---

## Problemi i rješenja

**Docker ne može pokrenuti postgres:**
```bash
docker compose down -v   # Briše volume-e
docker compose up -d
```

**ngrok URL se mijenja pri svakom pokretanju:**
Napravi besplatan ngrok account i koristiti statični subdomain:
```bash
ngrok config add-authtoken tvoj_token
ngrok http --domain=restockiq.ngrok-free.app 3000
```

**TypeScript greške nakon `npm install`:**
```bash
npm run type-check   # Vidi sve greške odjednom
```

---

## Licence

MIT — slobodno koristi za lični i komercijalni projekat.
