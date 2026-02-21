"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function DashboardNavigation({ routes }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [openCollapsible, setOpenCollapsible] = useState(null)
  const pathname = usePathname()

  function isActive(link) {
    if (link === "/") return pathname === "/"
    return pathname === link || pathname.startsWith(link + "/")
  }

  return (
    <SidebarMenu>
      {routes.map((route) => {
        const isOpen = !isCollapsed && openCollapsible === route.id
        const hasSubRoutes = !!route.subs?.length
        const routeActive = isActive(route.link) || route.subs?.some(s => isActive(s.link))

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenCollapsible(open ? route.id : null)
                }
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      "flex w-full items-center rounded-lg px-2 transition-colors",
                      isOpen || routeActive
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {route.icon}
                    {!isCollapsed && (
                      <span className="ml-2 flex-1 text-sm font-medium">
                        {route.title}
                      </span>
                    )}
                    {!isCollapsed && hasSubRoutes && (
                      <span className="ml-auto">
                        {isOpen ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {!isCollapsed && (
                  <CollapsibleContent>
                    <SidebarMenuSub className="my-1 ml-3.5">
                      {route.subs?.map((subRoute) => (
                        <SidebarMenuSubItem
                          key={`${route.id}-${subRoute.title}`}
                          className="h-auto"
                        >
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subRoute.link}
                              prefetch={true}
                              className={cn(
                                "flex items-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                                isActive(subRoute.link)
                                  ? "bg-sidebar-accent text-foreground"
                                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                              )}
                            >
                              {subRoute.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            ) : (
              <SidebarMenuButton tooltip={route.title} asChild>
                <Link
                  href={route.link}
                  prefetch={true}
                  className={cn(
                    "flex items-center rounded-lg px-2 transition-colors",
                    isActive(route.link)
                      ? "bg-sidebar-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  {route.icon}
                  {!isCollapsed && (
                    <span className="ml-2 text-sm font-medium">
                      {route.title}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
