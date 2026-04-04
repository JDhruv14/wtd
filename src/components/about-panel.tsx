"use client";

import { aboutParagraphs } from "@content/sidebar/about";

const REVEAL_DELAY = 300;
const STAGGER = 48;

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
            key={index}
            className="font-sans text-[16px] leading-[1.6] text-foreground motion-safe:animate-fadeInUp motion-reduce:!opacity-100"
            style={{
              opacity: 0,
              animationDelay: `${REVEAL_DELAY + 60 + index * STAGGER}ms`,
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
