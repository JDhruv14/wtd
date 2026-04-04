"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EntryView, type EmptyEntry } from "@/components/entry-view";
import type { Entry } from "@/lib/types";

interface DatePageClientProps {
  entry: Entry | EmptyEntry | null;
  allEntryDates: string[];
}

const randomMessages = [
  "Digging through the archives...",
  "Spinning the wheel...",
  "Closing eyes and pointing...",
  "Summoning a good one...",
  "Rolling the dice...",
  "Shuffling the deck...",
  "Asking the universe...",
  "One sec, time traveling...",
];

export function DatePageClient({ entry, allEntryDates }: DatePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [isNavigatingRandom, setIsNavigatingRandom] = useState(false);
  const [navigatingMessage, setNavigatingMessage] = useState("");

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setIsNavigatingRandom(false));
  }, [pathname]);

  const handleRandomClick = () => {
    if (!allEntryDates.length) return;
    const randomDate =
      allEntryDates[Math.floor(Math.random() * allEntryDates.length)];
    setNavigatingMessage(
      randomMessages[Math.floor(Math.random() * randomMessages.length)],
    );
    setIsNavigatingRandom(true);
    router.push(`/${randomDate}`);
  };

  return (
    <EntryView
      entry={entry}
      isMobile={mobile}
      initialMetadata={
        entry && !("isEmpty" in entry) ? (entry.initialMetadata ?? null) : null
      }
      allEntryDates={allEntryDates}
      isNavigating={isNavigatingRandom}
      navigatingMessage={navigatingMessage}
      onRandomClick={handleRandomClick}
    />
  );
}
