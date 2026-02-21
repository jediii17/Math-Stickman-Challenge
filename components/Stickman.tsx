import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G, Path, Rect, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useGameState } from '@/hooks/useGameState';

interface StickmanProps {
  wrongCount: number;
  size?: number;
}

export default function Stickman({ wrongCount, size = 200 }: StickmanProps) {
  const equipped = useGameState((state) => state.equippedAccessories);
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const headRoll = useSharedValue(0);
  const headFallY = useSharedValue(0);
  const headFallX = useSharedValue(0);

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
    if (wrongCount >= 5) {
      headFallY.value = withTiming(size * 0.45, {
        duration: 900,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      headFallX.value = withTiming(size * 0.22, {
        duration: 900,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      headRoll.value = withTiming(540, {
        duration: 1200,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [wrongCount]);

  const bodyAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: scale.value },
    ],
  }));

  const headAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: headFallY.value },
      { translateX: headFallX.value },
      { rotate: `${headRoll.value}deg` },
    ],
  }));

  // ── Layout constants ──
  const cx = size / 2;
  const groundY = size * 0.92;
  const headCY = size * 0.22;
  const headR = size * 0.1;
  const bodyTop = headCY + headR;
  const bodyLen = size * 0.35;
  const bodyBot = bodyTop + bodyLen;
  const legLen = size * 0.22;
  const armY = bodyTop + bodyLen * 0.2;
  const armLen = size * 0.18;
  const sw = size * 0.035; // stroke width
  const jointR = sw * 0.9;

  // Colors
  const woodDark = '#5D4037';
  const woodLight = '#8D6E63';
  const bodyCol = '#37474F';
  const groundCol = '#81C784';
  const groundDark = '#66BB6A';
  const ropeCol = '#A1887F';
  const dismCol = Colors.error;
  const skyTop = '#E8F5E9';
  const skyBot = '#F0FFF4';

  // Visibility
  const showLL = wrongCount < 1;
  const showRL = wrongCount < 2;
  const showLA = wrongCount < 3;
  const showRA = wrongCount < 4;
  const showHead = wrongCount < 5;

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

  // ── Accessory renderers ──
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
    
    return null;
  };

  const renderGlasses = () => {
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
    
    return null;
  };

  const renderClothes = () => {
    if (!hasClothes) return null;
    
    if (equipped.clothes === 'shirt-1') {
      const capeWidth = bodyLen * 0.7;
      return (
        <G>
          <Path
            d={`M${cx - armLen * 0.15},${armY - sw}
                L${cx - armLen * 0.8},${bodyBot + legLen * 0.3}
                Q${cx},${bodyBot + legLen * 0.45} ${cx + armLen * 0.8},${bodyBot + legLen * 0.3}
                L${cx + armLen * 0.15},${armY - sw} Z`}
            fill="rgba(231, 76, 60, 0.25)"
            stroke={Colors.error}
            strokeWidth={1.2}
          />
          <Circle cx={cx} cy={bodyTop + sw} r={sw * 1.2} fill={Colors.secondary} stroke={Colors.secondaryDark} strokeWidth={1} />
        </G>
      );
    }
    
    if (equipped.clothes === 'shirt-2') {
      const tWidth = 14;
      const armSleeveLen = 20;
      return (
        <G>
          {/* T-Shirt */}
          <Path
             d={`M${cx - tWidth},${armY - 5}
                 L${cx - armSleeveLen},${armY + 5}
                 L${cx - tWidth + 2},${armY + 12}
                 L${cx - tWidth},${bodyBot - 5}
                 L${cx + tWidth},${bodyBot - 5}
                 L${cx + tWidth - 2},${armY + 12}
                 L${cx + armSleeveLen},${armY + 5}
                 L${cx + tWidth},${armY - 5} Z`}
             fill="#4CAF50"
             stroke="#388E3C"
             strokeWidth={1}
          />
          {/* Pants */}
          <Path
             d={`M${cx - tWidth},${bodyBot - 5}
                 L${cx - tWidth - 5},${llEndY - 10}
                 L${cx - 2},${llEndY - 10}
                 L${cx},${bodyBot + 5}
                 L${cx + 2},${rlEndY - 10}
                 L${cx + tWidth + 5},${rlEndY - 10}
                 L${cx + tWidth},${bodyBot - 5} Z`}
             fill="#1976D2"
             stroke="#0D47A1"
             strokeWidth={1}
          />
        </G>
      );
    }

    if (equipped.clothes === 'shirt-3') {
      const dressWidth = bodyLen * 0.6;
      return (
        <G>
          <Path
            d={`M${cx - 10},${armY - 5}
                L${cx - dressWidth},${bodyBot + 10}
                Q${cx},${bodyBot + 20} ${cx + dressWidth},${bodyBot + 10}
                L${cx + 10},${armY - 5} Z`}
            fill="#9C27B0"
            stroke="#7B1FA2"
            strokeWidth={1}
          />
          <Line x1={cx - 15} y1={bodyBot - 10} x2={cx + 15} y2={bodyBot - 10} stroke="#7B1FA2" strokeWidth={3} />
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
    return null;
  };

  // ── Fallen parts on the ground ──
  const renderFallenParts = () => {
    const parts: React.ReactNode[] = [];
    const fallY = groundY - size * 0.04;

    // Fallen left leg
    if (!showLL) {
      const fx = cx - legLen * 1.1;
      parts.push(
        <G key="fallen-ll" opacity={0.55}>
          <Line
            x1={fx}
            y1={fallY}
            x2={fx + legLen * 0.7}
            y2={fallY - size * 0.015}
            stroke={dismCol}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
          <Circle cx={fx} cy={fallY} r={jointR * 0.7} fill={dismCol} />
          {hasBoots && equipped.shoes && (
            <G transform={`translate(${fx + legLen * 0.5}, ${fallY - size * 0.025})`}>
              {renderLeftBoot(equipped.shoes, 0, 0, size * 0.06, size * 0.04)}
            </G>
          )}
        </G>
      );
    }

    // Fallen right leg
    if (!showRL) {
      const fx = cx + legLen * 0.5;
      parts.push(
        <G key="fallen-rl" opacity={0.55}>
          <Line
            x1={fx}
            y1={fallY}
            x2={fx + legLen * 0.65}
            y2={fallY + size * 0.01}
            stroke={dismCol}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
          <Circle cx={fx + legLen * 0.65} cy={fallY + size * 0.01} r={jointR * 0.7} fill={dismCol} />
          {hasBoots && equipped.shoes && (
            <G transform={`translate(${fx + legLen * 0.65 - size * 0.01}, ${fallY - size * 0.01})`}>
               {renderRightBoot(equipped.shoes, 0, 0, size * 0.06, size * 0.04)}
            </G>
          )}
        </G>
      );
    }

    // Fallen left arm
    if (!showLA) {
      const fx = size * 0.08;
      parts.push(
        <G key="fallen-la" opacity={0.55}>
          <Line
            x1={fx}
            y1={fallY}
            x2={fx + armLen * 0.6}
            y2={fallY - size * 0.02}
            stroke={dismCol}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
          <Circle cx={fx} cy={fallY} r={jointR * 0.6} fill={dismCol} />
          {hasClothes && (
            <G transform={`translate(${fx}, ${fallY})`}>
               <Rect y={-size * 0.02} width={size * 0.08} height={size * 0.025} fill={getClothesColor()} />
            </G>
          )}
          <Circle cx={fx + armLen * 0.6} cy={fallY - size * 0.02} r={jointR * 0.6} fill={dismCol} />
        </G>
      );
    }

    // Fallen right arm
    if (!showRA) {
      const fx = size * 0.75;
      parts.push(
        <G key="fallen-ra" opacity={0.55}>
          <Line
            x1={fx}
            y1={fallY}
            x2={fx + armLen * 0.55}
            y2={fallY + size * 0.01}
            stroke={dismCol}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
          />
          <Circle cx={fx} cy={fallY} r={jointR * 0.6} fill={dismCol} />
          {hasClothes && (
            <G transform={`translate(${fx}, ${fallY})`}>
               <Rect y={-size * 0.01} width={size * 0.08} height={size * 0.025} fill={getClothesColor()} />
            </G>
          )}
          <Circle cx={fx + armLen * 0.55} cy={fallY + size * 0.01} r={jointR * 0.6} fill={dismCol} />
        </G>
      );
    }

    return parts;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={bodyAnimStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={skyTop} />
              <Stop offset="1" stopColor={skyBot} />
            </LinearGradient>
            <LinearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={woodDark} />
              <Stop offset="0.5" stopColor={woodLight} />
              <Stop offset="1" stopColor={woodDark} />
            </LinearGradient>
          </Defs>

          {/* Sky background */}
          <Rect x={0} y={0} width={size} height={size} rx={16} fill="url(#skyGrad)" />

          {/* Grass ground */}
          <Rect
            x={0}
            y={groundY - size * 0.02}
            width={size}
            height={size * 0.1 + size * 0.02}
            rx={0}
            fill={groundCol}
          />
          {/* Grass tufts */}
          <Path
            d={`M${size * 0.05},${groundY} Q${size * 0.08},${groundY - size * 0.03} ${size * 0.11},${groundY}
               M${size * 0.3},${groundY} Q${size * 0.33},${groundY - size * 0.025} ${size * 0.36},${groundY}
               M${size * 0.6},${groundY} Q${size * 0.63},${groundY - size * 0.03} ${size * 0.66},${groundY}
               M${size * 0.82},${groundY} Q${size * 0.85},${groundY - size * 0.02} ${size * 0.88},${groundY}`}
            stroke={groundDark}
            strokeWidth={1.5}
            fill="none"
          />

          {/* ── Gallows ── */}
          {/* Base beam */}
          <Line
            x1={size * 0.1}
            y1={groundY}
            x2={size * 0.55}
            y2={groundY}
            stroke="url(#woodGrad)"
            strokeWidth={sw * 1.8}
            strokeLinecap="round"
          />
          {/* Vertical beam */}
          <Line
            x1={size * 0.22}
            y1={groundY}
            x2={size * 0.22}
            y2={size * 0.06}
            stroke="url(#woodGrad)"
            strokeWidth={sw * 1.6}
            strokeLinecap="round"
          />
          {/* Top beam */}
          <Line
            x1={size * 0.22}
            y1={size * 0.06}
            x2={cx + sw}
            y2={size * 0.06}
            stroke="url(#woodGrad)"
            strokeWidth={sw * 1.6}
            strokeLinecap="round"
          />
          {/* Diagonal support brace */}
          <Line
            x1={size * 0.22}
            y1={size * 0.18}
            x2={size * 0.34}
            y2={size * 0.06}
            stroke={woodDark}
            strokeWidth={sw * 0.9}
            strokeLinecap="round"
          />
          {/* Rope */}
          <Line
            x1={cx}
            y1={size * 0.06}
            x2={cx}
            y2={headCY - headR - size * 0.015}
            stroke={ropeCol}
            strokeWidth={sw * 0.7}
            strokeLinecap="round"
          />
          {/* Noose loop */}
          <Circle
            cx={cx}
            cy={headCY - headR - size * 0.008}
            r={sw * 0.9}
            fill="none"
            stroke={ropeCol}
            strokeWidth={sw * 0.6}
          />

          {/* ── Cape (behind body) ── */}
          {renderClothes()}

          {/* ── Body trunk ── */}
          <Line
            x1={cx}
            y1={bodyTop}
            x2={cx}
            y2={bodyBot}
            stroke={bodyCol}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          {/* Shoulder joint */}
          <Circle cx={cx} cy={armY} r={jointR} fill={bodyCol} />
          {/* Hip joint */}
          <Circle cx={cx} cy={bodyBot} r={jointR} fill={bodyCol} />

          {/* ── Left Leg ── */}
          {showLL ? (
            <G>
              <Line
                x1={cx}
                y1={bodyBot}
                x2={llEndX}
                y2={llEndY}
                stroke={bodyCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              {/* Knee */}
              <Circle
                cx={(cx + llEndX) / 2}
                cy={(bodyBot + llEndY) / 2}
                r={jointR * 0.7}
                fill={bodyCol}
              />
              {/* Foot circle */}
              <Circle cx={llEndX} cy={llEndY} r={jointR * 0.8} fill={bodyCol} />
              {equipped.shoes && renderLeftBoot(equipped.shoes, llEndX, llEndY, size * 0.06, size * 0.04)}
            </G>
          ) : (
            <G>
              {/* Stump */}
              <Line
                x1={cx}
                y1={bodyBot}
                x2={cx - legLen * 0.15}
                y2={bodyBot + legLen * 0.12}
                stroke={dismCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              {/* Blood marks */}
              <Circle cx={cx - legLen * 0.15} cy={bodyBot + legLen * 0.12} r={jointR * 0.5} fill={dismCol} />
              <Line
                x1={cx - legLen * 0.15 - 2}
                y1={bodyBot + legLen * 0.15}
                x2={cx - legLen * 0.15 + 3}
                y2={bodyBot + legLen * 0.2}
                stroke={dismCol}
                strokeWidth={sw * 0.4}
                strokeLinecap="round"
              />
            </G>
          )}

          {/* ── Right Leg ── */}
          {showRL ? (
            <G>
              <Line
                x1={cx}
                y1={bodyBot}
                x2={rlEndX}
                y2={rlEndY}
                stroke={bodyCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              <Circle
                cx={(cx + rlEndX) / 2}
                cy={(bodyBot + rlEndY) / 2}
                r={jointR * 0.7}
                fill={bodyCol}
              />
              <Circle cx={rlEndX} cy={rlEndY} r={jointR * 0.8} fill={bodyCol} />
              {equipped.shoes && renderRightBoot(equipped.shoes, rlEndX, rlEndY, size * 0.06, size * 0.04)}
            </G>
          ) : (
            <G>
              <Line
                x1={cx}
                y1={bodyBot}
                x2={cx + legLen * 0.15}
                y2={bodyBot + legLen * 0.12}
                stroke={dismCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              <Circle cx={cx + legLen * 0.15} cy={bodyBot + legLen * 0.12} r={jointR * 0.5} fill={dismCol} />
              <Line
                x1={cx + legLen * 0.15 - 3}
                y1={bodyBot + legLen * 0.15}
                x2={cx + legLen * 0.15 + 2}
                y2={bodyBot + legLen * 0.2}
                stroke={dismCol}
                strokeWidth={sw * 0.4}
                strokeLinecap="round"
              />
            </G>
          )}

          {/* ── Left Arm ── */}
          {showLA ? (
            <G>
              <Line
                x1={cx}
                y1={armY}
                x2={laEndX}
                y2={laEndY}
                stroke={bodyCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              {/* Elbow */}
              <Circle
                cx={(cx + laEndX) / 2}
                cy={(armY + laEndY) / 2}
                r={jointR * 0.6}
                fill={bodyCol}
              />
              {/* Hand */}
              <Circle cx={laEndX} cy={laEndY} r={jointR * 0.8} fill={bodyCol} />
            </G>
          ) : (
            <G>
              <Line
                x1={cx}
                y1={armY}
                x2={cx - armLen * 0.18}
                y2={armY + armLen * 0.09}
                stroke={dismCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              <Circle cx={cx - armLen * 0.18} cy={armY + armLen * 0.09} r={jointR * 0.5} fill={dismCol} />
            </G>
          )}

          {/* ── Right Arm ── */}
          {showRA ? (
            <G>
              <Line
                x1={cx}
                y1={armY}
                x2={raEndX}
                y2={raEndY}
                stroke={bodyCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              <Circle
                cx={(cx + raEndX) / 2}
                cy={(armY + raEndY) / 2}
                r={jointR * 0.6}
                fill={bodyCol}
              />
              <Circle cx={raEndX} cy={raEndY} r={jointR * 0.8} fill={bodyCol} />
            </G>
          ) : (
            <G>
              <Line
                x1={cx}
                y1={armY}
                x2={cx + armLen * 0.18}
                y2={armY + armLen * 0.09}
                stroke={dismCol}
                strokeWidth={sw}
                strokeLinecap="round"
              />
              <Circle cx={cx + armLen * 0.18} cy={armY + armLen * 0.09} r={jointR * 0.5} fill={dismCol} />
            </G>
          )}

          {/* ── Head ── (accessories coupled — hat & glasses only show with head) */}
          {showHead && (
            <G>
              {/* Head circle */}
              <Circle
                cx={cx}
                cy={headCY}
                r={headR}
                stroke={bodyCol}
                strokeWidth={sw}
                fill={skyBot}
              />
              {/* Eyes */}
              <Circle cx={cx - headR * 0.3} cy={headCY - headR * 0.08} r={headR * 0.09} fill={bodyCol} />
              <Circle cx={cx + headR * 0.3} cy={headCY - headR * 0.08} r={headR * 0.09} fill={bodyCol} />
              {/* Eye shine */}
              <Circle cx={cx - headR * 0.25} cy={headCY - headR * 0.13} r={headR * 0.03} fill="#fff" />
              <Circle cx={cx + headR * 0.35} cy={headCY - headR * 0.13} r={headR * 0.03} fill="#fff" />
              {/* Mouth — changes with wrongCount */}
              {wrongCount === 0 ? (
                // Happy smile
                <Path
                  d={`M${cx - headR * 0.25},${headCY + headR * 0.3}
                      Q${cx},${headCY + headR * 0.55} ${cx + headR * 0.25},${headCY + headR * 0.3}`}
                  stroke={bodyCol}
                  strokeWidth={sw * 0.5}
                  fill="none"
                  strokeLinecap="round"
                />
              ) : wrongCount <= 2 ? (
                // Neutral mouth
                <Line
                  x1={cx - headR * 0.2}
                  y1={headCY + headR * 0.35}
                  x2={cx + headR * 0.2}
                  y2={headCY + headR * 0.35}
                  stroke={bodyCol}
                  strokeWidth={sw * 0.5}
                  strokeLinecap="round"
                />
              ) : (
                // Worried frown
                <Path
                  d={`M${cx - headR * 0.25},${headCY + headR * 0.45}
                      Q${cx},${headCY + headR * 0.25} ${cx + headR * 0.25},${headCY + headR * 0.45}`}
                  stroke={bodyCol}
                  strokeWidth={sw * 0.5}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {/* Accessories — coupled to head */}
              {renderHat()}
              {renderGlasses()}
            </G>
          )}

          {/* ── Fallen parts on ground ── */}
          {renderFallenParts()}
        </Svg>
      </Animated.View>

      {/* ── Rolling head (wrongCount >= 5) ── includes hat & glasses */}
      {wrongCount >= 5 && (
        <Animated.View style={[styles.rollingHead, headAnimStyle, { left: cx - headR, top: headCY - headR }]}>
          <Svg width={headR * 2} height={headR * 2} viewBox={`0 0 ${headR * 2} ${headR * 2}`}>
            {/* Head */}
            <Circle
              cx={headR}
              cy={headR}
              r={headR * 0.9}
              stroke={dismCol}
              strokeWidth={sw}
              fill={skyBot}
            />
            {/* X eyes */}
            <Line
              x1={headR - headR * 0.35}
              y1={headR - headR * 0.2}
              x2={headR - headR * 0.05}
              y2={headR + headR * 0.1}
              stroke={dismCol}
              strokeWidth={sw * 0.6}
              strokeLinecap="round"
            />
            <Line
              x1={headR - headR * 0.05}
              y1={headR - headR * 0.2}
              x2={headR - headR * 0.35}
              y2={headR + headR * 0.1}
              stroke={dismCol}
              strokeWidth={sw * 0.6}
              strokeLinecap="round"
            />
            <Line
              x1={headR + headR * 0.05}
              y1={headR - headR * 0.2}
              x2={headR + headR * 0.35}
              y2={headR + headR * 0.1}
              stroke={dismCol}
              strokeWidth={sw * 0.6}
              strokeLinecap="round"
            />
            <Line
              x1={headR + headR * 0.35}
              y1={headR - headR * 0.2}
              x2={headR + headR * 0.05}
              y2={headR + headR * 0.1}
              stroke={dismCol}
              strokeWidth={sw * 0.6}
              strokeLinecap="round"
            />
            {/* Dead mouth */}
            <Line
              x1={headR - headR * 0.3}
              y1={headR + headR * 0.45}
              x2={headR + headR * 0.3}
              y2={headR + headR * 0.45}
              stroke={dismCol}
              strokeWidth={sw * 0.6}
              strokeLinecap="round"
            />
            {/* Hat on rolling head */}
            {hasHat && (
              <Path
                d={`M${headR - headR * 0.9},${headR * 0.25}
                    Q${headR},${-headR * 0.5} ${headR + headR * 0.9},${headR * 0.25}`}
                fill={Colors.primary}
                stroke={Colors.primaryDark}
                strokeWidth={1}
              />
            )}
            {/* Glasses on rolling head */}
            {hasGlasses && (
              <G>
                <Circle
                  cx={headR - headR * 0.3}
                  cy={headR - headR * 0.05}
                  r={headR * 0.2}
                  fill="rgba(54, 69, 79, 0.15)"
                  stroke={bodyCol}
                  strokeWidth={1}
                />
                <Circle
                  cx={headR + headR * 0.3}
                  cy={headR - headR * 0.05}
                  r={headR * 0.2}
                  fill="rgba(54, 69, 79, 0.15)"
                  stroke={bodyCol}
                  strokeWidth={1}
                />
                <Line
                  x1={headR - headR * 0.1}
                  y1={headR - headR * 0.05}
                  x2={headR + headR * 0.1}
                  y2={headR - headR * 0.05}
                  stroke={bodyCol}
                  strokeWidth={1}
                />
              </G>
            )}
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollingHead: {
    position: 'absolute',
  },
});
