import { createHash, createHmac } from "node:crypto";

/** Salted HMAC hash of a requester IP — never store or log raw IPs. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/** Normalized exact-match hash for the response cache. */
export function hashQuestion(message: string): string {
  const normalized = message.toLowerCase().trim().replace(/\s+/g, " ").replace(/[!?.]+$/g, "");
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Best-effort client IP extraction, hardened against a client spoofing the
 * rate-limit cap by sending its own X-Forwarded-For header. Prefers
 * x-vercel-forwarded-for (set by Vercel's edge itself — a client's own
 * x-vercel-* headers are stripped before reaching the function, so it can't
 * be forged), then falls back to the *last* entry of X-Forwarded-For (the
 * hop closest to whatever proxy is directly in front of this server, rather
 * than the first entry, which upstream proxies conventionally append to and
 * a client can freely prefix with fake values).
 */
export function getRequestIp(headers: Headers): string {
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return headers.get("x-real-ip") ?? "unknown";
}
