"use client";

import { useEffect, useState } from "react";
import { aboutParagraphs } from "@content/sidebar/about";

interface AboutPanelProps {
  isVisible: boolean;
}

export function AboutPanel({ isVisible }: AboutPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => setIsMounted(true), 50);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => setIsMounted(false), 300);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  if (!isVisible && !isMounted) {
    return null;
  }

  return (
    <div
      data-nosnippet
      onClick={(event) => event.stopPropagation()}
      className={`flex-1 w-full flex flex-col gap-4 px-4 py-4 transition-opacity duration-400 ${isMounted ? "opacity-100" : "opacity-0"}`}
    >
      <div className="w-full flex flex-col gap-4">
        {aboutParagraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={`font-sans text-[16px] leading-[1.6] text-foreground transition-transform transition-opacity duration-600 ease-out transform ${
              isMounted
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={{
              transitionDelay: `${50 + 80 * index}ms`,
              letterSpacing: "0.01em",
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="h-[80px] shrink-0" />
    </div>
  );
}
