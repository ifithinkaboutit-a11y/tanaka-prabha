"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { analyticsApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "var(--primary)",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#8B5CF6",
  "#F97316",
]

export function TopRegionsChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await analyticsApi.getUserDistribution()
        const rows = res.data?.distribution || res.data?.topRegions || res.data || []
        const list = Array.isArray(rows)
          ? rows.map((r) => ({
              name: r.district || r.state || r.region || "Unknown",
              count: parseInt(r.count) || 0,
            }))
          : []
        setData(list.sort((a, b) => b.count - a.count).slice(0, 10))
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
        <CardTitle className="text-lg font-bold">Top Regions</CardTitle>
        <CardDescription>Farmers registered by district</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No regional data available</p>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}