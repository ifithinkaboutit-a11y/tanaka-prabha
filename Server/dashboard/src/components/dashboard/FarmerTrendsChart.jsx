"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { analyticsApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PERIODS = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
]

export function FarmerTrendsChart() {
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    async function fetchTrends() {
      try {
        const res = await analyticsApi.getGrowthTrends({ period })
        const trends = res.data?.trends || []
        if (cancelled) return
        setData(
          trends.map((item) => ({
            name: new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            registrations: parseInt(item.registrations) || 0,
          }))
        )
      } catch {
        if (!cancelled) setData([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTrends()
    return () => {
      cancelled = true
    }
  }, [period])

  const total = data.reduce((s, d) => s + d.registrations, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold">Farmer Registration Trends</CardTitle>
            <CardDescription>New farmer registrations · {total.toLocaleString()} in period</CardDescription>
          </div>
          <div className="flex shrink-0 gap-1 rounded-lg bg-muted p-0.5">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant="ghost"
                size="sm"
                className={`h-7 px-2.5 text-xs ${period === p.value ? "bg-background shadow-sm" : ""}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No registration data available</p>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFarmerTrends" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dy={8}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFarmerTrends)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}