import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { View, Text, StyleSheet, Modal, Pressable as RNPressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase";
import { useGameState } from "@/hooks/useGameState";
import { AuthProvider } from "@/contexts/AuthContext";
import { MultiplayerProvider } from "@/contexts/MultiplayerProvider";
import { AudioProvider } from "@/contexts/AudioContext";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

const AFK_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

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

function AppContent() {
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
    if (lobbyBgm && !bgmStarted.current) {
      lobbyBgm.loop = true;
      lobbyBgm.volume = 0.3;
      lobbyBgm.play();
      bgmStarted.current = true;
      SplashScreen.hideAsync();
    }
  }, [lobbyBgm]);

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

  // -- AFK Logic --
  const [showAfkDialog, setShowAfkDialog] = useState(false);
  const afkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAfkTimer = useCallback(() => {
    if (showAfkDialog) return; 
    if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    afkTimerRef.current = setTimeout(() => {
      setShowAfkDialog(true);
    }, AFK_TIMEOUT_MS);
  }, [showAfkDialog]);

  useEffect(() => {
    resetAfkTimer();
    return () => {
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    };
  }, [resetAfkTimer]);

  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={resetAfkTimer}
      pointerEvents={showAfkDialog ? 'box-none' : 'auto'}
    >
      <ErrorBoundary>
        <AudioProvider>
          <AuthProvider>
            <MultiplayerProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </QueryClientProvider>
            </MultiplayerProvider>
          </AuthProvider>
        </AudioProvider>
      </ErrorBoundary>

      {/* AFK Dialog */}
      <Modal
        visible={showAfkDialog}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View style={afkStyles.overlay}>
          <Animated.View entering={FadeIn.duration(400)} style={afkStyles.card}>
            <View style={afkStyles.iconContainer}>
              <Ionicons name="alarm-outline" size={48} color="#F39C12" />
            </View>
            <Text style={afkStyles.title}>Are you still there? 🕹️</Text>
            <Text style={afkStyles.message}>
              You've been inactive for a while.{'\n'}Tap below to restart the game.
            </Text>
            <RNPressable
              style={({ pressed }) => [
                afkStyles.restartBtn,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
              ]}
              onPress={() => {
                setShowAfkDialog(false);
                setTimeout(() => {
                  (global as any).__AFK_RESTART_SIGNAL?.();
                }, 100);
              }}
            >
              <LinearGradient
                colors={['#F1C40F', '#F39C12']}
                style={afkStyles.restartGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text style={afkStyles.restartText}>Restart Game</Text>
              </LinearGradient>
            </RNPressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Global App Restarter wrapping logic using the safe React-level tree reload
function AppRestarter({ children }: { children: React.ReactNode }) {
  const [reload, setReload] = useState(false);

  useEffect(() => {
    (global as any).__AFK_RESTART_SIGNAL = () => {
      // Clean up local state synchronously without firing ANY network requests.
      // E.g., DO NOT run `refreshSession`, `signOut`, or `Updates.reloadAsync()`.
      // Those can cause 30,000ms OkHttp fetch timeouts if the network is stale or the app was sleeping.
      try {
        useGameState.getState().resetForGuest();
        queryClient.clear();
        supabase.removeAllChannels().catch(() => {});
      } catch (e) {}

      // Prevent splash screen disappearing early on boot sequence
      SplashScreen.preventAutoHideAsync().catch(() => {});
      
      // Force navigation back to the absolute root to truly 'restart' the flow,
      // avoiding remounting into a deeply nested screen.
      if (router.canDismiss()) {
        router.dismissAll();
      }
      try { router.replace('/'); } catch (e) {}
      
      // Remount the entire React tree
      setReload(true);
    };
    
    return () => {
      delete (global as any).__AFK_RESTART_SIGNAL;
    };
  }, []);

  type Props = { children: React.ReactNode };
  var Restart = ({ children }: Props) => {
    return <>{children}</>;
  };

  const applyReload = () => {
    if (reload) {
      Restart = ({ children }: Props) => {
        return <></>;
      };
      setReload(false);
    }
  };
  useEffect(applyReload);

  return <Restart>{children}</Restart>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    ...MaterialCommunityIcons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <AppRestarter>
      <AppContent />
    </AppRestarter>
  );
}

const afkStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(243, 156, 18, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: 'Fredoka_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  restartBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  restartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  restartText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
});
