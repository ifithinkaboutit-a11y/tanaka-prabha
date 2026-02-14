"use client"

import * as React from "react"
import {
  IconSend,
  IconBell,
  IconUsers,
  IconFilter,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationsApi } from "@/lib/api"
import { toast } from "sonner"

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    message: "",
    type: "announcement",
    district: "all",
  })

  // Mock announcements for demo (in production, these would come from a separate announcements table)
  React.useEffect(() => {
    // Simulating fetch
    setTimeout(() => {
      setAnnouncements([
        {
          id: 1,
          title: "New Scheme Launched",
          message: "PM Kisan Samman Nidhi has been updated with new benefits. Apply now!",
          type: "announcement",
          sent_to: "all",
          sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          recipients_count: 1250,
        },
        {
          id: 2,
          title: "Weather Alert",
          message: "Heavy rainfall expected in Kamrup and Jorhat districts. Take necessary precautions.",
          type: "alert",
          sent_to: "Kamrup, Jorhat",
          sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          recipients_count: 450,
        },
        {
          id: 3,
          title: "Training Program",
          message: "Free agricultural training program starting next week. Register through the app.",
          type: "info",
          sent_to: "all",
          sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          recipients_count: 1250,
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  async function handleSendAnnouncement() {
    if (!formData.title || !formData.message) {
      toast.error("Please enter title and message")
      return
    }

    setSending(true)
    try {
      // In production, this would call the notifications API
      const response = await notificationsApi.sendBulk({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        district: formData.district === "all" ? null : formData.district,
      })

      // Add to local state
      const newAnnouncement = {
        id: Date.now(),
        ...formData,
        sent_to: formData.district === "all" ? "all" : formData.district,
        sent_at: new Date().toISOString(),
        recipients_count: response.data?.sent_count || Math.floor(Math.random() * 500) + 100,
      }
      setAnnouncements(prev => [newAnnouncement, ...prev])
      
      setIsAddOpen(false)
      resetForm()
      toast.success(`Announcement sent to ${newAnnouncement.recipients_count} users`)
    } catch (error) {
      console.error("Error sending announcement:", error)
      toast.error("Failed to send announcement")
    } finally {
      setSending(false)
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      message: "",
      type: "announcement",
      district: "all",
    })
  }

  function getTypeColor(type) {
    switch (type) {
      case "alert":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400"
      case "announcement":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
      case "info":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
      default:
        return ""
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-lg font-semibold">Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Send notifications and alerts to farmers
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button onClick={resetForm}>
              <IconSend className="size-4 mr-2" />
              Send Announcement
            </Button>
          </SheetTrigger>
          <SheetContent className="px-4 w-full">
            <SheetHeader>
              <SheetTitle>New Announcement</SheetTitle>
              <SheetDescription>
                Send a notification to registered farmers.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="e.g., Important Update"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-message">Message</Label>
                <Textarea
                  id="announcement-message"
                  placeholder="Enter your announcement message..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-district">Target Audience</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Kamrup">Kamrup</SelectItem>
                    <SelectItem value="Jorhat">Jorhat</SelectItem>
                    <SelectItem value="Dibrugarh">Dibrugarh</SelectItem>
                    <SelectItem value="Sivasagar">Sivasagar</SelectItem>
                    <SelectItem value="Tezpur">Tezpur</SelectItem>
                    <SelectItem value="Nagaon">Nagaon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button onClick={handleSendAnnouncement} className="w-full" disabled={sending}>
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <IconSend className="size-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconBell className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Send your first announcement to farmers
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <IconSend className="size-4 mr-2" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{announcement.title}</CardTitle>
                      <Badge variant="outline" className={`capitalize ${getTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {announcement.message}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-2 text-xs text-muted-foreground flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <IconUsers className="size-3.5" />
                  <span>{announcement.recipients_count} recipients</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconFilter className="size-3.5" />
                  <span>{announcement.sent_to === "all" ? "All districts" : announcement.sent_to}</span>
                </div>
                <div className="ml-auto">
                  Sent {formatDate(announcement.sent_at)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
