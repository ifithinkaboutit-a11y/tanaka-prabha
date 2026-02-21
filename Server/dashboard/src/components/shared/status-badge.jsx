import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_STYLES = {
    // Content statuses
    published: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    draft: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    unpublished: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    // Professional statuses
    available: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    unavailable: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    // Beneficiary statuses
    verified: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    pending: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    // General
    active: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800",
    inactive: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
}

const STATUS_LABELS = {
    published: "Published",
    draft: "Draft",
    unpublished: "Unpublished",
    available: "Available",
    unavailable: "Unavailable",
    verified: "Verified",
    pending: "Pending",
    active: "Active",
    inactive: "Inactive",
}

/**
 * StatusBadge — unified color-coded status indicator
 * @param {"published"|"draft"|"unpublished"|"available"|"unavailable"|"verified"|"pending"|"active"|"inactive"} status
 * @param {string} className
 */
export function StatusBadge({ status, className }) {
    const key = status?.toLowerCase()
    const styles = STATUS_STYLES[key] || STATUS_STYLES.inactive
    const label = STATUS_LABELS[key] || status

    return (
        <Badge variant="outline" className={cn(styles, className)}>
            {label}
        </Badge>
    )
}
