// src/app/(admin)/add-beneficiary.tsx
import AppText from "@/components/atoms/AppText";
import KeyboardAwareScrollView from "@/components/atoms/KeyboardAwareScrollView";
import Select from "@/components/atoms/Select";
import TextArea from "@/components/atoms/TextArea";
import { useAuth } from "@/contexts/AuthContext";
import { genderOptions, cropTypes, indianStates, getLocalizedOptions } from "@/data/content/onboardingOptions";
import { ApiUserProfile, uploadApi } from "@/services/apiService";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { theme } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState, useEffect } from "react";
import AddressDropdowns, { type AddressValue } from "@/components/molecules/AddressDropdowns";
import { getStateOptions, getDistrictOptions } from "@/data/indianLocations";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────
const TOTAL_STEPS = 4;
const STEP_TITLES = ["Personal Details", "Location", "Land Details", "Livestock Details"];
const STEP_SUBTITLES = [
    "Basic info + photo of the farmer",
    "Where does the farmer live?",
    "Land holdings and crops",
    "Livestock owned by the farmer",
];
const DEFAULT_PASSWORD = "12345678";

// ─── Helpers ──────────────────────────────────────────────────
const FieldLabel = ({ text }: { text: string }) => (
    <AppText style={f.label}>{text}</AppText>
);
const FieldError = ({ message }: { message?: string }) =>
    message ? <AppText style={f.error}>{message}</AppText> : null;
const f = StyleSheet.create({
    label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
    error: { fontSize: 12, color: "#EF4444", marginTop: 4 },
});
function inputStyle(hasError?: boolean) {
    return {
        backgroundColor: "#F9FAFB", borderWidth: 1,
        borderColor: hasError ? "#EF4444" : "#E5E7EB",
        borderRadius: 12, padding: 14, fontSize: 15, color: "#1F2937",
    };
}

// ─── Form types ───────────────────────────────────────────────
interface PersonalForm {
    name: string; mobile: string; age: string;
    gender: string; fathersName: string; aadhaar: string;
    photoUrl: string;
}
interface LocationForm {
    state: string; district: string; tehsil: string; block: string;
    village: string; gramPanchayat: string; nyayPanchayat: string;
    pinCode: string; postOffice: string;
    lat: number | null; lng: number | null; address: string;
}
interface LandForm { totalLandArea: string; rabiCrop: string; kharifCrop: string; }
interface LivestockForm {
    cow: string; buffalo: string; goat: string;
    sheep: string; pig: string; poultry: string; others: string;
}

// ─── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
                <View key={i} style={[
                    { height: 4, borderRadius: 2 },
                    i < current ? { width: 20, backgroundColor: "rgba(255,255,255,0.6)" }
                        : i === current ? { width: 28, backgroundColor: "#FFFFFF" }
                            : { width: 20, backgroundColor: "rgba(255,255,255,0.3)" },
                ]} />
            ))}
        </View>
    );
}

// ─── Step 1: Personal Details + Photo ────────────────────────
function Step1({
    form, setForm, errors, uploadingPhoto, onCapturePhoto,
}: {
    form: PersonalForm;
    setForm: (f: PersonalForm) => void;
    errors: Partial<PersonalForm>;
    uploadingPhoto: boolean;
    onCapturePhoto: () => void;
}) {
    const genderOpts = genderOptions.map((g) => ({ value: g.value, label: g.label }));
    const [genderOtherText, setGenderOtherText] = useState("");
    return (
        <>
            {/* Photo capture */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Pressable onPress={onCapturePhoto} disabled={uploadingPhoto} style={ph.wrap}>
                    {form.photoUrl ? (
                        <Image source={{ uri: form.photoUrl }} style={ph.img} />
                    ) : (
                        <View style={ph.placeholder}>
                            <Ionicons name="person" size={36} color="#9CA3AF" />
                        </View>
                    )}
                    <View style={ph.badge}>
                        {uploadingPhoto
                            ? <ActivityIndicator size="small" color="#FFFFFF" />
                            : <Ionicons name="camera" size={16} color="#FFFFFF" />}
                    </View>
                </Pressable>
                <AppText style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
                    Tap to capture farmer's photo
                </AppText>
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Full Name *" />
                <TextInput style={inputStyle(!!errors.name)} value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                    placeholder="Enter full name" placeholderTextColor="#9CA3AF" />
                <FieldError message={errors.name} />
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Mobile Number *" />
                <TextInput style={inputStyle(!!errors.mobile)} value={form.mobile}
                    onChangeText={(v) => setForm({ ...form, mobile: v.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit mobile number" placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad" maxLength={10} />
                <FieldError message={errors.mobile} />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <FieldLabel text="Age *" />
                    <TextInput style={inputStyle(!!errors.age)} value={form.age}
                        onChangeText={(v) => setForm({ ...form, age: v.replace(/\D/g, "").slice(0, 3) })}
                        placeholder="Age" placeholderTextColor="#9CA3AF"
                        keyboardType="numeric" maxLength={3} />
                    <FieldError message={errors.age} />
                </View>
                <View style={{ flex: 1 }}>
                    <FieldLabel text="Gender *" />
                    <Select value={form.gender} onChange={(v) => setForm({ ...form, gender: v })}
                        options={genderOpts} placeholder="Select" />
                    <FieldError message={errors.gender} />
                    {form.gender === "other" && (
                        <TextArea
                            value={genderOtherText}
                            onChangeText={setGenderOtherText}
                            placeholder="Please specify…"
                            numberOfLines={3}
                            style={{ marginTop: 8 }}
                        />
                    )}
                </View>
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Father's Name *" />
                <TextInput style={inputStyle(!!errors.fathersName)} value={form.fathersName}
                    onChangeText={(v) => setForm({ ...form, fathersName: v })}
                    placeholder="Enter father's name" placeholderTextColor="#9CA3AF" />
                <FieldError message={errors.fathersName} />
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Aadhaar Number" />
                <TextInput style={inputStyle(!!errors.aadhaar)} value={form.aadhaar}
                    onChangeText={(v) => setForm({ ...form, aadhaar: v.replace(/\D/g, "").slice(0, 12) })}
                    placeholder="12-digit Aadhaar (optional)" placeholderTextColor="#9CA3AF"
                    keyboardType="numeric" maxLength={12} />
                <FieldError message={errors.aadhaar} />
            </View>

            {/* Default password notice */}
            <View style={ph.passwordNote}>
                <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
                <AppText style={{ fontSize: 12, color: "#6B7280", flex: 1 }}>
                    Default password <AppText style={{ fontWeight: "700", color: "#374151" }}>{DEFAULT_PASSWORD}</AppText> will be set. Farmer can change it after first login.
                </AppText>
            </View>
        </>
    );
}

const ph = StyleSheet.create({
    wrap: { width: 96, height: 96, borderRadius: 48, position: "relative" },
    img: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#E5E7EB" },
    placeholder: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: theme.background.neutralSubtle, borderWidth: 2, borderColor: theme.border.subtle,
        borderStyle: "dashed", alignItems: "center", justifyContent: "center",
    },
    badge: {
        position: "absolute", bottom: 0, right: 0,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: "#386641", alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#FFFFFF",
    },
    passwordNote: {
        flexDirection: "row", alignItems: "flex-start", gap: 8,
        backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: "#E5E7EB",
    },
});

// ─── Step 2: Location (Map + Compulsory Address) ─────────────
function Step2({
    form, setForm, errors, onPickOnMap,
}: {
    form: LocationForm;
    setForm: (f: LocationForm) => void;
    errors: Partial<Record<keyof LocationForm, string>>;
    onPickOnMap: () => void;
}) {
    const [pinLoading, setPinLoading] = useState(false);
    const [postOfficeOptions, setPostOfficeOptions] = useState<{ label: string; value: string }[]>([]);
    const [addressLists, setAddressLists] = useState<{
        districts: { label: string; value: string }[];
        blocks: { label: string; value: string }[];
    }>({ districts: [], blocks: [] });

    const hasMapPin = form.lat !== null;

    const handlePinCodeChange = async (pin: string) => {
        setForm({ ...form, pinCode: pin });
        if (pin.length === 6) {
            setPinLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await response.json();
                if (data && data[0] && data[0].Status === "Success") {
                    const postOffices = data[0].PostOffice;
                    const poOptions = postOffices.map((po: any) => ({ label: po.Name, value: po.Name }));
                    setPostOfficeOptions(poOptions);

                    // Normalize for comparison
                    const firstPO = postOffices[0];
                    const stateSlug = firstPO.State.trim().toLowerCase().replace(/[\s-]+/g, "_");
                    const districtName = firstPO.District;

                    setForm(prev => ({
                        ...prev,
                        pinCode: pin,
                        state: stateSlug,
                        district: districtName,
                        // Block/Tehsil/Village will be manually confirmed or selected via dropdown
                        postOffice: poOptions.length === 1 ? poOptions[0].value : (prev.postOffice || "")
                    }));
                }
            } catch (e) {
                console.error("Error fetching PIN:", e);
            } finally {
                setPinLoading(false);
            }
        }
    };

    const stateOptions = getStateOptions();
    const districtOptions = form.state ? getDistrictOptions(form.state) : [];

    return (
        <>
            <AppText style={lc.stepNotice}>BOTH GPS location and full address are compulsory.</AppText>

            {/* Part A: GPS Map Picker */}
            <AppText style={f.label}>Step 2A: GPS Coordinates *</AppText>
            <Pressable onPress={onPickOnMap} style={[lc.mapBtn, hasMapPin && lc.mapBtnPinned]}>
                <View style={[lc.mapBtnIcon, hasMapPin && lc.mapBtnIconPinned]}>
                    <Ionicons name={hasMapPin ? "location" : "map"} size={22} color={hasMapPin ? "#FFFFFF" : "#386641"} />
                </View>
                <View style={{ flex: 1 }}>
                    <AppText style={[lc.mapBtnTitle, hasMapPin && { color: "#FFFFFF" }]}>
                        {hasMapPin ? "GPS Location Secured ✓" : "Pin Location on Map"}
                    </AppText>
                    {form.address ? (
                        <AppText style={[lc.mapBtnAddress, hasMapPin && { color: "rgba(255,255,255,0.85)" }]} numberOfLines={2}>
                            {form.address}
                        </AppText>
                    ) : (
                        <AppText style={lc.mapBtnHint}>Required to pick a point on the map</AppText>
                    )}
                </View>
                {hasMapPin && (
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={{ marginLeft: 8 }} />
                )}
            </Pressable>
            <FieldError message={errors.lat ? "Map location is mandatory" : ""} />

            <View style={lc.divider}>
                <View style={lc.dividerLine} />
                <AppText style={lc.dividerLabel}>Step 2B: Full Address Details</AppText>
                <View style={lc.dividerLine} />
            </View>

            {/* Part B: Manual Address Fields */}
            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="PIN Code *" />
                <View style={{ position: "relative" }}>
                    <TextInput style={inputStyle(!!errors.pinCode)} value={form.pinCode}
                        onChangeText={handlePinCodeChange}
                        placeholder="6-digit PIN" placeholderTextColor="#9CA3AF"
                        keyboardType="numeric" maxLength={6} />
                    {pinLoading && <ActivityIndicator style={{ position: "absolute", right: 12, top: 14 }} size="small" color="#386641" />}
                </View>
                <FieldError message={errors.pinCode} />
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="State *" />
                <Select value={form.state} onChange={(v) => setForm({ ...form, state: v, district: "" })}
                    options={stateOptions} placeholder="Select State" />
                <FieldError message={errors.state} />
            </View>

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="District *" />
                <Select value={form.district} onChange={(v) => setForm({ ...form, district: v, tehsil: "", block: "", gramPanchayat: "", nyayPanchayat: "", village: "" })}
                    options={districtOptions} placeholder={form.state ? "Select District" : "Select State first"} disabled={!form.state} />
                <FieldError message={errors.district} />
            </View>

            {/* Specialized Dropdowns for Bhadohi / Mirzapur */}
            {(form.district?.toLowerCase() === "bhadohi" || form.district?.toLowerCase() === "mirzapur") ? (
                <AddressDropdowns
                    district={form.district}
                    language="en"
                    value={{
                        tehsil: form.tehsil || "",
                        nyayPanchayat: form.nyayPanchayat || "",
                        gramPanchayat: form.gramPanchayat || "",
                        village: form.village || "",
                    }}
                    onChange={(v: AddressValue) => setForm({
                        ...form,
                        tehsil: v.tehsil,
                        nyayPanchayat: v.nyayPanchayat,
                        gramPanchayat: v.gramPanchayat,
                        village: v.village
                    })}
                />
            ) : (
                <>
                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                        <View style={{ flex: 1 }}>
                            <FieldLabel text="Tehsil *" />
                            <TextInput style={inputStyle(!!errors.tehsil)} value={form.tehsil}
                                onChangeText={(v) => setForm({ ...form, tehsil: v })}
                                placeholder="Tehsil" placeholderTextColor="#9CA3AF" />
                            <FieldError message={errors.tehsil} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FieldLabel text="Block *" />
                            <TextInput style={inputStyle(!!errors.block)} value={form.block}
                                onChangeText={(v) => setForm({ ...form, block: v })}
                                placeholder="Block" placeholderTextColor="#9CA3AF" />
                            <FieldError message={errors.block} />
                        </View>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <FieldLabel text="Nyay Panchayat *" />
                        <TextInput style={inputStyle(!!errors.nyayPanchayat)} value={form.nyayPanchayat}
                            onChangeText={(v) => setForm({ ...form, nyayPanchayat: v })}
                            placeholder="Enter Nyay Panchayat" placeholderTextColor="#9CA3AF" />
                        <FieldError message={errors.nyayPanchayat} />
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <FieldLabel text="Gram Panchayat *" />
                        <TextInput style={inputStyle(!!errors.gramPanchayat)} value={form.gramPanchayat}
                            onChangeText={(v) => setForm({ ...form, gramPanchayat: v })}
                            placeholder="Enter Gram Panchayat" placeholderTextColor="#9CA3AF" />
                        <FieldError message={errors.gramPanchayat} />
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <FieldLabel text="Village *" />
                        <TextInput style={inputStyle(!!errors.village)} value={form.village}
                            onChangeText={(v) => setForm({ ...form, village: v })}
                            placeholder="Enter Village" placeholderTextColor="#9CA3AF" />
                        <FieldError message={errors.village} />
                    </View>
                </>
            )}

            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Post Office *" />
                {postOfficeOptions.length > 0 ? (
                    <Select value={form.postOffice} onChange={(v) => setForm({ ...form, postOffice: v })}
                        options={postOfficeOptions} placeholder="Select PO" />
                ) : (
                    <TextInput style={inputStyle(!!errors.postOffice)} value={form.postOffice}
                        onChangeText={(v) => setForm({ ...form, postOffice: v })}
                        placeholder="Enter Post Office" placeholderTextColor="#9CA3AF" />
                )}
                <FieldError message={errors.postOffice} />
            </View>
        </>
    );
}

const lc = StyleSheet.create({
    stepNotice: { fontSize: 13, fontWeight: "600", color: "#B45309", marginBottom: 20, backgroundColor: "#FFFBEB", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#FCD34D" },
    mapBtn: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#F0FDF4", borderWidth: 1.5, borderColor: "#86EFAC",
        borderRadius: 14, padding: 14, marginBottom: 12, marginTop: 8,
    },
    mapBtnPinned: {
        backgroundColor: "#386641", borderColor: "#386641",
    },
    mapBtnIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center",
    },
    mapBtnIconPinned: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    mapBtnTitle: { fontSize: 14, fontWeight: "700", color: "#166534" },
    mapBtnAddress: { fontSize: 11, color: "#15803D", marginTop: 2, lineHeight: 16 },
    mapBtnHint: { fontSize: 12, color: "#EA580C", marginTop: 2, fontWeight: "500" },
    changeText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
    pinnedInfo: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#F0FDF4", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16,
    },
    coordsText: { flex: 1, fontSize: 11, color: "#16A34A", fontWeight: "500" },
    clearText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
    divider: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    dividerLabel: { fontSize: 11, color: "#6B7280", fontWeight: "700", textTransform: "uppercase" },
});

// ─── Step 3: Land Details ─────────────────────────────────────
function Step3({ form, setForm }: { form: LandForm; setForm: (f: LandForm) => void }) {
    const cropOpts = cropTypes.map((c) => ({ value: c.value, label: c.label }));
    return (
        <>
            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Total Land Area (Bigha)" />
                <TextInput style={inputStyle()} value={form.totalLandArea}
                    onChangeText={(v) => setForm({ ...form, totalLandArea: v })}
                    placeholder="e.g. 2.5" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
            </View>
            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Rabi Crop" />
                <Select value={form.rabiCrop} onChange={(v) => setForm({ ...form, rabiCrop: v })}
                    options={cropOpts} placeholder="Select rabi crop (optional)" />
            </View>
            <View style={{ marginBottom: 16 }}>
                <FieldLabel text="Kharif Crop" />
                <Select value={form.kharifCrop} onChange={(v) => setForm({ ...form, kharifCrop: v })}
                    options={cropOpts} placeholder="Select kharif crop (optional)" />
            </View>
        </>
    );
}

// ─── Step 4: Livestock Details ────────────────────────────────
function Step4({ form, setForm }: { form: LivestockForm; setForm: (f: LivestockForm) => void }) {
    const animals: { key: keyof LivestockForm; label: string }[] = [
        { key: "cow", label: "Cow" }, { key: "buffalo", label: "Buffalo" },
        { key: "goat", label: "Goat" }, { key: "sheep", label: "Sheep" },
        { key: "pig", label: "Pig" }, { key: "poultry", label: "Poultry / Hen" },
        { key: "others", label: "Others" },
    ];
    return (
        <>
            <AppText style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                Enter the count for each animal type (leave blank or 0 if none).
            </AppText>
            {animals.map(({ key, label }) => (
                <View key={key} style={{ marginBottom: 16 }}>
                    <FieldLabel text={label} />
                    <TextInput style={inputStyle()} value={form[key]}
                        onChangeText={(v) => setForm({ ...form, [key]: v.replace(/\D/g, "") })}
                        placeholder="0" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
                </View>
            ))}
        </>
    );
}

// ─── Conflict Card ────────────────────────────────────────────
function ConflictCard({
    farmer, onDismiss,
}: {
    farmer: ApiUserProfile;
    onDismiss: () => void;
}) {
    return (
        <View style={cc.card}>
            <View style={cc.header}>
                <View style={cc.iconWrap}>
                    <Ionicons name="warning" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                    <AppText style={cc.title}>Farmer Already Registered</AppText>
                    <AppText style={cc.subtitle}>This mobile number is already in the system</AppText>
                </View>
                <Pressable onPress={onDismiss} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
            </View>
            <View style={cc.body}>
                {farmer.photo_url ? (
                    <Image source={{ uri: farmer.photo_url }} style={cc.photo} />
                ) : (
                    <View style={[cc.photo, cc.photoPlaceholder]}>
                        <AppText style={{ fontSize: 22, fontWeight: "700", color: "#6B7280" }}>
                            {farmer.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AppText>
                    </View>
                )}
                <View style={{ flex: 1, gap: 3 }}>
                    <AppText style={cc.name}>{farmer.name}</AppText>
                    <AppText style={cc.detail}>📱 {farmer.mobile_number}</AppText>
                    {farmer.district && (
                        <AppText style={cc.detail}>
                            📍 {farmer.district}{farmer.state ? `, ${farmer.state}` : ""}
                        </AppText>
                    )}
                    {farmer.age && <AppText style={cc.detail}>🎂 Age {farmer.age}</AppText>}
                </View>
            </View>
        </View>
    );
}

const cc = StyleSheet.create({
    card: {
        backgroundColor: "#FFFBEB", borderWidth: 1.5, borderColor: "#FCD34D",
        borderRadius: 14, padding: 14, marginHorizontal: 16, marginTop: 12,
    },
    header: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
    iconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center",
    },
    title: { fontSize: 14, fontWeight: "700", color: "#92400E" },
    subtitle: { fontSize: 12, color: "#B45309", marginTop: 1 },
    body: { flexDirection: "row", alignItems: "center", gap: 12 },
    photo: { width: 60, height: 60, borderRadius: 30 },
    photoPlaceholder: {
        backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
    },
    name: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
    detail: { fontSize: 12, color: "#6B7280" },
});

// ─── Pre-registration Search ──────────────────────────────────
function SearchSection({ onRegisterNew }: { onRegisterNew: () => void }) {
    const [q, setQ] = useState("");
    const [results, setResults] = useState<ApiUserProfile[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<ApiUserProfile | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback((text: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const trimmed = text.trim();
        if (trimmed.length < 2) { setResults([]); setSelected(null); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const { tokenManager } = await import("@/services/apiService");
                const token = await tokenManager.getToken();
                const res = await fetch(
                    `${process.env.EXPO_PUBLIC_API_URL}/users?search=${encodeURIComponent(trimmed)}&limit=10`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                const data = await res.json();
                setResults(data?.data?.users ?? data?.users ?? []);
            } catch { setResults([]); }
            finally { setSearching(false); }
        }, 400);
    }, []);

    return (
        <View style={ss.container}>
            <AppText style={ss.heading}>Search Existing Farmers</AppText>
            <AppText style={ss.subheading}>Check if the farmer is already registered before adding</AppText>
            <View style={ss.inputRow}>
                <Ionicons name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <TextInput style={ss.searchInput} value={q}
                    onChangeText={(v) => { setQ(v); setSelected(null); search(v); }}
                    placeholder="Search by name or mobile number"
                    placeholderTextColor="#9CA3AF" returnKeyType="search" clearButtonMode="while-editing" />
                {searching && <ActivityIndicator size="small" color="#386641" style={{ marginLeft: 8 }} />}
            </View>

            {selected && (
                <View style={ss.registeredCard}>
                    <Ionicons name="checkmark-circle" size={22} color="#059669" />
                    <View style={{ flex: 1 }}>
                        <AppText style={ss.registeredTitle}>Already Registered</AppText>
                        <AppText style={ss.registeredName}>{selected.name}</AppText>
                        <AppText style={ss.registeredMobile}>{selected.mobile_number}</AppText>
                        {selected.district && <AppText style={ss.registeredMeta}>{selected.district}{selected.state ? `, ${selected.state}` : ""}</AppText>}
                    </View>
                    <Pressable onPress={() => { setSelected(null); setQ(""); }} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </Pressable>
                </View>
            )}

            {!selected && results.length > 0 && (
                <View style={ss.resultsList}>
                    {results.map((farmer) => (
                        <Pressable key={farmer.id} style={ss.resultItem} onPress={() => { setSelected(farmer); setResults([]); }}>
                            <View style={ss.resultAvatar}>
                                <AppText style={ss.resultAvatarText}>{farmer.name?.charAt(0)?.toUpperCase() ?? "?"}</AppText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppText style={ss.resultName}>{farmer.name}</AppText>
                                <AppText style={ss.resultMobile}>{farmer.mobile_number}</AppText>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </Pressable>
                    ))}
                </View>
            )}

            {!selected && q.trim().length >= 2 && !searching && results.length === 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, paddingVertical: 10 }}>
                    <Ionicons name="person-add-outline" size={20} color="#6B7280" />
                    <AppText style={{ fontSize: 13, color: "#6B7280" }}>No farmer found</AppText>
                </View>
            )}

            <View style={ss.dividerRow}>
                <View style={ss.dividerLine} /><AppText style={ss.dividerText}>OR</AppText><View style={ss.dividerLine} />
            </View>
            <Pressable style={ss.registerNewBtn} onPress={onRegisterNew}>
                <Ionicons name="person-add" size={18} color="#FFFFFF" />
                <AppText style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>Register New Farmer</AppText>
            </Pressable>
        </View>
    );
}

const ss = StyleSheet.create({
    container: { backgroundColor: "#FFFFFF", margin: 16, borderRadius: 16, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    heading: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginBottom: 2 },
    subheading: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
    inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 2 },
    searchInput: { flex: 1, fontSize: 14, color: "#1F2937", paddingVertical: 12 },
    resultsList: { marginTop: 8, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, overflow: "hidden" },
    resultItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "#FFFFFF" },
    resultAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center" },
    resultAvatarText: { fontSize: 15, fontWeight: "700", color: "#065F46" },
    resultName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    resultMobile: { fontSize: 12, color: "#6B7280", marginTop: 1 },
    registeredCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#6EE7B7", borderRadius: 12, padding: 12 },
    registeredTitle: { fontSize: 12, fontWeight: "700", color: "#059669", marginBottom: 2 },
    registeredName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    registeredMobile: { fontSize: 13, color: "#374151", marginTop: 1 },
    registeredMeta: { fontSize: 12, color: "#6B7280", marginTop: 1 },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 14 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    dividerText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
    registerNewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#386641", borderRadius: 12, paddingVertical: 13 },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function AddBeneficiary() {
    const router = useRouter();
    const { user } = useAuth();
    const { beneficiaryLocationPick, setBeneficiaryLocationPick } = useOnboardingStore();

    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [conflictFarmer, setConflictFarmer] = useState<ApiUserProfile | null>(null);
    const [showStep2Error, setShowStep2Error] = useState(false);

    const [personal, setPersonal] = useState<PersonalForm>({
        name: "", mobile: "", age: "", gender: "", fathersName: "", aadhaar: "", photoUrl: "",
    });
    const [personalErrors, setPersonalErrors] = useState<Partial<PersonalForm>>({});

    const [location, setLocation] = useState<LocationForm>({
        state: "", district: "", tehsil: "", block: "",
        village: "", gramPanchayat: "", nyayPanchayat: "",
        pinCode: "", postOffice: "",
        lat: null, lng: null, address: "",
    });
    const [locationErrors, setLocationErrors] = useState<Partial<Record<keyof LocationForm, string>>>({});

    const [land, setLand] = useState<LandForm>({ totalLandArea: "", rabiCrop: "", kharifCrop: "" });
    const [livestock, setLivestock] = useState<LivestockForm>({
        cow: "", buffalo: "", goat: "", sheep: "", pig: "", poultry: "", others: "",
    });

    // Consume beneficiary location pick when screen comes back into focus
    // Also reverse-geocode to extract state/district for the payload
    useFocusEffect(useCallback(() => {
        if (!beneficiaryLocationPick) return;
        const pick = beneficiaryLocationPick;
        setBeneficiaryLocationPick(null);

        setLocation((prev) => ({
            ...prev,
            lat: pick.lat,
            lng: pick.lng,
            address: pick.address,
        }));

        // Best-effort: parse state/district from the address string
        // so the backend payload has location context even without manual entry
        (async () => {
            try {
                const { parseGoogleAddress } = await import("@/utils/locationUtils");
                const parsed = await parseGoogleAddress(pick.lat, pick.lng);
                if (parsed) {
                    setLocation((prev) => ({
                        ...prev,
                        state: parsed.state || prev.state,
                        district: parsed.district || prev.district,
                        tehsil: parsed.tehsil || prev.tehsil,
                        block: parsed.block || prev.block,
                        village: parsed.village || prev.village,
                        pinCode: parsed.pinCode || prev.pinCode,
                        postOffice: parsed.postOffice || prev.postOffice,
                    }));
                }
            } catch { /* silent — lat/lng is enough */ }
        })();
    }, [beneficiaryLocationPick, setBeneficiaryLocationPick]));

    // ── Photo capture ─────────────────────────────────────────
    async function handleCapturePhoto() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Camera access is required to capture the farmer's photo.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.[0]?.uri) return;
        const uri = result.assets[0].uri;
        setUploadingPhoto(true);
        try {
            const url = await uploadApi.uploadUserPhoto(uri);
            setPersonal((prev) => ({ ...prev, photoUrl: (url as any)?.data?.url ?? uri }));
        } catch {
            // Keep local URI as fallback so the photo still shows
            setPersonal((prev) => ({ ...prev, photoUrl: uri }));
        } finally {
            setUploadingPhoto(false);
        }
    }

    // ── Validation ────────────────────────────────────────────
    function validateStep1(): boolean {
        const errs: Partial<PersonalForm> = {};
        if (!personal.name.trim()) errs.name = "Name is required";
        if (!/^\d{10}$/.test(personal.mobile)) errs.mobile = "Enter a valid 10-digit mobile number";
        const ageNum = parseInt(personal.age);
        if (!personal.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) errs.age = "Enter a valid age (1–120)";
        if (!personal.gender) errs.gender = "Gender is required";
        if (!personal.fathersName.trim()) errs.fathersName = "Father's name is required";
        if (personal.aadhaar && !/^\d{12}$/.test(personal.aadhaar)) errs.aadhaar = "Aadhaar must be 12 digits";
        setPersonalErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateStep2(): boolean {
        const errs: Partial<Record<keyof LocationForm, string>> = {};
        if (location.lat === null) errs.address = "GPS location is mandatory";
        if (!location.state.trim()) errs.state = "State is required";
        if (!location.district.trim()) errs.district = "District is required";
        if (!location.tehsil.trim()) errs.tehsil = "Tehsil is required";
        if (!location.block.trim()) errs.block = "Block is required";
        if (!location.pinCode.trim() || location.pinCode.length !== 6) errs.pinCode = "Valid 6-digit PIN required";
        if (!location.postOffice.trim()) errs.postOffice = "Post Office is required";
        if (!location.nyayPanchayat.trim()) errs.nyayPanchayat = "Nyay Panchayat is required";
        if (!location.gramPanchayat.trim()) errs.gramPanchayat = "Gram Panchayat is required";
        if (!location.village.trim()) errs.village = "Village is required";
        
        setLocationErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ── Navigation ────────────────────────────────────────────
    function handleNext() {
        if (step === 0 && !validateStep1()) return;
        if (step === 1 && !validateStep2()) { setShowStep2Error(true); return; }
        setShowStep2Error(false);
        setStep((s) => s + 1);
    }
    function handleBack() {
        if (step === 0) setShowForm(false);
        else setStep((s) => s - 1);
    }

    // ── Submit ────────────────────────────────────────────────
    async function handleSubmit() {
        if (!validateStep2()) { setStep(1); return; }
        setSubmitting(true);
        setConflictFarmer(null);
        try {
            const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
            const { tokenManager } = await import("@/services/apiService");
            const token = await tokenManager.getToken();

            const payload: Record<string, any> = {
                name: personal.name.trim(),
                mobile_number: personal.mobile,
                password: DEFAULT_PASSWORD,
                age: parseInt(personal.age),
                gender: personal.gender,
                fathers_name: personal.fathersName.trim(),
                state: location.state.trim(),
                district: location.district.trim(),
                tehsil: location.tehsil.trim(),
                block: location.block.trim(),
                pin_code: location.pinCode.trim(),
                post_office: location.postOffice.trim(),
                nyay_panchayat: location.nyayPanchayat.trim(),
                gram_panchayat: location.gramPanchayat.trim(),
                village: location.village.trim(),
                registered_by: user?.id,
            };
            if (personal.photoUrl) payload.photo_url = personal.photoUrl;
            if (personal.aadhaar) payload.aadhaar_number = personal.aadhaar;
            if (location.lat !== null) { payload.latitude = location.lat; payload.longitude = location.lng; }

            const landArea = parseFloat(land.totalLandArea);
            if (!isNaN(landArea) && landArea > 0) {
                payload.land_details = {
                    total_land_area: landArea,
                    rabi_crop: land.rabiCrop || undefined,
                    kharif_crop: land.kharifCrop || undefined,
                };
            }
            const hasLivestock = Object.values(livestock).some((v) => parseInt(v) > 0);
            if (hasLivestock) {
                payload.livestock_details = {
                    cow: parseInt(livestock.cow) || 0, buffalo: parseInt(livestock.buffalo) || 0,
                    goat: parseInt(livestock.goat) || 0, sheep: parseInt(livestock.sheep) || 0,
                    pig: parseInt(livestock.pig) || 0, poultry: parseInt(livestock.poultry) || 0,
                    others: parseInt(livestock.others) || 0,
                };
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(payload),
            });

            // Conflict — mobile already exists
            if (response.status === 409 || response.status === 400) {
                const data = await response.json().catch(() => ({}));
                const msg: string = data?.message ?? "";
                if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("mobile")) {
                    // Fetch the existing farmer to show in conflict card
                    try {
                        const searchRes = await fetch(
                            `${API_BASE_URL}/users?search=${encodeURIComponent(personal.mobile)}&limit=1`,
                            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                        );
                        const searchData = await searchRes.json();
                        const existing = searchData?.data?.users?.[0] ?? searchData?.users?.[0] ?? null;
                        setConflictFarmer(existing);
                    } catch {
                        setConflictFarmer({ id: "", name: "Unknown", mobile_number: personal.mobile } as any);
                    }
                    return;
                }
                throw new Error(data.message || `Request failed (${response.status})`);
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || `Request failed (${response.status})`);
            }

            Alert.alert("Farmer Registered", `${personal.name} has been successfully registered.`,
                [{ text: "OK", onPress: () => router.back() }]);
        } catch (err) {
            Alert.alert("Registration Failed", err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <Pressable onPress={() => showForm ? handleBack() : router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        {showForm ? (
                            <>
                                <AppText style={s.stepLabel}>Step {step + 1} of {TOTAL_STEPS}</AppText>
                                <AppText style={s.stepTitle}>{STEP_TITLES[step]}</AppText>
                                <AppText style={s.stepSubtitle}>{STEP_SUBTITLES[step]}</AppText>
                            </>
                        ) : (
                            <>
                                <AppText style={s.stepTitle}>Add Beneficiary</AppText>
                                <AppText style={s.stepSubtitle}>Search or register a new farmer</AppText>
                            </>
                        )}
                    </View>
                </View>
                {showForm && (
                    <>
                        <View style={s.progressTrack}>
                            <View style={[s.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
                        </View>
                        <StepIndicator current={step} total={TOTAL_STEPS} />
                    </>
                )}
            </View>

            {/* Search section */}
            {!showForm && (
                <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <SearchSection onRegisterNew={() => setShowForm(true)} />
                </KeyboardAwareScrollView>
            )}

            {/* Form */}
            {showForm && (
                <>
                    {/* Conflict card */}
                    {conflictFarmer && (
                        <ConflictCard farmer={conflictFarmer} onDismiss={() => setConflictFarmer(null)} />
                    )}

                    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent}
                        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {step === 0 && (
                            <Step1 form={personal} setForm={setPersonal} errors={personalErrors}
                                uploadingPhoto={uploadingPhoto} onCapturePhoto={handleCapturePhoto} />
                        )}
                        {step === 1 && (
                            <Step2 form={location} setForm={setLocation} errors={locationErrors}
                                onPickOnMap={() => router.push({ pathname: "/(admin)/location-picker", params: { purpose: "beneficiary" } } as any)} />
                        )}
                        {step === 2 && <Step3 form={land} setForm={setLand} />}
                        {step === 3 && <Step4 form={livestock} setForm={setLivestock} />}
                    </KeyboardAwareScrollView>

                    {/* Footer */}
                    <View style={s.footer}>
                        {step > 0 && (
                            <Pressable style={s.backFooterBtn} onPress={handleBack}>
                                <Ionicons name="chevron-back" size={18} color="#6B7280" />
                                <AppText style={s.backFooterText}>Back</AppText>
                            </Pressable>
                        )}
                        {step < TOTAL_STEPS - 1 ? (
                            <View style={{ flex: 1 }}>
                                <Pressable
                                    style={[s.nextBtn, step === 0 ? { flex: 1 } : {}, step === 1 && !(location.lat !== null || (location.state && location.district)) && { opacity: 0.6 }]}
                                    onPress={handleNext}
                                    disabled={step === 1 && !(location.lat !== null || (location.state && location.district))}
                                >
                                    <AppText style={s.nextBtnText}>Next</AppText>
                                    <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                                </Pressable>
                                {step === 1 && showStep2Error && (
                                    <AppText style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>Please pin a location on the map or select State and District</AppText>
                                )}
                            </View>
                        ) : (
                            <Pressable style={[s.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleSubmit} disabled={submitting}>
                                {submitting
                                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                                    : <><Ionicons name="checkmark-circle" size={18} color="#FFFFFF" /><AppText style={s.nextBtnText}>Register Farmer</AppText></>}
                            </Pressable>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.screen },
    header: { backgroundColor: theme.primary.green, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
    headerTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginTop: 2 },
    stepLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    stepTitle: { fontSize: 22, fontWeight: "900", color: theme.text.onPrimary, marginTop: 2 },
    stepSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
    progressTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" },
    progressFill: { height: 4, backgroundColor: theme.text.onPrimary, borderRadius: 2 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    footer: { flexDirection: "row", gap: 10, padding: 16, backgroundColor: theme.background.input, borderTopWidth: 1, borderTopColor: theme.border.subtle },
    backFooterBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.border.subtle, backgroundColor: theme.background.neutralSubtle },
    backFooterText: { fontSize: 14, color: theme.text.muted, fontWeight: "600" },
    nextBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: theme.primary.green, borderRadius: 12, paddingVertical: 14 },
    submitBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: theme.primary.green, borderRadius: 12, paddingVertical: 14 },
    nextBtnText: { fontSize: 15, fontWeight: "700", color: theme.text.onPrimary },
});
