import * as React from "react";

/** Matches Tailwind `md:` (min-width: 768px) — single source of truth for layout + sidebar. */
const MOBILE_MAX_PX = 767;
const QUERY = `(max-width: ${MOBILE_MAX_PX}px)`;

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** SSR / first server pass: assume desktop so shell matches wide layouts (avoids “no sidebar” on Mac Chrome when hydration was one frame behind). */
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
