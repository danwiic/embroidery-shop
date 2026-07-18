import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordRateLimit } from "@/lib/rate-limit";
import { createResetToken } from "@/lib/services/reset-password";
import { sendEmail } from "@/lib/email/send";
import { forgotPasswordEmail } from "@/lib/email/templates";

export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const { success } = await forgotPasswordRateLimit.limit(email);
    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 10 minutes." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true });
    }

    const token = createResetToken(email);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    try {
      await sendEmail({
        to: email,
        subject: "Reset Your Password - Jendave Embroidery Shop",
        html: forgotPasswordEmail({
          name: user.name,
          resetLink,
        }),
      });
    } catch {
      // Email failure is silent to user
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
};
