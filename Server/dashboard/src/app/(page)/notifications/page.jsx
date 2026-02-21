"use client"

import * as React from "react"
import { Bell, Send, Users, Trash2, Filter, Search, CheckCheck, Megaphone, AlertTriangle, Info } from "lucide-react"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationsApi, usersApi } from "@/lib/api"
import { toast } from "sonner"

function getTypeIcon(type) {
    switch (type) {
        case "alert": return <AlertTriangle className="size-4 text-zinc-500" />
        case "announcement": return <Megaphone className="size-4 text-zinc-500" />
        case "info": return <Info className="size-4 text-zinc-500" />
        case "reminder": return <Bell className="size-4 text-zinc-500" />
        default: return <Bell className="size-4 text-muted-foreground" />
    }
}

function getTypeBadgeClass(type) {
    switch (type) {
        case "alert": return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"
        case "announcement": return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"
        case "info": return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"
        case "reminder": return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"
        default: return ""
    }
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function NotificationsPage() {
    const [broadcasts, setBroadcasts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isComposeOpen, setIsComposeOpen] = React.useState(false)
    const [sending, setSending] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState("all")
    const [formData, setFormData] = React.useState({
        title: "",
        message: "",
        type: "announcement",
        district: "all",
    })

    // Load existing announcements (stored locally since we don't have an admin announcements table)
    React.useEffect(() => {
        loadBroadcasts()
    }, [])

    async function loadBroadcasts() {
        // For now, seed with mock data if empty — in production, you'd have an admin_broadcasts table
        setTimeout(() => {
            setBroadcasts([
                {
                    id: 1,
                    title: "New Scheme Launched",
                    message: "PM Kisan Samman Nidhi has been updated with new benefits. Apply now through the app!",
                    type: "announcement",
                    district: "all",
                    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    recipients_count: 24,
                },
                {
                    id: 2,
                    title: "Weather Alert — Heavy Rainfall",
                    message: "Heavy rainfall expected in Kamrup and Jorhat districts over the next 48 hours. Take necessary precautions for crop protection.",
                    type: "alert",
                    district: "Kamrup, Jorhat",
                    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    recipients_count: 12,
                },
                {
                    id: 3,
                    title: "Free Agricultural Training",
                    message: "Free agricultural training program starting next week at District Agricultural Office. Register through the app.",
                    type: "info",
                    district: "all",
                    sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    recipients_count: 24,
                },
            ])
            setLoading(false)
        }, 400)
    }

    async function handleSendBroadcast() {
        if (!formData.title || !formData.message) {
            toast.error("Please enter both title and message")
            return
        }

        setSending(true)
        try {
            const response = await notificationsApi.broadcast({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                district: formData.district === "all" ? null : formData.district,
            })

            const sentCount = response.data?.sent_count || response.data?.count || 0

            const newBroadcast = {
                id: Date.now(),
                ...formData,
                district: formData.district === "all" ? "all" : formData.district,
                sent_at: new Date().toISOString(),
                recipients_count: sentCount,
            }
            setBroadcasts(prev => [newBroadcast, ...prev])

            setIsComposeOpen(false)
            setFormData({ title: "", message: "", type: "announcement", district: "all" })
            toast.success(`Broadcast sent to ${sentCount} farmers`)
        } catch (error) {
            console.error("Error sending broadcast:", error)
            toast.error(error.message || "Failed to send broadcast")
        } finally {
            setSending(false)
        }
    }

    const filteredBroadcasts = React.useMemo(() => {
        let result = broadcasts

        if (typeFilter !== "all") {
            result = result.filter(b => b.type === typeFilter)
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.message.toLowerCase().includes(q)
            )
        }

        return result
    }, [broadcasts, typeFilter, searchQuery])

    // Stats
    const stats = React.useMemo(() => ({
        total: broadcasts.length,
        announcements: broadcasts.filter(b => b.type === "announcement").length,
        alerts: broadcasts.filter(b => b.type === "alert").length,
        info: broadcasts.filter(b => b.type === "info").length,
        totalRecipients: broadcasts.reduce((sum, b) => sum + (b.recipients_count || 0), 0),
    }), [broadcasts])

    if (loading) {
        return (
            <div className="flex flex-col py-6 px-4 lg:px-6 gap-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col py-6 md:py-8 gap-6 md:gap-8">
                {/* Stats Cards */}
                <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Broadcasts</CardDescription>
                            <CardTitle className="text-2xl">{stats.total}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                Sent to {stats.totalRecipients} total recipients
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Announcements</CardDescription>
                            <CardTitle className="text-2xl text-zinc-600">{stats.announcements}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Megaphone className="size-3" /> General updates
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Alerts</CardDescription>
                            <CardTitle className="text-2xl text-zinc-600">{stats.alerts}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <AlertTriangle className="size-3" /> Urgent notices
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Information</CardDescription>
                            <CardTitle className="text-2xl text-zinc-600">{stats.info}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Info className="size-3" /> Helpful info
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search broadcasts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[160px]">
                            <Filter className="size-4 mr-2" />
                            <SelectValue placeholder="Filter type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="announcement">Announcements</SelectItem>
                            <SelectItem value="alert">Alerts</SelectItem>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="reminder">Reminders</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="ml-auto">
                        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Send className="size-4 mr-2" />
                                    New Broadcast
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="px-4 w-full sm:max-w-md overflow-y-auto max-h-[85vh]">
                                <DialogHeader>
                                    <DialogTitle>Compose Broadcast</DialogTitle>
                                    <DialogDescription>
                                        Send a notification to all registered farmers or a specific district.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="broadcast-title">Title</Label>
                                        <Input
                                            id="broadcast-title"
                                            placeholder="e.g., Important Update"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="broadcast-message">Message</Label>
                                        <Textarea
                                            id="broadcast-message"
                                            placeholder="Write your broadcast message..."
                                            value={formData.message}
                                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                            rows={5}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notification Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="announcement">📢 Announcement</SelectItem>
                                                <SelectItem value="alert">⚠️ Alert</SelectItem>
                                                <SelectItem value="info">ℹ️ Information</SelectItem>
                                                <SelectItem value="reminder">🔔 Reminder</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <Select
                                            value={formData.district}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select audience" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Districts</SelectItem>
                                                <SelectItem value="Kamrup">Kamrup</SelectItem>
                                                <SelectItem value="Jorhat">Jorhat</SelectItem>
                                                <SelectItem value="Dibrugarh">Dibrugarh</SelectItem>
                                                <SelectItem value="Sivasagar">Sivasagar</SelectItem>
                                                <SelectItem value="Nagaon">Nagaon</SelectItem>
                                                <SelectItem value="Tinsukia">Tinsukia</SelectItem>
                                                <SelectItem value="Sonitpur">Sonitpur</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button onClick={handleSendBroadcast} className="w-full" disabled={sending}>
                                        {sending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Send className="size-4 mr-2" />
                                                Send Broadcast
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Broadcasts List */}
                <div className="px-4 lg:px-6 space-y-4">
                    {filteredBroadcasts.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Bell className="size-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No broadcasts yet</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {searchQuery || typeFilter !== "all"
                                        ? "No broadcasts match your filters"
                                        : "Send your first broadcast to registered farmers"}
                                </p>
                                {!searchQuery && typeFilter === "all" && (
                                    <Button onClick={() => setIsComposeOpen(true)}>
                                        <Send className="size-4 mr-2" />
                                        New Broadcast
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredBroadcasts.map((broadcast) => (
                            <Card key={broadcast.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getTypeIcon(broadcast.type)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <CardTitle className="text-base">{broadcast.title}</CardTitle>
                                                    <Badge variant="outline" className={`capitalize text-xs ${getTypeBadgeClass(broadcast.type)}`}>
                                                        {broadcast.type}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="text-sm leading-relaxed">
                                                    {broadcast.message}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Users className="size-3.5" />
                                        <span>{broadcast.recipients_count} recipients</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Filter className="size-3.5" />
                                        <span>{broadcast.district === "all" ? "All districts" : broadcast.district}</span>
                                    </div>
                                    <div className="ml-auto">
                                        {formatDate(broadcast.sent_at)}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
