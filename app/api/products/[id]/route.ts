import { NextResponse } from "next/server";
import { getProduct } from "@/lib/services/products";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const product = await getProduct(Number((await params).id));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
};
