"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { getTopicColor } from "@/lib/topics";

interface DayCellProps {
  iconName?: string | null;
  isEmpty?: boolean;
  isToday?: boolean;
  day?: number;
  size?: "sm" | "md";
  isSelected?: boolean;
  isSkipped?: boolean;
  isOptimistic?: boolean;
  primaryColor?: string | null;
  onClick?: () => void;
  className?: string;
  forceShowIcon?: boolean;
  filterColor?: string | null;
}

export function DayCell({
  iconName,
  isEmpty = false,
  isToday = false,
  day,
  size = "md",
  isSelected = false,
  isSkipped = false,
  isOptimistic = false,
  primaryColor,
  onClick,
  className = "",
  forceShowIcon = false,
  filterColor,
}: DayCellProps) {
  const [hovered, setHovered] = useState(false);
  const skipped = isSkipped && !isToday;
  const hasIcon = !!iconName && !skipped;
  // Icon is visible when: selected OR hovered (for content cells)
  const showIcon = hasIcon && (forceShowIcon || isSelected || hovered);
  // Hide number when: entry icon is showing, OR skipped cell is being hovered (block icon takes over)
  const showNumber = !showIcon && !(skipped && hovered);
  const clickable = !isEmpty && !skipped && !!onClick;

  const color = primaryColor || getTopicColor(iconName) || null;
  // In filter mode, always use canonical topic color for consistent per-topic highlighting.
  // Single filter → use filterColor. Multiple filters → fall back to getTopicColor (ignore primaryColor).
  // No filter → use color (primaryColor takes priority as normal).
  const activeColor = forceShowIcon
    ? (filterColor ?? getTopicColor(iconName) ?? color)
    : color;

  // Dynamic style — replaces the old solid black selected box
  const dynamicStyle: React.CSSProperties = {};

  if (!isEmpty && !skipped) {
    if (isSelected) {
      // inset shadow stays inside element bounds — never bleeds into neighbors or gets clipped
      dynamicStyle.boxShadow = color
        ? `inset 0 0 0 1.5px ${color}80`
        : `inset 0 0 0 1.5px rgba(10,10,10,0.4)`;
      dynamicStyle.backgroundColor = color
        ? `${color}14`
        : `rgba(10,10,10,0.07)`;
      if (isOptimistic) dynamicStyle.opacity = 0.6;
    } else if (forceShowIcon && activeColor) {
      dynamicStyle.backgroundColor = `${activeColor}14`;
      dynamicStyle.boxShadow = `inset 0 0 0 1px ${activeColor}40, 0 0 10px ${activeColor}12`;
    } else if (hovered && color) {
      // Hover: glow tint from entry color
      dynamicStyle.backgroundColor = `${color}15`;
      dynamicStyle.boxShadow = `0 0 0 1px ${color}25, 0 0 8px ${color}10`;
    }
  }

  const sizeClass = size === "sm" ? "w-10 h-10 p-1" : "w-[88px] h-[88px] p-4";

  let baseClass = "";
  if (!isEmpty) {
    if (skipped) {
      baseClass = "rounded-lg text-black/50 dark:text-white/50";
    } else {
      baseClass = `rounded-lg ${clickable ? "cursor-pointer" : ""}`;
    }
  }

  // Icon color: in filter mode use the same activeColor for consistency
  const iconColor = forceShowIcon
    ? (activeColor ?? undefined)
    : (hovered || isSelected) && color
      ? color
      : undefined;
  const iconClass = "text-black dark:text-white";

  return (
    <div
      className={`relative grid place-items-center shrink-0 transition-all duration-200 ${sizeClass} ${baseClass} ${className}`}
      style={dynamicStyle}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => !isEmpty && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable ? (e) => e.key === "Enter" && onClick?.() : undefined
      }
    >
      {!isEmpty && (
        <>
          {/* Day number */}
          <span
            className={`absolute inset-0 flex items-center justify-center font-mono font-medium tracking-premium select-none transition-opacity duration-150 ${
              size === "sm" ? "text-[12px]" : "text-[18px]"
            } ${showNumber ? "opacity-100" : "opacity-0"} ${
              skipped
                ? "text-black/50 dark:text-white/50"
                : "text-black dark:text-white"
            }`}
          >
            {day}
          </span>

          {/* Icon for content cells */}
          {hasIcon && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${
                showIcon ? "opacity-100" : "opacity-0"
              }`}
            >
              <Icon
                name={iconName!}
                size={size === "sm" ? "base" : "lg"}
                color={iconColor}
                className={iconClass}
              />
            </div>
          )}

          {/* Skipped cells — custom SVG block indicator on hover */}
          {skipped && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <svg
                width={size === "sm" ? 14 : 18}
                height={size === "sm" ? 14 : 18}
                viewBox="0 0 16 16"
                fill="none"
                className="text-black/50 dark:text-white/50"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="5.75"
                  stroke="currentColor"
                  strokeWidth="1.15"
                />
                <line
                  x1="4.2"
                  y1="11.8"
                  x2="11.8"
                  y2="4.2"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Today dot — a subtle accent under the number */}
          {isToday && (
            <span
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200 ${
                isSelected
                  ? "h-1 w-1 bg-black/45 dark:bg-white/45"
                  : "h-1 w-1 bg-black/55 dark:bg-white/55"
              } ${showNumber ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </>
      )}
    </div>
  );
}
