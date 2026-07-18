import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCategories,
  createCategory,
} from "@/lib/services/products";

export const GET = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const categories = await getCategories();
  return NextResponse.json(categories);
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, slug, sizeGuideUrl } = await req.json();
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }
    const category = await createCategory({ name, slug, sizeGuideUrl });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
