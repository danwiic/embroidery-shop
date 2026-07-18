import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCart, addToCart } from "@/lib/services/cart";

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cart = await getCart(session.user.id);
  return NextResponse.json(cart ?? { items: [] });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, quantity, color, size, variantId } = await req.json();
    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "ProductId and quantity are required" },
        { status: 400 },
      );
    }
    const item = await addToCart({
      userId: session.user.id,
      productId: Number(productId),
      quantity: Number(quantity),
      color,
      size,
      variantId: variantId ? Number(variantId) : undefined,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add to cart";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
