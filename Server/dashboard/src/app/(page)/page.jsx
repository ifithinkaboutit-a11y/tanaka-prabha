import { SectionCards } from "@/components/section-cards"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TopRegionsPanel } from "@/components/dashboard/TopRegionsPanel"
import { HighlightsChart } from "@/components/dashboard/HighlightsChart"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col py-6 md:py-8 gap-6 md:gap-8">
        {/* KPI Cards */}
        <SectionCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Chart + Recent Activity */}
        <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-2 md:gap-8">
          <HighlightsChart />
          <RecentActivity />
        </div>

        {/* Top Regions */}
        <div className="px-4 lg:px-6">
          <TopRegionsPanel />
        </div>
      </div>
    </div>
  )
}
