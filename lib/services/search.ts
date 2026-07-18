import { prisma } from "@/lib/prisma";
import { prismaPagination } from "./pagination";
import type { Prisma } from "@prisma/client";

export type SearchParams = {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  sort?: "name" | "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
};

export const searchProducts = async (params: SearchParams) => {
  const where: Prisma.ProductWhereInput = {};
  const AND: Prisma.ProductWhereInput[] = [];

  // Text search on name
  if (params.q?.trim()) {
    AND.push({
      name: { contains: params.q.trim(), mode: "insensitive" },
    });
  }

  // Category filter
  if (params.categoryId) {
    AND.push({ categoryId: params.categoryId });
  }

  // Price range
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter: Prisma.DecimalFilter = {};
    if (params.minPrice !== undefined) priceFilter.gte = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.lte = params.maxPrice;
    AND.push({ price: priceFilter });
  }

  // Color filter (check both product.color and variants)
  if (params.colors && params.colors.length > 0) {
    AND.push({
      OR: [
        { color: { in: params.colors, mode: "insensitive" } },
        {
          variants: {
            some: { color: { in: params.colors, mode: "insensitive" } },
          },
        },
      ],
    });
  }

  // Size filter (check both product.size and variants)
  if (params.sizes && params.sizes.length > 0) {
    AND.push({
      OR: [
        { size: { in: params.sizes, mode: "insensitive" } },
        {
          variants: {
            some: { size: { in: params.sizes, mode: "insensitive" } },
          },
        },
      ],
    });
  }

  if (AND.length > 0) {
    where.AND = AND;
  }

  // Exclude soft-deleted products
  where.deletedAt = null;

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { name: "asc" };
  switch (params.sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { id: "desc" };
      break;
    case "name":
    default:
      orderBy = { name: "asc" };
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
        variants: { select: { id: true, color: true, size: true, stock: true } },
      },
      orderBy,
      ...prismaPagination({ page, limit }),
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};
