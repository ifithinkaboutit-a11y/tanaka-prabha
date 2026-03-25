"use client"

import { getTopRegions } from "@/lib/top-livestock-regions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

// Re-export so callers can import getTopRegions from this component file too
export { getTopRegions }

const ANIMAL_TYPES = ["cow", "buffalo", "goat", "sheep", "poultry", "others"]

/**
 * TopLivestockRegions — panel listing the top 5 districts by total livestock count.
 *
 * @param {{ farmers: Array }} props
 */
export function TopLivestockRegions({ farmers = [] }) {
  const regions = getTopRegions(farmers)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <MapPin className="size-4" />
          </div>
          Top Livestock Regions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No livestock data available</p>
        ) : (
          <div className="space-y-3">
            {regions.map((region, i) => (
              <div key={region.district} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm">{region.district}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {region.total.toLocaleString()} total
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {ANIMAL_TYPES.map((type) => (
                    region[type] > 0 && (
                      <span key={type} className="text-xs text-muted-foreground capitalize">
                        {type}: <span className="font-medium text-foreground">{region[type].toLocaleString()}</span>
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
