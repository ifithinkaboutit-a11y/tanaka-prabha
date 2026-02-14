"use client"

import { useEffect, useState, useRef } from "react"
import { IconMapPin } from "@tabler/icons-react"
import dynamic from "next/dynamic"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi } from "@/lib/api"

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
      <div className="text-center">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  ),
})

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
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="size-5" />
              Farmer Location Density
            </CardTitle>
            <CardDescription>
              Location-based density scan of registered farmers
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.totalLocations}</div>
              <div>Locations</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.districts}</div>
              <div>Districts</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-0 sm:px-6">
        {loading ? (
          <Skeleton className="h-[400px] w-full rounded-lg" />
        ) : (
          <div className="h-[400px] w-full rounded-lg overflow-hidden border">
            <MapComponent locations={locations} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
