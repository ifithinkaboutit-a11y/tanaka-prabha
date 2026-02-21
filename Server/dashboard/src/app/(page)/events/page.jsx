"use client"

import * as React from "react"
import { IconPlus, IconEye, IconEdit, IconTrash, IconCalendarEvent, IconUsers } from "@tabler/icons-react"
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
import { Textarea } from "@/components/ui/textarea"
import { eventsApi } from "@/lib/api"
import { toast } from "sonner"

export default function EventsPage() {
    const [events, setEvents] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        location_name: "",
        location_address: "",
        guidelines_and_rules: "",
        requirements: "",
        hero_image_url: "",
    })
    const router = useRouter()

    React.useEffect(() => {
        fetchEvents()
    }, [])

    async function fetchEvents() {
        try {
            setLoading(true)
            const res = await eventsApi.getAll()
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
        try {
            await eventsApi.create(formData)
            toast.success("Event created successfully")
            setIsAddOpen(false)
            fetchEvents()
            setFormData({
                title: "", description: "", date: "", start_time: "", end_time: "",
                location_name: "", location_address: "", guidelines_and_rules: "", requirements: "", hero_image_url: ""
            })
        } catch (err) {
            toast.error("Failed to create event")
            console.error(err)
        }
    }

    return (
        <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col py-6 px-4 md:py-8 lg:px-6">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Events Management
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Create and manage upcoming events for the community.
                        </p>
                    </div>
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
                                <DialogDescription>Provide details for the upcoming event.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
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
                                    <Label>Location Address</Label>
                                    <Input value={formData.location_address} onChange={e => setFormData({ ...formData, location_address: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Guidelines and Rules</Label>
                                    <Textarea value={formData.guidelines_and_rules} onChange={e => setFormData({ ...formData, guidelines_and_rules: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Image URL (optional)</Label>
                                    <Input value={formData.hero_image_url} onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full">Save Event</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {events.map(event => (
                            <Card key={event.id}>
                                <CardHeader className="p-0 relative">
                                    {event.hero_image_url ? (
                                        <img src={event.hero_image_url} alt={event.title} className="w-full h-40 object-cover rounded-t-lg" />
                                    ) : (
                                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                                            <IconCalendarEvent className="size-10 text-primary/40" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="capitalize">
                                            {event.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(event.date).toLocaleDateString()} | {event.start_time}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.location_name}</p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => router.push(`/events/${event.id}`)}>
                                        <IconUsers className="size-4 mr-2" />
                                        Manage
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
