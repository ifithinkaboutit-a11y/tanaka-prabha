"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Stethoscope,
  Settings,
  Sprout,
  ChevronRight,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Beneficiaries", url: "/beneficiaries", icon: Users },
  { title: "Content (CMS)", url: "/content", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Professionals", url: "/professionals", icon: Stethoscope },
  { title: "Settings", url: "/settings", icon: Settings },
]

function NavLink({ item, isActive }) {
  const Icon = item.icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        className={cn(
          "group/nav relative h-10 rounded-xl px-3 transition-all duration-200",
          "text-sidebar-foreground/70 hover:text-sidebar-foreground",
          "hover:bg-sidebar-accent",
          isActive && [
            "bg-sidebar-primary/20 text-sidebar-primary",
            "hover:bg-sidebar-primary/25 hover:text-sidebar-primary",
            "font-medium",
          ]
        )}
      >
        <Link href={item.url} className="flex items-center gap-3">
          {/* Active indicator bar */}
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-sidebar-primary"
            />
          )}
          <Icon
            className={cn(
              "size-4 transition-transform duration-200 group-hover/nav:scale-110",
              isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
            )}
          />
          <span>{item.title}</span>
          {isActive && (
            <ChevronRight className="ml-auto size-3 text-sidebar-primary/60" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo / Brand */}
      <SidebarHeader className="px-4 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent cursor-default"
            >
              <div className="flex items-center gap-3">
                {/* Leaf icon in a glowing green circle */}
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg shadow-sidebar-primary/30">
                  <Sprout className="size-5 text-white" />
                  {/* Subtle glow ring */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                </div>
                <div className="grid leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground tracking-tight">
                    Tanak Prabha
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">
                    Admin Console
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2">
        {/* Divider label */}
        <div className="px-3 pb-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Main Menu
          </span>
        </div>
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url)
            return <NavLink key={item.title} item={item} isActive={isActive} />
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User section */}
      <SidebarFooter className="px-2 pb-4">
        {/* Subtle separator */}
        <div className="mx-2 mb-3 h-px bg-sidebar-border" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
