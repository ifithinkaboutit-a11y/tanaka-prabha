"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

export default function MapComponent({ locations = [] }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map centered on India
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      scrollWheelZoom: true,
    })

    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add heatmap layer if we have locations
    if (locations.length > 0) {
      import("leaflet.heat").then((module) => {
        const heat = L.heatLayer(locations, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.0: "#3b82f6",
            0.25: "#22c55e",
            0.5: "#eab308",
            0.75: "#f97316",
            1.0: "#ef4444"
          }
        }).addTo(map)

        // Fit bounds to show all points if we have enough data
        if (locations.length > 1) {
          const validLocations = locations.filter(loc => 
            loc[0] && loc[1] && !isNaN(loc[0]) && !isNaN(loc[1])
          )
          if (validLocations.length > 0) {
            const bounds = L.latLngBounds(validLocations.map(loc => [loc[0], loc[1]]))
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      })
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [locations])

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  )
}
