"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import { AboutPanel } from "@/components/about-panel";
import { CalendarMonth } from "@/components/calendar-month";
import { Icon } from "@/components/icon";
import { SiteLogo } from "@/components/site-logo";
import { GlassRipples, useGlassRipple } from "@/components/ui/glass-ripple";
import { LanguageToggle } from "@/components/ui/page-language";
import type { DayData, Entry, MonthData } from "@/lib/types";
import { CANONICAL_GENRES, getTopicColor, getTopicKeyFromEntry, getTopicKeysFromEntry, TOPICS } from "@/lib/topics";
import { cn } from "@/lib/utils";
import { socialLinks } from "@/../content/sidebar/profile";

const Penflow = dynamic(() => import("penflow/react").then((m) => m.Penflow), {
  ssr: false,
});

function formatShortDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function matchesTopicFilter(
  genre: string | null | undefined,
  iconName: string | null | undefined,
  selectedTopics: string[],
) {
  if (selectedTopics.length === 0) return true;
  const topicKeys = getTopicKeysFromEntry(genre, iconName);
  return topicKeys.some((key) => selectedTopics.includes(key));
}

interface AppSidebarProps {
  monthsData: MonthData[];
  selectedDate: string | null;
  onDayClick: (day: DayData) => void;
  onAboutClick: () => void;
  onSubscribeClick: () => void;
  activeView: "day" | "about";
  totalEntries?: number;
  recentEntries?: Pick<Entry, "date" | "title" | "primary_color" | "icon_name" | "genre">[];
}

export function AppSidebar({
  monthsData = [],
  selectedDate,
  onDayClick,
  onAboutClick,
  onSubscribeClick,
  activeView = "day",
  totalEntries = 0,
  recentEntries = [],
}: AppSidebarProps) {
  const { isMobile, setOpenMobile, state, openMobile } = useSidebar();
  const { trigger } = useWebHaptics();
  const [optimisticDate, setOptimisticDate] = useState<string | null>(null);
  const [aboutAtBottom, setAboutAtBottom] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicMenuOpen, setTopicMenuOpen] = useState(false);
  const [filterMenuPos, setFilterMenuPos] = useState({ left: 0, top: 0 });
  const [mounted, setMounted] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [monthIndex, setMonthIndex] = useState(() => {
    if (selectedDate && monthsData.length) {
      const idx = monthsData.findIndex((month) =>
        month.days.some((day) => day.date === selectedDate),
      );
      if (idx !== -1) return idx;
    }
    return 0;
  });
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const monthIndexRef = useRef(monthIndex);
  monthIndexRef.current = monthIndex;
  const { ripples: aboutRipples, addRipple: addAboutRipple } = useGlassRipple();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains("dark")));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const isOpen = isMobile ? openMobile : state === "expanded";
  const [penflowAnimate, setPenflowAnimate] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    if (sessionStorage.getItem("btw_penflow_played")) return;
    sessionStorage.setItem("btw_penflow_played", "1");
    setPenflowAnimate(true);
  }, [isOpen]);

  useLayoutEffect(() => {
    const offset = !isMobile && state === "expanded" ? "160px" : "0px";
    document.documentElement.style.setProperty("--toast-center-offset", offset);
  }, [isMobile, state]);

  useEffect(() => {
    setOptimisticDate(null);
  }, [selectedDate]);

  useEffect(() => {
    if (activeView === "about" && aboutRef.current) {
      aboutRef.current.scrollTop = 0;
    }
  }, [activeView]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!topicMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !filterTriggerRef.current?.contains(target) &&
        !filterMenuRef.current?.contains(target)
      ) {
        setTopicMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [topicMenuOpen]);

  useLayoutEffect(() => {
    if (!topicMenuOpen) return;

    const updatePos = () => {
      const btn = filterTriggerRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const MENU_WIDTH = 188;
      const left = 146;
      setFilterMenuPos({ left, top: rect.bottom + 8 });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [topicMenuOpen]);

  useEffect(() => {
    if (!selectedDate || !monthsData.length) return;
    const targetIdx = monthsData.findIndex((month) =>
      month.days.some((day) => day.date === selectedDate),
    );
    if (targetIdx === -1 || targetIdx === monthIndexRef.current) return;
    setSlideDir(targetIdx < monthIndexRef.current ? 1 : -1);
    setMonthIndex(targetIdx);
  }, [selectedDate, monthsData]);

  const activeDate = optimisticDate || selectedDate;

  // When exactly one topic is selected, propagate its color to calendar highlights
  const activeFilterColor = selectedTopics.length === 1
    ? (getTopicColor(selectedTopics[0]) ?? null)
    : null;

  const availableTopics = useMemo(() => {
    const counts = new Map<string, number>();

    recentEntries.forEach((entry) => {
      getTopicKeysFromEntry(entry.genre, entry.icon_name).forEach((key) => {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });

    return CANONICAL_GENRES.map((topic) => ({
      id: topic.icon,
      count: counts.get(topic.icon) ?? 0,
      label: topic.label,
      color: topic.color,
    }));
  }, [recentEntries]);

  const filteredRecentEntries = useMemo(
    () => recentEntries.filter((entry) => matchesTopicFilter(entry.genre, entry.icon_name, selectedTopics)),
    [recentEntries, selectedTopics],
  );

  const filteredMonthsData = useMemo(
    () =>
      monthsData.map((month) => ({
        ...month,
        days: month.days.map((day) => {
          if (!day.hasContent) return day;
          if (selectedTopics.length === 0) return day;
          return {
            ...day,
            hasContent: matchesTopicFilter(day.genre, day.iconName, selectedTopics),
          };
        }),
      })),
    [monthsData, selectedTopics],
  );

  const currentMonth = filteredMonthsData[monthIndex];
  const canGoPrev = monthIndex < filteredMonthsData.length - 1;
  const canGoNext = monthIndex > 0;
  const todayMonthIdx = filteredMonthsData.findIndex((month) =>
    month.days.some((day) => day.isToday),
  );
  const entriesThisMonth = currentMonth?.days.filter((day) => day.hasContent).length ?? 0;
  const selectedTopicCount = selectedTopics.length;

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((current) =>
      current.includes(topicId)
        ? current.filter((item) => item !== topicId)
        : [...current, topicId],
    );
  };

  const handleDayClick = (day: DayData) => {
    if (day.hasContent) setOptimisticDate(day.date);
    onDayClick(day);
    if (isMobile) setOpenMobile(false);
  };

  const goToPrev = () => {
    setSlideDir(-1);
    setMonthIndex((index) => index + 1);
  };

  const goToNext = () => {
    setSlideDir(1);
    setMonthIndex((index) => index - 1);
  };

  const jumpToToday = () => {
    if (todayMonthIdx === -1) return;
    setSlideDir(todayMonthIdx < monthIndex ? 1 : -1);
    setMonthIndex(todayMonthIdx);
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="w-[320px] md:w-[320px] rounded-none"
    >
      <SidebarHeader className="rounded-none border-b border-white/10 px-4 pb-4 pt-6 dark:border-white/[0.07]">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SiteLogo size="md" className="pointer-events-none -ml-1 opacity-92" />
            </div>

            {(isMobile || state === "expanded") && (
              <div className="flex items-center gap-2 pt-0.5">
                <LanguageToggle compact={isMobile} />
                <SidebarTrigger
                  className="glass-btn size-8 rounded-lg text-foreground/55 hover:text-foreground transition-all duration-200"
                  aria-label="Close sidebar"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
            {activeView === "day" ? (
              <>
                <button
                  onClick={(event) => {
                    addAboutRipple(event);
                    trigger([{ duration: 15 }], { intensity: 0.4 });
                    onAboutClick();
                  }}
                  className="glass-btn relative h-8 overflow-hidden rounded-lg px-2.5 font-mono text-[10px] font-medium tracking-[1.2px] text-foreground/50 transition-colors duration-150 hover:text-foreground"
                  aria-label="Show about view"
                >
                  <GlassRipples ripples={aboutRipples} />
                  About
                </button>
                <div className="relative ml-auto">
                  <button
                    ref={filterTriggerRef}
                    onClick={() => setTopicMenuOpen((open) => !open)}
                    className={cn(
                      "glass-btn flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-mono text-[10px] font-medium tracking-[1.2px] transition-colors duration-150",
                      topicMenuOpen || selectedTopics.length > 0
                        ? "text-foreground"
                        : "text-foreground/50 hover:text-foreground",
                    )}
                    style={activeFilterColor ? {
                      boxShadow: `0 0 0 1px ${activeFilterColor}38, 0 0 8px ${activeFilterColor}18`,
                    } : undefined}
                    aria-haspopup="dialog"
                    aria-expanded={topicMenuOpen}
                    aria-label="Choose topics"
                  >
                    <Filter
                      size={10}
                      className={cn(
                        "shrink-0",
                        topicMenuOpen || selectedTopics.length > 0
                          ? "text-foreground"
                          : "text-foreground/50",
                      )}
                      aria-hidden="true"
                    />
                    <span>Filter</span>
                    {selectedTopicCount > 0 && (
                      <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-foreground/10 bg-foreground/[0.045] px-1.5 py-0.5 text-[8px] tracking-[1px] text-foreground/60">
                        {selectedTopicCount}
                      </span>
                    )}
                    <ChevronDown
                      size={11}
                      className={cn(
                        "shrink-0 transition-transform duration-150",
                        topicMenuOpen || selectedTopics.length > 0
                          ? "text-foreground"
                          : "text-foreground/50",
                        topicMenuOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {topicMenuOpen && isMobile && (
                      <motion.div
                        ref={filterMenuRef}
                        className="glass-dock dropdown-panel absolute right-0 top-full z-[95] mt-2 w-[156px] rounded-[16px] p-1.5"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-toolbar">
                            {selectedTopics.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedTopics([]);
                                  setTopicMenuOpen(false);
                                }}
                                className="filter-dropdown-clear"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTopics([]);
                              setTopicMenuOpen(false);
                            }}
                            className={cn("filter-dropdown-row", selectedTopics.length === 0 && "is-selected")}
                          >
                            <div className="filter-dropdown-row-main">
                              <span className="filter-dropdown-all-icon"><Filter size={10} aria-hidden="true" /></span>
                              <span className="filter-dropdown-label">All Topics</span>
                            </div>
                            <span className={cn("filter-dropdown-check", selectedTopics.length === 0 ? "opacity-100" : "opacity-0")}>
                              <Check size={11} aria-hidden="true" />
                            </span>
                          </button>
                          <div className="filter-dropdown-list">
                            {availableTopics.map((topic) => {
                              const selected = selectedTopics.includes(topic.id);
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => toggleTopic(topic.id)}
                                  className={cn("filter-dropdown-row", selected && "is-selected")}
                                  style={selected ? {
                                    background: `${topic.color}18`,
                                    borderColor: `${topic.color}40`,
                                  } : undefined}
                                >
                                  <div className="filter-dropdown-row-main">
                                    <span className="filter-dropdown-topic-icon">
                                      <Icon name={topic.id} size="sm" color={topic.color} className="shrink-0" />
                                    </span>
                                    <span className="filter-dropdown-label truncate">{topic.label}</span>
                                  </div>
                                  <div className="filter-dropdown-trailing">
                                    <span className="filter-dropdown-count">{topic.count}</span>
                                    <span className={cn("filter-dropdown-check", selected ? "opacity-100" : "opacity-0")}>
                                      <Check size={11} aria-hidden="true" />
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isMobile && mounted && createPortal(
                  <AnimatePresence>
                    {topicMenuOpen && (
                      <div
                        ref={filterMenuRef}
                        className="glass-dock dropdown-panel fixed z-[85] w-[156px] rounded-[16px] p-1.5"
                        style={{ left: filterMenuPos.left, top: filterMenuPos.top }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                          className="filter-dropdown"
                        >
                          <div className="filter-dropdown-toolbar">
                            {selectedTopics.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedTopics([]);
                                  setTopicMenuOpen(false);
                                }}
                                className="filter-dropdown-clear"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTopics([]);
                              setTopicMenuOpen(false);
                            }}
                            className={cn("filter-dropdown-row", selectedTopics.length === 0 && "is-selected")}
                          >
                            <div className="filter-dropdown-row-main">
                              <span className="filter-dropdown-all-icon"><Filter size={10} aria-hidden="true" /></span>
                              <span className="filter-dropdown-label">All Topics</span>
                            </div>
                            <span className={cn("filter-dropdown-check", selectedTopics.length === 0 ? "opacity-100" : "opacity-0")}>
                              <Check size={11} aria-hidden="true" />
                            </span>
                          </button>
                          <div className="filter-dropdown-list">
                            {availableTopics.map((topic) => {
                              const selected = selectedTopics.includes(topic.id);
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => toggleTopic(topic.id)}
                                  className={cn("filter-dropdown-row", selected && "is-selected")}
                                  style={selected ? {
                                    background: `${topic.color}18`,
                                    borderColor: `${topic.color}40`,
                                  } : undefined}
                                >
                                  <div className="filter-dropdown-row-main">
                                    <span className="filter-dropdown-topic-icon">
                                      <Icon name={topic.id} size="sm" color={topic.color} className="shrink-0" />
                                    </span>
                                    <span className="filter-dropdown-label truncate">{topic.label}</span>
                                  </div>
                                  <div className="filter-dropdown-trailing">
                                    <span className="filter-dropdown-count">{topic.count}</span>
                                    <span className={cn("filter-dropdown-check", selected ? "opacity-100" : "opacity-0")}>
                                      <Check size={11} aria-hidden="true" />
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>,
                  document.body,
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    trigger([{ duration: 15 }], { intensity: 0.4 });
                    onAboutClick();
                  }}
                  className="glass-btn flex h-8 w-8 items-center justify-center rounded-lg text-foreground/50 transition-colors duration-150 hover:text-foreground shrink-0"
                  aria-label="Return to calendar view"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <a
                    href={socialLinks.website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn inline-flex items-center h-8 rounded-lg px-2.5 font-mono text-[10px] font-medium tracking-[1.2px] text-foreground/50 transition-colors duration-150 hover:text-foreground"
                    aria-label={socialLinks.website.ariaLabel}
                  >
                    {socialLinks.website.label}
                  </a>
                  <a
                    href={socialLinks.twitter.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn inline-flex items-center h-8 rounded-lg px-2.5 font-mono text-[10px] font-medium tracking-[1.2px] text-foreground/50 transition-colors duration-150 hover:text-foreground"
                    aria-label={socialLinks.twitter.ariaLabel}
                  >
                    {socialLinks.twitter.label}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative flex-1 overflow-hidden rounded-none">
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-all duration-300 ease-out",
            activeView === "day"
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "-translate-x-4 opacity-0 pointer-events-none",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 pb-3 pt-4 shrink-0">
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="glass-btn flex h-7 w-7 items-center justify-center rounded-lg text-foreground/60 transition-all duration-150 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous month"
            >
              <ChevronLeft size={13} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[13px] font-semibold tracking-[0.5px] text-foreground select-none">
                {currentMonth?.month}
              </span>
              <span className="font-mono text-[10px] tracking-[1.4px] text-muted-foreground/55 select-none">
                {currentMonth?.year}
              </span>
            </div>

            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className="glass-btn flex h-7 w-7 items-center justify-center rounded-lg text-foreground/60 transition-all duration-150 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next month"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative overflow-hidden shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {currentMonth && (
                <motion.div
                  key={monthIndex}
                  initial={{ x: slideDir * 42, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: slideDir * -42, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <CalendarMonth
                    days={currentMonth.days}
                    onDayClick={handleDayClick}
                    selectedDate={activeDate}
                    isOptimistic={Boolean(optimisticDate)}
                    forceShowIcons={selectedTopics.length > 0}
                    filterColor={activeFilterColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end px-4 pb-2 pt-3 shrink-0">
            {todayMonthIdx !== -1 && todayMonthIdx !== monthIndex && (
              <button
                onClick={jumpToToday}
                className="font-mono text-[9px] tracking-[1.3px] text-muted-foreground/45 hover:text-foreground uppercase transition-colors"
              >
                Today {"\u2192"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="mb-2 flex items-center px-1.5">
              <span className="font-mono text-[8.5px] tracking-[1.8px] text-muted-foreground/28 uppercase select-none">
                {"\u2661"} My favourites
              </span>
            </div>

            {filteredRecentEntries.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredRecentEntries.map((entry, i) => {
                    const accent = entry.primary_color || getTopicColor(entry.icon_name) || "#737373";
                    const label = TOPICS[getTopicKeyFromEntry(entry.genre, entry.icon_name)]?.label ?? "Misc";
                    return (
                      <motion.div
                        key={entry.date}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <button
                          onClick={() =>
                            handleDayClick({
                              day: Number(entry.date.split("-")[2]),
                              date: entry.date,
                              hasContent: true,
                              isToday: false,
                              iconName: entry.icon_name,
                              primaryColor: entry.primary_color,
                              genre: entry.genre,
                            })
                          }
                          className={cn(
                            "sidebar-entry-row group/recent w-full",
                            activeDate === entry.date && "sidebar-entry-row-active",
                          )}
                        >
                          <span
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-150 group-hover/recent:scale-125"
                            style={{ backgroundColor: accent, opacity: activeDate === entry.date ? 1 : 0.7 }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-mono text-[9.5px] tracking-[0.6px] text-muted-foreground/55 transition-colors duration-150 group-hover/recent:text-muted-foreground">
                                {formatShortDate(entry.date)}
                              </span>
                              <span className="font-mono text-[8px] tracking-[1px] uppercase text-muted-foreground/30">
                                {label}
                              </span>
                            </div>
                            {entry.title && (
                              <span className="mt-0.5 block truncate font-sans text-[10.5px] leading-tight text-foreground/45 transition-colors duration-150 group-hover/recent:text-foreground/65">
                                {entry.title}
                              </span>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="sidebar-empty-state px-3 py-5 text-center"
              >
                <p className="font-mono text-[10px] tracking-[1.2px] uppercase text-muted-foreground/55">
                  Nothing in this slice
                </p>
                <button
                  onClick={() => setSelectedTopics([])}
                  className="mt-3 font-mono text-[9px] tracking-[1.2px] uppercase text-foreground/55 transition-colors hover:text-foreground"
                >
                  Reset filter
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div
          ref={aboutRef}
          onScroll={(event) => {
            const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
            setAboutAtBottom(scrollHeight - scrollTop - clientHeight < 40);
          }}
          className={cn(
            "absolute inset-0 overflow-y-auto flex flex-col transition-all duration-300 ease-out",
            activeView === "about"
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-4 pointer-events-none",
          )}
        >
          <AboutPanel isVisible={activeView === "about"} />
        </div>

        <div
          className={cn(
            "sidebar-about-fade absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-30 transition-opacity duration-300",
            activeView === "about" && !aboutAtBottom ? "opacity-100" : "opacity-0",
          )}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 px-4 pb-2 pt-2.5 flex flex-col gap-2 shrink-0 rounded-none dark:border-white/[0.07]">
        <div className="flex items-center justify-between">
          <Penflow
            text="Dhruv Jaradi"
            fontUrl="/fonts/BrittanySignature.ttf"
            quality="balanced"
            size={19}
            color={isDark ? "#ffffff" : "#1a1a18"}
            className="opacity-65 transition-opacity duration-300 hover:opacity-90 -translate-y-[3px]"
            animate={penflowAnimate}
          />
          <span className="font-mono text-[9px] tracking-[1.5px] text-muted-foreground/30 uppercase select-none">
            {new Date().getFullYear()}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
