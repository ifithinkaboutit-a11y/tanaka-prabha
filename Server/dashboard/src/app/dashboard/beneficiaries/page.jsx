import { AppSidebar } from "@/components/app-sidebar"
import { BeneficiariesTable } from "@/components/beneficiaries-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function BeneficiariesPage() {
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
                <h1 className="text-2xl font-semibold tracking-tight">Beneficiaries</h1>
                <p className="text-muted-foreground">
                  Manage and view all registered farmers in the system.
                </p>
              </div>
              <BeneficiariesTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
