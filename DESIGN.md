# Jendave Design System

Light theme, Navy + Gold palette. Elevation via shadows, not heavy borders.
Do NOT switch to dark mode — this is a light-theme system.

## Color tokens (from globals.css — use these, never raw hex)

```
--color-navy: #1e3a5f          /* primary text, buttons, active states */
--color-navy-light: #2a4f7a    /* hover state on navy elements */
--color-navy-dark: #13283f     /* pressed/darkest state */
--color-gold: #c9a84c          /* secondary accent */
--color-gold-light: #dcc06a
--color-gold-dark: #a88a2e     /* used for micro-labels/status text */
--color-background: #ffffff
--color-foreground: #171717    /* body text */
--color-muted: #6b7280         /* secondary text, placeholders */
--color-surface: #f5f5f5       /* card/image backgrounds, subtle fills */
--color-border: #e0e0e0        /* hairline dividers */
--color-input: #fafafa         /* form field backgrounds */
```

Shadows (use instead of borders to separate elevated elements):

```
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)
--shadow-raised: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)
--shadow-menu: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)
```

## Typography

- Font: `var(--font-sans)` (Geist Sans) throughout, `var(--font-mono)` for anything code-like.
- Micro-label (category tag, status label above a title): `text-[11px]` or `text-xs`, `uppercase`, `tracking-wide`, `text-gold-dark`, `font-semibold`.
- Titles: `font-bold text-navy`, size scales by context (`text-xl` list headers, `text-3xl` detail/hero titles).
- Body/secondary text: `text-sm text-muted`.
- Prices: `font-semibold text-navy` (list context) or `font-bold text-navy` (detail/emphasis context).

## Core interaction patterns

**Chip / pill** — category tags, size/attribute tags, highlight tags:

```
px-3 py-1 rounded-full bg-navy/5 border border-border text-xs font-medium text-navy-dark uppercase tracking-wide
```

Smaller variant for dense contexts (e.g. size tags under a product card):

```
px-1.5 py-0.5 rounded bg-navy/5 border border-border text-[10px] text-navy-dark
```

**Status/state badge** (e.g. "Sold out", "Limited stock"):

```
bg-navy text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded
```

**Card** — elevate on hover instead of adding a border on hover:

```
rest:  shadow-card
hover: shadow-raised   (transition-shadow)
```

Card image containers: `bg-surface rounded-lg overflow-hidden`, image `object-cover`, optional `group-hover:scale-105 transition-transform duration-300`.

**Filter accordion** (sidebar sections — category/color/size/etc.):

- Header row: label + chevron (`ChevronUp`/`ChevronDown` from lucide-react), toggles open/closed.
- Checkbox list: `text-sm text-muted`, hover `text-foreground`, checkbox `rounded border-border text-navy focus:ring-navy/30`.
- Section divider: `border-b border-border`, vertical rhythm `py-4`.
- "Clear" link (only shown when a filter is active): `text-xs text-muted hover:text-navy`.

**Buttons:**

- Primary: `bg-navy text-white hover:bg-navy-light shadow-raised`.
- Disabled state: `bg-surface text-muted border border-border shadow-none` (never just lower opacity on the navy fill — swap to the surface/border combo so disabled reads clearly as inactive, not just a darker button).
- Ghost/outline: `border border-border text-navy hover:border-navy-light bg-input`.

**Color swatches** (product color options): small circle, `w-8 h-8 rounded-full border-2`, active state `border-navy shadow-card`, inactive `border-border`, unavailable `opacity-30 cursor-not-allowed`.

## Semantic status colors (new — needed for admin tables)

Navy/gold has no way to say "good/warning/bad" — that needs a small dedicated set, used ONLY for status meaning (stock levels, order status), never as decoration:

```
success: text-emerald-700 bg-emerald-50 border-emerald-200   /* in stock, completed, paid */
warning: text-amber-700 bg-amber-50 border-amber-200         /* low stock, pending */
danger:  text-red-700 bg-red-50 border-red-200                /* out of stock, cancelled, failed */
```

Rendered as a small status chip: `px-2 py-0.5 rounded-full text-xs font-medium border` + the trio above.

## Admin data tables

The plain `<table>` with `border-b` rows and text-link actions is the "default/boring" look. Replace with:

- **Wrap the whole table** in a card: `bg-white rounded-xl shadow-card overflow-hidden` (not just a bare `<table>` with a border).
- **Toolbar row above the table**: search input (icon-left) + filter chips on the left, primary action button (`+ Add Product`) on the right, all in one flex row with `mb-4` — don't leave the add button orphaned above the card with nothing else around it.
- **Header row**: `bg-surface` (not white — this is what separates it from body rows without a heavy border), `text-xs font-semibold text-muted uppercase tracking-wide`, `py-3`.
- **Body rows**: increase breathing room to `py-3.5` (most default tables are too cramped), `border-b border-border/60` (last row: none), hover `hover:bg-navy/[0.03] transition-colors` — a tinted hover reads more intentional than plain gray.
- **Thumbnail column**: for any row representing a visual thing (products), lead with a `w-10 h-10 rounded-lg object-cover` image — text-only rows are what makes a table feel like a spreadsheet instead of a product list.
- **Status as a chip, not text**: stock/order status uses the semantic status chip above instead of a plain string in a cell.
- **Actions as icon buttons, not text links**: replace `Edit`/`Delete` text with lucide icons (`Pencil`, `Trash2`) in `p-1.5 rounded-lg hover:bg-surface transition-colors`, `text-muted hover:text-navy` (destructive: `hover:text-red-600`), each with a `title` attr for accessibility/tooltip. Text links in a table read like a 2015 admin panel.
- **Footer**: if paginated, a `bg-surface border-t border-border px-4 py-3` bar with `X–Y of Z` + prev/next, not an unstyled default pagination.
- **Empty state**: keep using the existing `EmptyState` component — don't replace with a bare "No data" string.

## Layout & spacing

- Sidebar + content: `lg:grid lg:grid-cols-[220px_1fr] lg:gap-10`, sidebar `lg:sticky lg:top-6`.
- Card grids: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`.
- Section vertical rhythm: `mt-4` / `mt-6` between stacked blocks, `py-4` inside repeating list rows.
- Detail pages (image + info side by side): `grid md:grid-cols-2 gap-10`.

## What NOT to do

- No dark backgrounds — background stays `--color-background` / `--color-surface`.
- No heavy `border-2`/thick borders for card separation — use `shadow-card`/`shadow-raised`.
- No colors outside the token list above — no raw hex, no default Tailwind palette colors (`bg-blue-500`, `bg-gray-800`, etc.) except `text-red-600` for destructive actions (delete, errors), which is the one intentional exception already in use.
- No new accent colors — navy is primary, gold is the only secondary accent (used sparingly: micro-labels, icons in accordions/highlights).
