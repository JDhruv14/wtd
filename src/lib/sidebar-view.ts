/** Persists sidebar view across reloads. Must match RootShell. */
export const SIDEBAR_VIEW_STORAGE_KEY = "btw-sidebar-active-view";

export const ABOUT_PANEL_HASH = "#about";

/** Call before location.reload() so the URL still carries #about after refresh. */
export function pinAboutHashBeforeReload(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SIDEBAR_VIEW_STORAGE_KEY) !== "about") return;
    const { pathname, search, hash } = window.location;
    if (hash !== ABOUT_PANEL_HASH) {
      history.replaceState(null, "", `${pathname}${search}${ABOUT_PANEL_HASH}`);
    }
  } catch {
    /* ignore */
  }
}
