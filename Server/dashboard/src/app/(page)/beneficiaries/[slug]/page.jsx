"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, MapPin, User, Calendar } from "lucide-react"
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav"
import { StatusBadge } from "@/components/shared/status-badge"
import { BeneficiarySheet } from "@/components/forms/BeneficiarySheet"
import { DeleteBeneficiaryButton } from "@/components/forms/DeleteBeneficiaryButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
            </div>
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

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            {/* Breadcrumb */}
            <BreadcrumbNav items={[
                { label: "Dashboard", href: "/" },
                { label: "Beneficiaries", href: "/beneficiaries" },
                { label: user.name || `Beneficiary` },
            ]} />

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/beneficiaries"><ArrowLeft className="size-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{user.name || "Unknown"}</h1>
                    <p className="text-sm text-muted-foreground">
                        {user.mobile_number || "No phone number"}
                    </p>
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
                            <AvatarImage src={user.photo_url} />
                            <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold">{user.name || "—"}</h2>
                            <p className="text-sm text-muted-foreground">{user.village && user.district ? `${user.village}, ${user.district}` : user.district || user.village || "—"}</p>
                        </div>
                        <StatusBadge status={status} />
                        <div className="flex gap-2 w-full">
                            <BeneficiarySheet user={user} mode="edit" />
                            <DeleteBeneficiaryButton userId={user.id} userName={user.name} />
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-x-8">
                            <div>
                                <DetailRow label="Mobile Number" value={user.mobile_number} icon={Phone} />
                                <DetailRow label="Age" value={user.age ? `${user.age} years` : null} icon={User} />
                                <DetailRow label="Gender" value={user.gender} icon={User} />
                                <DetailRow label="Father's Name" value={user.fathers_name} />
                                <DetailRow label="Mother's Name" value={user.mothers_name} />
                                <DetailRow label="Education" value={user.educational_qualification} />
                                <DetailRow label="Aadhaar Number" value={user.aadhaar_number ? `XXXX-XXXX-${user.aadhaar_number.slice(-4)}` : null} />
                                <DetailRow label="Joined" value={user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null} icon={Calendar} />
                            </div>
                            <div>
                                <DetailRow label="Village" value={user.village} icon={MapPin} />
                                <DetailRow label="Gram Panchayat" value={user.gram_panchayat} />
                                <DetailRow label="Block" value={user.block} />
                                <DetailRow label="Tehsil" value={user.tehsil} />
                                <DetailRow label="District" value={user.district} />
                                <DetailRow label="State" value={user.state} />
                                <DetailRow label="Pin Code" value={user.pin_code} />
                                <DetailRow label="Post Office" value={user.post_office} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Family Details */}
                {(user.sons_married || user.sons_unmarried || user.daughters_married || user.daughters_unmarried || user.other_family_members) && (
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">Family Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                {[
                                    { label: "Sons (Married)", value: user.sons_married },
                                    { label: "Sons (Unmarried)", value: user.sons_unmarried },
                                    { label: "Daughters (Married)", value: user.daughters_married },
                                    { label: "Daughters (Unmarried)", value: user.daughters_unmarried },
                                    { label: "Other Members", value: user.other_family_members },
                                ].map(({ label, value }) => value != null && (
                                    <div key={label} className="p-4 rounded-xl bg-muted/50">
                                        <p className="text-2xl font-bold">{value}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Land Details */}
                {user.land_details && (
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">Land Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-x-8">
                                <DetailRow label="Total Land Area" value={user.land_details.total_land_area ? `${user.land_details.total_land_area} Acres` : null} />
                                <DetailRow label="Rabi Crop" value={user.land_details.rabi_crop} />
                                <DetailRow label="Kharif Crop" value={user.land_details.kharif_crop} />
                                <DetailRow label="Cash Crop" value={user.land_details.cash_crop} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Livestock Details */}
                {user.livestock_details && (
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base">Livestock Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                {Object.entries(user.livestock_details)
                                    .filter(([key, val]) => val && val > 0 && !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
                                    .map(([key, value]) => (
                                        <div key={key} className="p-4 rounded-xl bg-muted/50">
                                            <p className="text-2xl font-bold">{value}</p>
                                            <p className="text-xs text-muted-foreground mt-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
