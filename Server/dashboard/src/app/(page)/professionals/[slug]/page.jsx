import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, MapPin, Briefcase, Star, Building2 } from "lucide-react"
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav"
import { StatusBadge } from "@/components/shared/status-badge"
import { ProfessionalSheet } from "@/components/forms/ProfessionalSheet"
import { DeleteProfessionalButton } from "@/components/forms/DeleteProfessionalButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function getProfessional(id) {
    try {
        const res = await fetch(`${API_BASE}/professionals/${id}`, { cache: "no-store" })
        if (!res.ok) return null
        const data = await res.json()
        return data.data?.professional || data.data || data.professional || null
    } catch { return null }
}

function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function DetailRow({ label, value, icon: Icon }) {
    if (!value && value !== 0) return null
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-0">
            {Icon && <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
        </div>
    )
}

export default async function ProfessionalDetailPage({ params }) {
    const professional = await getProfessional(params.slug)
    if (!professional) notFound()

    const status = professional.is_available ? "available" : "unavailable"

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            <BreadcrumbNav items={[
                { label: "Dashboard", href: "/" },
                { label: "Professionals", href: "/professionals" },
                { label: professional.name || `Professional #${params.slug}` },
            ]} />

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/professionals"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{professional.name || "Unknown"}</h1>
                    <p className="text-sm text-muted-foreground">{professional.role || professional.category}</p>
                </div>
                <div className="ml-auto">
                    <StatusBadge status={status} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile card */}
                <Card>
                    <CardContent className="flex flex-col items-center text-center pt-6 pb-6 gap-4">
                        <Avatar className="size-20">
                            <AvatarImage src={professional.image_url} />
                            <AvatarFallback className="text-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {getInitials(professional.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold">{professional.name || "—"}</h2>
                            <p className="text-sm text-muted-foreground">{professional.role || "—"}</p>
                            {professional.category && (
                                <Badge variant="outline" className="mt-2 capitalize">{professional.category}</Badge>
                            )}
                        </div>
                        <StatusBadge status={status} />
                        <div className="flex gap-2 w-full">
                            <ProfessionalSheet professional={professional} mode="edit" />
                            <DeleteProfessionalButton professionalId={professional.id} professionalName={professional.name} />
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailRow label="Phone Number" value={professional.phone_number} icon={Phone} />
                        <DetailRow label="Department" value={professional.department} icon={Building2} />
                        <DetailRow label="Category" value={professional.category} icon={Briefcase} />
                        <DetailRow label="District" value={professional.district} icon={MapPin} />
                        <DetailRow label="Service Area" value={professional.service_area} icon={MapPin} />
                        {professional.specializations && (
                            <div className="py-3 border-b">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Specializations</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Array.isArray(professional.specializations)
                                        ? professional.specializations
                                        : professional.specializations.split(","))
                                        .map((s, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>
                                        ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
