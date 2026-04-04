import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./content/**/*"],
    "/*": ["./content/**/*"],
    "/[date]": ["./content/**/*"],
    "/api/metadata": ["./content/**/*"],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "**" },
      { protocol: "http", hostname: "**", pathname: "**" },
    ],
  },
};

export default nextConfig;
