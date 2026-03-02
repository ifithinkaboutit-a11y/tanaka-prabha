// src/components/molecules/BookingModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  Alert,
} from "react-native";
import AppText from "../atoms/AppText";
import { useTranslation } from "../../i18n";

type BookingModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string) => void;
  professionalName: string;
  bookedSlots?: { date: string; time: string }[]; // Already booked slots
  maxAppointmentsPerDay?: number;
};

const AVAILABLE_TIMES = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingModal({
  visible,
  onClose,
  onConfirm,
  professionalName,
  bookedSlots = [],
  maxAppointmentsPerDay = 3,
}: BookingModalProps) {
  const { t } = useTranslation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check how many appointments are booked for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookedSlots.filter((slot) => slot.date === dateStr).length;
  };

  // Check if a date is fully booked
  const isDateFullyBooked = (date: Date) => {
    return getBookingsForDate(date) >= maxAppointmentsPerDay;
  };

  // Check if a time slot is booked
  const isTimeBooked = (date: Date, time: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookedSlots.some((slot) => slot.date === dateStr && slot.time === time);
  };

  // Get available times for selected date
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return AVAILABLE_TIMES.filter((time) => !isTimeBooked(selectedDate, time));
  }, [selectedDate, bookedSlots]);

  // Slots remaining for selected date
  const slotsRemaining = useMemo(() => {
    if (!selectedDate) return maxAppointmentsPerDay;
    return maxAppointmentsPerDay - getBookingsForDate(selectedDate);
  }, [selectedDate, bookedSlots, maxAppointmentsPerDay]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty slots for days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);

    // Can't select past dates
    if (date < today) return;

    // Can't select fully booked dates
    if (isDateFullyBooked(date)) {
      Alert.alert(
        t("connect.booking.fullyBooked"),
        t("connect.booking.fullyBookedMessage")
      );
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert(
        t("connect.booking.selectRequired"),
        t("connect.booking.selectRequiredMessage")
      );
      return;
    }
    onConfirm(selectedDate, selectedTime);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "92%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <View>
              <AppText
                variant="h3"
                style={{ fontWeight: "700", color: "#1F2937", fontSize: 20 }}
              >
                {t("connect.booking.title")}
              </AppText>
              <AppText
                variant="bodySm"
                style={{ color: "#6B7280", marginTop: 4 }}
              >
                {t("connect.booking.with")} {professionalName}
              </AppText>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Month Navigation */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <Pressable
                onPress={handlePrevMonth}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#1F2937" />
              </Pressable>
              <AppText
                variant="h3"
                style={{ fontWeight: "600", color: "#1F2937", fontSize: 18 }}
              >
                {MONTHS[currentMonth]} {currentYear}
              </AppText>
              <Pressable
                onPress={handleNextMonth}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="#1F2937" />
              </Pressable>
            </View>

            {/* Day Headers */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              {DAYS.map((day) => (
                <View
                  key={day}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}
                >
                  <AppText
                    variant="bodySm"
                    style={{ color: "#6B7280", fontWeight: "600", fontSize: 12 }}
                  >
                    {day}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 16,
              }}
            >
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <View key={`empty-${index}`} style={{ width: "14.28%", height: 44 }} />
                  );
                }

                const date = new Date(currentYear, currentMonth, day);
                const isPast = isPastDate(day);
                const isSelected = isDateSelected(day);
                const isFullyBooked = isDateFullyBooked(date);
                const bookingsCount = getBookingsForDate(date);
                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();

                return (
                  <Pressable
                    key={day}
                    onPress={() => handleDateSelect(day)}
                    disabled={isPast}
                    style={{
                      width: "14.28%",
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected
                          ? "#386641"
                          : isFullyBooked
                            ? "#FEE2E2"
                            : isToday
                              ? "#DBEAFE"
                              : "transparent",
                        borderWidth: isToday && !isSelected ? 2 : 0,
                        borderColor: "#2563EB",
                      }}
                    >
                      <AppText
                        variant="bodySm"
                        style={{
                          color: isSelected
                            ? "#FFFFFF"
                            : isPast
                              ? "#D1D5DB"
                              : isFullyBooked
                                ? "#DC2626"
                                : "#1F2937",
                          fontWeight: isSelected || isToday ? "600" : "400",
                          fontSize: 14,
                        }}
                      >
                        {day}
                      </AppText>
                    </View>
                    {/* Booking indicator */}
                    {bookingsCount > 0 && bookingsCount < maxAppointmentsPerDay && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 2,
                          flexDirection: "row",
                          gap: 2,
                        }}
                      >
                        {Array.from({ length: bookingsCount }).map((_, i) => (
                          <View
                            key={i}
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "#F59E0B",
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Slots Remaining Info */}
            {selectedDate && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: slotsRemaining <= 1 ? "#FEF3C7" : "#DCFCE7",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={slotsRemaining <= 1 ? "warning" : "checkmark-circle"}
                  size={20}
                  color={slotsRemaining <= 1 ? "#F59E0B" : "#16A34A"}
                />
                <AppText
                  variant="bodySm"
                  style={{
                    color: slotsRemaining <= 1 ? "#92400E" : "#166534",
                    marginLeft: 8,
                    fontWeight: "500",
                  }}
                >
                  {slotsRemaining} {t("connect.booking.slotsRemaining")}
                </AppText>
              </View>
            )}

            {/* Time Slots */}
            {selectedDate && (
              <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                <AppText
                  variant="h3"
                  style={{
                    fontWeight: "600",
                    color: "#1F2937",
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                >
                  {t("connect.booking.selectTime")}
                </AppText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {/* Time Slots */}
                  {AVAILABLE_TIMES.map((time) => {
                    const isBooked = isTimeBooked(selectedDate, time);
                    const isTimeSelected = selectedTime === time;

                    return (
                      <Pressable
                        key={time}
                        onPress={() => !isBooked && handleTimeSelect(time)}
                        disabled={isBooked}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          backgroundColor: isTimeSelected
                            ? "#386641"
                            : isBooked
                              ? "#F3F4F6"
                              : "#FFFFFF",
                          borderWidth: 1,
                          borderColor: isTimeSelected
                            ? "#386641"
                            : isBooked
                              ? "#E5E7EB"
                              : "#D1D5DB",
                        }}
                      >
                        <AppText
                          variant="bodySm"
                          style={{
                            color: isTimeSelected
                              ? "#FFFFFF"
                              : isBooked
                                ? "#9CA3AF"
                                : "#1F2937",
                            fontWeight: isTimeSelected ? "600" : "500",
                            fontSize: 14,
                            textDecorationLine: isBooked ? "line-through" : "none",
                          }}
                        >
                          {time}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Confirm Button — Always visible sticky footer */}
          <View
            style={{
              padding: 20,
              paddingBottom: 28,
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Pressable
              onPress={handleConfirm}
              disabled={!selectedDate || !selectedTime}
              style={({ pressed }) => ({
                backgroundColor:
                  selectedDate && selectedTime ? "#386641" : "#D1D5DB",
                borderRadius: 25,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={selectedDate && selectedTime ? "#FFFFFF" : "#9CA3AF"}
                style={{ marginRight: 8 }}
              />
              <AppText
                variant="bodyMd"
                style={{
                  color: selectedDate && selectedTime ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {t("connect.booking.confirm")}
              </AppText>
            </Pressable>
            {!selectedDate && (
              <AppText
                variant="bodySm"
                style={{ color: "#9CA3AF", textAlign: "center", marginTop: 8, fontSize: 12 }}
              >
                {t("connect.booking.selectDate")} {"&"} {t("connect.booking.selectTime")}
              </AppText>
            )}
            {selectedDate && !selectedTime && (
              <AppText
                variant="bodySm"
                style={{ color: "#9CA3AF", textAlign: "center", marginTop: 8, fontSize: 12 }}
              >
                {t("connect.booking.selectTime")}
              </AppText>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
