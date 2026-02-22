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
import { useGameState, AccessoryType } from '@/hooks/useGameState';

interface StickmanProps {
  wrongCount: number;
  size?: number;
  previewOverrides?: Partial<Record<AccessoryType, string | null>>;
}

export default function Stickman({ wrongCount, size = 200, previewOverrides }: StickmanProps) {
  const storeEquipped = useGameState((state) => state.equippedAccessories);
  const equipped = previewOverrides ? { ...storeEquipped, ...previewOverrides } : storeEquipped;
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
    if (equipped.back === 'shirt-1') return "rgba(231, 76, 60, 0.4)";
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
          {(hasUpper || hasLower) && (
            <G transform={`translate(${fx}, ${fallY})`}>
               <Rect y={-size * 0.01} width={size * 0.08} height={size * 0.025} fill={getClothesColor()} />
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
          {(hasUpper || hasLower) && (
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

          {/* ── Behind Clothing (Cape) ── */}
          {renderBehindClothes()}

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
              {/* Hand */}
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

          {/* ── Front Clothing (Shirt/Dress) ── */}
         {/* Front Accessories Layer */}
        {renderLower()}
        {renderUpper()}
        {renderFrontBackAccessories()}

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
