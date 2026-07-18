import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notifications";
import { sendEmail } from "@/lib/email/send";
import { statusUpdateEmail } from "@/lib/email/templates";
import { orderCancelSchema } from "@/lib/validation/schemas";

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = (await params).id;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the order owner can cancel
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only PENDING_PAYMENT orders can be cancelled by the customer
    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Only pending payment orders can be cancelled" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = orderCancelSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        statusHistory: {
          create: {
            status: "CANCELLED",
            changedBy: session.user.id,
            note: reason ? `Cancelled: ${reason}` : "Cancelled by customer",
          },
        },
      },
    });

    // Notify
    await createNotification({
      userId: order.userId,
      title: "Order Cancelled",
      message: `Order #${order.orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      orderId: order.id,
    });

    try {
      await sendEmail({
        to: order.user.email,
        subject: `Order Cancelled - #${order.orderNumber}`,
        html: statusUpdateEmail({
          name: order.user.name ?? "Customer",
          orderNumber: order.orderNumber,
          status: "CANCELLED",
          note: reason,
        }),
      });
    } catch {
      // email failure shouldn't block cancellation
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
