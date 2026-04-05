import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FILL_MAX = 4;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const JSON_CONTENT_TYPE = "application/json";
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

// Lazily initialize Redis and gracefully no-op when env vars are missing.
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function validateDate(date: string | null | undefined) {
  return Boolean(date && DATE_RE.test(date));
}

function isAllowedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set<string>([req.nextUrl.origin]);
  if (process.env.APP_ORIGIN) {
    allowedOrigins.add(process.env.APP_ORIGIN);
  }

  try {
    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function ipHash(req: NextRequest): string {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// GET /api/like?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!validateDate(date)) {
    return json({ error: "Invalid date" }, 400);
  }

  const redis = getRedis();
  if (!redis) {
    return json({ count: 0, taps: 0, available: false });
  }

  try {
    const hash = ipHash(req);
    const [count, taps] = await Promise.all([
      redis.get<number>(`btw:likes:${date}`),
      redis.get<number>(`btw:ip:${date}:${hash}`),
    ]);

    return json({ count: count ?? 0, taps: taps ?? 0, available: true });
  } catch {
    return json({ error: "Unable to load likes" }, 503);
  }
}

// POST /api/like body: { date: "YYYY-MM-DD" }
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return json({ error: "Forbidden origin" }, 403);
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes(JSON_CONTENT_TYPE)) {
    return json({ error: "Unsupported content type" }, 415);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const date =
    payload && typeof payload === "object" && "date" in payload
      ? (payload as { date?: string }).date
      : undefined;

  if (!validateDate(date)) {
    return json({ error: "Invalid date" }, 400);
  }

  const redis = getRedis();
  if (!redis) {
    return json({ count: 0, taps: 1, available: false });
  }

  try {
    const hash = ipHash(req);
    const likesKey = `btw:likes:${date}`;
    const ipKey = `btw:ip:${date}:${hash}`;

    // Increment the per-user counter first so concurrent taps cannot push
    // one viewer past the 4-like limit.
    const newTaps = await redis.incr(ipKey);

    if (newTaps > FILL_MAX) {
      await redis.decr(ipKey);
      const count = (await redis.get<number>(likesKey)) ?? 0;
      return json({
        count,
        taps: FILL_MAX,
        rateLimited: true,
        available: true,
      });
    }

    const newCount = await redis.incr(likesKey);
    return json({ count: newCount, taps: newTaps, available: true });
  } catch {
    return json({ error: "Unable to update likes" }, 503);
  }
}
