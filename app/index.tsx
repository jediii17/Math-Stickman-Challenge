import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
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
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import StickmanCoin, { abbreviateCoins } from '@/components/StickmanCoin';
import AnimatedStickman from '@/components/AnimatedStickman';
import AdBanner from '@/components/AdBanner';

// width is now obtained via useWindowDimensions() inside each component

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

/* ── Animated title word ── */
function TitleWord({ text, color, delay, fontSize = 48 }: { text: string; color: string; delay: number; fontSize?: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ), -1, true,
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Animated.Text
        style={[animatedStyle, {
          fontSize,
          fontFamily: 'Fredoka_700Bold',
          color,
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          textAlign: 'center',
        }]}
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════ */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, logout } = useAuth();
  const { coins, loadFromDb, resetForGuest } = useGameState();
  const { width } = useWindowDimensions();
  const btnWidth = Math.min(width - 56, 600);

  useEffect(() => {
    if (user && !isGuest) {
      loadFromDb(user.id);
    }
  }, [user, isGuest]);

  const handlePlay = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    router.push('/difficulty');
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

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

      <View style={[styles.container, { paddingTop: topPadding + 12, paddingBottom: bottomPadding + 16 }]}>

        {/* ── User Bar ── */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.userBar}>
          {!isGuest && user ? (
            <>
              <Pressable 
                style={styles.userInfo} 
                onPress={() => router.push('/profile')}
              >
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.userName} numberOfLines={1}>{user.username}</Text>
              </Pressable>
              <View style={styles.coinBadge}>
                <StickmanCoin size={20} />
                <Text style={styles.coinText}>{abbreviateCoins(coins)}</Text>
              </View>
            </>
          ) : (
            <View /> // Empty space if guest, login moved below
          )}
          {!isGuest && (
            <Pressable onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <Ionicons name="settings-outline" size={18} color="rgba(255,255,255,0.8)" />
            </Pressable>
          )}
        </Animated.View>

        {/* ── Title Section ── */}
        <View style={styles.titleSection}>
          <TitleWord text="MATH" color="#FFD700" delay={100} fontSize={100} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TitleWord text="Stickman" color="#FFFFFF" delay={300} fontSize={38} />
            <TitleWord text="Challenge" color={Colors.tertiary} delay={450} fontSize={38} />
          </View>
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Animated.Text style={styles.tagline}>
              Train your brain, one equation at a time!
            </Animated.Text>
          </Animated.View>
        </View>

        {/* ── Hero Area ── */}
        <Animated.View entering={ZoomIn.delay(400).duration(800)} style={styles.heroArea}>
          {/* Glow ring behind stickman */}
          <View style={styles.glowRing}>
            <View style={styles.glowRingInner} />
          </View>
          <AnimatedStickman size={270} />
          
          {isGuest && (
            <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.creativeLoginContainer}>
              <Pressable 
                style={styles.creativeLoginBtn}
                onPress={() => router.push('/auth')}
              >
                <View style={styles.loginSticky}>
                  <Text style={styles.loginStickyText}>Login to save progress! ✨</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </View>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Bottom Actions ── */}
        <View style={styles.bottomSection}>
          {/* Start Game button */}
          <Animated.View entering={FadeInUp.delay(600).springify()} style={{ width: '100%', alignItems: 'center' }}>
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => [
                styles.playButton,
                { width: btnWidth },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <LinearGradient
                colors={['#F1C40F', '#F39C12']}
                style={styles.playGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="play" size={28} color="#fff" />
                <Text style={styles.playText}>Start Game</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Shop & Leaderboard row */}
          <Animated.View entering={FadeInUp.delay(750).springify()} style={[styles.secondaryRow, { width: btnWidth }]}>
            {/* Shop Button */}
            <Pressable
              onPress={() => router.push('/shop')}
              style={({ pressed }) => [
                styles.secondaryBtnWrapper,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.secondaryBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="bag-handle" size={24} color="#fff" />
                <Text style={styles.secondaryBtnText}>Shop</Text>
              </LinearGradient>
            </Pressable>

            {/* Leaderboard Button */}
            <Pressable
              onPress={() => router.push('/leaderboard')}
              style={({ pressed }) => [
                styles.secondaryBtnWrapper,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <LinearGradient
                colors={['#F1C40F', '#F39C12']}
                style={styles.secondaryBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={24} color="#fff" />
                <Text style={styles.secondaryBtnText}>Leaderboard</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </View>
      <AdBanner />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },

  /* ── User Bar ── */
  userBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textWhite,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  coinText: {
    fontSize: 17,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFD700',
  },
  loginBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
  },
  profileBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  creativeLoginContainer: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    zIndex: 10,
  },
  creativeLoginBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEB3B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '-2deg' }],
    gap: 8,
  },
  loginStickyText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
  },
  logoutBtn: {
    padding: 8,
  },

  /* ── Title ── */
  titleSection: {
    alignItems: 'center',
    gap: 0,
  },
  tagline: {
    fontSize: 17,
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  /* ── Hero ── */
  heroArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,215,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* ── Bottom ── */
  bottomSection: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  playButton: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  playText: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shopBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shopBtnText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.primary,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  secondaryBtnWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  secondaryBtnText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
