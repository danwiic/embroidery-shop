import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addProductImage, deleteProductImage } from "@/lib/services/products";

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    const image = await addProductImage(Number((await params).id), url);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add image";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
