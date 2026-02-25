import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Line, G, Path, Rect, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  Easing,
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useGameState, AccessoryType } from '@/hooks/useGameState';

interface StickmanProps {
  wrongCount: number;
  size?: number;
  previewOverrides?: Partial<Record<AccessoryType, string | null>>;
  hideArms?: boolean;
  emojiReaction?: { emojis: string[]; type: 'correct' | 'wrong' | 'gameover' } | null;
}

export default function Stickman({ wrongCount, size = 200, previewOverrides, hideArms = false, emojiReaction = null }: StickmanProps) {
  const storeEquipped = useGameState((state) => state.equippedAccessories);
  const equipped = previewOverrides ? { ...storeEquipped, ...previewOverrides } : storeEquipped;
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const bubble1Y = useSharedValue(0);
  const bubble2Y = useSharedValue(0);
  const bubble3Y = useSharedValue(0);
  const bubble4Y = useSharedValue(0);
  const cloudX = useSharedValue(0);
  const planeX = useSharedValue(0);
  const balloonY = useSharedValue(0);
  const birdX = useSharedValue(0);
  const flag1Rot = useSharedValue(0);
  const flag2Rot = useSharedValue(0);

  useEffect(() => {
    if (wrongCount > 0 && wrongCount < 5) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      scale.value = withSequence(
        withSpring(1.08),
        withSpring(1),
      );
    }
  }, [wrongCount]);

  // Bubble floating animation
  useEffect(() => {
    bubble1Y.value = withRepeat(withSequence(
      withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
    bubble2Y.value = withDelay(500, withRepeat(withSequence(
      withTiming(-10, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      withTiming(10, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
    bubble3Y.value = withDelay(1000, withRepeat(withSequence(
      withTiming(-6, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      withTiming(6, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
    bubble4Y.value = withDelay(300, withRepeat(withSequence(
      withTiming(-9, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      withTiming(9, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
    // Scene animations
    cloudX.value = withRepeat(withSequence(
      withTiming(-size * 5.2 * 0.4, { duration: 0 }),
      withTiming(size * 5.2 * 0.7, { duration: 60000, easing: Easing.linear }),
    ), -1, false);
    planeX.value = withRepeat(withSequence(
      withTiming(-size * 5.2 * 0.3, { duration: 0 }),
      withTiming(size * 5.2 * 1.1, { duration: 20000, easing: Easing.linear }),
    ), -1, false);
    balloonY.value = withRepeat(withSequence(
      withTiming(-size * 5.2 * 0.2, { duration: 0 }),
      withTiming(size * 5.2 * 1.1, { duration: 30000, easing: Easing.linear }),
    ), -1, false);
    birdX.value = withRepeat(withSequence(
      withTiming(-size * 5.2 * 0.15, { duration: 0 }),
      withTiming(size * 5.2 * 1.1, { duration: 10000, easing: Easing.linear }),
    ), -1, false);
    flag1Rot.value = withRepeat(withSequence(
      withTiming(3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      withTiming(-2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      withTiming(2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      withTiming(-1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
    flag2Rot.value = withDelay(300, withRepeat(withSequence(
      withTiming(3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      withTiming(-2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      withTiming(2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      withTiming(-1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
  }, []);
  const bodyAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: scale.value },
    ],
  }));

  const bubble1Style = useAnimatedStyle(() => ({ transform: [{ translateY: bubble1Y.value }] }));
  const bubble2Style = useAnimatedStyle(() => ({ transform: [{ translateY: bubble2Y.value }] }));
  const bubble3Style = useAnimatedStyle(() => ({ transform: [{ translateY: bubble3Y.value }] }));
  const bubble4Style = useAnimatedStyle(() => ({ transform: [{ translateY: bubble4Y.value }] }));
  const bubbleAnimStyles = [bubble1Style, bubble2Style, bubble3Style, bubble4Style];
  const cloudAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: cloudX.value }] }));
  const planeAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: planeX.value }] }));
  const balloonAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: balloonY.value }] }));
  const birdAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: birdX.value }] }));
  const flag1AnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: flag1Rot.value }] }));
  const flag2AnimStyle = useAnimatedStyle(() => ({ transform: [{ translateX: flag2Rot.value }] }));
  // -- Layout constants --
  const w = size * 5.2;  // Card width – stretch edge to edge
  const h = size * 2.2;  // Increased canvas height to fill bottom
  const k = size * 1.5;  // Stickman scale (user can tweak this)
  const bk = size * 1.35; // Stable background scale (locked)
  const cx = w / 2;
  const headCY = size * 1.0; // Adjusted to keep top position
  const groundY = size * 2.0; // Adjusted to match feet with larger h
  const headR = k * 0.12;
  const bodyTop = headCY + headR;
  const bodyLen = k * 0.32;
  const bodyBot = bodyTop + bodyLen;
  const legLen = k * 0.22;
  const armY = bodyTop + bodyLen * 0.2;
  const armLen = k * 0.28;
  const sw = k * 0.055; // Stickman line thickness
  const jointR = sw * 0.9;

  // Colors
  const bodyCol = '#37474F';
  const groundCol = '#81C784';
  const groundDark = '#66BB6A';
  const skyTop = '#E8F5E9';
  const skyBot = '#F0FFF4';

  // Visibility
  const showLL = wrongCount < 1;
  const showRL = wrongCount < 2;
  const showLA = wrongCount < 3;
  const showRA = wrongCount < 4;
  const showHead = true;

  // Leg endpoints
  const llEndX = cx - legLen * 0.7;
  const llEndY = bodyBot + legLen;
  const rlEndX = cx + legLen * 0.7;
  const rlEndY = bodyBot + legLen;

  // Arm endpoints
  const laEndX = cx - armLen;
  const laEndY = armY + armLen * 0.5;
  const raEndX = cx + armLen;
  const raEndY = armY + armLen * 0.5;

  const hasHat = equipped.hair === 'hat-robot' || equipped.hair === 'hat-1' || equipped.hair === 'hat-2' || equipped.hair === 'hat-3' || equipped.hair === 'hat-4' || (equipped.hair && equipped.hair.startsWith('hair-'));
  const hasGlasses = equipped.face === 'glasses-1' || equipped.face === 'glasses-2' || equipped.face === 'glasses-3' || (equipped.face && equipped.face.startsWith('face-'));
  const hasUpper = !!equipped.upper;
  const hasLower = !!equipped.lower;
  const hasBack = !!equipped.back;
  const hasBoots = equipped.shoes && equipped.shoes.startsWith('shoes-');

  const getClothesColor = () => {
    if (equipped.upper === 'shirt-2') return "#4CAF50";
    if (equipped.upper === 'shirt-3') return "#9C27B0";
    if (equipped.upper === 'shirt-4') return "#F8BBD0";
    if (equipped.lower === 'shirt-5') return "#F06292";
    if (equipped.lower === 'lower-3') return "#673AB7";
    if (equipped.back === 'shirt-1') return "rgba(231, 76, 60, 0.4)";
    return bodyCol;
  };

    // -- Accessory renderers --
  const renderHat = () => {
    if (!hasHat) return null;

    if (equipped.hair === 'hat-1') {
      return (
        <G>
          <Ellipse cx={cx} cy={headCY - headR * 0.75} rx={headR * 1.5} ry={headR * 0.2} fill={Colors.primary} />
          <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.75} Q${cx - headR * 1.1},${headCY - headR * 1.8} ${cx},${headCY - headR * 1.9} Q${cx + headR * 1.1},${headCY - headR * 1.8} ${cx + headR * 1.1},${headCY - headR * 0.75} Z`} fill={Colors.primary} stroke={Colors.primaryDark} strokeWidth={1} />
          <Line x1={cx - headR * 1.05} y1={headCY - headR * 0.85} x2={cx + headR * 1.05} y2={headCY - headR * 0.85} stroke={Colors.primaryDark} strokeWidth={2} />
        </G>
      );
    }

    if (equipped.hair === 'hat-robot') {
      return (
        <G>
          {/* Main Helmet Base */}
          <Path d={`M${cx - headR * 1.5},${headCY - headR * 0.5}
                   Q${cx - headR * 1.5},${headCY - headR * 2.0} ${cx},${headCY - headR * 2.0}
                   Q${cx + headR * 1.5},${headCY - headR * 2.0} ${cx + headR * 1.5},${headCY - headR * 0.5}
                   L${cx + headR * 1.5},${headCY + headR * 1.2}
                   Q${cx},${headCY + headR * 1.8} ${cx - headR * 1.5},${headCY + headR * 1.2} Z`}
                fill="#37474F" stroke="#263238" strokeWidth={2} />
          {/* Visor Cutout Base */}
          <Path d={`M${cx - headR * 1.2},${headCY - headR * 0.2}
                   Q${cx},${headCY - headR * 0.5} ${cx + headR * 1.2},${headCY - headR * 0.2}
                   L${cx + headR * 1.0},${headCY + headR * 0.8}
                   Q${cx},${headCY + headR * 1.0} ${cx - headR * 1.0},${headCY + headR * 0.8} Z`}
                fill="#111" />
          {/* Glowing Eyes/Visor Line */}
          <Path d={`M${cx - headR * 0.8},${headCY + headR * 0.2} L${cx + headR * 0.8},${headCY + headR * 0.2}`}
                stroke="#00E5FF" strokeWidth={3} strokeLinecap="round" />
          <Circle cx={cx - headR * 0.4} cy={headCY + headR * 0.2} r={3} fill="#FFF" />
          <Circle cx={cx + headR * 0.4} cy={headCY + headR * 0.2} r={3} fill="#FFF" />
          {/* Antenna */}
          <Line x1={cx} y1={headCY - headR * 2.0} x2={cx} y2={headCY - headR * 3.0} stroke="#90A4AE" strokeWidth={2} />
          <Circle cx={cx} cy={headCY - headR * 3.2} r={4} fill="#00E5FF" />
          {/* Ear Bolts */}
          <Rect x={cx - headR * 1.8} y={headCY} width={headR * 0.4} height={headR * 0.6} fill="#78909C" />
          <Rect x={cx + headR * 1.4} y={headCY} width={headR * 0.4} height={headR * 0.6} fill="#78909C" />
        </G>
      );
    }

    if (equipped.hair === 'hat-2') {
      return (
        <G>
          <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.4} Q${cx - headR * 1.1},${headCY - headR * 1.6} ${cx},${headCY - headR * 1.6} Q${cx + headR * 1.1},${headCY - headR * 1.6} ${cx + headR * 1.1},${headCY - headR * 0.4} Z`} fill="#FF5722" stroke="#E64A19" strokeWidth={1} />
          <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.4} L${cx + headR * 1.8},${headCY - headR * 0.4}`} stroke="#E64A19" strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    }

    if (equipped.hair === 'hat-3') {
      return (
        <G>
          <Ellipse cx={cx} cy={headCY - headR * 0.5} rx={headR * 1.8} ry={headR * 0.3} fill="#F06292" />
          <Path d={`M${cx - headR},${headCY - headR * 0.5} Q${cx - headR},${headCY - headR * 1.7} ${cx},${headCY - headR * 1.7} Q${cx + headR},${headCY - headR * 1.7} ${cx + headR},${headCY - headR * 0.5} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Line x1={cx - headR * 0.9} y1={headCY - headR * 0.7} x2={cx + headR * 0.9} y2={headCY - headR * 0.7} stroke="#D81B60" strokeWidth={3} />
        </G>
      );
    }

    if (equipped.hair === 'hat-4') {
      return (
        <G>
          {/* Fairy Crown / Tiara */}
          <Path
            d={`M${cx - headR * 0.9},${headCY - headR * 0.6} Q${cx - headR * 0.9},${headCY - headR * 1.1} ${cx},${headCY - headR * 1.3} Q${cx + headR * 0.9},${headCY - headR * 1.1} ${cx + headR * 0.9},${headCY - headR * 0.6}`}
            fill="none"
            stroke="#FFD700"
            strokeWidth={2}
          />
          <Path
            d={`M${cx - headR * 0.7},${headCY - headR * 0.9} Q${cx - headR * 0.3},${headCY - headR * 1.5} ${cx},${headCY - headR * 1.8} Q${cx + headR * 0.3},${headCY - headR * 1.5} ${cx + headR * 0.7},${headCY - headR * 0.9}`}
            fill="none"
            stroke="#FFD700"
            strokeWidth={2}
          />
          <Circle cx={cx} cy={headCY - headR * 1.8} r={headR * 0.15} fill="#F06292" stroke="#D81B60" strokeWidth={0.5} />
          {/* Sparkles */}
          <G opacity={0.8}>
            <Path d={`M${cx - headR},${headCY - headR} L${cx - headR * 0.8},${headCY - headR * 1.2}`} stroke="#FFD700" strokeWidth={1} />
            <Path d={`M${cx + headR},${headCY - headR} L${cx + headR * 0.8},${headCY - headR * 1.2}`} stroke="#FFD700" strokeWidth={1} />
          </G>
        </G>
      );
    }

    // --- New Hair Styles ---
    if (equipped.hair === 'hair-b1') {
      return (
        <G>
          <Path d={`M${cx - headR * 1.1},${headCY} L${cx - headR * 1.0},${headCY - headR * 0.8} L${cx - headR * 0.6},${headCY - headR * 0.5} L${cx - headR * 0.2},${headCY - headR * 1.2} L${cx + headR * 0.2},${headCY - headR * 0.6} L${cx + headR * 0.8},${headCY - headR * 1.0} L${cx + headR * 1.1},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#2196F3" stroke="#1565C0" strokeLinejoin="round" />
        </G>
      );
    }
    if (equipped.hair === 'hair-b2') {
      return (
        <G>
          <Path d={`M${cx - headR * 1.1},${headCY + headR * 0.2} Q${cx - headR * 1.1},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 1.2} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.3} ${cx},${headCY - headR * 0.1} Q${cx - headR * 0.5},${headCY - headR * 0.3} ${cx - headR * 1.1},${headCY + headR * 0.2} Z`} fill="#795548" stroke="#5D4037" />
        </G>
      );
    }
    if (equipped.hair === 'hair-b3') {
      return (
        <G>
           <Path d={`M${cx - headR * 1.1},${headCY} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 0.3},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 0.5} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#263238" stroke="#000000" />
        </G>
      );
    }
    if (equipped.hair === 'hair-b4') {
      return (
        <G>
          <Path d={`M${cx - headR * 0.9},${headCY} L${cx - headR * 0.9},${headCY - headR * 0.9} Q${cx},${headCY - headR * 1.3} ${cx + headR * 0.9},${headCY - headR * 0.9} L${cx + headR * 0.9},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.9},${headCY} Z`} fill="#4CAF50" stroke="#388E3C" />
          <Path d={`M${cx - headR * 0.8},${headCY - headR * 0.3} L${cx + headR * 0.8},${headCY - headR * 0.3}`} stroke="#388E3C" strokeWidth={1} strokeDasharray="2,2" />
        </G>
      );
    }
    if (equipped.hair === 'hair-g1') {
      return (
        <G>
          <Path d={`M${cx - headR * 0.9},${headCY - headR * 0.5} Q${cx - headR * 1.8},${headCY - headR * 1.2} ${cx - headR * 2.2},${headCY} Q${cx - headR * 1.5},${headCY - headR * 0.2} ${cx - headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
          <Path d={`M${cx + headR * 0.9},${headCY - headR * 0.5} Q${cx + headR * 1.8},${headCY - headR * 1.2} ${cx + headR * 2.2},${headCY} Q${cx + headR * 1.5},${headCY - headR * 0.2} ${cx + headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
          <Circle cx={cx - headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
          <Circle cx={cx + headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
          <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.05},${headCY} Z`} fill="#F06292" stroke="#D81B60" />
        </G>
      );
    }
    if (equipped.hair === 'hair-g2') {
      return (
        <G>
          <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx + headR * 1.3},${headCY + headR * 0.5} ${cx + headR * 1.0},${headCY + headR * 2.5} Q${cx + headR * 0.5},${headCY + headR * 1.5} ${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.5},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY + headR * 1.5} ${cx - headR * 1.0},${headCY + headR * 2.5} Q${cx - headR * 1.3},${headCY + headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#AB47BC" stroke="#8E24AA" />
        </G>
      );
    }
    if (equipped.hair === 'hair-g3') {
      return (
        <G>
           <Path d={`M${cx - headR * 1.1},${headCY + headR} L${cx - headR * 1.1},${headCY - headR * 0.5} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx},${headCY - headR * 1.3} Q${cx + headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 1.1},${headCY - headR * 0.5} L${cx + headR * 1.1},${headCY + headR} Q${cx + headR * 0.5},${headCY} ${cx},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY} ${cx - headR * 1.1},${headCY + headR} Z`} fill="#FFD54F" stroke="#FFB300" />
        </G>
      );
    }
    if (equipped.hair === 'hair-g4') {
      return (
        <G>
          <Path d={`M${cx},${headCY - headR * 1.0} Q${cx + headR * 1.5},${headCY - headR * 2.5} ${cx + headR * 2.0},${headCY - headR * 0.5} Q${cx + headR * 1.0},${headCY - headR * 0.5} ${cx},${headCY - headR * 0.8} Z`} fill="#EF5350" stroke="#D32F2F" />
          <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#F44336" stroke="#D32F2F" />
          <Circle cx={cx} cy={headCY - headR * 0.9} r={headR * 0.2} fill="#FFEB3B" />
        </G>
      );
    }
    if (equipped.hair === 'hair-g5') {
      return (
        <G>
          <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} L${cx + headR * 1.05},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.6} ${cx - headR * 0.5},${headCY - headR * 0.3} L${cx - headR * 0.5},${headCY + headR * 2.5} L${cx - headR * 1.05},${headCY + headR * 2.5} Z`} fill="#212121" stroke="#000000" />
        </G>
      );
    }
    if (equipped.hair === 'hair-b5') {
      return (
        <G>
          {/* Mohawk/Faux-hawk in orange */}
          <Path d={`M${cx - headR * 0.4},${headCY} Q${cx - headR * 0.4},${headCY - headR * 1.8} ${cx},${headCY - headR * 2.0} Q${cx + headR * 0.4},${headCY - headR * 1.8} ${cx + headR * 0.4},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.4},${headCY} Z`} fill="#FF9800" stroke="#E65100" />
          {/* Side fade */}
          <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 0.8} ${cx - headR * 0.4},${headCY - headR * 0.6} L${cx - headR * 0.4},${headCY} Z`} fill="#FFB74D" stroke="#E65100" strokeWidth={0.5} />
          <Path d={`M${cx + headR * 1.0},${headCY} Q${cx + headR * 1.0},${headCY - headR * 0.8} ${cx + headR * 0.4},${headCY - headR * 0.6} L${cx + headR * 0.4},${headCY} Z`} fill="#FFB74D" stroke="#E65100" strokeWidth={0.5} />
        </G>
      );
    }

    return null;
  };

  const renderGlasses = () => {
    // If the helmet is on, don't render any face accessories
    if (equipped.hair === 'hat-robot') return null;
    if (!hasGlasses) return null;
    const lensR = headR * 0.25;
    const eyeOffsetX = headR * 0.4;

    if (equipped.face === 'glasses-1') {
      return (
        <G>
          <Circle cx={cx - eyeOffsetX} cy={headCY} r={lensR} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={2} />
          <Circle cx={cx + eyeOffsetX} cy={headCY} r={lensR} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={2} />
          <Line x1={cx - eyeOffsetX + lensR} y1={headCY} x2={cx + eyeOffsetX - lensR} y2={headCY} stroke="#37474F" strokeWidth={2} />
          <Line x1={cx - eyeOffsetX - lensR} y1={headCY} x2={cx - headR} y2={headCY - lensR} stroke="#37474F" strokeWidth={1.5} />
          <Line x1={cx + eyeOffsetX + lensR} y1={headCY} x2={cx + headR} y2={headCY - lensR} stroke="#37474F" strokeWidth={1.5} />
        </G>
      );
    }

    if (equipped.face === 'glasses-2') {
      return (
        <G>
          <Path d={`M${cx - eyeOffsetX - lensR},${headCY - lensR * 0.8} L${cx - eyeOffsetX + lensR},${headCY - lensR * 0.8} L${cx - eyeOffsetX + lensR},${headCY + lensR * 0.8} L${cx - eyeOffsetX - lensR},${headCY + lensR * 0.8} Z`} fill="none" stroke="#2196F3" strokeWidth={2} />
          <Path d={`M${cx + eyeOffsetX - lensR},${headCY - lensR * 0.8} L${cx + eyeOffsetX + lensR},${headCY - lensR * 0.8} L${cx + eyeOffsetX + lensR},${headCY + lensR * 0.8} L${cx + eyeOffsetX - lensR},${headCY + lensR * 0.8} Z`} fill="none" stroke="#2196F3" strokeWidth={2} />
          <Line x1={cx - eyeOffsetX + lensR} y1={headCY} x2={cx + eyeOffsetX - lensR} y2={headCY} stroke="#2196F3" strokeWidth={2} />
        </G>
      );
    }

    if (equipped.face === 'glasses-3') {
      const g3R = lensR * 1.1;
      return (
        <G>
          <Circle cx={cx - eyeOffsetX} cy={headCY} r={g3R} fill="none" stroke="#E91E63" strokeWidth={2} />
          <Circle cx={cx + eyeOffsetX} cy={headCY} r={g3R} fill="none" stroke="#E91E63" strokeWidth={2} />
          <Line x1={cx - eyeOffsetX + g3R} y1={headCY} x2={cx + eyeOffsetX - g3R} y2={headCY} stroke="#E91E63" strokeWidth={2} />
          <Path d={`M${cx - eyeOffsetX - g3R},${headCY - g3R * 0.5} L${cx - headR},${headCY - g3R * 1.5}`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
          <Path d={`M${cx + eyeOffsetX + g3R},${headCY - g3R * 0.5} L${cx + headR},${headCY - g3R * 1.5}`} stroke="#E91E63" strokeWidth={1.5} strokeLinecap="round" />
        </G>
      );
    }

    // --- New Creative Face Accessories ---
    if (equipped.face === 'face-blush') {
      return (
        <G>
          <Ellipse cx={cx - eyeOffsetX * 1.2} cy={headCY + headR * 0.3} rx={headR * 0.25} ry={headR * 0.15} fill="#FF8A80" opacity={0.7} />
          <Ellipse cx={cx + eyeOffsetX * 1.2} cy={headCY + headR * 0.3} rx={headR * 0.25} ry={headR * 0.15} fill="#FF8A80" opacity={0.7} />
        </G>
      );
    }

    if (equipped.face === 'face-star') {
      return (
        <G>
          <Path d={`M${cx - eyeOffsetX},${headCY - lensR} L${cx - eyeOffsetX + lensR * 0.3},${headCY - lensR * 0.3} L${cx - eyeOffsetX + lensR},${headCY - lensR * 0.3} L${cx - eyeOffsetX + lensR * 0.4},${headCY + lensR * 0.2} L${cx - eyeOffsetX + lensR * 0.6},${headCY + lensR} L${cx - eyeOffsetX},${headCY + lensR * 0.5} L${cx - eyeOffsetX - lensR * 0.6},${headCY + lensR} L${cx - eyeOffsetX - lensR * 0.4},${headCY + lensR * 0.2} L${cx - eyeOffsetX - lensR},${headCY - lensR * 0.3} L${cx - eyeOffsetX - lensR * 0.3},${headCY - lensR * 0.3} Z`} fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
          <Path d={`M${cx + eyeOffsetX},${headCY - lensR} L${cx + eyeOffsetX + lensR * 0.3},${headCY - lensR * 0.3} L${cx + eyeOffsetX + lensR},${headCY - lensR * 0.3} L${cx + eyeOffsetX + lensR * 0.4},${headCY + lensR * 0.2} L${cx + eyeOffsetX + lensR * 0.6},${headCY + lensR} L${cx + eyeOffsetX},${headCY + lensR * 0.5} L${cx + eyeOffsetX - lensR * 0.6},${headCY + lensR} L${cx + eyeOffsetX - lensR * 0.4},${headCY + lensR * 0.2} L${cx + eyeOffsetX - lensR},${headCY - lensR * 0.3} L${cx + eyeOffsetX - lensR * 0.3},${headCY - lensR * 0.3} Z`} fill="#FFD700" stroke="#FFC107" strokeWidth={1} />
        </G>
      );
    }

    if (equipped.face === 'face-bandaid') {
      return (
        <G>
          <G transform={`translate(${cx}, ${headCY + headR * 0.3}) rotate(-15)`}>
            <Rect x={-headR * 0.4} y={-headR * 0.15} width={headR * 0.8} height={headR * 0.3} rx={headR * 0.1} fill="#FFCCBC" stroke="#D84315" strokeWidth={1} />
            <Rect x={-headR * 0.15} y={-headR * 0.15} width={headR * 0.3} height={headR * 0.3} fill="#FFAB91" />
            <Circle cx={-headR * 0.05} cy={-headR * 0.05} r={0.5} fill="#D84315" />
            <Circle cx={headR * 0.05} cy={headR * 0.05} r={0.5} fill="#D84315" />
          </G>
        </G>
      );
    }

    if (equipped.face === 'face-freckles') {
      return (
        <G>
          <Circle cx={cx - eyeOffsetX * 1.5} cy={headCY + headR * 0.2} r={1} fill="#8D6E63" />
          <Circle cx={cx - eyeOffsetX * 1.1} cy={headCY + headR * 0.3} r={1.2} fill="#8D6E63" />
          <Circle cx={cx - eyeOffsetX * 0.7} cy={headCY + headR * 0.25} r={0.8} fill="#8D6E63" />
          <Circle cx={cx + eyeOffsetX * 1.5} cy={headCY + headR * 0.2} r={1} fill="#8D6E63" />
          <Circle cx={cx + eyeOffsetX * 1.1} cy={headCY + headR * 0.3} r={1.2} fill="#8D6E63" />
          <Circle cx={cx + eyeOffsetX * 0.7} cy={headCY + headR * 0.25} r={0.8} fill="#8D6E63" />
          <Circle cx={cx} cy={headCY + headR * 0.15} r={0.8} fill="#8D6E63" />
        </G>
      );
    }

    if (equipped.face === 'face-cat') {
      return (
        <G>
          <Path d={`M${cx - headR * 0.2},${headCY + headR * 0.2} L${cx + headR * 0.2},${headCY + headR * 0.2} L${cx},${headCY + headR * 0.4} Z`} fill="#F48FB1" />
          <Path d={`M${cx},${headCY + headR * 0.4} Q${cx - headR * 0.2},${headCY + headR * 0.6} ${cx - headR * 0.4},${headCY + headR * 0.5}`} fill="none" stroke="#F48FB1" strokeWidth={1.5} />
          <Path d={`M${cx},${headCY + headR * 0.4} Q${cx + headR * 0.2},${headCY + headR * 0.6} ${cx + headR * 0.4},${headCY + headR * 0.5}`} fill="none" stroke="#F48FB1" strokeWidth={1.5} />
          <Line x1={cx - headR * 0.3} y1={headCY + headR * 0.3} x2={cx - headR * 0.8} y2={headCY + headR * 0.1} stroke="#000" strokeWidth={0.8} />
          <Line x1={cx - headR * 0.3} y1={headCY + headR * 0.4} x2={cx - headR * 0.8} y2={headCY + headR * 0.4} stroke="#000" strokeWidth={0.8} />
          <Line x1={cx - headR * 0.3} y1={headCY + headR * 0.5} x2={cx - headR * 0.8} y2={headCY + headR * 0.7} stroke="#000" strokeWidth={0.8} />
          <Line x1={cx + headR * 0.3} y1={headCY + headR * 0.3} x2={cx + headR * 0.8} y2={headCY + headR * 0.1} stroke="#000" strokeWidth={0.8} />
          <Line x1={cx + headR * 0.3} y1={headCY + headR * 0.4} x2={cx + headR * 0.8} y2={headCY + headR * 0.4} stroke="#000" strokeWidth={0.8} />
          <Line x1={cx + headR * 0.3} y1={headCY + headR * 0.5} x2={cx + headR * 0.8} y2={headCY + headR * 0.7} stroke="#000" strokeWidth={0.8} />
        </G>
      );
    }

    if (equipped.face === 'face-hero') {
      return (
        <G>
          <Path d={`M${cx - headR * 0.9},${headCY - headR * 0.3} Q${cx - headR * 0.9},${headCY + headR * 0.4} ${cx - headR * 0.4},${headCY + headR * 0.3} Q${cx},${headCY + headR * 0.1} ${cx + headR * 0.4},${headCY + headR * 0.3} Q${cx + headR * 0.9},${headCY + headR * 0.4} ${cx + headR * 0.9},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.9},${headCY - headR * 0.3} Z`} fill="#000000" />
          <Circle cx={cx - eyeOffsetX} cy={headCY} r={lensR * 0.8} fill="#FFF" />
          <Circle cx={cx + eyeOffsetX} cy={headCY} r={lensR * 0.8} fill="#FFF" />
        </G>
      );
    }

    return null;
  };

  const renderBehindClothes = () => {
    if (!hasBack) return null;

    // Back accessory: shirt-1 (Hero Cape) renders BEHIND the stickman
    if (equipped.back === 'shirt-1') {
      return (
        <Path
          d={`M${cx - 10},${armY - 15} L${cx - 25},${bodyBot + 15} Q${cx},${bodyBot + 25} ${cx + 25},${bodyBot + 15} L${cx + 10},${armY - 15} Z`}
          fill="rgba(231, 76, 60, 0.4)"
          stroke={Colors.error}
          strokeWidth={1.2}
        />
      );
    }

    if (equipped.back === 'back-2') {
      return (
        <G>
          {/* Dual Katanas - Longer blades and visible handles */}
          <Path d={`M${cx - 20},${armY - 25} L${cx + 20},${bodyBot + 15}`} stroke="#7F8C8D" strokeWidth={3} strokeLinecap="round" />
          <Path d={`M${cx + 20},${armY - 25} L${cx - 20},${bodyBot + 15}`} stroke="#7F8C8D" strokeWidth={3} strokeLinecap="round" />
          {/* Handles */}
          <Path d={`M${cx - 20},${armY - 25} L${cx - 15},${armY - 15}`} stroke="#2C3E50" strokeWidth={5} strokeLinecap="round" />
          <Path d={`M${cx + 20},${armY - 25} L${cx + 15},${armY - 15}`} stroke="#2C3E50" strokeWidth={5} strokeLinecap="round" />
          <Circle cx={cx - 20} cy={armY - 25} r={2} fill="#F1C40F" />
          <Circle cx={cx + 20} cy={armY - 25} r={2} fill="#F1C40F" />
        </G>
      );
    }

    if (equipped.back === 'back-3') {
      return (
        <G>
          {/* Backpack - Main Bag */}
          <Rect x={cx - 15} y={armY - 5} width={30} height={38} rx={4} fill="#8D6E63" stroke="#5D4037" strokeWidth={1} />
          <Rect x={cx - 15} y={armY + 5} width={30} height={4} fill="#5D4037" />
          <Rect x={cx - 15} y={armY + 20} width={30} height={4} fill="#5D4037" />
        </G>
      );
    }

    if (equipped.back === 'back-4') {
      return (
        <G>
          {/* Angel Wings */}
          <Path d={`M${cx},${armY} Q${cx - 40},${armY - 50} ${cx - 60},${armY - 10} Q${cx - 50},${armY + 20} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
          <Path d={`M${cx},${armY} Q${cx + 40},${armY - 50} ${cx + 60},${armY - 10} Q${cx + 50},${armY + 20} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
        </G>
      );
    }

    if (equipped.back === 'back-5') {
      return (
        <G>
          {/* Jetpack */}
          <Rect x={cx - 15} y={armY - 10} width={30} height={35} rx={2} fill="#7F8C8D" />
          <Rect x={cx - 12} y={armY + 25} width={8} height={12} fill="#E67E22" />
          <Rect x={cx + 4} y={armY + 25} width={8} height={12} fill="#E67E22" />
          <Path d={`M${cx - 12},${armY + 37} L${cx - 8},${armY + 45} L${cx - 4},${armY + 37} Z`} fill="#E74C3C" />
          <Path d={`M${cx + 4},${armY + 37} L${cx + 8},${armY + 45} L${cx + 12},${armY + 37} Z`} fill="#E74C3C" />
        </G>
      );
    }

    if (equipped.back === 'back-6') {
      return (
        <G>
          {/* Pink Butterfly Wings */}
          <Path d={`M${cx},${armY + 5} Q${cx - 30},${armY - 35} ${cx - 45},${armY + 5} Q${cx - 40},${armY + 30} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Path d={`M${cx},${armY + 5} Q${cx - 25},${armY + 50} ${cx - 40},${armY + 35} Q${cx - 35},${armY + 20} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Path d={`M${cx},${armY + 5} Q${cx + 30},${armY - 35} ${cx + 45},${armY + 5} Q${cx + 40},${armY + 30} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
          <Path d={`M${cx},${armY + 5} Q${cx + 25},${armY + 50} ${cx + 40},${armY + 35} Q${cx + 35},${armY + 20} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
        </G>
      );
    }
    // --- New Creative Boys Backs ---
    if (equipped.back === 'back-b1') {
      // Superhero Cape (Longer, swooping)
      return (
        <Path
          d={`M${cx - 12},${armY - 10} L${cx - 30},${bodyBot + 30} Q${cx},${bodyBot + 40} ${cx + 30},${bodyBot + 30} L${cx + 12},${armY - 10} Z`}
          fill="rgba(33, 150, 243, 0.8)"
          stroke="#1976D2"
          strokeWidth={1.5}
        />
      );
    }
    if (equipped.back === 'back-b2') {
      // Dragon Wings (spiky green)
      return (
        <G>
          <Path d={`M${cx},${armY} Q${cx - 50},${armY - 40} ${cx - 70},${armY - 10} L${cx - 50},${armY} L${cx - 60},${armY + 20} L${cx - 30},${armY + 10} Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.5} />
          <Path d={`M${cx},${armY} Q${cx + 50},${armY - 40} ${cx + 70},${armY - 10} L${cx + 50},${armY} L${cx + 60},${armY + 20} L${cx + 30},${armY + 10} Z`} fill="#4CAF50" stroke="#388E3C" strokeWidth={1.5} />
          {/* Wing bones */}
          <Path d={`M${cx},${armY} Q${cx - 20},${armY - 20} ${cx - 70},${armY - 10}`} fill="none" stroke="#2E7D32" strokeWidth={2} />
          <Path d={`M${cx},${armY} Q${cx + 20},${armY - 20} ${cx + 70},${armY - 10}`} fill="none" stroke="#2E7D32" strokeWidth={2} />
        </G>
      );
    }
    if (equipped.back === 'back-b3') {
      // Sci-Fi Shield
      return (
        <G>
          <Circle cx={cx} cy={armY + 15} r={22} fill="#263238" stroke="#00E5FF" strokeWidth={3} />
          <Circle cx={cx} cy={armY + 15} r={14} fill="none" stroke="#00E5FF" strokeWidth={1.5} />
          <Circle cx={cx} cy={armY + 15} r={6} fill="#00E5FF" />
          {/* Futuristic markings */}
          <Path d={`M${cx},${armY - 7} L${cx},${armY + 5} M${cx},${armY + 25} L${cx},${armY + 37}`} stroke="#00E5FF" strokeWidth={2} />
          <Path d={`M${cx - 22},${armY + 15} L${cx - 10},${armY + 15} M${cx + 10},${armY + 15} L${cx + 22},${armY + 15}`} stroke="#00E5FF" strokeWidth={2} />
        </G>
      );
    }
    if (equipped.back === 'back-b4') {
      // Quiver of Arrows
      return (
        <G>
          {/* Quiver Body (Slanted) */}
          <Path d={`M${cx - 15},${armY - 5} L${cx + 5},${bodyBot + 5} L${cx + 20},${bodyBot} L${cx},${armY - 10} Z`} fill="#795548" stroke="#5D4037" strokeWidth={1.5} />
          <Path d={`M${cx - 15},${armY - 5} L${cx},${armY - 10}`} stroke="#3E2723" strokeWidth={4} strokeLinecap="round" />
          <Path d={`M${cx + 5},${bodyBot + 5} L${cx + 20},${bodyBot}`} stroke="#3E2723" strokeWidth={4} strokeLinecap="round" />
          {/* Arrows sticking out */}
          <Line x1={cx - 10} y1={armY - 8} x2={cx - 25} y2={armY - 30} stroke="#D7CCC8" strokeWidth={2} />
          <Line x1={cx - 5} y1={armY - 10} x2={cx - 15} y2={armY - 35} stroke="#D7CCC8" strokeWidth={2} />
          <Line x1={cx} y1={armY - 8} x2={cx - 5} y2={armY - 32} stroke="#D7CCC8" strokeWidth={2} />
          {/* Arrow Fletchings (feathers) */}
          <Path d={`M${cx - 25},${armY - 30} L${cx - 30},${armY - 25} M${cx - 25},${armY - 30} L${cx - 20},${armY - 35}`} stroke="#FF5252" strokeWidth={2} />
          <Path d={`M${cx - 15},${armY - 35} L${cx - 20},${armY - 30} M${cx - 15},${armY - 35} L${cx - 10},${armY - 40}`} stroke="#FF5252" strokeWidth={2} />
          <Path d={`M${cx - 5},${armY - 32} L${cx - 10},${armY - 28} M${cx - 5},${armY - 32} L${cx},${armY - 36}`} stroke="#FF5252" strokeWidth={2} />
        </G>
      );
    }

    // --- New Creative Girls Backs ---
    if (equipped.back === 'back-g1') {
      // Delicate Fairy Wings
      return (
        <G>
          {/* Upper Wings */}
          <Path d={`M${cx},${armY + 5} Q${cx - 40},${armY - 50} ${cx - 55},${armY - 20} Q${cx - 40},${armY + 10} ${cx},${armY + 15} Z`} fill="rgba(224, 64, 251, 0.4)" stroke="#E040FB" strokeWidth={1.5} />
          <Path d={`M${cx},${armY + 5} Q${cx + 40},${armY - 50} ${cx + 55},${armY - 20} Q${cx + 40},${armY + 10} ${cx},${armY + 15} Z`} fill="rgba(224, 64, 251, 0.4)" stroke="#E040FB" strokeWidth={1.5} />
          {/* Lower Wings */}
          <Path d={`M${cx},${armY + 10} Q${cx - 30},${armY + 50} ${cx - 40},${armY + 30} Q${cx - 25},${armY + 15} ${cx},${armY + 15} Z`} fill="rgba(0, 229, 255, 0.4)" stroke="#00E5FF" strokeWidth={1.5} />
          <Path d={`M${cx},${armY + 10} Q${cx + 30},${armY + 50} ${cx + 40},${armY + 30} Q${cx + 25},${armY + 15} ${cx},${armY + 15} Z`} fill="rgba(0, 229, 255, 0.4)" stroke="#00E5FF" strokeWidth={1.5} />
          {/* Sparkles */}
          <Circle cx={cx - 30} cy={armY - 10} r={1.5} fill="#FFF" />
          <Circle cx={cx + 30} cy={armY - 10} r={1.5} fill="#FFF" />
          <Circle cx={cx - 20} cy={armY + 30} r={1.5} fill="#FFF" />
          <Circle cx={cx + 20} cy={armY + 30} r={1.5} fill="#FFF" />
        </G>
      );
    }
    if (equipped.back === 'back-g2') {
      // Giant Red Bow
      return (
        <G>
          {/* Left Loop */}
          <Path d={`M${cx},${armY + 10} Q${cx - 40},${armY - 20} ${cx - 50},${armY + 10} Q${cx - 40},${armY + 40} ${cx},${armY + 10} Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={2} />
          {/* Right Loop */}
          <Path d={`M${cx},${armY + 10} Q${cx + 40},${armY - 20} ${cx + 50},${armY + 10} Q${cx + 40},${armY + 40} ${cx},${armY + 10} Z`} fill="#E91E63" stroke="#C2185B" strokeWidth={2} />
          {/* Left Tail */}
          <Path d={`M${cx},${armY + 15} Q${cx - 10},${armY + 40} ${cx - 25},${bodyBot + 15} L${cx - 15},${bodyBot + 10} L${cx},${armY + 15} Z`} fill="#D81B60" stroke="#AD1457" strokeWidth={1.5} />
          {/* Right Tail */}
          <Path d={`M${cx},${armY + 15} Q${cx + 10},${armY + 40} ${cx + 25},${bodyBot + 15} L${cx + 15},${bodyBot + 10} L${cx},${armY + 15} Z`} fill="#D81B60" stroke="#AD1457" strokeWidth={1.5} />
          {/* Center Knot */}
          <Circle cx={cx} cy={armY + 10} r={8} fill="#F06292" stroke="#C2185B" strokeWidth={1.5} />
        </G>
      );
    }
    if (equipped.back === 'back-g3') {
      // Sparkly Star Cloak
      return (
        <G>
          <Path
            d={`M${cx - 15},${armY - 5} L${cx - 35},${bodyBot + 25} L${cx},${bodyBot + 30} L${cx + 35},${bodyBot + 25} L${cx + 15},${armY - 5} Z`}
            fill="#673AB7"
            stroke="#512DA8"
            strokeWidth={1.5}
          />
          {/* Stars */}
          <Path d={`M${cx - 15},${armY + 15} L${cx - 13},${armY + 20} L${cx - 8},${armY + 20} L${cx - 12},${armY + 23} L${cx - 10},${armY + 28} L${cx - 15},${armY + 25} L${cx - 20},${armY + 28} L${cx - 18},${armY + 23} L${cx - 22},${armY + 20} L${cx - 17},${armY + 20} Z`} fill="#FFEB3B" transform="scale(0.5) translate(300, 50)" />
          <Path d={`M${cx + 15},${armY + 25} L${cx + 17},${armY + 30} L${cx + 22},${armY + 30} L${cx + 18},${armY + 33} L${cx + 20},${armY + 38} L${cx + 15},${armY + 35} L${cx + 10},${armY + 38} L${cx + 12},${armY + 33} L${cx + 8},${armY + 30} L${cx + 13},${armY + 30} Z`} fill="#FFEB3B" transform="scale(0.6) translate(-50, -50)" />
          <Path d={`M${cx},${armY + 45} L${cx + 2},${armY + 50} L${cx + 7},${armY + 50} L${cx + 3},${armY + 53} L${cx + 5},${armY + 58} L${cx},${armY + 55} L${cx - 5},${armY + 58} L${cx - 3},${armY + 53} L${cx - 7},${armY + 50} L${cx - 2},${armY + 50} Z`} fill="#FFEB3B" transform="scale(0.4) translate(450, -100)" />
        </G>
      );
    }
    if (equipped.back === 'back-g4') {
      // Teddy Bear Backpack
      return (
        <G>
          {/* Bear Body/Bag */}
          <Rect x={cx - 16} y={armY + 2} width={32} height={28} rx={10} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          {/* Bear Ears */}
          <Circle cx={cx - 12} cy={armY - 4} r={6} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          <Circle cx={cx - 12} cy={armY - 4} r={3} fill="#D7CCC8" />
          <Circle cx={cx + 12} cy={armY - 4} r={6} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
          <Circle cx={cx + 12} cy={armY - 4} r={3} fill="#D7CCC8" />
          {/* Bear Face */}
          <Circle cx={cx - 6} cy={armY + 10} r={2} fill="#3E2723" />
          <Circle cx={cx + 6} cy={armY + 10} r={2} fill="#3E2723" />
          <Ellipse cx={cx} cy={armY + 16} rx={5} ry={4} fill="#D7CCC8" />
          <Circle cx={cx} cy={armY + 15} r={1.5} fill="#3E2723" /> {/* Nose */}
          <Path d={`M${cx - 2},${armY + 17} Q${cx},${armY + 19} ${cx + 2},${armY + 17}`} fill="none" stroke="#3E2723" strokeWidth={1} /> {/* Mouth */}
          {/* Straps (visible slightly behind shoulders) */}
          <Path d={`M${cx - 10},${armY} Q${cx - 5},${armY - 15} ${cx},${armY - 20}`} fill="none" stroke="#5D4037" strokeWidth={3} />
          <Path d={`M${cx + 10},${armY} Q${cx + 5},${armY - 15} ${cx},${armY - 20}`} fill="none" stroke="#5D4037" strokeWidth={3} />
        </G>
      );
    }
    return null;
  };

  const renderFrontBackAccessories = () => {
    if (!hasBack) return null;
    if (equipped.back === 'back-3') {
      const strapW = sw * 0.6;
      return (
        <G>
          {/* Backpack Straps in Front */}
          <Path d={`M${cx - 10},${armY - 10} L${cx - 10},${bodyBot - 5}`} stroke="rgba(0,0,0,0.4)" strokeWidth={strapW} strokeLinecap="round" />
          <Path d={`M${cx + 10},${armY - 10} L${cx + 10},${bodyBot - 5}`} stroke="rgba(0,0,0,0.4)" strokeWidth={strapW} strokeLinecap="round" />
        </G>
      );
    }
    return null;
  };

  const renderUpper = () => {
    if (!hasUpper) return null;

    if (equipped.upper === 'shirt-2') {
      // Boy Shirt
      const shirtWidth = 12;
      return (
        <G>
          {/* Short Sleeves */}
          <Path d={`M${cx - shirtWidth},${armY - 4} L${cx - 19},${armY + 5} L${cx - 15},${armY + 11} L${cx - 8},${armY + 7}`} fill="#4CAF50" stroke="#388E3C" />
          <Path d={`M${cx + shirtWidth},${armY - 4} L${cx + 19},${armY + 5} L${cx + 15},${armY + 11} L${cx + 8},${armY + 7}`} fill="#4CAF50" stroke="#388E3C" />
          {/* T-Shirt */}
          <Path
            d={`M${cx - shirtWidth},${armY - 5}
                L${cx - shirtWidth - 1},${bodyBot}
                Q${cx},${bodyBot + 5} ${cx + shirtWidth + 1},${bodyBot}
                L${cx + shirtWidth},${armY - 5} Z`}
            fill="#4CAF50"
            stroke="#388E3C"
            strokeWidth={1}
          />
        </G>
      );
    }

    if (equipped.upper === 'shirt-3') {
      // Girl Dress Top
      const topWidth = 12;
      const sleeveEndPathL = `M${cx - topWidth},${armY - 4} L${cx - armLen * 1.0},${laEndY - 2} L${cx - armLen * 0.95},${laEndY + 4} L${cx - topWidth + 2},${armY + 8}`;
      const sleeveEndPathR = `M${cx + topWidth},${armY - 4} L${cx + armLen * 1.0},${raEndY - 2} L${cx + armLen * 0.95},${raEndY + 4} L${cx + topWidth - 2},${armY + 8}`;

      return (
        <G>
          {/* Long Sleeves */}
          <Path d={sleeveEndPathL} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          <Path d={sleeveEndPathR} fill="#9C27B0" stroke="#7B1FA2" strokeWidth={1} />
          {/* Top */}
          <Path
            d={`M${cx - topWidth},${armY - 5}
                L${cx - topWidth},${bodyBot}
                Q${cx},${bodyBot + 3} ${cx + topWidth},${bodyBot}
                L${cx + topWidth},${armY - 5} Z`}
            fill="#9C27B0"
            stroke="#7B1FA2"
            strokeWidth={1}
          />
        </G>
      );
    }

    if (equipped.upper === 'shirt-4') {
      // Light Pink Tee
      const shirtWidth = 12;
      return (
        <G>
          {/* Short Sleeves */}
          <Path d={`M${cx - shirtWidth},${armY - 4} L${cx - 18},${armY + 4} L${cx - 14},${armY + 10} L${cx - 8},${armY + 7}`} fill="#F8BBD0" stroke="#F06292" />
          <Path d={`M${cx + shirtWidth},${armY - 4} L${cx + 18},${armY + 4} L${cx + 14},${armY + 10} L${cx + 8},${armY + 7}`} fill="#F8BBD0" stroke="#F06292" />
          {/* Tee Body */}
          <Path
            d={`M${cx - shirtWidth},${armY - 5}
                L${cx - shirtWidth - 1},${bodyBot}
                Q${cx},${bodyBot + 5} ${cx + shirtWidth + 1},${bodyBot}
                L${cx + shirtWidth},${armY - 5} Z`}
            fill="#F8BBD0"
            stroke="#F06292"
          />
        </G>
      );
    }
    // --- New Creative Boy Shirts ---
    if (equipped.upper === 'upper-b1') {
      // Space Explorer
      const shirtWidth = 12;
      return (
        <G>
          {/* Sleeves with blue stripes */}
          <Path d={`M${cx - shirtWidth},${armY - 4} L${cx - 20},${laEndY - 4} L${cx - 16},${laEndY + 2} L${cx - 8},${armY + 7}`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Line x1={cx - 18} y1={armY + 2} x2={cx - 10} y2={armY - 4} stroke="#2196F3" strokeWidth={2} />
          <Path d={`M${cx + shirtWidth},${armY - 4} L${cx + 20},${raEndY - 4} L${cx + 16},${raEndY + 2} L${cx + 8},${armY + 7}`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Line x1={cx + 18} y1={armY + 2} x2={cx + 10} y2={armY - 4} stroke="#2196F3" strokeWidth={2} />
          {/* Space Suit Body */}
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth - 1},${bodyBot} Q${cx},${bodyBot + 5} ${cx + shirtWidth + 1},${bodyBot} L${cx + shirtWidth},${armY - 5} Z`} fill="#ECEFF1" stroke="#CFD8DC" />
          <Circle cx={cx} cy={armY + 5} r={4} fill="#2196F3" />
          <Circle cx={cx - 1} cy={armY + 4} r={1} fill="#FFF" />
          <Line x1={cx - 8} y1={armY + 12} x2={cx + 8} y2={armY + 12} stroke="#B0BEC5" strokeWidth={1} strokeDasharray="2,2" />
        </G>
      );
    }

    if (equipped.upper === 'upper-b2') {
      // Dino Tank
      const shirtWidth = 12;
      return (
        <G>
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth - 1},${bodyBot} Q${cx},${bodyBot + 5} ${cx + shirtWidth + 1},${bodyBot} L${cx + shirtWidth},${armY - 5} Z`} fill="#8BC34A" stroke="#689F38" />
          {/* Scales down the front */}
          <Path d={`M${cx - 3},${armY - 2} L${cx},${armY - 5} L${cx + 3},${armY - 2} M${cx - 3},${armY + 4} L${cx},${armY + 1} L${cx + 3},${armY + 4} M${cx - 3},${armY + 10} L${cx},${armY + 7} L${cx + 3},${armY + 10}`} fill="none" stroke="#FFC107" strokeWidth={1.5} />
          {/* Jagged bottom */}
          <Path d={`M${cx - shirtWidth - 1},${bodyBot} L${cx - 6},${bodyBot + 6} L${cx - 2},${bodyBot + 2} L${cx + 3},${bodyBot + 7} L${cx + 8},${bodyBot + 1} L${cx + shirtWidth + 1},${bodyBot}`} fill="none" stroke="#689F38" strokeWidth={1.5} />
        </G>
      );
    }

    if (equipped.upper === 'upper-b3') {
      // Robot Armor
      const armorW = 14;
      return (
        <G>
          {/* Blocky Sleeves */}
          <Rect x={cx - armorW - 6} y={armY - 6} width={10} height={12} fill="#90A4AE" stroke="#607D8B" rx={2} />
          <Rect x={cx + armorW - 4} y={armY - 6} width={10} height={12} fill="#90A4AE" stroke="#607D8B" rx={2} />
          {/* Chest Plate */}
          <Rect x={cx - armorW} y={armY - 6} width={armorW * 2} height={bodyBot - armY + 8} fill="#B0BEC5" stroke="#78909C" rx={3} />
          {/* Glowing Core */}
          <Circle cx={cx} cy={armY + 6} r={5} fill="#00BCD4" stroke="#0097A7" />
          <Circle cx={cx} cy={armY + 6} r={2} fill="#E0F7FA" />
          <Line x1={cx - armorW + 4} y1={armY + 16} x2={cx + armorW - 4} y2={armY + 16} stroke="#78909C" strokeWidth={2} />
        </G>
      );
    }

    if (equipped.upper === 'upper-b4') {
      // Athlete Jersey
      const shirtWidth = 11;
      return (
        <G>
          {/* Sleeveless cuts */}
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth - 1},${bodyBot} Q${cx},${bodyBot + 4} ${cx + shirtWidth + 1},${bodyBot} L${cx + shirtWidth},${armY - 5} Q${cx},${armY} ${cx - shirtWidth},${armY - 5} Z`} fill="#F44336" stroke="#D32F2F" />
          {/* Jersey Stripes/Numbers */}
          <Line x1={cx - shirtWidth + 2} y1={armY - 4} x2={cx - shirtWidth - 1} y2={bodyBot} stroke="#FFF" strokeWidth={2} />
          <Line x1={cx + shirtWidth - 2} y1={armY - 4} x2={cx + shirtWidth + 1} y2={bodyBot} stroke="#FFF" strokeWidth={2} />
          <Path d={`M${cx - 1},${armY + 4} L${cx + 2},${armY + 2} L${cx + 2},${bodyBot - 3}`} stroke="#FFF" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      );
    }

    // --- New Creative Girl Shirts ---
    if (equipped.upper === 'upper-g1') {
      // Fairy Princess Bodice
      const shirtWidth = 11;
      return (
        <G>
          {/* Puffy sleeves */}
          <Circle cx={cx - shirtWidth - 2} cy={armY} r={6} fill="#F48FB1" stroke="#D81B60" />
          <Circle cx={cx + shirtWidth + 2} cy={armY} r={6} fill="#F48FB1" stroke="#D81B60" />
          {/* Bodice */}
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth + 2},${bodyBot + 4} L${cx},${bodyBot + 8} L${cx + shirtWidth - 2},${bodyBot + 4} L${cx + shirtWidth},${armY - 5} Q${cx},${armY - 2} ${cx - shirtWidth},${armY - 5} Z`} fill="#F06292" stroke="#D81B60" />
          {/* Gold Trim */}
          <Path d={`M${cx - shirtWidth + 2},${bodyBot + 4} L${cx},${bodyBot + 8} L${cx + shirtWidth - 2},${bodyBot + 4}`} fill="none" stroke="#FFD700" strokeWidth={1.5} />
          <Line x1={cx} y1={armY} x2={cx} y2={bodyBot + 8} stroke="#FFD700" strokeWidth={1} />
        </G>
      );
    }

    if (equipped.upper === 'upper-g2') {
      // Rainbow Unicorn Top
      const shirtWidth = 12;
      return (
        <G>
          {/* Short Sleeves */}
          <Path d={`M${cx - shirtWidth},${armY - 4} L${cx - 16},${laEndY - 2} L${cx - 12},${laEndY + 3} L${cx - 8},${armY + 7}`} fill="#B39DDB" stroke="#9575CD" />
          <Path d={`M${cx + shirtWidth},${armY - 4} L${cx + 16},${raEndY - 2} L${cx + 12},${raEndY + 3} L${cx + 8},${armY + 7}`} fill="#B39DDB" stroke="#9575CD" />
          {/* Striped Tee */}
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth - 1},${bodyBot} Q${cx},${bodyBot + 5} ${cx + shirtWidth + 1},${bodyBot} L${cx + shirtWidth},${armY - 5} Z`} fill="#E1BEE7" stroke="#CE93D8" />
          <Line x1={cx - shirtWidth - 0.5} y1={armY + 2} x2={cx + shirtWidth + 0.5} y2={armY + 2} stroke="#FFCDD2" strokeWidth={3} />
          <Line x1={cx - shirtWidth - 1} y1={armY + 8} x2={cx + shirtWidth + 1} y2={armY + 8} stroke="#FFF9C4" strokeWidth={3} />
          <Line x1={cx - shirtWidth - 1} y1={armY + 14} x2={cx + shirtWidth + 1} y2={armY + 14} stroke="#C8E6C9" strokeWidth={3} />
          {/* Star in middle */}
          <Path d={`M${cx},${armY} L${cx + 2},${armY + 4} L${cx + 6},${armY + 4} L${cx + 3},${armY + 7} L${cx + 4},${armY + 11} L${cx},${armY + 9} L${cx - 4},${armY + 11} L${cx - 3},${armY + 7} L${cx - 6},${armY + 4} L${cx - 2},${armY + 4} Z`} fill="#FFF" transform="scale(0.6) translate(100, 30)" />
        </G>
      );
    }

    if (equipped.upper === 'upper-g3') {
      // Mermaid Top
      const shirtWidth = 11;
      return (
        <G>
          {/* Bodice */}
          <Path d={`M${cx - shirtWidth},${armY - 3} L${cx - shirtWidth},${bodyBot + 2} Q${cx},${bodyBot + 6} ${cx + shirtWidth},${bodyBot + 2} L${cx + shirtWidth},${armY - 3} Q${cx},${armY - 8} ${cx - shirtWidth},${armY - 3} Z`} fill="#4DD0E1" stroke="#00BCD4" />
          {/* Shell decorations */}
          <Path d={`M${cx - 8},${armY + 2} Q${cx - 4},${armY - 2} ${cx},${armY + 2} Q${cx - 4},${armY + 6} ${cx - 8},${armY + 2} Z`} fill="#B2EBF2" stroke="#00BCD4" strokeWidth={0.5} />
          <Path d={`M${cx},${armY + 2} Q${cx + 4},${armY - 2} ${cx + 8},${armY + 2} Q${cx + 4},${armY + 6} ${cx},${armY + 2} Z`} fill="#B2EBF2" stroke="#00BCD4" strokeWidth={0.5} />
          {/* Sparkles */}
          <Circle cx={cx - 5} cy={armY + 10} r={1} fill="#FFF" />
          <Circle cx={cx + 6} cy={armY + 13} r={1.5} fill="#FFF" />
        </G>
      );
    }

    if (equipped.upper === 'upper-g4') {
      // Little Chef Coat
      const shirtWidth = 13;
      return (
        <G>
          {/* Short flared sleeves */}
          <Path d={`M${cx - shirtWidth},${armY - 4} L${cx - 22},${laEndY} L${cx - 16},${laEndY + 4} L${cx - 8},${armY + 7}`} fill="#FFF" stroke="#E0E0E0" />
          <Path d={`M${cx + shirtWidth},${armY - 4} L${cx + 22},${raEndY} L${cx + 16},${raEndY + 4} L${cx + 8},${armY + 7}`} fill="#FFF" stroke="#E0E0E0" />
          {/* Coat Body */}
          <Path d={`M${cx - shirtWidth},${armY - 5} L${cx - shirtWidth - 2},${bodyBot + 6} Q${cx},${bodyBot + 8} ${cx + shirtWidth + 2},${bodyBot + 6} L${cx + shirtWidth},${armY - 5} Z`} fill="#FFF" stroke="#E0E0E0" />
          {/* Fold / Buttons */}
          <Line x1={cx - 3} y1={armY - 5} x2={cx - 3} y2={bodyBot + 7} stroke="#E0E0E0" strokeWidth={1} />
          <Circle cx={cx + 2} cy={armY + 3} r={1.5} fill="#F06292" />
          <Circle cx={cx - 6} cy={armY + 3} r={1.5} fill="#F06292" />
          <Circle cx={cx + 2} cy={armY + 10} r={1.5} fill="#F06292" />
          <Circle cx={cx - 6} cy={armY + 10} r={1.5} fill="#F06292" />
        </G>
      );
    }

    return null;
  };

  const renderLower = () => {
    if (!hasLower) return null;

    if (equipped.lower === 'shirt-5') {
      const skirtWidthTop = 13;
      const skirtWidthBot = 25;
      return (
        <G>
          {/* Pink Ruffle Skirt */}
          <Path
            d={`M${cx - skirtWidthTop},${bodyBot}
                L${cx + skirtWidthTop},${bodyBot}
                L${cx + skirtWidthBot},${bodyBot + 18}
                Q${cx},${bodyBot + 24} ${cx - skirtWidthBot},${bodyBot + 18} Z`}
            fill="#F06292"
            stroke="#D81B60"
            strokeWidth={1}
          />
          <Path d={`M${cx - 18},${bodyBot + 12} Q${cx - 9},${bodyBot + 14} ${cx},${bodyBot + 12} Q${cx + 9},${bodyBot + 14} ${cx + 18},${bodyBot + 12}`} fill="none" stroke="#D81B60" strokeWidth={1} opacity={0.6} />
        </G>
      );
    }

    if (equipped.lower === 'lower-1') {
      // Boy Shorts
      const sWidth = 14;
      return (
        <G>
          <Path
            d={`M${cx - 12},${bodyBot}
                L${cx + 12},${bodyBot}
                L${cx + sWidth},${bodyBot + 15}
                L${cx + 2},${bodyBot + 15}
                L${cx},${bodyBot + 8}
                L${cx - 2},${bodyBot + 15}
                L${cx - sWidth},${bodyBot + 15} Z`}
            fill="#1976D2"
            stroke="#0D47A1"
            strokeWidth={1}
          />
        </G>
      );
    }

    if (equipped.lower === 'lower-2') {
      // Princess Skirt
      const dWidthTop = 12;
      const dWidthBot = bodyLen * 0.8;
      return (
        <G>
          <Path
            d={`M${cx - dWidthTop},${bodyBot}
                L${cx - dWidthBot},${bodyBot + legLen * 0.5}
                Q${cx},${bodyBot + legLen * 0.65} ${cx + dWidthBot},${bodyBot + legLen * 0.5}
                L${cx + dWidthTop},${bodyBot} Z`}
            fill="#9C27B0"
            stroke="#7B1FA2"
            strokeWidth={1}
          />
          <Rect x={cx - dWidthTop} y={bodyBot} width={dWidthTop * 2} height={4} fill="#F06292" rx={2} />
        </G>
      );
    }

    if (equipped.lower === 'lower-3') {
      // Purple Pleated Skirt
      const skirtWidthTop = 13;
      const skirtWidthBot = 22;
      return (
        <G>
          <Path
            d={`M${cx - skirtWidthTop},${bodyBot}
                L${cx + skirtWidthTop},${bodyBot}
                L${cx + skirtWidthBot},${bodyBot + 20}
                Q${cx},${bodyBot + 26} ${cx - skirtWidthBot},${bodyBot + 20} Z`}
            fill="#673AB7"
            stroke="#512DA8"
            strokeWidth={1}
          />
          {/* Pleats */}
          <Line x1={cx - 8} y1={bodyBot + 2} x2={cx - 12} y2={bodyBot + 22} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
          <Line x1={cx} y1={bodyBot + 2} x2={cx} y2={bodyBot + 24} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
          <Line x1={cx + 8} y1={bodyBot + 2} x2={cx + 12} y2={bodyBot + 22} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
        </G>
      );
    }

    if (equipped.lower === 'lower-4') {
      // Camo Shorts
      const sWidth = 14;
      return (
        <G>
          <Path
            d={`M${cx - 12},${bodyBot}
                L${cx + 12},${bodyBot}
                L${cx + sWidth},${bodyBot + 18}
                L${cx + 2},${bodyBot + 18}
                L${cx},${bodyBot + 8}
                L${cx - 2},${bodyBot + 18}
                L${cx - sWidth},${bodyBot + 18} Z`}
            fill="#556B2F"
            stroke="#3D4F1F"
            strokeWidth={1.5}
          />
          <Circle cx={cx - 6} cy={bodyBot + 6} r={3} fill="#8B4513" opacity={0.4} />
          <Circle cx={cx + 6} cy={bodyBot + 12} r={2.5} fill="#2F4F4F" opacity={0.4} />
        </G>
      );
    }

    // --- New Creative Boy Pants ---
    if (equipped.lower === 'lower-b1') {
      // Cargo Pants
      const pWidth = 14;
      return (
        <G>
          <Path
            d={`M${cx - 12},${bodyBot} L${cx + 12},${bodyBot} L${cx + pWidth - 2},${bodyBot + legLen} L${cx + 2},${bodyBot + legLen} L${cx},${bodyBot + 10} L${cx - 2},${bodyBot + legLen} L${cx - pWidth + 2},${bodyBot + legLen} Z`}
            fill="#795548" stroke="#5D4037" strokeWidth={1}
          />
          {/* Cargo Pockets */}
          <Rect x={cx - pWidth} y={bodyBot + legLen * 0.4} width={8} height={10} fill="#8D6E63" stroke="#5D4037" rx={1} />
          <Rect x={cx + pWidth - 8} y={bodyBot + legLen * 0.4} width={8} height={10} fill="#8D6E63" stroke="#5D4037" rx={1} />
        </G>
      );
    }

    if (equipped.lower === 'lower-b2') {
      // Hero Tights (with briefs outside)
      const pWidth = 12;
      return (
        <G>
          {/* Blue Tights */}
          <Path d={`M${cx - 12},${bodyBot} L${cx + 12},${bodyBot} L${cx + pWidth - 2},${bodyBot + legLen} L${cx + 2},${bodyBot + legLen} L${cx},${bodyBot + 10} L${cx - 2},${bodyBot + legLen} L${cx - pWidth + 2},${bodyBot + legLen} Z`} fill="#1E88E5" />
          {/* Red Briefs */}
          <Path d={`M${cx - 12},${bodyBot} L${cx + 12},${bodyBot} L${cx + 14},${bodyBot + 15} L${cx + 2},${bodyBot + 12} L${cx},${bodyBot + 10} L${cx - 2},${bodyBot + 12} L${cx - 14},${bodyBot + 15} Z`} fill="#E53935" stroke="#B71C1C" />
          {/* Yellow Belt */}
          <Rect x={cx - 12} y={bodyBot} width={24} height={4} fill="#FDD835" />
        </G>
      );
    }

    if (equipped.lower === 'lower-b3') {
      // Robot Legs
      const armorW = 12;
      return (
        <G>
          {/* Metal Thighs */}
          <Rect x={cx - armorW} y={bodyBot} width={10} height={legLen * 0.5} fill="#B0BEC5" stroke="#78909C" rx={2} />
          <Rect x={cx + armorW - 10} y={bodyBot} width={10} height={legLen * 0.5} fill="#B0BEC5" stroke="#78909C" rx={2} />
          {/* Knee Joints */}
          <Circle cx={cx - armorW + 5} cy={bodyBot + legLen * 0.5} r={3} fill="#00BCD4" />
          <Circle cx={cx + armorW - 5} cy={bodyBot + legLen * 0.5} r={3} fill="#00BCD4" />
          {/* Metal Calves */}
          <Rect x={cx - armorW + 1} y={bodyBot + legLen * 0.5 + 2} width={8} height={legLen * 0.5 - 2} fill="#90A4AE" stroke="#607D8B" rx={1} />
          <Rect x={cx + armorW - 9} y={bodyBot + legLen * 0.5 + 2} width={8} height={legLen * 0.5 - 2} fill="#90A4AE" stroke="#607D8B" rx={1} />
        </G>
      );
    }

    if (equipped.lower === 'lower-b4') {
      // Ninja Pants
      const pWidth = 14;
      return (
        <G>
          <Path
            d={`M${cx - 12},${bodyBot} L${cx + 12},${bodyBot} L${cx + pWidth},${bodyBot + legLen * 0.6} L${cx + pWidth - 4},${bodyBot + legLen} L${cx + 2},${bodyBot + legLen} L${cx},${bodyBot + 10} L${cx - 2},${bodyBot + legLen} L${cx - pWidth + 4},${bodyBot + legLen} L${cx - pWidth},${bodyBot + legLen * 0.6} Z`}
            fill="#212121" stroke="#000000"
          />
          {/* Red Wraps on calfs */}
          <Line x1={cx - pWidth + 4} y1={bodyBot + legLen * 0.7} x2={cx - 2} y2={bodyBot + legLen * 0.8} stroke="#E53935" strokeWidth={2} />
          <Line x1={cx - pWidth + 4} y1={bodyBot + legLen * 0.8} x2={cx - 2} y2={bodyBot + legLen * 0.9} stroke="#E53935" strokeWidth={2} />
          <Line x1={cx + pWidth - 4} y1={bodyBot + legLen * 0.7} x2={cx + 2} y2={bodyBot + legLen * 0.8} stroke="#E53935" strokeWidth={2} />
          <Line x1={cx + pWidth - 4} y1={bodyBot + legLen * 0.8} x2={cx + 2} y2={bodyBot + legLen * 0.9} stroke="#E53935" strokeWidth={2} />
          {/* Red Belt */}
          <Rect x={cx - 12} y={bodyBot} width={24} height={4} fill="#E53935" />
        </G>
      );
    }

    // --- New Creative Girl Pants/Skirts ---
    if (equipped.lower === 'lower-g1') {
      // Fairy Skirt (Petal design)
      const skirtW = 22;
      return (
        <G>
          <Path d={`M${cx - 12},${bodyBot} Q${cx - skirtW},${bodyBot + 10} ${cx - 16},${bodyBot + 25} Q${cx - 8},${bodyBot + 15} ${cx - 4},${bodyBot + 20} Q${cx},${bodyBot + 5} ${cx},${bodyBot}`} fill="#FCE4EC" stroke="#F48FB1" />
          <Path d={`M${cx},${bodyBot} Q${cx},${bodyBot + 5} ${cx + 4},${bodyBot + 20} Q${cx + 8},${bodyBot + 15} ${cx + 16},${bodyBot + 25} Q${cx + skirtW},${bodyBot + 10} ${cx + 12},${bodyBot}`} fill="#FCE4EC" stroke="#F48FB1" />
          <Path d={`M${cx - 8},${bodyBot} Q${cx - 12},${bodyBot + 15} ${cx - 4},${bodyBot + 28} Q${cx},${bodyBot + 15} ${cx + 4},${bodyBot + 28} Q${cx + 12},${bodyBot + 15} ${cx + 8},${bodyBot}`} fill="#F8BBD0" stroke="#F06292" opacity={0.8} />
          <Rect x={cx - 11} y={bodyBot} width={22} height={3} fill="#81C784" /> {/* Leaf belt */}
        </G>
      );
    }

    if (equipped.lower === 'lower-g2') {
      // Rainbow Leggings
      const pWidth = 11;
      return (
        <G>
          {/* Base shape */}
          <Path d={`M${cx - 12},${bodyBot} L${cx + 12},${bodyBot} L${cx + pWidth - 2},${bodyBot + legLen} L${cx + 2},${bodyBot + legLen} L${cx},${bodyBot + 10} L${cx - 2},${bodyBot + legLen} L${cx - pWidth + 2},${bodyBot + legLen} Z`} fill="#E1BEE7" />
          {/* Rainbow Stripes across both legs */}
          <Line x1={cx - pWidth} y1={bodyBot + 5} x2={cx + pWidth} y2={bodyBot + 5} stroke="#FFCDD2" strokeWidth={3} />
          <Line x1={cx - pWidth + 0.5} y1={bodyBot + 11} x2={cx + pWidth - 0.5} y2={bodyBot + 11} stroke="#FFE082" strokeWidth={3} />
          <Line x1={cx - pWidth + 1} y1={bodyBot + 17} x2={cx + pWidth - 1} y2={bodyBot + 17} stroke="#C8E6C9" strokeWidth={3} />
          <Line x1={cx - pWidth + 1.5} y1={bodyBot + 23} x2={cx + pWidth - 1.5} y2={bodyBot + 23} stroke="#BBDEFB" strokeWidth={3} />
          <Line x1={cx - pWidth + 2} y1={bodyBot + 29} x2={cx + pWidth - 2} y2={bodyBot + 29} stroke="#E1BEE7" strokeWidth={3} />
        </G>
      );
    }

    if (equipped.lower === 'lower-g3') {
      // Mermaid Tail Cover (overlaps legs)
      const tailWTop = 12;
      const tailWMid = 16;
      return (
        <G>
          <Path d={`M${cx - tailWTop},${bodyBot} Q${cx - tailWMid},${bodyBot + legLen * 0.5} ${cx - 4},${bodyBot + legLen} L${cx + 4},${bodyBot + legLen} Q${cx + tailWMid},${bodyBot + legLen * 0.5} ${cx + tailWTop},${bodyBot} Z`} fill="#4DD0E1" stroke="#00BCD4" />
          {/* Scale pattern */}
          <Path d={`M${cx - 8},${bodyBot + 6} Q${cx - 4},${bodyBot + 10} ${cx},${bodyBot + 6} Q${cx + 4},${bodyBot + 10} ${cx + 8},${bodyBot + 6}`} fill="none" stroke="#26C6DA" strokeWidth={1} />
          <Path d={`M${cx - 6},${bodyBot + 12} Q${cx - 2},${bodyBot + 16} ${cx + 2},${bodyBot + 12} Q${cx + 6},${bodyBot + 16} ${cx + 10},${bodyBot + 12}`} fill="none" stroke="#26C6DA" strokeWidth={1} />
          <Path d={`M${cx - 8},${bodyBot + 18} Q${cx - 4},${bodyBot + 22} ${cx},${bodyBot + 18} Q${cx + 4},${bodyBot + 22} ${cx + 8},${bodyBot + 18}`} fill="none" stroke="#26C6DA" strokeWidth={1} />
        </G>
      );
    }

    if (equipped.lower === 'lower-g4') {
      // Chef Pants (Checkered/Baggy)
      const pWidth = 15;
      return (
        <G>
          {/* Wide baggy pants */}
          <Path
            d={`M${cx - 12},${bodyBot} Q${cx - pWidth - 4},${bodyBot + legLen * 0.5} ${cx - pWidth + 2},${bodyBot + legLen} L${cx - 2},${bodyBot + legLen} L${cx},${bodyBot + 8} L${cx + 2},${bodyBot + legLen} L${cx + pWidth - 2},${bodyBot + legLen} Q${cx + pWidth + 4},${bodyBot + legLen * 0.5} ${cx + 12},${bodyBot} Z`}
            fill="#FFF" stroke="#BDBDBD" strokeWidth={1}
          />
          {/* Checkered lines */}
          <Line x1={cx - 12} y1={bodyBot} x2={cx - pWidth + 2} y2={bodyBot + legLen} stroke="#E0E0E0" strokeWidth={1} />
          <Line x1={cx - 6} y1={bodyBot} x2={cx - 4} y2={bodyBot + legLen} stroke="#E0E0E0" strokeWidth={1} />
          <Line x1={cx + 6} y1={bodyBot} x2={cx + 4} y2={bodyBot + legLen} stroke="#E0E0E0" strokeWidth={1} />
          <Line x1={cx + 12} y1={bodyBot} x2={cx + pWidth - 2} y2={bodyBot + legLen} stroke="#E0E0E0" strokeWidth={1} />

          <Line x1={cx - pWidth} y1={bodyBot + 8} x2={cx + pWidth} y2={bodyBot + 8} stroke="#E0E0E0" strokeWidth={1} />
          <Line x1={cx - pWidth} y1={bodyBot + 16} x2={cx + pWidth} y2={bodyBot + 16} stroke="#E0E0E0" strokeWidth={1} />
          <Line x1={cx - pWidth} y1={bodyBot + 24} x2={cx + pWidth} y2={bodyBot + 24} stroke="#E0E0E0" strokeWidth={1} />
        </G>
      );
    }

    return null;
  };

  const renderLeftBoot = (bootType: string, x: number, y: number, bootW: number, bootH: number) => {
    if (bootType === 'shoes-1') {
      return (
        <Path
          d={`M${x - bootW * 0.6},${y - bootH * 0.3}
              L${x - bootW * 0.6},${y + bootH}
              L${x + bootW * 0.8},${y + bootH}
              L${x + bootW * 0.8},${y + bootH * 0.5}
              L${x + bootW * 0.3},${y - bootH * 0.3} Z`}
          fill="#37474F" stroke="#263238" strokeWidth={1}
        />
      );
    }
    if (bootType === 'shoes-2') {
      return (
        <G>
          <Path d={`M${x - bootW * 0.6},${y - bootH * 0.1} L${x - bootW * 0.6},${y + bootH} L${x + bootW * 0.9},${y + bootH} L${x + bootW * 0.9},${y + bootH * 0.4} L${x + bootW * 0.3},${y - bootH * 0.1} Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={x + bootW * 0.3} cy={y + bootH * 0.6} r={bootW * 0.2} fill="#fff" />
        </G>
      );
    }
    if (bootType === 'shoes-3') {
      return (
        <G>
          <Path d={`M${x - bootW * 0.5},${y + bootH * 0.4} Q${x + bootW * 0.2},${y + bootH * 0.1} ${x + bootW * 0.8},${y + bootH} L${x - bootW * 0.5},${y + bootH} Z`} fill="#E91E63" />
          <Line x1={x - bootW * 0.5} y1={y + bootH * 0.6} x2={x + bootW * 0.3} y2={y + bootH * 0.6} stroke="#fff" strokeWidth={1.5} />
        </G>
      );
    }
    // --- New Boys Shoes ---
    if (bootType === 'shoes-b1') {
      // Rocket Boots
      return (
        <G>
          <Path d={`M${x - bootW * 0.7},${y - bootH * 0.2} L${x - bootW * 0.7},${y + bootH} L${x + bootW * 0.9},${y + bootH} L${x + bootW * 0.9},${y + bootH * 0.5} L${x + bootW * 0.5},${y - bootH * 0.2} Z`} fill="#B0BEC5" stroke="#78909C" strokeWidth={1} />
          <Rect x={x - bootW * 0.4} y={y + bootH} width={bootW * 0.8} height={bootH * 0.4} fill="#455A64" />
          <Path d={`M${x - bootW * 0.2},${y + bootH * 1.4} L${x},${y + bootH * 2.0} L${x + bootW * 0.2},${y + bootH * 1.4} Z`} fill="#FF5722" />
        </G>
      );
    }
    if (bootType === 'shoes-b2') {
      // Spiked Cleats
      return (
        <G>
          <Path d={`M${x - bootW * 0.6},${y - bootH * 0.1} L${x - bootW * 0.6},${y + bootH} L${x + bootW * 0.9},${y + bootH} L${x + bootW * 0.9},${y + bootH * 0.4} L${x + bootW * 0.3},${y - bootH * 0.1} Z`} fill="#F44336" stroke="#D32F2F" strokeWidth={1} />
          <Path d={`M${x - bootW * 0.4},${y + bootH} L${x - bootW * 0.3},${y + bootH * 1.4} L${x - bootW * 0.2},${y + bootH} M${x + bootW * 0.2},${y + bootH} L${x + bootW * 0.3},${y + bootH * 1.4} L${x + bootW * 0.4},${y + bootH} M${x + bootW * 0.7},${y + bootH} L${x + bootW * 0.8},${y + bootH * 1.4} L${x + bootW * 0.9},${y + bootH}`} fill="none" stroke="#FFF" strokeWidth={1} />
        </G>
      );
    }
    if (bootType === 'shoes-b3') {
      // Robot Treads
      return (
        <G>
          <Rect x={x - bootW * 0.8} y={y + bootH * 0.2} width={bootW * 1.8} height={bootH * 0.8} rx={2} fill="#546E7A" stroke="#37474F" strokeWidth={1} />
          <Line x1={x - bootW * 0.5} y1={y + bootH * 0.2} x2={x - bootW * 0.5} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Line x1={x} y1={y + bootH * 0.2} x2={x} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Line x1={x + bootW * 0.5} y1={y + bootH * 0.2} x2={x + bootW * 0.5} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Circle cx={x} cy={y + bootH * 0.6} r={2} fill="#00E5FF" />
        </G>
      );
    }
    if (bootType === 'shoes-b4') {
      // Ninja Tabi
      return (
        <G>
          <Path d={`M${x - bootW * 0.6},${y - bootH * 0.4} L${x - bootW * 0.6},${y + bootH} L${x + bootW * 0.9},${y + bootH} L${x + bootW * 0.9},${y + bootH * 0.4} L${x + bootW * 0.3},${y - bootH * 0.4} Z`} fill="#212121" stroke="#000000" strokeWidth={1} />
          <Line x1={x + bootW * 0.6} y1={y + bootH * 0.4} x2={x + bootW * 0.6} y2={y + bootH} stroke="#000" strokeWidth={1} /> {/* Toe split */}
          <Line x1={x - bootW * 0.6} y1={y - bootH * 0.1} x2={x + bootW * 0.4} y2={y - bootH * 0.1} stroke="#E53935" strokeWidth={1.5} /> {/* Wrap */}
        </G>
      );
    }

    // --- New Girls Shoes ---
    if (bootType === 'shoes-g1') {
      // Roller Skates
      return (
        <G>
          <Path d={`M${x - bootW * 0.5},${y - bootH * 0.3} L${x - bootW * 0.5},${y + bootH * 0.8} L${x + bootW * 0.9},${y + bootH * 0.8} L${x + bootW * 0.9},${y + bootH * 0.2} L${x + bootW * 0.3},${y - bootH * 0.3} Z`} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={x - bootW * 0.2} cy={y + bootH * 1.1} r={bootW * 0.25} fill="#4DD0E1" />
          <Circle cx={x + bootW * 0.6} cy={y + bootH * 1.1} r={bootW * 0.25} fill="#4DD0E1" />
        </G>
      );
    }
    if (bootType === 'shoes-g2') {
      // Mermaid Flippers
      return (
        <G>
          <Path d={`M${x - bootW * 0.3},${y} Q${x - bootW * 1.2},${y + bootH * 0.5} ${x - bootW * 1.5},${y + bootH} Q${x},${y + bootH * 0.8} ${x + bootW * 1.5},${y + bootH} Q${x + bootW * 1.2},${y + bootH * 0.5} ${x + bootW * 0.3},${y} Z`} fill="#26C6DA" stroke="#00ACC1" strokeWidth={1} />
          <Line x1={x} y1={y + bootH * 0.3} x2={x - bootW * 0.8} y2={y + bootH * 0.8} stroke="#00ACC1" strokeWidth={0.5} />
          <Line x1={x} y1={y + bootH * 0.3} x2={x + bootW * 0.8} y2={y + bootH * 0.8} stroke="#00ACC1" strokeWidth={0.5} />
        </G>
      );
    }
    if (bootType === 'shoes-g3') {
      // Bunny Slippers
      return (
        <G>
          <Ellipse cx={x + bootW * 0.2} cy={y + bootH * 0.5} rx={bootW * 0.9} ry={bootH * 0.5} fill="#FFF" stroke="#E0E0E0" />
          <Ellipse cx={x + bootW * 0.8} cy={y} rx={bootW * 0.2} ry={bootH * 0.4} fill="#FFF" stroke="#E0E0E0" transform={`rotate(15 ${x + bootW * 0.8} ${y})`} />
          <Ellipse cx={x + bootW * 0.4} cy={y - bootH * 0.1} rx={bootW * 0.2} ry={bootH * 0.4} fill="#FFF" stroke="#E0E0E0" transform={`rotate(-15 ${x + bootW * 0.4} ${y - bootH * 0.1})`} />
          <Circle cx={x + bootW * 0.8} cy={y + bootH * 0.5} r={1.5} fill="#000" />
          <Circle cx={x + bootW * 0.9} cy={y + bootH * 0.7} r={1} fill="#F48FB1" />
        </G>
      );
    }
    if (bootType === 'shoes-g4') {
      // Ballet Slippers
      return (
        <G>
          <Path d={`M${x - bootW * 0.5},${y + bootH * 0.6} Q${x + bootW * 0.2},${y + bootH * 0.3} ${x + bootW * 0.9},${y + bootH * 0.7} Q${x + bootW * 0.9},${y + bootH} ${x - bootW * 0.5},${y + bootH} Z`} fill="#F8BBD0" stroke="#F06292" />
          <Line x1={x - bootW * 0.4} y1={y} x2={x + bootW * 0.2} y2={y + bootH * 0.5} stroke="#F06292" strokeWidth={1} />
          <Line x1={x + bootW * 0.2} y1={y} x2={x - bootW * 0.4} y2={y + bootH * 0.5} stroke="#F06292" strokeWidth={1} />
        </G>
      );
    }
    return null;
  };

  const renderRightBoot = (bootType: string, x: number, y: number, bootW: number, bootH: number) => {
    if (bootType === 'shoes-1') {
      return (
        <Path
          d={`M${x + bootW * 0.6},${y - bootH * 0.3}
              L${x + bootW * 0.6},${y + bootH}
              L${x - bootW * 0.8},${y + bootH}
              L${x - bootW * 0.8},${y + bootH * 0.5}
              L${x - bootW * 0.3},${y - bootH * 0.3} Z`}
          fill="#37474F" stroke="#263238" strokeWidth={1}
        />
      );
    }
    if (bootType === 'shoes-2') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.6},${y - bootH * 0.1} L${x + bootW * 0.6},${y + bootH} L${x - bootW * 0.9},${y + bootH} L${x - bootW * 0.9},${y + bootH * 0.4} L${x - bootW * 0.3},${y - bootH * 0.1} Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={x - bootW * 0.3} cy={y + bootH * 0.6} r={bootW * 0.2} fill="#fff" />
        </G>
      );
    }
    if (bootType === 'shoes-3') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.5},${y + bootH * 0.4} Q${x - bootW * 0.2},${y + bootH * 0.1} ${x - bootW * 0.8},${y + bootH} L${x + bootW * 0.5},${y + bootH} Z`} fill="#E91E63" />
          <Line x1={x + bootW * 0.5} y1={y + bootH * 0.6} x2={x - bootW * 0.3} y2={y + bootH * 0.6} stroke="#fff" strokeWidth={1.5} />
        </G>
      );
    }
    // --- New Boys Shoes (Mirrored for right foot) ---
    if (bootType === 'shoes-b1') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.7},${y - bootH * 0.2} L${x + bootW * 0.7},${y + bootH} L${x - bootW * 0.9},${y + bootH} L${x - bootW * 0.9},${y + bootH * 0.5} L${x - bootW * 0.5},${y - bootH * 0.2} Z`} fill="#B0BEC5" stroke="#78909C" strokeWidth={1} />
          <Rect x={x - bootW * 0.4} y={y + bootH} width={bootW * 0.8} height={bootH * 0.4} fill="#455A64" />
          <Path d={`M${x - bootW * 0.2},${y + bootH * 1.4} L${x},${y + bootH * 2.0} L${x + bootW * 0.2},${y + bootH * 1.4} Z`} fill="#FF5722" />
        </G>
      );
    }
    if (bootType === 'shoes-b2') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.6},${y - bootH * 0.1} L${x + bootW * 0.6},${y + bootH} L${x - bootW * 0.9},${y + bootH} L${x - bootW * 0.9},${y + bootH * 0.4} L${x - bootW * 0.3},${y - bootH * 0.1} Z`} fill="#F44336" stroke="#D32F2F" strokeWidth={1} />
          <Path d={`M${x + bootW * 0.4},${y + bootH} L${x + bootW * 0.3},${y + bootH * 1.4} L${x + bootW * 0.2},${y + bootH} M${x - bootW * 0.2},${y + bootH} L${x - bootW * 0.3},${y + bootH * 1.4} L${x - bootW * 0.4},${y + bootH} M${x - bootW * 0.7},${y + bootH} L${x - bootW * 0.8},${y + bootH * 1.4} L${x - bootW * 0.9},${y + bootH}`} fill="none" stroke="#FFF" strokeWidth={1} />
        </G>
      );
    }
    if (bootType === 'shoes-b3') {
      return (
        <G>
          <Rect x={x - bootW * 1.0} y={y + bootH * 0.2} width={bootW * 1.8} height={bootH * 0.8} rx={2} fill="#546E7A" stroke="#37474F" strokeWidth={1} />
          <Line x1={x + bootW * 0.5} y1={y + bootH * 0.2} x2={x + bootW * 0.5} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Line x1={x} y1={y + bootH * 0.2} x2={x} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Line x1={x - bootW * 0.5} y1={y + bootH * 0.2} x2={x - bootW * 0.5} y2={y + bootH} stroke="#37474F" strokeWidth={1} />
          <Circle cx={x} cy={y + bootH * 0.6} r={2} fill="#00E5FF" />
        </G>
      );
    }
    if (bootType === 'shoes-b4') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.6},${y - bootH * 0.4} L${x + bootW * 0.6},${y + bootH} L${x - bootW * 0.9},${y + bootH} L${x - bootW * 0.9},${y + bootH * 0.4} L${x - bootW * 0.3},${y - bootH * 0.4} Z`} fill="#212121" stroke="#000000" strokeWidth={1} />
          <Line x1={x - bootW * 0.6} y1={y + bootH * 0.4} x2={x - bootW * 0.6} y2={y + bootH} stroke="#000" strokeWidth={1} />
          <Line x1={x + bootW * 0.6} y1={y - bootH * 0.1} x2={x - bootW * 0.4} y2={y - bootH * 0.1} stroke="#E53935" strokeWidth={1.5} />
        </G>
      );
    }

    // --- New Girls Shoes (Mirrored) ---
    if (bootType === 'shoes-g1') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.5},${y - bootH * 0.3} L${x + bootW * 0.5},${y + bootH * 0.8} L${x - bootW * 0.9},${y + bootH * 0.8} L${x - bootW * 0.9},${y + bootH * 0.2} L${x - bootW * 0.3},${y - bootH * 0.3} Z`} fill="#F06292" stroke="#D81B60" strokeWidth={1} />
          <Circle cx={x + bootW * 0.2} cy={y + bootH * 1.1} r={bootW * 0.25} fill="#4DD0E1" />
          <Circle cx={x - bootW * 0.6} cy={y + bootH * 1.1} r={bootW * 0.25} fill="#4DD0E1" />
        </G>
      );
    }
    if (bootType === 'shoes-g2') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.3},${y} Q${x + bootW * 1.2},${y + bootH * 0.5} ${x + bootW * 1.5},${y + bootH} Q${x},${y + bootH * 0.8} ${x - bootW * 1.5},${y + bootH} Q${x - bootW * 1.2},${y + bootH * 0.5} ${x - bootW * 0.3},${y} Z`} fill="#26C6DA" stroke="#00ACC1" strokeWidth={1} />
          <Line x1={x} y1={y + bootH * 0.3} x2={x + bootW * 0.8} y2={y + bootH * 0.8} stroke="#00ACC1" strokeWidth={0.5} />
          <Line x1={x} y1={y + bootH * 0.3} x2={x - bootW * 0.8} y2={y + bootH * 0.8} stroke="#00ACC1" strokeWidth={0.5} />
        </G>
      );
    }
    if (bootType === 'shoes-g3') {
      return (
        <G>
          <Ellipse cx={x - bootW * 0.2} cy={y + bootH * 0.5} rx={bootW * 0.9} ry={bootH * 0.5} fill="#FFF" stroke="#E0E0E0" />
          <Ellipse cx={x - bootW * 0.8} cy={y} rx={bootW * 0.2} ry={bootH * 0.4} fill="#FFF" stroke="#E0E0E0" transform={`rotate(-15 ${x - bootW * 0.8} ${y})`} />
          <Ellipse cx={x - bootW * 0.4} cy={y - bootH * 0.1} rx={bootW * 0.2} ry={bootH * 0.4} fill="#FFF" stroke="#E0E0E0" transform={`rotate(15 ${x - bootW * 0.4} ${y - bootH * 0.1})`} />
          <Circle cx={x - bootW * 0.8} cy={y + bootH * 0.5} r={1.5} fill="#000" />
          <Circle cx={x - bootW * 0.9} cy={y + bootH * 0.7} r={1} fill="#F48FB1" />
        </G>
      );
    }
    if (bootType === 'shoes-g4') {
      return (
        <G>
          <Path d={`M${x + bootW * 0.5},${y + bootH * 0.6} Q${x - bootW * 0.2},${y + bootH * 0.3} ${x - bootW * 0.9},${y + bootH * 0.7} Q${x - bootW * 0.9},${y + bootH} ${x + bootW * 0.5},${y + bootH} Z`} fill="#F8BBD0" stroke="#F06292" />
          <Line x1={x + bootW * 0.4} y1={y} x2={x - bootW * 0.2} y2={y + bootH * 0.5} stroke="#F06292" strokeWidth={1} />
          <Line x1={x - bootW * 0.2} y1={y} x2={x + bootW * 0.4} y2={y + bootH * 0.5} stroke="#F06292" strokeWidth={1} />
        </G>
      );
    }
    return null;
  };

  // Bubble constants
  const bubbleR = bk * 0.12;
  const bubbleColors = [
    { fill: '#F48FB1', shine: '#FCE4EC' },
    { fill: '#64B5F6', shine: '#E3F2FD' },
    { fill: '#81C784', shine: '#E8F5E9' },
    { fill: '#CE93D8', shine: '#F3E5F5' },
  ];
  const bubblePositions = [
    { x: cx - bk * 0.45, y: h * 0.32 }, // Refined and stable Y
    { x: cx + bk * 0.48, y: h * 0.32 },
    { x: cx - bk * 0.52, y: h * 0.62 },
    { x: cx + bk * 0.54, y: h * 0.68 },
  ];
  const capturedLimbs = [!showLL, !showRL, !showLA, !showRA];

  return (
    <View style={[styles.container, { width: w, height: h, borderRadius: 16, overflow: 'hidden' }]}>
      {/* -- Layer 1: Deep Sky & Sun -- */}
      <Svg style={{ position: 'absolute' }} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={skyTop} />
            <Stop offset="1" stopColor={skyBot} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={h} rx={16} fill="url(#skyGrad)" />
        <G transform={`translate(${w * 0.82}, ${h * 0.22})`}>
          <Circle cx={0} cy={0} r={h * 0.12} fill="#FFF59D" opacity={0.5} />
          <Circle cx={0} cy={0} r={h * 0.08} fill="#FFEE58" />
        </G>
      </Svg>

      {/* ── Layer 1.5: Animated Clouds ── */}
      <Animated.View style={[{ position: 'absolute', width: w, height: h }, cloudAnimStyle]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <G opacity={0.6}>
            <Ellipse cx={w * 0.18} cy={h * 0.08} rx={w * 0.1} ry={h * 0.025} fill="#fff" />
            <Ellipse cx={w * 0.14} cy={h * 0.07} rx={w * 0.06} ry={h * 0.02} fill="#fff" />
            <Ellipse cx={w * 0.22} cy={h * 0.065} rx={w * 0.07} ry={h * 0.022} fill="#fff" />
            <Ellipse cx={w * 0.78} cy={h * 0.06} rx={w * 0.09} ry={h * 0.022} fill="#fff" />
            <Ellipse cx={w * 0.74} cy={h * 0.05} rx={w * 0.055} ry={h * 0.018} fill="#fff" />
            <Ellipse cx={w * 0.83} cy={h * 0.048} rx={w * 0.06} ry={h * 0.02} fill="#fff" />
            <Ellipse cx={w * 0.88} cy={h * 0.15} rx={w * 0.07} ry={h * 0.018} fill="#fff" />
            <Ellipse cx={w * 0.85} cy={h * 0.14} rx={w * 0.045} ry={h * 0.015} fill="#fff" />
          </G>
        </Svg>
      </Animated.View>

      {/* ── Layer 2: Animated Plane ── */}
      <Animated.View style={[{ position: 'absolute', width: w, height: h }, planeAnimStyle]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <G transform={`translate(${w * 0.15}, ${h * 0.2})`}>
            <Path d={`M0,0 L${bk*0.1},${bk*0.03} L0,${bk*0.06} L${bk*0.03},${bk*0.03} Z`} fill="#FFFFFF" />
            <Path d={`M${bk*0.03},${bk*0.03} L${bk*0.06},${bk*0.04} L${bk*0.04},${bk*0.08} Z`} fill="#E0E0E0" />
          </G>
        </Svg>
      </Animated.View>

      {/* ── Layer 3: Animated Hot Air Balloon ── */}
      <Animated.View style={[{ position: 'absolute', width: w, height: h }, balloonAnimStyle]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <G transform={`translate(${w * 0.05}, ${h * 0.3})`}>
            <Circle cx={0} cy={-bk * 0.2} r={bk * 0.12} fill="#FF7043" />
            <Circle cx={0} cy={-bk * 0.2} r={bk * 0.08} fill="#FFEE58" />
            <Line x1={-bk * 0.06} y1={-bk * 0.1} x2={-bk * 0.03} y2={0} stroke="#757575" strokeWidth={1} />
            <Line x1={bk * 0.06} y1={-bk * 0.1} x2={bk * 0.03} y2={0} stroke="#757575" strokeWidth={1} />
            <Rect x={-bk * 0.04} y={0} width={bk * 0.08} height={bk * 0.05} fill="#8D6E63" rx={2} />
          </G>
        </Svg>
      </Animated.View>

      {/* ── Layer 4: Animated Birds ── */}
      <Animated.View style={[{ position: 'absolute', width: w, height: h }, birdAnimStyle]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <Path d={`M${w * 0.05},${h * 0.15} Q${w * 0.07},${h * 0.12} ${w * 0.09},${h * 0.15} Q${w * 0.11},${h * 0.12} ${w * 0.13},${h * 0.15}`} fill="none" stroke="#90A4AE" strokeWidth={1.5} />
          <Path d={`M${w * 0.16},${h * 0.1} Q${w * 0.18},${h * 0.07} ${w * 0.2},${h * 0.1} Q${w * 0.22},${h * 0.07} ${w * 0.24},${h * 0.1}`} fill="none" stroke="#90A4AE" strokeWidth={1.5} />
        </Svg>
      </Animated.View>

      {/* ── Layer 5: Ground + Trees + Stickman (shakes on wrong) ── */}
      <Animated.View style={[{ position: 'absolute', width: w, height: h }, bodyAnimStyle]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Grass ground */}
          <Rect x={0} y={groundY - bk * 0.02} width={w} height={h - (groundY - bk * 0.02) + 10} fill={groundCol} />
          <Rect x={0} y={groundY - bk * 0.005} width={w} height={bk * 0.025} fill={groundDark} opacity={0.4} />

          {/* -- Background Rocks & Castle -- */}
          <G>
            {/* Small rock - left */}
            <Path d={`M${w * 0.05},${groundY} Q${w * 0.04},${groundY - bk * 0.05} ${w * 0.07},${groundY - bk * 0.06} Q${w * 0.1},${groundY - bk * 0.05} ${w * 0.12},${groundY} Z`} fill="#9E9E9E" stroke="#757575" strokeWidth={1} />
            {/* Small rock - mid */}
            <Path d={`M${w * 0.35},${groundY} Q${w * 0.37},${groundY - bk * 0.08} ${w * 0.4},${groundY} Z`} fill="#BDBDBD" stroke="#9E9E9E" strokeWidth={1} />

            {/* -- Castle at w*0.78 (refined position) -- */}
            <G transform={`translate(${w * 0.78}, ${groundY})`}>
              {/* Left Tower */}
              <Rect x={-bk * 0.4} y={-bk * 0.95} width={bk * 0.22} height={bk * 0.95} fill="#B0BEC5" stroke="#78909C" strokeWidth={1} />
              {/* Left tower crenellations */}
              <Rect x={-bk * 0.43} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              <Rect x={-bk * 0.32} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              <Rect x={-bk * 0.21} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              {/* Left tower window */}
              <Rect x={-bk * 0.33} y={-bk * 0.7} width={bk * 0.09} height={bk * 0.1} rx={bk * 0.045} fill="#546E7A" />

              {/* Right Tower */}
              <Rect x={bk * 0.18} y={-bk * 0.95} width={bk * 0.22} height={bk * 0.95} fill="#B0BEC5" stroke="#78909C" strokeWidth={1} />
              {/* Right tower crenellations */}
              <Rect x={bk * 0.15} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              <Rect x={bk * 0.26} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              <Rect x={bk * 0.37} y={-bk * 1.01} width={bk * 0.07} height={bk * 0.07} fill="#B0BEC5" stroke="#78909C" strokeWidth={0.8} />
              {/* Right tower window */}
              <Rect x={bk * 0.25} y={-bk * 0.7} width={bk * 0.09} height={bk * 0.1} rx={bk * 0.045} fill="#546E7A" />

              {/* Central Wall */}
              <Rect x={-bk * 0.18} y={-bk * 0.7} width={bk * 0.36} height={bk * 0.7} fill="#CFD8DC" stroke="#90A4AE" strokeWidth={1} />
              {/* Central wall crenellations */}
              <Rect x={-bk * 0.18} y={-bk * 0.77} width={bk * 0.07} height={bk * 0.07} fill="#CFD8DC" stroke="#90A4AE" strokeWidth={0.8} />
              <Rect x={-0.035} y={-bk * 0.77} width={bk * 0.07} height={bk * 0.07} fill="#CFD8DC" stroke="#90A4AE" strokeWidth={0.8} />
              <Rect x={bk * 0.11} y={-bk * 0.77} width={bk * 0.07} height={bk * 0.07} fill="#CFD8DC" stroke="#90A4AE" strokeWidth={0.8} />

              {/* Arched Gate */}
              <Path d={`M${-bk * 0.09},${0} L${-bk * 0.09},${-bk * 0.26} Q${0},${-bk * 0.4} ${bk * 0.09},${-bk * 0.26} L${bk * 0.09},${0} Z`} fill="#5D4037" />
              {/* Gate highlight */}
              <Path d={`M${-bk * 0.045},${0} L${-bk * 0.045},${-bk * 0.22} Q${0},${-bk * 0.33} ${bk * 0.045},${-bk * 0.22} L${bk * 0.045},${0} Z`} fill="#4E342E" />

              {/* Small windows on wall */}
              <Rect x={-bk * 0.14} y={-bk * 0.55} width={bk * 0.05} height={bk * 0.07} rx={bk * 0.015} fill="#546E7A" />
              <Rect x={bk * 0.09} y={-bk * 0.55} width={bk * 0.05} height={bk * 0.07} rx={bk * 0.015} fill="#546E7A" />

              {/* Flag poles on towers */}
              <Line x1={-bk * 0.29} y1={-bk * 1.01} x2={-bk * 0.29} y2={-bk * 1.15} stroke="#757575" strokeWidth={1.8} />
              <Line x1={bk * 0.29} y1={-bk * 1.01} x2={bk * 0.29} y2={-bk * 1.15} stroke="#757575" strokeWidth={1.8} />
            </G>
          </G>

          {/* ── Layer 5: Animated Flags (Absolute positioned over towers) ── */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: w * 0.78 - bk * 0.29,
                top: groundY - bk * 1.15,
                zIndex: 10,
              },
              flag1AnimStyle
            ]}
          >
            <Svg width={bk * 0.25} height={bk * 0.15}>
              <Path d={`M0,0 L${bk * 0.2},${bk * 0.075} L0,${bk * 0.15} Z`} fill="#FFEB3B" stroke="#FBC02D" strokeWidth={1} />
            </Svg>
          </Animated.View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                left: w * 0.78 + bk * 0.29,
                top: groundY - bk * 1.15,
                zIndex: 10,
              },
              flag2AnimStyle
            ]}
          >
            <Svg width={bk * 0.25} height={bk * 0.15}>
              <Path d={`M0,0 L${bk * 0.2},${bk * 0.075} L0,${bk * 0.15} Z`} fill="#FFEB3B" stroke="#FBC02D" strokeWidth={1} />
            </Svg>
          </Animated.View>

          {/* ── Grass tufts ── */}
          <Path d={`M${w * 0.02},${groundY} Q${w * 0.04},${groundY - bk * 0.03} ${w * 0.06},${groundY} M${w * 0.09},${groundY} Q${w * 0.11},${groundY - bk * 0.02} ${w * 0.13},${groundY} M${w * 0.16},${groundY} Q${w * 0.18},${groundY - bk * 0.025} ${w * 0.20},${groundY} M${w * 0.25},${groundY} Q${w * 0.27},${groundY - bk * 0.018} ${w * 0.29},${groundY} M${w * 0.34},${groundY} Q${w * 0.36},${groundY - bk * 0.022} ${w * 0.38},${groundY} M${w * 0.43},${groundY} Q${w * 0.45},${groundY - bk * 0.015} ${w * 0.47},${groundY} M${w * 0.52},${groundY} Q${w * 0.54},${groundY - bk * 0.028} ${w * 0.56},${groundY} M${w * 0.61},${groundY} Q${w * 0.63},${groundY - bk * 0.02} ${w * 0.65},${groundY} M${w * 0.70},${groundY} Q${w * 0.72},${groundY - bk * 0.025} ${w * 0.74},${groundY} M${w * 0.78},${groundY} Q${w * 0.80},${groundY - bk * 0.018} ${w * 0.82},${groundY} M${w * 0.86},${groundY} Q${w * 0.88},${groundY - bk * 0.022} ${w * 0.90},${groundY} M${w * 0.93},${groundY} Q${w * 0.95},${groundY - bk * 0.02} ${w * 0.97},${groundY}`} stroke={groundDark} strokeWidth={1.5} fill="none" />

          {/* ── Small flowers ── */}
          <G>
            <Line x1={w * 0.07} y1={groundY} x2={w * 0.07} y2={groundY - bk * 0.04} stroke="#66BB6A" strokeWidth={1} />
            <Circle cx={w * 0.07} cy={groundY - bk * 0.045} r={bk * 0.012} fill="#F06292" />
            <Circle cx={w * 0.07} cy={groundY - bk * 0.045} r={bk * 0.006} fill="#FFEB3B" />
            <Line x1={w * 0.55} y1={groundY} x2={w * 0.55} y2={groundY - bk * 0.038} stroke="#66BB6A" strokeWidth={1} />
            <Circle cx={w * 0.55} cy={groundY - bk * 0.043} r={bk * 0.011} fill="#AB47BC" />
            <Circle cx={w * 0.55} cy={groundY - bk * 0.043} r={bk * 0.005} fill="#FFEB3B" />
            <Line x1={w * 0.88} y1={groundY} x2={w * 0.88} y2={groundY - bk * 0.032} stroke="#66BB6A" strokeWidth={1} />
            <Circle cx={w * 0.88} cy={groundY - bk * 0.037} r={bk * 0.01} fill="#EF5350" />
            <Circle cx={w * 0.88} cy={groundY - bk * 0.037} r={bk * 0.005} fill="#FFF176" />
          </G>

          {/* ── Floating Bubbles (SVG, behind stickman) ── */}
          {bubblePositions.map((pos, i) => {
            const limbLen2 = bk * 0.06;
            const limbSW2 = bk * 0.015; // Stable limb thickness in bubble
            const color = bubbleColors[i];
            const hasCaptured = capturedLimbs[i];
            return (
              <G key={`bubble-${i}`}>
                <Circle cx={pos.x} cy={pos.y} r={bubbleR * 1.3} fill={color.fill} opacity={0.2} />
                <Circle cx={pos.x} cy={pos.y} r={bubbleR} fill={color.fill} opacity={hasCaptured ? 0.65 : 0.45} stroke={color.fill} strokeWidth={2.5} />
                <Ellipse cx={pos.x - bubbleR * 0.2} cy={pos.y - bubbleR * 0.25} rx={bubbleR * 0.4} ry={bubbleR * 0.22} fill="white" opacity={0.5} />
                <Circle cx={pos.x + bubbleR * 0.35} cy={pos.y - bubbleR * 0.35} r={bubbleR * 0.1} fill="white" opacity={0.7} />
                {hasCaptured && i === 0 && (
                  <Line x1={pos.x} y1={pos.y - limbLen2 * 0.3} x2={pos.x - limbLen2 * 0.5} y2={pos.y + limbLen2 * 0.7} stroke={bodyCol} strokeWidth={limbSW2} strokeLinecap="round" opacity={0.5} />
                )}
                {hasCaptured && i === 1 && (
                  <Line x1={pos.x} y1={pos.y - limbLen2 * 0.3} x2={pos.x + limbLen2 * 0.5} y2={pos.y + limbLen2 * 0.7} stroke={bodyCol} strokeWidth={limbSW2} strokeLinecap="round" opacity={0.5} />
                )}
                {hasCaptured && i === 2 && (
                  <Line x1={pos.x} y1={pos.y} x2={pos.x - limbLen2} y2={pos.y + limbLen2 * 0.3} stroke={bodyCol} strokeWidth={limbSW2} strokeLinecap="round" opacity={0.5} />
                )}
                {hasCaptured && i === 3 && (
                  <Line x1={pos.x} y1={pos.y} x2={pos.x + limbLen2} y2={pos.y + limbLen2 * 0.3} stroke={bodyCol} strokeWidth={limbSW2} strokeLinecap="round" opacity={0.5} />
                )}
              </G>
            );
          })}

          {/* -- Behind Clothing (Cape) -- */}
          {renderBehindClothes()}

          {/* -- Left Leg -- */}
          {showLL && (
            <G>
              <Line x1={cx} y1={bodyBot} x2={llEndX} y2={llEndY} stroke={bodyCol} strokeWidth={sw} strokeLinecap="round" />
              <Circle cx={(cx + llEndX) / 2} cy={(bodyBot + llEndY) / 2} r={jointR * 0.7} fill={bodyCol} />
              <Circle cx={llEndX} cy={llEndY} r={jointR * 0.8} fill={bodyCol} />
              {equipped.shoes && renderLeftBoot(equipped.shoes, llEndX, llEndY, size * 0.06, size * 0.04)}
            </G>
          )}

          {/* -- Right Leg -- */}
          {showRL && (
            <G>
              <Line x1={cx} y1={bodyBot} x2={rlEndX} y2={rlEndY} stroke={bodyCol} strokeWidth={sw} strokeLinecap="round" />
              <Circle cx={(cx + rlEndX) / 2} cy={(bodyBot + rlEndY) / 2} r={jointR * 0.7} fill={bodyCol} />
              <Circle cx={rlEndX} cy={rlEndY} r={jointR * 0.8} fill={bodyCol} />
              {equipped.shoes && renderRightBoot(equipped.shoes, rlEndX, rlEndY, size * 0.06, size * 0.04)}
            </G>
          )}

          {/* -- Left Arm -- */}
          {!hideArms && showLA && (
            <G>
              <Line x1={cx} y1={armY} x2={laEndX} y2={laEndY} stroke={bodyCol} strokeWidth={sw} strokeLinecap="round" />
              <Circle cx={(cx + laEndX) / 2} cy={(armY + laEndY) / 2} r={jointR * 0.6} fill={bodyCol} />
              <Circle cx={laEndX} cy={laEndY} r={jointR * 0.8} fill={bodyCol} />
            </G>
          )}

          {/* -- Right Arm -- */}
          {!hideArms && showRA && (
            <G>
              <Line x1={cx} y1={armY} x2={raEndX} y2={raEndY} stroke={bodyCol} strokeWidth={sw} strokeLinecap="round" />
              <Circle cx={(cx + raEndX) / 2} cy={(armY + raEndY) / 2} r={jointR * 0.6} fill={bodyCol} />
              <Circle cx={raEndX} cy={raEndY} r={jointR * 0.8} fill={bodyCol} />
            </G>
          )}

          {/* -- Body trunk -- */}
          <Line x1={cx} y1={bodyTop} x2={cx} y2={bodyBot} stroke={bodyCol} strokeWidth={sw} strokeLinecap="round" />
          <Circle cx={cx} cy={armY} r={jointR} fill={bodyCol} />
          <Circle cx={cx} cy={bodyBot} r={jointR} fill={bodyCol} />

          {/* -- Front Clothing -- */}
          {renderLower()}
          {renderUpper()}
          {renderFrontBackAccessories()}

          {/* -- Head -- */}
          {showHead && (
            <G>
              {wrongCount >= 5 && (
                <Ellipse cx={cx} cy={headCY - headR * 1.4} rx={headR * 0.8} ry={headR * 0.2} fill="none" stroke="#FFD700" strokeWidth={2.5} opacity={0.9} />
              )}
              <Circle cx={cx} cy={headCY} r={headR} stroke={bodyCol} strokeWidth={sw} fill={skyBot} />
              {equipped.hair !== 'hat-robot' && (
                <G>
                  {wrongCount >= 5 ? (
                    <G>
                      <Path d={`M${cx - headR * 0.4},${headCY - headR * 0.05} Q${cx - headR * 0.3},${headCY + headR * 0.1} ${cx - headR * 0.2},${headCY - headR * 0.05}`} stroke={bodyCol} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
                      <Path d={`M${cx + headR * 0.2},${headCY - headR * 0.05} Q${cx + headR * 0.3},${headCY + headR * 0.1} ${cx + headR * 0.4},${headCY - headR * 0.05}`} stroke={bodyCol} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
                      <Path d={`M${cx - headR * 0.2},${headCY + headR * 0.3} Q${cx},${headCY + headR * 0.45} ${cx + headR * 0.2},${headCY + headR * 0.3}`} stroke={bodyCol} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
                    </G>
                  ) : (
                    <G>
                      <Circle cx={cx - headR * 0.3} cy={headCY - headR * 0.08} r={headR * 0.09} fill={bodyCol} />
                      <Circle cx={cx + headR * 0.3} cy={headCY - headR * 0.08} r={headR * 0.09} fill={bodyCol} />
                      <Circle cx={cx - headR * 0.25} cy={headCY - headR * 0.13} r={headR * 0.03} fill="#fff" />
                      <Circle cx={cx + headR * 0.35} cy={headCY - headR * 0.13} r={headR * 0.03} fill="#fff" />
                      {wrongCount === 0 ? (
                        <Path d={`M${cx - headR * 0.25},${headCY + headR * 0.3} Q${cx},${headCY + headR * 0.55} ${cx + headR * 0.25},${headCY + headR * 0.3}`} stroke={bodyCol} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
                      ) : wrongCount <= 2 ? (
                        <Line x1={cx - headR * 0.2} y1={headCY + headR * 0.35} x2={cx + headR * 0.2} y2={headCY + headR * 0.35} stroke={bodyCol} strokeWidth={sw * 0.5} strokeLinecap="round" />
                      ) : (
                        <Path d={`M${cx - headR * 0.25},${headCY + headR * 0.45} Q${cx},${headCY + headR * 0.25} ${cx + headR * 0.25},${headCY + headR * 0.45}`} stroke={bodyCol} strokeWidth={sw * 0.5} fill="none" strokeLinecap="round" />
                      )}
                    </G>
                  )}
                </G>
              )}
              {renderHat()}
              {renderGlasses()}
            </G>
          )}

          {/* ── Angel Wings (wrongCount >= 5) ── */}
          {wrongCount >= 5 && (
            <G>
              <Path d={`M${cx},${armY} Q${cx - 45},${armY - 55} ${cx - 65},${armY - 10} Q${cx - 55},${armY + 25} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.85)" stroke="#E0E0E0" strokeWidth={1.5} />
              <Path d={`M${cx},${armY} Q${cx + 45},${armY - 55} ${cx + 65},${armY - 10} Q${cx + 55},${armY + 25} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.85)" stroke="#E0E0E0" strokeWidth={1.5} />
              <Path d={`M${cx - 20},${armY - 15} Q${cx - 35},${armY - 35} ${cx - 50},${armY - 10}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
              <Path d={`M${cx + 20},${armY - 15} Q${cx + 35},${armY - 35} ${cx + 50},${armY - 10}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
            </G>
          )}
        </Svg>
      </Animated.View>

      {/* -- Floating Bubble Overlays (animated) -- */}
      {bubblePositions.map((pos, i) => {
        const bDiam = bubbleR * 3;
        const bCenter = bDiam / 2;
        const color = bubbleColors[i];
        const hasCaptured = capturedLimbs[i];
        return (
          <Animated.View
            key={`float-bubble-${i}`}
            pointerEvents="none"
            style={[{
              position: 'absolute',
              left: pos.x - bDiam / 2,
              top: pos.y - bDiam / 2,
              width: bDiam,
              height: bDiam,
            }, bubbleAnimStyles[i]]}
          >
            <Svg width={bDiam} height={bDiam} viewBox={`0 0 ${bDiam} ${bDiam}`}>
              <Circle cx={bCenter} cy={bCenter} r={bubbleR * 1.1} fill={color.fill} opacity={0.15} />
              <Circle cx={bCenter} cy={bCenter} r={bubbleR} fill={color.fill} opacity={hasCaptured ? 0.55 : 0.35} stroke={color.fill} strokeWidth={2} />
              <Ellipse cx={bCenter - bubbleR * 0.15} cy={bCenter - bubbleR * 0.2} rx={bubbleR * 0.35} ry={bubbleR * 0.2} fill="white" opacity={0.5} />
              <Circle cx={bCenter + bubbleR * 0.3} cy={bCenter - bubbleR * 0.3} r={bubbleR * 0.08} fill="white" opacity={0.65} />
            </Svg>
          </Animated.View>
        );
      })}

      {/* -- Emoji Reaction Bubbles -- */}
      {emojiReaction && emojiReaction.emojis.map((emoji, i) => {
        const emojiX = i === 0 ? cx + bk * 0.4 : cx - bk * 0.4;
        const emojiY = headCY - bk * 0.35;
        const bgColor = emojiReaction.type === 'correct' ? 'rgba(76, 175, 80, 0.9)'
          : emojiReaction.type === 'gameover' ? 'rgba(255, 215, 0, 0.9)'
          : 'rgba(244, 67, 54, 0.85)';
        return (
          <Animated.View
            key={`emoji-${i}-${emoji}`}
            entering={ZoomIn.delay(i * 150).duration(300).springify()}
            exiting={FadeOut.delay(i * 100).duration(400)}
            style={{
              position: 'absolute',
              left: emojiX - 16,
              top: emojiY - 16,
              backgroundColor: bgColor,
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 4,
              minWidth: 36,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

