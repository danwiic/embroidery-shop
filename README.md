# Jendave Embroidery Shop

A full-featured e-commerce and alteration management platform built with Next.js 16.

## Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (via Docker) if local + Prisma ORM
- **Auth:** NextAuth v5 (Credentials + JWT)
- **Image Hosting:** Cloudinary
- **Email:** Resend
- **Icons:** Lucide React

## Features

### Customer
- Product catalog with category filtering & search
- Cart (server-side, DB-backed)
- Checkout with payment reference
- Order history & detail tracking
- Alteration wizard (6-step: type → photo → measurements → review → payment → confirmation)
- Services showcase page
- Product detail with color swatches & variant pricing

### Admin
- Dashboard with stats, date filters, recent orders
- Order management with workflow modals (verify payment, process, fulfill, complete, cancel)
- Product CRUD with multi-image upload, variant editor
- Category CRUD with size guide upload
- Inventory management (variant-aware stock add/remove)
- Stock log viewer
- Notification system (in-app + email)
- Responsive sidebar with active state
- Garment Types CRUD
- User management (role toggle)
- Shop settings configuration

### Design System
- Navy (#1E3A5F) + Gold (#C9A84C) palette
- Material-style cards with `shadow-card` / `shadow-raised`
- Status chips with semantic colors (emerald/amber/red)
- Admin data tables with surface headers, hover tint, thumbnail columns

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# 4. Seed admin user
npx prisma db seed

# 5. Start dev server
npm run dev
```

### Default Admin
- Email: `admin@jendave.com`
- Password: `admin123`

## Environment Variables

See `.env.example` for all required variables.

Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret
- `CLOUDINARY_*` — Cloudinary API credentials
- `RESEND_API_KEY` — Email delivery

## Project Structure

```
app/
├── (customer)/         # Customer-facing pages (products, cart, orders, alterations)
├── admin/(dashboard)/  # Admin pages (dashboard, orders, products, categories, inventory)
├── api/                # API routes
├── login/              # Auth pages
└── register/
components/
├── admin/              # Admin-specific components (sidebar, order-detail-modal)
├── ui/                 # Reusable UI components (Button, Card, Modal, Badge, etc.)
└── providers.tsx       # Client providers (SessionProvider, ToastProvider)
lib/
├── contexts/           # React contexts (wizard, toast)
├── services/           # Business logic (admin-orders, notifications)
├── email/              # Email templates & sending
├── prisma.ts           # Prisma client singleton
└── rate-limit.ts       # Rate limiting
prisma/
└── schema.prisma       # Database schema
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-navy` | #1E3A5F | Primary text, buttons, active states |
| `--color-gold` | #C9A84C | Secondary accent |
| `--color-surface` | #F5F5F5 | Card/image backgrounds |
| `--color-border` | #E0E0E0 | Dividers |
| `--shadow-card` | 0 1px 3px... | Card elevation |
| `--shadow-raised` | 0 4px 6px... | Elevated/hover state |

See `DESIGN.md` for full design system specification.
