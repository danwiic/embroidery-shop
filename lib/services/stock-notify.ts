import { prisma } from "@/lib/prisma";
import { createNotification } from "./notifications";
import { sendEmail } from "@/lib/email/send";

/**
 * After adding stock to a product, notify all subscribers who were waiting.
 * Call this after a stock log is created that increased stock from 0 to > 0.
 */
export const notifyBackInStock = async (productId: number) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true },
  });

  if (!product || product.stock <= 0) return;

  const subscribers = await prisma.backInStockSubscription.findMany({
    where: { productId, notified: false },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (subscribers.length === 0) return;

  for (const sub of subscribers) {
    // Create in-app notification for logged-in users
    if (sub.userId) {
      await createNotification({
        userId: sub.userId,
        title: "Back in Stock!",
        message: `${product.name} is now back in stock.`,
      });
    }

    // Send email notification
    try {
      await sendEmail({
        to: sub.email,
        subject: `Back in Stock - ${product.name}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Back in Stock!</h2>
  <p>Hi ${sub.user?.name ?? "there"},</p>
  <p><strong>${product.name}</strong> is now back in stock and available for purchase.</p>
  <p style="text-align: center; margin: 24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${productId}" 
       style="background-color: #1e3a5f; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      View Product
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">— Jendave Embroidery Shop</p>
</body>
</html>`,
      });
    } catch {
      // email failure shouldn't block
    }

    // Mark as notified
    await prisma.backInStockSubscription.update({
      where: { id: sub.id },
      data: { notified: true },
    });
  }
};
