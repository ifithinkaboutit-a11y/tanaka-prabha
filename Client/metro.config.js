const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./src/styles/global.css",
  // Exclude expo-firebase-recaptcha from CSS interop to fix Button conflicts
  inlineRem: 16,
});
