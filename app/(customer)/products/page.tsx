"use client";
import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Pagination } from "@/components/ui/pagination";
import { PageLoader } from "@/components/ui/page-loader";
import { useCategories, useProductSearch, useAllProductOptions, colorsOf, sizesOf, totalStockOf } from "@/lib/hooks/use-api";

const COLOR_MAP: Record<string, string> = {
  white: "#ffffff", black: "#000000", navy: "#1e3a5f", "navy blue": "#1e3a5f",
  blue: "#2563eb", "light blue": "#93c5fd", red: "#dc2626", green: "#16a34a",
  brown: "#92400e", gray: "#6b7280", grey: "#6b7280", gold: "#c9a84c",
  yellow: "#eab308", orange: "#ea580c", pink: "#ec4899", purple: "#9333ea",
  teal: "#0d9488", khaki: "#c3b091", beige: "#f5f5dc", maroon: "#800000",
  olive: "#808000", silver: "#c0c0c0", charcoal: "#36454f", cream: "#fdf8e1",
  "army green": "#4b5320", "royal blue": "#1d4ed8", "deep blue": "#1e3a5f",
  "dark blue": "#1e40af", "olive green": "#808000",
};

const toHex = (c: string) => COLOR_MAP[c.toLowerCase().trim()] ?? c.toLowerCase();

const isLightColor = (hex: string) => {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 180;
};

const SORT_OPTIONS = [
  { label: "Name", value: "name" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

const FilterSection = ({ title, options, selected, onToggle }: {
  title: string; options: string[]; selected: Set<string>; onToggle: (value: string) => void;
}) => {
  const [open, setOpen] = useState(true);
  if (options.length === 0) return null;
  return (
    <div className="border-b border-border py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-sm font-medium text-foreground">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground">
              <input type="checkbox" checked={selected.has(opt)} onChange={() => onToggle(opt)}
                className="rounded border-border text-navy focus:ring-navy/30" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedCategoryIds = new Set(searchParams.get("categoryIds")?.split(",").filter(Boolean) ?? []);
  const selectedColors = new Set(searchParams.get("colors")?.split(",").filter(Boolean) ?? []);
  const selectedSizes = new Set(searchParams.get("sizes")?.split(",").filter(Boolean) ?? []);
  const sort = searchParams.get("sort") ?? "name";
  const page = parseInt(searchParams.get("page") ?? "1");

  const searchUrlParams = useMemo(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    const catIds = Array.from(selectedCategoryIds).join(",");
    if (catIds) p.set("categoryIds", catIds);
    const colors = Array.from(selectedColors).join(",");
    if (colors) p.set("colors", colors);
    const sizes = Array.from(selectedSizes).join(",");
    if (sizes) p.set("sizes", sizes);
    if (sort !== "name") p.set("sort", sort);
    p.set("page", String(page));
    p.set("limit", "20");
    return p;
  }, [searchQuery, selectedCategoryIds, selectedColors, selectedSizes, sort, page]);

  const { data: categoriesData } = useCategories();
  const { data: searchResult, isLoading: searchLoading } = useProductSearch(searchUrlParams);
  const { data: allProducts } = useAllProductOptions();

  const categories = categoriesData ?? [];
  const products = searchResult?.data ?? [];
  const totalCount = searchResult?.pagination?.total ?? 0;
  const totalPages = searchResult?.pagination?.totalPages ?? 1;

  const { allColorOptions, allSizeOptions } = useMemo(() => {
    if (!allProducts) return { allColorOptions: [] as string[], allSizeOptions: [] as string[] };
    const colors = Array.from(new Set(allProducts.flatMap(colorsOf))).sort() as string[];
    const available = new Set(allProducts.flatMap(sizesOf));
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"].filter((s) => available.has(s));
    return { allColorOptions: colors, allSizeOptions: sizes };
  }, [allProducts]);

  const navTo = (updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "1" || value === "name") p.delete(key);
      else p.set(key, value);
    }
    router.push(`/products?${p.toString()}`, { scroll: false });
  };

  const toggleFilter = (key: string, set: Set<string>, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    navTo({ [key]: Array.from(next).join(",") || undefined, page: "1" });
  };

  const clearFilters = () => router.push("/products", { scroll: false });

  const hasFilters = selectedCategoryIds.size > 0 || selectedColors.size > 0 || selectedSizes.size > 0 || searchQuery || sort !== "name";

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 py-6">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-6 self-start">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Shop all</h2>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted hover:text-navy">
              Clear <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <FilterSection title="Category" options={categories.map((c) => c.name)}
          selected={new Set(categories.filter((c) => selectedCategoryIds.has(String(c.id))).map((c) => c.name))}
          onToggle={(v) => {
            const cat = categories.find((c) => c.name === v);
            if (!cat) return;
            toggleFilter("categoryIds", selectedCategoryIds, String(cat.id));
          }} />
        <FilterSection title="Color" options={allColorOptions} selected={selectedColors}
          onToggle={(v) => toggleFilter("colors", selectedColors, v)} />
        <FilterSection title="Size" options={allSizeOptions} selected={selectedSizes}
          onToggle={(v) => toggleFilter("sizes", selectedSizes, v)} />
      </aside>

      {/* Product grid */}
      <div className="mt-6 lg:mt-0">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-semibold text-foreground">Products</h1>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
              <input type="text" defaultValue={searchQuery}
                onKeyDown={(e) => { if (e.key === "Enter") navTo({ q: (e.target as HTMLInputElement).value || undefined, page: "1" }); }}
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors" />
            </div>
            <select value={sort} onChange={(e) => navTo({ sort: e.target.value })}
              className="px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {searchLoading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <Card className="p-6 md:p-12"><EmptyState icon="products" title="No products found"
            message={hasFilters ? "No products match these filters." : "Products will appear here once added."} /></Card>
        ) : (
          <>
            <p className="text-xs text-muted mb-4">{totalCount} product{totalCount === 1 ? "" : "s"}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => {
                const colors = colorsOf(p);
                const sizes = sizesOf(p);
                const soldOut = totalStockOf(p) === 0;
                return (
                  <Link key={p.id} href={`/products/${p.id}`} className="group">
                    <div className="aspect-square bg-surface rounded-lg overflow-hidden relative">
                      {soldOut && <span className="absolute top-2 left-2 bg-navy text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded">Sold out</span>}
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-sm">No image</div>
                      )}
                    </div>
                    <p className="text-[11px] text-gold-dark uppercase tracking-wide mt-3">{p.category.name}</p>
                    <p className="text-sm font-medium text-navy mt-0.5">{p.name}</p>
                    <p className="text-sm font-semibold text-navy mt-1">₱{Number(p.price).toFixed(2)}</p>
                    {colors.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {colors.map((c) => {
                          const hex = toHex(c);
                          return <span key={c} title={c} style={{ backgroundColor: hex }}
                            className={`w-4 h-4 rounded-full ${isLightColor(hex) ? "ring-1 ring-border/60 ring-inset" : "ring-1 ring-black/10 ring-inset"}`} />;
                        })}
                      </div>
                    )}
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sizes.map((s) => <span key={s} className="px-1.5 py-0.5 rounded bg-navy/5 border border-border text-[10px] text-navy-dark">{s}</span>)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} total={totalCount}
              onPageChange={(p) => navTo({ page: String(p) })} />
          </>
        )}
      </div>
    </div>
  );
};

const ProductsPage = () => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <ProductsContent />
    </Suspense>
  </ErrorBoundary>
);
export default ProductsPage;
