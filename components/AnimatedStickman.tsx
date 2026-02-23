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

  const hasHat = equipped.hair === 'hat-1' || equipped.hair === 'hat-2' || equipped.hair === 'hat-3' || equipped.hair === 'hat-4' || (equipped.hair && equipped.hair.startsWith('hair-'));
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
                d={`M${cx - size * 0.05},${armY - size * 0.075} L${cx - size * 0.125},${bodyBot + size * 0.075} Q${cx},${bodyBot + size * 0.125} ${cx + size * 0.125},${bodyBot + size * 0.075} L${cx + size * 0.05},${armY - size * 0.075} Z`}
                fill="rgba(231, 76, 60, 0.4)"
                stroke={Colors.error}
                strokeWidth={sw * 0.3}
              />
            )}

            {equipped.back === 'back-2' && (
              <G>
                {/* Dual Katanas */}
                <Path d={`M${cx - size * 0.1},${armY - size * 0.125} L${cx + size * 0.1},${bodyBot + size * 0.075}`} stroke="#7F8C8D" strokeWidth={sw * 0.75} strokeLinecap="round" />
                <Path d={`M${cx + size * 0.1},${armY - size * 0.125} L${cx - size * 0.1},${bodyBot + size * 0.075}`} stroke="#7F8C8D" strokeWidth={sw * 0.75} strokeLinecap="round" />
                {/* Handles */}
                <Path d={`M${cx - size * 0.1},${armY - size * 0.125} L${cx - size * 0.075},${armY - size * 0.075}`} stroke="#2C3E50" strokeWidth={sw * 1.25} strokeLinecap="round" />
                <Path d={`M${cx + size * 0.1},${armY - size * 0.125} L${cx + size * 0.075},${armY - size * 0.075}`} stroke="#2C3E50" strokeWidth={sw * 1.25} strokeLinecap="round" />
                <Circle cx={cx - size * 0.1} cy={armY - size * 0.125} r={sw * 0.5} fill="#F1C40F" />
                <Circle cx={cx + size * 0.1} cy={armY - size * 0.125} r={sw * 0.5} fill="#F1C40F" />
              </G>
            )}

            {equipped.back === 'back-3' && (
              <G>
                {/* Backpack Main Bag */}
                <Rect x={cx - size * 0.075} y={armY - size * 0.025} width={size * 0.15} height={size * 0.19} rx={size * 0.02} fill="#8D6E63" stroke="#5D4037" strokeWidth={1} />
                <Rect x={cx - size * 0.075} y={armY + size * 0.025} width={size * 0.15} height={sw} fill="#5D4037" />
                <Rect x={cx - size * 0.075} y={armY + size * 0.1} width={size * 0.15} height={sw} fill="#5D4037" />
              </G>
            )}

            {equipped.back === 'back-4' && (
              <G>
                {/* Angel Wings */}
                <Path d={`M${cx},${armY} Q${cx - size * 0.2},${armY - size * 0.25} ${cx - size * 0.3},${armY - size * 0.05} Q${cx - size * 0.25},${armY + size * 0.1} ${cx},${armY + size * 0.05} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
                <Path d={`M${cx},${armY} Q${cx + size * 0.2},${armY - size * 0.25} ${cx + size * 0.3},${armY - size * 0.05} Q${cx + size * 0.25},${armY + size * 0.1} ${cx},${armY + size * 0.05} Z`} fill="rgba(255,255,255,0.8)" stroke="#BDC3C7" />
              </G>
            )}

            {equipped.back === 'back-5' && (
              <G>
                {/* Jetpack */}
                <Rect x={cx - size * 0.075} y={armY - size * 0.05} width={size * 0.15} height={size * 0.175} rx={2} fill="#7F8C8D" />
                <Rect x={cx - size * 0.06} y={armY + size * 0.125} width={size * 0.04} height={size * 0.06} fill="#E67E22" />
                <Rect x={cx + size * 0.02} y={armY + size * 0.125} width={size * 0.04} height={size * 0.06} fill="#E67E22" />
                <Path d={`M${cx - size * 0.06},${armY + size * 0.185} L${cx - size * 0.04},${armY + size * 0.225} L${cx - size * 0.02},${armY + size * 0.185} Z`} fill="#E74C3C" />
                <Path d={`M${cx + size * 0.02},${armY + size * 0.185} L${cx + size * 0.04},${armY + size * 0.225} L${cx + size * 0.06},${armY + size * 0.185} Z`} fill="#E74C3C" />
              </G>
            )}

            {equipped.back === 'back-6' && (
              <G>
                {/* Pink Butterfly Wings */}
                <Path d={`M${cx},${armY + size * 0.025} Q${cx - size * 0.15},${armY - size * 0.175} ${cx - size * 0.225},${armY + size * 0.025} Q${cx - size * 0.2},${armY + size * 0.15} ${cx},${armY + size * 0.125} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + size * 0.025} Q${cx - size * 0.125},${armY + size * 0.25} ${cx - size * 0.2},${armY + size * 0.175} Q${cx - size * 0.175},${armY + size * 0.1} ${cx},${armY + size * 0.125} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + size * 0.025} Q${cx + size * 0.15},${armY - size * 0.175} ${cx + size * 0.225},${armY + size * 0.025} Q${cx + size * 0.2},${armY + size * 0.15} ${cx},${armY + size * 0.125} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
                <Path d={`M${cx},${armY + size * 0.025} Q${cx + size * 0.125},${armY + size * 0.25} ${cx + size * 0.2},${armY + size * 0.175} Q${cx + size * 0.175},${armY + size * 0.1} ${cx},${armY + size * 0.125} Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
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
                 <Path d={`M${-size * 0.05},${-size * 0.15} L${size * 0.05},${-size * 0.15} L${size * 0.05},${size * 0.1} L0,${size * 0.2} L${-size * 0.05},${size * 0.1} Z`} fill={pencilWood} />
                 <Path d={`M${-size * 0.02},${size * 0.14} L${size * 0.02},${size * 0.14} L0,${size * 0.18} Z`} fill={pencilTip} />
                 <Path d={`M${-size * 0.05},${size * 0.05} L${size * 0.05},${size * 0.05} L0,${size * 0.15} Z`} fill="#F1C40F" opacity={0.5} />
                 <Path d={`M${-size * 0.05},${-size * 0.15} L${size * 0.05},${-size * 0.15} L${size * 0.05},${-size * 0.2} L${-size * 0.05},${-size * 0.2} Z`} fill={pencilBase} />
                 <Path d={`M${-size * 0.05},${-size * 0.2} L${size * 0.05},${-size * 0.2} Q${size * 0.05},${-size * 0.25} 0,${-size * 0.25} Q${-size * 0.05},${-size * 0.25} ${-size * 0.05},${-size * 0.2} Z`} fill={pencilPink} />
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
                  d={`M${cx - size * 0.06},${bodyBot}
                      L${cx + size * 0.06},${bodyBot}
                      L${cx + size * 0.125},${bodyBot + size * 0.09}
                      Q${cx},${bodyBot + size * 0.12} ${cx - size * 0.125},${bodyBot + size * 0.09} Z`}
                  fill="#F06292"
                  stroke="#D81B60"
                  strokeWidth={1}
                />
                <Path d={`M${cx - size * 0.09},${bodyBot + size * 0.06} Q${cx - size * 0.045},${bodyBot + size * 0.07} ${cx},${bodyBot + size * 0.06} Q${cx + size * 0.045},${bodyBot + size * 0.07} ${cx + size * 0.09},${bodyBot + size * 0.06}`} fill="none" stroke="#D81B60" strokeWidth={1} opacity={0.6} />
              </G>
            )}
            {equipped.lower === 'lower-1' && (
              <G>
                {/* Boy Shorts */}
                <Path
                  d={`M${cx - size * 0.06},${bodyBot}
                      L${cx + size * 0.06},${bodyBot}
                      L${cx + size * 0.07},${bodyBot + size * 0.075}
                      L${cx + size * 0.01},${bodyBot + size * 0.075}
                      L${cx},${bodyBot + size * 0.04}
                      L${cx - size * 0.01},${bodyBot + size * 0.075}
                      L${cx - size * 0.07},${bodyBot + size * 0.075} Z`}
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
                  d={`M${cx - headR * 0.75},${bodyBot}
                      L${cx - size * 0.15},${bodyBot + legLen * 0.4}
                      Q${cx},${bodyBot + legLen * 0.55} ${cx + size * 0.15},${bodyBot + legLen * 0.4}
                      L${cx + headR * 0.75},${bodyBot} Z`}
                  fill="#9C27B0"
                  stroke="#7B1FA2"
                  strokeWidth={1}
                />
                <Rect x={cx - headR * 0.75} y={bodyBot} width={headR * 1.5} height={sw * 0.5} fill="#F06292" rx={2} />
              </G>
            )}
            {equipped.lower === 'lower-3' && (
              <G>
                {/* Purple Pleated Skirt */}
                <Path
                  d={`M${cx - size * 0.065},${bodyBot}
                      L${cx + size * 0.065},${bodyBot}
                      L${cx + size * 0.115},${bodyBot + size * 0.1}
                      Q${cx},${bodyBot + size * 0.13} ${cx - size * 0.115},${bodyBot + size * 0.1} Z`}
                  fill="#673AB7"
                  stroke="#512DA8"
                  strokeWidth={1}
                />
                <Line x1={cx - size * 0.04} y1={bodyBot + size * 0.01} x2={cx - size * 0.06} y2={bodyBot + size * 0.11} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
                <Line x1={cx} y1={bodyBot + size * 0.01} x2={cx} y2={bodyBot + size * 0.12} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
                <Line x1={cx + size * 0.04} y1={bodyBot + size * 0.01} x2={cx + size * 0.06} y2={bodyBot + size * 0.11} stroke="#512DA8" strokeWidth={1} opacity={0.5} />
              </G>
            )}
            {equipped.lower === 'lower-4' && (
              <G>
                {/* Camo Shorts */}
                <Path
                  d={`M${cx - size * 0.06},${bodyBot}
                      L${cx + size * 0.06},${bodyBot}
                      L${cx + size * 0.07},${bodyBot + size * 0.09}
                      L${cx + size * 0.01},${bodyBot + size * 0.09}
                      L${cx},${bodyBot + size * 0.04}
                      L${cx - size * 0.01},${bodyBot + size * 0.09}
                      L${cx - size * 0.07},${bodyBot + size * 0.09} Z`}
                  fill="#556B2F"
                  stroke="#3D4F1F"
                  strokeWidth={sw * 0.4}
                />
                <Circle cx={cx - size * 0.03} cy={bodyBot + size * 0.03} r={size * 0.015} fill="#8B4513" opacity={0.4} />
                <Circle cx={cx + size * 0.03} cy={bodyBot + size * 0.06} r={size * 0.0125} fill="#2F4F4F" opacity={0.4} />
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
                <Path d={`M${cx - size * 0.05} ,${armY - size * 0.02} L${cx - size * 0.1} ,${armY + size * 0.03} L${cx - size * 0.075} ,${armY + size * 0.06} L${cx - size * 0.04},${armY + sw}`} fill="#4CAF50" stroke="#388E3C" />
                <Path d={`M${cx + size * 0.05} ,${armY - size * 0.02} L${cx + size * 0.1} ,${armY + size * 0.03} L${cx + size * 0.075} ,${armY + size * 0.06} L${cx + size * 0.04},${armY + sw}`} fill="#4CAF50" stroke="#388E3C" />
                {/* T-Shirt */}
                <Path
                  d={`M${cx - size * 0.05},${armY - size * 0.025}
                      L${cx - size * 0.06},${bodyBot}
                      Q${cx},${bodyBot + size * 0.025} ${cx + size * 0.06},${bodyBot}
                      L${cx + size * 0.05},${armY - size * 0.025} Z`}
                  fill="#4CAF50"
                  stroke="#388E3C"
                  strokeWidth={1}
                />
              </G>
            )}
            {equipped.upper === 'shirt-3' && (
              <G>
                {/* Long Sleeves */}
                <Path d={`M${cx - size * 0.05} ,${armY - size * 0.02} L${cx - armLen * 0.9},${armY + size * 0.025} L${cx - armLen * 0.85},${armY + size * 0.05} L${cx - size * 0.04},${armY + size * 0.04}`} fill="#9C27B0" stroke="#7B1FA2" />
                <Path d={`M${cx + size * 0.05} ,${armY - size * 0.02} L${cx + armLen * 0.9},${armY + size * 0.025} L${cx + armLen * 0.85},${armY + size * 0.05} L${cx + size * 0.04},${armY + size * 0.04}`} fill="#9C27B0" stroke="#7B1FA2" />
                <Path
                  d={`M${cx - size * 0.05},${armY - size * 0.025}
                      L${cx - size * 0.15},${bodyBot}
                      Q${cx},${bodyBot + size * 0.015} ${cx + size * 0.15},${bodyBot}
                      L${cx + size * 0.05},${armY - size * 0.025} Z`}
                  fill="#9C27B0"
                  stroke="#7B1FA2"
                  strokeWidth={1}
                />
              </G>
            )}
            {equipped.upper === 'shirt-4' && (
              <G>
                {/* Light Pink Tee */}
                <Path d={`M${cx - size * 0.05} ,${armY - size * 0.02} L${cx - size * 0.09} ,${armY + size * 0.02} L${cx - size * 0.07} ,${armY + size * 0.05} L${cx - size * 0.04},${armY + size * 0.035}`} fill="#F8BBD0" stroke="#F06292" />
                <Path d={`M${cx + size * 0.05} ,${armY - size * 0.02} L${cx + size * 0.09} ,${armY + size * 0.02} L${cx + size * 0.07} ,${armY + size * 0.05} L${cx + size * 0.04},${armY + size * 0.035}`} fill="#F8BBD0" stroke="#F06292" />
                <Path
                  d={`M${cx - size * 0.05},${armY - size * 0.025}
                      L${cx - size * 0.055},${bodyBot}
                      Q${cx},${bodyBot + size * 0.025} ${cx + size * 0.055},${bodyBot}
                      L${cx + size * 0.05},${armY - size * 0.025} Z`}
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
            <Path d={`M${cx - size * 0.05},${armY - size * 0.05} L${cx - size * 0.05},${bodyBot - size * 0.025}`} stroke="rgba(0,0,0,0.4)" strokeWidth={sw * 0.6} strokeLinecap="round" />
            <Path d={`M${cx + size * 0.05},${armY - size * 0.05} L${cx + size * 0.05},${bodyBot - size * 0.025}`} stroke="rgba(0,0,0,0.4)" strokeWidth={sw * 0.6} strokeLinecap="round" />
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
                {/* --- New Hair Styles --- */}
                {equipped.hair === 'hair-b1' && (
                  <G>
                    <Path d={`M${cx - headR * 1.1},${headCY} L${cx - headR * 1.0},${headCY - headR * 0.8} L${cx - headR * 0.6},${headCY - headR * 0.5} L${cx - headR * 0.2},${headCY - headR * 1.2} L${cx + headR * 0.2},${headCY - headR * 0.6} L${cx + headR * 0.8},${headCY - headR * 1.0} L${cx + headR * 1.1},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#2196F3" stroke="#1565C0" strokeLinejoin="round" />
                  </G>
                )}
                {equipped.hair === 'hair-b2' && (
                  <G>
                    <Path d={`M${cx - headR * 1.1},${headCY + headR * 0.2} Q${cx - headR * 1.1},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 1.2} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.3} ${cx},${headCY - headR * 0.1} Q${cx - headR * 0.5},${headCY - headR * 0.3} ${cx - headR * 1.1},${headCY + headR * 0.2} Z`} fill="#795548" stroke="#5D4037" />
                  </G>
                )}
                {equipped.hair === 'hair-b3' && (
                  <G>
                     <Path d={`M${cx - headR * 1.1},${headCY} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 0.3},${headCY - headR * 1.2} Q${cx + headR * 1.1},${headCY - headR * 0.5} ${cx + headR * 1.1},${headCY + headR * 0.2} Q${cx + headR * 0.5},${headCY - headR * 0.5} ${cx - headR * 1.1},${headCY} Z`} fill="#263238" stroke="#000000" />
                  </G>
                )}
                {equipped.hair === 'hair-b4' && (
                  <G>
                    <Path d={`M${cx - headR * 0.9},${headCY} L${cx - headR * 0.9},${headCY - headR * 0.9} Q${cx},${headCY - headR * 1.3} ${cx + headR * 0.9},${headCY - headR * 0.9} L${cx + headR * 0.9},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.9},${headCY} Z`} fill="#4CAF50" stroke="#388E3C" />
                    <Path d={`M${cx - headR * 0.8},${headCY - headR * 0.3} L${cx + headR * 0.8},${headCY - headR * 0.3}`} stroke="#388E3C" strokeWidth={1} strokeDasharray="2,2" />
                  </G>
                )}
                {equipped.hair === 'hair-g1' && (
                  <G>
                    <Path d={`M${cx - headR * 0.9},${headCY - headR * 0.5} Q${cx - headR * 1.8},${headCY - headR * 1.2} ${cx - headR * 2.2},${headCY} Q${cx - headR * 1.5},${headCY - headR * 0.2} ${cx - headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
                    <Path d={`M${cx + headR * 0.9},${headCY - headR * 0.5} Q${cx + headR * 1.8},${headCY - headR * 1.2} ${cx + headR * 2.2},${headCY} Q${cx + headR * 1.5},${headCY - headR * 0.2} ${cx + headR * 0.9},${headCY - headR * 0.2} Z`} fill="#F48FB1" stroke="#D81B60" />
                    <Circle cx={cx - headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
                    <Circle cx={cx + headR * 0.9} cy={headCY - headR * 0.35} r={headR * 0.2} fill="#00BCD4" />
                    <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.05},${headCY} Z`} fill="#F06292" stroke="#D81B60" />
                  </G>
                )}
                {equipped.hair === 'hair-g2' && (
                  <G>
                    <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx + headR * 1.3},${headCY + headR * 0.5} ${cx + headR * 1.0},${headCY + headR * 2.5} Q${cx + headR * 0.5},${headCY + headR * 1.5} ${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.5} ${cx - headR * 0.5},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY + headR * 1.5} ${cx - headR * 1.0},${headCY + headR * 2.5} Q${cx - headR * 1.3},${headCY + headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#AB47BC" stroke="#8E24AA" />
                  </G>
                )}
                {equipped.hair === 'hair-g3' && (
                  <G>
                     <Path d={`M${cx - headR * 1.1},${headCY + headR} L${cx - headR * 1.1},${headCY - headR * 0.5} Q${cx - headR * 1.1},${headCY - headR * 1.3} ${cx},${headCY - headR * 1.3} Q${cx + headR * 1.1},${headCY - headR * 1.3} ${cx + headR * 1.1},${headCY - headR * 0.5} L${cx + headR * 1.1},${headCY + headR} Q${cx + headR * 0.5},${headCY} ${cx},${headCY - headR * 0.3} Q${cx - headR * 0.5},${headCY} ${cx - headR * 1.1},${headCY + headR} Z`} fill="#FFD54F" stroke="#FFB300" />
                  </G>
                )}
                {equipped.hair === 'hair-g4' && (
                  <G>
                    <Path d={`M${cx},${headCY - headR * 1.0} Q${cx + headR * 1.5},${headCY - headR * 2.5} ${cx + headR * 2.0},${headCY - headR * 0.5} Q${cx + headR * 1.0},${headCY - headR * 0.5} ${cx},${headCY - headR * 0.8} Z`} fill="#EF5350" stroke="#D32F2F" />
                    <Path d={`M${cx - headR * 1.0},${headCY} Q${cx - headR * 1.0},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.0},${headCY - headR * 1.2} ${cx + headR * 1.0},${headCY} Q${cx},${headCY - headR * 0.5} ${cx - headR * 1.0},${headCY} Z`} fill="#F44336" stroke="#D32F2F" />
                    <Circle cx={cx} cy={headCY - headR * 0.9} r={headR * 0.2} fill="#FFEB3B" />
                  </G>
                )}
                {equipped.hair === 'hair-g5' && (
                  <G>
                    <Path d={`M${cx - headR * 1.05},${headCY} Q${cx - headR * 1.05},${headCY - headR * 1.2} ${cx},${headCY - headR * 1.2} Q${cx + headR * 1.05},${headCY - headR * 1.2} ${cx + headR * 1.05},${headCY} L${cx + headR * 1.05},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY + headR * 2.5} L${cx + headR * 0.5},${headCY - headR * 0.3} Q${cx},${headCY - headR * 0.6} ${cx - headR * 0.5},${headCY - headR * 0.3} L${cx - headR * 0.5},${headCY + headR * 2.5} L${cx - headR * 1.05},${headCY + headR * 2.5} Z`} fill="#212121" stroke="#000000" />
                  </G>
                )}
              </G>
            )}
            {hasGlasses && (
              <G>
                {equipped.face === 'glasses-1' && (
                  <G>
                    <Circle cx={cx - headR * 0.4} cy={headCY} r={headR * 0.25} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw * 0.6} />
                    <Circle cx={cx + headR * 0.4} cy={headCY} r={headR * 0.25} fill="rgba(54, 69, 79, 0.4)" stroke="#37474F" strokeWidth={sw * 0.6} />
                  </G>
                )}
                {equipped.face === 'glasses-2' && (
                  <G>
                    <Rect x={cx - headR * 0.6} y={headCY - headR * 0.2} width={headR * 0.4} height={headR * 0.4} stroke="#2196F3" strokeWidth={sw * 0.6} fill="none" />
                    <Rect x={cx + headR * 0.2} y={headCY - headR * 0.2} width={headR * 0.4} height={headR * 0.4} stroke="#2196F3" strokeWidth={sw * 0.6} fill="none" />
                  </G>
                )}
                {equipped.face === 'glasses-3' && (
                  <G>
                    <Circle cx={cx - headR * 0.4} cy={headCY} r={headR * 0.28} stroke="#E91E63" strokeWidth={sw * 0.6} fill="none" />
                    <Circle cx={cx + headR * 0.4} cy={headCY} r={headR * 0.28} stroke="#E91E63" strokeWidth={sw * 0.6} fill="none" />
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
