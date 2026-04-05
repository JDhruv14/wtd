"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sileo";

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
  const isDark = useSyncExternalStore(
    subscribeDarkClass,
    getDarkModeSnapshot,
    getServerDarkSnapshot,
  );

  return (
    <Toaster
      position="top-center"
      theme="system"
      offset={{ top: 20 }}
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
