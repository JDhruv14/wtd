import localFont from "next/font/local";
import { LogoMark } from "@/components/logo-mark";

const testSignifier = localFont({
  src: "../../public/fonts/TestSignifier-Medium.otf",
  variable: "--font-logo-display",
  display: "swap",
});

interface SiteLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconSizes = {
  sm: 18,
  md: 22,
  lg: 30,
};

const textSizes = {
  sm: "13px",
  md: "18px",
  lg: "22px",
};

export function SiteLogo({ size = "lg", className = "" }: SiteLogoProps) {
  const iconSize = iconSizes[size];
  const isSmall = size === "sm";

  return (
    <div
      className={`inline-flex w-fit max-w-full items-center transition-opacity duration-300 hover:opacity-80 ${isSmall ? "flex-row gap-2" : "flex-col gap-1.5 pl-4"} ${className}`}
    >
      <div className="flex shrink-0 items-center justify-center">
        <LogoMark size={iconSize} />
      </div>
      <span
        style={{
          fontStyle: "normal",
          fontWeight: 500,
          fontSize: textSizes[size],
          letterSpacing: "-0.01em",
          lineHeight: isSmall ? 1 : 0.94,
        }}
        className={`${testSignifier.className} whitespace-nowrap pl-1.5 text-foreground/92 ${isSmall ? "text-left" : "text-center"}`}
        aria-label="What the Dhruv!?"
      >
        What the Dhruv!?
      </span>
    </div>
  );
}
