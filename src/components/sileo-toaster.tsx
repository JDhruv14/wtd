"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { Toaster } from "sileo";

/** Below `DesktopUtilityRail` in entry-view (top-3 + pt-4 + h-8 ≈ 60px) + small gap */
const DESKTOP_TOAST_TOP_PX = 72;

function subscribeDarkClass(cb: () => void) {
  const el = document.documentElement;
  const mo = new MutationObserver(cb);
  mo.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

function getDarkModeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerDarkSnapshot() {
  return false;
}

export function SileoToaster() {
  /** Matches globals `@media (max-width: 767px)`. Deferred until mount so SSR/first paint stay `top-right` and avoid hydration mismatch. */
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const isDark = useSyncExternalStore(
    subscribeDarkClass,
    getDarkModeSnapshot,
    getServerDarkSnapshot,
  );

  return (
    <Toaster
      position={isMobile ? "top-center" : "top-right"}
      theme="system"
      offset={isMobile ? undefined : { top: DESKTOP_TOAST_TOP_PX }}
      options={
        isDark
          ? undefined
          : {
              fill: "#171717",
              styles: {
                title: "!text-white",
                description: "!text-white/75",
                badge: "!bg-white/10",
                button: "!bg-white/10 hover:!bg-white/15",
              },
            }
      }
    />
  );
}
