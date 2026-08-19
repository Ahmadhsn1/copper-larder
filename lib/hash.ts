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

export function getRequestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
