"use client"

import * as React from "react"
import { IconPlus, IconCalendarEvent, IconUsers, IconClock, IconCheck } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { eventsApi } from "@/lib/api"
import { toast } from "sonner"
import { LocalizedContentEditor } from "@/components/cms/LocalizedContentEditor"
import { ProgrammeGallery } from "@/components/programme-gallery"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { MediaUploader } from "@/components/media-uploader"

const EVENT_FIELDS = [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "guidelines_and_rules", label: "Guidelines & Rules", type: "textarea" },
    { key: "requirements", label: "Requirements", type: "textarea" },
]

// Compute live status based on current time (same logic as mobile app)
function computeEventStatus(event) {
    if (event.status === "cancelled") return "cancelled"
    if (!event.date) return event.status || "upcoming"
    const dateStr = event.date.split("T")[0]
    const start = new Date(`${dateStr}T${event.start_time || "00:00:00"}`)
    const end = new Date(`${dateStr}T${event.end_time || "23:59:59"}`)
    const now = new Date()
    if (now < start) return "upcoming"
    if (now >= start && now <= end) return "ongoing"
    return "completed"
}

const STATUS_BADGE = {
    upcoming: { label: "Upcoming", variant: "default", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    ongoing: { label: "Ongoing", variant: "default", color: "bg-amber-100 text-amber-800 border-amber-200" },
    completed: { label: "Completed", variant: "secondary", color: "bg-gray-100 text-gray-600 border-gray-200" },
    cancelled: { label: "Cancelled", variant: "destructive", color: "bg-red-100 text-red-700 border-red-200" },
}

const emptyForm = {
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    date: "",
    start_time: "",
    end_time: "",
    location_name: "",
    location_address: "",
    guidelines_and_rules: "",
    guidelines_and_rules_hi: "",
    requirements: "",
    requirements_hi: "",
    hero_image_url: "",
    status: "upcoming",
    outcome: "",
    media_urls: [],
}

export default function EventsPage() {
    const [events, setEvents] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [formData, setFormData] = React.useState(emptyForm)
    const [galleryEvent, setGalleryEvent] = React.useState(null)
    const router = useRouter()

    React.useEffect(() => {
        fetchEvents()
    }, [])

    async function fetchEvents() {
        try {
            setLoading(true)
            // Fetch up to 200 events to ensure all are shown
            const res = await eventsApi.getAll({ limit: 200, offset: 0 })
            setEvents(res.data?.events || [])
        } catch (err) {
            toast.error("Failed to fetch events")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAdd(e) {
        e.preventDefault()
        if (!formData.title_hi?.trim()) {
            toast.error("Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)")
            return
        }
        try {
            await eventsApi.create(formData)
            toast.success("Event created successfully")
            setIsAddOpen(false)
            fetchEvents()
            setFormData(emptyForm)
        } catch (err) {
            toast.error("Failed to create event")
            console.error(err)
        }
    }

    // Split and sort events
    const upcomingEvents = React.useMemo(() => {
        return events
            .filter(ev => {
                const s = computeEventStatus(ev)
                return s === "upcoming" || s === "ongoing"
            })
            .sort((a, b) => {
                const dA = new Date(`${a.date?.split("T")[0]}T${a.start_time || "00:00:00"}`).getTime()
                const dB = new Date(`${b.date?.split("T")[0]}T${b.start_time || "00:00:00"}`).getTime()
                return dA - dB
            })
    }, [events])

    const pastEvents = React.useMemo(() => {
        return events
            .filter(ev => {
                const s = computeEventStatus(ev)
                return s === "completed" || s === "cancelled"
            })
            .sort((a, b) => {
                const dA = new Date(`${a.date?.split("T")[0]}T${a.start_time || "00:00:00"}`).getTime()
                const dB = new Date(`${b.date?.split("T")[0]}T${b.start_time || "00:00:00"}`).getTime()
                return dB - dA // Most recent past first
            })
    }, [events])

    const createEventDialog = (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto sm:max-w-xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Provide details for the event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="mt-6 space-y-4">
                    <LocalizedContentEditor
                        fields={EVENT_FIELDS}
                        value={formData}
                        onChange={setFormData}
                        entityLabel="event"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Location Name</Label>
                            <Input required value={formData.location_name} onChange={e => setFormData({ ...formData, location_name: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Status is also computed automatically from the date & time. This is the stored default.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Location Address</Label>
                        <Input value={formData.location_address} onChange={e => setFormData({ ...formData, location_address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Image URL (optional)</Label>
                        <Input value={formData.hero_image_url} onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Outcome (optional)</Label>
                        <RichTextEditor
                            value={formData.outcome}
                            onChange={v => setFormData({ ...formData, outcome: v })}
                            placeholder="Describe the event outcome…"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Media (Photos &amp; Videos)</Label>
                        <MediaUploader
                            mediaUrls={formData.media_urls}
                            onChange={urls => setFormData(prev => ({ ...prev, media_urls: urls }))}
                        />
                    </div>
                    <Button type="submit" className="w-full">Save Event</Button>
                </form>
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Events Management
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Create and manage events for the community. Upcoming events are sorted by date.
                        </p>
                    </div>
                    {createEventDialog}
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-40 w-full rounded-lg" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <IconCalendarEvent className="size-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No events yet</p>
                            <Button className="mt-4" onClick={() => setIsAddOpen(true)}>Create Event</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-10">
                        {/* ── Upcoming Events ── */}
                        {upcomingEvents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <IconClock className="size-5 text-emerald-600" />
                                    <h2 className="text-lg font-semibold">Upcoming Events</h2>
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs font-semibold">
                                        {upcomingEvents.length}
                                    </Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {upcomingEvents.map(event => (
                                        <EventCard key={event.id} event={event} router={router} onViewGallery={setGalleryEvent} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Past Events ── */}
                        {pastEvents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <IconCheck className="size-5 text-gray-500" />
                                    <h2 className="text-lg font-semibold text-muted-foreground">Past Events</h2>
                                    <Badge variant="secondary" className="text-xs font-semibold">
                                        {pastEvents.length}
                                    </Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                                    {pastEvents.map(event => (
                                        <EventCard key={event.id} event={event} router={router} onViewGallery={setGalleryEvent} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
            <ProgrammeGallery
                eventId={galleryEvent?.id}
                mediaUrls={galleryEvent?.media_urls ?? []}
                open={galleryEvent !== null}
                onClose={() => setGalleryEvent(null)}
            />
        </div>
    )
}

function EventCard({ event, router, onViewGallery }) {
    const liveStatus = computeEventStatus(event)
    const sc = STATUS_BADGE[liveStatus] ?? STATUS_BADGE.upcoming

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : ""

    return (
        <Card>
            <CardHeader className="p-0 relative">
                {event.hero_image_url ? (
                    <img src={event.hero_image_url} alt={event.title} className="w-full h-40 object-cover rounded-t-lg" />
                ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                        <IconCalendarEvent className="size-10 text-primary/40" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>
                        {sc.label}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {formattedDate} {event.start_time ? `| ${event.start_time.substring(0, 5)}` : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.location_name}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2">
                <Button variant="outline" className="flex-1" onClick={() => router.push(`/events/${event.id}`)}>
                    <IconUsers className="size-4 mr-2" />
                    Manage
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => onViewGallery(event)}>
                    View Gallery
                </Button>
            </CardFooter>
        </Card>
    )
}
