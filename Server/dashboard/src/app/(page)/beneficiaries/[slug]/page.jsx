"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Phone, MapPin, User, Calendar, Home, Building2, FileText,
    Wheat, Sprout, TreePine, Ruler, MapPinned, Users, GraduationCap, IdCard
} from "lucide-react"
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav"
import { StatusBadge } from "@/components/shared/status-badge"
import { BeneficiaryDialog } from "@/components/forms/BeneficiaryDialog"
import { DeleteBeneficiaryButton } from "@/components/forms/DeleteBeneficiaryButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usersApi } from "@/lib/api"

function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function DetailRow({ label, value, icon: Icon }) {
    if (!value && value !== 0) return null
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-0">
            {Icon && <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium mt-0.5 break-words">{value}</p>
            </div>
        </div>
    )
}

function StatCard({ emoji, value, label, color = "bg-muted/50" }) {
    if (!value && value !== 0) return null
    return (
        <div className={`p-4 rounded-xl ${color} text-center min-w-[80px]`}>
            <p className="text-2xl mb-1">{emoji}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{label}</p>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            <Skeleton className="h-5 w-64" />
            <div className="flex items-center gap-3">
                <Skeleton className="size-9" />
                <div>
                    <Skeleton className="h-8 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-64" />
                <Skeleton className="h-96 lg:col-span-2" />
            </div>
        </div>
    )
}

export default function BeneficiaryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!slug) return

        async function fetchUser() {
            try {
                const response = await usersApi.getById(slug)
                const userData = response.data?.user || response.data || null
                if (!userData) {
                    setError("User not found")
                } else {
                    setUser(userData)
                }
            } catch (err) {
                console.error("Error fetching user:", err)
                setError(err.message || "Failed to load user")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [slug])

    if (loading) return <LoadingSkeleton />

    if (error || !user) {
        return (
            <div className="@container/main flex flex-1 flex-col items-center justify-center gap-4 py-20">
                <p className="text-lg font-medium">User not found</p>
                <p className="text-sm text-muted-foreground">{error || "The requested beneficiary could not be loaded."}</p>
                <Button variant="outline" asChild>
                    <Link href="/beneficiaries">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Beneficiaries
                    </Link>
                </Button>
            </div>
        )
    }

    const status = user.is_verified ? "verified" : "pending"
    const totalFamilyMembers =
        (user.sons_married || 0) + (user.sons_unmarried || 0) +
        (user.daughters_married || 0) + (user.daughters_unmarried || 0) +
        (user.other_family_members || 0)
    const totalLivestock = user.livestock_details
        ? (user.livestock_details.cow || 0) + (user.livestock_details.buffalo || 0) +
        (user.livestock_details.goat || 0) + (user.livestock_details.sheep || 0) +
        (user.livestock_details.pig || 0) + (user.livestock_details.poultry || 0) +
        (user.livestock_details.others || 0)
        : 0
    const fullAddress = [user.village, user.gram_panchayat, user.block, user.tehsil, user.district, user.state]
        .filter(Boolean).join(", ")

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            {/* Breadcrumb */}
            <BreadcrumbNav items={[
                { label: "Dashboard", href: "/" },
                { label: "Beneficiaries", href: "/beneficiaries" },
                { label: user.name || "Beneficiary" },
            ]} />

            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/beneficiaries"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight">{user.name || "Unknown"}</h1>
                    <p className="text-sm text-muted-foreground">
                        {user.mobile_number || "No phone number"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                </div>
            </div>

            {/* Stats Overview Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <User className="size-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{user.age || "—"}</p>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Age (years)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Ruler className="size-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{user.land_details?.total_land_area || "0"}</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Land (Bigha)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Users className="size-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalFamilyMembers || "0"}</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">Family Members</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <Sprout className="size-5 mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{totalLivestock}</p>
                        <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">Livestock</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card>
                    <CardContent className="flex flex-col items-center text-center pt-6 pb-6 gap-4">
                        <Avatar className="size-20">
                            <AvatarImage src={user.photo_url} />
                            <AvatarFallback className="text-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold">{user.name || "—"}</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {fullAddress || "—"}
                            </p>
                        </div>

                        {/* Quick Info Badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {user.gender && (
                                <Badge variant="outline" className="capitalize">{user.gender}</Badge>
                            )}
                            {user.age && (
                                <Badge variant="outline">{user.age} yrs</Badge>
                            )}
                            {user.educational_qualification && (
                                <Badge variant="secondary" className="capitalize">{user.educational_qualification}</Badge>
                            )}
                        </div>

                        <StatusBadge status={status} />

                        <Separator />

                        <div className="flex gap-2 w-full">
                            <BeneficiaryDialog user={user} mode="edit" />
                            <DeleteBeneficiaryButton userId={user.id} userName={user.name} />
                        </div>

                        {/* Joined Date */}
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="size-3" />
                            Registered {user.created_at
                                ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                                : "—"}
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details + Address */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <User className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Personal Details</CardTitle>
                                    <CardDescription>Identity & contact information</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-x-8">
                                <div>
                                    <DetailRow label="Full Name" value={user.name} icon={User} />
                                    <DetailRow label="Mobile Number" value={user.mobile_number} icon={Phone} />
                                    <DetailRow label="Age" value={user.age ? `${user.age} years` : null} icon={Calendar} />
                                    <DetailRow label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} icon={User} />
                                </div>
                                <div>
                                    <DetailRow label="Father's Name" value={user.fathers_name} icon={Users} />
                                    <DetailRow label="Mother's Name" value={user.mothers_name} icon={Users} />
                                    <DetailRow label="Education" value={user.educational_qualification} icon={GraduationCap} />
                                    <DetailRow label="Aadhaar Number" value={user.aadhaar_number ? `XXXX-XXXX-${user.aadhaar_number.slice(-4)}` : null} icon={IdCard} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Address Details</CardTitle>
                                    <CardDescription>Location & administrative information</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-x-8">
                                <div>
                                    <DetailRow label="Village" value={user.village} icon={Home} />
                                    <DetailRow label="Gram Panchayat" value={user.gram_panchayat} icon={Building2} />
                                    <DetailRow label="Nyay Panchayat" value={user.nyay_panchayat} icon={Building2} />
                                    <DetailRow label="Post Office" value={user.post_office} icon={FileText} />
                                </div>
                                <div>
                                    <DetailRow label="Block" value={user.block} icon={MapPin} />
                                    <DetailRow label="Tehsil" value={user.tehsil} icon={MapPin} />
                                    <DetailRow label="District" value={user.district} icon={MapPin} />
                                    <DetailRow label="State" value={user.state} icon={MapPin} />
                                    <DetailRow label="Pin Code" value={user.pin_code} icon={FileText} />
                                </div>
                            </div>
                            {/* Map Coordinates */}
                            {(user.latitude && user.longitude) && (
                                <div className="mt-4 p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPinned className="size-3.5" />
                                        <span>GPS: {Number(user.latitude).toFixed(6)}, {Number(user.longitude).toFixed(6)}</span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${user.latitude},${user.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        View on Map →
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Family Details */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <Users className="size-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Family Details</CardTitle>
                                <CardDescription>{totalFamilyMembers} family member{totalFamilyMembers !== 1 ? "s" : ""} recorded</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {totalFamilyMembers > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                <StatCard emoji="👨‍💼" value={user.sons_married} label="Sons (Married)" color="bg-blue-50/80 dark:bg-blue-950/30" />
                                <StatCard emoji="👦" value={user.sons_unmarried} label="Sons (Unmarried)" color="bg-sky-50/80 dark:bg-sky-950/30" />
                                <StatCard emoji="👩‍💼" value={user.daughters_married} label="Daughters (Married)" color="bg-pink-50/80 dark:bg-pink-950/30" />
                                <StatCard emoji="👧" value={user.daughters_unmarried} label="Daughters (Unmarried)" color="bg-rose-50/80 dark:bg-rose-950/30" />
                                <StatCard emoji="👥" value={user.other_family_members} label="Other Members" color="bg-gray-50/80 dark:bg-gray-950/30" />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="size-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No family details recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Land Details */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                <Wheat className="size-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Land & Crop Details</CardTitle>
                                <CardDescription>
                                    {user.land_details
                                        ? `${user.land_details.total_land_area || 0} Bigha total land area`
                                        : "No land details recorded"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {user.land_details ? (
                            <div className="space-y-5">
                                {/* Land Area Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-green-50/80 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Ruler className="size-4 text-green-600 dark:text-green-400" />
                                            <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Total Area</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">{user.land_details.total_land_area || 0} <span className="text-sm font-normal">Bigha</span></p>
                                    </div>

                                    {/* Crop Season Cards */}
                                    {user.land_details.rabi_crop && (
                                        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">❄️</span>
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">Rabi Crop</span>
                                            </div>
                                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{user.land_details.rabi_crop}</p>
                                        </div>
                                    )}

                                    {user.land_details.kharif_crop && (
                                        <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">🌧️</span>
                                                <span className="text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide">Kharif Crop</span>
                                            </div>
                                            <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">{user.land_details.kharif_crop}</p>
                                        </div>
                                    )}

                                    {user.land_details.zaid_crop && (
                                        <div className="p-4 rounded-xl bg-lime-50/80 dark:bg-lime-950/30 border border-lime-200/50 dark:border-lime-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">☀️</span>
                                                <span className="text-xs font-medium text-lime-700 dark:text-lime-300 uppercase tracking-wide">Zaid Crop</span>
                                            </div>
                                            <p className="text-sm font-semibold text-lime-800 dark:text-lime-200">{user.land_details.zaid_crop}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Land Location */}
                                {(user.land_details.latitude && user.land_details.longitude) && (
                                    <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPinned className="size-4 text-green-600" />
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Farm Location</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.land_details.location_address || `${Number(user.land_details.latitude).toFixed(6)}, ${Number(user.land_details.longitude).toFixed(6)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${user.land_details.latitude},${user.land_details.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            View on Map →
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Wheat className="size-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No land details recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Livestock Details */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                <Sprout className="size-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Livestock Details</CardTitle>
                                <CardDescription>{totalLivestock} animal{totalLivestock !== 1 ? "s" : ""} recorded</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {user.livestock_details && totalLivestock > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                <StatCard emoji="🐄" value={user.livestock_details.cow} label="Cow" color="bg-amber-50/80 dark:bg-amber-950/30" />
                                <StatCard emoji="🐃" value={user.livestock_details.buffalo} label="Buffalo" color="bg-stone-50/80 dark:bg-stone-950/30" />
                                <StatCard emoji="🐐" value={user.livestock_details.goat} label="Goat" color="bg-orange-50/80 dark:bg-orange-950/30" />
                                <StatCard emoji="🐑" value={user.livestock_details.sheep} label="Sheep" color="bg-gray-50/80 dark:bg-gray-950/30" />
                                <StatCard emoji="🐖" value={user.livestock_details.pig} label="Pig" color="bg-pink-50/80 dark:bg-pink-950/30" />
                                <StatCard emoji="🐓" value={user.livestock_details.poultry} label="Poultry" color="bg-yellow-50/80 dark:bg-yellow-950/30" />
                                <StatCard emoji="🐾" value={user.livestock_details.others} label="Others" color="bg-neutral-50/80 dark:bg-neutral-950/30" />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Sprout className="size-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No livestock details recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
