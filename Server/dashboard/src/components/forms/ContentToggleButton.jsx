"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { schemesApi, bannersApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ContentToggleButton({ contentId, contentType, isActive }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isScheme = contentType === "scheme"

    async function handleToggle() {
        setLoading(true)
        try {
            if (isScheme) {
                await schemesApi.toggleStatus(contentId)
            } else {
                await bannersApi.toggleStatus(contentId)
            }
            toast.success(`${isActive ? "Unpublished" : "Published"} successfully`)
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
