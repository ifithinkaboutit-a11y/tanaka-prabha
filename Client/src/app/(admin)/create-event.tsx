// src/app/(admin)/create-event.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import apiService from "@/services/apiService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── helpers ────────────────────────────────────────────────
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const MERIDIEM = ["AM", "PM"];

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

// ─── sub-components ─────────────────────────────────────────
function SectionHeader({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={sec.row}>
            <Ionicons name={icon as any} size={18} color="#3B82F6" />
            <AppText style={sec.label}>{label}</AppText>
        </View>
    );
}

const sec = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: 20, gap: 8 },
    label: { fontSize: 14, fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
});

// ─── Calendar Modal ──────────────────────────────────────────
function CalendarModal({
    visible,
    onClose,
    onSelect,
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
}) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState<number | null>(null);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    function prevMonth() {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setSelected(null);
    }
    function nextMonth() {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setSelected(null);
    }
    function confirm() {
        if (selected === null) return;
        const dateStr = `${year}-${pad2(month + 1)}-${pad2(selected)}`;
        onSelect(dateStr);
        onClose();
    }

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={cal.overlay} onPress={onClose}>
                <Pressable style={cal.card} onPress={e => e.stopPropagation()}>
                    {/* header */}
                    <View style={cal.header}>
                        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
                            <Ionicons name="chevron-back" size={20} color="#1F2937" />
                        </TouchableOpacity>
                        <AppText style={cal.monthLabel}>{MONTHS[month]} {year}</AppText>
                        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
                            <Ionicons name="chevron-forward" size={20} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    {/* day-of-week header */}
                    <View style={cal.weekRow}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <AppText key={d} style={cal.weekDay}>{d}</AppText>
                        ))}
                    </View>

                    {/* grid */}
                    <View style={cal.grid}>
                        {cells.map((day, idx) => {
                            const isSelected = day === selected;
                            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    disabled={!day}
                                    onPress={() => day && setSelected(day)}
                                    style={[
                                        cal.cell,
                                        isSelected && cal.cellSelected,
                                        isToday && !isSelected && cal.cellToday,
                                    ]}
                                >
                                    {day ? (
                                        <Text style={[cal.cellText, isSelected && cal.cellTextSel]}>
                                            {day}
                                        </Text>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Button
                        variant="primary"
                        label={selected ? `Confirm — ${pad2(selected)} ${MONTHS[month].slice(0, 3)} ${year}` : "Pick a day"}
                        disabled={selected === null}
                        onPress={confirm}
                        style={{ marginTop: 12, backgroundColor: "#3B82F6", borderColor: "#3B82F6" } as any}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const cal = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
    card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, width: 340, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    navBtn: { padding: 8 },
    monthLabel: { fontSize: 17, fontWeight: "700", color: "#111827" },
    weekRow: { flexDirection: "row", marginBottom: 6 },
    weekDay: { flex: 1, textAlign: "center", fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    cell: { width: `${100 / 7}%` as any, aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 999 },
    cellSelected: { backgroundColor: "#3B82F6" },
    cellToday: { borderWidth: 1.5, borderColor: "#3B82F6" },
    cellText: { fontSize: 14, color: "#374151" },
    cellTextSel: { color: "#fff", fontWeight: "700" },
});

// ─── Time Picker Modal ───────────────────────────────────────
function TimePickerModal({
    visible,
    label,
    onClose,
    onSelect,
}: {
    visible: boolean;
    label: string;
    onClose: () => void;
    onSelect: (time: string) => void;
}) {
    const [hour, setHour] = useState("09");
    const [minute, setMinute] = useState("00");
    const [meridiem, setMeridiem] = useState("AM");

    function confirm() {
        onSelect(`${hour}:${minute} ${meridiem}`);
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={tp.overlay} onPress={onClose}>
                <Pressable style={tp.sheet} onPress={e => e.stopPropagation()}>
                    <View style={tp.handle} />
                    <AppText style={tp.title}>{label}</AppText>

                    <View style={tp.pickerRow}>
                        {/* Hours */}
                        <View style={tp.col}>
                            <AppText style={tp.colLabel}>Hour</AppText>
                            <ScrollView style={tp.scroll} showsVerticalScrollIndicator={false}>
                                {HOURS.map(h => (
                                    <TouchableOpacity key={h} style={[tp.option, h === hour && tp.optionSel]} onPress={() => setHour(h)}>
                                        <Text style={[tp.optionText, h === hour && tp.optionTextSel]}>{h}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <AppText style={tp.colon}>:</AppText>

                        {/* Minutes */}
                        <View style={tp.col}>
                            <AppText style={tp.colLabel}>Min</AppText>
                            <ScrollView style={tp.scroll} showsVerticalScrollIndicator={false}>
                                {MINUTES.map(m => (
                                    <TouchableOpacity key={m} style={[tp.option, m === minute && tp.optionSel]} onPress={() => setMinute(m)}>
                                        <Text style={[tp.optionText, m === minute && tp.optionTextSel]}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* AM/PM */}
                        <View style={tp.col}>
                            <AppText style={tp.colLabel}>AM/PM</AppText>
                            <View style={{ gap: 8, marginTop: 4 }}>
                                {MERIDIEM.map(mer => (
                                    <TouchableOpacity key={mer} style={[tp.option, mer === meridiem && tp.optionSel]} onPress={() => setMeridiem(mer)}>
                                        <Text style={[tp.optionText, mer === meridiem && tp.optionTextSel]}>{mer}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Preview */}
                    <View style={tp.preview}>
                        <Ionicons name="time-outline" size={18} color="#3B82F6" />
                        <AppText style={tp.previewText}>{hour}:{minute} {meridiem}</AppText>
                    </View>

                    <Button
                        variant="primary"
                        label="Confirm Time"
                        onPress={confirm}
                        style={{ marginTop: 8, backgroundColor: "#3B82F6", borderColor: "#3B82F6" } as any}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const tp = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    handle: { width: 44, height: 4, backgroundColor: "#E5E7EB", borderRadius: 4, alignSelf: "center", marginBottom: 16 },
    title: { fontSize: 18, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 20 },
    pickerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 8 },
    col: { alignItems: "center", flex: 1 },
    colLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginBottom: 6, textTransform: "uppercase" },
    scroll: { maxHeight: 180 },
    option: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", marginBottom: 4 },
    optionSel: { backgroundColor: "#3B82F6" },
    optionText: { fontSize: 18, color: "#374151", fontWeight: "500" },
    optionTextSel: { color: "#fff", fontWeight: "700" },
    colon: { fontSize: 28, fontWeight: "700", color: "#374151", marginTop: 32 },
    preview: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 12 },
    previewText: { fontSize: 22, fontWeight: "700", color: "#1D4ED8" },
});

// ─── Main Screen ─────────────────────────────────────────────
export default function CreateEvent() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [guidelines, setGuidelines] = useState("");
    const [requirements, setRequirements] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [locationName, setLocationName] = useState("");
    const [locationAddress, setLocationAddress] = useState("");

    // image
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // modals
    const [showCalendar, setShowCalendar] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [loading, setLoading] = useState(false);

    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Please allow access to your photo library.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.[0]) return;

        const uri = result.assets[0].uri;
        setImageUri(uri);
        setUploadingImage(true);
        try {
            const url = await apiService.upload.uploadEventImage(uri);
            setImageUrl(url);
        } catch {
            Alert.alert("Upload Failed", "Could not upload image — event will be created without a hero image.");
            setImageUri(null);
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleCreate() {
        if (!title || !date || !startTime || !locationName) {
            Alert.alert("Missing Fields", "Please fill in Title, Date, Start Time and Location.");
            return;
        }
        setLoading(true);
        try {
            await apiService.events.create({
                title,
                description,
                date,
                start_time: startTime,
                end_time: endTime,
                location_name: locationName,
                location_address: locationAddress,
                guidelines_and_rules: guidelines,
                requirements,
                hero_image_url: imageUrl || undefined,
                status: "upcoming",
            });
            Alert.alert("✅ Success", "Event created successfully!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert("Error", "Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <CalendarModal
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onSelect={setDate}
            />
            <TimePickerModal
                visible={showStartPicker}
                label="Start Time"
                onClose={() => setShowStartPicker(false)}
                onSelect={setStartTime}
            />
            <TimePickerModal
                visible={showEndPicker}
                label="End Time"
                onClose={() => setShowEndPicker(false)}
                onSelect={setEndTime}
            />

            <KeyboardAvoidingView
                style={s.root}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Page header */}
                    <View style={s.pageHeader}>
                        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="#1F2937" />
                        </TouchableOpacity>
                        <View>
                            <AppText style={s.pageTitle}>Create Event</AppText>
                            <AppText style={s.pageSubtitle}>Fill in all the event details below</AppText>
                        </View>
                    </View>

                    <View style={s.card}>

                        {/* ── Hero Image ── */}
                        <SectionHeader icon="image-outline" label="Event Cover Image" />
                        <TouchableOpacity style={s.imagePicker} onPress={pickImage} disabled={uploadingImage}>
                            {uploadingImage ? (
                                <View style={s.imageLoading}>
                                    <ActivityIndicator color="#3B82F6" />
                                    <AppText style={{ color: "#3B82F6", marginTop: 8, fontSize: 13 }}>Uploading…</AppText>
                                </View>
                            ) : imageUri ? (
                                <>
                                    <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                                    <View style={s.imageOverlay}>
                                        <Ionicons name="camera" size={22} color="#fff" />
                                        <AppText style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>Tap to change</AppText>
                                    </View>
                                    {imageUrl && (
                                        <View style={s.uploadedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                            <AppText style={{ color: "#10B981", fontSize: 11, marginLeft: 4 }}>Uploaded</AppText>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={s.imageEmpty}>
                                    <Ionicons name="add-circle-outline" size={36} color="#9CA3AF" />
                                    <AppText style={s.imageEmptyText}>Tap to upload cover image</AppText>
                                    <AppText style={s.imageEmptyHint}>Recommended: 16:9 ratio</AppText>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* ── Basic Info ── */}
                        <SectionHeader icon="information-circle-outline" label="Basic Information" />
                        <TextInput
                            style={s.input}
                            placeholder="Event Title *"
                            placeholderTextColor="#9CA3AF"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[s.input, s.textArea]}
                            placeholder="Description (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* ── Date & Time ── */}
                        <SectionHeader icon="calendar-outline" label="Date & Time" />

                        {/* Date picker button */}
                        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowCalendar(true)}>
                            <View style={s.pickerBtnLeft}>
                                <Ionicons name="calendar" size={20} color="#3B82F6" />
                                <AppText style={[s.pickerBtnText, !date && s.pickerBtnPlaceholder]}>
                                    {date || "Select Date *"}
                                </AppText>
                            </View>
                            <Ionicons name="chevron-down" size={18} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Time pickers */}
                        <View style={s.timeRow}>
                            <TouchableOpacity style={[s.pickerBtn, { flex: 1 }]} onPress={() => setShowStartPicker(true)}>
                                <View style={s.pickerBtnLeft}>
                                    <Ionicons name="time" size={18} color="#10B981" />
                                    <AppText style={[s.pickerBtnText, !startTime && s.pickerBtnPlaceholder]}>
                                        {startTime || "Start Time *"}
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                            <View style={{ width: 8 }} />
                            <TouchableOpacity style={[s.pickerBtn, { flex: 1 }]} onPress={() => setShowEndPicker(true)}>
                                <View style={s.pickerBtnLeft}>
                                    <Ionicons name="time-outline" size={18} color="#F59E0B" />
                                    <AppText style={[s.pickerBtnText, !endTime && s.pickerBtnPlaceholder]}>
                                        {endTime || "End Time"}
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* ── Location ── */}
                        <SectionHeader icon="location-outline" label="Location" />
                        <TextInput
                            style={s.input}
                            placeholder="Venue / Location Name *"
                            placeholderTextColor="#9CA3AF"
                            value={locationName}
                            onChangeText={setLocationName}
                        />
                        <TextInput
                            style={[s.input, s.textArea, { height: 70 }]}
                            placeholder="Full Address (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={locationAddress}
                            onChangeText={setLocationAddress}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* ── Additional Info ── */}
                        <SectionHeader icon="list-outline" label="Additional Details" />
                        <TextInput
                            style={[s.input, s.textArea]}
                            placeholder="Guidelines & Rules (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={guidelines}
                            onChangeText={setGuidelines}
                            multiline
                            textAlignVertical="top"
                        />
                        <TextInput
                            style={[s.input, s.textArea, { height: 70 }]}
                            placeholder="Requirements (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={requirements}
                            onChangeText={setRequirements}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Buttons */}
                        <Button
                            variant="primary"
                            onPress={handleCreate}
                            disabled={loading || uploadingImage}
                            style={[s.btn, { backgroundColor: "#3B82F6", borderColor: "#3B82F6" }] as any}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <AppText style={s.btnText}>Create Event</AppText>
                            }
                        </Button>
                        <Button
                            variant="outline"
                            label="Cancel"
                            onPress={() => router.back()}
                            style={s.btn}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

// ─── styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 48 },

    pageHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
    backBtn: { padding: 8, backgroundColor: "#fff", borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    pageTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
    pageSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },

    // image
    imagePicker: {
        height: 180,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        overflow: "hidden",
        marginBottom: 4,
        backgroundColor: "#F9FAFB",
    },
    imageLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
    imagePreview: { width: "100%", height: "100%" },
    imageOverlay: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingVertical: 8,
        alignItems: "center",
    },
    uploadedBadge: {
        position: "absolute", top: 8, right: 8,
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#D1FAE5",
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    },
    imageEmpty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 6 },
    imageEmptyText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
    imageEmptyHint: { color: "#9CA3AF", fontSize: 12 },

    // inputs
    input: {
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        marginBottom: 10,
        color: "#1F2937",
        backgroundColor: "#F9FAFB",
    },
    textArea: { height: 90 },

    // picker buttons
    pickerBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: "#F9FAFB",
        marginBottom: 10,
    },
    pickerBtnLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    pickerBtnText: { fontSize: 15, color: "#1F2937", fontWeight: "500" },
    pickerBtnPlaceholder: { color: "#9CA3AF", fontWeight: "400" },
    timeRow: { flexDirection: "row" },

    // action buttons
    btn: { paddingVertical: 15, marginTop: 8 },
    btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16, textAlign: "center" },
});
