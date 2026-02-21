// Prevent static prerender for all dashboard pages
export const dynamic = 'force-dynamic'

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }) {
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 80)",
                "--header-height": "calc(var(--spacing) * 20)",
            }}
        >
            <div className="relative flex h-dvh w-full">
                <AppSidebar />
                <SidebarInset className="flex flex-col">
                    <div className="flex flex-1 flex-col">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
