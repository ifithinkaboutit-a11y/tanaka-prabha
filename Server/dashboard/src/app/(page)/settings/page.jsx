"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  User, Lock, Bell, Shield, Database, Server,
  Eye, EyeOff, Save, Loader2, CheckCircle2, AlertCircle,
  LogOut, Mail, KeyRound, Monitor, Smartphone, Globe
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { adminApi } from "@/lib/api"

// ─── Section Header ──────
function SectionHeader({ icon: Icon, iconColor, title, description }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`size-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

// ─── Info Row ──────
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const adminEmail = session?.user?.email || "admin@tanakprabha.gov.in"
  const adminToken = session?.accessToken

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Notification preferences (local state — not persisted yet)
  const [notifPrefs, setNotifPrefs] = useState({
    newRegistration: true,
    eventUpdates: true,
    schemeAlerts: false,
    systemAlerts: true,
    emailDigest: false,
  })

  // Password change handler
  async function handleChangePassword(e) {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are required")
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters")
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match")
    }
    if (!adminToken) {
      return toast.error("Session expired. Please log in again.")
    }

    setPasswordLoading(true)
    try {
      await adminApi.changePassword(currentPassword, newPassword, adminToken)
      toast.success("Password updated successfully")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (err) {
      toast.error(err.message || "Failed to update password")
    } finally {
      setPasswordLoading(false)
    }
  }

  function handleLogout() {
    signOut({ callbackUrl: "/login" })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, security, and system preferences.</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="account" className="text-xs">
            <User className="size-3.5 mr-1.5 hidden sm:inline" /> Account
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Lock className="size-3.5 mr-1.5 hidden sm:inline" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            <Bell className="size-3.5 mr-1.5 hidden sm:inline" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs">
            <Server className="size-3.5 mr-1.5 hidden sm:inline" /> System
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ ACCOUNT TAB ═══════════ */}
        <TabsContent value="account" className="mt-6 space-y-6">
          {/* Admin Profile */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={User}
                iconColor="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                title="Admin Profile"
                description="Your admin account information"
              />
              <div className="space-y-0">
                <InfoRow label="Email" value={adminEmail} icon={Mail} />
                <InfoRow label="Role" value={
                  <Badge variant="secondary" className="text-xs capitalize">Administrator</Badge>
                } icon={Shield} />
                <InfoRow label="Session" value={
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <CheckCircle2 className="size-3 mr-1" /> Active
                  </Badge>
                } icon={Monitor} />
                <InfoRow label="Auth Provider" value="Credentials (Email + Password)" icon={KeyRound} />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200/50 dark:border-red-900/30">
            <CardContent className="pt-6">
              <SectionHeader
                icon={AlertCircle}
                iconColor="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                title="Session"
                description="Manage your current session"
              />
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                <div>
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Log out from the admin dashboard</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <LogOut className="size-3.5 mr-1.5" /> Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign Out?</AlertDialogTitle>
                      <AlertDialogDescription>You will be redirected to the login page.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ SECURITY TAB ═══════════ */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Change Password */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Lock}
                iconColor="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                title="Change Password"
                description="Update your admin password"
              />
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowCurrentPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Separator />

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="size-3" /> Passwords do not match
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}>
                  {passwordLoading ? (
                    <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Updating...</>
                  ) : (
                    <><Save className="size-3.5 mr-1.5" /> Update Password</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Shield}
                iconColor="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                title="Security Overview"
                description="Your account security status"
              />
              <div className="space-y-0">
                <InfoRow label="Authentication" value={
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <CheckCircle2 className="size-3 mr-1" /> Enabled
                  </Badge>
                } icon={Shield} />
                <InfoRow label="Session Duration" value="24 hours" icon={Monitor} />
                <InfoRow label="JWT Strategy" value="HS256" icon={KeyRound} />
                <InfoRow label="Password Hashing" value="bcrypt (10 rounds)" icon={Lock} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ NOTIFICATIONS TAB ═══════════ */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Bell}
                iconColor="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
                title="Notification Preferences"
                description="Choose what alerts you receive"
              />
              <div className="space-y-1">
                {[
                  { key: "newRegistration", label: "New Registrations", desc: "Get notified when a new farmer registers", icon: User },
                  { key: "eventUpdates", label: "Event Updates", desc: "Notifications about event registrations and attendance", icon: Monitor },
                  { key: "schemeAlerts", label: "Scheme Alerts", desc: "Content changes, new schemes published", icon: Globe },
                  { key: "systemAlerts", label: "System Alerts", desc: "Server errors, downtime, and critical issues", icon: AlertCircle },
                  { key: "emailDigest", label: "Email Digest", desc: "Weekly summary of dashboard activity via email", icon: Mail },
                ].map(({ key, label, desc, icon: ItemIcon }) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <ItemIcon className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifPrefs[key]}
                      onCheckedChange={(checked) => {
                        setNotifPrefs(p => ({ ...p, [key]: checked }))
                        toast.success(`${label} ${checked ? "enabled" : "disabled"}`)
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                <span>Notification preferences are stored locally in this browser. Server-side notification delivery coming soon.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ SYSTEM TAB ═══════════ */}
        <TabsContent value="system" className="mt-6 space-y-6">
          {/* API Configuration */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Server}
                iconColor="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                title="API Configuration"
                description="Backend server connection details"
              />
              <div className="space-y-0">
                <InfoRow label="API Base URL" value={
                  <code className="text-xs bg-muted px-2 py-1 rounded">{apiUrl}</code>
                } icon={Globe} />
                <InfoRow label="Dashboard Auth" value="API Key + JWT" icon={KeyRound} />
                <InfoRow label="CORS" value="Enabled" icon={Shield} />
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Database}
                iconColor="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400"
                title="Database"
                description="PostgreSQL connection info"
              />
              <div className="space-y-0">
                <InfoRow label="Engine" value="PostgreSQL (Supabase)" icon={Database} />
                <InfoRow label="PostGIS" value="Enabled" icon={Globe} />
                <InfoRow label="Extensions" value="uuid-ossp, postgis" icon={Server} />
              </div>
            </CardContent>
          </Card>

          {/* Platform */}
          <Card>
            <CardContent className="pt-6">
              <SectionHeader
                icon={Smartphone}
                iconColor="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                title="Platform Info"
                description="Application stack details"
              />
              <div className="space-y-0">
                <InfoRow label="Dashboard" value="Next.js 16 + shadcn/ui" icon={Monitor} />
                <InfoRow label="Backend" value="Express.js (Node.js)" icon={Server} />
                <InfoRow label="Mobile App" value="React Native (Expo)" icon={Smartphone} />
                <InfoRow label="File Storage" value="Cloudinary" icon={Globe} />
                <InfoRow label="Email" value="Ethereal SMTP (Dev)" icon={Mail} />
              </div>
            </CardContent>
          </Card>

          {/* Version */}
          <div className="text-center py-4 text-xs text-muted-foreground">
            <p>Tanak Prabha Admin Dashboard v1.0.0</p>
            <p className="mt-0.5">Built with ❤️ for farmer welfare</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
