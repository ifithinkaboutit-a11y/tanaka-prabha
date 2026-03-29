"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  BarChart2,
  Bell,
  Calendar,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Sprout,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react"
import DashboardNavigation from "./nav-main"
import { NavUser } from "./nav-user"
import { NotificationsPopover } from "./nav-notifications"

const dashboardRoutes = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    link: "/",
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: <BarChart2 className="size-4" />,
    link: "/analytics",
  },
  {
    id: "events",
    title: "Events",
    icon: <Calendar className="size-4" />,
    link: "/events",
  },
  {
    id: "appointments",
    title: "Appointments",
    icon: <CalendarCheck className="size-4" />,
    link: "/appointments",
  },
  {
    id: "beneficiaries",
    title: "Beneficiaries",
    icon: <Users className="size-4" />,
    link: "/beneficiaries",
  },
  {
    id: "content",
    title: "Content (CMS)",
    icon: <FileText className="size-4" />,
    link: "/content",
    subs: [
      {
        title: "Schemes & Programs",
        link: "/content",
      },
      {
        title: "Banners",
        link: "/content#banners",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: <Bell className="size-4" />,
    link: "/notifications",
  },
  {
    id: "professionals",
    title: "Professionals",
    icon: <Stethoscope className="size-4" />,
    link: "/professionals",
  },
  {
    id: "users",
    title: "User Management",
    icon: <UserCog className="size-4" />,
    link: "/users",
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "/settings",
  },
]

const sampleNotifications = [
  {
    id: "1",
    avatar: "",
    fallback: "TP",
    text: "New farmer registered.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "",
    fallback: "SY",
    text: "Scheme content updated.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "",
    fallback: "AK",
    text: "Professional marked available.",
    time: "2h ago",
  },
]

export function AppSidebar(props) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="/" className="flex items-center gap-2">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
            <Sprout className="size-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-foreground">
              Tanak Prabha
            </span>
          )}
        </a>

        <div
          className={cn(
            "flex items-center gap-2 transition-opacity duration-300",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
        >
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger aria-label="Toggle sidebar" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>

      <SidebarFooter className="px-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
