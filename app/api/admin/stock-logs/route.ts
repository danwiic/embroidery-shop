import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllStockLogs } from "@/lib/services/products";

export const GET = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const logs = await getAllStockLogs(100);
  return NextResponse.json(logs);
};
