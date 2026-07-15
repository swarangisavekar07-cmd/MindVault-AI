// ─── In-Memory Rate Limiter ────────────────────────────────────────────────────
// Per-user rate limiting: 30 requests/minute, 200 requests/day
// In production, replace this with Redis for multi-instance deployments.

interface UserBucket {
  minuteCount: number;
  minuteReset: number;    // timestamp (ms)
  dayCount: number;
  dayReset: number;       // timestamp (ms)
}

const MINUTE_LIMIT = 30;
const DAY_LIMIT = 200;

const buckets = new Map<string, UserBucket>();

function getBucket(userId: string): UserBucket {
  const now = Date.now();
  let bucket = buckets.get(userId);

  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteReset: now + 60_000,
      dayCount: 0,
      dayReset: now + 86_400_000,
    };
    buckets.set(userId, bucket);
  }

  // Reset minute counter
  if (now > bucket.minuteReset) {
    bucket.minuteCount = 0;
    bucket.minuteReset = now + 60_000;
  }

  // Reset day counter
  if (now > bucket.dayReset) {
    bucket.dayCount = 0;
    bucket.dayReset = now + 86_400_000;
  }

  return bucket;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
  reason?: string;
  remaining: {
    minute: number;
    day: number;
  };
}

export function checkRateLimit(userId: string): RateLimitResult {
  const bucket = getBucket(userId);
  const now = Date.now();

  if (bucket.minuteCount >= MINUTE_LIMIT) {
    return {
      allowed: false,
      retryAfterMs: bucket.minuteReset - now,
      reason: `Rate limit exceeded: ${MINUTE_LIMIT} requests per minute. Please wait ${Math.ceil((bucket.minuteReset - now) / 1000)} seconds.`,
      remaining: { minute: 0, day: DAY_LIMIT - bucket.dayCount },
    };
  }

  if (bucket.dayCount >= DAY_LIMIT) {
    return {
      allowed: false,
      retryAfterMs: bucket.dayReset - now,
      reason: `Daily limit of ${DAY_LIMIT} AI requests reached. Resets tomorrow.`,
      remaining: { minute: MINUTE_LIMIT - bucket.minuteCount, day: 0 },
    };
  }

  // Consume a token
  bucket.minuteCount++;
  bucket.dayCount++;

  return {
    allowed: true,
    remaining: {
      minute: MINUTE_LIMIT - bucket.minuteCount,
      day: DAY_LIMIT - bucket.dayCount,
    },
  };
}

export function getRateLimitStatus(userId: string): { minute: number; day: number } {
  const bucket = getBucket(userId);
  return {
    minute: Math.max(0, MINUTE_LIMIT - bucket.minuteCount),
    day: Math.max(0, DAY_LIMIT - bucket.dayCount),
  };
}
