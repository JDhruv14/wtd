"use client";

import { useState, useCallback } from "react";

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

export function useGlassRipple() {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 650);
  }, []);

  return { ripples, addRipple };
}

export function GlassRipples({ ripples }: { ripples: RippleItem[] }) {
  return (
    <>
      {ripples.map(r => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full glass-ripple-anim"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
        />
      ))}
    </>
  );
}
