import { NextResponse } from "next/server";
import { registerUser } from "@/lib/services/auth";
import { signIn } from "@/auth";

export const POST = async (req: Request) => {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    await registerUser({ email, password, name, phone });

    await signIn("credentials", { email, password, redirect: false });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    const status = message === "Email already registered" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
};
