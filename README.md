<!--
  @file README.md

  Marefiyaye — hybrid real estate platform.

  This README is the entry point for anyone visiting the repository:
  collaborators, investors, future maintainers, or the founder returning
  after a break. It documents the vision, architecture, setup, and roadmap
  in one place — no external doc required to understand the project.

  Rule enforced: all user-facing strings and config values live in the
  `packages/config` and `packages/i18n` workspaces. This README is the
  ONLY place where hardcoded English is intentional.
-->

<div align="center">

# Marefiyaye · ማረፊያዬ

**Ethiopia's First Hybrid Housing Engine**

Bridge short diaspora stays, weekend vacations, and long-term residential leases on one platform — with local Ethiopian payment rails.

[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![License](https://img.shields.io/badge/license-proprietary-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)]()
[![Next.js](https://img.shields.io/badge/next.js-14.2-000000?logo=next.js&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/postgres-16-336791?logo=postgresql&logoColor=white)]()

[Vision](#-vision) · [Features](#-features) · [Architecture](#-architecture) · [Setup](#-local-development-setup) · [Roadmap](#-roadmap)

</div>

---

## 🌍 Vision

Ethiopia's rental market is fragmented. Homeowners juggle **short-term stays** (diaspora visits, tourists, business trips) and **long-term leases** (expats, residents, students) as entirely separate businesses.

**Marefiyaye unifies both** into a single platform that:

- Lets one property support **nightly, monthly, or hybrid** pricing models
- Handles **manual bank transfers** via CBE, Telebirr, BoA, and Awash — the only payment rails most Ethiopians trust
- Verifies every transaction through an **admin review queue** with full audit trails
- Generates **printable digital leases** in both English and Amharic
- Ships **fully bilingual** — English and Amharic — across every screen

**Meaning:** *Marefiyaye* (ማረፊያዬ) = "My resting place" in Amharic.

---

## ✨ Features

### Public Experience
- 🔍 **Search & filter** by stay type, category, city, price, guests
- 🏠 **Property detail pages** with gallery, amenities, host info, pricing breakdown
- ❤️ **Wishlist** (persists to `localStorage`)
- 🌐 **Bilingual** UI — English ↔ Amharic with cookie persistence
- 💱 **Currency switcher** — ETB ↔ USD with live exchange rate

### Short-Term Flow
- 📅 **Airbnb-style date range picker** with blocked dates
- 💰 **Live price preview** — same pricing engine as server
- 🏦 **Bank transfer checkout** — Telebirr, CBE, BoA, Awash
- 📸 **Receipt upload** to Cloudinary
- ✅ **Admin verification** — payment confirmed → booking confirmed

### Long-Term Flow
- 📆 **Viewing scheduler** — pick date + time slot
- 📝 **Lease application** with duration picker
- 📄 **Printable lease document** — auto-filled, EN + AM
- 🔒 **Digital signing** workflow ready

### Host Dashboard
- 📊 **KPIs** — total listings, bookings, viewings, revenue
- 🏘️ **Listings table** with per-property revenue
- 📥 **Bookings received** with guest details
- 👁️ **Viewings requested** — confirm or cancel

### Admin Panel
- 🎯 **Dashboard** — real-time platform KPIs
- 💳 **Payment verification queue** — verify or reject with reason
- 📋 **Full audit log** — before/after JSONB snapshots
- 👥 **User management** (extensible)

### Listing Wizard
- 📝 **5-step form** — basics, stay type, pricing, photos, review
- 🖼️ **Drag-drop photo uploader** → Cloudinary
- 🎨 **Live preview** — see exactly what publishes
- 🔐 **Host-only** — role check enforced

---

## 🏗️ Architecture

### Monorepo Structure

```
marefiyaye/
├── apps/
│   ├── web/                    # Next.js 14 (public + dashboard + admin)
│   └── api/                    # Express backend
│
├── packages/
│   ├── config/                 # All configuration (business rules, routes, env)
│   ├── shared/                 # Pure logic (pricing, validators, dates)
│   └── i18n/                   # Translation dictionaries (EN + AM)
│
├── tools/                      # Dev utilities (file merger)
└── docs/                       # Architecture docs
```

### Three-Layer Config System

```
Layer 1 — Static Data       →  packages/config/src/{app,business,ui}/
Layer 2 — Env Validation    →  packages/config/src/env/{api,web}.js
Layer 3 — Runtime Overrides →  process.env (Vercel dashboard)
```

**Rule:** zero hardcoded values anywhere. Every fee percentage, bank account, route path, and string lives in `packages/`.

### Data Flow

```
Browser (Next.js)
   ↓
apiClient.js (fetch wrapper)
   ↓  credentials: 'include'
Express API
   ↓
authGuard → roleGuard → validate(schema)
   ↓
service (business logic)
   ↓
query builder → PostgreSQL (raw SQL, parameterized)
```

### Auth Boundary

| Cookie | Secret | Expiry | Used For |
|---|---|---|---|
| `token` | `JWT_SECRET` | 7 days | Guest / host sessions |
| `admin_token` | `ADMIN_JWT_SECRET` | 12 hours | Admin panel |

**Admin tokens cannot be forged from guest tokens** — separate secrets, separate cookies, separate middleware.

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14 (or free **Neon** account → https://neon.tech)
- **Cloudinary** free account → https://cloudinary.com (for image uploads)

### Steps

```bash
# 1. Clone
git clone https://github.com/Atnatewos/marefiyaye.git
cd marefiyaye

# 2. Install all workspace dependencies
npm install

# 3. Configure environment
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Edit both files — fill in DATABASE_URL, JWT secrets, Cloudinary keys

# 4. Run database migrations
npm run db:migrate

# 5. Seed 15 demo properties + 3 demo users
npm run db:seed

# 6. Start both apps with one command
npm run dev
#   → API on http://localhost:4000 (cyan output)
#   → Web on http://localhost:3000 (magenta output)
#
# To run individually:
#   npm run dev:api
#   npm run dev:web
```

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@marefiyaye.com` | `AdminDemo123!` |
| Host | `host@marefiyaye.com` | `HostDemo123!` |
| Guest | `guest@marefiyaye.com` | `GuestDemo123!` |

**Login URLs:**
- Guest / Host → `http://localhost:3000/login`
- Admin → `http://localhost:3000/admin/login`

---

## 📡 API Overview

### Public Endpoints

```
GET  /api/health                       Server health check
GET  /api/config                       Public config (banks, categories, currency)
GET  /api/properties                   List properties (filters, pagination)
GET  /api/properties/cities            Cities with counts
GET  /api/properties/:slug             Single property detail
```

### Auth

```
POST /api/auth/login                   Guest / host login
POST /api/auth/logout                  Clear guest cookie
GET  /api/auth/me                      Current guest / host user
POST /api/auth/admin/login             Admin login (separate secret)
POST /api/auth/admin/logout            Clear admin cookie
GET  /api/auth/admin/me                Current admin user
```

### Booking & Payment

```
POST   /api/bookings                   Create short-term booking
GET    /api/bookings/mine              List own bookings
PATCH  /api/bookings/:id/cancel        Cancel with refund calculation
POST   /api/bookings/payments          Submit bank transfer reference
GET    /api/bookings/payments/mine     List own payments
```

### Lease & Viewing

```
POST /api/leases/apply                 Apply for lease
GET  /api/leases/mine                  List own leases
GET  /api/leases/:id/document          Printable HTML lease (EN/AM)
POST /api/leases/viewings              Schedule physical viewing
GET  /api/leases/viewings/mine         List own viewings
```

### Host

```
GET   /api/host/stats                  Host KPIs
GET   /api/host/listings               Own listings
GET   /api/host/bookings               Bookings received
GET   /api/host/viewings               Viewings requested
PATCH /api/host/viewings/:id           Confirm / cancel viewing
```

### Admin

```
GET  /api/admin/stats                  Platform KPIs
GET  /api/admin/payments               Payment queue
POST /api/admin/payments/:id/verify    Approve payment → confirm booking
POST /api/admin/payments/:id/reject    Reject with reason
```

### Uploads

```
POST /api/uploads/image?folder=...     Upload to Cloudinary
```

---

## 🛡️ Security

| Layer | Mechanism |
|---|---|
| **Passwords** | bcrypt (10 rounds) |
| **Auth** | JWT (HS256), separate secrets for guest/admin |
| **Cookies** | `httpOnly`, `secure`, `sameSite: lax` |
| **SQL** | 100% parameterized queries — no interpolation |
| **Input** | Zod schemas on every write endpoint |
| **Uploads** | MIME allowlist, 10MB size cap, Cloudinary scanning |
| **Rate limits** | Per-endpoint (auth 5/15min, payments 10/hr) |
| **Headers** | Helmet: HSTS, X-Frame-Options, CSP |
| **CORS** | Explicit origin allowlist from env |
| **Audit** | Every admin action logged with before/after JSONB |
| **Secrets** | Zero hardcoded — `.env.local` gitignored |

---

## 🧪 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 14.2 |
| UI | React | 18.3 |
| Styling | Pure CSS + CSS Modules | — |
| Backend | Express | 4.19 |
| Database | PostgreSQL (raw SQL) | 16 |
| Auth | jsonwebtoken + bcryptjs | — |
| Validation | Zod | 3.23 |
| Uploads | Cloudinary + Multer | — |
| Logging | Pino | 9 |
| Deployment | Vercel (3 projects) | — |

---

## 📅 Roadmap

### ✅ Phase 0 — Foundation
- Config-driven monorepo with 6 workspaces
- Design system (62 CSS/JSX files)
- Full PostgreSQL schema (13 tables, 6 enums, 37 indexes)
- Auth (guest + admin JWT)
- 15 seeded Ethiopian properties

### ✅ Phase 1 — Core Marketplace
- Property search, filtering, detail pages
- Short-term booking + bank transfer checkout
- Admin payment verification queue
- Long-term lease application + printable documents
- Guest, host, and admin dashboards
- i18n retrofit (200+ keys, EN + AM)

### ✅ Phase 2 A+B — Image Uploads + Listing Wizard
- Cloudinary integration
- 5-step listing creation wizard
- Drag-drop photo uploader
- Host creates listings end-to-end

### 🔜 Phase 2 C — Admin Listing Verification
- Admin listing queue
- Verify / reject listings
- Amenities + utilities wizard steps

### 🔜 Phase 2 D — Reviews
- Post-stay review submission
- Property rating aggregation
- Public reviews on detail page

### 🔜 Phase 2 E — Messaging
- Host ↔ guest chat
- Real-time via WebSockets

### 🔜 Phase 2 F — Production Deploy
- Vercel deployment (web + api + admin merged)
- Production Neon database
- Custom domain

---

## 📖 Documentation

- **[docs/API.md](docs/API.md)** — Full endpoint reference
- **[docs/DATABASE.md](docs/DATABASE.md)** — Schema deep-dive
- **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** — Tokens, components, patterns
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Vercel deployment guide

---

## 🤝 Contributing

This is a **solo project** in active development. If you'd like to contribute:

1. Open an issue to discuss the change
2. Fork the repo, create a branch
3. Follow the coding standards in `docs/DESIGN_SYSTEM.md`
4. Submit a PR with a clear description

**Coding standards locked:**
- Zero hardcoded values (config-driven)
- Parameterized SQL only
- Zod validation on every write
- i18n for every user-facing string
- Typed errors, no silent failures
- 2-space indent, single quotes, semicolons

---

## 📄 License

**Proprietary** — © 2026 Athanasius (Theron) · Addis Ababa, Ethiopia

All rights reserved. Not for redistribution or commercial use without written permission.

---

## 🌟 Credits

**Designed and engineered in Addis Ababa, Ethiopia** 🇪🇹

Built to bridge the gap between traditional Ethiopian rental markets and modern digital travel.

*Marefiyaye — your resting place.*
```

---

## 🛠️ Apply — 1 File + One Small Fix

### Step 1 — Paste the README

```bash
cd ~/OneDrive/Documents/Coding/MAREFIYAYE/marefiyaye

# Overwrite README.md with the content above
nano README.md
# Paste the full markdown above
# Ctrl+O, Enter, Ctrl+X
```

### Step 2 — Fix the empty `.env.example` files

Your verification showed:
```
=== 3. Content of .env.example files ===
--- .env.example ---

--- apps/web/.env.example ---

```

**Both files are empty.** They should have placeholder documentation so future devs know what to fill in.

**Fix 1 — `apps/api/.env.example`:**

```bash
cd ~/OneDrive/Documents/Coding/MAREFIYAYE/marefiyaye

cat > apps/api/.env.example <<'EOF'
# ── apps/api/.env.example ──
# Copy to .env.local and fill in real values.
# NEVER commit .env.local.

# ── Core ──
NODE_ENV=development
PORT=4000

# ── Database (Neon) ──
# Pooled connection (runtime queries) — use the -pooler endpoint
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require
# Direct connection (migrations only) — non-pooled endpoint
DATABASE_DIRECT_URL=postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DATABASE?sslmode=require

# ── Auth ──
# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=
ADMIN_JWT_SECRET=
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=12h

# ── URLs ──
PUBLIC_WEB_URL=http://localhost:3000
ADMIN_WEB_URL=http://localhost:3000

# ── Currency ──
EXCHANGE_RATE_ETB_PER_USD=125

# ── Logging ──
LOG_LEVEL=info

# ── Notifications ──
ADMIN_NOTIFICATION_EMAIL=

# ── Cloudinary (image uploads) ──
# Sign up free: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Notes ──
# Payment method definitions (banks, account numbers) are DATABASE-DRIVEN,
# not env-driven. Manage them at /admin/settings.
EOF
echo "✅ apps/api/.env.example updated"
```

**Fix 2 — `apps/web/.env.example`:**

```bash
cat > apps/web/.env.example <<'EOF'
# ── apps/web/.env.example ──
# Copy to .env.local and fill in real values.

# ── API base URL (public, bundled into browser) ──
NEXT_PUBLIC_API_URL=http://localhost:4000

# ── App identity ──
NEXT_PUBLIC_APP_NAME=Marefiyaye
NEXT_PUBLIC_APP_NAME_AM=ማረፊያዬ
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_CURRENCY=ETB

# ── Server-only (never expose to browser) ──
# Must match apps/api's ADMIN_JWT_SECRET exactly.
# Used by middleware to verify admin tokens server-side.
ADMIN_JWT_SECRET=
EOF
echo "✅ apps/web/.env.example updated"

# Root .env.example (documentation pointer)
cat > .env.example <<'EOF'
# ── .env.example ──
# This is a documentation pointer — real envs live per-app.
#
#   apps/api/.env.local  ← backend secrets (DB, JWT, Cloudinary)
#   apps/web/.env.local  ← frontend public + server-only vars
#
# Copy the .env.example in each app folder and fill in real values.
# NEVER commit .env.local files.
EOF
echo "✅ .env.example updated"
```

### Step 3 — Commit and push

```bash
cd ~/OneDrive/Documents/Coding/MAREFIYAYE/marefiyaye

# Stage the new README and env.example files
git add README.md .env.example apps/api/.env.example apps/web/.env.example

# Commit
git commit -m "docs: add comprehensive README + populate env.example templates

- README covers vision, features, architecture, setup, API reference, roadmap
- .env.example files now document every required variable with placeholders
- Zero real secrets in any example file"

# Push
git push origin main

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PUSHED"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "View at: https://github.com/Atnatewos/marefiyaye"
```

**Expected:**
```
[main xxxxxxx] docs: add comprehensive README + populate env.example templates
 4 files changed, XXX insertions(+)
...
To https://github.com/Atnatewos/marefiyaye.git
   xxxxxxx..xxxxxxx  main -> main
✅ PUSHED
```

---

## 🌐 Verify on GitHub

Open **https://github.com/Atnatewos/marefiyaye** in your browser.

**You should see:**
- ✅ **Full README** with badges, vision, features, architecture, setup guide, API reference, roadmap
- ✅ **No secrets** anywhere
- ✅ `.env.example` files showing placeholders

**Click `README.md`** → the rendered markdown should show:
- Bold title with Amharic
- Green status badge
- Clickable TOC (`Vision`, `Features`, `Architecture`, `Setup`, `Roadmap`)
- Setup instructions
- Demo credentials
- Full roadmap

**This is what investors, recruiters, and collaborators see first.** A professional README makes your repo look like a real product, not a personal experiment.

---

## 🚦 Reply With

**Just one line:**

- **`README PUSHED`** — I'll confirm and you can rest
- **`FAILS: <error>`** — I fix

**Or just close your laptop if you've verified the README renders on GitHub.**

---

## 📊 What README + .env.example Fixes

| Aspect | Before | After |
|---|---|---|
| First impression | Bare placeholder | **Portfolio-grade landing page** |
| Setup clarity | "Fill in env vars" | **Exact instructions + templates** |
| API visibility | Hidden | **Full endpoint list in README** |
| Architecture | Implicit | **Diagram + three-layer explanation** |
| Roadmap | Unclear | **4 phases, what's done, what's next** |
| Contributor onboarding | Guessing | **Prerequisites + step-by-step** |
| Demo access | Unknown | **Credentials documented** |

---