"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, Github, Star } from "lucide-react";
import { MediaRenderer } from "@/components/media-renderer";
import { ContentParser } from "@/components/content-parser";
import { ActionDock } from "@/components/action-dock";
import {
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { GlassRipples, useGlassRipple } from "@/components/ui/glass-ripple";
import { getTopicColor } from "@/lib/topics";
import type { Entry, EntryMetadata } from "@/lib/types";
import { BearSvg } from "@/components/bear-svg";
import { socialLinks } from "@content/sidebar/profile";

export type EmptyEntry = {
  date: string;
  isEmpty: true;
};

interface EntryViewProps {
  entry: Entry | EmptyEntry | null;
  isMobile?: boolean;
  initialMetadata?: EntryMetadata | null;
  isLoading?: boolean;
  allEntryDates?: string[];
  isNavigating?: boolean;
  navigatingMessage?: string;
  onRandomClick?: () => void;
}

const GITHUB_LINK = socialLinks.github.href;

function formatEntryDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DesktopUtilityRail() {
  const { state: sidebarState } = useSidebar();
  const { ripples, addRipple } = useGlassRipple();
  const { ripples: githubRipples, addRipple: addGithubRipple } =
    useGlassRipple();
  const expanded = sidebarState === "expanded";

  const rightPos = "18px";

  return (
    <>
      {!expanded && (
        <div className="fixed left-[18px] top-3 pt-4 z-40">
          <SidebarTrigger
            className="glass-btn size-8 rounded-lg"
            aria-label="Toggle sidebar"
          />
        </div>
      )}

      <div
        className="fixed top-3 pt-4 z-40 flex items-center gap-3"
        style={{ right: rightPos }}
      >
        <span className="relative inline-flex">
          <a
            href={GITHUB_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={addGithubRipple}
            className="glass-btn glass-btn-static relative flex size-8 items-center justify-center overflow-hidden rounded-lg text-black dark:text-white"
            aria-label="Open GitHub profile — star the repo!"
            title="Star on GitHub"
          >
            <GlassRipples ripples={githubRipples} />
            <Github size={14} className="relative z-[1]" />
          </a>
          <span className="pointer-events-none absolute right-0 top-1 z-[3] translate-x-[35%] -translate-y-[20%]">
            <Star
              size={11}
              className="animate-bounce text-yellow-400 dark:text-yellow-500"
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        </span>
        <div className="relative overflow-hidden rounded-lg">
          <GlassRipples ripples={ripples} />
          <AnimatedThemeToggle
            className="glass-btn glass-btn-static size-8 rounded-lg"
            onClick={addRipple}
          />
        </div>
      </div>
    </>
  );
}

/** CSS-gated so desktop chrome never paints on small viewports during the first client frame (isMobile starts false). */
function DesktopRailSlot() {
  return (
    <div className="hidden md:block">
      <DesktopUtilityRail />
    </div>
  );
}

export function EntryView({
  entry,
  isMobile = false,
  initialMetadata = null,
  isLoading = false,
  allEntryDates = [],
  isNavigating = false,
  navigatingMessage = "",
  onRandomClick = () => undefined,
}: EntryViewProps) {
  const [metadata, setMetadata] = useState<EntryMetadata | null>(
    initialMetadata,
  );
  const [loadingMetadata, setLoadingMetadata] = useState(
    !initialMetadata &&
      !!entry &&
      "media_type" in entry &&
      ["link", "twitter-article", "tweet", "article"].includes(
        entry.media_type,
      ),
  );
  const { state: sidebarState } = useSidebar();

  const articleScrollRef = useRef<HTMLDivElement>(null);

  const contentEntry: Entry | null =
    !isLoading && entry && !("isEmpty" in entry) ? (entry as Entry) : null;

  const entryDescription = useMemo(() => {
    if (!contentEntry) return null;
    return contentEntry.description?.trim() || null;
  }, [contentEntry]);

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-full flex-col bg-background pt-12 md:h-full md:min-h-0 md:pt-0">
        <DesktopRailSlot />
        <div className="w-full max-w-[980px] self-center px-6 pb-32 pt-6 md:px-10 md:pt-24">
          <div className="mx-auto max-w-[760px]">
            <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
            <div className="mt-4 h-16 w-4/5 rounded-[20px] bg-muted animate-pulse" />
            <div className="mt-8 aspect-[16/9] w-full rounded-[28px] bg-muted animate-pulse" />
            <div className="mt-10 space-y-3">
              <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-[86%] rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-[68%] rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex-1 h-full flex flex-col bg-background pt-12 md:pt-0">
        <DesktopRailSlot />
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="font-mono text-[13px] text-muted-foreground uppercase tracking-premium">
            Select a date to open the archive
          </p>
        </div>
      </div>
    );
  }

  if ("isEmpty" in entry && entry.isEmpty) {
    return (
      <div className="flex flex-1 min-h-full flex-col bg-background pt-12 md:h-full md:min-h-0 md:py-0 md:pt-0">
        <DesktopRailSlot />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="text-center w-full px-4 sm:px-6 entry-reveal flex flex-col items-center"
            style={{ "--delay": "0ms" } as React.CSSProperties}
          >
            <BearSvg className="shrink-0 w-28 h-28 text-foreground/75 dark:text-white/85 mb-5" />
            <p className="font-sans text-[15px] sm:text-[16px] text-muted-foreground/70 mb-8 max-w-[min(100%,15rem)] sm:max-w-sm leading-relaxed">
              Sorry, I still haven&apos;t written anything yet or don&apos;t
              feel like writing today
            </p>
            {allEntryDates.length > 0 && (
              <button
                onClick={onRandomClick}
                disabled={isNavigating}
                className="glass-btn mx-auto px-4 py-2 rounded-xl font-mono text-[11px] font-medium uppercase tracking-[1.2px] text-foreground/60 hover:text-foreground transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {!isNavigating && <Dices size={14} />}
                {isNavigating ? navigatingMessage : "Take you to random post"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentEntry = entry as Entry;
  const overlayColor = getTopicColor(currentEntry.icon_name) || "#737373";

  const tagLabels =
    currentEntry.tags
      ?.split(/[|,]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12) ?? [];
  const entryDateLabel = formatEntryDate(currentEntry.date);
  const desktopWidthClass =
    !isMobile && sidebarState === "expanded"
      ? "md:max-w-[780px]"
      : "md:max-w-[920px]";

  return (
    <div className="relative flex-1 min-h-full bg-background md:h-full md:min-h-0 md:overflow-hidden">
      <div
        style={{
          background: `radial-gradient(circle at 18% 0%, ${overlayColor}18 0%, transparent 42%), radial-gradient(circle at 85% 8%, ${overlayColor}10 0%, transparent 28%)`,
        }}
        className="absolute inset-0 pointer-events-none transition-[background] duration-700 ease-in-out"
      />

      <div
        style={{
          background: `linear-gradient(to bottom, ${overlayColor}14, transparent 42%)`,
        }}
        className="absolute inset-x-0 top-0 h-[800px] md:h-[420px] pointer-events-none transition-[background] duration-700 ease-in-out"
      />

      <DesktopRailSlot />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentEntry.date}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          ref={articleScrollRef}
          id="entry-scroll-region"
          className="relative z-10 flex w-full flex-col items-center md:h-full md:overflow-y-auto"
        >
          <div
            className={`w-full max-w-[980px] px-6 pb-36 pt-16 md:px-10 md:pt-24 md:transition-[max-width] md:duration-300 ${desktopWidthClass}`}
          >
            <div className="mx-auto max-w-[920px]">
              <div className="border-b border-border/70 pb-10 text-center md:pb-12">
                <h1 className="mx-auto max-w-[880px] text-balance font-serif text-[36px] leading-[0.92] text-foreground md:text-[72px]">
                  {currentEntry.title || "No Title Provided"}
                </h1>

                <div className="mx-auto mt-6 max-w-[760px]">
                  {entryDescription && (
                    <p className="mx-auto max-w-[680px] text-pretty text-[15px] leading-7 text-muted-foreground/82 md:text-[17px] md:leading-8">
                      {entryDescription}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-center">
                    <span className="entry-keyword-pill">{entryDateLabel}</span>
                  </div>
                  {tagLabels.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {tagLabels.map((g) => (
                        <span key={g} className="entry-keyword-pill">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {currentEntry.media_url && (
                <div className="mt-10 md:mt-14">
                  <MediaRenderer
                    entry={currentEntry}
                    metadata={metadata}
                    isLoadingMetadata={loadingMetadata}
                  />
                </div>
              )}

              <div className="mt-12 md:mt-16 mx-auto max-w-[700px]">
                <div
                  className="font-sans leading-[1.82] text-foreground/94"
                  style={{ fontSize: "var(--reading-font-size, 16px)" }}
                >
                  <ContentParser content={currentEntry.content || ""} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <ActionDock entry={currentEntry} allEntryDates={allEntryDates} />
    </div>
  );
}
