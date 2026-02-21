"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { IconBell } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const pageMeta = {
  "/": { title: "Dashboard", subtitle: "Overview & insights" },
  "/beneficiaries": { title: "Beneficiaries", subtitle: "Manage registered farmers" },
  "/professionals": { title: "Professionals", subtitle: "Agricultural experts directory" },
  "/content": { title: "Content Management", subtitle: "Schemes, banners & announcements" },
  "/notifications": { title: "Notifications", subtitle: "Broadcast & manage alerts" },
  "/settings": { title: "Settings", subtitle: "System configuration" },
}

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  return now
}

export function SiteHeader() {
  const pathname = usePathname()
  const now = useNow()

  // Match the most specific route prefix
  const meta =
    Object.entries(pageMeta)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname === path || pathname.startsWith(path + "/"))
    ?.[1] || { title: "Dashboard", subtitle: "" }

  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full items-center gap-3 border-b px-4",
        // Glassmorphism header
        "backdrop-blur-xl bg-background/80 border-border/60",
        // Subtle top glow line
        "before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-linear-to-r before:from-transparent before:via-primary/40 before:to-transparent"
      )}
    >
      {/* Sidebar trigger */}
      <SidebarTrigger
        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      />

      <Separator orientation="vertical" className="h-5 opacity-40" />

      {/* Page title */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-sm font-semibold leading-tight text-foreground truncate">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-xs text-muted-foreground/70 leading-tight hidden sm:block">
            {meta.subtitle}
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side controls */}
      <div className="flex items-center gap-1.5">
        {/* Date/time pill — desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/50 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{timeStr}</span>
          <span className="h-3 w-px bg-border" />
          <span>{dateStr}</span>
        </div>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative size-8 rounded-lg group">
            <IconBell className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
          </Button>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
