import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Run `next build` directly instead of `npm run build`, so `package.json` can set
// `"build": "opennextjs-cloudflare build"` for Cloudflare CI without recursion.
const openNextConfig = {
  ...defineCloudflareConfig(),
  buildCommand: "npx next build",
};

export default openNextConfig;
