"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { SubscribeCard } from "@/components/subscribe-card";
import type { DayData, Entry, MonthData } from "@/lib/types";

interface DateLayoutClientProps {
  monthsData: MonthData[];
  allEntryDates: string[];
  recentEntries: Pick<Entry, "date" | "title" | "primary_color" | "icon_name" | "genre">[];
  children: React.ReactNode;
}

export function DateLayoutClient({
  monthsData,
  allEntryDates,
  recentEntries,
  children,
}: DateLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [activeView, setActiveView] = useState<"day" | "about">("day");
  const [subscribeOpen, setSubscribeOpen] = useState(false);

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
    router.push(`/${day.date}`);
  };

  return (
    <>
      <SidebarProvider
        defaultOpen={!mobile}
        style={{ "--sidebar-width": "320px", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
      >
        <AppSidebar
          monthsData={monthsData}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          onAboutClick={() => setActiveView(v => v === "about" ? "day" : "about")}
          onSubscribeClick={() => setSubscribeOpen(true)}
          activeView={activeView}
          totalEntries={allEntryDates.length}
          recentEntries={recentEntries}
        />

        <SidebarInset>
          <div className="flex h-full flex-col">
            {/* Mobile sticky header */}
            <header className="glass-header fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 md:hidden">
              <SidebarTrigger
                className="glass-btn size-8 rounded-full text-foreground/55 hover:text-foreground transition-all duration-200"
                aria-label="Toggle sidebar"
              />
              <span className="font-mono text-[10px] tracking-[2.5px] uppercase text-foreground/35 select-none">
                btw
              </span>
              <AnimatedThemeToggle className="glass-btn text-foreground size-8 rounded-full" />
            </header>
            <div className="h-14 shrink-0 md:hidden" aria-hidden="true" />

            <main className={`flex-1 ${mobile ? "overflow-y-auto" : "overflow-hidden"}`}>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Subscribe modal */}
      {subscribeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:items-end md:justify-start md:p-2">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-md md:bg-foreground/[0.02] md:backdrop-blur-none"
            onClick={() => setSubscribeOpen(false)}
          />
          <div
            className="relative z-10 md:mb-[48px] md:ml-[117px]"
            onClick={e => e.stopPropagation()}
          >
            <SubscribeCard
              onSubscribe={async (_email: string) => { localStorage.setItem("has_subscribed", "true"); }}
              onClose={() => setSubscribeOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
