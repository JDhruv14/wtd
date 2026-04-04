import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Mono,
  Instrument_Serif,
  Manrope,
} from "next/font/google";
import { RootShell } from "@/components/root-shell";
import { SileoToaster } from "@/components/sileo-toaster";
import { getStableSiteData } from "@/lib/site-data";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata = {
  title: "What the Dhruv!?",
  description:
    "A personal daily log of the best thing seen each day, built in Next.js with componentized animations.",
  icons: {
    icon: [
      {
        url: "/favicon-light.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
      {
        url: "/favicon-dark.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getStableSiteData() returns the same object reference for the server process lifetime.
  // This means RootShell (client component) receives identical props on every navigation,
  // so React never re-renders it — the sidebar and its footer stay perfectly stable.
  const { allEntryDates, monthsData, recentEntries } = getStableSiteData();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorantGaramond.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='btw-theme';var v=localStorage.getItem(k);var d=document.documentElement;if(v==='light')d.classList.remove('dark');else if(v==='dark')d.classList.add('dark');else if(window.matchMedia('(prefers-color-scheme:dark)').matches)d.classList.add('dark');else d.classList.remove('dark');})();`,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        {/* SVG filter for liquid glass displacement — referenced by backdrop-filter: url(#liquid-glass) */}
        <svg
          aria-hidden="true"
          style={{ display: "none", position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <filter
              id="liquid-glass"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.006 0.006"
                numOctaves="3"
                seed="52"
                result="noise"
              />
              <feGaussianBlur
                in="noise"
                stdDeviation="1.2"
                result="smoothNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="smoothNoise"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feOffset dx="1.5" dy="0" in="displaced" result="redShift" />
              <feOffset dx="0" dy="0" in="displaced" result="greenStay" />
              <feOffset dx="-1.5" dy="0" in="displaced" result="blueShift" />
              <feColorMatrix
                in="redShift"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="redOnly"
              />
              <feColorMatrix
                in="greenStay"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="greenOnly"
              />
              <feColorMatrix
                in="blueShift"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="blueOnly"
              />
              <feComposite
                in="redOnly"
                in2="greenOnly"
                operator="lighter"
                result="redGreen"
              />
              <feComposite in="redGreen" in2="blueOnly" operator="lighter" />
            </filter>
          </defs>
        </svg>
        <SileoToaster />
        <RootShell
          monthsData={monthsData}
          allEntryDates={allEntryDates}
          recentEntries={recentEntries}
        >
          {children}
        </RootShell>
      </body>
    </html>
  );
}
