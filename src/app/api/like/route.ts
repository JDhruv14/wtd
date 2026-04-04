import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Lazily initialise Redis — gracefully no-ops if env vars are missing
function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require("@upstash/redis");
  return new Redis({ url, token }) as import("@upstash/redis").Redis;
}

function ipHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

const FILL_MAX = 4;

// GET /api/like?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return NextResponse.json({ count: 0, taps: 0 });

  const hash = ipHash(req);
  const [count, taps] = await Promise.all([
    redis.get<number>(`btw:likes:${date}`),
    redis.get<number>(`btw:ip:${date}:${hash}`),
  ]);

  return NextResponse.json({ count: count ?? 0, taps: taps ?? 0 });
}

// POST /api/like  body: { date: "YYYY-MM-DD" }
export async function POST(req: NextRequest) {
  const { date } = (await req.json()) as { date?: string };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return NextResponse.json({ count: 0, taps: 1 });

  const hash = ipHash(req);
  const ipKey = `btw:ip:${date}:${hash}`;

  const currentTaps = (await redis.get<number>(ipKey)) ?? 0;
  if (currentTaps >= FILL_MAX) {
    const count = (await redis.get<number>(`btw:likes:${date}`)) ?? 0;
    return NextResponse.json({ count, taps: currentTaps, rateLimited: true });
  }

  const [newCount, newTaps] = await Promise.all([
    redis.incr(`btw:likes:${date}`),
    redis.incr(ipKey),
  ]);

  return NextResponse.json({ count: newCount, taps: newTaps });
}
