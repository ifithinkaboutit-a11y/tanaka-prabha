"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsApi } from "@/lib/api"

export function TopRegionsPanel() {
    const [regions, setRegions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRegions() {
            try {
                const res = await analyticsApi.getUserDistribution()
                const data = res.data?.topRegions || res.data || []
                setRegions(Array.isArray(data) ? data.slice(0, 8) : [])
            } catch {
                setRegions([])
            } finally {
                setLoading(false)
            }
        }
        fetchRegions()
    }, [])

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="size-4" />
                    </div>
                    Top Regions
                </CardTitle>
                <CardDescription>User count by district/state</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="size-6 rounded-full" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                ) : regions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No regional data available</p>
                ) : (
                    <div className="space-y-2">
                        {regions.map((region, i) => {
                            const isUp = !region.change || region.change >= 0
                            return (
                                <div key={i} className="flex items-center gap-3 py-1.5 rounded-lg px-2 -mx-2 hover:bg-muted/50 transition-colors">
                                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="flex-1 text-sm font-medium truncate">
                                        {region.state || region.district || region.region || "Unknown"}
                                    </span>
                                    <span className="text-sm tabular-nums font-semibold">
                                        {(region.count || 0).toLocaleString()}
                                    </span>
                                    {region.change !== undefined && (
                                        <span className={`flex items-center gap-0.5 text-xs ${isUp ? "text-zinc-600" : "text-zinc-500"}`}>
                                            {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                            {Math.abs(region.change)}%
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
