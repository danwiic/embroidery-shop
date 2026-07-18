import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email/send";

export const GET = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await sendEmail({
      to: session.user.email!,
      subject: "Test Email from Jendave",
      html: "<p>If you receive this, email sending is working!</p>",
    });
    return NextResponse.json({ ok: true, message: `Email sent to ${session.user.email}` });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
};
