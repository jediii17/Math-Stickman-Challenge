import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, useRouter } from "expo-router";
import { reloadAppAsync } from "expo";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { AppState, AppStateStatus, Modal, View, Text, TouchableOpacity, StyleSheet, PanResponder } from "react-native";
import { resetSupabaseClient } from "@/lib/supabase";
import Colors from "@/constants/colors";
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
  const router = useRouter();
  const bgmStarted = useRef(false);

  // AFK tracking
  const [showAfkModal, setShowAfkModal] = useState(false);
  const AFK_THRESHOLD_MS = 180 * 1000; // 3 minute
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActiveTimeRef = useRef(Date.now());

  // Check if currently inside a match
  const isInGameRef = useRef(false);
  
  useEffect(() => {
    const currentRoute = segments[0] || '';
    isInGameRef.current = currentRoute === 'game' || currentRoute === 'multiplayer-game';
    // If entered a game, clear any pending AFK timers
    if (isInGameRef.current && inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    } else {
      resetInactivityTimer();
    }
  }, [segments]);

  // Function to show modal, called by both Background Return and Active AFK
  const triggerAfk = () => {
    if (isInGameRef.current) return;
    setShowAfkModal(true);
  };

  // Reset the active timer (called on touches and app mounts)
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    lastActiveTimeRef.current = Date.now();
    
    // Do not start the timer if they are actively in a game match
    if (!isInGameRef.current) {
      inactivityTimer.current = setTimeout(triggerAfk, AFK_THRESHOLD_MS) as any;
    }
  };

  // 1. Detect if they walk away while the app is actively open on the screen
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          resetInactivityTimer();
          return false;
        },
        onMoveShouldSetPanResponderCapture: () => {
          resetInactivityTimer();
          return false;
        },
        onPanResponderTerminationRequest: () => true,
      }),
    []
  );

  // 2. Detect if they put the app in the background and come back later
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const elapsed = Date.now() - lastActiveTimeRef.current;
        if (elapsed > AFK_THRESHOLD_MS && !isInGameRef.current) {
          triggerAfk();
        } else {
          // They came back quickly enough (or were in game), restart the active timer
          resetInactivityTimer();
        }
      } else {
        // App went to background, clear the active timer and record the time
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        lastActiveTimeRef.current = Date.now();
      }
    });

    // Start the active timer when the component mounts
    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      subscription.remove();
    };
  }, []);

  const handleRestart = async () => {
    setShowAfkModal(false);
    resetInactivityTimer();
    
    try {
      await reloadAppAsync();
    } catch (e) {
      console.warn("Failed to reload app, falling back to home navigation", e);
      router.replace('/');
    }
  };

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
    const isInGame = currentRoute === 'game' || currentRoute === 'results' || currentRoute === 'multiplayer-game';
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
          <GestureHandlerRootView style={{ flex: 1 }} {...panResponder.panHandlers}>
            <RootLayoutNav />
            {/* AFK Restart Modal */}
            <Modal
              visible={showAfkModal}
              transparent={true}
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Session Paused</Text>
                  <Text style={styles.modalText}>You've been away for a while! Please restart to ensure a stable connection.</Text>
                  <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                    <Text style={styles.restartButtonText}>Restart Game</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  restartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  restartButtonText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: 'white',
  },
});
