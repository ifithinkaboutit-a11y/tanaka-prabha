"use client"

import * as React from "react"
import {
    ArrowLeft, Calendar, Clock, MapPin, Users, UserPlus, Check, X,
    FileText, ShieldCheck, ImageIcon, Pencil, Trash2, Phone, Star, Save
} from "lucide-react"
import { useRouter } from "next/navigation"
import { eventsApi, professionalsApi } from "@/lib/api"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ─── Helpers ────────────────────────────────────────────────────────
function getInitials(name) {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"
}
function fmtDate(d) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
}
function fmtTime(t) { return t ? t.slice(0, 5) : "—" }
const statusColors = {
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ongoing: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    completed: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
    cancelled: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
}

// ─── Loading Skeleton ───────────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6 gap-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64 md:col-span-2" />
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function EventDetailsPage({ params: paramsPromise }) {
    const params = React.use(paramsPromise)
    const { id } = params
    const router = useRouter()

    const [event, setEvent] = React.useState(null)
    const [participants, setParticipants] = React.useState([])
    const [allProfessionals, setAllProfessionals] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    // Edit mode
    const [isEditing, setIsEditing] = React.useState(false)
    const [editData, setEditData] = React.useState({})

    // Register form
    const [regName, setRegName] = React.useState("")
    const [regPhone, setRegPhone] = React.useState("")

    // Mentor dialog
    const [mentorDialogOpen, setMentorDialogOpen] = React.useState(false)
    const [selectedProfessionalId, setSelectedProfessionalId] = React.useState("")

    // ── Data fetching ──
    React.useEffect(() => { fetchData() }, [id])

    async function fetchData() {
        try {
            setLoading(true)
            const [evRes, partRes, proRes] = await Promise.all([
                eventsApi.getById(id),
                eventsApi.getParticipants(id),
                professionalsApi.getAll({}).catch(() => ({ data: { professionals: [] } })),
            ])
            const ev = evRes.data?.event
            setEvent(ev)
            setEditData(ev || {})
            setParticipants(partRes.data?.participants || [])

            const pros = proRes.data?.professionals || proRes.data || []
            setAllProfessionals(Array.isArray(pros) ? pros : [])
        } catch (err) {
            toast.error("Failed to fetch event data")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // ── Actions ──
    async function handleMarkAttendance(mobileNumber) {
        try {
            await eventsApi.markAttendance(id, { mobile_number: mobileNumber })
            toast.success("Attendance marked")
            fetchData()
        } catch { toast.error("Failed to mark attendance") }
    }

    async function handleManualRegister(e) {
        e.preventDefault()
        if (!regPhone) return toast.error("Phone number is required")
        try {
            await eventsApi.markAttendance(id, { mobile_number: regPhone, name: regName })
            toast.success("Participant added")
            setRegName(""); setRegPhone("")
            fetchData()
        } catch { toast.error("Failed to add participant") }
    }

    async function handleSaveEdit() {
        try {
            const payload = {
                title: editData.title,
                description: editData.description,
                date: editData.date?.split("T")[0],
                start_time: editData.start_time,
                end_time: editData.end_time,
                location_name: editData.location_name,
                location_address: editData.location_address,
                guidelines_and_rules: editData.guidelines_and_rules,
                requirements: editData.requirements,
                hero_image_url: editData.hero_image_url,
                status: editData.status,
                instructors: editData.instructors,
            }
            await eventsApi.update(id, payload)
            toast.success("Event updated")
            setIsEditing(false)
            fetchData()
        } catch { toast.error("Failed to update event") }
    }

    async function handleDeleteEvent() {
        try {
            await eventsApi.delete(id)
            toast.success("Event deleted")
            router.push("/events")
        } catch { toast.error("Failed to delete event") }
    }

    async function handleStatusChange(newStatus) {
        try {
            await eventsApi.update(id, { status: newStatus })
            toast.success(`Status updated to ${newStatus}`)
            fetchData()
        } catch { toast.error("Failed to update status") }
    }

    // ── Mentor Management ──
    function getInstructors() {
        if (!event?.instructors) return []
        if (typeof event.instructors === "string") {
            try { return JSON.parse(event.instructors) } catch { return [] }
        }
        return Array.isArray(event.instructors) ? event.instructors : []
    }

    async function handleAddMentor() {
        if (!selectedProfessionalId) return
        const pro = allProfessionals.find(p => p.id === selectedProfessionalId)
        if (!pro) return

        const current = getInstructors()
        if (current.some(i => i.id === pro.id)) {
            return toast.error("This professional is already a mentor")
        }

        const updated = [...current, {
            id: pro.id,
            name: pro.name,
            role: pro.role,
            phone: pro.phone_number,
            image_url: pro.image_url,
        }]

        try {
            await eventsApi.update(id, { instructors: updated })
            toast.success(`${pro.name} added as mentor`)
            setSelectedProfessionalId("")
            setMentorDialogOpen(false)
            fetchData()
        } catch { toast.error("Failed to add mentor") }
    }

    async function handleRemoveMentor(mentorId) {
        const current = getInstructors()
        const updated = current.filter(i => i.id !== mentorId)
        try {
            await eventsApi.update(id, { instructors: updated })
            toast.success("Mentor removed")
            fetchData()
        } catch { toast.error("Failed to remove mentor") }
    }

    // ── Render ──
    if (loading) return <LoadingSkeleton />

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Calendar className="size-12 text-muted-foreground/30" />
                <p className="text-lg font-medium">Event not found</p>
                <Button variant="outline" onClick={() => router.push("/events")}>
                    <ArrowLeft className="size-4 mr-2" /> Back to Events
                </Button>
            </div>
        )
    }

    const instructors = getInstructors()
    const presentCount = participants.filter(p => p.status === "attended").length
    const registeredCount = participants.length

    return (
        <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6 gap-6">
            {/* ── Back + Title Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/events")}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {fmtDate(event.date)} · {event.location_name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`capitalize ${statusColors[event.status] || ""}`}>{event.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setEditData({ ...event }); setIsEditing(true) }}>
                        <Pencil className="size-3.5 mr-1.5" /> Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="size-3.5 mr-1.5" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete &quot;{event.title}&quot; and all participant data.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* ── Hero Image ── */}
            {event.hero_image_url && (
                <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
                    <img src={event.hero_image_url} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            )}

            {/* ── Stats Overview ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Calendar className="size-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmtDate(event.date).split(",")[0]}</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Date</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200/50 dark:border-violet-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Clock className="size-5 mx-auto text-violet-600 dark:text-violet-400 mb-1" />
                        <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{fmtTime(event.start_time)} - {fmtTime(event.end_time)}</p>
                        <p className="text-xs text-violet-600/70 dark:text-violet-400/70 font-medium">Time</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Users className="size-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{registeredCount}</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Registered</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Check className="size-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{presentCount}</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">Present</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* ── Left Column: Event Info + Mentors ── */}
                <div className="space-y-6">
                    {/* Event Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-base">Event Info</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {event.description && (
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Description</p>
                                    <p className="leading-relaxed">{event.description}</p>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-start gap-2">
                                <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">{event.location_name}</p>
                                    {event.location_address && <p className="text-muted-foreground text-xs">{event.location_address}</p>}
                                </div>
                            </div>
                            {event.requirements && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Requirements</p>
                                        <p className="leading-relaxed">{event.requirements}</p>
                                    </div>
                                </>
                            )}
                            {event.guidelines_and_rules && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Guidelines & Rules</p>
                                        <p className="leading-relaxed whitespace-pre-line">{event.guidelines_and_rules}</p>
                                    </div>
                                </>
                            )}
                            <Separator />
                            {/* Status Change */}
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {["upcoming", "ongoing", "completed", "cancelled"].map(s => (
                                        <Button
                                            key={s}
                                            variant={event.status === s ? "default" : "outline"}
                                            size="sm"
                                            className="capitalize text-xs h-7"
                                            onClick={() => handleStatusChange(s)}
                                            disabled={event.status === s}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Mentors / Instructors Card ── */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                        <Star className="size-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Mentors & Instructors</CardTitle>
                                        <CardDescription>{instructors.length} assigned</CardDescription>
                                    </div>
                                </div>
                                <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <UserPlus className="size-3.5 mr-1.5" /> Add
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Mentor</DialogTitle>
                                            <DialogDescription>Select a professional to assign as a mentor for this event.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a professional..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allProfessionals
                                                        .filter(p => !instructors.some(i => i.id === p.id))
                                                        .map(pro => (
                                                            <SelectItem key={pro.id} value={pro.id}>
                                                                {pro.name} — {pro.role}
                                                            </SelectItem>
                                                        ))}
                                                    {allProfessionals.filter(p => !instructors.some(i => i.id === p.id)).length === 0 && (
                                                        <SelectItem value="__none" disabled>No professionals available</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>

                                            {selectedProfessionalId && (() => {
                                                const pro = allProfessionals.find(p => p.id === selectedProfessionalId)
                                                if (!pro) return null
                                                return (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={pro.image_url} />
                                                            <AvatarFallback>{getInitials(pro.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{pro.name}</p>
                                                            <p className="text-xs text-muted-foreground">{pro.role} · {pro.district}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                            <Button onClick={handleAddMentor} disabled={!selectedProfessionalId}>Add Mentor</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {instructors.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Star className="size-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No mentors assigned yet</p>
                                    <p className="text-xs mt-1">Click &quot;Add&quot; to assign professionals</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {instructors.map((mentor) => (
                                        <div key={mentor.id || mentor.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border group">
                                            <Avatar className="size-10">
                                                <AvatarImage src={mentor.image_url} />
                                                <AvatarFallback className="text-xs">{getInitials(mentor.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{mentor.name}</p>
                                                <p className="text-xs text-muted-foreground">{mentor.role}</p>
                                            </div>
                                            {mentor.phone && (
                                                <a href={`tel:${mentor.phone}`} className="text-muted-foreground hover:text-primary">
                                                    <Phone className="size-3.5" />
                                                </a>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="size-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Mentor?</AlertDialogTitle>
                                                        <AlertDialogDescription>Remove {mentor.name} from this event&apos;s mentor list?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveMentor(mentor.id)} className="bg-red-600 hover:bg-red-700">
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* On-Spot Registration */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                    <UserPlus className="size-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">On-Spot Registration</CardTitle>
                                    <CardDescription>Add walk-in participants</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleManualRegister} className="space-y-3">
                                <div>
                                    <Label className="text-xs">Phone Number *</Label>
                                    <Input placeholder="Enter mobile number" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                                </div>
                                <div>
                                    <Label className="text-xs">Name (Optional)</Label>
                                    <Input placeholder="Enter full name" value={regName} onChange={e => setRegName(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full" size="sm">
                                    <UserPlus className="size-3.5 mr-1.5" /> Add & Mark Present
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Participants ── */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                    <Users className="size-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Participants</CardTitle>
                                    <CardDescription>{registeredCount} total · {presentCount} present</CardDescription>
                                </div>
                            </div>
                            {registeredCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {Math.round((presentCount / registeredCount) * 100)}% attendance
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {participants.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="size-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">No participants yet</p>
                                <p className="text-xs mt-1">Use the registration form to add participants</p>
                            </div>
                        ) : (
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-xs">Participant</TableHead>
                                            <TableHead className="text-xs">Phone</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-xs text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {participants.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={p.photo_url} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(p.name || "?")}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-sm">{p.name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{p.mobile_number || "—"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={p.status === "attended" ? "default" : "secondary"} className="capitalize text-xs">
                                                        {p.status === "attended" ? "✓ Present" : p.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {p.status !== "attended" && (
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkAttendance(p.mobile_number)}>
                                                            <Check className="size-3 mr-1" /> Mark Present
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ═══ Edit Dialog ═══ */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="overflow-y-auto sm:max-w-xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>Update event details below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea rows={3} value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={editData.date?.split("T")[0] || ""} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Location Name</Label>
                                <Input value={editData.location_name || ""} onChange={e => setEditData({ ...editData, location_name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={editData.start_time || ""} onChange={e => setEditData({ ...editData, start_time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={editData.end_time || ""} onChange={e => setEditData({ ...editData, end_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Location Address</Label>
                            <Input value={editData.location_address || ""} onChange={e => setEditData({ ...editData, location_address: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Guidelines & Rules</Label>
                            <Textarea rows={3} value={editData.guidelines_and_rules || ""} onChange={e => setEditData({ ...editData, guidelines_and_rules: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Requirements</Label>
                            <Textarea rows={2} value={editData.requirements || ""} onChange={e => setEditData({ ...editData, requirements: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Hero Image URL</Label>
                            <Input value={editData.hero_image_url || ""} onChange={e => setEditData({ ...editData, hero_image_url: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveEdit}>
                            <Save className="size-3.5 mr-1.5" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
