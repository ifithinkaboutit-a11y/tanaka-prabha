"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { analyticsApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["var(--primary)", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6", "#8B5CF6", "#F97316"]

const LABELS = {
  cow: "Cow",
  buffalo: "Buffalo",
  goat: "Goat",
  sheep: "Sheep",
  pig: "Pig",
  poultry: "Poultry",
  horse: "Horse",
  other: "Other",
}

export function LivestockBreakdownChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await analyticsApi.getDashboardStats()
        const lb = res.data?.livestockBreakdown || {}
        const list = Object.entries(LABELS)
          .map(([key, label]) => ({ name: label, value: parseInt(lb[key]) || 0 }))
          .filter((d) => d.value > 0)
        setData(list)
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
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card className="overflow-hidden border-border/60 bg-card transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Livestock Breakdown</CardTitle>
        <CardDescription>Total animal population by type</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-2">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No livestock data available</p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${Number(value).toLocaleString()} (${total ? Math.round((Number(value) / total) * 100) : 0}%)`, name]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex w-full flex-wrap justify-center gap-x-4 gap-y-1.5">
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}