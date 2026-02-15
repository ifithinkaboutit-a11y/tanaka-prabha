import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Input Component - Vibecode Architect Rules Applied:
 * - Rule 1: Smooth corners with proper radius (rounded-xl = 12px)
 * - Rule 4: 4-Layer System - Input layer with proper contrast
 * - Rule 2: 8px grid spacing for padding
 */
const inputVariants = cva(
  // Base styles following 4-layer system (Rule 4)
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input w-full min-w-0 bg-transparent text-base transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "dark:bg-input/30 border shadow-xs",
        ghost: "border-transparent shadow-none bg-muted/50 hover:bg-muted",
        outline: "border-2 shadow-none",
        filled: "border-0 bg-muted shadow-none",
      },
      inputSize: {
        default: "h-9 px-3 py-1 rounded-xl",
        sm: "h-8 px-2.5 py-0.5 text-sm rounded-lg",
        lg: "h-11 px-4 py-2 text-base rounded-xl",
        xl: "h-12 px-5 py-2.5 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

function Input({
  className,
  type,
  variant = "default",
  inputSize = "default",
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant, inputSize }),
        // Focus ring styling
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Error state
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input, inputVariants }
