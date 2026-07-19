import { NextResponse } from "next/server";
import { getSettings } from "@/lib/services/settings";

export const GET = async () => {
  const all = await getSettings();
  const allowed = ["shopName", "shopEmail", "shopPhone", "logoUrl", "resizingFee", "shopAddress", "aboutText"];
  const result: Record<string, string> = {};
  for (const key of allowed) {
    if (all[key]) result[key] = all[key];
  }
  return NextResponse.json(result);
};
