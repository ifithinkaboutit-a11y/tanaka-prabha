import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * EmptyState — consistent empty state for all tables
 * @param {string} title - Main heading
 * @param {string} description - Sub-text
 * @param {React.ReactNode} icon - Icon component
 * @param {string} actionLabel - CTA button text
 * @param {Function} onAction - CTA callback
 */
export function EmptyState({
    title = "No results found",
    description = "Try adjusting your search or filters.",
    icon: Icon,
    actionLabel,
    onAction,
    className,
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
            {Icon && (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
                    <Icon className="size-8 text-muted-foreground/60" />
                </div>
            )}
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
