import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { backInStockSchema } from "@/lib/validation/schemas";

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const productId = Number((await params).id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  // Check product exists and is out of stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, imageUrl: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = backInStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }

    const session = await auth();

    // Check if already subscribed (by email or by user+product)
    const existing = await prisma.backInStockSubscription.findFirst({
      where: {
        productId,
        OR: [
          { email: parsed.data.email },
          ...(session?.user?.id ? [{ userId: session.user.id }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You are already subscribed for this product" },
        { status: 200 },
      );
    }

    await prisma.backInStockSubscription.create({
      data: {
        productId,
        email: parsed.data.email,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json(
      { message: "You'll be notified when this product is back in stock" },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
