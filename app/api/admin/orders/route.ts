import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllOrders } from "@/lib/services/admin-orders";
import type { OrderStatus } from "@/lib/types";

export const GET = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | null;
  const orders = await getAllOrders(status ?? undefined);
  return NextResponse.json(orders);
};
