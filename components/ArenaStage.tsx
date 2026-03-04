import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  Rect,
  Circle,
  Ellipse,
  Path,
  Line,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface ArenaStageProps {
  width: number;
  height: number;
}

export default function ArenaStage({ width: w, height: h }: ArenaStageProps) {
  // ═══ Animations ═══
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const particle1 = useSharedValue(0);
  const particle2 = useSharedValue(0);
  const particle3 = useSharedValue(0);
  const energyLine = useSharedValue(0);
  const spotlightL = useSharedValue(0);
  const spotlightR = useSharedValue(0);

  useEffect(() => {
    // Pulsing energy orbs
    pulse1.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulse2.value = withRepeat(
      withDelay(
        500,
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Floating particles
    particle1.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
    particle2.value = withRepeat(
      withDelay(
        1000,
        withTiming(1, { duration: 4000, easing: Easing.linear })
      ),
      -1,
      false
    );
    particle3.value = withRepeat(
      withDelay(
        2000,
        withTiming(1, { duration: 3500, easing: Easing.linear })
      ),
      -1,
      false
    );

    // Center energy line pulse
    energyLine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Spotlights sway
    spotlightL.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    spotlightR.value = withRepeat(
      withDelay(
        1500,
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const floorY = h * 0.72;

  // ═══ Animated Props ═══
  // Left glow orb
  const orbLProps = useAnimatedProps(() => ({
    opacity: interpolate(pulse1.value, [0, 1], [0.15, 0.35]),
    r: interpolate(pulse1.value, [0, 1], [w * 0.12, w * 0.16]),
  }));

  // Right glow orb
  const orbRProps = useAnimatedProps(() => ({
    opacity: interpolate(pulse2.value, [0, 1], [0.15, 0.35]),
    r: interpolate(pulse2.value, [0, 1], [w * 0.12, w * 0.16]),
  }));

  // Center energy line
  const energyLineProps = useAnimatedProps(() => ({
    opacity: interpolate(energyLine.value, [0, 0.3, 1], [0.2, 0.4, 0.8]),
    strokeWidth: interpolate(energyLine.value, [0, 0.3, 1], [1, 2, 3]),
  }));

  // Floating particles
  const p1Props = useAnimatedProps(() => ({
    cy: interpolate(particle1.value, [0, 1], [h * 0.65, h * 0.1]),
    opacity: interpolate(particle1.value, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]),
  }));
  const p2Props = useAnimatedProps(() => ({
    cy: interpolate(particle2.value, [0, 1], [h * 0.7, h * 0.05]),
    opacity: interpolate(particle2.value, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0]),
  }));
  const p3Props = useAnimatedProps(() => ({
    cy: interpolate(particle3.value, [0, 1], [h * 0.6, h * 0.08]),
    opacity: interpolate(particle3.value, [0, 0.2, 0.8, 1], [0, 0.7, 0.7, 0]),
  }));

  // Spotlight ellipses
  const spotLProps = useAnimatedProps(() => ({
    rx: interpolate(spotlightL.value, [0, 1], [w * 0.15, w * 0.2]),
    opacity: interpolate(spotlightL.value, [0, 1], [0.08, 0.15]),
  }));
  const spotRProps = useAnimatedProps(() => ({
    rx: interpolate(spotlightR.value, [0, 1], [w * 0.15, w * 0.2]),
    opacity: interpolate(spotlightR.value, [0, 1], [0.08, 0.15]),
  }));

  return (
    <View style={[styles.container, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          {/* Sky gradient */}
          <LinearGradient id="arenaSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B0020" />
            <Stop offset="0.4" stopColor="#1A0A3E" />
            <Stop offset="0.7" stopColor="#12122B" />
            <Stop offset="1" stopColor="#0D1B2A" />
          </LinearGradient>

          {/* Floor gradient */}
          <LinearGradient id="arenaFloor" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A1A4A" />
            <Stop offset="0.5" stopColor="#1A1035" />
            <Stop offset="1" stopColor="#0D0A1A" />
          </LinearGradient>

          {/* Left player glow */}
          <RadialGradient id="glowL" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor="#4ECDC4" stopOpacity="0.6" />
            <Stop offset="0.6" stopColor="#4ECDC4" stopOpacity="0.15" />
            <Stop offset="1" stopColor="#4ECDC4" stopOpacity="0" />
          </RadialGradient>

          {/* Right player glow */}
          <RadialGradient id="glowR" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.6" />
            <Stop offset="0.6" stopColor="#FF6B6B" stopOpacity="0.15" />
            <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background sky */}
        <Rect x={0} y={0} width={w} height={h} rx={16} fill="url(#arenaSky)" />

        {/* Stars */}
        <Circle cx={w * 0.1} cy={h * 0.08} r={1.5} fill="#fff" opacity={0.5} />
        <Circle cx={w * 0.25} cy={h * 0.12} r={1} fill="#fff" opacity={0.3} />
        <Circle cx={w * 0.4} cy={h * 0.05} r={1.2} fill="#fff" opacity={0.4} />
        <Circle cx={w * 0.6} cy={h * 0.1} r={1} fill="#fff" opacity={0.35} />
        <Circle cx={w * 0.75} cy={h * 0.06} r={1.5} fill="#fff" opacity={0.5} />
        <Circle cx={w * 0.9} cy={h * 0.13} r={1} fill="#fff" opacity={0.3} />
        <Circle cx={w * 0.55} cy={h * 0.18} r={0.8} fill="#fff" opacity={0.25} />
        <Circle cx={w * 0.15} cy={h * 0.22} r={1} fill="#fff" opacity={0.3} />
        <Circle cx={w * 0.85} cy={h * 0.2} r={0.8} fill="#fff" opacity={0.25} />

        {/* Arena floor */}
        <Path
          d={`M${w * 0.02},${floorY} L${w * 0.98},${floorY} L${w * 0.92},${h} L${w * 0.08},${h} Z`}
          fill="url(#arenaFloor)"
        />

        {/* Floor grid lines (perspective) */}
        <Line x1={w * 0.5} y1={floorY} x2={w * 0.5} y2={h} stroke="#4ECDC4" strokeWidth={0.5} opacity={0.15} />
        <Line x1={w * 0.3} y1={floorY} x2={w * 0.2} y2={h} stroke="#9B59B6" strokeWidth={0.3} opacity={0.1} />
        <Line x1={w * 0.7} y1={floorY} x2={w * 0.8} y2={h} stroke="#9B59B6" strokeWidth={0.3} opacity={0.1} />
        {/* Horizontal floor lines */}
        <Line x1={w * 0.05} y1={floorY + (h - floorY) * 0.3} x2={w * 0.95} y2={floorY + (h - floorY) * 0.3} stroke="#4ECDC4" strokeWidth={0.3} opacity={0.1} />
        <Line x1={w * 0.07} y1={floorY + (h - floorY) * 0.6} x2={w * 0.93} y2={floorY + (h - floorY) * 0.6} stroke="#4ECDC4" strokeWidth={0.3} opacity={0.1} />

        {/* Floor edge glow */}
        <Line x1={w * 0.02} y1={floorY} x2={w * 0.98} y2={floorY} stroke="#4ECDC4" strokeWidth={2} opacity={0.25} />

        {/* Left player glow on floor */}
        <AnimatedEllipse
          animatedProps={spotLProps}
          cx={w * 0.28}
          cy={floorY + 4}
          ry={h * 0.03}
          fill="#4ECDC4"
        />

        {/* Right player glow on floor */}
        <AnimatedEllipse
          animatedProps={spotRProps}
          cx={w * 0.72}
          cy={floorY + 4}
          ry={h * 0.03}
          fill="#FF6B6B"
        />

        {/* Left energy orb (behind player) */}
        <AnimatedCircle
          animatedProps={orbLProps}
          cx={w * 0.25}
          cy={h * 0.45}
          fill="url(#glowL)"
        />

        {/* Right energy orb (behind opponent) */}
        <AnimatedCircle
          animatedProps={orbRProps}
          cx={w * 0.75}
          cy={h * 0.45}
          fill="url(#glowR)"
        />

        {/* Center energy divider */}
        <AnimatedLine
          animatedProps={energyLineProps}
          x1={w * 0.5}
          y1={h * 0.15}
          x2={w * 0.5}
          y2={floorY}
          stroke="#FFD700"
        />

        {/* Floating energy particles */}
        <AnimatedCircle
          animatedProps={p1Props}
          cx={w * 0.35}
          r={2}
          fill="#4ECDC4"
        />
        <AnimatedCircle
          animatedProps={p2Props}
          cx={w * 0.65}
          r={2.5}
          fill="#FF6B6B"
        />
        <AnimatedCircle
          animatedProps={p3Props}
          cx={w * 0.5}
          r={1.5}
          fill="#FFD700"
        />

        {/* Arena pillars (left) */}
        <G opacity={0.3}>
          <Rect x={w * 0.01} y={h * 0.15} width={w * 0.04} height={floorY - h * 0.15} fill="#2A1A4A" rx={2} />
          <Circle cx={w * 0.03} cy={h * 0.15} r={w * 0.025} fill="#4ECDC4" opacity={0.4} />
          <Rect x={w * 0.01} y={floorY - 4} width={w * 0.04} height={4} fill="#4ECDC4" opacity={0.3} />
        </G>

        {/* Arena pillars (right) */}
        <G opacity={0.3}>
          <Rect x={w * 0.95} y={h * 0.15} width={w * 0.04} height={floorY - h * 0.15} fill="#2A1A4A" rx={2} />
          <Circle cx={w * 0.97} cy={h * 0.15} r={w * 0.025} fill="#FF6B6B" opacity={0.4} />
          <Rect x={w * 0.95} y={floorY - 4} width={w * 0.04} height={4} fill="#FF6B6B" opacity={0.3} />
        </G>

        {/* Decorative arch chains (top) */}
        <Path
          d={`M${w * 0.1},${h * 0.02} Q${w * 0.3},${h * 0.12} ${w * 0.5},${h * 0.04}`}
          stroke="#9B59B6"
          strokeWidth={1}
          fill="none"
          opacity={0.2}
        />
        <Path
          d={`M${w * 0.5},${h * 0.04} Q${w * 0.7},${h * 0.12} ${w * 0.9},${h * 0.02}`}
          stroke="#9B59B6"
          strokeWidth={1}
          fill="none"
          opacity={0.2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
