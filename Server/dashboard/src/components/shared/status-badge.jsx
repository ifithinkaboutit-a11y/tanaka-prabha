import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_STYLES = {
    // Content statuses
    published: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    draft: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    unpublished: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    // Professional statuses
    available: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    unavailable: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    // Beneficiary statuses
    verified: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    // General
    active: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
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
