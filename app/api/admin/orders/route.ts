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
  const q = searchParams.get("q") ?? undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

  const result = await getAllOrders({ status: status ?? undefined, q, page, limit });
  return NextResponse.json(result);
};
