# Jendave Embroidery Shop

A full-featured e-commerce and alteration management platform built with Next.js 16.

## Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL via Neon (serverless) + Prisma ORM v6
- **Auth:** NextAuth v5 (Credentials + JWT, role-based: ADMIN / CUSTOMER)
- **Data Fetching:** TanStack Query (React Query) — optimistic mutations, paginated queries
- **Image Hosting:** Cloudinary (signed uploads via API key/secret)
- **Email:** Resend
- **Icons:** Lucide React

## Features

### Customer
- Product catalog with multi-category, color, and size filtering (URL-driven params)
- Server-side cart (DB-backed, tied to user)
- Checkout with payment reference
- Order history & detail tracking
- 6-step alteration wizard (type → photo → measurements → review → payment → confirmation) with React Context state management
- Services showcase page
- Product detail with color swatches, variant pricing, reviews, out-of-stock notify
- Responsive navbar with slide-in mobile drawer
- Footer with dynamic contact info from settings
- Profile/account settings
- In-app notifications page

### Admin
- Dashboard with 5 KPI cards (Orders, Revenue, Pending, Products, Low Stock), date range presets, orders-by-status badges, top-selling products table, recent orders
- Order management with status workflow modal (verify payment, process, fulfill, complete, cancel), garment photo preview, search + pagination
- Product CRUD with multi-image upload, variant editor, soft-delete, search + pagination
- Category CRUD with size guide upload, client-side search filter
- Inventory management (variant-aware stock add/remove with reason logging), search + pagination
- Stock log viewer
- Notification system (in-app + email via Resend)
- Responsive sidebar with mobile hamburger menu
- User management (role toggle)
- Shop settings (name, email, phone, address, about text, logo URL, resizing fee)

### Design System
- Navy (#1E3A5F) + Gold (#C9A84C) + White palette — "Clean & Professional"
- Material-style cards with `shadow-card` / `shadow-raised`
- Status chips with semantic colors (emerald/amber/red/blue/teal/purple)
- Admin data tables with surface headers, hover tint, thumbnail columns
- Empty states, error boundaries, page loaders, confirm modals, toast notifications

## Getting Started

### Prerequisites
- Node.js 20+
- Environment variables configured (see `.env` or `.env.example`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations (points to Neon PostgreSQL)
npx prisma migrate dev

# 4. Seed admin user & categories
npx prisma db seed

# 5. Start dev server
npm run dev
```

### Default Admin
- Email: `admin@jendave.com`
- Password: `admin123`

## Environment Variables

Key ones (see `.env.example` for full list):
- `DATABASE_URL` / `DIRECT_URL` — Neon PostgreSQL connection strings
- `AUTH_SECRET` — NextAuth secret
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY` — Email delivery
- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`

## Project Structure

```
app/
├── (customer)/         # Customer-facing pages (products, cart, orders, alterations)
├── admin/(dashboard)/  # Admin pages (dashboard, orders, products, categories, inventory, settings)
├── api/                # 51 API routes (CRUD, auth, upload, notifications, dashboard, settings)
├── (auth)/             # Auth pages (login, register, forgot-password, reset-password)
└── layout.tsx
components/
├── admin/              # Admin-specific components (sidebar, order-detail-modal, clickable-row)
├── ui/                 # Reusable UI components (Button, Card, Modal, Badge, Pagination, etc.)
└── providers.tsx       # Client providers (SessionProvider, ToastProvider, QueryClientProvider)
lib/
├── hooks/              # TanStack Query hooks (use-api.ts — useCategories, useCart, useAdminOrders, etc.)
├── contexts/           # React contexts (wizard, toast)
├── services/           # Business logic (admin-orders, products, settings, pagination)
├── email/              # Email templates & sending
├── types/              # Local type definitions (OrderStatus, Role — replaces Prisma enums)
├── prisma.ts           # Prisma client singleton
└── rate-limit.ts       # Rate limiting (forgot/reset password)
prisma/
├── schema.prisma       # Database schema
└── migrations/         # Migration history
```

## Key Architecture Decisions

- **TanStack Query** replaces all raw `fetch` + `useEffect` data fetching patterns. Optimistic mutations with rollback for cart operations. Paginated admin queries return `PaginatedResult<Order/Product>`.
- **Settings cache**: Module-level in-memory cache in `lib/services/settings.ts`, cleared on admin PUT via `clearSettingsCache()` — avoids DB round-trips on every page load.
- **Category filter**: Multi-select via comma-separated `categoryIds` URL param (same pattern as colors/sizes).
- **Local types**: `OrderStatus` and `Role` defined in `lib/types/index.ts` instead of importing from `@prisma/client` (Prisma v6 generated enums aren't resolved by Turbopack).
- **Alteration wizard**: State stored in React Context instead of URL params — cleaner navigation, state persists when navigating back.
- **GarmentType removed**: Merged into Category model via migration `20260720000000_merge_garment_type_into_category`.

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-navy` | #1E3A5F | Primary text, buttons, active states |
| `--color-gold` | #C9A84C | Secondary accent |
| `--color-surface` | #F5F5F5 | Card/image backgrounds |
| `--color-border` | #E0E0E0 | Dividers |
| `--shadow-card` | 0 1px 3px ... | Card elevation |
| `--shadow-raised` | 0 4px 6px ... | Elevated/hover state |
