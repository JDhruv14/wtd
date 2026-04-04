"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { getTopicColor } from "@/lib/topics";
import type { Entry, EntryMetadata } from "@/lib/types";

interface MediaRendererProps {
  entry: Entry;
  metadata: EntryMetadata | null;
  isLoadingMetadata?: boolean;
}

function LinkPreviewCard({ mediaUrl, metadata, isLoading }: { mediaUrl: string; metadata: EntryMetadata | null; isLoading?: boolean }) {
  let hostname: string | null = null;
  try {
    hostname = new URL(mediaUrl).hostname;
  } catch {
    hostname = null;
  }

  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [metadata?.image]);

  useEffect(() => {
    if (!metadata?.image) {
      return;
    }

    const extractColor = (img: HTMLImageElement) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;
        const buckets: Record<string, number> = {};

        const sample = (x: number, y: number) => {
          const index = (64 * y + x) * 4;
          const r = Math.round(data[index] / 16) * 16;
          const g = Math.round(data[index + 1] / 16) * 16;
          const b = Math.round(data[index + 2] / 16) * 16;
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        };

        for (let i = 0; i < 64; i += 1) {
          sample(i, 0);
          sample(i, 63);
          sample(0, i);
          sample(63, i);
        }

        let max = 0;
        let top = "0,0,0";
        Object.entries(buckets).forEach(([key, count]) => {
          if (count > max) {
            max = count;
            top = key;
          }
        });

        const [r, g, b] = top.split(",").map(Number);
        setDominantColor(`rgb(${r}, ${g}, ${b})`);
      } catch {
        // Ignore color extraction errors.
      }
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => extractColor(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => extractColor(fallback);
      fallback.src = metadata.image || "";
    };
    img.src = metadata.image;
  }, [metadata?.image]);

  return (
    <div className="w-full flex flex-col overflow-hidden shadow-2xl border border-border bg-muted/60 backdrop-blur-xl rounded-[16px]">
      <div className="h-9 px-4 flex items-center justify-center bg-muted/40">
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-1 rounded-full bg-accent group hover:bg-accent/80 transition-colors duration-200"
        >
          <img
            src={hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32` : "/globe.svg"}
            alt=""
            className="w-3 h-3 rounded-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
            onError={(event) => {
              const target = event.currentTarget;
              target.onerror = null;
              target.src = "/globe.svg";
            }}
          />
          <span className="font-sans text-[11px] text-muted-foreground group-hover:text-foreground transition-colors duration-200 tracking-wide ml-1.5">
            {hostname ?? mediaUrl}
          </span>
          <div className="flex items-center overflow-hidden transition-all duration-300 ease-out max-w-[20px] opacity-100 md:max-w-0 md:opacity-0 md:group-hover:max-w-[20px] md:group-hover:opacity-100">
            <Icon name="arrow-up-right" className="text-muted-foreground group-hover:text-foreground transition-colors duration-150 ml-2" style={{ width: "12px", height: "12px" }} />
          </div>
        </a>
      </div>

      <div className="w-full relative group p-1">
        <div
          className={`w-full relative overflow-hidden rounded-[8px] flex items-center justify-center transition-colors duration-500 ${
            isLoading || !metadata?.image || imageError ? "min-h-[424px]" : "max-h-[480px]"
          }`}
          style={{ backgroundColor: dominantColor || "var(--muted)" }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-border border-t-foreground animate-spin rounded-full" />
            </div>
          ) : metadata?.image && !imageError ? (
            <img src={metadata.image} alt={metadata.title} className="w-full h-auto max-h-[432px] object-contain" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Icon name="image-broken" className="w-8 h-8 opacity-30 text-muted-foreground" />
              <span className="font-mono text-[12px] text-muted-foreground uppercase tracking-widest mt-4">No preview image :/</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaPlaceholder({ entry }: { entry: Entry }) {
  const iconName = entry.icon_name || "sparkle";
  const color = entry.primary_color || getTopicColor(iconName) || "#737373";

  return (
    <div className="w-full flex flex-col overflow-hidden shadow-2xl border border-border bg-muted/60 backdrop-blur-xl rounded-[16px]">
      {/* Chrome bar */}
      <div className="h-9 px-4 flex items-center justify-center bg-muted/40">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent">
          <Icon name={iconName} size="xs" style={{ color }} />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1.2px]">
            {iconName}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="w-full p-1">
        <div
          className="w-full rounded-[8px] min-h-[360px] flex flex-col items-center justify-center gap-5"
          style={{ background: "var(--muted)" }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${color}28`, boxShadow: `0 0 0 1px ${color}50, 0 8px 32px ${color}30` }}
          >
            <Icon name={iconName} size="lg" style={{ color, width: 32, height: 32 }} />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[1.8px] text-muted-foreground/40 select-none">
            no media attached
          </span>
        </div>
      </div>
    </div>
  );
}

export function MediaRenderer({ entry, metadata, isLoadingMetadata = false }: MediaRendererProps) {
  if (!entry.media_url) {
    return <MediaPlaceholder entry={entry} />;
  }

  const { media_url: mediaUrl, media_type: mediaType } = entry;

  if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
    const videoId = mediaUrl.includes("youtu.be") ? mediaUrl.split("/").pop()?.split("?")[0] : new URL(mediaUrl).searchParams.get("v");

    return (
      <div className="w-full aspect-video overflow-hidden shadow-2xl bg-foreground border border-border rounded-[12px]">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (mediaUrl.includes("spotify.com")) {
    const pathname = new URL(mediaUrl).pathname;

    return (
      <div className="w-full overflow-hidden shadow-2xl bg-muted p-1 border border-border rounded-[12px]">
        <iframe className="rounded-[8px]" src={`https://open.spotify.com/embed${pathname}`} width="100%" height="352" frameBorder="0" allow="encrypted-media" />
      </div>
    );
  }

  const treatTweetAsPreview = useMemo(() => {
    const isArticleTweet = mediaUrl.includes("/article/");
    const metadataLooksPreview = Boolean(metadata && metadata.title && !metadata.title.includes(" on X") && !metadata.title.includes(" on Twitter") && metadata.image);

    return (
      isArticleTweet ||
      mediaType === "twitter-article" ||
      mediaType === "article" ||
      ["article", "link", "image"].includes(entry.icon_name || "") ||
      metadataLooksPreview
    );
  }, [entry.icon_name, mediaType, mediaUrl, metadata]);

  if (mediaType === "tweet" || mediaType === "twitter-article" || mediaUrl.includes("twitter.com") || mediaUrl.includes("x.com")) {
    if (treatTweetAsPreview) {
      return <LinkPreviewCard mediaUrl={mediaUrl} metadata={metadata} isLoading={isLoadingMetadata} />;
    }

    return (
      <div className="w-full flex flex-col overflow-hidden shadow-2xl border border-border bg-muted/40 backdrop-blur-xl rounded-[16px]">
        <div className="h-9 px-4 flex items-center justify-center bg-muted/40">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-1 rounded-full bg-accent group hover:bg-accent/80 transition-colors duration-200"
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(mediaUrl).hostname}&sz=32`}
              alt=""
              className="w-3 h-3 rounded-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              onError={(event) => {
                const target = event.currentTarget;
                target.onerror = null;
                target.src = "/globe.svg";
              }}
            />
            <span className="font-sans text-[11px] text-muted-foreground group-hover:text-foreground transition-colors duration-200 tracking-wide ml-1.5">x.com</span>
            <div className="flex items-center overflow-hidden transition-all duration-300 ease-out max-w-[20px] opacity-100 md:max-w-0 md:opacity-0 md:group-hover:max-w-[20px] md:group-hover:opacity-100">
              <Icon name="arrow-up-right" className="text-muted-foreground group-hover:text-foreground transition-colors duration-150 ml-2" style={{ width: "12px", height: "12px" }} />
            </div>
          </a>
        </div>

        <div className="w-full flex justify-center p-8">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-[550px] min-h-[320px] rounded-[12px] border border-border bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-3"
          >
            <Icon name="tweet" className="text-muted-foreground w-8 h-8" />
            <p className="font-sans text-sm text-muted-foreground">Open tweet on X</p>
          </a>
        </div>
      </div>
    );
  }

  if (mediaType === "link" || mediaType === "peerlist" || mediaType === "article") {
    return <LinkPreviewCard mediaUrl={mediaUrl} metadata={metadata} isLoading={isLoadingMetadata} />;
  }

  return (
    <div className="w-full aspect-video overflow-hidden shadow-2xl border border-border group rounded-[12px]">
      <img src={mediaUrl} alt={entry.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
    </div>
  );
}
