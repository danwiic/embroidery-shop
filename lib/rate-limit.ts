import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const NOOP_LIMITER = {
  limit: async () => ({ success: true, limit: 999, remaining: 999, reset: 0 }),
};

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url?.startsWith("https")) return null;

  return new Redis({ url, token: token ?? "" });
};

const createLimiter = (requests: number, windowMs: number) => {
  const redis = getRedis();
  if (!redis) return NOOP_LIMITER;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowMs} ms` as any),
  });
};

export const loginRateLimit = createLimiter(5, 60_000);
export const forgotPasswordRateLimit = createLimiter(3, 600_000);
