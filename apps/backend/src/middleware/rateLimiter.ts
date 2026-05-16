import { Request, Response, NextFunction } from 'express';

const WINDOW_SIZE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

/**
 * Simple in-memory rate limiter for sensitive endpoints.
 * Step 5: Security & Compliance
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  let info = rateLimitMap.get(ip);
  
  if (!info || now > info.resetTime) {
    info = { count: 1, resetTime: now + WINDOW_SIZE_MS };
    rateLimitMap.set(ip, info);
    return next();
  }
  
  info.count++;
  
  if (info.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((info.resetTime - now) / 1000)
    });
  }
  
  next();
}

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, WINDOW_SIZE_MS);
