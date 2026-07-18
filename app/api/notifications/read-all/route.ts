import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAllAsRead } from "@/lib/services/notifications";

export const PUT = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllAsRead(session.user.id);
  return NextResponse.json({ success: true });
};
