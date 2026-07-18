import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasUserPurchasedProduct, getUserReview } from "@/lib/services/reviews";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ canReview: false, hasReviewed: false });
  }

  const productId = Number((await params).id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const [purchased, existingReview] = await Promise.all([
    hasUserPurchasedProduct(productId, session.user.id),
    getUserReview(productId, session.user.id),
  ]);

  return NextResponse.json({
    canReview: purchased && !existingReview,
    hasReviewed: !!existingReview,
    hasPurchased: purchased,
  });
};
