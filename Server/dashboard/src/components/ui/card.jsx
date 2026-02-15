import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card Component - Vibecode Architect Rules Applied:
 * - Rule 1: Corner Radius Formula (Inner = Outer - Padding)
 *   Card outer radius: 16px, inner elements: 12px (16 - 4px padding adjustment)
 * - Rule 2: Spacing Multiplier - 24px internal padding (1.5x base)
 * - Rule 4: 4-Layer System - Surface elevation with proper contrast
 * - Rule 8: Glow effects for interactive cards
 */

const cardVariants = cva(
  // Base styles with 4-layer system (Rule 4)
  "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border py-6 transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md hover:shadow-lg",
        ghost: "border-transparent shadow-none bg-transparent",
        outline: "shadow-none",
      },
      interactive: {
        true: "cursor-pointer hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.99]",
        false: "",
      },
      glow: {
        true: "glow-primary",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      glow: false,
    },
  }
)

function Card({
  className,
  variant = "default",
  interactive = false,
  glow = false,
  onMouseMove,
  ...props
}) {
  const cardRef = React.useRef(null)

  // Track mouse position for interactive glow effect
  const handleMouseMove = (e) => {
    if (interactive && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      cardRef.current.style.setProperty("--mouse-x", `${x}%`)
      cardRef.current.style.setProperty("--mouse-y", `${y}%`)
    }
    onMouseMove?.(e)
  }

  return (
    <div
      ref={cardRef}
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(cardVariants({ variant, interactive, glow }), className)}
      onMouseMove={handleMouseMove}
      style={{
        // iOS Smooth Corners (Rule 1 refinement)
        borderRadius: '16px',
      }}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start",
        // 1x spacing between header elements (16px)
        "gap-4 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-none font-semibold tracking-tight",
        className
      )}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 [.border-t]:pt-6",
        className
      )}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
