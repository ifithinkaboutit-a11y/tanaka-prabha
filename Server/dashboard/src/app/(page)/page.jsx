import { AppSidebar } from "@/components/app-sidebar"
import { FarmerDensityMap } from "@/components/farmer-density-map"
import { RecentActivity } from "@/components/recent-activity"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

/**
 * Dashboard Page - Vibecode Architect Rules Applied:
 * - Rule 2: Spacing Multiplier - 8px base grid
 *   - 1x (16-24px) between related elements
 *   - 2x (32-48px) between slightly separated elements
 *   - 4x (80-96px) between major sections
 * - Rule 10: Dashboard Hygiene - Clean, purposeful layout
 */
export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {/* Main content area with proper spacing */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            {/* Rule 2: Content wrapper with 2x vertical spacing */}
            <div className="flex flex-col py-6 md:py-8">
              {/* Stats section - 1x spacing below header */}
              <SectionCards />
              
              {/* Rule 2: 2x gap between stats and content (32-48px) */}
              <div className="grid gap-6 px-4 pt-8 lg:px-6 lg:grid-cols-3 md:gap-8 md:pt-10">
                {/* Map section - 2/3 width on large screens */}
                <div className="lg:col-span-2">
                  <FarmerDensityMap />
                </div>
                {/* Activity section - 1/3 width on large screens */}
                <div className="lg:col-span-1">
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
