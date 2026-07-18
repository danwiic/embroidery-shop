import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateCartItem, removeCartItem } from "@/lib/services/cart";

export const PUT = async (req: Request, { params }: { params: Promise<{ itemId: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quantity } = await req.json();
    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 },
      );
    }
    const item = await updateCartItem((await params).itemId, quantity);
    return NextResponse.json(item);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ itemId: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await removeCartItem((await params).itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
