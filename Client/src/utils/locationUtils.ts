// src/utils/locationUtils.ts
// Shared utilities for location picking — reverse geocoding via Google Geocoding API,
// address parsing, and Places API search.

import { getClosestLocation } from "./reverseGeocode";

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedAddress {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pinCode: string;
    postOffice: string;
}

export interface PlacePrediction {
    placeId: string;
    primaryName: string;
    subtitle: string;
}

interface GeoComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

// ─── Google Geocoding — fetch raw address components ─────────────────────────

async function fetchGoogleGeocode(lat: number, lng: number): Promise<GeoComponent[]> {
    const params = new URLSearchParams({
        latlng: `${lat},${lng}`,
        key: MAPS_KEY,
        language: "en",
        result_type: "street_address|sublocality|locality|administrative_area_level_3|administrative_area_level_2|administrative_area_level_1|postal_code",
    });
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params}`
    );
    if (!res.ok) throw new Error(`Google Geocoding HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Geocoding: ${data.status}`);
    }
    // Use the most detailed result (first one)
    return data.results?.[0]?.address_components ?? [];
}

function getComponent(components: GeoComponent[], ...types: string[]): string {
    for (const type of types) {
        const found = components.find(c => c.types.includes(type));
        if (found) return found.long_name;
    }
    return "";
}

// ─── Google reverse geocode — human-readable display string ──────────────────

export async function googleReverseGeocode(lat: number, lng: number): Promise<string> {
    const components = await fetchGoogleGeocode(lat, lng);
    if (components.length === 0) return "Unknown location";

    const parts: string[] = [];
    const locality = getComponent(components, "sublocality_level_1", "sublocality", "locality", "administrative_area_level_4");
    const district = getComponent(components, "administrative_area_level_3", "administrative_area_level_2");
    const state    = getComponent(components, "administrative_area_level_1");
    const pinCode  = getComponent(components, "postal_code");

    if (locality) parts.push(locality);
    if (district) parts.push(district);
    if (state)    parts.push(state);
    if (pinCode)  parts.push(pinCode);
    return parts.length > 0 ? parts.join(", ") : "Unknown location";
}

// ─── Parse Google address components into structured form fields ──────────────
// Google is authoritative for state/district/pinCode/village.
// Local DB fills block (Google rarely returns it for rural India).

export async function parseGoogleAddress(
    lat: number,
    lng: number,
    existingValues: Partial<ParsedAddress> = {}
): Promise<ParsedAddress> {
    const components = await fetchGoogleGeocode(lat, lng);
    const local = getClosestLocation(lat, lng);

    const state      = getComponent(components, "administrative_area_level_1")                                                  || local.state    || existingValues.state      || "";
    const district   = getComponent(components, "administrative_area_level_3", "administrative_area_level_2")                   || local.district || existingValues.district   || "";
    const tehsil     = getComponent(components, "administrative_area_level_4", "administrative_area_level_3", "sublocality_level_1", "sublocality", "locality") || local.tehsil   || existingValues.tehsil     || "";
    const block      = local.block                                                                                               || existingValues.block      || "";
    const village    = getComponent(components, "sublocality_level_2", "sublocality_level_1", "sublocality", "neighborhood", "locality", "administrative_area_level_4") || local.village  || existingValues.village    || "";
    const pinCode    = getComponent(components, "postal_code")                                                                  || existingValues.pinCode    || "";
    // Google returns post_box or premise for post offices in some Indian results
    const postOffice = getComponent(components, "post_box", "premise")                                                          || existingValues.postOffice || "";

    return { state, district, tehsil, block, village, pinCode, postOffice };
}

// ─── Google Places Autocomplete ───────────────────────────────────────────────

export async function fetchPlacePredictions(
    input: string,
    apiKey: string
): Promise<PlacePrediction[]> {
    const params = new URLSearchParams({
        input,
        key: apiKey,
        components: "country:in",
        language: "en",
        types: "(regions)",
    });
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    );
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places Autocomplete: ${data.status}`);
    }

    return (data.predictions ?? []).map((p: any) => ({
        placeId: p.place_id as string,
        primaryName: truncate(p.structured_formatting?.main_text ?? p.description, 40),
        subtitle: truncate(p.structured_formatting?.secondary_text ?? "", 60),
    }));
}

// ─── Google Place Details — resolve place_id → lat/lng ───────────────────────

export async function fetchPlaceLatLng(
    placeId: string,
    apiKey: string
): Promise<{ lat: number; lng: number }> {
    const params = new URLSearchParams({
        place_id: placeId,
        key: apiKey,
        fields: "geometry",
    });
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );
    const data = await res.json();
    if (data.status !== "OK") throw new Error(`Place Details: ${data.status}`);
    const { lat, lng } = data.result.geometry.location;
    return { lat, lng };
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function truncate(s: string, maxLen: number): string {
    return s.length <= maxLen ? s : s.slice(0, maxLen) + "…";
}

export function formatAccuracyLabel(accuracyM: number): string {
    return `±${Math.round(accuracyM)}m`;
}
