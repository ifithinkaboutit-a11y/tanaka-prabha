import { Settings2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your admin account and system preferences.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Settings2 className="size-8 text-muted-foreground/60" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Settings — Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Account settings, notification preferences, and admin management will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
