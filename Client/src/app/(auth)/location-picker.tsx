// src/app/(auth)/location-picker.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { userApi } from "../../services/apiService";
import { useAuth } from "../../contexts/AuthContext";
import { getClosestLocation } from "../../utils/reverseGeocode";
import {
    Alert,
    BackHandler,
    Dimensions,
    Keyboard,
    Linking,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import WebView from "react-native-webview";
import AppText from "../../components/atoms/AppText";
import { useOnboardingStore } from "../../stores/onboardingStore";

export const unstable_settings = { headerShown: false };

// ─── Constants ────────────────────────────────────────────────────────────────

const INDIA_FALLBACK = { lat: 20.5937, lng: 78.9629, zoom: 5 };
const GPS_TIMEOUT_MS = 10_000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Leaflet HTML ─────────────────────────────────────────────────────────────
// Self-contained HTML page injected into WebView.
// Uses CDN Leaflet (works offline after first cache), OSM tiles (no API key).
// Communicates via window.ReactNativeWebView.postMessage / injectedJavaScript.

function buildLeafletHTML(lat: number, lng: number, zoom: number): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html, body { margin:0; padding:0; height:100%; width:100%; background:#f0f4f0; }
  #map { height:100%; width:100%; }
  /* Centre crosshair pin */
  #pin {
    position:fixed; top:50%; left:50%;
    transform:translate(-50%,-100%);
    pointer-events:none; z-index:9999;
    display:flex; flex-direction:column; align-items:center;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
  }
  #pin-head {
    width:26px; height:26px; border-radius:50%;
    background:#386641; border:3px solid #fff;
  }
  #pin-stem {
    width:3px; height:16px; background:#386641; margin-top:-2px;
  }
  #pin-dot {
    width:10px; height:5px; border-radius:50%;
    background:rgba(0,0,0,0.18); margin-top:2px;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="pin">
  <div id="pin-head"></div>
  <div id="pin-stem"></div>
  <div id="pin-dot"></div>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map', {
  center: [${lat}, ${lng}],
  zoom: ${zoom},
  zoomControl: true,
  attributionControl: false
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Throttle move events so we don't spam RN bridge
var moveTimer = null;
function onMapMove() {
  clearTimeout(moveTimer);
  moveTimer = setTimeout(function() {
    var c = map.getCenter();
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type:'move', lat: c.lat, lng: c.lng })
    );
  }, 250);
}

map.on('move', onMapMove);

// Allow RN to fly the map to a coordinate
window.flyTo = function(lat, lng, zoom) {
  map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 0.8 });
};

// Emit initial centre so RN knows starting coords
onMapMove();
</script>
</body>
</html>`;
}

// ─── Nominatim reverse geocode (OSM, free, no API key) ───────────────────────
async function nominatimReverseGeocode(lat: number, lng: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
        headers: { "User-Agent": "TanakPrabha/1.0" },
    });
    if (!res.ok) throw new Error("Nominatim error");
    const data = await res.json();
    // Build a human-readable address from the parts Nominatim returns
    const a = data.address ?? {};
    const parts: string[] = [];
    const village = a.village || a.hamlet || a.suburb || a.town || a.city || a.county;
    if (village) parts.push(village);
    if (a.state_district || a.district) parts.push(a.state_district || a.district);
    if (a.state) parts.push(a.state);
    if (a.postcode) parts.push(a.postcode);
    return parts.length > 0 ? parts.join(", ") : (data.display_name ?? "Unknown location");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionState = "loading" | "granted" | "denied";
interface PinCoords { lat: number; lng: number; }
interface SearchResult { placeId: string; description: string; lat: number; lng: number; }

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LocationPickerScreen() {
    const router = useRouter();
    const { isForLand, fromProfile, purpose } = useLocalSearchParams<{
        isForLand?: string;
        fromProfile?: string;
        purpose?: string;
    }>();
    const isLandFlow = isForLand === "true";
    const isProfileMode = fromProfile === "true" || !!purpose;

    const {
        locationData,
        landLocationData,
        setLocationData,
        setLandLocationData,
        personalDetails,
        updatePersonalDetails,
        setProfileAddressOverride,
    } = useOnboardingStore();

    // ── State ──────────────────────────────────────────────────────────────────
    const [permissionState, setPermissionState] = useState<PermissionState>("loading");
    const [initialPos, setInitialPos] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
    const [gpsFallbackUsed, setGpsFallbackUsed] = useState(false);
    const [gpsAccuracy, setGpsAccuracy] = useState<number>(50);

    const [pinCoords, setPinCoords] = useState<PinCoords | null>(null);
    const [address, setAddress] = useState<string>("");
    const [geocodeLoading, setGeocodeLoading] = useState(false);
    const [geocodeError, setGeocodeError] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    // Search
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const webViewRef = useRef<WebView>(null);
    const geocodeRequestId = useRef(0);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Back-navigation guard ───────────────────────────────────────────────────
    const relevantLocationData = isLandFlow ? landLocationData : locationData;
    useEffect(() => {
        if (isProfileMode || relevantLocationData === null) return;
        const onBack = () => {
            Alert.alert(
                "Change location?",
                "Going back will clear your confirmed pin.",
                [
                    { text: "Stay here", style: "cancel" },
                    {
                        text: "Go back",
                        style: "destructive",
                        onPress: () => {
                            if (isLandFlow) setLandLocationData(null);
                            else setLocationData(null);
                            router.back();
                        },
                    },
                ]
            );
            return true;
        };
        const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
        return () => sub.remove();
    }, [isProfileMode, relevantLocationData, isLandFlow, setLandLocationData, setLocationData, router]);

    // ── Reverse geocode via Nominatim ──────────────────────────────────────────
    const geocodeCoords = useCallback(async (lat: number, lng: number) => {
        const requestId = ++geocodeRequestId.current;
        setGeocodeLoading(true);
        setGeocodeError(false);
        try {
            const result = await nominatimReverseGeocode(lat, lng);
            if (requestId !== geocodeRequestId.current) return;
            setAddress(result);
        } catch {
            if (requestId === geocodeRequestId.current) {
                setGeocodeError(true);
                setAddress("");
            }
        } finally {
            if (requestId === geocodeRequestId.current) setGeocodeLoading(false);
        }
    }, []);

    // ── GPS acquisition ────────────────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!isMounted) return;

                if (status !== "granted") {
                    setPermissionState("denied");
                    setInitialPos({ ...INDIA_FALLBACK });
                    return;
                }

                if (!isMounted) return;
                setPermissionState("granted");

                try {
                    const positionPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error("gps_timeout")), GPS_TIMEOUT_MS);
                    });

                    const loc = await Promise.race<Location.LocationObject>([positionPromise, timeoutPromise]);
                    if (timeoutId) clearTimeout(timeoutId);

                    if (isMounted) {
                        const { latitude, longitude, accuracy } = loc.coords;
                        setGpsAccuracy(accuracy ?? 50);
                        setInitialPos({ lat: latitude, lng: longitude, zoom: 15 });
                        setPinCoords({ lat: latitude, lng: longitude });
                        geocodeCoords(latitude, longitude);
                    }
                } catch {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (isMounted) {
                        setGpsFallbackUsed(true);
                        setInitialPos({ ...INDIA_FALLBACK });
                    }
                }
            } catch {
                if (timeoutId) clearTimeout(timeoutId);
                if (isMounted) {
                    setPermissionState("denied");
                    setInitialPos({ ...INDIA_FALLBACK });
                }
            }
        })();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [geocodeCoords]);

    // ── WebView → RN message handler ───────────────────────────────────────────
    const handleWebViewMessage = useCallback((event: any) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === "move") {
                const { lat, lng } = msg;
                setPinCoords({ lat, lng });
                geocodeCoords(lat, lng);
            }
        } catch { /* malformed message */ }
    }, [geocodeCoords]);

    // ── Fly map to coords ──────────────────────────────────────────────────────
    const flyTo = useCallback((lat: number, lng: number, zoom = 15) => {
        webViewRef.current?.injectJavaScript(`flyTo(${lat}, ${lng}, ${zoom}); true;`);
    }, []);

    // ── Search (Nominatim forward geocode) ─────────────────────────────────────
    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (text.trim().length < 3) { setShowResults(false); return; }

        searchTimeout.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=in`;
                const res = await fetch(url, { headers: { "User-Agent": "TanakPrabha/1.0" } });
                const data: any[] = await res.json();
                const mapped: SearchResult[] = data.map((r, i) => ({
                    placeId: r.place_id?.toString() ?? `${i}`,
                    description: r.display_name,
                    lat: parseFloat(r.lat),
                    lng: parseFloat(r.lon),
                }));
                setSearchResults(mapped);
                setShowResults(mapped.length > 0);
            } catch {
                setSearchResults([]);
                setShowResults(false);
            } finally {
                setSearchLoading(false);
            }
        }, 600);
    }, []);

    const handleSearchSelect = useCallback((result: SearchResult) => {
        flyTo(result.lat, result.lng, 15);
        setPinCoords({ lat: result.lat, lng: result.lng });
        geocodeCoords(result.lat, result.lng);
        setSearchText(result.description.split(",")[0]); // show just the first part
        setShowResults(false);
        Keyboard.dismiss();
    }, [flyTo, geocodeCoords]);

    // ── Confirm ────────────────────────────────────────────────────────────────
    const handleConfirm = async () => {
        if (!pinCoords) return;
        setSaving(true);

        const newLocInfo = {
            lat: pinCoords.lat,
            lng: pinCoords.lng,
            address: address || "Unknown location",
            accuracy: gpsAccuracy,
            setAt: new Date().toISOString(),
            method: "gps" as const,
        };

        if (isProfileMode) {
            try {
                if (purpose === "profile") {
                    const localMatch = getClosestLocation(pinCoords.lat, pinCoords.lng);

                    // Also try Nominatim for more granular address parts
                    let nominatimAddr: any = {};
                    try {
                        const url = `https://nominatim.openstreetmap.org/reverse?lat=${pinCoords.lat}&lon=${pinCoords.lng}&format=json&addressdetails=1`;
                        const res = await fetch(url, { headers: { "User-Agent": "TanakPrabha/1.0" } });
                        const data = await res.json();
                        nominatimAddr = data.address ?? {};
                    } catch { /* non-fatal */ }

                    const override: Record<string, string> = {};
                    const state = localMatch.state || nominatimAddr.state || "";
                    const district = localMatch.district || nominatimAddr.state_district || nominatimAddr.county || "";
                    const tehsil = localMatch.tehsil || nominatimAddr.county || "";
                    const block = localMatch.block || "";
                    const village = localMatch.village || nominatimAddr.village || nominatimAddr.town || nominatimAddr.city || "";
                    const pinCode = nominatimAddr.postcode || "";

                    if (state) override.state = state;
                    if (district) override.district = district;
                    if (tehsil) override.tehsil = tehsil;
                    if (block) override.block = block;
                    if (village) override.village = village;
                    if (pinCode) override.pinCode = pinCode;

                    setProfileAddressOverride(override);
                    setSaving(false);
                    router.back();
                    return;
                }

                if (isLandFlow) {
                    await userApi.updateProfile({
                        land_details: {
                            latitude: newLocInfo.lat,
                            longitude: newLocInfo.lng,
                            location_address: newLocInfo.address,
                        },
                    });
                } else {
                    await userApi.updateProfile({ location: newLocInfo });
                }
            } catch (error) {
                console.error("Failed to update location from profile:", error);
            }
            if (router.canGoBack()) router.back();
            else router.push("/(tab)/profile" as any);
            setSaving(false);
            return;
        }

        if (isLandFlow) {
            setLandLocationData(newLocInfo);
        } else {
            setLocationData(newLocInfo);
        }

        if (!isLandFlow) {
            try {
                const localMatch = getClosestLocation(pinCoords.lat, pinCoords.lng);

                // Nominatim gives us structured address fields
                let nominatimAddr: any = {};
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?lat=${pinCoords.lat}&lon=${pinCoords.lng}&format=json&addressdetails=1`;
                    const res = await fetch(url, { headers: { "User-Agent": "TanakPrabha/1.0" } });
                    const data = await res.json();
                    nominatimAddr = data.address ?? {};
                } catch { /* non-fatal */ }

                const current = personalDetails;
                const updates: Record<string, string> = {};

                const newState = localMatch.state || current.state || nominatimAddr.state || "";
                if (newState) updates.state = newState;

                const newDistrict = localMatch.district || current.district || nominatimAddr.state_district || nominatimAddr.county || "";
                if (newDistrict) updates.district = newDistrict;

                const newTehsil = localMatch.tehsil || current.tehsil || "";
                if (newTehsil) updates.tehsil = newTehsil;

                const newBlock = localMatch.block || current.block || "";
                if (newBlock) updates.block = newBlock;

                const newVillage = localMatch.village || current.village || nominatimAddr.village || nominatimAddr.town || nominatimAddr.city || "";
                if (newVillage) updates.village = newVillage;

                if (!current.pinCode && nominatimAddr.postcode) {
                    updates.pinCode = nominatimAddr.postcode;
                }

                if (Object.keys(updates).length > 0) {
                    updatePersonalDetails(updates);
                }
            } catch { /* geocode failed at confirm time — fields stay as-is */ }
        }

        setSaving(false);
        router.push("/(auth)/land-details" as any);
    };

    // ── Skip ───────────────────────────────────────────────────────────────────
    const handleSkip = () => {
        if (isProfileMode) {
            if (router.canGoBack()) router.back();
            else router.push("/(tab)/profile" as any);
            return;
        }

        const nullData = {
            lat: 0, lng: 0, address: "", accuracy: 0,
            setAt: new Date().toISOString(), method: "skipped" as const,
        };
        if (isLandFlow) setLandLocationData(nullData);
        else setLocationData(nullData);
        router.push("/(auth)/land-details" as any);
    };

    // ── My-location button ─────────────────────────────────────────────────────
    const handleMyLocation = () => {
        if (initialPos && !gpsFallbackUsed) {
            flyTo(initialPos.lat, initialPos.lng, 15);
        }
    };

    // ── Permission denied ──────────────────────────────────────────────────────
    if (permissionState === "denied") {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.topProgress}>
                    <View style={[styles.topProgressFill, { width: "50%" }]} />
                </View>
                <View style={styles.deniedContainer}>
                    <View style={styles.deniedIconBg}>
                        <Ionicons name="location-outline" size={40} color="#F59E0B" />
                    </View>
                    <AppText variant="h3" style={styles.deniedTitle}>Location Access Needed</AppText>
                    <AppText variant="bodySm" style={styles.deniedBody}>
                        To place your {isLandFlow ? "farm land" : "home"} on the map, Tanak Prabha needs location permission.
                        Your location is only used to build the farming heatmap.
                    </AppText>
                    <Pressable style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
                        <Ionicons name="settings-outline" size={18} color="#fff" />
                        <AppText variant="bodyMd" style={styles.settingsBtnText}>Enable in Settings</AppText>
                    </Pressable>
                    <Pressable style={styles.skipLinkBtn} onPress={handleSkip}>
                        <AppText variant="bodySm" style={styles.skipLinkText}>Skip for now</AppText>
                    </Pressable>
                </View>
            </View>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    if (initialPos === null) {
        return (
            <View style={[styles.root, styles.centred]}>
                <StatusBar barStyle="dark-content" />
                <Ionicons name="locate-outline" size={44} color="#386641" />
                <AppText variant="bodyMd" style={styles.loadingText}>Finding your location…</AppText>
            </View>
        );
    }

    // ── Full-screen map ────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Leaflet WebView — fills the entire screen */}
            <WebView
                ref={webViewRef}
                style={StyleSheet.absoluteFillObject}
                source={{ html: buildLeafletHTML(initialPos.lat, initialPos.lng, initialPos.zoom) }}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={["*"]}
                scrollEnabled={false}
                // Allow cross-origin requests (needed for OSM tiles & Nominatim CDN)
                mixedContentMode="always"
                // Prevent WebView from stealing focus from the search TextInput
                keyboardDisplayRequiresUserAction={false}
            />

            {/* ── Top overlay: progress + search ──────────────────────────── */}
            <View style={styles.topOverlay} pointerEvents="box-none">
                {/* Slim progress bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: "50%" }]} />
                </View>

                {/* Search bar */}
                <View style={styles.searchCard} pointerEvents="auto">
                    <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for your village, town or city…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect={false}
                    />
                    {searchLoading && (
                        <Ionicons name="sync-outline" size={16} color="#9CA3AF" />
                    )}
                    {searchText.length > 0 && !searchLoading && (
                        <Pressable onPress={() => { setSearchText(""); setShowResults(false); }}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                    <View style={styles.resultsCard} pointerEvents="auto">
                        {searchResults.map((result, idx) => (
                            <Pressable
                                key={result.placeId}
                                style={[
                                    styles.resultRow,
                                    idx < searchResults.length - 1 && styles.resultRowBorder,
                                ]}
                                onPress={() => handleSearchSelect(result)}
                            >
                                <Ionicons name="location-outline" size={16} color="#386641" style={{ marginRight: 10 }} />
                                <AppText variant="bodySm" style={styles.resultText} numberOfLines={2}>
                                    {result.description}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            {/* ── GPS fallback banner ────────────────────────────────────────── */}
            {gpsFallbackUsed && (
                <View style={styles.fallbackBanner} pointerEvents="none">
                    <Ionicons name="warning-outline" size={14} color="#92400E" />
                    <AppText variant="bodySm" style={styles.fallbackText}>
                        GPS unavailable — search or drag map to your {isLandFlow ? "land" : "location"}
                    </AppText>
                </View>
            )}

            {/* ── My location button ────────────────────────────────────────── */}
            <Pressable style={styles.myLocationBtn} onPress={handleMyLocation}>
                <Ionicons name="locate" size={22} color="#386641" />
            </Pressable>

            {/* ── Bottom sheet ──────────────────────────────────────────────── */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />

                <AppText variant="bodySm" style={styles.sheetLabel}>
                    YOUR {isLandFlow ? "LAND" : "HOME"} LOCATION
                </AppText>

                {geocodeLoading ? (
                    <AppText variant="bodySm" style={styles.sheetHint}>Resolving address…</AppText>
                ) : geocodeError ? (
                    <View style={styles.geocodeErrorRow}>
                        <Ionicons name="wifi-outline" size={14} color="#EF4444" />
                        <AppText variant="bodySm" style={styles.geocodeErrorText}>
                            Address unavailable — you can still confirm your pin
                        </AppText>
                    </View>
                ) : (
                    <AppText variant="bodyMd" style={styles.sheetAddress} numberOfLines={2}>
                        {address || "Drag the map to place your pin"}
                    </AppText>
                )}

                {/* Nudge */}
                <View style={styles.nudgeRow}>
                    <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                    <AppText variant="bodySm" style={styles.nudgeText}>
                        Sharing your location helps us show accurate farming data for your region
                    </AppText>
                </View>

                {/* Confirm — enabled as soon as pinCoords exists */}
                <Pressable
                    style={[styles.confirmBtn, (!pinCoords || saving) && styles.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={!pinCoords || saving}
                >
                    <AppText variant="bodyMd" style={styles.confirmBtnText}>
                        {saving ? "Saving…" : "Confirm Location"}
                    </AppText>
                </Pressable>

                <Pressable style={styles.skipBtn} onPress={handleSkip}>
                    <AppText variant="bodySm" style={styles.skipText}>Skip for now</AppText>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    centred: { justifyContent: "center", alignItems: "center", gap: 16 },
    loadingText: { color: "#6B7280" },

    // ── Top overlay ──
    topOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        zIndex: 20,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 56,
        paddingHorizontal: 16,
    },
    progressTrack: {
        height: 4, borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.5)",
        marginBottom: 12,
    },
    progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#FBBF24" },
    searchCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12,
        elevation: 6, marginBottom: 6,
    },
    searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },
    resultsCard: {
        backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    resultRow: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 14,
    },
    resultRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    resultText: { flex: 1, color: "#374151", lineHeight: 20 },

    // ── GPS fallback banner ──
    fallbackBanner: {
        position: "absolute",
        top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 80 : 130,
        alignSelf: "center",
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        zIndex: 10,
        shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    },
    fallbackText: { color: "#92400E", fontSize: 12 },

    // ── My location button ──
    myLocationBtn: {
        position: "absolute", bottom: 230, right: 16,
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
        zIndex: 10,
    },

    // ── Bottom sheet ──
    bottomSheet: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 24, paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20,
        elevation: 12, zIndex: 15,
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 14,
    },
    sheetLabel: {
        fontSize: 10, letterSpacing: 1.2, color: "#9CA3AF",
        textTransform: "uppercase", marginBottom: 6,
    },
    sheetHint: { color: "#9CA3AF", fontStyle: "italic", marginBottom: 12 },
    sheetAddress: { color: "#111827", fontWeight: "600", lineHeight: 22, marginBottom: 12 },
    geocodeErrorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    geocodeErrorText: { color: "#EF4444", flex: 1 },
    nudgeRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 6,
        backgroundColor: "#F0FDF4", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
    },
    nudgeText: { color: "#374151", flex: 1, lineHeight: 18 },
    confirmBtn: {
        backgroundColor: "#386641", borderRadius: 14,
        paddingVertical: 16, alignItems: "center", marginBottom: 12,
    },
    confirmBtnDisabled: { backgroundColor: "#D1D5DB" },
    confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    skipBtn: { alignItems: "center", paddingVertical: 4 },
    skipText: { color: "#9CA3AF" },

    // ── Permission denied ──
    topProgress: {
        height: 4, backgroundColor: "rgba(0,0,0,0.08)",
        marginTop: Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 0) + 8,
        marginHorizontal: 20, borderRadius: 2,
    },
    topProgressFill: { height: "100%", borderRadius: 2, backgroundColor: "#FBBF24" },
    deniedContainer: {
        flex: 1, alignItems: "center", justifyContent: "center",
        paddingHorizontal: 32, gap: 12,
    },
    deniedIconBg: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: "#FEF3C7", alignItems: "center",
        justifyContent: "center", marginBottom: 8,
    },
    deniedTitle: { fontWeight: "700", color: "#1F2937", textAlign: "center" },
    deniedBody: { color: "#6B7280", textAlign: "center", lineHeight: 20 },
    settingsBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#386641", paddingHorizontal: 24,
        paddingVertical: 14, borderRadius: 14, marginTop: 8,
    },
    settingsBtnText: { color: "#fff", fontWeight: "700" },
    skipLinkBtn: { marginTop: 12 },
    skipLinkText: { color: "#9CA3AF", textDecorationLine: "underline" },
});
