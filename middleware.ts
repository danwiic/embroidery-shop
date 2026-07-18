import { auth } from "@/auth";

export default auth((req) => {
  const isAdmin = req.auth?.user?.role === "ADMIN";
  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = { matcher: ["/admin/:path*"] };
