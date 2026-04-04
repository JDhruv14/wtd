/**
 * Prebuild script: reads all YYYY-MM-DD.md files from content/ and writes
 * src/lib/content-index.json so the markdown-loader can import it as a static
 * module. This lets esbuild (used by @opennextjs/cloudflare) bundle the content
 * directly into the Cloudflare Worker instead of relying on runtime fs access.
 *
 * Run automatically before next build and next dev via package.json scripts.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "content");
const outputPath = path.join(__dirname, "..", "src", "lib", "content-index.json");

function collectMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMdFiles(full));
    } else if (
      entry.isFile() &&
      /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name)
    ) {
      files.push(full);
    }
  }
  return files.sort();
}

const files = collectMdFiles(contentDir);
const index = files.map((filePath) => ({
  date: path.basename(filePath).slice(0, 10),
  raw: fs.readFileSync(filePath, "utf-8"),
}));

fs.writeFileSync(outputPath, JSON.stringify(index));
console.log(`[content-index] ${index.length} entries → src/lib/content-index.json`);
