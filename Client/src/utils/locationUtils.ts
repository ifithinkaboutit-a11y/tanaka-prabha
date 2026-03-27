// src/utils/locationUtils.ts
// Shared utilities for location picking — reverse geocoding, address parsing,
// and Places API search. Extracted from location-picker.tsx to keep the screen
// thin and make these functions independently testable.

import { getClosestLocation } from "./reverseGeocode";

const NOMINATIM_USER_AGENT = "TanakPrabha/1.0";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NominatimRawAddress {
    state?: string;
    state_district?: string;
    county?: string;
    suburb?: string;
    city_district?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    city?: string;
    postcode?: string;
    [key: string]: string | undefined;
}

export interface ParsedAddress {
    state: string;
    district: string;
    tehsil: string;
    block: string;
    village: string;
    pinCode: string;
}

export interface PlacePrediction {
    placeId: string;
    primaryName: string;
    subtitle: string;
}

// ─── Nominatim reverse geocode — display string ───────────────────────────────

export async function nominatimReverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
    const res = await fetch(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    const a: NominatimRawAddress = data.address ?? {};
    const parts: string[] = [];
    const locality = a.village || a.hamlet || a.suburb || a.town || a.city || a.county;
    if (locality) parts.push(locality);
    if (a.state_district || a.district) parts.push((a.state_district || a.district)!);
    if (a.state) parts.push(a.state);
    if (a.postcode) parts.push(a.postcode);
    return parts.length > 0 ? parts.join(", ") : (data.display_name ?? "Unknown location");
}

// ─── Parse Nominatim address into structured fields ───────────────────────────
// Nominatim is authoritative; local dataset fills gaps for block only.

export function parseNominatimAddress(
    addr: NominatimRawAddress,
    lat: number,
    lng: number,
    existingValues: Partial<ParsedAddress> = {}
): ParsedAddress {
    const local = getClosestLocation(lat, lng);

    return {
        state:    addr.state                                                          || local.state    || existingValues.state    || "",
        district: addr.state_district || addr.county                                 || local.district || existingValues.district || "",
        tehsil:   addr.suburb         || addr.city_district || addr.town             || local.tehsil   || existingValues.tehsil   || "",
        block:    /* Nominatim rarely has block */                                       local.block    || existingValues.block    || "",
        village:  addr.village        || addr.hamlet        || addr.suburb || addr.town || addr.city   || local.village   || existingValues.village  || "",
        pinCode:  addr.postcode                                                       || existingValues.pinCode  || "",
    };
}

// ─── Fetch structured Nominatim address object ────────────────────────────────

export async function fetchNominatimAddress(lat: number, lng: number): Promise<NominatimRawAddress> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();
    return data.address ?? {};
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
