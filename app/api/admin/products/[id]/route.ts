import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const product = await getProduct(Number((await params).id));
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const id = Number((await params).id);
    const data = await req.json();
    const product = await updateProduct(id, {
      ...data,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      price: data.price !== undefined ? Number(data.price) : undefined,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
    });
    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await deleteProduct(Number((await params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
