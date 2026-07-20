import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// Cart hooks

export type CartItem = {
  id: string;
  quantity: number;
  color?: string;
  size?: string;
  variant?: { id: number; size?: string; color?: string; price?: string | null; stock: number };
  product: { id: number; name: string; price: string; imageUrl?: string; stock: number };
};

export const useCart = () =>
  useQuery<{ items: CartItem[] }>({
    queryKey: ["cart"],
    queryFn: () => api("/api/cart"),
    staleTime: 10_000,
  });

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      }).then((r) => { if (!r.ok) return r.json().then((d) => { throw new Error(d.error ?? "Failed"); }); return r.json(); }),
    onMutate: async ({ itemId, quantity }) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<{ items: CartItem[] }>(["cart"]);
      qc.setQueryData<{ items: CartItem[] }>(["cart"], (old) => old ? { items: old.items.map((i) => i.id === itemId ? { ...i, quantity } : i) } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["cart"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetch(`/api/cart/${itemId}`, { method: "DELETE" }).then((r) => { if (!r.ok) throw new Error("Failed"); }),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<{ items: CartItem[] }>(["cart"]);
      qc.setQueryData<{ items: CartItem[] }>(["cart"], (old) => old ? { items: old.items.filter((i) => i.id !== itemId) } : old);
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["cart"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// Product detail hooks

export type ProductDetail = {
  id: number; name: string; description?: string; price: string; stock: number;
  color?: string; size?: string; imageUrl?: string;
  images: { id: number; url: string; order: number }[];
  variants: { id: number; size?: string; color?: string; price?: string | null; stock: number; imageUrl?: string }[];
  category: { name: string; slug: string };
};

export type Review = { id: number; rating: number; comment?: string; createdAt: string; user: { id: string; name: string } };

export const useProduct = (id: string) =>
  useQuery<ProductDetail>({
    queryKey: ["product", id],
    queryFn: () => api(`/api/products/${id}`),
    staleTime: 30_000,
  });

export const useProductReviews = (id: string) =>
  useQuery<Review[]>({
    queryKey: ["product", id, "reviews"],
    queryFn: () => api(`/api/products/${id}/reviews`),
    staleTime: 30_000,
  });

export const useCheckCanReview = () => {
  const qc = useQueryClient();
  return {
    check: (id: string) =>
      qc.fetchQuery<{ canReview: boolean }>({
        queryKey: ["product", id, "canReview"],
        queryFn: () => api(`/api/products/${id}/reviews/check`),
        staleTime: 60_000,
      }),
  };
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: { productId: number; variantId?: number; quantity: number }) =>
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity }),
      }).then((r) => { if (!r.ok) return r.json().then((d) => { throw new Error(d.error ?? "Failed"); }); return r.json(); }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// Admin hooks

export type AdminOrder = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string };
};

type PaginatedResult<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
};

export const useAdminOrders = (filter: string, q: string = "", page: number = 1) =>
  useQuery<PaginatedResult<AdminOrder>>({
    queryKey: ["admin", "orders", filter, q, page],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filter) p.set("status", filter);
      if (q) p.set("q", q);
      p.set("page", String(page));
      p.set("limit", "20");
      return api(`/api/admin/orders?${p.toString()}`);
    },
    staleTime: 15_000,
  });

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  deliveryAddress?: string;
  fulfillment?: string;
  estimatedCompletion?: string;
  pickupDate?: string;
  garmentPhotoUrl?: string;
  fitPreference?: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  category?: { name: string };
  items?: { id: string; quantity: number; price: number; product: { name: string; imageUrl?: string } }[];
  measurements?: Record<string, number | null>;
  statusHistory?: { id: string; status: string; note?: string; createdAt: string }[];
};

export const useAdminOrder = (id: string | null) =>
  useQuery<AdminOrderDetail>({
    queryKey: ["admin", "order", id],
    queryFn: () => api(`/api/admin/orders/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: string; note?: string }) =>
      fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      }).then((r) => { if (!r.ok) return r.json().then((d) => { throw new Error(d.error ?? "Failed"); }); return r.json(); }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "order"] });
    },
  });
};
