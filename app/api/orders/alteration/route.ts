import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAlterationOrder } from "@/lib/services/orders";
import { createNotification } from "@/lib/services/notifications";
import { sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      categoryId,
      garmentPhotoUrl,
      fitPreference,
      pickupDate,
      serviceFee,
      paymentMethod,
      paymentRef,
      estimatedCompletion,
      measurements,
    } = await req.json();

    if (!categoryId || !fitPreference || !pickupDate || !paymentMethod || !paymentRef) {
      return NextResponse.json(
        { error: "Missing required alteration fields" },
        { status: 400 },
      );
    }

    const order = await createAlterationOrder({
      userId: session.user.id,
      categoryId: Number(categoryId),
      garmentPhotoUrl,
      fitPreference,
      pickupDate,
      serviceFee: Number(serviceFee),
      paymentMethod,
      paymentRef,
      estimatedCompletion: estimatedCompletion ?? new Date().toISOString(),
      measurements,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      await createNotification({
        userId: user.id,
        title: "Alteration Order Confirmed",
        message: `Alteration order #${order.orderNumber} has been submitted.`,
        orderId: order.id,
      });

      try {
        await sendEmail({
          to: user.email,
          subject: `Alteration Order Confirmed - #${order.orderNumber}`,
          html: orderConfirmationEmail({
            name: user.name,
            orderNumber: order.orderNumber,
            estimatedCompletion: order.estimatedCompletion?.toDateString(),
          }),
        });
      } catch {
        // email failure shouldn't block the order
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create alteration order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
