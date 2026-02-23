import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, useWindowDimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import type { Difficulty } from '@/lib/math-engine';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';

// width is now obtained via useWindowDimensions() inside each component

const difficulties: { key: Difficulty; label: string; icon: string; color: string; desc: string; gradient: [string, string] }[] = [
  { key: 'easy', label: 'Easy', icon: 'star-outline', color: Colors.primary, desc: '1-digit +−×÷\n15s per question', gradient: ['#2ECC71', '#27AE60'] },
  { key: 'average', label: 'Average', icon: 'star-half-full', color: '#F1C40F', desc: '2-digit & fractions\n30s per question', gradient: ['#F1C40F', '#F39C12'] },
  { key: 'difficult', label: 'Difficult', icon: 'star', color: '#E74C3C', desc: '3-digit & fractions\n60s per question', gradient: ['#E74C3C', '#C0392B'] },
];

/* ── Soft floating bubble ── */
function Bubble({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-12, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ), -1, true,
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.12,
      }, animatedStyle]}
    />
  );
}

export default function DifficultyScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  const [showSurvival, setShowSurvival] = React.useState(false);
  const { highScores } = useGameState();
  const { isGuest } = useAuth();
  const { width } = useWindowDimensions();

  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const isLocked = (d: Difficulty) => {
    if (d === 'average' && highScores.easy < 6) return true;
    if (d === 'difficult' && highScores.average < 8) return true;
    return false;
  };

  const handleSelect = (d: Difficulty) => {
    if (isLocked(d)) {
      if (isGuest) {
        setShowLoginModal(true);
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace({ pathname: '/game', params: { difficulty: d, mode: 'survival' } });
  };

  const handleClassic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace('/classic-map');
  };

  const handleSurvival = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowSurvival(true);
  };

  return (
    <LinearGradient
      colors={['#0F4C2E', '#1A7A3D', '#27AE60']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradient}
    >
      {/* ── Subtle background bubbles ── */}
      <Bubble delay={0} x={-20} y={80} size={120} color="#fff" />
      <Bubble delay={500} x={width - 60} y={140} size={90} color={Colors.secondary} />
      <Bubble delay={1000} x={width * 0.3} y={300} size={100} color={Colors.tertiary} />
      <Bubble delay={1500} x={width - 40} y={500} size={70} color={Colors.purple} />
      <Bubble delay={2000} x={20} y={600} size={80} color={Colors.blue} />

      <View style={[styles.container, { paddingTop: topPadding + 16, paddingBottom: bottomPadding + 20 }]}>
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
          <Pressable onPress={() => { if (showSurvival) { setShowSurvival(false); } else { router.back(); }}} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
          </Pressable>
          <Text style={styles.title}>{showSurvival ? 'Survival Mode' : 'Select Mode'}</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {!showSurvival ? (
          /* ── Mode Selection: Two side-by-side buttons ── */
          <View style={styles.modeSelectArea}>
            <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.subtitle}>
              Choose your challenge!
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.modeRow}>
              {/* Classic Button (Left) */}
              <Pressable
                onPress={handleClassic}
                style={({ pressed }) => [
                  styles.modeCard,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <LinearGradient
                  colors={['#fc79efff', '#931f8cff']}
                  style={styles.modeCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.modeIconWrap}>
                    <Ionicons name="map" size={40} color="#fff" />
                  </View>
                  <Text style={styles.modeCardTitle}>Classic</Text>
                  <Text style={styles.modeCardDesc}>Adventure through levels</Text>
                </LinearGradient>
              </Pressable>

              {/* Survival Button (Right) */}
              <Pressable
                onPress={handleSurvival}
                style={({ pressed }) => [
                  styles.modeCard,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <LinearGradient
                  colors={['#E74C3C', '#C0392B']}
                  style={styles.modeCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.modeIconWrap}>
                    <Ionicons name="skull" size={40} color="#fff" />
                  </View>
                  <Text style={styles.modeCardTitle}>Survival</Text>
                  <Text style={styles.modeCardDesc}>Endless math challenge</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        ) : (
          /* ── Survival: difficulty cards ── */
          <View style={styles.content}>
            <Animated.Text entering={FadeInDown.delay(50).springify()} style={styles.subtitle}>
              Endless questions — survive as long as you can!
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.diffSection}>
              <View style={styles.diffColumn}>
                {difficulties.map((d, index) => {
                  const locked = isLocked(d.key);
                  return (
                  <Animated.View key={d.key} entering={FadeInDown.delay(150 + index * 100).springify()}>
                    <Pressable
                      onPress={() => handleSelect(d.key)}
                      style={({ pressed }) => [
                        styles.diffCardContainer,
                        pressed && !locked && { transform: [{ scale: 0.96 }] },
                        locked && { opacity: 0.6 }
                      ]}
                    >
                      <LinearGradient
                         colors={locked ? ['#E0E0E0', '#D5D5D5'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)'] as [string, string]}
                         style={styles.diffCard}
                      >
                        <LinearGradient
                          colors={locked ? ['#B0B0B0', '#9E9E9E'] as [string, string] : d.gradient}
                          style={styles.iconContainer}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons name={locked ? 'lock' : d.icon as any} size={32} color="white" />
                        </LinearGradient>
                        
                        <View style={styles.textContainer}>
                          <Text style={[styles.diffLabel, { color: locked ? '#757575' : d.color }]}>{d.label}</Text>
                          <Text style={styles.diffDesc}>{locked ? 'Locked' : d.desc}</Text>
                          {!locked && <Text style={styles.highScore}>High Score: {highScores[d.key]}</Text>}
                        </View>
                        
                        <View style={[styles.arrowContainer, { backgroundColor: locked ? '#E0E0E0' : `${d.color}15` }]}>
                          {locked ? (
                             <Ionicons name="lock-closed" size={18} color="#9E9E9E" />
                          ) : (
                             <Ionicons name="chevron-forward" size={20} color={d.color} />
                          )}
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        )}
      </View>

      {/* ── Login Modal ── */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="lock-closed" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Level Locked!</Text>
            <Text style={styles.modalDesc}>
              This difficulty level is locked. If you are playing as a Guest, your progress won't be saved to unlock it!
            </Text>
            <Text style={styles.modalSubDesc}>
              Please Log In or Create an Account to save progress and unlock new challenges.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalLoginBtn}
                onPress={() => {
                  setShowLoginModal(false);
                  router.push('/auth');
                }}
              >
                <Text style={styles.modalLoginText}>Log In</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.textWhite,
  },
  placeholder: {
    width: 44,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },

  // ── Mode Selection ──
  modeSelectArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modeCard: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modeCardGradient: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minHeight: 180,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modeIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modeCardTitle: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  modeCardDesc: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // ── Survival difficulty cards ──
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  diffSection: {
    width: '100%',
  },
  diffColumn: {
    flexDirection: 'column',
    gap: 16,
  },
  diffCardContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  diffCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  diffLabel: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    marginBottom: 4,
  },
  diffDesc: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
  },
  highScore: {
    fontSize: 12,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.primary,
    marginTop: 2,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalSubDesc: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textLight,
  },
  modalLoginBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalLoginText: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
});
