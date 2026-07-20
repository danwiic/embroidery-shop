import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/services/search";
import { searchQuerySchema } from "@/lib/validation/schemas";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    categoryIds: searchParams.get("categoryIds") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    colors: searchParams.get("colors") ?? undefined,
    sizes: searchParams.get("sizes") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((e) => e.message).join(", ") },
      { status: 400 },
    );
  }

  const params = parsed.data;

  const result = await searchProducts({
    q: params.q,
    categoryIds: params.categoryIds
      ? params.categoryIds.split(",").map((c) => Number(c.trim()))
      : undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    colors: params.colors
      ? params.colors.split(",").map((c) => c.trim())
      : undefined,
    sizes: params.sizes
      ? params.sizes.split(",").map((s) => s.trim())
      : undefined,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  });

  return NextResponse.json(result);
};
