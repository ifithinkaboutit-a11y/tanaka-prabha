"use client"

import { useEffect, useState } from "react"
import { IconUserPlus, IconFileCheck, IconCalendar } from "@tabler/icons-react"

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
            icon: activity.type === 'registration' ? IconUserPlus : IconFileCheck,
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest registrations and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="size-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest registrations and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={
                    activity.type === "registration" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  }>
                    {activity.type === "registration" 
                      ? getInitials(activity.title)
                      : <Icon className="size-4" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(activity.time)}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
