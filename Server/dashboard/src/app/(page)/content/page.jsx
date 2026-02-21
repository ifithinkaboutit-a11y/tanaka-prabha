import { SchemesGrid } from "@/components/schemes-grid"
import { BannersManager } from "@/components/banners-manager"
import { AnnouncementsManager } from "@/components/announcements-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContentPage() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Content Management
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage schemes, programs, banners, and announcements. Add content in English and हिंदी.
          </p>
        </div>
        <Tabs defaultValue="schemes" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="schemes">Schemes &amp; Programs</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
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
  )
}
