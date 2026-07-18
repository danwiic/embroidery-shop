import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMyNotifications,
  getUnreadCount,
} from "@/lib/services/notifications";

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unread] = await Promise.all([
    getMyNotifications(session.user.id),
    getUnreadCount(session.user.id),
  ]);

  return NextResponse.json({ notifications, unread });
};
