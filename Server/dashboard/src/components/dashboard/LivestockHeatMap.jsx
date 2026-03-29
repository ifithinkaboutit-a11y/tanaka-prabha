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

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Cow", value: "cow" },
    { label: "Buffalo", value: "buffalo" },
    { label: "Goat", value: "goat" },
    { label: "Sheep", value: "sheep" },
    { label: "Poultry", value: "poultry" },
    { label: "Others", value: "others" },
];

/**
 * Pure function — exported for unit testing.
 * Returns the raw (un-normalised) intensity for a farmer given the active filter.
 */
export function getIntensity(farmer, filter) {
    if (filter === "all") {
        return (
            (farmer.cow || 0) +
            (farmer.buffalo || 0) +
            (farmer.goat || 0) +
            (farmer.sheep || 0) +
            (farmer.poultry || 0) +
            (farmer.others || 0)
        );
    }
    return farmer[filter] || 0;
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

            const heatData = points.map((p) => [
                p.lat,
                p.lng,
                Math.max(0.1, Math.min(1.0, p.intensity / 500)),
            ]);

            layerRef.current = L.heatLayer(heatData, HEAT_OPTIONS);
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
 * LivestockHeatMap — self-fetching heatmap with per-animal-type filter.
 * MUST be used with dynamic(() => import(...), { ssr: false }) at usage site.
 */
export default function LivestockHeatMap() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await analyticsApi.getLivestockStatistics();
                setFarmers(res.data?.farmers || []);
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
                No livestock data available
            </div>
        );
    }

    const points = farmers
        .filter((f) => filter === "all" || getIntensity(f, filter) > 0)
        .map((f) => ({ lat: f.lat, lng: f.lng, intensity: getIntensity(f, filter) }));

    return (
        <div className="flex flex-col gap-3">
            {/* Segmented filter control */}
            <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((opt) => (
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
                aria-label="Livestock distribution heatmap"
            >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <HeatLayer points={points} />
            </MapContainer>
        </div>
    );
}
