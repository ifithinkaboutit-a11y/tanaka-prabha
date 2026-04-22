"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Leaflet/react-leaflet requires client-only rendering
const PointDataMap = dynamic(
    () => import("@/components/dashboard/PointDataMap"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[480px] w-full rounded-xl" />,
    }
)

export function PointDataMapSection() {
    return <PointDataMap />
}
