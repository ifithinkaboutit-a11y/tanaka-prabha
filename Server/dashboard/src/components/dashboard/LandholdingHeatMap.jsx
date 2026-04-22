"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { analyticsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
    INDIA_CENTER,
    INDIA_ZOOM,
    INDIA_MIN_ZOOM,
    INDIA_MAX_ZOOM,
    HEAT_OPTIONS,
    TILE_URL,
    TILE_ATTRIBUTION,
} from "./heatmap-config";

const LAND_UNIT_OPTIONS = [
    { label: "All Land", value: "all" },
    { label: "< 1 Bigha", value: "small" },
    { label: "1–5 Bigha", value: "medium" },
    { label: "5–10 Bigha", value: "large" },
    { label: "> 10 Bigha", value: "xlarge" },
];

/**
 * Categorize land area into bucket for filtering
 */
function getLandBucket(totalLandArea) {
    if (!totalLandArea) return "small";
    const area = parseFloat(totalLandArea);
    if (isNaN(area)) return "small";
    if (area < 1) return "small";
    if (area < 5) return "medium";
    if (area < 10) return "large";
    return "xlarge";
}

function HeatLayer({ points }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (!points || points.length === 0) return;

        const initHeat = async () => {
            await import("leaflet.heat");
            const L = (await import("leaflet")).default;

            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }

            // Normalize intensity: land area as weight, capped for visual clarity
            const heatData = points.map((p) => [
                p.lat,
                p.lng,
                Math.max(0.1, Math.min(1.0, p.intensity / 20)),
            ]);

            layerRef.current = L.heatLayer(heatData, {
                ...HEAT_OPTIONS,
                radius: 35,
                blur: 25,
            });
            layerRef.current.addTo(map);
        };

        initHeat();

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, points]);

    return null;
}

/**
 * LandholdingHeatMap — density heatmap of landholding data.
 * Fetches farmer locations with land_details and renders as a heatmap.
 * MUST be used with dynamic(() => import(...), { ssr: false }) at usage site.
 */
export default function LandholdingHeatMap() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch farmer locations which include land_details
                const res = await analyticsApi.getFarmerLocations();
                const data = res.data?.locations || res.data || [];
                setFarmers(Array.isArray(data) ? data : []);
            } catch {
                setFarmers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <Skeleton className="h-[480px] w-full rounded-xl" />;
    }

    if (farmers.length === 0) {
        return (
            <div className="h-[480px] w-full rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-400">
                No landholding data available
            </div>
        );
    }

    // Map farmers to heatmap points with land area as intensity
    const allPoints = farmers
        .filter((f) => f.latitude && f.longitude)
        .map((f) => ({
            lat: parseFloat(f.latitude),
            lng: parseFloat(f.longitude),
            intensity: parseFloat(f.land_details?.total_land_area || f.total_land_area || 1),
            bucket: getLandBucket(f.land_details?.total_land_area || f.total_land_area),
        }))
        .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

    const points = allPoints.filter(
        (p) => filter === "all" || p.bucket === filter
    );

    return (
        <div className="flex flex-col gap-3">
            {/* Segmented filter control */}
            <div className="flex flex-wrap gap-2">
                {LAND_UNIT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        aria-pressed={filter === opt.value}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filter === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <MapContainer
                center={INDIA_CENTER}
                zoom={INDIA_ZOOM}
                minZoom={INDIA_MIN_ZOOM}
                maxZoom={INDIA_MAX_ZOOM}
                className="h-[480px] w-full rounded-xl z-0"
                scrollWheelZoom={false}
                style={{ background: "#18181b" }}
                aria-label="Landholding density heatmap"
            >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <HeatLayer points={points} />
            </MapContainer>
        </div>
    );
}
