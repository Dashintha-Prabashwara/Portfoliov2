/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

import { getValidatedEnv } from './env.js';

const rateLimit = new Map();
const env = getValidatedEnv();

/**
 * Rate limiter configuration
 */
const WINDOW_MS = env.RATE_LIMIT_WINDOW_MS;
const MAX_REQUESTS = env.RATE_LIMIT_MAX_REQUESTS;

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.resetTime > WINDOW_MS) {
      rateLimit.delete(key);
    }
  }
}, WINDOW_MS);

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (IP address, user ID, etc.)
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier) {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // No record or window expired
  if (!record || now - record.resetTime > WINDOW_MS) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: now + WINDOW_MS,
    };
  }

  // Increment count
  record.count += 1;

  // Check if limit exceeded
  if (record.count > MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime + WINDOW_MS,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetTime: record.resetTime + WINDOW_MS,
  };
}

/**
 * Get client IP address from request headers
 * @param {Request} request - Next.js request object
 * @returns {string} - IP address
 */
export function getClientIp(request) {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
}
