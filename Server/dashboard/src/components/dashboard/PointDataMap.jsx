"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { analyticsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    INDIA_CENTER,
    INDIA_ZOOM,
    INDIA_MIN_ZOOM,
    INDIA_MAX_ZOOM,
    TILE_URL,
    TILE_ATTRIBUTION,
} from "./heatmap-config";
import L from "leaflet";

// Fix default marker icons for Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Color-coded marker icons by category
// Colors chosen to keep >=3:1 contrast (WCAG 1.4.11) against the marker's white stroke/center dot
const MARKER_COLORS = {
    crop: "#15803d",       // green-700 (was green-600, 3.3:1 — too close to the 3:1 floor)
    livestock: "#a16207",  // yellow-700 (was yellow-600, 2.94:1 — failed the 3:1 floor)
    professional: "#2563eb", // blue
    event: "#9333ea",      // purple
    default: "#6b7280",    // gray
};

function createColoredIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: "custom-marker-icon",
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
    });
}

const DATA_TYPE_OPTIONS = [
    { label: "All Points", value: "all" },
    { label: "Crops", value: "crop" },
    { label: "Livestock", value: "livestock" },
    { label: "Professionals", value: "professional" },
    { label: "Events", value: "event" },
];

const CROP_SEASON_OPTIONS = [
    { label: "All Seasons", value: "all" },
    { label: "Rabi", value: "rabi" },
    { label: "Kharif", value: "kharif" },
    { label: "Zaid", value: "zaid" },
];

/**
 * Auto-zoom map to fit all visible markers
 */
function FitBounds({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;
        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], INDIA_ZOOM);
            return;
        }
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, points]);

    return null;
}

/**
 * PointDataMap — renders data points as pin/marker-based maps with filtering.
 * Supports crop categories, livestock, professionals, and events.
 * MUST be used with dynamic(() => import(...), { ssr: false }) at usage site.
 */
export default function PointDataMap() {
    const [farmers, setFarmers] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataTypeFilter, setDataTypeFilter] = useState("all");
    const [cropSeasonFilter, setCropSeasonFilter] = useState("all");

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await analyticsApi.getFarmerLocations();
                const farmerData = res.data?.locations || res.data || [];
                setFarmers(Array.isArray(farmerData) ? farmerData : []);
                // Professionals and events endpoints not yet available
                setProfessionals([]);
                setEvents([]);
            } catch {
                setFarmers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Build pin data from all sources
    const allPins = useMemo(() => {
        const pins = [];

        // Farmer crop pins
        farmers.forEach((f) => {
            if (!f.latitude || !f.longitude) return;
            const lat = parseFloat(f.latitude);
            const lng = parseFloat(f.longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const ld = f.land_details || {};
            const name = f.name || "Unknown Farmer";
            const district = f.district || "";

            // Rabi crop pin
            if (ld.rabi_crop) {
                pins.push({
                    lat, lng,
                    type: "crop",
                    season: "rabi",
                    title: name,
                    subtitle: `Rabi: ${ld.rabi_crop}`,
                    district,
                    detail: `Land: ${ld.total_land_area || "—"} Bigha`,
                });
            }
            // Kharif crop pin
            if (ld.kharif_crop) {
                pins.push({
                    lat, lng,
                    type: "crop",
                    season: "kharif",
                    title: name,
                    subtitle: `Kharif: ${ld.kharif_crop}`,
                    district,
                    detail: `Land: ${ld.total_land_area || "—"} Bigha`,
                });
            }
            // Zaid crop pin
            if (ld.zaid_crop) {
                pins.push({
                    lat, lng,
                    type: "crop",
                    season: "zaid",
                    title: name,
                    subtitle: `Zaid: ${ld.zaid_crop}`,
                    district,
                    detail: `Land: ${ld.total_land_area || "—"} Bigha`,
                });
            }

            // Livestock pin (if any livestock)
            const lsd = f.livestock_details || {};
            const totalLivestock = (lsd.cow || 0) + (lsd.buffalo || 0) + (lsd.goat || 0) +
                (lsd.sheep || 0) + (lsd.pig || 0) + (lsd.poultry || 0) + (lsd.others || 0);
            if (totalLivestock > 0) {
                const parts = [];
                if (lsd.cow) parts.push(`Cow: ${lsd.cow}`);
                if (lsd.buffalo) parts.push(`Buffalo: ${lsd.buffalo}`);
                if (lsd.goat) parts.push(`Goat: ${lsd.goat}`);
                if (lsd.sheep) parts.push(`Sheep: ${lsd.sheep}`);
                if (lsd.poultry) parts.push(`Poultry: ${lsd.poultry}`);
                pins.push({
                    lat, lng,
                    type: "livestock",
                    season: null,
                    title: name,
                    subtitle: `${totalLivestock} animals`,
                    district,
                    detail: parts.join(", "),
                });
            }
        });

        return pins;
    }, [farmers, professionals, events]);

    // Apply filters
    const filteredPins = useMemo(() => {
        let result = allPins;
        if (dataTypeFilter !== "all") {
            result = result.filter((p) => p.type === dataTypeFilter);
        }
        if (cropSeasonFilter !== "all" && dataTypeFilter === "crop") {
            result = result.filter((p) => p.season === cropSeasonFilter);
        }
        return result;
    }, [allPins, dataTypeFilter, cropSeasonFilter]);

    if (loading) {
        return <Skeleton className="h-[480px] w-full rounded-xl" />;
    }

    if (allPins.length === 0) {
        return (
            <div className="h-[480px] w-full rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-400">
                No point data available
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Filter controls */}
            <div className="flex flex-wrap gap-2 items-center">
                {DATA_TYPE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => {
                            setDataTypeFilter(opt.value);
                            if (opt.value !== "crop" && opt.value !== "all") {
                                setCropSeasonFilter("all");
                            }
                        }}
                        aria-pressed={dataTypeFilter === opt.value}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            dataTypeFilter === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}

                {/* Crop season sub-filter */}
                {(dataTypeFilter === "crop" || dataTypeFilter === "all") && (
                    <>
                        <span className="text-muted-foreground mx-1">|</span>
                        {CROP_SEASON_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setCropSeasonFilter(opt.value)}
                                aria-pressed={cropSeasonFilter === opt.value}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                    cropSeasonFilter === opt.value
                                        ? "bg-emerald-700 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* Stats summary */}
            <div className="flex gap-3 text-sm text-muted-foreground">
                <span>Showing <strong className="text-foreground">{filteredPins.length}</strong> data points</span>
                {dataTypeFilter === "crop" && cropSeasonFilter !== "all" && (
                    <Badge variant="outline" className="capitalize text-xs">{cropSeasonFilter} season</Badge>
                )}
            </div>

            <MapContainer
                center={INDIA_CENTER}
                zoom={INDIA_ZOOM}
                minZoom={INDIA_MIN_ZOOM}
                maxZoom={INDIA_MAX_ZOOM}
                className="h-[480px] w-full rounded-xl z-0"
                scrollWheelZoom={true}
                style={{ background: "#18181b" }}
                aria-label="Point-based data map"
            >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <FitBounds points={filteredPins} />
                {filteredPins.map((pin, idx) => (
                    <Marker
                        key={`${pin.type}-${pin.lat}-${pin.lng}-${idx}`}
                        position={[pin.lat, pin.lng]}
                        icon={createColoredIcon(MARKER_COLORS[pin.type] || MARKER_COLORS.default)}
                    >
                        <Popup>
                            <div className="text-xs space-y-1 min-w-[140px]">
                                <p className="font-semibold text-sm">{pin.title}</p>
                                <p className="text-gray-600">{pin.subtitle}</p>
                                {pin.district && <p className="text-gray-500">📍 {pin.district}</p>}
                                {pin.detail && <p className="text-gray-500">{pin.detail}</p>}
                                <Badge variant="outline" className="capitalize text-[10px] text-foreground mt-1">{pin.type}</Badge>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
