import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiters for different endpoints
export const bookingIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
  prefix: "padelbap:ratelimit:booking:ip",
  analytics: true, // Enable analytics in Upstash dashboard
});

export const bookingEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "24 h"), // 3 requests per day
  prefix: "padelbap:ratelimit:booking:email",
  analytics: true,
});

export const paymentIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  prefix: "padelbap:ratelimit:payment:ip",
  analytics: true,
});

export const lookupIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 requests per hour
  prefix: "padelbap:ratelimit:lookup:ip",
  analytics: true,
});

export const cancelIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  prefix: "padelbap:ratelimit:cancel:ip",
  analytics: true,
});

// Helper function to get client IP
export function getClientIp(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback for development
  return "127.0.0.1";
}

// Helper to format time remaining
export function formatResetTime(resetTimestamp: number): string {
  const now = Date.now();
  const secondsRemaining = Math.ceil((resetTimestamp - now) / 1000);

  if (secondsRemaining < 60) {
    return `${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""}`;
  }

  const minutesRemaining = Math.ceil(secondsRemaining / 60);

  if (minutesRemaining < 60) {
    return `${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}`;
  }

  const hoursRemaining = Math.ceil(minutesRemaining / 60);
  return `${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""}`;
}

// Helper to handle rate limit response
export function createRateLimitResponse(
  success: boolean,
  reset: number,
  remaining: number,
  endpoint: string,
) {
  if (success) {
    return null; // No error, proceed
  }

  const resetTime = formatResetTime(reset);
  const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);

  return {
    error: `Too many ${endpoint} attempts. Please try again in ${resetTime}.`,
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: secondsUntilReset,
    reset,
    remaining,
  };
}
