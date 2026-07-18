import { cookies } from "next/headers";
import crypto from "crypto";

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a CSRF token, set it as a cookie, and return it.
 * Call this on pages that have forms.
 */
export const generateCsrfToken = async (): Promise<string> => {
  const token = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return token;
};

/**
 * Validate a CSRF token from the request header against the cookie.
 * Returns true if valid, false otherwise.
 */
export const validateCsrf = async (request: Request): Promise<boolean> => {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;

  const headerToken = request.headers.get(CSRF_HEADER);
  if (!headerToken) return false;

  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  } catch {
    return false;
  }
};

/**
 * API route wrapper that validates CSRF for mutating methods (POST, PUT, PATCH, DELETE).
 * If the route should skip CSRF (e.g., public endpoints), don't use this wrapper.
 */
export const withCsrf = (handler: (req: Request, ...args: unknown[]) => Promise<Response>) => {
  return async (req: Request, ...args: unknown[]) => {
    const method = req.method.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const valid = await validateCsrf(req);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid CSRF token" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return handler(req, ...args);
  };
};
