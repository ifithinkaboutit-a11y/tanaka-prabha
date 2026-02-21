"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Leaflet/react-leaflet requires client-only rendering — must be in a "use client" component
const UserHeatMap = dynamic(
    () => import("@/components/dashboard/UserHeatMap"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[480px] w-full rounded-xl" />,
    }
)

export function HeatmapSection() {
    return <UserHeatMap />
}
