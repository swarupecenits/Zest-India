const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// 1️⃣ Start from Expo default config (VERY IMPORTANT)
let config = getDefaultConfig(__dirname);

// 2️⃣ Apply Sentry configuration
config = getSentryExpoConfig(__dirname, config);

// 3️⃣ Apply NativeWind
module.exports = withNativeWind(config, {
  input: "./app/global.css",
});
