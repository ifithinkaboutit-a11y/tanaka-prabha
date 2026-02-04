"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { IconLoader2 } from "@tabler/icons-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = React.useState(false)
  const [profileData, setProfileData] = React.useState({
    name: "",
    email: "",
  })
  const [orgData, setOrgData] = React.useState({
    name: "Tanak Prabha NGO",
    phone: "+91 XXXXX XXXXX",
    address: "",
    state: "Assam",
  })
  const [preferences, setPreferences] = React.useState({
    emailNotifications: true,
    smsAlerts: false,
    autoApproveUsers: false,
    maintenanceMode: false,
  })

  React.useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    }
  }, [session])

  async function handleSaveProfile() {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast.success("Profile updated successfully")
  }

  async function handleSaveOrg() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast.success("Organization settings updated")
  }

  async function handleSavePreferences() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast.success("Preferences saved")
  }

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
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account and application preferences.
                </p>
              </div>
              
              <div className="grid gap-6 max-w-2xl">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Update your admin profile information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                {/* Organization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                    <CardDescription>
                      Configure organization-level settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input 
                        id="org-name" 
                        value={orgData.name}
                        onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="org-phone">Contact Phone</Label>
                      <Input 
                        id="org-phone" 
                        value={orgData.phone}
                        onChange={(e) => setOrgData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="org-address">Address</Label>
                      <Input 
                        id="org-address" 
                        placeholder="Enter organization address"
                        value={orgData.address}
                        onChange={(e) => setOrgData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="org-state">State</Label>
                      <Select 
                        value={orgData.state} 
                        onValueChange={(value) => setOrgData(prev => ({ ...prev, state: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Assam">Assam</SelectItem>
                          <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                          <SelectItem value="Manipur">Manipur</SelectItem>
                          <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                          <SelectItem value="Mizoram">Mizoram</SelectItem>
                          <SelectItem value="Nagaland">Nagaland</SelectItem>
                          <SelectItem value="Tripura">Tripura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveOrg} disabled={saving}>
                      {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Update Organization
                    </Button>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Configure notification and system preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email alerts for important events
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive SMS for critical notifications
                        </p>
                      </div>
                      <Switch
                        checked={preferences.smsAlerts}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, smsAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-approve New Users</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically verify new farmer registrations
                        </p>
                      </div>
                      <Switch
                        checked={preferences.autoApproveUsers}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, autoApproveUsers: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Put the mobile app in maintenance mode
                        </p>
                      </div>
                      <Switch
                        checked={preferences.maintenanceMode}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({ ...prev, maintenanceMode: checked }))
                        }
                      />
                    </div>
                    <Button onClick={handleSavePreferences} disabled={saving}>
                      {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export all data</p>
                        <p className="text-sm text-muted-foreground">
                          Download a backup of all farmers and related data.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete all data</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove all farmers and related data.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete all 
                              farmer data, schemes, and related information from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => toast.error("This action is disabled for safety")}
                            >
                              Delete All Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
