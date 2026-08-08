"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Leaflet/react-leaflet requires client-only rendering — must be in a "use client" component
const UnifiedMap = dynamic(
    () => import("@/components/dashboard/UnifiedMap"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[520px] w-full rounded-xl" />,
    }
)

export function UnifiedMapSection() {
    return <UnifiedMap />
}
