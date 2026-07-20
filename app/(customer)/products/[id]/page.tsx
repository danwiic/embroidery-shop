"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageLoader } from "@/components/ui/page-loader";
import { ArrowLeft, Plus, Minus, Star, Mail, Bell, X, Send, Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/lib/contexts/toast";
import { useProduct, useProductReviews, useCheckCanReview, useAddToCart } from "@/lib/hooks/use-api";
import Image from "next/image";

const COLOR_MAP: Record<string, string> = {
  white: "#ffffff", black: "#000000", navy: "#1e3a5f", "navy blue": "#1e3a5f",
  blue: "#2563eb", red: "#dc2626", green: "#16a34a", brown: "#92400e",
  gray: "#6b7280", grey: "#6b7280", gold: "#c9a84c", yellow: "#eab308",
  orange: "#ea580c", pink: "#ec4899", purple: "#9333ea", teal: "#0d9488",
  khaki: "#c3b091", beige: "#f5f5dc", maroon: "#800000", olive: "#808000",
  silver: "#c0c0c0", charcoal: "#36454f", cream: "#fdf8e1",
};

const toHex = (c: string) => COLOR_MAP[c.toLowerCase().trim()] ?? c.toLowerCase();

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange?.(s)} disabled={!onChange}
        className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
      >
        <Star className={`w-4 h-4 ${s <= rating ? "text-gold fill-gold" : "text-border"}`} />
      </button>
    ))}
  </div>
);

const ProductDetailContent = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  const { data: product, isLoading } = useProduct(id);
  const { data: reviews = [] } = useProductReviews(id);
  const canReviewCheck = useCheckCanReview();
  const addToCartMutation = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  // Reviews state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Get Notified
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    if (!product) return;
    const variants = product.variants ?? [];
    const inStock = variants.find((v) => v.stock > 0) ?? variants[0];
    setSelectedColor(inStock?.color);
    setSelectedSize(inStock?.size);
  }, [product]);

  useEffect(() => {
    if (session?.user?.id) {
      canReviewCheck.check(id).then((data) => setCanReview(data.canReview)).catch(() => {});
    }
  }, [id, session]);

  // Check if current user already reviewed
  useEffect(() => {
    if (session?.user?.id && reviews.length > 0) {
      setUserReviewed(reviews.some((r) => r.user.id === session.user.id));
    }
  }, [reviews, session]);

  if (isLoading) return <PageLoader />;
  if (!product) return <p className="text-red-600">Product not found</p>;

  const baseVariant = product.color || product.size
    ? { id: -1, color: product.color, size: product.size, price: product.price, stock: product.stock, imageUrl: product.imageUrl }
    : null;

  const variants = [...(baseVariant ? [baseVariant] : []), ...(product.variants ?? [])];
  const hasVariants = variants.length > 0;
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
  const sizes = (Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[])
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.toUpperCase());
      const bi = SIZE_ORDER.indexOf(b.toUpperCase());
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const stockFor = (color?: string, size?: string) =>
    variants.find((v) => (colors.length === 0 || v.color === color) && (sizes.length === 0 || v.size === size))?.stock ?? 0;

  const selectedVariant = hasVariants
    ? variants.find((v) => (colors.length === 0 || v.color === selectedColor) && (sizes.length === 0 || v.size === selectedSize))
    : undefined;

  const activePrice = selectedVariant?.price ?? product.price;
  const activeStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;

  const galleryImages = [
    ...(selectedVariant?.imageUrl ? [selectedVariant.imageUrl] : []),
    ...(product.images.length > 0 ? product.images.map((i) => i.url) : product.imageUrl ? [product.imageUrl] : []),
  ];

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const addToCart = async () => {
    if (!session) { router.push("/login"); return; }
    try {
      await addToCartMutation.mutateAsync({
        productId: Number(id),
        variantId: selectedVariant && selectedVariant.id !== -1 ? selectedVariant.id : undefined,
        quantity,
      });
      router.push("/cart");
    } catch (e: any) {
      addToast("error", e.message ?? "Failed to add to cart");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    if (reviewRating === 0) { addToast("error", "Please select a rating"); return; }
    setSubmittingReview(true);
    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment || undefined }),
    });
    if (res.ok) {
      const newReview = await res.json();
      setUserReviewed(true);
      setReviewRating(0);
      setReviewComment("");
      addToast("success", "Review submitted");
    } else {
      const data = await res.json();
      addToast("error", data.error ?? "Failed to submit review");
    }
    setSubmittingReview(false);
  };

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifying(true);
    const email = notifyEmail || session?.user?.email || "";
    if (!email) { addToast("error", "Please enter your email"); setNotifying(false); return; }
    const res = await fetch(`/api/products/${id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      addToast("success", "You'll be notified when back in stock!");
      setNotifyOpen(false);
      setNotifyEmail("");
    } else {
      const data = await res.json();
      addToast("error", data.error ?? "Failed to subscribe");
    }
    setNotifying(false);
  };

  const highlights = [!hasVariants && product.color, !hasVariants && product.size, product.category.name].filter(Boolean) as string[];

  const sections = [
    { id: "description", title: "Description", body: product.description ?? "No description available for this product." },
    {
      id: "details", title: "Product Details",
      body: (
        <ul className="space-y-1">
          {selectedVariant?.color && <li><span className="text-muted">Color:</span> {selectedVariant.color}</li>}
          {selectedVariant?.size && <li><span className="text-muted">Size:</span> {selectedVariant.size}</li>}
          <li><span className="text-muted">Stock:</span> {activeStock} available</li>
        </ul>
      ),
    },
    { id: "shipping", title: "Shipping", body: "Ships within 3–5 business days. Delivery times vary by location." },
  ];

  return (
    <div className="py-6">
      <Link href="/products" className="text-sm text-navy-light hover:text-navy inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-10 mt-4">
        {/* Images */}
        <div>
          <div className="aspect-square bg-surface rounded-xl overflow-hidden shadow-card">
            {galleryImages.length > 0 ? (
              <Image src={galleryImages[selectedImg] ?? galleryImages[0]} alt={product.name} width={600} height={600} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No image</div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 mt-3">
              {galleryImages.map((url, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? "border-navy shadow-card" : "border-border opacity-70 hover:opacity-100"}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs text-gold-dark uppercase tracking-wide font-semibold">
            {activeStock === 0 ? "Out of stock" : activeStock <= 5 ? "Limited stock" : product.category.name}
          </p>
          <h1 className="text-3xl font-bold text-navy mt-2 leading-tight">{product.name}</h1>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-muted">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
            </div>
          )}

          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {highlights.map((h, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-navy/5 border border-border text-xs font-medium text-navy-dark uppercase tracking-wide">{h}</span>
              ))}
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Color{selectedColor ? `: ${selectedColor}` : ""}</p>
              <div className="flex items-center gap-2">
                {colors.map((c) => {
                  const available = variants.some((v) => v.color === c && v.stock > 0);
                  const active = c === selectedColor;
                  return (
                    <button key={c} title={c} disabled={!available} onClick={() => setSelectedColor(c)}
                      style={{ backgroundColor: toHex(c) }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${active ? "border-navy shadow-card" : "border-border"} ${!available ? "cursor-not-allowed" : "hover:border-navy-light"}`} />
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = stockFor(selectedColor, s) > 0;
                  const active = s === selectedSize;
                  return (
                    <button key={s} disabled={!available} onClick={() => setSelectedSize(s)}
                      className={`min-w-10 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        active ? "bg-navy text-white border-navy" : available ? "border-border text-navy hover:border-navy-light bg-input" : "border-border text-navy/60 cursor-not-allowed bg-input"
                      }`}>{s}</button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-3xl font-bold text-navy mt-6">₱{Number(activePrice).toFixed(2)}</p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-border rounded-lg bg-input">
              <button onClick={() => setQuantity(q => Math.max(1, Math.min(activeStock || 999, q - 1)))} className="px-3 py-2 text-muted hover:text-navy">−</button>
              <span className="px-3 py-2 text-sm font-medium border-x border-border">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.max(1, Math.min(activeStock || 999, q + 1)))} className="px-3 py-2 text-muted hover:text-navy">+</button>
            </div>
            <button onClick={activeStock === 0 ? () => setNotifyOpen(true) : addToCart}
              disabled={addToCartMutation.isPending || (activeStock === 0 ? false : hasVariants && !selectedVariant)}
              className="flex-1 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all bg-navy text-white hover:bg-navy-light shadow-raised disabled:bg-surface disabled:text-muted disabled:border disabled:border-border disabled:shadow-none"
            >
              {activeStock === 0 ? (
                <span className="inline-flex items-center gap-1.5"><Bell className="w-4 h-4" /> Get Notified</span>
              ) : addToCartMutation.isPending ? (
                <span className="inline-flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Adding...</span>
              ) : "Add to Cart"}
            </button>
          </div>

          {/* Accordion */}
          <div className="mt-8 divide-y divide-border border-t border-border">
            {sections.map((s) => {
              const open = openSection === s.id;
              return (
                <div key={s.id}>
                  <button onClick={() => setOpenSection(open ? null : s.id)} className="w-full flex items-center justify-between py-4 text-left">
                    <span className="text-sm font-semibold text-navy">{s.title}</span>
                    {open ? <Minus className="w-4 h-4 text-gold-dark" /> : <Plus className="w-4 h-4 text-gold-dark" />}
                  </button>
                  {open && <div className="pb-4 text-sm text-muted">{s.body}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <StarRating rating={Math.round(avgRating)} />
              <span>{avgRating.toFixed(1)} average</span>
            </div>
          )}
        </div>

        {session && canReview && (
          <Card className="p-5 mb-6">
            <form onSubmit={submitReview} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Write a Review</h3>
              <div className="flex items-center gap-2">
                <StarRating rating={reviewRating} onChange={setReviewRating} />
                {reviewRating > 0 && <span className="text-xs text-muted">{reviewRating}/5</span>}
              </div>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={3} maxLength={1000}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm placeholder:text-muted/60 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors" />
              <div className="flex justify-end">
                <Button type="submit" disabled={submittingReview || reviewRating === 0} size="sm">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {session && !canReview && !userReviewed && (
          <p className="text-sm text-muted mb-6">
            You must purchase this product before you can leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{r.user.name}</span>
                      <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted mt-2">{r.comment}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Get Notified Modal */}
      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)} title="Get Notified"
        footer={<>
          <Button type="button" variant="outlined" onClick={() => setNotifyOpen(false)}>Cancel</Button>
          <Button type="submit" form="notify-form" disabled={notifying}>{notifying ? "Subscribing..." : "Notify Me"}</Button>
        </>}>
        <form id="notify-form" onSubmit={handleNotify} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">{product.name}</p>
              <p className="text-sm text-muted mt-1">We'll email you when this product is back in stock.</p>
            </div>
          </div>
          <Input label="Email address" type="email" required
            value={notifyEmail || session?.user?.email || ""}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="your@email.com" />
        </form>
      </Modal>
    </div>
  );
};

const ProductDetailPage = ({ params }: { params: Promise<{ id: string }> }) => (
  <ErrorBoundary><ProductDetailContent params={params} /></ErrorBoundary>
);

export default ProductDetailPage;
