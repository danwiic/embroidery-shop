import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/services/upload";

export const POST = async (req: Request) => {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 },
      );
    }

    const url = await uploadToCloudinary(image);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
