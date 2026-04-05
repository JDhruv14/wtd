"use client";

import { aboutParagraphs } from "@content/sidebar/about";

const REVEAL_DELAY = 300;
const STAGGER = 48;

interface AboutPanelProps {
  isVisible: boolean;
}

export function AboutPanel({ isVisible }: AboutPanelProps) {
  return (
    <div
      data-nosnippet
      className={`notranslate flex w-full flex-1 flex-col gap-4 px-4 py-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(event) => event.stopPropagation()}
      translate="no"
    >
      <div className="w-full flex flex-col gap-4">
        {aboutParagraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`font-sans text-[16px] leading-[1.6] text-foreground motion-reduce:!opacity-100 ${
              isVisible ? "motion-safe:animate-fadeInUp" : ""
            }`}
            style={{
              opacity: isVisible ? 0 : 1,
              animationDelay: isVisible
                ? `${REVEAL_DELAY + 60 + index * STAGGER}ms`
                : undefined,
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
