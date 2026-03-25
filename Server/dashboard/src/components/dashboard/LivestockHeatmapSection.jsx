"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Leaflet/react-leaflet requires client-only rendering — must be in a "use client" component
const LivestockHeatMap = dynamic(
    () => import("@/components/dashboard/LivestockHeatMap"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[480px] w-full rounded-xl" />,
    }
)

export function LivestockHeatmapSection() {
    return <LivestockHeatMap />
}
