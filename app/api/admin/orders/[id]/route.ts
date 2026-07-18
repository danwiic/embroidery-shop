import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminOrder } from "@/lib/services/admin-orders";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const order = await getAdminOrder((await params).id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
};
