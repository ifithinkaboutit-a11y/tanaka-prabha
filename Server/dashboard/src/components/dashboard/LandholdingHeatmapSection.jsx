"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Leaflet/react-leaflet requires client-only rendering
const LandholdingHeatMap = dynamic(
    () => import("@/components/dashboard/LandholdingHeatMap"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[480px] w-full rounded-xl" />,
    }
)

export function LandholdingHeatmapSection() {
    return <LandholdingHeatMap />
}
