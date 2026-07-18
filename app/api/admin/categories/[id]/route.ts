import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  updateCategory,
  deleteCategory,
} from "@/lib/services/products";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const id = Number((await params).id);
    const data = await req.json();
    const category = await updateCategory(id, data);
    return NextResponse.json(category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const id = Number((await params).id);
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
