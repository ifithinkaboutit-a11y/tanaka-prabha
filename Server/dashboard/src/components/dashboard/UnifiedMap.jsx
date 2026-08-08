"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { analyticsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cropLabel, parseCropList } from "@/lib/crops";
import {
    INDIA_CENTER,
    INDIA_ZOOM,
    INDIA_MIN_ZOOM,
    INDIA_MAX_ZOOM,
    HEAT_OPTIONS,
    TILE_URL,
    TILE_ATTRIBUTION,
} from "./heatmap-config";

// Fix default marker icons for Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Colours keep >=3:1 contrast (WCAG 1.4.11) against the marker's white stroke.
const MARKER_COLORS = {
    user: "#0891b2",       // cyan-600
    land: "#7c3aed",       // violet-600
    crop: "#15803d",       // green-700
    livestock: "#a16207",  // yellow-700
    default: "#6b7280",
};

const iconCache = new Map();
function coloredIcon(color) {
    if (iconCache.has(color)) return iconCache.get(color);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`;
    const icon = L.divIcon({
        html: svg,
        className: "custom-marker-icon",
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
    });
    iconCache.set(color, icon);
    return icon;
}

// ── Dataset definitions ──────────────────────────────────────────────────────
// `heatDivisor` normalises raw intensity into leaflet.heat's 0–1 range and is
// carried over verbatim from the four maps this component replaces, so the
// heat rendering is unchanged.
const DATASETS = [
    { key: "all", label: "All Data Points", heatDivisor: 5 },
    { key: "users", label: "User Distribution", heatDivisor: 500 },
    { key: "landholding", label: "Landholding", heatDivisor: 20 },
    { key: "livestock", label: "Livestock", heatDivisor: 500 },
    { key: "crops", label: "Crops", heatDivisor: 5 },
];

const LAND_BUCKETS = [
    { value: "small", label: "< 1 Bigha" },
    { value: "medium", label: "1–5 Bigha" },
    { value: "large", label: "5–10 Bigha" },
    { value: "xlarge", label: "> 10 Bigha" },
];

const ANIMAL_TYPES = [
    { value: "cow", label: "Cow" },
    { value: "buffalo", label: "Buffalo" },
    { value: "goat", label: "Goat" },
    { value: "sheep", label: "Sheep" },
    { value: "poultry", label: "Poultry" },
    { value: "others", label: "Others" },
];

const CROP_SEASON_FILTERS = [
    { value: "rabi", label: "Rabi" },
    { value: "kharif", label: "Kharif" },
    { value: "zaid", label: "Zaid" },
];

function landBucket(area) {
    const n = parseFloat(area);
    if (!area || isNaN(n)) return "small";
    if (n < 1) return "small";
    if (n < 5) return "medium";
    if (n < 10) return "large";
    return "xlarge";
}

/** Sum of livestock counts for a record, optionally restricted to selected types. */
export function livestockCount(record, types = []) {
    const keys = types.length > 0 ? types : ANIMAL_TYPES.map((a) => a.value);
    return keys.reduce((sum, k) => sum + (Number(record?.[k]) || 0), 0);
}

// ── Map layers ───────────────────────────────────────────────────────────────

function HeatLayer({ points, divisor }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function draw() {
            const [, leaflet] = await Promise.all([
                import("leaflet.heat"),
                import("leaflet"),
            ]);
            if (cancelled) return;
            const Leaflet = leaflet.default;

            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
            if (!points || points.length === 0) return;

            const heatData = points.map((p) => [
                p.lat,
                p.lng,
                Math.max(0.1, Math.min(1.0, (p.intensity || 1) / divisor)),
            ]);
            layerRef.current = Leaflet.heatLayer(heatData, HEAT_OPTIONS);
            layerRef.current.addTo(map);
        }

        draw();

        return () => {
            cancelled = true;
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [map, points, divisor]);

    return null;
}

/** Fit the viewport to the visible points; used in pin mode only. */
function FitBounds({ points, enabled }) {
    const map = useMap();

    useEffect(() => {
        if (!enabled || !points || points.length === 0) return;
        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], INDIA_ZOOM);
            return;
        }
        map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
            padding: [50, 50],
        });
    }, [map, points, enabled]);

    return null;
}

/** Small toggleable chip. Selecting none means "all". */
function Chip({ active, onClick, children, size = "sm" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full font-medium transition-colors ${
                size === "sm" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
            } ${
                active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
        >
            {children}
        </button>
    );
}

/**
 * UnifiedMap — one map for every analytics layer.
 *
 * Replaces the four separate maps (user heatmap, landholding heatmap, livestock
 * heatmap, point data map). Every filter those maps offered is preserved, and
 * each dataset can now be rendered as either a heatmap or pins.
 *
 * MUST be used with dynamic(() => import(...), { ssr: false }).
 */
export default function UnifiedMap() {
    const [mode, setMode] = useState("heatmap");
    const [dataset, setDataset] = useState("all");
    const [loading, setLoading] = useState(true);

    const [userPoints, setUserPoints] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [livestockFarmers, setLivestockFarmers] = useState([]);

    // Sub-filters — empty array means "no constraint"
    const [buckets, setBuckets] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [seasons, setSeasons] = useState([]);

    useEffect(() => {
        let cancelled = false;

        async function fetchAll() {
            // One dataset failing must not blank the whole map.
            const [heat, locations, livestock] = await Promise.allSettled([
                analyticsApi.getUserHeatmap(),
                analyticsApi.getFarmerLocations(),
                analyticsApi.getLivestockStatistics(),
            ]);
            if (cancelled) return;

            setUserPoints(
                heat.status === "fulfilled" ? heat.value?.data?.points || [] : []
            );

            const locData =
                locations.status === "fulfilled"
                    ? locations.value?.data?.locations || locations.value?.data || []
                    : [];
            setFarmers(Array.isArray(locData) ? locData : []);

            setLivestockFarmers(
                livestock.status === "fulfilled"
                    ? livestock.value?.data?.farmers || []
                    : []
            );
            setLoading(false);
        }

        fetchAll();
        return () => { cancelled = true; };
    }, []);

    function toggle(list, setList, value) {
        setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    }

    // ── Build the visible point set for the active dataset ───────────────────
    const points = useMemo(() => {
        const coordsOf = (f) => {
            const lat = parseFloat(f.latitude ?? f.lat);
            const lng = parseFloat(f.longitude ?? f.lng);
            return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
        };

        const cropPins = () => {
            const out = [];
            for (const f of farmers) {
                const c = coordsOf(f);
                if (!c) continue;
                const land = f.land_details || {};
                for (const season of CROP_SEASON_FILTERS) {
                    if (seasons.length > 0 && !seasons.includes(season.value)) continue;
                    const crops = parseCropList(land[`${season.value}_crop`]);
                    // Each crop is its own point, so a farmer growing three crops
                    // in a season contributes three — matching the table's chips.
                    for (const crop of crops) {
                        out.push({
                            ...c,
                            kind: "crop",
                            intensity: 1,
                            title: f.name || "Unknown Farmer",
                            subtitle: `${season.label}: ${cropLabel(crop)}`,
                            district: f.district || "",
                            detail: `Land: ${land.total_land_area || "—"} Bigha`,
                        });
                    }
                }
            }
            return out;
        };

        const livestockPins = () => {
            const out = [];
            for (const f of farmers) {
                const c = coordsOf(f);
                if (!c) continue;
                const ls = f.livestock_details || {};
                const total = livestockCount(ls, animals);
                if (total <= 0) continue;
                const parts = ANIMAL_TYPES
                    .filter((a) => (animals.length === 0 || animals.includes(a.value)) && ls[a.value])
                    .map((a) => `${a.label}: ${ls[a.value]}`);
                out.push({
                    ...c,
                    kind: "livestock",
                    intensity: total,
                    title: f.name || "Unknown Farmer",
                    subtitle: `${total} animals`,
                    district: f.district || "",
                    detail: parts.join(", "),
                });
            }
            return out;
        };

        switch (dataset) {
            case "users":
                return userPoints
                    .map((p) => ({
                        lat: parseFloat(p.lat),
                        lng: parseFloat(p.lng),
                        kind: "user",
                        intensity: p.intensity || 1,
                        title: "Registered farmers",
                        subtitle: `${p.intensity || 1} in this area`,
                        district: p.district || "",
                        detail: "",
                    }))
                    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

            case "landholding":
                return farmers
                    .map((f) => {
                        const c = coordsOf(f);
                        if (!c) return null;
                        const area = f.land_details?.total_land_area ?? f.total_land_area;
                        const bucket = landBucket(area);
                        if (buckets.length > 0 && !buckets.includes(bucket)) return null;
                        return {
                            ...c,
                            kind: "land",
                            intensity: parseFloat(area) || 1,
                            title: f.name || "Unknown Farmer",
                            subtitle: `${area || "—"} Bigha`,
                            district: f.district || "",
                            detail: LAND_BUCKETS.find((b) => b.value === bucket)?.label || "",
                        };
                    })
                    .filter(Boolean);

            case "livestock": {
                // The livestock endpoint is already lat/lng + per-animal counts.
                const fromStats = livestockFarmers
                    .map((f) => {
                        const c = coordsOf(f);
                        if (!c) return null;
                        const total = livestockCount(f, animals);
                        if (total <= 0) return null;
                        const parts = ANIMAL_TYPES
                            .filter((a) => (animals.length === 0 || animals.includes(a.value)) && f[a.value])
                            .map((a) => `${a.label}: ${f[a.value]}`);
                        return {
                            ...c,
                            kind: "livestock",
                            intensity: total,
                            title: f.name || "Farmer",
                            subtitle: `${total} animals`,
                            district: f.district || "",
                            detail: parts.join(", "),
                        };
                    })
                    .filter(Boolean);
                return fromStats.length > 0 ? fromStats : livestockPins();
            }

            case "crops":
                return cropPins();

            case "all":
            default:
                return [...cropPins(), ...livestockPins()];
        }
    }, [dataset, userPoints, farmers, livestockFarmers, buckets, animals, seasons]);

    const activeDataset = DATASETS.find((d) => d.key === dataset) || DATASETS[0];

    if (loading) {
        return <Skeleton className="h-[520px] w-full rounded-xl" />;
    }

    const showLandFilter = dataset === "landholding";
    const showAnimalFilter = dataset === "livestock" || dataset === "all";
    const showSeasonFilter = dataset === "crops" || dataset === "all";
    const hasSubFilters = showLandFilter || showAnimalFilter || showSeasonFilter;
    const activeSubFilters = buckets.length + animals.length + seasons.length;

    return (
        <div className="flex flex-col gap-3">
            {/* Dataset + render mode */}
            <div className="flex flex-wrap items-center gap-2">
                {DATASETS.map((d) => (
                    <Chip key={d.key} active={dataset === d.key} onClick={() => setDataset(d.key)}>
                        {d.label}
                    </Chip>
                ))}

                <div className="ml-auto flex items-center gap-1 rounded-full bg-muted p-1">
                    {[
                        { value: "heatmap", label: "Heatmap" },
                        { value: "pins", label: "Pins" },
                    ].map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            onClick={() => setMode(m.value)}
                            aria-pressed={mode === m.value}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                mode === m.value
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dataset-specific sub-filters — select none for all */}
            {hasSubFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {showLandFilter &&
                        LAND_BUCKETS.map((b) => (
                            <Chip
                                key={b.value}
                                size="xs"
                                active={buckets.includes(b.value)}
                                onClick={() => toggle(buckets, setBuckets, b.value)}
                            >
                                {b.label}
                            </Chip>
                        ))}

                    {showAnimalFilter &&
                        ANIMAL_TYPES.map((a) => (
                            <Chip
                                key={a.value}
                                size="xs"
                                active={animals.includes(a.value)}
                                onClick={() => toggle(animals, setAnimals, a.value)}
                            >
                                {a.label}
                            </Chip>
                        ))}

                    {showSeasonFilter &&
                        CROP_SEASON_FILTERS.map((s) => (
                            <Chip
                                key={s.value}
                                size="xs"
                                active={seasons.includes(s.value)}
                                onClick={() => toggle(seasons, setSeasons, s.value)}
                            >
                                {s.label}
                            </Chip>
                        ))}

                    {activeSubFilters > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground"
                            onClick={() => { setBuckets([]); setAnimals([]); setSeasons([]); }}
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            )}

            {/* Summary + pin legend */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                    Showing <strong className="text-foreground">{points.length}</strong>{" "}
                    {mode === "heatmap" ? "weighted points" : "pins"}
                </span>
                <Badge variant="outline" className="text-xs">{activeDataset.label}</Badge>
                {mode === "pins" && points.length > 0 && (
                    <span className="flex flex-wrap items-center gap-3">
                        {[...new Set(points.map((p) => p.kind))].map((kind) => (
                            <span key={kind} className="flex items-center gap-1.5 text-xs capitalize">
                                <span
                                    className="inline-block size-2.5 rounded-full"
                                    style={{ background: MARKER_COLORS[kind] || MARKER_COLORS.default }}
                                />
                                {kind}
                            </span>
                        ))}
                    </span>
                )}
            </div>

            {points.length === 0 ? (
                <div className="flex h-[520px] w-full items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
                    No data available for this selection
                </div>
            ) : (
                <MapContainer
                    center={INDIA_CENTER}
                    zoom={INDIA_ZOOM}
                    minZoom={INDIA_MIN_ZOOM}
                    maxZoom={INDIA_MAX_ZOOM}
                    className="h-[520px] w-full rounded-xl z-0"
                    scrollWheelZoom
                    style={{ background: "#18181b" }}
                    aria-label={`${activeDataset.label} ${mode}`}
                >
                    <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

                    {mode === "heatmap" ? (
                        <HeatLayer points={points} divisor={activeDataset.heatDivisor} />
                    ) : (
                        <>
                            <FitBounds points={points} enabled />
                            {points.map((p, i) => (
                                <Marker
                                    key={`${p.kind}-${p.lat}-${p.lng}-${i}`}
                                    position={[p.lat, p.lng]}
                                    icon={coloredIcon(MARKER_COLORS[p.kind] || MARKER_COLORS.default)}
                                >
                                    <Popup>
                                        <div className="min-w-[140px] space-y-1 text-xs">
                                            <p className="text-sm font-semibold">{p.title}</p>
                                            {p.subtitle && <p className="text-gray-600">{p.subtitle}</p>}
                                            {p.district && <p className="text-gray-500">📍 {p.district}</p>}
                                            {p.detail && <p className="text-gray-500">{p.detail}</p>}
                                            <Badge variant="outline" className="mt-1 text-[10px] capitalize text-foreground">
                                                {p.kind}
                                            </Badge>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </>
                    )}
                </MapContainer>
            )}
        </div>
    );
}
