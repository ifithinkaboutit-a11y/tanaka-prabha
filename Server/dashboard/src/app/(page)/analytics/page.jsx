"use client"

import { HeatmapSection } from "@/components/dashboard/HeatmapSection"
import { LivestockHeatmapSection } from "@/components/dashboard/LivestockHeatmapSection"
import { TopLivestockRegions } from "@/components/dashboard/TopLivestockRegions"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api"
import { BarChart2, Map } from "lucide-react"
import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [farmers, setFarmers] = useState([])

  useEffect(() => {
    async function fetchFarmers() {
      try {
        const res = await analyticsApi.getLivestockStatistics()
        setFarmers(res.data?.farmers || [])
      } catch {
        setFarmers([])
      }
    }
    fetchFarmers()
  }, [])

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col py-6 md:py-8 gap-6 md:gap-8">
        {/* KPI Summary Cards */}
        <SectionCards />

        {/* User Distribution Heatmap */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Map className="size-4" />
                </div>
                User Distribution — India
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-xl">
              <HeatmapSection />
            </CardContent>
          </Card>
        </div>

        {/* Livestock Heatmap */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <BarChart2 className="size-4" />
                </div>
                Livestock Distribution — India
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-xl">
              <LivestockHeatmapSection />
            </CardContent>
          </Card>
        </div>

        {/* Top Livestock Regions */}
        <div className="px-4 lg:px-6">
          <TopLivestockRegions farmers={farmers} />
        </div>
      </div>
    </div>
  )
}
