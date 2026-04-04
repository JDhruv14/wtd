"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { GlassRipples, useGlassRipple } from "@/components/ui/glass-ripple";
import { pinAboutHashBeforeReload } from "@/lib/sidebar-view";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "HI", name: "Hindi" },
  { code: "es", label: "ES", name: "Spanish" },
  { code: "fr", label: "FR", name: "French" },
  { code: "ja", label: "JA", name: "Japanese" },
] as const;

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]["code"];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
  }
}

const STORAGE_KEY = "btw-language";
/** Dispatched when the user picks a language (Google Translate may reload the page). */
export const BTW_LANGUAGE_CHANGE_EVENT = "btw-language-change";

function hideTranslateArtifacts() {
  const selectors = [
    ".goog-te-banner-frame.skiptranslate",
    "iframe.goog-te-banner-frame",
    ".goog-te-balloon-frame",
    ".goog-te-spinner-pos",
    ".goog-tooltip",
    "#goog-gt-tt",
    ".VIpgJd-ZVi9od-ORHb",
    "body > .skiptranslate",
    "body > iframe.skiptranslate",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("opacity", "0", "important");
      node.style.setProperty("pointer-events", "none", "important");
    });
  });

  document.body.style.setProperty("top", "0px", "important");
  document.body.style.setProperty("position", "static", "important");
}

function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (LANGUAGE_OPTIONS.some((option) => option.code === saved)) {
    return saved as LanguageCode;
  }
  return "en";
}

function setGoogleTranslateCookie(language: LanguageCode) {
  const value = `/auto/${language}`;
  const baseCookie = `googtrans=${value}; path=/; SameSite=Lax`;
  document.cookie = baseCookie;
  document.cookie = `${baseCookie}; domain=${window.location.hostname}`;
}

function applyLanguage(language: LanguageCode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, language);
  setGoogleTranslateCookie(language);
  window.dispatchEvent(
    new CustomEvent(BTW_LANGUAGE_CHANGE_EVENT, { detail: language }),
  );
  pinAboutHashBeforeReload();
  window.location.reload();
}

export function PageTranslator() {
  useEffect(() => {
    document.documentElement.lang = readStoredLanguage();
    hideTranslateArtifacts();

    const observer = new MutationObserver(() => hideTranslateArtifacts());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    if (document.getElementById("google-translate-script")) {
      return () => observer.disconnect();
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: LANGUAGE_OPTIONS.map((option) => option.code).join(
            ",",
          ),
          layout: 0,
        },
        "google_translate_element",
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.googleTranslateElementInit = undefined;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      className="page-translate-root"
      aria-hidden="true"
    />
  );
}

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

function LanguageMenu({
  menuRef,
  language,
  setLanguage,
  setOpen,
  className,
  style,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  language: LanguageCode;
  setLanguage: (value: LanguageCode) => void;
  setOpen: (value: boolean) => void;
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      ref={menuRef}
      className={className}
      style={style}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="filter-dropdown">
        <div className="filter-dropdown-list">
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option.code === language;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setLanguage(option.code);
                  setOpen(false);
                }}
                className={cn("filter-dropdown-row", selected && "is-selected")}
              >
                <div className="filter-dropdown-row-main">
                  <span className="filter-dropdown-topic-icon">
                    <span className="font-mono text-[7.8px] leading-none tracking-[1px] text-black dark:text-white">
                      {option.label}
                    </span>
                  </span>
                  <span className="filter-dropdown-label truncate !text-black dark:!text-white">
                    {option.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "filter-dropdown-check text-black dark:text-white",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Check size={11} aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function LanguageToggle({
  className,
  compact = false,
}: LanguageToggleProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { ripples, addRipple } = useGlassRipple();

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setLanguageState(readStoredLanguage());
    });

    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<LanguageCode>).detail;
      if (next) setLanguageState(next);
    };

    window.addEventListener(BTW_LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () =>
      window.removeEventListener(
        BTW_LANGUAGE_CHANGE_EVENT,
        handleLanguageChange,
      );
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !rootRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || compact) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const MENU_WIDTH = 156;
      const left = Math.max(
        8,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8),
      );
      setMenuPosition({ left, top: rect.bottom + 8 });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, compact]);

  const activeOption = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((option) => option.code === language) ??
      LANGUAGE_OPTIONS[0],
    [language],
  );

  const setLanguage = (value: LanguageCode) => {
    setLanguageState(value);
    applyLanguage(value);
  };

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          addRipple(event);
          setOpen((current) => !current);
        }}
        className="glass-btn relative flex h-8 items-center gap-1.5 overflow-hidden rounded-lg px-2.5 text-black dark:text-white [&_svg]:text-current"
        aria-label="Choose language"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <GlassRipples ripples={ripples} />
        <Languages
          size={compact ? 12 : 13}
          className="relative z-[1] shrink-0"
        />
        <span className="relative z-[1] font-mono text-[9px] uppercase tracking-[1.2px] text-inherit">
          {activeOption.label}
        </span>
      </button>

      {open && compact && (
        <LanguageMenu
          menuRef={menuRef}
          language={language}
          setLanguage={setLanguage}
          setOpen={setOpen}
          className="glass-dock dropdown-panel absolute right-0 top-full z-[95] mt-2 w-[156px] rounded-[16px] p-1.5"
        />
      )}

      {open &&
        !compact &&
        mounted &&
        createPortal(
          <LanguageMenu
            menuRef={menuRef}
            language={language}
            setLanguage={setLanguage}
            setOpen={setOpen}
            className="glass-dock dropdown-panel fixed z-[85] w-[156px] rounded-[16px] p-1.5"
            style={{ left: menuPosition.left, top: menuPosition.top }}
          />,
          document.body,
        )}
    </div>
  );
}
