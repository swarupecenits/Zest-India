import useAuthStore from "@/store/auth.store";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

import * as Sentry from '@sentry/react-native';
import "./global.css";

Sentry.init({
  dsn: 'https://c0e883a197fb5abac6747a1ebc4b53e0@o4510533608931328.ingest.us.sentry.io/4510537509830656',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default (function RootLayout() {

  const [fontsLoaded,error] = useFonts({
    "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
    "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
    "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
    "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
    "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
  });

  const fetchAuthenticatedUser = useAuthStore((state) => state.fetchAuthenticatedUser);

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) {
      SplashScreen.hideAsync();
      // Fetch authenticated user on app startup to restore session
      fetchAuthenticatedUser();
    }
  }, [fontsLoaded, error, fetchAuthenticatedUser]);

  return <Stack screenOptions={{headerShown:false}}/>;
});