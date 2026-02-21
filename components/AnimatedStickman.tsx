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
}

export default function AnimatedStickman({ size = 200 }: AnimatedStickmanProps) {
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

  const hasHat = equipped.hair === 'hat-1' || equipped.hair === 'hat-2' || equipped.hair === 'hat-3';
  const hasGlasses = equipped.face === 'glasses-1' || equipped.face === 'glasses-2' || equipped.face === 'glasses-3';
  const hasClothes = equipped.clothes === 'shirt-1' || equipped.clothes === 'shirt-2' || equipped.clothes === 'shirt-3';
  const hasBoots = equipped.shoes === 'shoes-1' || equipped.shoes === 'shoes-2' || equipped.shoes === 'shoes-3';

  const getClothesColor = () => {
    if (equipped.clothes === 'shirt-1') return "rgba(231, 76, 60, 0.4)";
    if (equipped.clothes === 'shirt-2') return "#4CAF50";
    if (equipped.clothes === 'shirt-3') return "#9C27B0";
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
      {/* Shadow */}
      <Ellipse cx={cx} cy={size * 0.95} rx={size * 0.3} ry={size * 0.05} fill="rgba(0,0,0,0.15)" />
      
      {/* Main SVG */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Left Arm (Static/waving) */}
        <Path
          d={`M${cx},${armY} Q${cx - armLen * 0.8},${armY - armLen * 0.5} ${cx - armLen * 1.2},${armY - armLen * 0.2}`}
          stroke={bodyCol}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Arm (Animated, holding pencil) */}
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
                 {/* Body */}
                 <Path d="M-10,-30 L10,-30 L10,20 L0,40 L-10,20 Z" fill={pencilWood} />
                 {/* Tip */}
                 <Path d="M-4,28 L4,28 L0,36 Z" fill={pencilTip} />
                 {/* Wood trim */}
                 <Path d="M-10,10 L10,10 L0,30 Z" fill="#F1C40F" opacity={0.5} />
                 {/* Eraser holder */}
                 <Path d="M-10,-30 L10,-30 L10,-40 L-10,-40 Z" fill={pencilBase} />
                 {/* Eraser */}
                 <Path d="M-10,-40 L10,-40 Q10,-50 0,-50 Q-10,-50 -10,-40 Z" fill={pencilPink} />
              </G>
           </Svg>
        </Animated.View>

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

        {hasClothes && (
          <Path
             d={`M${cx - size * 0.05},${armY - 5}
                 L${cx - size * 0.12},${bodyBot + 5}
                 Q${cx},${bodyBot + 12} ${cx + size * 0.12},${bodyBot + 5}
                 L${cx + size * 0.05},${armY - 5} Z`}
             fill={getClothesColor()}
             stroke={equipped.clothes === 'shirt-2' ? '#388E3C' : equipped.clothes === 'shirt-3' ? '#7B1FA2' : Colors.error}
             strokeWidth={1}
          />
        )}

        {/* Head and features (Animated) */}
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

      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
