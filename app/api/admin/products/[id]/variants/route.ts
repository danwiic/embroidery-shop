import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getVariants,
  createVariant,
} from "@/lib/services/products";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const variants = await getVariants(Number((await params).id));
  return NextResponse.json(variants);
};

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const productId = Number((await params).id);
    const body = await req.json();
    const variant = await createVariant({
      productId,
      size: body.size,
      color: body.color,
      price: body.price !== undefined ? Number(body.price) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      imageUrl: body.imageUrl,
      sku: body.sku,
    });
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create variant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
