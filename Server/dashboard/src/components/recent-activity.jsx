"use client"

import { useEffect, useState } from "react"
import { IconUserPlus, IconFileCheck, IconCalendar, IconActivity } from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * RecentActivity - Vibecode Architect Rules Applied:
 * - Rule 10: Dashboard Hygiene - Clean activity list
 * - Rule 11: Anti-AI Content - No redundant labels, professional icons
 * - Rule 2: Spacing Multiplier - Consistent 8px grid
 * - Rule 7: Optimistic animations for new items
 */

// Activity type styling following HSB Generative Hack (Rule 6)
const ACTIVITY_STYLES = {
  registration: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: IconUserPlus,
  },
  scheme: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-400",
    icon: IconFileCheck,
  },
  default: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: IconActivity,
  },
}

function ActivityItem({ activity, formatTimeAgo, getInitials }) {
  const style = ACTIVITY_STYLES[activity.type] || ACTIVITY_STYLES.default
  const Icon = activity.icon || style.icon

  return (
    <div
      className={cn(
        // Rule 2: 12px gap (gap-3)
        "flex items-center gap-3 py-2",
        // Rule 7: Hover state for interactivity
        "rounded-lg px-2 -mx-2 transition-colors duration-150",
        "hover:bg-muted/50 cursor-default"
      )}
    >
      {/* Avatar with proper sizing and colors */}
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className={cn(style.bg, style.text, "text-sm font-medium")}>
          {activity.type === "registration" ? (
            getInitials(activity.title)
          ) : (
            <Icon className="size-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Content - Rule 11: No redundant labels */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate leading-tight">
          {activity.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {activity.description}
        </p>
      </div>

      {/* Timestamp - Right aligned */}
      <time className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
        {formatTimeAgo(activity.time)}
      </time>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
      <Skeleton className="h-3 w-12 rounded-md" />
    </div>
  )
}

export function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivities() {
      try {
        const response = await analyticsApi.getRecentActivity({ limit: 6 })
        
        if (response.status === 'success') {
          const formattedActivities = response.data.activities.map(activity => ({
            ...activity,
            icon: ACTIVITY_STYLES[activity.type]?.icon || ACTIVITY_STYLES.default.icon,
          }))
          setActivities(formattedActivities)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching activities:", error)
        setLoading(false)
      }
    }

    fetchRecentActivities()
  }, [])

  function formatTimeAgo(dateString) {
    if (!dateString) return "Recently"
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="size-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest registrations and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <IconActivity className="size-4" />
          </div>
          Recent Activity
        </CardTitle>
        <CardDescription>Latest registrations and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          // Rule 10: Clean empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconActivity className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                formatTimeAgo={formatTimeAgo}
                getInitials={getInitials}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
