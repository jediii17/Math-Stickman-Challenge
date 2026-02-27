import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

SplashScreen.preventAutoHideAsync();

// Configure Google Mobile Ads SDK for strict child-directed compliance (Families Policy)
try {
  mobileAds()
    .setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    })
    .then(() => {
      // Initialize after configuration is set
      return mobileAds().initialize();
    })
    .then(adapterStatuses => {
      console.log('AdMob successfully configured and initialized for Families policy');
    })
    .catch(error => {
      console.warn('Could not initialize mobile ads', error);
    });
} catch (error) {
  console.warn('AdMob init error (non-fatal):', error);
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="difficulty" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="game" />
      <Stack.Screen name="results" />
      <Stack.Screen name="shop" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    ...MaterialCommunityIcons.font,
  });

  const lobbyBgm = useAudioPlayer(require("@/assets/sounds/bgm.mp3"));
  const segments = useSegments();
  const bgmStarted = useRef(false);

  useEffect(() => {
    async function configureAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'duckOthers',
        });
      } catch (error) {
        console.warn("Could not configure audio", error);
      }
    }
    configureAudio();
  }, []);

  // Start lobby BGM once fonts are loaded
  useEffect(() => {
    if (fontsLoaded && lobbyBgm && !bgmStarted.current) {
      lobbyBgm.loop = true;
      lobbyBgm.volume = 0.3;
      lobbyBgm.play();
      bgmStarted.current = true;
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, lobbyBgm]);

  // Pause lobby BGM on game/results screens, resume on lobby screens
  useEffect(() => {
    if (!lobbyBgm || !bgmStarted.current) return;
    const currentRoute = segments[0] || '';
    const isInGame = currentRoute === 'game' || currentRoute === 'results';
    try {
      if (isInGame) {
        lobbyBgm.pause();
      } else {
        lobbyBgm.play();
      }
    } catch (_) {}
  }, [segments, lobbyBgm]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
