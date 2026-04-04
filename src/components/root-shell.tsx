"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Github, Star } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteLogo } from "@/components/site-logo";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { GlassRipples, useGlassRipple } from "@/components/ui/glass-ripple";
import { PageTranslator } from "@/components/ui/page-language";
import { cn } from "@/lib/utils";
import type { DayData, Entry, MonthData } from "@/lib/types";
import { socialLinks } from "@content/sidebar/profile";

const GITHUB_LINK = socialLinks.github.href;

interface RootShellProps {
  monthsData: MonthData[];
  allEntryDates: string[];
  recentEntries: Pick<
    Entry,
    "date" | "title" | "primary_color" | "icon_name" | "genre"
  >[];
  children: React.ReactNode;
}

function MobileHeader() {
  const { openMobile } = useSidebar();
  const { ripples: triggerRipples, addRipple: addTriggerRipple } =
    useGlassRipple();
  const { ripples: themeRipples, addRipple: addThemeRipple } = useGlassRipple();
  const { ripples: githubRipples, addRipple: addGithubRipple } =
    useGlassRipple();

  return (
    <header
      className={cn(
        "glass-header fixed inset-x-0 top-0 z-50 flex h-12 shrink-0 items-center px-3 transition-all duration-200 md:hidden",
        openMobile && "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <div className="z-[2] flex items-center gap-2">
        <div className="relative overflow-hidden rounded-lg">
          <GlassRipples ripples={triggerRipples} />
          <SidebarTrigger
            onClick={addTriggerRipple}
            className="glass-btn size-8 rounded-lg"
            aria-label="Toggle sidebar"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 pt-1.5">
        <SiteLogo size="sm" className="opacity-90" />
      </div>
      <div className="z-[2] ml-auto flex items-center gap-2">
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
          <GlassRipples ripples={themeRipples} />
          <AnimatedThemeToggle
            onClick={addThemeRipple}
            className="glass-btn glass-btn-static size-8 rounded-lg"
          />
        </div>
      </div>
    </header>
  );
}

export function RootShell({
  monthsData,
  allEntryDates,
  recentEntries,
  children,
}: RootShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [activeView, setActiveView] = useState<"day" | "about">("day");

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const selectedDate = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean).at(-1) ?? "";
    return /^\d{4}-\d{2}-\d{2}$/.test(seg) ? seg : null;
  }, [pathname]);

  const handleDayClick = (day: DayData) => {
    setActiveView("day");
    router.push(`/${day.date}`);
  };

  return (
    <>
      <SidebarProvider
        defaultOpen={!mobile}
        style={
          {
            "--sidebar-width": "320px",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
      >
        <PageTranslator />
        <AppSidebar
          monthsData={monthsData}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          onAboutClick={() =>
            setActiveView((v) => (v === "about" ? "day" : "about"))
          }
          activeView={activeView}
          totalEntries={allEntryDates.length}
          recentEntries={recentEntries}
        />

        <SidebarInset>
          <div className="flex min-h-dvh flex-col md:h-full md:min-h-0 md:overflow-hidden">
            <MobileHeader />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
