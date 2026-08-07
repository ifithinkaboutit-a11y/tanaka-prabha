"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { schemesApi, bannersApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ContentToggleButton({ contentId, contentType, isActive, onToggled }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isScheme = contentType === "scheme"

    async function handleToggle() {
        setLoading(true)
        try {
            const res = isScheme
                ? await schemesApi.toggleStatus(contentId)
                : await bannersApi.toggleStatus(contentId)

            const updated = res?.data?.scheme ?? res?.data?.banner ?? res?.data ?? {}
            const nextActive = typeof updated.is_active === "boolean" ? updated.is_active : !isActive

            toast.success(nextActive ? "Published successfully" : "Unpublished successfully")
            // This page fetches its content client-side, so router.refresh() alone
            // leaves the button and status badge showing the old state.
            onToggled?.(nextActive)
            router.refresh()
        } catch (err) {
            toast.error(err.message || "Failed to update status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={isActive ? "outline" : "default"}
            onClick={handleToggle}
            disabled={loading}
            className="w-full gap-2"
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin" />
            ) : isActive ? (
                <EyeOff className="size-4" />
            ) : (
                <Eye className="size-4" />
            )}
            {isActive ? "Unpublish" : "Publish"}
        </Button>
    )
}
