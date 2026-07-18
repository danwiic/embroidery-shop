import { prisma } from "@/lib/prisma";

export const getProductReviews = (productId: number) =>
  prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const getProductRating = async (productId: number) => {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
};

export const createReview = (data: {
  productId: number;
  userId: string;
  rating: number;
  comment?: string;
}) =>
  prisma.review.create({
    data,
    include: {
      user: { select: { id: true, name: true } },
    },
  });

export const getUserReview = (productId: number, userId: string) =>
  prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });

export const hasUserPurchasedProduct = (productId: number, userId: string) =>
  prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] },
      },
    },
  }).then(Boolean);
