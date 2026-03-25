/*
 * src/app/location-picker.tsx
 *
 * INTENTIONAL ALIAS — do not delete or merge into (auth)/location-picker.tsx.
 *
 * Expo Router resolves navigation paths relative to the route group a screen
 * belongs to. Screens outside the (auth) group (e.g. profile, personal-details,
 * land-details) cannot navigate to "/(auth)/location-picker" without coupling
 * themselves to the auth route group. This root-level file re-exports the same
 * component so those screens can navigate to "/location-picker" instead, keeping
 * the route group boundary clean and avoiding duplicated component logic.
 *
 * Both /(auth)/location-picker and /location-picker resolve to the same screen.
 */
export { default } from "./(auth)/location-picker";
export { unstable_settings } from "./(auth)/location-picker";
