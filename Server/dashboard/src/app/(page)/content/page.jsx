import { AppSidebar } from "@/components/app-sidebar"
import { SchemesGrid } from "@/components/schemes-grid"
import { BannersManager } from "@/components/banners-manager"
import { AnnouncementsManager } from "@/components/announcements-manager"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

/**
 * Content Page - Vibecode Architect Rules Applied:
 * - Rule 2: Spacing Multiplier - 8px base grid
 * - Rule 3: Large Text Kerning for headings
 * - Rule 10: Dashboard Hygiene - Clean tab navigation
 */
export default function ContentPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            {/* Rule 2: 2x vertical spacing (py-8) */}
            <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6">
              {/* Page header with Rule 3 kerning */}
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Content Management
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Manage schemes, programs, banners, and announcements. Add content in English and हिंदी.
                </p>
              </div>
              
              {/* Rule 2: 2x gap between header and tabs (mt-8) */}
              <Tabs defaultValue="schemes" className="w-full mt-8">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                  <TabsTrigger value="schemes">Schemes & Programs</TabsTrigger>
                  <TabsTrigger value="banners">Banners</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>
                {/* Rule 2: 1.5x gap between tabs and content (mt-6) */}
                <TabsContent value="schemes" className="mt-6">
                  <SchemesGrid />
                </TabsContent>
                <TabsContent value="banners" className="mt-6">
                  <BannersManager />
                </TabsContent>
                <TabsContent value="announcements" className="mt-6">
                  <AnnouncementsManager />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
