"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Phone, MapPin, User, Calendar, Home, Building2, FileText,
    Wheat, Sprout, Ruler, MapPinned, Users, GraduationCap, IdCard,
    Mail, Edit, Trash2
} from "lucide-react"
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav"
import { StatusBadge } from "@/components/shared/status-badge"
import { BeneficiaryDialog } from "@/components/forms/BeneficiaryDialog"
import { DeleteBeneficiaryButton } from "@/components/forms/DeleteBeneficiaryButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usersApi } from "@/lib/api"

function getInitials(name) {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

/* ───── Reusable info grid item ───── */
function InfoItem({ icon: Icon, label, value, className = "" }) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{label}</p>
                <p className="text-sm font-medium mt-0.5 break-words">{value || "—"}</p>
            </div>
        </div>
    )
}

/* ───── Stat pill for livestock / family ───── */
function StatPill({ emoji, count, label }) {
    if (!count && count !== 0) return null
    return (
        <div className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <span className="text-xl">{emoji}</span>
            <div>
                <p className="text-lg font-bold leading-tight">{count}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{label}</p>
            </div>
        </div>
    )
}

/* ───── Crop Season Card ───── */
function CropCard({ emoji, season, crop, color }) {
    if (!crop) return null
    return (
        <div className={`rounded-xl border p-4 ${color}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{emoji}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{season}</span>
            </div>
            <p className="text-sm font-semibold">{crop}</p>
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

    const registeredDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : "Unknown"

    const hasCrops = user.land_details && (user.land_details.rabi_crop || user.land_details.kharif_crop || user.land_details.zaid_crop)

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 py-6 px-4 lg:px-6 md:py-8 max-w-5xl mx-auto w-full">
            {/* Breadcrumb */}
            <BreadcrumbNav items={[
                { label: "Dashboard", href: "/" },
                { label: "Beneficiaries", href: "/beneficiaries" },
                { label: user.name || "Beneficiary" },
            ]} />

            {/* ─── Hero Header Card ─── */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        {/* Back + Avatar */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="size-9 shrink-0" asChild>
                                <Link href="/beneficiaries"><ArrowLeft className="size-4" /></Link>
                            </Button>
                            <Avatar className="size-16 ring-2 ring-background shadow-md">
                                <AvatarImage src={user.photo_url} />
                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Name & Meta */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name || "Unknown Farmer"}</h1>
                                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
                                        {user.mobile_number && (
                                            <a href={`tel:${user.mobile_number}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                                <Phone className="size-3.5" /> {user.mobile_number}
                                            </a>
                                        )}
                                        {user.district && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-3.5" /> {user.district}{user.state ? `, ${user.state}` : ""}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={status} />
                                </div>
                            </div>

                            {/* Quick Stats Row */}
                            <div className="flex items-center gap-4 mt-4 flex-wrap">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <div className="size-2 rounded-full bg-blue-500" />
                                    <span className="text-muted-foreground">Age:</span>
                                    <span className="font-semibold">{user.age || "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    <span className="text-muted-foreground">Land:</span>
                                    <span className="font-semibold">{user.land_details?.total_land_area || "0"} Bigha</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <div className="size-2 rounded-full bg-amber-500" />
                                    <span className="text-muted-foreground">Family:</span>
                                    <span className="font-semibold">{totalFamilyMembers || "0"} members</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <div className="size-2 rounded-full bg-orange-500" />
                                    <span className="text-muted-foreground">Livestock:</span>
                                    <span className="font-semibold">{totalLivestock} animals</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/40">
                        <BeneficiaryDialog user={user} mode="edit" />
                        <DeleteBeneficiaryButton userId={user.id} userName={user.name} />
                        <div className="flex-1" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="size-3" />
                            Registered {registeredDate}
                        </span>
                    </div>
                </div>
            </Card>

            {/* ─── Tabbed Content ─── */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1 h-auto flex-wrap">
                    <TabsTrigger value="personal" className="rounded-lg text-xs sm:text-sm py-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <User className="size-3.5 mr-1.5" /> Personal
                    </TabsTrigger>
                    <TabsTrigger value="address" className="rounded-lg text-xs sm:text-sm py-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <MapPin className="size-3.5 mr-1.5" /> Address
                    </TabsTrigger>
                    <TabsTrigger value="farming" className="rounded-lg text-xs sm:text-sm py-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Wheat className="size-3.5 mr-1.5" /> Land & Crops
                    </TabsTrigger>
                    <TabsTrigger value="livestock" className="rounded-lg text-xs sm:text-sm py-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Sprout className="size-3.5 mr-1.5" /> Livestock
                    </TabsTrigger>
                    <TabsTrigger value="family" className="rounded-lg text-xs sm:text-sm py-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="size-3.5 mr-1.5" /> Family
                    </TabsTrigger>
                </TabsList>

                {/* ── Personal Tab ── */}
                <TabsContent value="personal" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
                                <InfoItem icon={User} label="Full Name" value={user.name} />
                                <InfoItem icon={Phone} label="Mobile Number" value={user.mobile_number} />
                                <InfoItem icon={Calendar} label="Age" value={user.age ? `${user.age} years` : null} />
                                <InfoItem icon={User} label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} />
                                <InfoItem icon={Users} label="Father's Name" value={user.fathers_name} />
                                <InfoItem icon={Users} label="Mother's Name" value={user.mothers_name} />
                                <InfoItem icon={GraduationCap} label="Education" value={user.educational_qualification} />
                                <InfoItem icon={IdCard} label="Aadhaar Number" value={user.aadhaar_number ? `XXXX-XXXX-${user.aadhaar_number.slice(-4)}` : null} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Address Tab ── */}
                <TabsContent value="address" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
                                <InfoItem icon={Home} label="Village" value={user.village} />
                                <InfoItem icon={Building2} label="Gram Panchayat" value={user.gram_panchayat} />
                                <InfoItem icon={Building2} label="Nyay Panchayat" value={user.nyay_panchayat} />
                                <InfoItem icon={FileText} label="Post Office" value={user.post_office} />
                                <InfoItem icon={MapPin} label="Block" value={user.block} />
                                <InfoItem icon={MapPin} label="Tehsil" value={user.tehsil} />
                                <InfoItem icon={MapPin} label="District" value={user.district} />
                                <InfoItem icon={MapPin} label="State" value={user.state} />
                                <InfoItem icon={FileText} label="Pin Code" value={user.pin_code} />
                            </div>

                            {/* GPS Location */}
                            {(user.latitude && user.longitude) && (
                                <div className="mt-6 p-4 rounded-xl bg-muted/40 border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <MapPinned className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">GPS Location</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {Number(user.latitude).toFixed(6)}, {Number(user.longitude).toFixed(6)}
                                            </p>
                                        </div>
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
                </TabsContent>

                {/* ── Farming Tab ── */}
                <TabsContent value="farming" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {user.land_details ? (
                                <div className="space-y-6">
                                    {/* Land Area Highlight */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                        <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                            <Ruler className="size-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                                {user.land_details.total_land_area || 0}
                                                <span className="text-sm font-normal ml-1">Bigha</span>
                                            </p>
                                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Total Land Area</p>
                                        </div>
                                    </div>

                                    {/* Crop Cards */}
                                    {hasCrops ? (
                                        <div>
                                            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Crops by Season</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <CropCard emoji="❄️" season="Rabi (Winter)" crop={user.land_details.rabi_crop}
                                                    color="bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30 text-amber-800 dark:text-amber-200" />
                                                <CropCard emoji="🌧️" season="Kharif (Monsoon)" crop={user.land_details.kharif_crop}
                                                    color="bg-teal-50/80 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-800/30 text-teal-800 dark:text-teal-200" />
                                                <CropCard emoji="☀️" season="Zaid (Summer)" crop={user.land_details.zaid_crop}
                                                    color="bg-lime-50/80 dark:bg-lime-950/20 border-lime-200/50 dark:border-lime-800/30 text-lime-800 dark:text-lime-200" />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No crop information recorded</p>
                                    )}

                                    {/* Farm Location */}
                                    {(user.land_details.latitude && user.land_details.longitude) && (
                                        <div className="p-4 rounded-xl bg-muted/40 border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                                    <MapPinned className="size-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Farm Location</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
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
                                <div className="text-center py-12 text-muted-foreground">
                                    <Wheat className="size-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No land details recorded</p>
                                    <p className="text-xs mt-1">Information will appear here once the farmer updates their profile</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Livestock Tab ── */}
                <TabsContent value="livestock" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {user.livestock_details && totalLivestock > 0 ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                            <Sprout className="size-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">{totalLivestock} Total Animals</p>
                                            <p className="text-xs text-muted-foreground">Across all categories</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        <StatPill emoji="🐄" count={user.livestock_details.cow} label="Cow" />
                                        <StatPill emoji="🐃" count={user.livestock_details.buffalo} label="Buffalo" />
                                        <StatPill emoji="🐐" count={user.livestock_details.goat} label="Goat" />
                                        <StatPill emoji="🐑" count={user.livestock_details.sheep} label="Sheep" />
                                        <StatPill emoji="🐖" count={user.livestock_details.pig} label="Pig" />
                                        <StatPill emoji="🐓" count={user.livestock_details.poultry} label="Poultry" />
                                        <StatPill emoji="🐾" count={user.livestock_details.others} label="Others" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Sprout className="size-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No livestock details recorded</p>
                                    <p className="text-xs mt-1">Information will appear here once the farmer updates their profile</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Family Tab ── */}
                <TabsContent value="family" className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            {totalFamilyMembers > 0 ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                            <Users className="size-5 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">{totalFamilyMembers} Family Members</p>
                                            <p className="text-xs text-muted-foreground">Total household members recorded</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        <StatPill emoji="👨‍💼" count={user.sons_married} label="Sons (Married)" />
                                        <StatPill emoji="👦" count={user.sons_unmarried} label="Sons (Unmarried)" />
                                        <StatPill emoji="👩‍💼" count={user.daughters_married} label="Daughters (M)" />
                                        <StatPill emoji="👧" count={user.daughters_unmarried} label="Daughters (U)" />
                                        <StatPill emoji="👥" count={user.other_family_members} label="Others" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="size-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No family details recorded</p>
                                    <p className="text-xs mt-1">Information will appear here once the farmer updates their profile</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
