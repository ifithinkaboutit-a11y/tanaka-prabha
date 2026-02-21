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
 * UserHeatMap — self-fetching heatmap component.
 * MUST be used with dynamic(() => import(...), { ssr: false }) at usage site.
 */
export default function UserHeatMap({ points: initialPoints }) {
    const [points, setPoints] = useState(initialPoints || []);
    const [loading, setLoading] = useState(!initialPoints || initialPoints.length === 0);

    useEffect(() => {
        if (initialPoints && initialPoints.length > 0) return;

        async function fetchHeatmap() {
            try {
                const res = await analyticsApi.getUserHeatmap();
                setPoints(res.data?.points || []);
            } catch {
                setPoints([]);
            } finally {
                setLoading(false);
            }
        }
        fetchHeatmap();
    }, []);

    if (loading) {
        return <Skeleton className="h-[480px] w-full rounded-xl" />;
    }

    return (
        <MapContainer
            center={INDIA_CENTER}
            zoom={INDIA_ZOOM}
            minZoom={INDIA_MIN_ZOOM}
            maxZoom={INDIA_MAX_ZOOM}
            className="h-[480px] w-full rounded-xl z-0"
            scrollWheelZoom={false}
            style={{ background: "#1a1a2e" }}
        >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <HeatLayer points={points} />
        </MapContainer>
    );
}
