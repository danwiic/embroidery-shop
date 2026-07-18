import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProductReviews, createReview, getUserReview, hasUserPurchasedProduct } from "@/lib/services/reviews";
import { reviewSchema } from "@/lib/validation/schemas";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const productId = Number((await params).id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const reviews = await getProductReviews(productId);
  return NextResponse.json(reviews);
};

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = Number((await params).id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    // Only purchasers can review
    const purchased = await hasUserPurchasedProduct(productId, session.user.id);
    if (!purchased) {
      return NextResponse.json(
        { error: "You must purchase this product before reviewing" },
        { status: 403 },
      );
    }

    // Check if user already reviewed this product
    const existing = await getUserReview(productId, session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 },
      );
    }

    const review = await createReview({
      productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
