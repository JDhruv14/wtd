"use client";

import * as React from "react";
import { motion, isMotionComponent, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown>;

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  "ref"
> & { ref?: React.Ref<T> };

/** Matches `motion.div` so `Slot | motion.div` unions type-check in tooltips, etc. */
type MotionDivChild = React.ComponentProps<typeof motion.div>["children"];

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: React.ReactElement })
  | (Base & { asChild?: false | undefined });

type SlotProps<T extends HTMLElement = HTMLElement> = Omit<
  DOMMotionProps<T>,
  "children"
> & {
  /** Non-element nodes are ignored at runtime (see `isValidElement`). */
  children?: MotionDivChild;
};

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.RefObject<T | null>).current = node;
      }
    });
  };
}

function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>,
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps };

  if (childProps.className || slotProps.className) {
    merged.className = cn(
      childProps.className as string,
      slotProps.className as string,
    );
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    };
  }

  return merged;
}

function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>) {
  const childElement = React.isValidElement(children) ? children : undefined;

  const isAlreadyMotion =
    childElement !== undefined &&
    typeof childElement.type === "object" &&
    childElement.type !== null &&
    isMotionComponent(childElement.type);

  const Base = React.useMemo(() => {
    if (!childElement) {
      return motion.div as unknown as React.ElementType;
    }
    return isAlreadyMotion
      ? (childElement.type as React.ElementType)
      : motion.create(childElement.type as React.ElementType);
  }, [isAlreadyMotion, childElement]);

  if (!childElement) return null;

  const { ref: childRef, ...childProps } = childElement.props as AnyProps;

  const mergedProps = mergeProps(childProps, props);

  return (
    <Base {...mergedProps} ref={mergeRefs(childRef as React.Ref<T>, ref)} />
  );
}

export {
  Slot,
  type SlotProps,
  type WithAsChild,
  type DOMMotionProps,
  type AnyProps,
};
