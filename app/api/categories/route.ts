import { NextResponse } from "next/server";
import { getCategories } from "@/lib/services/products";

export const GET = async () => {
  const categories = await getCategories();
  return NextResponse.json(categories);
};
