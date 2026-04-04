"use client";

import { aboutParagraphs } from "@content/sidebar/about";

interface AboutPanelProps {
  isVisible: boolean;
}

export function AboutPanel({ isVisible }: AboutPanelProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-nosnippet
      onClick={(event) => event.stopPropagation()}
      className="flex-1 w-full flex flex-col gap-4 px-4 py-4"
    >
      <div className="w-full flex flex-col gap-4">
        {aboutParagraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className="font-sans text-[16px] leading-[1.6] text-foreground motion-safe:animate-fadeInUp"
            style={{
              animationDelay: `${40 * index}ms`,
              letterSpacing: "0.01em",
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
