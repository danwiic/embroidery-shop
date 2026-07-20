import { useQuery } from "@tanstack/react-query";

type Category = { id: number; name: string; slug: string };
type ProductVariant = { id: number; color?: string; size?: string; stock: number };
type Product = {
  id: number; name: string; price: string; stock: number;
  color?: string; size?: string; imageUrl?: string;
  category: Category; variants?: ProductVariant[];
};

type SearchResult = {
  data: Product[];
  pagination: { page: number; total: number; totalPages: number };
};

const api = async <T>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} failed`);
  return r.json();
};

export const useCategories = () =>
  useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => api("/api/categories"), staleTime: 60_000 });

export const useProductSearch = (params: URLSearchParams) => {
  const qs = params.toString();
  return useQuery<SearchResult>({
    queryKey: ["products", "search", qs],
    queryFn: () => api(`/api/products/search?${qs}`),
    staleTime: 30_000,
    enabled: true,
  });
};

export const useAllProductOptions = () =>
  useQuery<Product[]>({
    queryKey: ["products", "options"],
    queryFn: () => api("/api/products?limit=200"),
    staleTime: 60_000,
  });

type Settings = {
  shopName?: string;
  shopEmail?: string;
  shopPhone?: string;
  shopAddress?: string;
  logoUrl?: string;
  aboutText?: string;
  resizingFee?: number;
};

export const useSettings = () =>
  useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => api("/api/settings"),
    staleTime: 30_000,
  });

export const colorsOf = (p: Product) =>
  Array.from(new Set([p.color, ...(p.variants ?? []).map((v) => v.color)].filter(Boolean))) as string[];

export const sizesOf = (p: Product) =>
  Array.from(new Set([p.size, ...(p.variants ?? []).map((v) => v.size)].filter(Boolean))) as string[];

export const totalStockOf = (p: Product) => p.stock + (p.variants ?? []).reduce((s, v) => s + v.stock, 0);
