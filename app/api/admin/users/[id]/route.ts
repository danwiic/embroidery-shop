import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const id = (await params).id;
    const { role } = await req.json();

    if (!["CUSTOMER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    });

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
