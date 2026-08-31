import { NextRequest, NextResponse } from "next/server";

// Gates the owner dashboard (/dashboard) behind HTTP Basic Auth.
//
// Active whenever DASHBOARD_PASSWORD is set. If it is unset the route is
// left open and a warning is logged once per cold start — convenient for
// local development, never the intended production posture. Set both
// DASHBOARD_USER (defaults to "owner") and DASHBOARD_PASSWORD in the
// deployment environment.

export const config = { matcher: ["/dashboard/:path*"] };

let warnedMissingPassword = false;

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Copper Larder — Operations", charset="UTF-8"' },
  });
}

// Constant-time-ish string compare — avoids leaking length/prefix via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function middleware(req: NextRequest) {
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  if (!expectedPassword) {
    if (!warnedMissingPassword) {
      console.warn("[middleware] DASHBOARD_PASSWORD is not set — /dashboard is publicly reachable.");
      warnedMissingPassword = true;
    }
    return NextResponse.next();
  }

  const expectedUser = process.env.DASHBOARD_USER || "owner";
  const header = req.headers.get("authorization");

  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) return unauthorized();

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  if (!safeEqual(user, expectedUser) || !safeEqual(password, expectedPassword)) {
    return unauthorized();
  }

  return NextResponse.next();
}
