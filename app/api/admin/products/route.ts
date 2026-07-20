import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createProduct,
} from "@/lib/services/products";
import { getPaginationParams, paginate, prismaPagination } from "@/lib/services/pagination";

export const GET = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const pagination = getPaginationParams(searchParams, { page: 1, limit: 50 });
  const q = searchParams.get("q")?.trim();

  const where: any = { deletedAt: null };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
      orderBy: { name: "asc" },
      ...prismaPagination(pagination),
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json(paginate(data, total, pagination));
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.name || !data.categoryId || data.price === undefined) {
      return NextResponse.json(
        { error: "Name, categoryId, and price are required" },
        { status: 400 },
      );
    }
    const product = await createProduct({
      name: data.name,
      description: data.description,
      categoryId: Number(data.categoryId),
      price: Number(data.price),
      stock: data.stock ? Number(data.stock) : 0,
      color: data.color,
      size: data.size,
      imageUrl: data.imageUrl,
      variants: data.variants,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
