import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCategories, getCategoriesWithProducts } from "@/lib/services/products";

export const GET = async (req: NextRequest) => {
  const onlyWithProducts = req.nextUrl.searchParams.get("withProducts") === "true";
  const categories = onlyWithProducts ? await getCategoriesWithProducts() : await getCategories();
  return NextResponse.json(categories);
};
