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
import { analyticsApi } from "@/lib/api"

/**
 * SectionCards - Vibecode Architect Rules Applied:
 * - Rule 10: Dashboard Hygiene - Clean, purposeful cards
 * - Rule 11: Anti-AI Content Check - No redundant labels
 * - Rule 2: Spacing Multiplier - 8px grid spacing
 */
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
        const response = await analyticsApi.getDashboardStats()
        
        if (response.status === 'success') {
          setStats({
            totalFarmers: response.data.totalFarmers || 0,
            totalLandCoverage: response.data.totalLandCoverage || 0,
            livestockCount: response.data.livestockCount || 0,
            activeSchemes: response.data.activeSchemes || 0,
            loading: false,
          })
        } else {
          console.error("Error fetching stats:", response.message)
          setStats(prev => ({ ...prev, loading: false }))
        }
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
              <Skeleton className="h-4 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Card 1: Total Farmers - Rule 11: Context-obvious, no redundant labels */}
      <Card className="@container/card group">
        <CardHeader>
          <CardDescription>Farmers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl tracking-tight">
            {stats.totalFarmers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <IconUsers className="size-5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-emerald-500" />
            Registered beneficiaries
          </span>
        </CardFooter>
      </Card>

      {/* Card 2: Land Coverage */}
      <Card className="@container/card group">
        <CardHeader>
          <CardDescription>Land Coverage</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl tracking-tight">
            {stats.totalLandCoverage.toLocaleString()}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">acres</span>
          </CardTitle>
          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20">
              <IconPlant className="size-5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-green-500" />
            Cultivable area
          </span>
        </CardFooter>
      </Card>

      {/* Card 3: Livestock */}
      <Card className="@container/card group">
        <CardHeader>
          <CardDescription>Livestock</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl tracking-tight">
            {stats.livestockCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
              <IconPaw className="size-5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-amber-500" />
            Total animals
          </span>
        </CardFooter>
      </Card>

      {/* Card 4: Active Schemes */}
      <Card className="@container/card group">
        <CardHeader>
          <CardDescription>Active Schemes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl tracking-tight">
            {stats.activeSchemes.toLocaleString()}
          </CardTitle>
          <CardAction>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
              <IconFileCheck className="size-5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <IconTrendingUp className="size-3.5 text-blue-500" />
            Government programs
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
