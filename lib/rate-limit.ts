interface Window {
  start: number;
  count: number;
}

/**
 * Fixed-window, in-process limiter. Good enough for a single-instance demo;
 * multi-instance deployments need a shared store.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const windows = new Map<string, Window>();
  return function allow(key: string, now = Date.now()): boolean {
    const w = windows.get(key);
    if (!w || now - w.start >= windowMs) {
      if (windows.size > 10_000) windows.clear();
      windows.set(key, { start: now, count: 1 });
      return true;
    }
    w.count++;
    return w.count <= limit;
  };
}

/** Client IP as seen by the app; the first X-Forwarded-For hop is set by the reverse proxy. */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
