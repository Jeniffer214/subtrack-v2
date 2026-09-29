import { createHash, timingSafeEqual } from "node:crypto";

function digest(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

/**
 * Checks an HTTP Basic `Authorization` header against the demo password.
 * Any username is accepted; only the password is compared (in constant time).
 */
export function isAuthorized(header: string | null, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  return timingSafeEqual(digest(decoded.slice(sep + 1)), digest(password));
}
