import { NextResponse } from "next/server";
import { getProducts } from "@/lib/services/products";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const take = searchParams.get("take");
  const products = await getProducts(
    categoryId ? Number(categoryId) : undefined,
    take ? Number(take) : undefined,
  );
  return NextResponse.json(products);
};
