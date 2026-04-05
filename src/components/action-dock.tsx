"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Copy, Link, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWebHaptics } from "web-haptics/react";
import { Icon } from "@/components/icon";
import { LikeButton } from "@/components/ui/like-button";
import { useGlassRipple, GlassRipples } from "@/components/ui/glass-ripple";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import type { Entry } from "@/lib/types";

interface ActionDockProps {
  entry: Entry | null;
  allEntryDates?: string[];
}

// ── Like state helper ────────────────────────────────────────────────────────
function getLikeState(entry: Entry | null, completedDates: Set<string>) {
  if (!entry?.date)
    return { initialCount: 0, defaultLiked: false, completed: false };
  if (typeof window === "undefined") {
    return {
      initialCount: entry.like_count || 0,
      defaultLiked: false,
      completed: false,
    };
  }
  const completedList: string[] = JSON.parse(
    localStorage.getItem("completed_like_entries") || "[]",
  );
  const isCompleted =
    completedDates.has(entry.date) || completedList.includes(entry.date);
  if (isCompleted) {
    return {
      initialCount: (entry.like_count || 0) + 4,
      defaultLiked: true,
      completed: true,
    };
  }
  const likedEntries = JSON.parse(
    localStorage.getItem("liked_entries") || "{}",
  );
  const userLiked = Boolean(likedEntries[entry.date]);
  return {
    initialCount: (entry.like_count || 0) + (userLiked ? 1 : 0),
    defaultLiked: userLiked,
    completed: false,
  };
}

export function ActionDock({ entry, allEntryDates = [] }: ActionDockProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied">("idle");
  const [completedDates, setCompletedDates] = useState<Set<string>>(
    () => new Set(),
  );
  const [apiCount, setApiCount] = useState<number | null>(null);
  const [apiTaps, setApiTaps] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const { state: sidebarState, isMobile, openMobile } = useSidebar();
  const { trigger } = useWebHaptics();
  const { ripples, addRipple } = useGlassRipple();
  const { ripples: prevRipples, addRipple: addPrevRipple } = useGlassRipple();
  const { ripples: nextRipples, addRipple: addNextRipple } = useGlassRipple();
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareTriggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Fetch real like count + this IP's tap count from Redis
  useEffect(() => {
    if (!entry?.date) return;
    queueMicrotask(() => {
      setApiCount(null);
      setApiTaps(0);
    });
    fetch(`/api/like?date=${entry.date}`)
      .then((r) => r.json())
      .then((d) => {
        setApiCount(d.count ?? 0);
        setApiTaps(d.taps ?? 0);
      })
      .catch(() => {});
  }, [entry?.date]);

  // allEntryDates is newest-first; higher index = older
  const currentIdx = entry ? allEntryDates.indexOf(entry.date) : -1;
  const prevDate =
    currentIdx < allEntryDates.length - 1
      ? allEntryDates[currentIdx + 1]
      : null; // older
  const nextDate = currentIdx > 0 ? allEntryDates[currentIdx - 1] : null; // newer

  const localLikeState = entry
    ? getLikeState(entry, completedDates)
    : { initialCount: 0, defaultLiked: false, completed: false };

  // Merge seed count with Redis count; use IP taps for fill level
  const seedCount = entry?.like_count ?? 0;
  const initialCount = seedCount + (apiCount ?? 0);
  const ipCompleted = apiTaps >= 4;
  const likeState = {
    initialCount,
    defaultLiked: localLikeState.defaultLiked || apiTaps > 0,
    completed: localLikeState.completed || ipCompleted,
  };

  const handleLikeChange = (
    liked: boolean,
    _count: number,
    completed?: boolean,
  ) => {
    if (!entry?.date || typeof window === "undefined") return;
    // Post tap to Redis (fire-and-forget)
    fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: entry.date }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") {
          const delta = d.count - seedCount;
          setApiCount(delta > 0 ? delta : 0);
        }
        if (typeof d.taps === "number") {
          setApiTaps(d.taps);
        }
      })
      .catch(() => {});

    if (completed) {
      setCompletedDates((prev) => new Set(prev).add(entry.date));
      const list: string[] = JSON.parse(
        localStorage.getItem("completed_like_entries") || "[]",
      );
      if (!list.includes(entry.date)) list.push(entry.date);
      localStorage.setItem("completed_like_entries", JSON.stringify(list));
    }
    const likedEntries = JSON.parse(
      localStorage.getItem("liked_entries") || "{}",
    );
    if (liked) likedEntries[entry.date] = true;
    else delete likedEntries[entry.date];
    localStorage.setItem("liked_entries", JSON.stringify(likedEntries));
  };

  const copyPageUrl = async (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareFeedback("copied");
      setTimeout(() => setShareFeedback("idle"), 1800);
      setShareOpen(false);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!shareOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !shareMenuRef.current?.contains(target) &&
        !shareTriggerRef.current?.contains(target)
      ) {
        setShareOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShareOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shareOpen]);

  useLayoutEffect(() => {
    if (!shareOpen) return;
    const updatePos = () => {
      const btn = shareTriggerRef.current;
      const menu = shareMenuRef.current;
      if (!btn || !menu) return;
      const rect = btn.getBoundingClientRect();
      // Anchor menu bottom edge just above the trigger (stable when rows mount later).
      // Apply via DOM — avoid setState here: the RAF loop + ResizeObserver would
      // re-render the whole dock every frame and jitter the Share label / motion nodes.
      menu.style.right = `${window.innerWidth - rect.right + 5}px`;
      menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    };
    updatePos();

    // Sidebar / dock animates ~300ms — re-sample so the menu tracks the moving trigger.
    let frame = 0;
    let rafId = 0;
    let cancelled = false;
    const maxFrames = 26;
    const tick = () => {
      if (cancelled) return;
      updatePos();
      frame++;
      if (frame < maxFrames) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            queueMicrotask(updatePos);
          })
        : null;
    if (ro && shareTriggerRef.current) {
      ro.observe(shareTriggerRef.current);
    }
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [shareOpen, sidebarState, isMobile, openMobile]);

  if (!entry) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://btw.invalid/${entry.date}`;
  const shareText = `${entry.title || "Worth keeping"} via btw`;

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 z-[75] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-2 transition-[opacity,transform,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:max-w-none",
        sidebarState === "expanded" &&
          "md:[margin-left:calc(var(--sidebar-width)/2)]",
        isMobile &&
          openMobile &&
          "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      {/* Prev (older) */}
      <button
        onClick={(event) => {
          addPrevRipple(event);
          if (prevDate) router.push(`/${prevDate}`);
        }}
        disabled={!prevDate}
        className="glass-dock relative size-9 overflow-hidden rounded-full flex items-center justify-center text-foreground/55 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        aria-label="Previous entry"
      >
        <GlassRipples ripples={prevRipples} />
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      <div
        className={cn(
          "glass-dock flex items-center p-0.5 gap-0 rounded-[16px] transition-all duration-200",
          // Share menu is portaled to body; moving the pointer to it drops :hover here and
          // the dock would scale back to 1 — lock hover scale while the menu is open.
          shareOpen && "",
        )}
      >
        {/* Like */}
        <LikeButton
          date={entry.date}
          initialCount={likeState.initialCount}
          defaultLiked={likeState.defaultLiked}
          completed={likeState.completed}
          onLikeChange={handleLikeChange}
          className="dock-inline-action"
        />

        {/* Partition */}
        <div className="w-px h-5 bg-foreground/12 mx-px shrink-0" />

        <div className="relative">
          <button
            ref={shareTriggerRef}
            onClick={(event) => {
              addRipple(event);
              trigger([{ duration: 15 }], { intensity: 0.4 });
              setShareOpen((open) => !open);
            }}
            className="dock-inline-action relative flex items-center gap-1.5 overflow-hidden rounded-[12px] px-2.5 py-2 text-foreground transition-colors duration-200 cursor-pointer hover:bg-foreground/[0.05] dark:hover:bg-foreground/[0.07]"
            data-open={shareOpen ? "true" : "false"}
            aria-label="Share page"
            aria-haspopup="menu"
            aria-expanded={shareOpen}
          >
            <GlassRipples ripples={ripples} />
            <div className="relative size-5 flex items-center justify-center shrink-0">
              <span className="absolute inset-0 flex items-center justify-center">
                {shareFeedback === "copied" ? (
                  <Icon name="check" size="base" />
                ) : (
                  <Share2 size={15} className="text-foreground/65" />
                )}
              </span>
            </div>
            <span className="font-mono text-[12px] text-foreground/80 min-w-[2.4rem]">
              <span className="block">
                {shareFeedback === "copied" ? "Copied" : "Share"}
              </span>
            </span>
          </button>

          {/* Share dropdown — portalled to body so backdrop-filter blurs page content */}
          {mounted &&
            createPortal(
              <AnimatePresence>
                {shareOpen && (
                  <div
                    ref={shareMenuRef}
                    className="glass-dock dropdown-panel fixed z-[90] w-[140px] rounded-[16px] px-1.5 pt-1.5 pb-1"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                      className="share-dropdown"
                    >
                      <button
                        type="button"
                        onClick={(event) => void copyPageUrl(event)}
                        className="share-dropdown-row"
                      >
                        <Copy size={13} />
                        <span>Copy link</span>
                      </button>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-dropdown-row"
                        onClick={() => setShareOpen(false)}
                      >
                        <Icon name="brand-x" size="sm" />
                        <span>Post on X</span>
                      </a>
                      {typeof navigator !== "undefined" &&
                        "share" in navigator && (
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.share({
                                title: entry.title || "btw",
                                text: shareText,
                                url: shareUrl,
                              });
                              setShareOpen(false);
                            }}
                            className="share-dropdown-row"
                          >
                            <Link size={13} />
                            <span>More options</span>
                          </button>
                        )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
      </div>

      {/* Next (newer) */}
      <button
        onClick={(event) => {
          addNextRipple(event);
          if (nextDate) router.push(`/${nextDate}`);
        }}
        disabled={!nextDate}
        className="glass-dock relative size-9 overflow-hidden rounded-full flex items-center justify-center text-foreground/55 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        aria-label="Next entry"
      >
        <GlassRipples ripples={nextRipples} />
        <ChevronRight size={16} strokeWidth={2} />
      </button>

      {/* Backdrop — keeps portal so it sits behind the dock (z-70 < z-75) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {shareOpen && (
              <motion.button
                type="button"
                aria-label="Close share menu"
                className="share-menu-backdrop fixed inset-0 z-[70]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setShareOpen(false)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
