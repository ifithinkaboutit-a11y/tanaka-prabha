"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Tag, Calendar, Loader2 } from "lucide-react"
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav"
import { StatusBadge } from "@/components/shared/status-badge"
import { DeleteContentButton } from "@/components/forms/DeleteContentButton"
import { ContentToggleButton } from "@/components/forms/ContentToggleButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { schemesApi, bannersApi } from "@/lib/api"

function LoadingSkeleton() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            <Skeleton className="h-5 w-64" />
            <div className="flex items-center gap-3">
                <Skeleton className="size-9" />
                <div>
                    <Skeleton className="h-8 w-56 mb-1" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-48" />
                <Skeleton className="h-96 lg:col-span-2" />
            </div>
        </div>
    )
}

export default function ContentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!slug) return

        async function fetchContent() {
            try {
                // Slug format: "scheme-<id>" or "banner-<id>"
                const [type, ...idParts] = slug.split("-")
                const id = idParts.join("-")

                if (!id || !["scheme", "banner"].includes(type)) {
                    setError("Invalid content URL")
                    return
                }

                let response
                if (type === "scheme") {
                    response = await schemesApi.getById(id)
                } else {
                    response = await bannersApi.getById(id)
                }

                const item = response.data?.scheme || response.data?.banner || response.data || null
                if (!item) {
                    setError("Content not found")
                } else {
                    setContent({ ...item, _type: type })
                }
            } catch (err) {
                console.error("Error fetching content:", err)
                setError(err.message || "Failed to load content")
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [slug])

    if (loading) return <LoadingSkeleton />

    if (error || !content) {
        return (
            <div className="@container/main flex flex-1 flex-col items-center justify-center gap-4 py-20">
                <p className="text-lg font-medium">Content not found</p>
                <p className="text-sm text-muted-foreground">{error || "The requested content could not be loaded."}</p>
                <Button variant="outline" asChild>
                    <Link href="/content">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Content
                    </Link>
                </Button>
            </div>
        )
    }

    const isScheme = content._type === "scheme"
    const isBanner = content._type === "banner"
    const status = content.is_active ? "published" : "unpublished"
    const backHref = "/content"

    return (
        <div className="@container/main flex flex-1 flex-col gap-6 py-6 px-4 lg:px-6 md:py-8">
            <BreadcrumbNav items={[
                { label: "Dashboard", href: "/" },
                { label: "Content", href: "/content" },
                { label: content.title || `Content` },
            ]} />

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={backHref}><ArrowLeft className="size-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-semibold tracking-tight">{content.title}</h1>
                        <Badge variant="outline" className="capitalize">{content._type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {content.category || (isBanner ? "Banner" : "Scheme")}
                        {content.updated_at && ` · Updated ${new Date(content.updated_at).toLocaleDateString("en-IN")}`}
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Actions card */}
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <ContentToggleButton contentId={content.id} contentType={content._type} isActive={content.is_active} />
                        <DeleteContentButton contentId={content.id} contentType={content._type} contentTitle={content.title} />
                    </CardContent>
                </Card>

                {/* Main content */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">{isScheme ? "Scheme Details" : "Banner Details"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Image */}
                        {(content.image_url || content.hero_image_url) && (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted">
                                <Image
                                    src={content.image_url || content.hero_image_url}
                                    alt={content.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        {(content.description || content.subtitle) && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                                    {isScheme ? "Description" : "Subtitle"}
                                </p>
                                <p className="text-sm leading-relaxed">{content.description || content.subtitle}</p>
                            </div>
                        )}

                        {isScheme && content.overview && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Overview</p>
                                <p className="text-sm leading-relaxed">{content.overview}</p>
                            </div>
                        )}

                        {isScheme && content.eligibility && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Eligibility</p>
                                <p className="text-sm leading-relaxed">{content.eligibility}</p>
                            </div>
                        )}

                        {(content.apply_url || content.redirect_url) && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                                    {isScheme ? "Apply Link" : "Redirect URL"}
                                </p>
                                <a
                                    href={content.apply_url || content.redirect_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <ExternalLink className="size-3.5" />
                                    {content.apply_url || content.redirect_url}
                                </a>
                            </div>
                        )}

                        {isScheme && content.tags && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
                                    <Tag className="size-3" /> Tags
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(Array.isArray(content.tags) ? content.tags : content.tags.split(","))
                                        .map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                                        ))}
                                </div>
                            </div>
                        )}

                        {content.event_date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="size-4" />
                                Event: {new Date(content.event_date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                            </div>
                        )}

                        {content.support_contact && (
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Support Contact</p>
                                <p className="text-sm">{content.support_contact}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
