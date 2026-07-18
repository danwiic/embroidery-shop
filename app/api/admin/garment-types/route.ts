import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getGarmentTypes,
  createGarmentType,
} from "@/lib/services/products";

export const GET = async () => {
  // Garment types are read by customers during alterations — public GET
  const types = await getGarmentTypes();
  return NextResponse.json(types);
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }
    const type = await createGarmentType({ name, slug });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create garment type";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
