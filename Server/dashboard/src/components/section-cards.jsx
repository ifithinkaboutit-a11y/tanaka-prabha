"use client"

import { useEffect, useState } from "react"
import { IconTrendingUp, IconUsers, IconPlant, IconPaw, IconFileCheck, IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react"

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
import { cn } from "@/lib/utils"

/**
 * SectionCards - Vibecode Architect Rules Applied:
 * - Rule 10: Dashboard Hygiene - Clean, purposeful cards
 * - Rule 11: Anti-AI Content Check - No redundant labels, icons instead of emojis
 * - Rule 2: Spacing Multiplier - 8px grid spacing (gap-4 = 16px)
 * - Rule 8: Glow effects on interactive cards
 * - Rule 7: Optimistic UI animations for data refresh
 */

// Stat card configuration following Rule 11 - meaningful icons only
const STAT_CONFIG = [
  {
    key: "totalFarmers",
    label: "Farmers",
    sublabel: "Registered beneficiaries",
    icon: IconUsers,
    colorScheme: "emerald",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "totalLandCoverage",
    label: "Land Coverage",
    sublabel: "Cultivable area",
    icon: IconPlant,
    colorScheme: "green",
    format: (v) => v.toLocaleString(),
    suffix: "acres",
  },
  {
    key: "livestockCount",
    label: "Livestock",
    sublabel: "Total animals",
    icon: IconPaw,
    colorScheme: "amber",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "activeSchemes",
    label: "Active Schemes",
    sublabel: "Government programs",
    icon: IconFileCheck,
    colorScheme: "blue",
    format: (v) => v.toLocaleString(),
  },
]

// Color scheme mapping for consistent HSB-based colors (Rule 6)
const COLOR_SCHEMES = {
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    trend: "text-emerald-500",
    glow: "group-hover:shadow-emerald-500/20",
  },
  green: {
    bg: "bg-green-500/10 dark:bg-green-500/20",
    text: "text-green-600 dark:text-green-400",
    trend: "text-green-500",
    glow: "group-hover:shadow-green-500/20",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    trend: "text-amber-500",
    glow: "group-hover:shadow-amber-500/20",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    trend: "text-blue-500",
    glow: "group-hover:shadow-blue-500/20",
  },
}

function StatIcon({ icon: Icon, colorScheme, className }) {
  const colors = COLOR_SCHEMES[colorScheme]
  return (
    <div
      className={cn(
        // Rule 1: Corner radius 12px (rounded-xl)
        "flex size-11 items-center justify-center rounded-xl transition-all duration-300",
        // Rule 8: Subtle glow on hover
        "group-hover:scale-105",
        colors.bg,
        colors.text,
        className
      )}
    >
      <Icon className="size-5" />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 mt-2 rounded-lg" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-4 w-32 rounded-lg" />
      </CardFooter>
    </Card>
  )
}

function StatCard({ config, value, trend }) {
  const colors = COLOR_SCHEMES[config.colorScheme]
  const TrendIcon = trend >= 0 ? IconArrowUpRight : IconArrowDownRight
  
  return (
    <Card 
      className={cn(
        "@container/card group cursor-default",
        // Rule 8: Enhanced hover with glow
        "transition-all duration-300",
        colors.glow
      )}
      interactive
    >
      <CardHeader>
        {/* Rule 11: Concise label without redundant prefix */}
        <CardDescription className="text-xs font-medium uppercase tracking-wider">
          {config.label}
        </CardDescription>
        <CardTitle className="flex items-baseline gap-1.5">
          {/* Rule 3: Tight kerning for large numbers */}
          <span className="text-2xl font-semibold tabular-nums tracking-tight @[250px]/card:text-3xl stat-number">
            {config.format(value)}
          </span>
          {config.suffix && (
            <span className="text-base font-normal text-muted-foreground">
              {config.suffix}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <StatIcon icon={config.icon} colorScheme={config.colorScheme} />
        </CardAction>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <TrendIcon className={cn("size-3.5", colors.trend)} />
          <span>{config.sublabel}</span>
        </span>
      </CardFooter>
    </Card>
  )
}

export function SectionCards() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalLandCoverage: 0,
    livestockCount: 0,
    activeSchemes: 0,
    loading: true,
    animateIn: false,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await analyticsApi.getDashboardStats()
        
        if (response.status === 'success' || response.data) {
          const data = response.data || response
          setStats({
            totalFarmers: data.totalFarmers || 0,
            totalLandCoverage: data.totalLandCoverage || 0,
            livestockCount: data.livestockCount || 0,
            activeSchemes: data.activeSchemes || 0,
            loading: false,
            animateIn: true,
          })
        } else {
          console.error("Error fetching stats:", response.message)
          setStats(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Set default values on error
        setStats({
          totalFarmers: 0,
          totalLandCoverage: 0,
          livestockCount: 0,
          activeSchemes: 0,
          loading: false,
          animateIn: false,
        })
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      // Rule 2: 16px gap (gap-4) for related elements, responsive grid
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {STAT_CONFIG.map((config) => (
          <StatCardSkeleton key={config.key} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        // Rule 2: Spacing Multiplier - 16px base gap
        "grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4",
        // Rule 4: Cards with gradient from primary to card (depth layer)
        "*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t",
        // Rule 7: Optimistic slide-in animation
        stats.animateIn && "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
      )}
    >
      {STAT_CONFIG.map((config) => (
        <StatCard
          key={config.key}
          config={config}
          value={stats[config.key]}
          trend={1} // Placeholder positive trend
        />
      ))}
    </div>
  )
}
