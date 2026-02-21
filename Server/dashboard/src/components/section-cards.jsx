"use client"

import { useEffect, useState } from "react"
import {
  IconUsers, IconPlant, IconPaw, IconFileCheck,
  IconArrowUpRight, IconTrendingUp,
} from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

const STAT_CONFIG = [
  {
    key: "totalFarmers",
    label: "Total Farmers",
    sublabel: "Registered",
    icon: IconUsers,
    gradient: "from-emerald-500 to-green-600",
    softBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    glow: "hover:shadow-emerald-500/20",
    bar: "bg-gradient-to-r from-emerald-400 to-green-500",
    format: (v) => v.toLocaleString("en-IN"),
  },
  {
    key: "totalLandCoverage",
    label: "Land Coverage",
    sublabel: "Cultivable acres",
    suffix: "ac",
    icon: IconPlant,
    gradient: "from-green-500 to-teal-600",
    softBg: "bg-green-50 dark:bg-green-950/40",
    iconBg: "bg-green-500/15 dark:bg-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    glow: "hover:shadow-green-500/20",
    bar: "bg-gradient-to-r from-green-400 to-teal-500",
    format: (v) => v.toLocaleString("en-IN"),
  },
  {
    key: "livestockCount",
    label: "Livestock",
    sublabel: "Total animals",
    icon: IconPaw,
    gradient: "from-amber-500 to-orange-500",
    softBg: "bg-amber-50 dark:bg-amber-950/40",
    iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-amber-500/20",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
    format: (v) => v.toLocaleString("en-IN"),
  },
  {
    key: "activeSchemes",
    label: "Active Schemes",
    sublabel: "Gov. programs",
    icon: IconFileCheck,
    gradient: "from-sky-500 to-blue-600",
    softBg: "bg-sky-50 dark:bg-sky-950/40",
    iconBg: "bg-sky-500/15 dark:bg-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
    glow: "hover:shadow-sky-500/20",
    bar: "bg-gradient-to-r from-sky-400 to-blue-500",
    format: (v) => v.toLocaleString("en-IN"),
  },
]

function StatCard({ config, value, index }) {
  const Icon = config.icon
  const fillPct = Math.min(100, Math.max(8, (value / 500) * 100))

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5",
        "transition-all duration-300 cursor-default",
        "hover:-translate-y-0.5 hover:border-border",
        "hover:shadow-xl",
        config.glow,
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Subtle gradient wash in top-right corner */}
      <div
        className={cn(
          "absolute -right-6 -top-6 size-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20 bg-linear-to-br",
          config.gradient
        )}
      />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">{config.sublabel}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110", config.iconBg)}>
          <Icon className={cn("size-5", config.iconColor)} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold tracking-tight text-foreground stat-number">
          {config.format(value)}
        </span>
        {config.suffix && (
          <span className="text-sm font-medium text-muted-foreground">{config.suffix}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", config.bar)}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Footer trend */}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <IconArrowUpRight className="size-3.5 text-emerald-500" />
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live data</span>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-2.5 w-14 rounded" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-3 w-16 rounded" />
    </div>
  )
}

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
        const data = response.data || response
        setStats({
          totalFarmers: data.totalFarmers || 0,
          totalLandCoverage: data.totalLandCoverage || 0,
          livestockCount: data.livestockCount || 0,
          activeSchemes: data.activeSchemes || 0,
          loading: false,
        })
      } catch {
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CONFIG.map(c => <StatCardSkeleton key={c.key} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {STAT_CONFIG.map((config, i) => (
        <StatCard key={config.key} config={config} value={stats[config.key]} index={i} />
      ))}
    </div>
  )
}
