import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G, Path, Ellipse, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useGameState } from '@/hooks/useGameState';

interface AnimatedStickmanProps {
  size?: number;
  hideArms?: boolean;
}

export default function AnimatedStickman({ size = 200, hideArms = false }: AnimatedStickmanProps) {
  const equipped = useGameState((state) => state.equippedAccessories);
  const armAngle = useSharedValue(0);
  const headBob = useSharedValue(0);
  const pencilBob = useSharedValue(0);
  const legBob = useSharedValue(0);

  useEffect(() => {
    armAngle.value = withRepeat(
      withSequence(
        withTiming(-25, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );

    headBob.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );

    pencilBob.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
    
    legBob.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);

  const rightArmStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: size * 0.5 },
      { translateY: size * 0.4 },
      { rotate: `${armAngle.value}deg` },
      { translateX: -size * 0.5 },
      { translateY: -size * 0.4 },
    ],
  }));

  const headStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: headBob.value },
      { rotate: `${headBob.value * 0.5}deg` }
    ],
  }));

  const leftLegStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: size * 0.5 },
      { translateY: size * 0.65 },
      { rotate: `${legBob.value}deg` },
      { translateX: -size * 0.5 },
      { translateY: -size * 0.65 },
    ],
  }));

  const rightLegStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: size * 0.5 },
      { translateY: size * 0.65 },
      { rotate: `${-legBob.value}deg` },
      { translateX: -size * 0.5 },
      { translateY: -size * 0.65 },
    ],
  }));

  const cx = size / 2;
  const headCY = size * 0.25;
  const headR = size * 0.15;
  const bodyTop = headCY + headR;
  const bodyBot = size * 0.65;
  const legLen = size * 0.25;
  const armY = size * 0.45;
  const armLen = size * 0.25;
  const sw = size * 0.04;

  const hasHat = equipped.hair === 'hat-1' || equipped.hair === 'hat-2' || equipped.hair === 'hat-3' || equipped.hair === 'hat-4';
  const hasGlasses = equipped.face === 'glasses-1' || equipped.face === 'glasses-2' || equipped.face === 'glasses-3';
  const hasUpper = !!equipped.upper;
  const hasLower = !!equipped.lower;
  const hasBack = !!equipped.back;
  const hasBoots = equipped.shoes === 'shoes-1' || equipped.shoes === 'shoes-2' || equipped.shoes === 'shoes-3';

  const getClothesColor = () => {
    if (equipped.upper === 'shirt-2') return "#4CAF50";
    if (equipped.upper === 'shirt-3') return "#9C27B0";
    if (equipped.upper === 'shirt-4') return "#F8BBD0";
    if (equipped.lower === 'shirt-5') return "#F06292";
    if (equipped.lower === 'lower-3') return "#673AB7";
    return bodyCol;
  };
  const getBackColor = () => {
    if (equipped.back === 'shirt-1') return "rgba(231, 76, 60, 0.4)";
    return bodyCol;
  };

  const renderLeftBoot = (x: number, y: number, bW: number, bH: number) => {
    if (!hasBoots) return null;
    if (equipped.shoes === 'shoes-1') {
      return (
        <Path d={`M${x - bW * 0.6},${y - bH * 0.3} L${x - bW * 0.6},${y + bH} L${x + bW * 0.8},${y + bH} L${x + bW * 0.8},${y + bH * 0.5} L${x + bW * 0.3},${y - bH * 0.3} Z`} fill={bodyCol} stroke="#263238" strokeWidth={1} />
      );
    }
    if (equipped.shoes === 'shoes-2') {
      return (
        <G>
          <Path d={`M${x - bW * 0.6},${y - bH * 0.1} L${x - bW * 0.6},${y + bH} L${x + bW * 0.9},${y + bH} L${x + bW * 0.9},${y + bH * 0.4} L${x + bW * 0.3},${y - bH * 0.1} Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={x + bW * 0.3} cy={y + bH * 0.6} r={bW * 0.2} fill="#fff" />
        </G>
      );
    }
    if (equipped.shoes === 'shoes-3') {
      return (
        <G>
          <Path d={`M${x - bW * 0.5},${y + bH * 0.4} Q${x + bW * 0.2},${y + bH * 0.1} ${x + bW * 0.8},${y + bH} L${x - bW * 0.5},${y + bH} Z`} fill="#E91E63" />
          <Line x1={x - bW * 0.5} y1={y + bH * 0.6} x2={x + bW * 0.3} y2={y + bH * 0.6} stroke="#fff" strokeWidth={1.5} />
        </G>
      );
    }
    return null;
  };

  const renderRightBoot = (x: number, y: number, bW: number, bH: number) => {
    if (!hasBoots) return null;
    if (equipped.shoes === 'shoes-1') {
      return (
        <Path d={`M${x + bW * 0.6},${y - bH * 0.3} L${x + bW * 0.6},${y + bH} L${x - bW * 0.8},${y + bH} L${x - bW * 0.8},${y + bH * 0.5} L${x - bW * 0.3},${y - bH * 0.3} Z`} fill={bodyCol} stroke="#263238" strokeWidth={1} />
      );
    }
    if (equipped.shoes === 'shoes-2') {
      return (
        <G>
          <Path d={`M${x + bW * 0.6},${y - bH * 0.1} L${x + bW * 0.6},${y + bH} L${x - bW * 0.9},${y + bH} L${x - bW * 0.9},${y + bH * 0.4} L${x - bW * 0.3},${y - bH * 0.1} Z`} fill="#2196F3" stroke="#1976D2" strokeWidth={1} />
          <Circle cx={x - bW * 0.3} cy={y + bH * 0.6} r={bW * 0.2} fill="#fff" />
        </G>
      );
    }
    if (equipped.shoes === 'shoes-3') {
      return (
        <G>
          <Path d={`M${x + bW * 0.5},${y + bH * 0.4} Q${x - bW * 0.2},${y + bH * 0.1} ${x - bW * 0.8},${y + bH} L${x + bW * 0.5},${y + bH} Z`} fill="#E91E63" />
          <Line x1={x + bW * 0.5} y1={y + bH * 0.6} x2={x - bW * 0.3} y2={y + bH * 0.6} stroke="#fff" strokeWidth={1.5} />
        </G>
      );
    }
    return null;
  };

  const bodyCol = '#2D3436';
  const pencilWood = '#E1B12C';
  const pencilTip = '#2D3436';
  const pencilBase = '#E84118';
  const pencilPink = '#F368E0';

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      {/* ── Layer 1: Background (Shadow and Cape) ── */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        {/* Shadow */}
        <Ellipse cx={cx} cy={size * 0.95} rx={size * 0.3} ry={size * 0.05} fill="rgba(0,0,0,0.15)" />
        
        {/* Behind Clothing Layer */}
        {hasBack && (
          <G>
            {equipped.back === 'shirt-1' && (
              <Path
                d={`M${cx - 10},${armY - 15} L${cx - 25},${bodyBot + 15} Q${cx},${bodyBot + 25} ${cx + 25},${bodyBot + 15} L${cx + 10},${armY - 15} Z`}
                fill="rgba(231, 76, 60, 0.4)"
                stroke={Colors.error}
                strokeWidth={1.2}
              />
            )}

            {equipped.back === 'back-2' && (
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
            )}

            {equipped.back === 'back-3' && (
              <G>
                {/* Backpack Main Bag */}
                <Rect x={cx - 15} y={armY - 5} width={30} height={38} rx={4} fill="#8D6E63" stroke="#5D4037" strokeWidth={1} />
                <Rect x={cx - 15} y={armY + 5} width={30} height={4} fill="#5D4037" />
                <Rect x={cx - 15} y={armY + 20} width={30} height={4} fill="#5D4037" />
              </G>
            )}

            {equipped.back === 'back-4' && (
              <G>
                {/* Angel Wings */}
                <Path d={`M${cx},${armY} Q${cx - 40},${armY - 50} ${cx - 60},${armY - 10} Q${cx - 50},${armY + 20} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
                <Path d={`M${cx},${armY} Q${cx + 40},${armY - 50} ${cx + 60},${armY - 10} Q${cx + 50},${armY + 20} ${cx},${armY + 10} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
              </G>
            )}

            {equipped.back === 'back-5' && (
              <G>
                {/* Jetpack */}
                <Rect x={cx - 15} y={armY - 10} width={30} height={35} rx={2} fill="#7F8C8D" />
                <Rect x={cx - 12} y={armY + 25} width={8} height={12} fill="#E67E22" />
                <Rect x={cx + 4} y={armY + 25} width={8} height={12} fill="#E67E22" />
                <Path d={`M${cx - 12},${armY + 37} L${cx - 8},${armY + 45} L${cx - 4},${armY + 37} Z`} fill="#E74C3C" />
                <Path d={`M${cx + 4},${armY + 37} L${cx + 8},${armY + 45} L${cx + 12},${armY + 37} Z`} fill="#E74C3C" />
              </G>
            )}

            {equipped.back === 'back-6' && (
              <G>
                {/* Pink Butterfly Wings */}
                <Path d={`M${cx},${armY + 5} Q${cx - 30},${armY - 35} ${cx - 45},${armY + 5} Q${cx - 40},${armY + 30} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + 5} Q${cx - 25},${armY + 50} ${cx - 40},${armY + 35} Q${cx - 35},${armY + 20} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + 5} Q${cx + 30},${armY - 35} ${cx + 45},${armY + 5} Q${cx + 40},${armY + 30} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + 5} Q${cx + 25},${armY + 50} ${cx + 40},${armY + 35} Q${cx + 35},${armY + 20} ${cx},${armY + 25} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
              </G>
            )}
          </G>
        )}
      </Svg>

      {/* ── Layer 2: Limbs (Legs and Arms) ── */}
      {/* Static Left Arm */}
      {!hideArms && (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
          <Path
            d={`M${cx},${armY} Q${cx - armLen * 0.8},${armY - armLen * 0.5} ${cx - armLen * 1.2},${armY - armLen * 0.2}`}
            stroke={bodyCol}
            strokeWidth={sw}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      )}

      {/* Animated Right Arm */}
      {!hideArms && (
        <Animated.View style={[StyleSheet.absoluteFill, rightArmStyle]}>
           <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Path
                d={`M${cx},${armY} Q${cx + armLen},${armY + armLen * 0.5} ${cx + armLen * 1.3},${armY - armLen * 0.2}`}
                stroke={bodyCol}
                strokeWidth={sw}
                strokeLinecap="round"
                fill="none"
              />
              {/* The Pencil */}
              <G transform={`translate(${cx + armLen * 1.3}, ${armY - armLen * 0.2}) rotate(-45)`}>
                 <Path d="M-10,-30 L10,-30 L10,20 L0,40 L-10,20 Z" fill={pencilWood} />
                 <Path d="M-4,28 L4,28 L0,36 Z" fill={pencilTip} />
                 <Path d="M-10,10 L10,10 L0,30 Z" fill="#F1C40F" opacity={0.5} />
                 <Path d="M-10,-30 L10,-30 L10,-40 L-10,-40 Z" fill={pencilBase} />
                 <Path d="M-10,-40 L10,-40 Q10,-50 0,-50 Q-10,-50 -10,-40 Z" fill={pencilPink} />
              </G>
           </Svg>
        </Animated.View>
      )}

      {/* Left Leg */}
      <Animated.View style={[StyleSheet.absoluteFill, leftLegStyle]}>
         <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
           <Line
              x1={cx}
              y1={bodyBot}
              x2={cx - legLen * 0.5}
              y2={bodyBot + legLen}
              stroke={bodyCol}
              strokeWidth={sw}
               strokeLinecap="round"
            />
            {renderLeftBoot(cx - legLen * 0.5, bodyBot + legLen, size * 0.06, size * 0.04)}
         </Svg>
      </Animated.View>

      {/* Right Leg */}
      <Animated.View style={[StyleSheet.absoluteFill, rightLegStyle]}>
         <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
           <Line
              x1={cx}
              y1={bodyBot}
              x2={cx + legLen * 0.5}
              y2={bodyBot + legLen}
              stroke={bodyCol}
              strokeWidth={sw}
              strokeLinecap="round"
            />
            {renderRightBoot(cx + legLen * 0.5, bodyBot + legLen, size * 0.06, size * 0.04)}
         </Svg>
      </Animated.View>

      {/* ── Layer 3: Foreground (Torso and Front Clothes) ── */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        {/* Torso */}
        <Line
          x1={cx}
          y1={bodyTop}
          x2={cx}
          y2={bodyBot}
          stroke={bodyCol}
          strokeWidth={sw}
          strokeLinecap="round"
        />

        {/* Front Clothing (Shirt/Dress) */}
        {/* Lower Body Clothing */}
        {hasLower && (
          <G>
            {equipped.lower === 'shirt-5' && (
              <G>
                {/* Pink Ruffle Skirt */}
                <Path
                  d={`M${cx - 12},${bodyBot}
                      L${cx + 12},${bodyBot}
                      L${cx + 25},${bodyBot + 18}
                      Q${cx},${bodyBot + 24} ${cx - 25},${bodyBot + 18} Z`}
                  fill="#F06292"
                  stroke="#D81B60"
                  strokeWidth={1}
                />
                <Path d={`M${cx - 18},${bodyBot + 12} Q${cx - 9},${bodyBot + 14} ${cx},${bodyBot + 12} Q${cx + 9},${bodyBot + 14} ${cx + 18},${bodyBot + 12}`} fill="none" stroke="#D81B60" strokeWidth={1} opacity={0.6} />
              </G>
            )}
            {equipped.lower === 'lower-1' && (
              <G>
                {/* Boy Shorts */}
                <Path
                  d={`M${cx - 12},${bodyBot}
                      L${cx + 12},${bodyBot}
                      L${cx + 14},${bodyBot + 15}
                      L${cx + 2},${bodyBot + 15}
                      L${cx},${bodyBot + 8}
                      L${cx - 2},${bodyBot + 15}
                      L${cx - 14},${bodyBot + 15} Z`}
                  fill="#1976D2"
                  stroke="#0D47A1"
                  strokeWidth={1}
                />
              </G>
            )}
            {equipped.lower === 'lower-2' && (
              <G>
                {/* Princess Skirt */}
                <Path
                  d={`M${cx - 10},${bodyBot}
                      L${cx - size * 0.15},${bodyBot + legLen * 0.4}
                      Q${cx},${bodyBot + legLen * 0.55} ${cx + size * 0.15},${bodyBot + legLen * 0.4}
                      L${cx + 10},${bodyBot} Z`}
                  fill="#9C27B0"
                  stroke="#7B1FA2"
                  strokeWidth={1}
                />
                <Rect x={cx - 10} y={bodyBot} width={20} height={4} fill="#F06292" rx={2} />
              </G>
            )}
            {equipped.lower === 'lower-3' && (
              <G>
                {/* Purple Pleated Skirt */}
                <Path
                  d={`M${cx - 13},${bodyBot}
                      L${cx + 13},${bodyBot}
                      L${cx + 23},${bodyBot + 20}
                      Q${cx},${bodyBot + 26} ${cx - 23},${bodyBot + 20} Z`}
                  fill="#673AB7"
                  stroke="#512DA8"
                  strokeWidth={1}
                />
                <Line x1={cx - 8} y1={bodyBot + 2} x2={cx - 12} y2={bodyBot + 22} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
                <Line x1={cx} y1={bodyBot + 2} x2={cx} y2={bodyBot + 24} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
                <Line x1={cx + 8} y1={bodyBot + 2} x2={cx + 12} y2={bodyBot + 22} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
              </G>
            )}
            {equipped.lower === 'lower-4' && (
              <G>
                {/* Camo Shorts */}
                <Path
                  d={`M${cx - 12},${bodyBot}
                      L${cx + 12},${bodyBot}
                      L${cx + 14},${bodyBot + 18}
                      L${cx + 2},${bodyBot + 18}
                      L${cx},${bodyBot + 8}
                      L${cx - 2},${bodyBot + 18}
                      L${cx - 14},${bodyBot + 18} Z`}
                  fill="#556B2F"
                  stroke="#3D4F1F"
                  strokeWidth={1.5}
                />
                <Circle cx={cx - 6} cy={bodyBot + 6} r={3} fill="#8B4513" opacity={0.4} />
                <Circle cx={cx + 6} cy={bodyBot + 12} r={2.5} fill="#2F4F4F" opacity={0.4} />
              </G>
            )}
          </G>
        )}

        {/* Upper Body Clothing */}
        {hasUpper && (
          <G>
            {equipped.upper === 'shirt-2' && (
              <G>
                {/* Short Sleeves */}
                <Path d={`M${cx - 10},${armY - 4} L${cx - 20},${armY + 6} L${cx - 15},${armY + 12} L${cx - 8},${armY + 8}`} fill="#4CAF50" stroke="#388E3C" />
                <Path d={`M${cx + 10},${armY - 4} L${cx + 20},${armY + 6} L${cx + 15},${armY + 12} L${cx + 8},${armY + 8}`} fill="#4CAF50" stroke="#388E3C" />
                {/* T-Shirt */}
                <Path
                  d={`M${cx - 10},${armY - 5}
                      L${cx - 12},${bodyBot}
                      Q${cx},${bodyBot + 5} ${cx + 12},${bodyBot}
                      L${cx + 10},${armY - 5} Z`}
                  fill="#4CAF50"
                  stroke="#388E3C"
                  strokeWidth={1}
                />
              </G>
            )}
            {equipped.upper === 'shirt-3' && (
              <G>
                {/* Long Sleeves */}
                <Path d={`M${cx - 10},${armY - 4} L${cx - armLen * 0.9},${armY + 5} L${cx - armLen * 0.85},${armY + 10} L${cx - 8},${armY + 8}`} fill="#9C27B0" stroke="#7B1FA2" />
                <Path d={`M${cx + 10},${armY - 4} L${cx + armLen * 0.9},${armY + 5} L${cx + armLen * 0.85},${armY + 10} L${cx + 8},${armY + 8}`} fill="#9C27B0" stroke="#7B1FA2" />
                <Path
                  d={`M${cx - 10},${armY - 5}
                      L${cx - size * 0.15},${bodyBot}
                      Q${cx},${bodyBot + 3} ${cx + size * 0.15},${bodyBot}
                      L${cx + 10},${armY - 5} Z`}
                  fill="#9C27B0"
                  stroke="#7B1FA2"
                  strokeWidth={1}
                />
              </G>
            )}
            {equipped.upper === 'shirt-4' && (
              <G>
                {/* Light Pink Tee */}
                <Path d={`M${cx - 10},${armY - 4} L${cx - 18},${armY + 4} L${cx - 14},${armY + 10} L${cx - 8},${armY + 7}`} fill="#F8BBD0" stroke="#F06292" />
                <Path d={`M${cx + 10},${armY - 4} L${cx + 18},${armY + 4} L${cx + 14},${armY + 10} L${cx + 8},${armY + 7}`} fill="#F8BBD0" stroke="#F06292" />
                <Path
                  d={`M${cx - 10},${armY - 5}
                      L${cx - 11},${bodyBot}
                      Q${cx},${bodyBot + 5} ${cx + 11},${bodyBot}
                      L${cx + 10},${armY - 5} Z`}
                  fill="#F8BBD0"
                  stroke="#F06292"
                />
              </G>
            )}
          </G>
        )}
        {/* Front Back Accessories (Straps) */}
        {hasBack && equipped.back === 'back-3' && (
          <G>
            <Path d={`M${cx - 10},${armY - 10} L${cx - 10},${bodyBot - 5}`} stroke="rgba(0,0,0,0.4)" strokeWidth={sw * 0.6} strokeLinecap="round" />
            <Path d={`M${cx + 10},${armY - 10} L${cx + 10},${bodyBot - 5}`} stroke="rgba(0,0,0,0.4)" strokeWidth={sw * 0.6} strokeLinecap="round" />
          </G>
        )}
      </Svg>

      {/* ── Layer 4: Top (Head) ── */}
      <Animated.View style={[StyleSheet.absoluteFill, headStyle]}>
         <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
           {/* Head Circle */}
           <Circle
              cx={cx}
              cy={headCY}
              r={headR}
              stroke={bodyCol}
              strokeWidth={sw}
              fill="#FFF"
            />
            {/* Eyes */}
            <Circle cx={cx - headR * 0.4} cy={headCY - headR * 0.1} r={size * 0.02} fill={bodyCol} />
            <Circle cx={cx + headR * 0.4} cy={headCY - headR * 0.1} r={size * 0.02} fill={bodyCol} />
             {/* Mouth (Happy smile) */}
            <Path
                d={`M${cx - headR * 0.5},${headCY + headR * 0.3} Q${cx},${headCY + headR * 0.7} ${cx + headR * 0.5},${headCY + headR * 0.3}`}
                stroke={bodyCol}
                strokeWidth={size * 0.015}
                fill="none"
                strokeLinecap="round"
            />
            {/* Accessories */}
            {hasHat && (
              <G>
                {equipped.hair === 'hat-1' && (
                  <G>
                    <Ellipse cx={cx} cy={headCY - headR * 0.75} rx={headR * 1.5} ry={headR * 0.2} fill={Colors.primary} />
                    <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.75} Q${cx - headR * 1.1},${headCY - headR * 1.8} ${cx},${headCY - headR * 1.9} Q${cx + headR * 1.1},${headCY - headR * 1.8} ${cx + headR * 1.1},${headCY - headR * 0.75} Z`} fill={Colors.primary} stroke={Colors.primaryDark} strokeWidth={1} />
                  </G>
                )}
                {equipped.hair === 'hat-2' && (
                  <G>
                    <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.4} Q${cx - headR * 1.1},${headCY - headR * 1.6} ${cx},${headCY - headR * 1.6} Q${cx + headR * 1.1},${headCY - headR * 1.6} ${cx + headR * 1.1},${headCY - headR * 0.4} Z`} fill="#FF5722" stroke="#E64A19" strokeWidth={1} />
                    <Path d={`M${cx - headR * 1.1},${headCY - headR * 0.4} L${cx + headR * 1.8},${headCY - headR * 0.4}`} stroke="#E64A19" strokeWidth={3} strokeLinecap="round" />
                  </G>
                )}
                {equipped.hair === 'hat-3' && (
                  <G>
                    <Ellipse cx={cx} cy={headCY - headR * 0.5} rx={headR * 1.8} ry={headR * 0.3} fill="#F06292" />
                    <Path d={`M${cx - headR},${headCY - headR * 0.5} Q${cx - headR},${headCY - headR * 1.7} ${cx},${headCY - headR * 1.7} Q${cx + headR},${headCY - headR * 1.7} ${cx + headR},${headCY - headR * 0.5} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                  </G>
                )}
                {equipped.hair === 'hat-4' && (
                  <G>
                    {/* Fairy Crown / Tiara */}
                    <Path
                      d={`M${cx - headR * 0.9},${headCY - headR * 0.6} Q${cx - headR * 0.9},${headCY - headR * 1.1} ${cx},${headCY - headR * 1.3} Q${cx + headR * 0.9},${headCY - headR * 1.1} ${cx + headR * 0.9},${headCY - headR * 0.6}`}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth={2}
                    />
                    <Circle cx={cx} cy={headCY - headR * 1.8} r={headR * 0.15} fill="#F06292" stroke="#D81B60" strokeWidth={0.5} />
                    <Path
                      d={`M${cx - headR * 0.7},${headCY - headR * 0.9} Q${cx - headR * 0.3},${headCY - headR * 1.5} ${cx},${headCY - headR * 1.8} Q${cx + headR * 0.3},${headCY - headR * 1.5} ${cx + headR * 0.7},${headCY - headR * 0.9}`}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth={2}
                    />
                  </G>
                )}
              </G>
            )}
            {hasGlasses && (
              <G>
                {equipped.face === 'glasses-1' && (
                  <G>
                    <Circle cx={cx - headR * 0.4} cy={headCY} r={headR * 0.25} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={2} />
                    <Circle cx={cx + headR * 0.4} cy={headCY} r={headR * 0.25} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={2} />
                  </G>
                )}
                {equipped.face === 'glasses-2' && (
                  <G>
                    <Rect x={cx - headR * 0.6} y={headCY - headR * 0.2} width={headR * 0.4} height={headR * 0.4} stroke="#2196F3" strokeWidth={2} fill="none" />
                    <Rect x={cx + headR * 0.2} y={headCY - headR * 0.2} width={headR * 0.4} height={headR * 0.4} stroke="#2196F3" strokeWidth={2} fill="none" />
                  </G>
                )}
                {equipped.face === 'glasses-3' && (
                  <G>
                    <Circle cx={cx - headR * 0.4} cy={headCY} r={headR * 0.28} stroke="#E91E63" strokeWidth={2} fill="none" />
                    <Circle cx={cx + headR * 0.4} cy={headCY} r={headR * 0.28} stroke="#E91E63" strokeWidth={2} fill="none" />
                  </G>
                )}
              </G>
            )}
         </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
