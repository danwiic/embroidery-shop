import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "@auth/core/jwt";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const secureCookie = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request as any,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });

  if (!token) {
    if (isAdminRoute) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }

  const role = token.role as string | undefined;

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage) {
    const destination = role === "ADMIN" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}
