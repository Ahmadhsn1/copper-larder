"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 6_000;

/**
 * Keeps the (Server Component) dashboard data fresh while the tab stays
 * open, without a full page reload: re-runs the server render on a fixed
 * interval and whenever the tab regains focus. Renders nothing itself —
 * mount it near the top of the page and pass the rest of the page as
 * children.
 */
export default function LiveRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  return <>{children}</>;
}
