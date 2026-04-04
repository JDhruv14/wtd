import type { ReactNode } from "react";
import { Fragment } from "react";
import Image from "next/image";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline underline-offset-4 decoration-foreground/40 hover:decoration-foreground transition-colors duration-150"
    >
      {children}
    </a>
  );
}

// ── Inline media renderers ────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  try {
    if (url.includes("youtu.be"))
      return url.split("/").pop()?.split("?")[0] ?? null;
    return new URL(url).searchParams.get("v");
  } catch {
    return null;
  }
}

function getSpotifyPath(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function InlineVideo({ url }: { url: string }) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return (
      <div className="my-6 w-full aspect-video overflow-hidden shadow-lg border border-border rounded-[12px] bg-foreground">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (url.includes("spotify.com")) {
    const path = getSpotifyPath(url);
    if (!path) return null;
    return (
      <div className="my-6 w-full overflow-hidden shadow-lg border border-border rounded-[12px] bg-muted p-1">
        <iframe
          className="rounded-[8px]"
          src={`https://open.spotify.com/embed${path}`}
          width="100%"
          height="352"
          frameBorder="0"
          allow="encrypted-media"
        />
      </div>
    );
  }

  // Fallback: image URL
  return (
    <div className="my-6 w-full overflow-hidden rounded-[12px] border border-border shadow-lg">
      <Image
        src={url}
        alt=""
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, min(896px, 100vw)"
        className="h-auto w-full object-cover"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}

function InlineImage({ url, caption }: { url: string; caption?: string }) {
  return (
    <figure className="my-6 w-full">
      <div className="overflow-hidden rounded-[12px] border border-border shadow-lg">
        <Image
          src={url}
          alt={caption ?? ""}
          width={1600}
          height={900}
          sizes="(max-width: 768px) 100vw, min(896px, 100vw)"
          className="h-auto w-full object-cover"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-[11px] text-muted-foreground/55 tracking-wide">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Render an @[url] block — auto-detects YouTube, Spotify, or image */
function renderAtMedia(url: string, key: React.Key): ReactNode {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url);
  if (isImage) return <InlineImage key={key} url={url} />;
  return <InlineVideo key={key} url={url} />;
}

// ── Inline markdown (bold, italic, links) ────────────────────────────────────

function parseInlineMarkdown(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push(
        <Fragment key={`t-${idx++}`}>{text.slice(last, match.index)}</Fragment>,
      );
    }
    if (match[0].startsWith("**")) {
      tokens.push(
        <strong key={`b-${idx++}`} className="font-bold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[0].startsWith("*")) {
      tokens.push(
        <em key={`i-${idx++}`} className="italic text-foreground/88">
          {match[3]}
        </em>,
      );
    } else if (match[4] && match[5]) {
      tokens.push(
        <ExternalLink key={`l-${idx++}`} href={match[5]}>
          {match[4]}
        </ExternalLink>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    tokens.push(<Fragment key={`t-${idx++}`}>{text.slice(last)}</Fragment>);
  }
  return tokens;
}

// ── TipTap JSON renderer (legacy entries) ────────────────────────────────────

function renderTipTapNode(node: any, key: React.Key): ReactNode {
  if (!node) return null;

  if (node.type === "text") {
    let content: ReactNode = node.text;
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") {
          content = (
            <strong className="font-bold text-foreground">{content}</strong>
          );
        } else if (mark.type === "italic") {
          content = <em className="italic text-foreground/90">{content}</em>;
        } else if (mark.type === "link") {
          content = (
            <ExternalLink href={mark.attrs.href}>{content}</ExternalLink>
          );
        }
      }
    }
    return <Fragment key={key}>{content}</Fragment>;
  }

  if (node.type === "hardBreak") return <br key={key} />;

  const children = node.content
    ? node.content.map((child: any, i: number) => renderTipTapNode(child, i))
    : null;

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;
    case "paragraph":
      return (
        <p key={key} className="mb-4 last:mb-0 leading-relaxed text-foreground">
          {children}
        </p>
      );
    case "heading": {
      const level = node.attrs.level;
      const cls =
        level === 1
          ? "text-2xl font-bold mb-6 mt-2 text-foreground"
          : "text-xl font-semibold mb-4 mt-2 text-foreground";
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <Tag key={key} className={cls}>
          {children}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc ml-6 mb-6 flex flex-col gap-2">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal ml-6 mb-6 flex flex-col gap-2">
          {children}
        </ol>
      );
    case "listItem":
      return (
        <li key={key} className="pl-1 leading-relaxed">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-6 pl-5 border-l-2 border-border py-2 italic text-muted-foreground bg-muted/40 rounded-r-lg"
        >
          {children}
        </blockquote>
      );
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function ContentParser({ content }: { content?: string | null }) {
  if (!content) {
    return <>No description available for this day.</>;
  }

  // TipTap JSON (legacy entries from the Supabase era)
  if (content.startsWith('{"type":"doc"')) {
    let tipTapJson: unknown = null;
    try {
      tipTapJson = JSON.parse(content);
    } catch {
      tipTapJson = null;
    }
    if (tipTapJson !== null && typeof tipTapJson === "object") {
      return <>{renderTipTapNode(tipTapJson, "doc")}</>;
    }
  }

  // Markdown + inline media blocks
  const lines = content.split("\n");
  const rendered: ReactNode[] = [];
  let quoteBlock: string[] = [];

  const flushQuote = (key: string | number) => {
    if (quoteBlock.length === 0) return;
    rendered.push(
      <blockquote
        key={`bq-${key}`}
        className="my-6 pl-5 border-l-2 border-border py-1 transition-colors duration-300 hover:border-foreground/20"
      >
        {quoteBlock.map((line, i) => (
          <p
            key={i}
            className="italic text-muted-foreground leading-relaxed mb-3 last:mb-0"
          >
            {parseInlineMarkdown(line)}
          </p>
        ))}
      </blockquote>,
    );
    quoteBlock = [];
  };

  lines.forEach((line, index) => {
    // Quote block  >
    if (line.startsWith("> ")) {
      quoteBlock.push(line.slice(2));
      return;
    }
    flushQuote(index);

    // @[url] — inline embed (YouTube, Spotify, or image)
    const atMedia = line.match(/^@\[(.+)\]$/);
    if (atMedia) {
      rendered.push(renderAtMedia(atMedia[1].trim(), index));
      return;
    }

    // @![caption](url) — inline image with caption
    const atImage = line.match(/^@!\[([^\]]*)\]\((.+)\)$/);
    if (atImage) {
      rendered.push(
        <InlineImage
          key={index}
          url={atImage[2].trim()}
          caption={atImage[1] || undefined}
        />,
      );
      return;
    }

    // Standard markdown image ![alt](url)
    const mdImage = line.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (mdImage) {
      rendered.push(
        <InlineImage
          key={index}
          url={mdImage[2].trim()}
          caption={mdImage[1] || undefined}
        />,
      );
      return;
    }

    // Blank line
    if (line.trim() === "") {
      rendered.push(<div key={index} className="h-3" />);
      return;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      rendered.push(
        <h1
          key={index}
          className="text-2xl font-bold mb-4 mt-2 text-foreground"
        >
          {parseInlineMarkdown(h1[1])}
        </h1>,
      );
      return;
    }
    if (h2) {
      rendered.push(
        <h2
          key={index}
          className="text-xl font-semibold mb-3 mt-2 text-foreground"
        >
          {parseInlineMarkdown(h2[1])}
        </h2>,
      );
      return;
    }
    if (h3) {
      rendered.push(
        <h3
          key={index}
          className="text-lg font-semibold mb-2 mt-2 text-foreground"
        >
          {parseInlineMarkdown(h3[1])}
        </h3>,
      );
      return;
    }

    // List item
    const li = line.match(/^[-*] (.+)/);
    if (li) {
      rendered.push(
        <p key={index} className="mb-2 last:mb-0 flex gap-2 items-baseline">
          <span className="text-muted-foreground select-none shrink-0">–</span>
          <span>{parseInlineMarkdown(li[1])}</span>
        </p>,
      );
      return;
    }

    // Regular paragraph
    rendered.push(
      <p key={index} className="mb-4 last:mb-0 leading-[1.75]">
        {parseInlineMarkdown(line)}
      </p>,
    );
  });

  flushQuote("final");
  return <>{rendered}</>;
}
