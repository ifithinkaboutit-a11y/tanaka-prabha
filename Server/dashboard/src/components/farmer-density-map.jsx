"use client"

import { useEffect, useState } from "react"
import { IconMapPin, IconMap, IconUsers, IconMapPinFilled } from "@tabler/icons-react"
import dynamic from "next/dynamic"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * FarmerDensityMap - Vibecode Architect Rules Applied:
 * - Rule 10: Dashboard Hygiene - Clean, purposeful map display
 * - Rule 11: Anti-AI Content - No redundant labels
 * - Rule 2: Spacing Multiplier - Consistent padding
 * - Rule 4: 4-Layer depth with proper elevation
 */

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-xl animate-pulse">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <IconMap className="size-10 opacity-40" />
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  ),
})

function StatBadge({ icon: Icon, value, label, colorScheme = "default" }) {
  const colors = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
        colors[colorScheme]
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="size-4" />
        <span className="font-semibold tabular-nums text-lg">
          {value.toLocaleString()}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function FarmerDensityMap() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalLocations: 0, districts: 0 })

  useEffect(() => {
    async function fetchFarmerLocations() {
      try {
        const response = await analyticsApi.getFarmerLocations()
        // Handle response structure: response.data can be { locations: [] } or array directly
        const data = response.data?.locations || response.data || []

        // Transform data for heatmap - [lat, lng, intensity]
        const heatmapData = data.map(user => [
          parseFloat(user.latitude),
          parseFloat(user.longitude),
          1 // intensity
        ]).filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]))

        // Count unique districts
        const uniqueDistricts = new Set(data.map(u => u.district).filter(Boolean))

        setLocations(heatmapData)
        setStats({
          totalLocations: heatmapData.length,
          districts: uniqueDistricts.size
        })
      } catch (error) {
        console.error("Error fetching farmer locations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFarmerLocations()
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconMapPinFilled className="size-4" />
              </div>
              Farmer Distribution
            </CardTitle>
            <CardDescription>
              Geographic density of registered farmers
            </CardDescription>
          </div>
          {/* Rule 10: Stats inline, not separate section */}
          <div className="flex gap-2">
            <StatBadge
              icon={IconMapPin}
              value={stats.totalLocations}
              label="Locations"
              colorScheme="success"
            />
            <StatBadge
              icon={IconUsers}
              value={stats.districts}
              label="Districts"
              colorScheme="primary"
            />
          </div>
        </div>
      </CardHeader>
      {/* Rule 2: Proper padding for content */}
      <CardContent className="px-3 pt-0 pb-3 sm:px-6 sm:pb-6">
        {loading ? (
          <Skeleton className="h-[400px] w-full rounded-xl" />
        ) : (
          <div
            className={cn(
              // Rule 1: Smooth rounded corners
              "h-[400px] w-full rounded-xl overflow-hidden",
              // Rule 4: Border for definition layer
              "border bg-muted/20",
              // Subtle shadow for depth
              "shadow-inner"
            )}
          >
            <MapComponent locations={locations} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
