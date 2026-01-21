// Simple in-memory rate limiter
// Note: This resets when server restarts
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup old records every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key);
      }
    }
  }

  async check(
    identifier: string,
    limit: number,
    windowMs: number,
  ): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const record = this.records.get(identifier);

    // No record or expired record - create new
    if (!record || now > record.resetTime) {
      this.records.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    // Record exists and still valid
    if (record.count >= limit) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Increment count
    record.count += 1;
    this.records.set(identifier, record);

    return {
      success: true,
      remaining: limit - record.count,
      reset: record.resetTime,
    };
  }

  // Get current status without incrementing
  async status(identifier: string): Promise<RateLimitRecord | null> {
    const now = Date.now();
    const record = this.records.get(identifier);

    if (!record || now > record.resetTime) {
      return null;
    }

    return record;
  }

  // Reset a specific identifier
  async reset(identifier: string): Promise<void> {
    this.records.delete(identifier);
  }

  // Clear all records (for testing)
  async clear(): Promise<void> {
    this.records.clear();
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

// Helper function to get client IP
export function getClientIp(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a default (development)
  return "unknown";
}

// Helper to format time remaining
export function formatResetTime(resetTimestamp: number): string {
  const now = Date.now();
  const secondsRemaining = Math.ceil((resetTimestamp - now) / 1000);

  if (secondsRemaining < 60) {
    return `${secondsRemaining} seconds`;
  }

  const minutesRemaining = Math.ceil(secondsRemaining / 60);
  return `${minutesRemaining} minutes`;
}
