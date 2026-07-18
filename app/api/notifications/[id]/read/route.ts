import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAsRead } from "@/lib/services/notifications";

export const PUT = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await markAsRead((await params).id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark as read";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
