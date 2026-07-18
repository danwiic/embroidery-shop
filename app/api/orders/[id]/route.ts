import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrder } from "@/lib/services/orders";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const order = await getOrder(
    (await params).id,
    isAdmin ? undefined : session.user.id,
  );

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
};
