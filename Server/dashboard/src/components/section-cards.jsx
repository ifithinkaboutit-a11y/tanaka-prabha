"use client"

import { useEffect, useState } from "react"
import { IconTrendingUp, IconUsers, IconPlant, IconPaw, IconFileCheck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

export function SectionCards() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalLandCoverage: 0,
    livestockCount: 0,
    activeSchemes: 0,
    loading: true,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total farmers count
        const { count: farmersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        // Fetch total land coverage
        const { data: landData } = await supabase
          .from("land_details")
          .select("total_land_area")
        
        const totalLand = landData?.reduce((sum, item) => sum + (item.total_land_area || 0), 0) || 0

        // Fetch livestock count
        const { data: livestockData } = await supabase
          .from("livestock")
          .select("cows, buffaloes, goats")
        
        const totalLivestock = livestockData?.reduce((sum, item) => 
          sum + (item.cows || 0) + (item.buffaloes || 0) + (item.goats || 0), 0) || 0

        // Fetch active schemes count
        const { count: schemesCount } = await supabase
          .from("schemes")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        setStats({
          totalFarmers: farmersCount || 0,
          totalLandCoverage: totalLand,
          livestockCount: totalLivestock,
          activeSchemes: schemesCount || 0,
          loading: false,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-48" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Card 1: Total Farmers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Farmers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalFarmers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <IconUsers className="size-3.5" />
              Registered
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total registered beneficiaries <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Active farmers in the system
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Total Land Coverage */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Land Coverage</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalLandCoverage.toLocaleString()} <span className="text-lg font-normal">Acres</span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
              <IconPlant className="size-3.5" />
              Land
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Agricultural land area <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total cultivable area covered
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Livestock Count */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Livestock Count</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.livestockCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <IconPaw className="size-3.5" />
              Animals
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total animal assets <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Cows, Buffaloes & Goats
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Schemes Active */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Schemes Active</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeSchemes.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <IconFileCheck className="size-3.5" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Running government schemes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Available for beneficiaries
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
