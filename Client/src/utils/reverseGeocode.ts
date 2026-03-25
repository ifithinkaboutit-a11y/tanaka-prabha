import locationsData from "../data/indianLocations.json";

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

/**
 * Computes the approximate area of a polygon defined by lat/lng vertices in hectares,
 * using the spherical excess (shoelace) formula.
 *
 * Returns 0 for fewer than 3 vertices or degenerate polygons (all same point).
 */
export function computePolygonAreaHectares(vertices: Array<{ lat: number; lng: number }>): number {
    if (vertices.length < 3) return 0;

    // Check for degenerate polygon (all vertices are the same point)
    const first = vertices[0];
    const isDegenerate = vertices.every(v => v.lat === first.lat && v.lng === first.lng);
    if (isDegenerate) return 0;

    const R = 6371; // Earth radius in km
    const n = vertices.length;

    // Spherical excess shoelace formula:
    // area = |Σ (lng[i+1] - lng[i-1]) * sin(lat[i])| / 2  (in steradians)
    // then multiply by R² to get km², then by 100 to get hectares
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const prev = vertices[(i - 1 + n) % n];
        const curr = vertices[i];
        const next = vertices[(i + 1) % n];

        const lngDiff = (next.lng - prev.lng) * (Math.PI / 180);
        const latRad = curr.lat * (Math.PI / 180);

        sum += lngDiff * Math.sin(latRad);
    }

    const areaKm2 = Math.abs(sum) * R * R / 2;
    return areaKm2 * 100; // 1 km² = 100 hectares
}

export function getClosestLocation(lat: number, lng: number) {
    const formatVal = (val: string) => val.toLowerCase().replace(/ /g, "_");

    // Pass 1: find closest district across all states
    let minDistance = Infinity;
    let closestState = "";
    let closestDistrict = "";
    let closestDistrictData: (typeof locationsData.states)[0]["districts"][0] | null = null;

    for (const state of locationsData.states) {
        for (const district of state.districts) {
            const dist = haversineDistanceKm(lat, lng, district.coordinates.lat, district.coordinates.lng);
            if (dist < minDistance) {
                minDistance = dist;
                closestState = formatVal(state.name);
                closestDistrict = formatVal(district.name);
                closestDistrictData = district;
            }
        }
    }

    // If distance is too far (e.g. > 500km), we assume the sample DB doesn't cover it
    if (minDistance > 500) {
        return { state: "", district: "", tehsil: "", block: "", village: "" };
    }

    if (!closestDistrictData || !closestDistrictData.tehsils || closestDistrictData.tehsils.length === 0) {
        return { state: closestState, district: closestDistrict, tehsil: "", block: "", village: "" };
    }

    // Pass 2: within the closest district, find closest tehsil by haversine (where coords exist)
    type Tehsil = (typeof closestDistrictData.tehsils)[0];
    let closestTehsilData: Tehsil = closestDistrictData.tehsils[0];
    let minTehsilDist = Infinity;
    let anyTehsilCoords = false;

    for (const tehsil of closestDistrictData.tehsils) {
        const coords = (tehsil as Tehsil & { coordinates?: { lat: number; lng: number } }).coordinates;
        if (coords) {
            anyTehsilCoords = true;
            const dist = haversineDistanceKm(lat, lng, coords.lat, coords.lng);
            if (dist < minTehsilDist) {
                minTehsilDist = dist;
                closestTehsilData = tehsil;
            }
        }
    }
    // If no tehsil had coordinates, closestTehsilData remains the first entry (fallback)
    if (!anyTehsilCoords) {
        closestTehsilData = closestDistrictData.tehsils[0];
    }

    const closestTehsil = closestTehsilData.name;

    if (!closestTehsilData.blocks || closestTehsilData.blocks.length === 0) {
        return { state: closestState, district: closestDistrict, tehsil: closestTehsil, block: "", village: "" };
    }

    // Pass 3: within the closest tehsil, find closest block by haversine (where coords exist)
    type Block = (typeof closestTehsilData.blocks)[0];
    let closestBlockData: Block = closestTehsilData.blocks[0];
    let minBlockDist = Infinity;
    let anyBlockCoords = false;

    for (const block of closestTehsilData.blocks) {
        const coords = (block as Block & { coordinates?: { lat: number; lng: number } }).coordinates;
        if (coords) {
            anyBlockCoords = true;
            const dist = haversineDistanceKm(lat, lng, coords.lat, coords.lng);
            if (dist < minBlockDist) {
                minBlockDist = dist;
                closestBlockData = block;
            }
        }
    }
    // If no block had coordinates, closestBlockData remains the first entry (fallback)
    if (!anyBlockCoords) {
        closestBlockData = closestTehsilData.blocks[0];
    }

    const closestBlock = closestBlockData.name;

    if (!closestBlockData.villages || closestBlockData.villages.length === 0) {
        return { state: closestState, district: closestDistrict, tehsil: closestTehsil, block: closestBlock, village: "" };
    }

    // Pass 4: within the closest block, find closest village by haversine (where coords exist)
    // Villages are strings in the current data; fall back to first entry
    type Village = (typeof closestBlockData.villages)[0];
    let closestVillage: string = typeof closestBlockData.villages[0] === "string"
        ? closestBlockData.villages[0] as string
        : (closestBlockData.villages[0] as { name: string }).name;
    let minVillageDist = Infinity;
    let anyVillageCoords = false;

    for (const village of closestBlockData.villages) {
        if (typeof village === "object" && village !== null) {
            const coords = (village as { coordinates?: { lat: number; lng: number } }).coordinates;
            if (coords) {
                anyVillageCoords = true;
                const dist = haversineDistanceKm(lat, lng, coords.lat, coords.lng);
                if (dist < minVillageDist) {
                    minVillageDist = dist;
                    closestVillage = (village as { name: string }).name;
                }
            }
        }
    }
    // If no village had coordinates, closestVillage remains the first entry (fallback)
    if (!anyVillageCoords) {
        closestVillage = typeof closestBlockData.villages[0] === "string"
            ? closestBlockData.villages[0] as string
            : (closestBlockData.villages[0] as { name: string }).name;
    }

    return {
        state: closestState,
        district: closestDistrict,
        tehsil: closestTehsil,
        block: closestBlock,
        village: closestVillage
    };
}
