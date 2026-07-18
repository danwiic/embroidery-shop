import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
};
