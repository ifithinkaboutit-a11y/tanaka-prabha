import { HeatmapSection } from "@/components/dashboard/HeatmapSection"
import { SectionCards } from "@/components/section-cards"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TopRegionsPanel } from "@/components/dashboard/TopRegionsPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map } from "lucide-react"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col py-6 md:py-8 gap-6 md:gap-8">
        {/* KPI Cards */}
        <SectionCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Heatmap */}
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

        {/* Recent Activity + Top Regions */}
        <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-2 md:gap-8">
          <RecentActivity />
          <TopRegionsPanel />
        </div>
      </div>
    </div>
  )
}
