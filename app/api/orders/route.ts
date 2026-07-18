import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMyOrders, getOrder, createReadyMadeOrder } from "@/lib/services/orders";
import { createNotification } from "@/lib/services/notifications";
import { sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getMyOrders(session.user.id);
  return NextResponse.json(orders);
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fulfillment, deliveryAddress, paymentMethod, paymentRef } =
      await req.json();

    if (!fulfillment || !paymentMethod || !paymentRef) {
      return NextResponse.json(
        { error: "Fulfillment, paymentMethod, and paymentRef are required" },
        { status: 400 },
      );
    }

    const order = await createReadyMadeOrder({
      userId: session.user.id,
      fulfillment,
      deliveryAddress,
      paymentMethod,
      paymentRef,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title: "Order Confirmed",
        message: `Order #${order.orderNumber} has been placed successfully.`,
        orderId: order.id,
      });

      try {
        await sendEmail({
          to: user.email,
          subject: `Order Confirmed - #${order.orderNumber}`,
          html: orderConfirmationEmail({
            name: user.name,
            orderNumber: order.orderNumber,
          }),
        });
      } catch {
        // email failure shouldn't block the order
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
