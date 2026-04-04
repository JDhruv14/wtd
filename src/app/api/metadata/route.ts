import { NextResponse } from "next/server";
import { loadMdEntries } from "@/lib/markdown-loader";

const metadataByUrl = new Map(
  loadMdEntries()
    .filter((entry) => entry.initialMetadata)
    .map((entry) => [entry.media_url, entry.initialMetadata])
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url query param" }, { status: 400 });
  }

  const metadata = metadataByUrl.get(url) ?? null;
  return NextResponse.json(metadata);
}
