"use client";

import {
  AlignLeft,
  ArrowRight,
  ArrowUpRight,
  Ban,
  BookOpen,
  Camera,
  Check,
  Clapperboard,
  Code,
  Coffee,
  Copy,
  Disc3,
  ExternalLink,
  Feather,
  Film,
  Gamepad,
  Ghost,
  Globe,
  Headphones,
  Heart,
  HeartIcon,
  ImageOff,
  Link2,
  MessageCircle,
  Mic,
  Monitor,
  Music4,
  Newspaper,
  Palette,
  PenLine,
  PlayCircle,
  ScrollText,
  Sparkles,
  Star,
  Tv,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";

type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "check"
  | "copy"
  | "heart-outline"
  | "heart-filled"
  | "image-broken"
  | "x"
  | "brand-x"
  // video / media
  | "youtube"
  | "reel"
  | "movie"
  | "anime"
  | "show"
  // reading / writing
  | "article"
  | "blog"
  | "book"
  | "thread"
  | "thought"
  // social / web
  | "tweet"
  | "website"
  | "link"
  // audio
  | "music"
  | "album"
  | "podcast"
  // creative / tech
  | "design"
  | "photo"
  | "art"
  | "code"
  | "game"
  | "tool"
  | "sparkle"
  | "prohibit"
  | "alien"
  | "star"
  | "coffee"
  | "zap"
  | "mic"
  | string;

type IconSize = "xs" | "sm" | "base" | "lg";

const iconSizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  base: 18,
  lg: 20,
};

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = "base", className = "", color, style }: IconProps) {
  const px = iconSizeMap[size] ?? iconSizeMap.base;
  const p = { className, color, size: px, style };

  switch (name) {
    // utility
    case "arrow-right":    return <ArrowRight {...p} />;
    case "arrow-up-right": return <ArrowUpRight {...p} />;
    case "check":          return <Check {...p} />;
    case "copy":           return <Copy {...p} />;
    case "heart-outline":  return <Heart {...p} />;
    case "heart-filled":   return <HeartIcon {...p} fill={color ?? "currentColor"} />;
    case "image-broken":   return <ImageOff {...p} />;
    case "x":              return <X {...p} />;
    case "brand-x":        return (
      <svg viewBox="0 0 24 24" width={px} height={px} className={className} style={style} fill="currentColor" color={color}>
        <path d="M18.244 2h3.308l-7.227 8.26L22.828 22h-6.657l-5.214-6.817L4.99 22H1.68l7.73-8.835L1.254 2h6.826l4.713 6.231zM17.083 20h1.833L7.083 3.895H5.116z" />
      </svg>
    );

    // video / media
    case "youtube":        return <PlayCircle {...p} />;
    case "reel":           return <Film {...p} />;
    case "movie":          return <Clapperboard {...p} />;
    case "anime":          return <Tv {...p} />;
    case "show":           return <Monitor {...p} />;

    // reading / writing
    case "article":        return <Newspaper {...p} />;
    case "blog":           return <Feather {...p} />;
    case "book":           return <BookOpen {...p} />;
    case "thread":         return <ScrollText {...p} />;
    case "thought":        return <PenLine {...p} />;

    // social / web
    case "tweet":          return <MessageCircle {...p} />;
    case "website":        return <Globe {...p} />;
    case "link":           return <Link2 {...p} />;

    // audio
    case "music":          return <Music4 {...p} />;
    case "album":          return <Disc3 {...p} />;
    case "podcast":        return <Headphones {...p} />;

    // creative / tech
    case "design":         return <Palette {...p} />;
    case "photo":          return <Camera {...p} />;
    case "art":            return <AlignLeft {...p} />;
    case "code":           return <Code {...p} />;
    case "game":           return <Gamepad {...p} />;
    case "tool":           return <Wrench {...p} />;

    // misc
    case "sparkle":        return <Sparkles {...p} />;
    case "prohibit":       return <Ban {...p} />;
    case "alien":          return <Ghost {...p} />;
    case "star":           return <Star {...p} />;
    case "coffee":         return <Coffee {...p} />;
    case "zap":            return <Zap {...p} />;
    case "mic":            return <Mic {...p} />;

    default:               return <ExternalLink {...p} />;
  }
}
