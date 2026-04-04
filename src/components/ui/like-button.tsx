"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { sileo } from "sileo";
import { useWebHaptics } from "web-haptics/react";

import {
  BurstAnimation,
  CircleAnimation,
} from "@/components/ui/like-button-animations";
import { LikeButtonHeartIcon } from "@/components/ui/like-button-heart-icon";
import { cn } from "@/lib/utils";

const FILL_MAX = 4;

export interface LikeButtonProps {
  className?: string;
  date?: string;
  initialCount?: number;
  defaultLiked?: boolean;
  completed?: boolean;
  onLikeChange?: (liked: boolean, count: number, completed?: boolean) => void;
}

export function LikeButton({
  className,
  date,
  initialCount = 0,
  defaultLiked = false,
  completed = false,
  onLikeChange,
}: LikeButtonProps) {
  const { trigger: haptic } = useWebHaptics();
  const [likeCount, setLikeCount] = React.useState(initialCount);
  const [fillLevel, setFillLevel] = React.useState(completed ? FILL_MAX : 0);
  const [isCelebrating, setIsCelebrating] = React.useState(false);
  // On first mount only: count up from 0 for the entrance animation
  const [mountDone, setMountDone] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMountDone(true), 320);
    return () => clearTimeout(t);
  }, []);

  // When initialCount rises (API data loaded) smoothly count up — but never decrease
  React.useEffect(() => {
    setLikeCount(c => (initialCount > c ? initialCount : c));
  }, [initialCount]);

  // On navigation (date changes): reset state immediately with no animation
  const prevDate = React.useRef(date);
  React.useEffect(() => {
    if (date !== prevDate.current) {
      prevDate.current = date;
      setLikeCount(initialCount);
      setFillLevel(completed ? FILL_MAX : 0);
      setIsCelebrating(false);
      setMountDone(true); // skip entrance animation on navigation
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleTap = () => {
    if (completed) return;
    const nextFill = fillLevel + 1;
    const newCount = likeCount + 1;
    setLikeCount(newCount);

    if (nextFill >= FILL_MAX) {
      setFillLevel(FILL_MAX);
      setIsCelebrating(true);
      haptic([{ duration: 15 }], { intensity: 0.4 });
      onLikeChange?.(true, newCount, true);
      sileo.success({
        title: "Archive saved",
        description: "That one clearly landed. Thanks for the signal.",
        position: "top-right",
        duration: 3000,
        icon: <Heart size={16} className="text-red-500" fill="currentColor" strokeWidth={0} />,
        styles: {
          title: "sileo-title",
          description: "sileo-description",
        },
        roundness: 22,
      });
    } else {
      setFillLevel(nextFill);
      onLikeChange?.(true, newCount);
    }
  };

  const fillFraction = fillLevel / FILL_MAX;
  const isFull = fillLevel >= FILL_MAX;
  const displayCount = mountDone ? likeCount : 0;
  const displayFillFraction = mountDone ? fillFraction : 0;

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={completed ? "Liked" : "Like"}
      className={cn(
        "flex items-center justify-center gap-1.5 pl-3 pr-3 py-2 rounded-lg group hover:bg-accent transition-colors cursor-pointer text-foreground",
        className
      )}
    >
      <div className="relative size-5 flex items-center justify-center shrink-0">
        {isCelebrating && <CircleAnimation />}
        {isCelebrating && <BurstAnimation />}
        {isCelebrating ? (
          <motion.div
            key="celebrate"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.3 }}
            onAnimationComplete={() => setIsCelebrating(false)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <LikeButtonHeartIcon className="text-red-500 size-5" />
          </motion.div>
        ) : (
          <>
            {/* Outline — always visible underneath */}
            <Heart
              className="absolute inset-0 size-5 text-foreground/65"
              strokeWidth={1.5}
              fill="none"
            />
            {/* Fill — keyed on date so it snaps to correct position on navigation */}
            <motion.div
              key={date}
              className="absolute inset-0 overflow-hidden"
              initial={{ clipPath: `inset(${100 - displayFillFraction * 100}% 0 0 0)` }}
              animate={{ clipPath: `inset(${100 - displayFillFraction * 100}% 0 0 0)` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Heart
                className="absolute inset-0 size-5 text-red-500"
                strokeWidth={1.5}
                fill="currentColor"
              />
            </motion.div>
          </>
        )}
      </div>

      <span className="min-w-[0.75rem] font-mono text-[12px] text-foreground/80">
        <NumberFlow value={displayCount} />
        <span className="sr-only"> likes</span>
      </span>
    </button>
  );
}
