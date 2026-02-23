import React from 'react';
import Svg, { Circle, Path, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface StickmanCoinProps {
  size?: number;
  animated?: boolean;
}

export default function StickmanCoin({ size = 24, animated = true }: StickmanCoinProps) {
  const shine = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      shine.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animated]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + shine.value * 0.15,
    transform: [{ scale: 1 + shine.value * 0.04 }],
  }));

  return (
    <Animated.View style={animated ? animStyle : undefined}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFE44D" />
            <Stop offset="30%" stopColor="#FFD700" />
            <Stop offset="70%" stopColor="#DAA520" />
            <Stop offset="100%" stopColor="#B8860B" />
          </SvgLinearGradient>
          <SvgLinearGradient id="coinEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#B8860B" />
            <Stop offset="100%" stopColor="#8B6914" />
          </SvgLinearGradient>
          <SvgLinearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Coin body */}
        <Circle cx={50} cy={50} r={46} fill="url(#coinEdge)" />
        <Circle cx={50} cy={50} r={42} fill="url(#coinGrad)" />

        {/* Inner rim */}
        <Circle cx={50} cy={50} r={36} fill="none" stroke="#DAA520" strokeWidth={1.5} opacity={0.6} />

        {/* Stickman head - round smiling face */}
        <G transform="translate(50, 42)">
          {/* Head circle */}
          <Circle cx={0} cy={0} r={18} fill="#FFF5D4" stroke="#DAA520" strokeWidth={1.5} />

          {/* Eyes - happy curved lines */}
          <Path d="M-8,-4 Q-6,-8 -4,-4" stroke="#5D4037" strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M4,-4 Q6,-8 8,-4" stroke="#5D4037" strokeWidth={2} fill="none" strokeLinecap="round" />

          {/* Big smile */}
          <Path d="M-9,5 Q0,15 9,5" stroke="#5D4037" strokeWidth={2} fill="none" strokeLinecap="round" />

          {/* Rosy cheeks */}
          <Ellipse cx={-11} cy={4} rx={4} ry={2.5} fill="#FFB6C1" opacity={0.5} />
          <Ellipse cx={11} cy={4} rx={4} ry={2.5} fill="#FFB6C1" opacity={0.5} />
        </G>

        {/* Small "S" letter at bottom for "Stickman" */}
        <Path
          d="M44,72 Q44,68 50,68 Q56,68 56,72 Q56,76 50,76 Q44,76 44,80"
          stroke="#B8860B"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* Shine highlight */}
        <Ellipse cx={35} cy={30} rx={12} ry={8} fill="url(#shineGrad)" transform="rotate(-30 35 30)" />
      </Svg>
    </Animated.View>
  );
}

/**
 * Abbreviates large numbers for display using truncation (floor), not rounding.
 * e.g. 1500 → "1.5K", 999500 → "999.5K", 1000000 → "1M", 1200000000 → "1.2B"
 */
export function abbreviateCoins(n: number): string {
  if (n < 1_000) return n.toLocaleString();
  
  const tiers: [number, string][] = [
    [1_000_000_000_000_000, 'Q'],
    [1_000_000_000_000, 'T'],
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ];

  for (const [threshold, suffix] of tiers) {
    if (n >= threshold) {
      // Use floor to truncate, never round up
      const val = Math.floor((n / threshold) * 10) / 10;
      // Drop .0 for clean whole numbers
      const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
      return formatted + suffix;
    }
  }

  return n.toLocaleString();
}
