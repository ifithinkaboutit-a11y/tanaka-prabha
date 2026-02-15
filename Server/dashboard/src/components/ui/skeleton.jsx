import { cn } from "@/lib/utils"

/**
 * Skeleton Component - Vibecode Architect Rules Applied:
 * - Rule 1: Smooth rounded corners
 * - Rule 8: Shimmer animation for premium feel
 */
function Skeleton({
  className,
  variant = "default",
  ...props
}) {
  const variants = {
    default: "animate-pulse",
    shimmer: "animate-shimmer bg-gradient-to-r from-accent via-accent/60 to-accent bg-[length:200%_100%]",
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-lg",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Pre-defined skeleton shapes for common use cases
function SkeletonText({ lines = 3, className, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}

function SkeletonAvatar({ className, size = "default", ...props }) {
  const sizes = {
    sm: "size-8",
    default: "size-10",
    lg: "size-12",
    xl: "size-16",
  }

  return (
    <Skeleton
      className={cn("rounded-full", sizes[size], className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar }
