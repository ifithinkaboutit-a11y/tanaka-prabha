// src/app/(admin)/location-picker.tsx
// Renders the shared location-picker inside the (admin) Stack so that
// navigation from add-beneficiary stays in the correct route group and
// router.back() returns to add-beneficiary correctly.
import LocationPickerScreen from "../(auth)/location-picker";

export const unstable_settings = { headerShown: false };

export default function AdminLocationPicker() {
  return <LocationPickerScreen />;
}
