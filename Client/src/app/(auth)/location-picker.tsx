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
    Animated,
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
import MapView from "react-native-maps";
import AppText from "../../components/atoms/AppText";
import { useOnboardingStore } from "../../stores/onboardingStore";

export const unstable_settings = { headerShown: false };

// ─── Constants ────────────────────────────────────────────────────────────────

const INDIA_FALLBACK_REGION = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 8,
    longitudeDelta: 8,
};

const GPS_TIMEOUT_MS = 10_000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionState = "loading" | "granted" | "denied";
interface PinCoords { latitude: number; longitude: number; }
interface SearchResult {
    placeId: string;
    description: string;
    lat: number;
    lng: number;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LocationPickerScreen() {
    const router = useRouter();
    const { isForLand, fromProfile, returnTo, purpose } = useLocalSearchParams<{
        isForLand?: string;
        fromProfile?: string;
        returnTo?: string;
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
    const [initialRegion, setInitialRegion] = useState<typeof INDIA_FALLBACK_REGION | null>(null);
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
    const mapRef = useRef<MapView>(null);
    const pinAnim = useRef(new Animated.Value(0)).current;
    const geocodeRequestId = useRef(0);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Back-navigation guard (BackHandler — compatible with Expo Router) ───────
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
                            if (isLandFlow) {
                                setLandLocationData(null);
                            } else {
                                setLocationData(null);
                            }
                            router.back();
                        },
                    },
                ]
            );
            return true; // prevent default back
        };
        const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
        return () => sub.remove();
    }, [isProfileMode, relevantLocationData, isLandFlow, setLandLocationData, setLocationData, router]);

    // ── Geocoding ──────────────────────────────────────────────────────────────
    const geocodeCoords = useCallback(async (lat: number, lng: number) => {
        const requestId = ++geocodeRequestId.current;
        setGeocodeLoading(true);
        setGeocodeError(false);
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (requestId !== geocodeRequestId.current) return;
            if (results.length === 0) { setAddress("Unknown location"); return; }
            const r = results[0];
            const parts = [r.name, r.street, r.city ?? r.name, r.subregion, r.region, r.postalCode]
                .filter(Boolean).join(", ");
            setAddress(parts || "Unknown location");
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
                    setInitialRegion(INDIA_FALLBACK_REGION);
                    return;
                }
                setPermissionState("granted");

                try {
                    const positionPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error("gps_timeout")), GPS_TIMEOUT_MS);
                    });

                    const loc = await Promise.race<Location.LocationObject>([
                        positionPromise,
                        timeoutPromise,
                    ]);

                    if (timeoutId) clearTimeout(timeoutId);

                    if (isMounted) {
                        const { latitude, longitude, accuracy } = loc.coords;
                        setGpsAccuracy(accuracy ?? 50);
                        setInitialRegion({ latitude, longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 });
                        setPinCoords({ latitude, longitude });
                        geocodeCoords(latitude, longitude);
                    }
                } catch {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (isMounted) {
                        setGpsFallbackUsed(true);
                        setInitialRegion(INDIA_FALLBACK_REGION);
                    }
                }
            } catch (error) {
                // Failsafe catch to prevent unhandled promise rejections if permissions check throws
                if (timeoutId) clearTimeout(timeoutId);
                if (isMounted) {
                    setPermissionState("denied");
                    setInitialRegion(INDIA_FALLBACK_REGION);
                }
            }
        })();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [geocodeCoords]);



    // ── Address Search (using expo-location forward geocode) ──────────────────
    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (text.trim().length < 3) { setShowResults(false); return; }

        searchTimeout.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                // Use Expo's geocodeAsync for forward geocoding (no API key needed in Expo Go)
                const results = await Location.geocodeAsync(text);
                const mapped: SearchResult[] = results.slice(0, 5).map((r, i) => ({
                    placeId: `${i}`,
                    description: text,
                    lat: r.latitude,
                    lng: r.longitude,
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
        const region = {
            latitude: result.lat,
            longitude: result.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(region, 500);
        setPinCoords({ latitude: result.lat, longitude: result.lng });
        geocodeCoords(result.lat, result.lng);
        setSearchText(result.description);
        setShowResults(false);
        Keyboard.dismiss();
    }, [geocodeCoords]);

    // ── Map callbacks ──────────────────────────────────────────────────────────
    const isMapMoving = useRef(false);

    const onRegionChange = useCallback(() => {
        if (!isMapMoving.current) {
            isMapMoving.current = true;
            Animated.spring(pinAnim, { toValue: -12, useNativeDriver: true, tension: 120, friction: 8 }).start();
        }
    }, [pinAnim]);

    const onRegionChangeComplete = useCallback((region: { latitude: number; longitude: number }) => {
        isMapMoving.current = false;
        Animated.spring(pinAnim, { toValue: 0, useNativeDriver: true, friction: 4, tension: 40 }).start();
        setPinCoords({ latitude: region.latitude, longitude: region.longitude });
        geocodeCoords(region.latitude, region.longitude);
    }, [pinAnim, geocodeCoords]);

    // ── Confirm ────────────────────────────────────────────────────────────────
    const handleConfirm = async () => {
        if (!pinCoords) return;
        setSaving(true);

        const newLocInfo = {
            lat: pinCoords.latitude,
            lng: pinCoords.longitude,
            address: address || "Unknown location",
            accuracy: gpsAccuracy,
            setAt: new Date().toISOString(),
            method: "gps" as const,
        };

        if (isProfileMode) {
            try {
                if (purpose === "profile") {
                    // ── Profile address-fill mode: geocode pin → write to store → go back ──
                    const toSlug = (v?: string | null) =>
                        v ? v.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";

                    const [results, localMatch] = await Promise.all([
                        Location.reverseGeocodeAsync({ latitude: pinCoords.latitude, longitude: pinCoords.longitude }),
                        Promise.resolve(getClosestLocation(pinCoords.latitude, pinCoords.longitude)),
                    ]);

                    const r = results[0] ?? {};

                    const override: Record<string, string> = {};
                    const mapState = toSlug(localMatch.state || (r as any).region);
                    const mapDistrict = toSlug(localMatch.district || (r as any).subregion);
                    const mapTehsil = toSlug(localMatch.tehsil);
                    const mapBlock = toSlug(localMatch.block);
                    const mapVillage = localMatch.village || (r as any).city || (r as any).name || "";
                    const mapPinCode = (r as any).postalCode || "";

                    if (mapState) override.state = mapState;
                    if (mapDistrict) override.district = mapDistrict;
                    if (mapTehsil) override.tehsil = mapTehsil;
                    if (mapBlock) override.block = mapBlock;
                    if (mapVillage) override.village = mapVillage;
                    if (mapPinCode) override.pinCode = mapPinCode;

                    // Write to store BEFORE navigating — personal-details will read it reactively
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
                            location_address: newLocInfo.address
                        }
                    });
                } else {
                    await userApi.updateProfile({
                        location: newLocInfo
                    });
                }
            } catch (error) {
                console.error("Failed to update location from profile:", error);
            }
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push("/(tab)/profile" as any);
            }
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
                // Run both geocode operations in parallel
                const [results, localMatch] = await Promise.all([
                    Location.reverseGeocodeAsync({
                        latitude: pinCoords.latitude,
                        longitude: pinCoords.longitude,
                    }),
                    Promise.resolve(getClosestLocation(pinCoords.latitude, pinCoords.longitude)),
                ]);

                const current = personalDetails;

                if (results.length > 0) {
                    const r = results[0];
                    // Build an update object — prefer local hierarchical DB match,
                    // fall back to expo reverse-geocode fields, then keep existing value
                    const updates: Record<string, string> = {};

                    // State — expo gives r.region (e.g. "Uttar Pradesh")
                    const newState = localMatch.state || current.state ||
                        (r.region ?? "");
                    if (newState) updates.state = newState;

                    // District — expo gives r.subregion
                    const newDistrict = localMatch.district || current.district ||
                        (r.subregion ?? "");
                    if (newDistrict) updates.district = newDistrict;

                    // Tehsil
                    const newTehsil = localMatch.tehsil || current.tehsil || "";
                    if (newTehsil) updates.tehsil = newTehsil;

                    // Block
                    const newBlock = localMatch.block || current.block || "";
                    if (newBlock) updates.block = newBlock;

                    // Village — expo gives r.city or r.name for small localities
                    const newVillage = localMatch.village || current.village ||
                        (r.city ?? r.name ?? "");
                    if (newVillage) updates.village = newVillage;

                    // PIN code — only fill if not already set
                    if (!current.pinCode && r.postalCode) {
                        updates.pinCode = r.postalCode;
                    }

                    if (Object.keys(updates).length > 0) {
                        updatePersonalDetails(updates);
                    }
                } else if (localMatch.state) {
                    // Fallback: only the local DB matched
                    const updates: Record<string, string> = {};
                    if (localMatch.state) updates.state = localMatch.state;
                    if (localMatch.district) updates.district = localMatch.district;
                    if (localMatch.tehsil) updates.tehsil = localMatch.tehsil;
                    if (localMatch.block) updates.block = localMatch.block;
                    if (localMatch.village) updates.village = localMatch.village;
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
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push("/(tab)/profile" as any);
            }
            return;
        }

        const nullData = {
            lat: 0, lng: 0, address: "", accuracy: 0,
            setAt: new Date().toISOString(), method: "skipped" as const
        };
        if (isLandFlow) {
            setLandLocationData(nullData);
        } else {
            setLocationData(nullData);
        }
        router.push("/(auth)/land-details" as any);
    };

    // ── Permission denied (full-screen) ────────────────────────────────────────
    if (permissionState === "denied") {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" />
                {/* Thin progress bar at the very top */}
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
    if (initialRegion === null) {
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

            {/* Full-screen map */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={initialRegion}
                onRegionChange={onRegionChange}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={permissionState === "granted"}
                showsMyLocationButton={false}
            />

            {/* ── Top overlay: progress + search ──────────────────────────── */}
            <View style={styles.topOverlay} pointerEvents="box-none">
                {/* Slim progress bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: "50%" }]} />
                </View>

                {/* Search bar */}
                <View style={styles.searchCard}>
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
                    <View style={styles.resultsCard}>
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

            {/* ── Fixed centre pin ──────────────────────────────────────────── */}
            <Animated.View
                style={[styles.pinContainer, { transform: [{ translateY: pinAnim }] }]}
                pointerEvents="none"
            >
                <View style={styles.pinHead} />
                <View style={styles.pinStem} />
                <View style={styles.pinShadow} />
            </Animated.View>

            {/* ── My location button ────────────────────────────────────────── */}
            <Pressable
                style={styles.myLocationBtn}
                onPress={() => {
                    if (initialRegion !== INDIA_FALLBACK_REGION) {
                        mapRef.current?.animateToRegion(
                            { ...initialRegion, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 400
                        );
                    }
                }}
            >
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
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 56,
        paddingHorizontal: 16,
    },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.5)",
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
        backgroundColor: "#FBBF24",
    },
    searchCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        padding: 0,
    },
    resultsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    resultRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    resultRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    resultText: { flex: 1, color: "#374151", lineHeight: 20 },

    // ── GPS fallback banner ──
    fallbackBanner: {
        position: "absolute",
        top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 80 : 130,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    fallbackText: { color: "#92400E", fontSize: 12 },

    // ── Centre pin ──
    pinContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -12,
        marginTop: -42,
        alignItems: "center",
        zIndex: 10,
    },
    pinHead: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#386641",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#1a1a1a",
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 6,
    },
    pinStem: { width: 2, height: 14, backgroundColor: "#386641", marginTop: -1 },
    pinShadow: {
        width: 10, height: 5, borderRadius: 5,
        backgroundColor: "rgba(0,0,0,0.15)", marginTop: 2,
    },

    // ── My location button ──
    myLocationBtn: {
        position: "absolute",
        bottom: 230,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },

    // ── Bottom sheet ──
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        zIndex: 15,
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
