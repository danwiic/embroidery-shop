import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateVariant, deleteVariant } from "@/lib/services/products";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { variantId } = await params;
    const body = await req.json();
    const variant = await updateVariant(Number(variantId), {
      size: body.size,
      color: body.color,
      price: body.price !== undefined ? Number(body.price) : undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      imageUrl: body.imageUrl,
      sku: body.sku,
    });
    return NextResponse.json(variant);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update variant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await deleteVariant(Number((await params).variantId));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete variant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
