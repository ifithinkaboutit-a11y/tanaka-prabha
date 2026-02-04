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

export default function ContentPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                  Manage schemes, banners, and other content for the platform.
                </p>
              </div>
              
              <Tabs defaultValue="schemes" className="w-full">
                <TabsList>
                  <TabsTrigger value="schemes">Schemes</TabsTrigger>
                  <TabsTrigger value="banners">Banners</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>
                <TabsContent value="schemes" className="mt-4">
                  <SchemesGrid />
                </TabsContent>
                <TabsContent value="banners" className="mt-4">
                  <BannersManager />
                </TabsContent>
                <TabsContent value="announcements" className="mt-4">
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
