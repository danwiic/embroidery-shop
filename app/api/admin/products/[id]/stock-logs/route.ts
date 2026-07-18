import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStockLogs, addStockLog } from "@/lib/services/products";
import { notifyBackInStock } from "@/lib/services/stock-notify";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const logs = await getStockLogs(Number((await params).id));
  return NextResponse.json(logs);
};

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { change, note, variantId } = body;
    if (change === 0 || !change) {
      return NextResponse.json({ error: "Change must be non-zero" }, { status: 400 });
    }

    const productId = Number((await params).id);
    const result = await addStockLog(productId, change, note, variantId ? Number(variantId) : undefined);

    // If stock increased from 0 to > 0, notify subscribers
    if (change > 0) {
      // Fire and forget — don't block the response
      notifyBackInStock(productId).catch(() => {});
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add stock";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
