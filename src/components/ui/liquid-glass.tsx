"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type LiquidGlassProps = React.HTMLAttributes<HTMLDivElement> & {
  px?: number;
  py?: number;
  radius?: number;
  depth?: number;
  blur?: number;
  dispersion?: number;
  innerClassName?: string;
};

export function LiquidGlass({
  className,
  innerClassName,
  style,
  children,
  px = 0,
  py = 0,
  radius = 24,
  ...props
}: LiquidGlassProps) {
  return (
    <div
      className={cn("glass-dock", className)}
      style={{
        paddingLeft: px,
        paddingRight: px,
        paddingTop: py,
        paddingBottom: py,
        borderRadius: radius,
        ...style,
      }}
      {...props}
    >
      <div className={innerClassName} style={{ borderRadius: Math.max(radius - 6, 0) }}>
        {children}
      </div>
    </div>
  );
}
