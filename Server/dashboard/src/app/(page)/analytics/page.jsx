"use client"

import { UnifiedMapSection } from "@/components/dashboard/UnifiedMapSection"
import { TopLivestockRegions } from "@/components/dashboard/TopLivestockRegions"
import { TopRegionsChart } from "@/components/dashboard/TopRegionsChart"
import { FarmerTrendsChart } from "@/components/dashboard/FarmerTrendsChart"
import { LivestockBreakdownChart } from "@/components/dashboard/LivestockBreakdownChart"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api"
import { Map } from "lucide-react"
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

        {/* One map for every layer — pick the dataset, then heatmap or pins.
            Replaces the four stacked maps this page used to render. */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Map className="size-4" />
                </div>
                Geographic Distribution — India
              </CardTitle>
              <CardDescription>
                Users, landholding, livestock and crops on a single map. Switch between
                heatmap and pins, and filter within each dataset.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden rounded-b-xl">
              <UnifiedMapSection />
            </CardContent>
          </Card>
        </div>

        {/* Trend / composition charts */}
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <FarmerTrendsChart />
            <LivestockBreakdownChart />
            <div className="lg:col-span-2">
              <TopRegionsChart />
            </div>
          </div>
        </div>

        {/* Top Livestock Regions */}
        <div className="px-4 lg:px-6">
          <TopLivestockRegions farmers={farmers} />
        </div>
      </div>
    </div>
  )
}
