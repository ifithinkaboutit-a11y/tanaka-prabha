import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Badge Component - Vibecode Architect Rules Applied:
 * - Rule 1: Smooth rounded corners with proper radius
 * - Rule 6: HSB Generative Hack for color variants
 * - Rule 8: Shimmer effect for premium badges
 * - Rule 11: Professional icon sizing
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Rule 6: Success variant using HSB shift
        success: "bg-zinc-500/15 text-zinc-700 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30",
        // Rule 6: Warning variant
        warning: "bg-zinc-500/15 text-zinc-700 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30",
        // Rule 6: Info variant
        info: "bg-zinc-500/15 text-zinc-700 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30",
        // Rule 8: Premium shimmer variant
        shimmer: "bg-primary text-primary-foreground shimmer-border [a&]:hover:bg-primary/90",
        // Soft variants for subtle badges
        "soft-primary": "bg-primary/10 text-primary border-primary/20",
        "soft-secondary": "bg-muted text-muted-foreground border-muted",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-px text-[10px] [&>svg]:size-2.5",
        lg: "px-3 py-1 text-sm [&>svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
