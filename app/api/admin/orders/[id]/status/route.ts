import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateOrderStatus } from "@/lib/services/admin-orders";
import { createNotification } from "@/lib/services/notifications";
import { sendEmail } from "@/lib/email/send";
import { statusUpdateEmail } from "@/lib/email/templates";
import type { OrderStatus } from "@/lib/types";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { status, note } = await req.json();
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const order = await updateOrderStatus(
      (await params).id,
      status as OrderStatus,
      session.user.id!,
      note,
    );

    // Notify customer
    await createNotification({
      userId: order.user.id,
      title: "Order Status Updated",
      message: `Order #${order.orderNumber} is now ${status.replace(/_/g, " ")}.${note ? ` Note: ${note}` : ""}`,
      orderId: order.id,
    });

    try {
      await sendEmail({
        to: order.user.email,
        subject: `Order Update - #${order.orderNumber}`,
        html: statusUpdateEmail({
          name: order.user.name ?? "Customer",
          orderNumber: order.orderNumber,
          status,
          note,
        }),
      });
    } catch (err) {
      console.error("Failed to send email:", err instanceof Error ? err.message : err);
    }

    return NextResponse.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
