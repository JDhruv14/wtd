import type { Metadata } from "next";
import { DatePageClient } from "@/app/[date]/date-page-client";
import { getStableSiteData } from "@/lib/site-data";
import type { EmptyEntry } from "@/components/entry-view";

interface DatePageProps {
  params: Promise<{ date: string }>;
}

function isValidDateSlug(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export async function generateMetadata({ params }: DatePageProps): Promise<Metadata> {
  const { date } = await params;
  const { allEntries } = getStableSiteData();
  const entry = allEntries.find(e => e.date === date) ?? null;

  if (!entry) {
    return {
      title: isValidDateSlug(date) ? `No entry for ${date}` : "No Entry Found",
      description: isValidDateSlug(date)
        ? "No entry yet for this date."
        : "No entry found for this date."
    };
  }

  const title = entry.title
    ? entry.title
    : `Entry for ${new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })}`;

  const description = entry.content
    ? entry.content.length > 160
      ? `${entry.content.substring(0, 157)}...`
      : entry.content
    : `Check out ${entry.title || "this discovery"}.`;

  const ogImage = "/og-image.png";
  const canonical = `/${entry.date}`;

  return {
    title,
    description,
    keywords: entry.keywords || undefined,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: [ogImage],
      publishedTime: entry.date
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function DatePage({ params }: DatePageProps) {
  const { date } = await params;
  const { allEntries, allEntryDates } = getStableSiteData();
  const existingEntry = allEntries.find(e => e.date === date) ?? null;
  const entry: typeof existingEntry | EmptyEntry | null = existingEntry
    ?? (isValidDateSlug(date) ? { date, isEmpty: true } : null);

  return (
    <DatePageClient
      entry={entry}
      allEntryDates={allEntryDates}
    />
  );
}
