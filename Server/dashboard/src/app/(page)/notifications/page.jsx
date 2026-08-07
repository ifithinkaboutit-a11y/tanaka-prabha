"use client"

import * as React from "react"
import { Bell, Send, Users, Trash2, Filter, Search, Pencil, Megaphone, AlertTriangle, Info } from "lucide-react"
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
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationsApi } from "@/lib/api"
import { INDIA_STATES_UTS, DISTRICTS_BY_STATE } from "@/lib/constants"
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

const TYPE_BADGE_CLASS = "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"

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

const EMPTY_FORM = { title: "", message: "", type: "announcement", state: "all", district: "all" }

export default function NotificationsPage() {
    const [broadcasts, setBroadcasts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isComposeOpen, setIsComposeOpen] = React.useState(false)
    const [sending, setSending] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [typeFilter, setTypeFilter] = React.useState("all")
    const [formData, setFormData] = React.useState(EMPTY_FORM)

    // Edit an already-sent broadcast (updates every recipient's copy)
    const [editTarget, setEditTarget] = React.useState(null)
    const [editForm, setEditForm] = React.useState({ title: "", message: "", type: "announcement" })
    const [savingEdit, setSavingEdit] = React.useState(false)
    const [deleteTarget, setDeleteTarget] = React.useState(null)

    React.useEffect(() => {
        loadBroadcasts()
    }, [])

    async function loadBroadcasts() {
        setLoading(true)
        try {
            const res = await notificationsApi.getBroadcasts({ limit: 100 })
            const list = res.data?.broadcasts ?? []
            setBroadcasts(Array.isArray(list) ? list : [])
        } catch (error) {
            console.error("Error loading broadcasts:", error)
            toast.error(error.message || "Failed to load sent notifications")
            setBroadcasts([])
        } finally {
            setLoading(false)
        }
    }

    // Districts available for the chosen state; "all" means every district.
    const availableDistricts = React.useMemo(() => {
        if (formData.state === "all") return []
        return DISTRICTS_BY_STATE[formData.state] || []
    }, [formData.state])

    function updateForm(patch) {
        setFormData(prev => {
            const next = { ...prev, ...patch }
            // Changing state invalidates any district picked under the old one
            if (patch.state !== undefined) next.district = "all"
            return next
        })
    }

    async function handleSendBroadcast() {
        if (!formData.title || !formData.message) {
            toast.error("Please enter both title and message")
            return
        }

        setSending(true)
        try {
            await notificationsApi.broadcast({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                district: formData.district === "all" ? null : formData.district,
            })

            setIsComposeOpen(false)
            setFormData(EMPTY_FORM)
            toast.success("Broadcast sent")
            // Re-read from the server so recipient counts are the real ones.
            await loadBroadcasts()
        } catch (error) {
            console.error("Error sending broadcast:", error)
            toast.error(error.message || "Failed to send broadcast")
        } finally {
            setSending(false)
        }
    }

    function openEdit(broadcast) {
        setEditTarget(broadcast)
        setEditForm({
            title: broadcast.title ?? "",
            message: broadcast.message ?? "",
            type: broadcast.type ?? "announcement",
        })
    }

    async function handleSaveEdit() {
        if (!editForm.title || !editForm.message) {
            toast.error("Please enter both title and message")
            return
        }
        setSavingEdit(true)
        try {
            await notificationsApi.updateBroadcast(editTarget.broadcast_id, editForm)
            setBroadcasts(prev => prev.map(b =>
                b.broadcast_id === editTarget.broadcast_id ? { ...b, ...editForm } : b
            ))
            setEditTarget(null)
            toast.success("Broadcast updated for all recipients")
        } catch (error) {
            toast.error(error.message || "Failed to update broadcast")
        } finally {
            setSavingEdit(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            await notificationsApi.deleteBroadcast(deleteTarget.broadcast_id)
            setBroadcasts(prev => prev.filter(b => b.broadcast_id !== deleteTarget.broadcast_id))
            toast.success("Broadcast recalled")
        } catch (error) {
            toast.error(error.message || "Failed to recall broadcast")
        } finally {
            setDeleteTarget(null)
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
                (b.title || "").toLowerCase().includes(q) ||
                (b.message || "").toLowerCase().includes(q)
            )
        }

        return result
    }, [broadcasts, typeFilter, searchQuery])

    const stats = React.useMemo(() => ({
        total: broadcasts.length,
        announcements: broadcasts.filter(b => b.type === "announcement").length,
        alerts: broadcasts.filter(b => b.type === "alert").length,
        info: broadcasts.filter(b => b.type === "info").length,
        totalRecipients: broadcasts.reduce((sum, b) => sum + (b.recipients_count || 0), 0),
    }), [broadcasts])

    if (loading) {
        return (
            <div role="status" aria-label="Loading" className="flex flex-col py-6 px-4 lg:px-6 gap-6">
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
                        <Button onClick={() => { setFormData(EMPTY_FORM); setIsComposeOpen(true) }}>
                            <Send className="size-4 mr-2" />
                            New Broadcast
                        </Button>
                    </div>
                </div>

                {/* Compose dialog */}
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                    <DialogContent className="w-full sm:max-w-2xl overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Compose Broadcast</DialogTitle>
                            <DialogDescription>
                                Send a notification to all registered farmers or to one district.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="broadcast-title">Subject</Label>
                                <Input
                                    id="broadcast-title"
                                    placeholder="e.g., Important Update"
                                    value={formData.title}
                                    onChange={(e) => updateForm({ title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="broadcast-message">Description</Label>
                                <Textarea
                                    id="broadcast-message"
                                    placeholder="Write your broadcast message..."
                                    value={formData.message}
                                    onChange={(e) => updateForm({ message: e.target.value })}
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="broadcast-type">Notification Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => updateForm({ type: value })}
                                >
                                    <SelectTrigger id="broadcast-type">
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

                            {/* Target audience — state then district, covering every
                                state/UT rather than a hardcoded handful. */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Target Audience</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="broadcast-state">State</Label>
                                        <Select
                                            value={formData.state}
                                            onValueChange={(value) => updateForm({ state: value })}
                                        >
                                            <SelectTrigger id="broadcast-state">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[260px]">
                                                <SelectItem value="all">All States</SelectItem>
                                                {INDIA_STATES_UTS.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="broadcast-district">District</Label>
                                        <Select
                                            value={formData.district}
                                            onValueChange={(value) => updateForm({ district: value })}
                                            disabled={formData.state === "all"}
                                        >
                                            <SelectTrigger id="broadcast-district">
                                                <SelectValue
                                                    placeholder={formData.state === "all" ? "All districts" : "Select district"}
                                                />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[260px]">
                                                <SelectItem value="all">All Districts</SelectItem>
                                                {availableDistricts.map(d => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formData.district === "all"
                                        ? "Every registered farmer will receive this."
                                        : `Only farmers registered in ${formData.district} will receive this.`}
                                </p>
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
                                    <Button onClick={() => { setFormData(EMPTY_FORM); setIsComposeOpen(true) }}>
                                        <Send className="size-4 mr-2" />
                                        New Broadcast
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredBroadcasts.map((broadcast) => (
                            <Card key={broadcast.broadcast_id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getTypeIcon(broadcast.type)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Subject */}
                                                    <CardTitle className="text-base">
                                                        {broadcast.title || "(no subject)"}
                                                    </CardTitle>
                                                    <Badge variant="outline" className={`capitalize text-xs ${TYPE_BADGE_CLASS}`}>
                                                        {broadcast.type}
                                                    </Badge>
                                                </div>
                                                {/* Description */}
                                                <CardDescription className="text-sm leading-relaxed whitespace-pre-line">
                                                    {broadcast.message || "(no description)"}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => openEdit(broadcast)}
                                                aria-label="Edit broadcast"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive"
                                                onClick={() => setDeleteTarget(broadcast)}
                                                aria-label="Recall broadcast"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
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
                                        <span>{broadcast.district || "All districts"}</span>
                                    </div>
                                    <span>{broadcast.read_count ?? 0} read</span>
                                    <div className="ml-auto">
                                        {formatDate(broadcast.sent_at)}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="w-full sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Broadcast</DialogTitle>
                        <DialogDescription>
                            Changes apply to every recipient&apos;s copy. Push notifications
                            already delivered to a device cannot be changed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Subject</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-message">Description</Label>
                            <Textarea
                                id="edit-message"
                                rows={5}
                                value={editForm.message}
                                onChange={(e) => setEditForm(f => ({ ...f, message: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Notification Type</Label>
                            <Select
                                value={editForm.type}
                                onValueChange={(value) => setEditForm(f => ({ ...f, type: value }))}
                            >
                                <SelectTrigger id="edit-type">
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
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setEditTarget(null)} disabled={savingEdit}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={savingEdit}>
                            {savingEdit ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Recall confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Recall this broadcast?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This deletes the notification from all {deleteTarget?.recipients_count ?? 0} recipients&apos;
                            inboxes. Push notifications already delivered to a device are unaffected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Recall
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
