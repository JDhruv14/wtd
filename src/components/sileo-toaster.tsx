"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sileo";

const MOBILE_MQ = "(max-width: 767px)";

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

function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia(MOBILE_MQ);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getServerMobileSnapshot() {
  return false;
}

export function SileoToaster() {
  const isDark = useSyncExternalStore(
    subscribeDarkClass,
    getDarkModeSnapshot,
    getServerDarkSnapshot,
  );
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );

  return (
    <Toaster
      position={isMobile ? "top-center" : "top-right"}
      theme="system"
      offset={{
        top: isMobile ? 20 : DESKTOP_TOAST_TOP_PX,
      }}
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
