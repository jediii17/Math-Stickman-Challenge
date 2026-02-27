import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, Modal, Platform } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText, Line, TSpan, Rect, Ellipse } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  ZoomIn,
  useDerivedValue,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { runOnJS } from 'react-native-worklets';
import Colors from '@/constants/colors';
import { useGameState, getSlotForAccessory } from '@/hooks/useGameState';
import { useAuth } from '@/contexts/AuthContext';
import StickmanCoin from '@/components/StickmanCoin';

// ─── Prize Configuration ───
export interface RoulettePrize {
  id: string;
  label: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  bgColor: string;
  chance: number;
  type: 'coins' | 'powerup' | 'accessory';
  value: number;
  powerUpKey?: 'potion' | 'dust' | 'powder' | 'firefly';
  accessoryId?: string;
}

// ─── Prize Pool (for randomization every 3 days) ───
const ACCESSORY_POOL = [
  { id: 'hat-robot', label: 'Robot\nHelmet', icon: 'robot-outline', color: '#00E5FF', bgColor: '#E0F7FA' },
  { id: 'hat-1', label: 'Cool\nCap', icon: 'school-outline', color: '#2196F3', bgColor: '#E3F2FD' },
  { id: 'hat-2', label: 'Boy\nCap', icon: 'baseball-outline', color: '#FF5722', bgColor: '#FBE9E7' },
  { id: 'hat-3', label: 'Girl\nHat', icon: 'flower-outline', color: '#F06292', bgColor: '#FCE4EC' },
  { id: 'hat-4', label: 'Fairy\nCrown', icon: 'crown-outline', color: '#FFD700', bgColor: '#FFF8E1' },
];

const POWERUP_POOL = [
  { key: 'potion' as const, label: 'Balloon\nRevival Potion', icon: 'flask', color: '#E91E63', bgColor: '#FCE4EC' },
  { key: 'dust' as const, label: 'Moonlit\nMinute Dust', icon: 'hourglass', color: '#9C27B0', bgColor: '#F3E5F5' },
  { key: 'powder' as const, label: 'Aurora\nPause Powder', icon: 'snow', color: '#00BCD4', bgColor: '#E0F7FA' },
  { key: 'firefly' as const, label: 'Hinting\nFirefly', icon: 'bulb', color: '#FFC107', bgColor: '#FFFDE7' },
];

const REFRESH_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
// Fixed epoch for global 3-day cycle — same for ALL users
const WHEEL_EPOCH = new Date('2026-01-01T00:00:00Z').getTime();

// Seeded shuffle using the refresh timestamp
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generatePrizes(refreshTime: number): RoulettePrize[] {
  const shuffledAccessories = seededShuffle(ACCESSORY_POOL, refreshTime);
  const shuffledPowerups = seededShuffle(POWERUP_POOL, refreshTime + 1);
  
  const pickedAccessory = shuffledAccessories[0];
  const pickedPowerups = shuffledPowerups.slice(0, 2);

  return [
    { id: 'coins-20',  label: '20 Coins',  icon: 'gold', iconFamily: 'MaterialCommunityIcons', color: '#FFD700', bgColor: '#FFF8DC', chance: 30,   type: 'coins',     value: 20 },
    { id: 'coins-50',  label: '50 Coins',  icon: 'gold', iconFamily: 'MaterialCommunityIcons', color: '#FFD700', bgColor: '#FFFDE7', chance: 24.9, type: 'coins',     value: 50 },
    { id: 'powerup-1', label: pickedPowerups[0].label, icon: pickedPowerups[0].icon, iconFamily: 'Ionicons', color: pickedPowerups[0].color, bgColor: pickedPowerups[0].bgColor, chance: 9.9,  type: 'powerup', value: 1, powerUpKey: pickedPowerups[0].key },
    { id: 'coins-100', label: '100 Coins', icon: 'gold', iconFamily: 'MaterialCommunityIcons', color: '#FFA000', bgColor: '#FFF3E0', chance: 15,   type: 'coins',     value: 100 },
    { id: 'coins-200', label: '200 Coins', icon: 'gold', iconFamily: 'MaterialCommunityIcons', color: '#FF8F00', bgColor: '#FFF8E1', chance: 10,   type: 'coins',     value: 200 },
    { id: 'powerup-2', label: pickedPowerups[1].label, icon: pickedPowerups[1].icon, iconFamily: 'Ionicons', color: pickedPowerups[1].color, bgColor: pickedPowerups[1].bgColor, chance: 10,   type: 'powerup', value: 1, powerUpKey: pickedPowerups[1].key },
    { id: 'coins-500', label: '500 Coins', icon: 'gold', iconFamily: 'MaterialCommunityIcons', color: '#E65100', bgColor: '#FBE9E7', chance: 0.1,  type: 'coins',     value: 500 },
    { id: 'accessory', label: pickedAccessory.label, icon: pickedAccessory.icon, iconFamily: 'MaterialCommunityIcons', color: pickedAccessory.color, bgColor: pickedAccessory.bgColor, chance: 0.1,  type: 'accessory', value: 1, accessoryId: pickedAccessory.id },
  ];
}

const NUM_SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

// Equal chance — every segment has the same odds (what you see is what you get)
function pickPrize(prizes: RoulettePrize[]): number {
  return Math.floor(Math.random() * prizes.length);
}

// SVG arc path for a segment
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

interface RouletteWheelProps {
  visible: boolean;
  onClose: () => void;
}

const CoinCounter = ({ value }: { value: any }) => {
  const derivedValue = useDerivedValue(() => {
    return Math.floor(value.value).toLocaleString();
  });

  const animatedProps = useAnimatedStyle(() => ({
    // This is just a placeholder for the animated text effect if we were using a custom text component
    // But for simplicity in React Native, we might need a workaround or just use state.
    // Let's use a simple state-based counter for the text to ensure it looks perfect.
    transform: [{ scale: 1 + (value.value % 1) * 0.05 }]
  }));

  // Since Reanimated doesn't easily animate Text content directly without a custom component or worklet,
  // I will use a simple state-based implementation for the count-up effect to ensure reliability.
  return null; 
};

const CoinParticle = ({ delay }: { delay: number }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 100;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    x.value = withDelay(delay, withTiming(destX, { duration: 800, easing: Easing.out(Easing.back(1)) }));
    y.value = withDelay(delay, withTiming(destY, { duration: 800, easing: Easing.out(Easing.back(1)) }));
    scale.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 400 }),
      withDelay(200, withTiming(0, { duration: 200 }))
    ));
    opacity.value = withDelay(delay + 600, withTiming(0, { duration: 200 }));
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <StickmanCoin size={24} animated={false} />
    </Animated.View>
  );
};

const WheelPrizeIcon = ({ prize, midAngle }: { prize: RoulettePrize; midAngle: number }) => {
  if (prize.type === 'coins') {
    return (
      <G transform="translate(-15, -15)">
        {/* Simplified Stickman Coin UI */}
        <Circle cx={15} cy={15} r={14} fill="#FFD700" stroke="#fff" strokeWidth={1} />
        <Circle cx={15} cy={15} r={11} fill="none" stroke="#fff" strokeWidth={1} opacity={0.4} />
        {/* Smiling face */}
        <Path d="M11,11 Q12,10 13,11 M17,11 Q18,10 19,11" stroke="#5D4037" strokeWidth={1} fill="none" />
        <Path d="M11,17 Q15,22 19,17" stroke="#5D4037" strokeWidth={1.5} fill="none" />
        <SvgText x={15} y={15} fill="#B8860B" fontSize={8} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" opacity={0.3}>$</SvgText>
        
        {/* Amount text */}
        <SvgText 
          x={15} 
          y={36} 
          fill="#fff" 
          fontSize={10} 
          fontFamily="Fredoka_700Bold" 
          textAnchor="middle" 
          transform={`rotate(${-midAngle - 180}, 15, 36)`}
          stroke="#000"
          strokeWidth={0.5}
        >
          {prize.value}
        </SvgText>
      </G>
    );
  }

  if (prize.type === 'powerup') {
    // Dynamic colors and labels based on the actual power-up
    const powerUpKey = prize.powerUpKey || 'potion';
    const powerUpStyles: Record<string, { fill: string; label: string }> = {
      potion: { fill: '#E91E63', label: 'REVIVAL\nPOTION' },
      dust:   { fill: '#9C27B0', label: 'MINUTE\nDUST' },
      powder: { fill: '#00BCD4', label: 'PAUSE\nPOWDER' },
      firefly:{ fill: '#FFC107', label: 'HINTING\nFIREFLY' },
    };
    const style = powerUpStyles[powerUpKey];

    return (
      <G transform="translate(-15, -15)">
        {powerUpKey === 'potion' ? (
          <>
            <Path d="M10,8 L20,8 L20,12 L24,18 L24,24 L6,24 L6,18 L10,12 Z" fill={style.fill} stroke="#fff" strokeWidth={1.5} />
            <Path d="M10,8 L20,8" stroke="#fff" strokeWidth={2} />
            <Path d="M8,20 L22,20" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
          </>
        ) : powerUpKey === 'dust' ? (
          <>
            <Path d="M8,4 L22,4 L22,6 L17,15 L22,24 L22,26 L8,26 L8,24 L13,15 L8,6 Z" fill={style.fill} stroke="#fff" strokeWidth={1.5} />
            <Path d="M10,6 L20,6 L15,15 Z" fill="rgba(255,255,255,0.5)" />
            <Path d="M10,24 L20,24 L15,15 Z" fill="rgba(255,255,255,0.5)" />
          </>
        ) : powerUpKey === 'powder' ? (
          <>
            <Line x1={15} y1={5} x2={15} y2={25} stroke={style.fill} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={6} y1={10} x2={24} y2={20} stroke={style.fill} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={6} y1={20} x2={24} y2={10} stroke={style.fill} strokeWidth={2.5} strokeLinecap="round" />
            <Circle cx={15} cy={15} r={3} fill="#fff" />
          </>
        ) : (
          <>
            <Path d="M10,12 A5,5 0 1,1 20,12 C20,16 17,18 17,22 L13,22 C13,18 10,16 10,12 Z" fill={style.fill} stroke="#fff" strokeWidth={1.5} />
            <Path d="M13,22 L17,22 L17,24 L13,24 Z" fill="#E0E0E0" />
            <Path d="M14,24 L16,24 L16,26 L14,26 Z" fill="#9E9E9E" />
            <Path d="M15,14 L15,18 M13,15 L17,15" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
            <Path d="M15,0 L15,3 M25,10 L22,12 M5,10 L8,12" stroke="#FFC107" strokeWidth={1.5} strokeLinecap="round" />
          </>
        )}
        
        {/* Label */}
        <SvgText 
          x={15} 
          y={36} 
          fill="#fff" 
          fontSize={8} 
          fontFamily="Fredoka_700Bold" 
          textAnchor="middle"
          transform={`rotate(${-midAngle - 180}, 15, 36)`}
          stroke="#000"
          strokeWidth={0.5}
        >
          {style.label.split('\n').map((line, i) => (
            <TSpan key={i} x={15} dy={i === 0 ? 0 : 9}>
              {line}
            </TSpan>
          ))}
        </SvgText>
      </G>
    );
  }

  if (prize.type === 'accessory') {
    // Dynamic accessory icon based on accessoryId
    const accId = prize.accessoryId || 'hat-robot';
    const accStyles: Record<string, { fill: string; label: string }> = {
      'hat-robot': { fill: '#424242', label: 'ROBOT\nHELMET' },
      'hat-1':    { fill: '#1aca26ff', label: 'COOL\nCAP' },
      'hat-2':    { fill: '#FF5722', label: 'BOY\nCAP' },
      'hat-3':    { fill: '#F06292', label: 'GIRL\nHAT' },
      'hat-4':    { fill: '#FFD700', label: 'FAIRY\nCROWN' },
    };
    const style = accStyles[accId] || accStyles['hat-robot'];

    return (
      <G transform="translate(-18, -18)">
        {accId === 'hat-robot' ? (
          <G transform="translate(15, 15) scale(0.35)">
            <Path d={`M-15,-5 Q-15,-20 0,-20 Q15,-20 15,-5 L15,12 Q0,18 -15,12 Z`} fill="#37474F" stroke="#263238" strokeWidth={2} />
            <Path d={`M-12,-2 Q0,-5 12,-2 L10,8 Q0,10 -10,8 Z`} fill="#111" />
            <Path d={`M-8,2 L8,2`} stroke="#00E5FF" strokeWidth={3} strokeLinecap="round" />
            <Circle cx={-4} cy={2} r={3} fill="#FFF" />
            <Circle cx={4} cy={2} r={3} fill="#FFF" />
            <Line x1={0} y1={-20} x2={0} y2={-30} stroke="#90A4AE" strokeWidth={2} />
            <Circle cx={0} cy={-32} r={4} fill="#00E5FF" />
            <Rect x={-18} y={0} width={4} height={6} fill="#78909C" />
            <Rect x={14} y={0} width={4} height={6} fill="#78909C" />
          </G>
        ) : accId === 'hat-1' ? (
          <G transform="translate(15, 20) scale(0.32)">
            <Ellipse cx={0} cy={0} rx={22} ry={4} fill={style.fill} />
            <Path
              d={`M-16.5,0 Q-16.5,-16 0,-17 Q16.5,-16 16.5,0 Z`}
              fill={style.fill}
              stroke="#1976D2"
              strokeWidth={1}
            />
            <Line x1={-15} y1={-2} x2={15} y2={-2} stroke="#1976D2" strokeWidth={2} />
          </G>
        ) : accId === 'hat-2' ? (
          <G transform="translate(15, 20) scale(0.32)">
            <Path d={`M-18,0 Q-18,-18 0,-18 Q18,-18 18,0 Z`} fill="#FF5722" stroke="#E64A19" strokeWidth={1} />
            <Path d={`M-18,0 L25,0`} stroke="#E64A19" strokeWidth={3} strokeLinecap="round" />
          </G>
        ) : accId === 'hat-3' ? (
          <G transform="translate(15, 18) scale(0.32)">
            <Ellipse cx={0} cy={2} rx={26} ry={6} fill="#F06292" />
            <Path d={`M-15,0 Q-15,-20 0,-20 Q15,-20 15,0 Z`} fill="#F48FB1" stroke="#D81B60" strokeWidth={1} />
            <Line x1={-14} y1={-2} x2={14} y2={-2} stroke="#D81B60" strokeWidth={3} />
          </G>
        ) : accId === 'hat-4' ? (
          <G transform="translate(15, 15) scale(0.35)">
            <Path d="M-15,5 Q-15,-5 0,-8 Q15,-5 15,5" fill="none" stroke="#FFD700" strokeWidth={2} />
            <Path d="M-12,2 Q-6,-6 0,-12 Q6,-6 12,2" fill="none" stroke="#FFD700" strokeWidth={2} />
            <Circle cx={0} cy={-12} r={3} fill="#F06292" stroke="#D81B60" strokeWidth={0.5} />
            <Path d="M-10,-5 L-8,-7 M-8,-5 L-10,-7" stroke="#FFD700" strokeWidth={1} />
            <Line x1={10} y1={-5} x2={8} y2={-7} stroke="#FFD700" strokeWidth={1} />
          </G>
        ) : (
          <>
            <Path d="M8,22 L28,22 L30,24 L6,24 Z" fill={style.fill} stroke="#fff" strokeWidth={1} />
            <Path d="M12,22 Q12,8 18,8 Q24,8 24,22 Z" fill={style.fill} stroke="#fff" strokeWidth={1} />
          </>
        )}

        <SvgText 
          x={18} 
          y={40} 
          fill="#fff" 
          fontSize={8} 
          fontFamily="Fredoka_700Bold" 
          textAnchor="middle"
          transform={`rotate(${-midAngle - 180}, 18, 40)`}
          stroke="#000"
          strokeWidth={0.5}
        >
          {style.label}
        </SvgText>
      </G>
    );
  }

  return null;
};

export default function RouletteWheel({ visible, onClose }: RouletteWheelProps) {
  const { rouletteTickets, useRouletteTicket, addCoins, coins, coinSpinsToday, lastCoinSpinTime, incrementCoinSpins, resetCoinSpins, wheelRefreshTime } = useGameState();
  const { user, isGuest } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<RoulettePrize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState<string>('');

  // --- Global 3-day cycle (same for ALL users) ---
  // Compute which 3-day window we're in based on a fixed epoch
  const now = Date.now();
  const currentCycle = Math.floor((now - WHEEL_EPOCH) / REFRESH_MS);
  const globalRefreshTime = WHEEL_EPOCH + currentCycle * REFRESH_MS;
  const nextGlobalRefresh = globalRefreshTime + REFRESH_MS;

  // Prize seed: use force-refresh override if set (per-user), otherwise global time
  // If wheelRefreshTime is set and is AFTER the current global cycle start, use it as extra seed
  const hasForceRefresh = wheelRefreshTime && wheelRefreshTime > globalRefreshTime;
  const prizeSeed = hasForceRefresh ? wheelRefreshTime : globalRefreshTime;
  const PRIZES = generatePrizes(prizeSeed);

  // Reset force-refresh override when a new global cycle starts
  useEffect(() => {
    if (wheelRefreshTime && wheelRefreshTime <= globalRefreshTime) {
      useGameState.setState({ wheelRefreshTime: null });
    }
  }, [globalRefreshTime, wheelRefreshTime]);

  const COIN_SPIN_COST = 200;
  const COOLDOWN_MS = 30 * 60 * 1000; // 30 mins
  const MAX_COIN_SPINS = 3;

  // Handle Wheel Refresh Countdown — always counts to next global cycle
  useEffect(() => {
    const updateRefreshTimer = () => {
      const now = Date.now();
      const remaining = nextGlobalRefresh - now;

      if (remaining <= 0) {
        setRefreshCountdown('New prizes!');
      } else {
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const mins = Math.floor((remaining % (60 * 60 * 1000)) / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        
        const hStr = hours.toString().padStart(2, '0');
        const mStr = mins.toString().padStart(2, '0');
        const sStr = secs.toString().padStart(2, '0');
        
        setRefreshCountdown(`${days}d ${hStr}h ${mStr}m ${sStr}s`);
      }
    };

    updateRefreshTimer();
    const interval = setInterval(updateRefreshTimer, 1000); // update every second
    return () => clearInterval(interval);
  }, [nextGlobalRefresh]);

  // Handle Cooldown Timer
  useEffect(() => {
    const updateTimer = () => {
      if (coinSpinsToday >= MAX_COIN_SPINS && lastCoinSpinTime) {
        const now = Date.now();
        const elapsed = now - lastCoinSpinTime;
        const remaining = COOLDOWN_MS - elapsed;

        if (remaining <= 0) {
          resetCoinSpins();
          setTimeRemaining(null);
        } else {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [coinSpinsToday, lastCoinSpinTime]);

  const rotation = useSharedValue(0);
  const [visualCoins, setVisualCoins] = useState(coins);
  const wonAmountRef = useRef(0);
  const alreadyOwnedRef = useRef(false);

  // Sync visual coins when modal opens
  useEffect(() => {
    if (visible) {
      setVisualCoins(coins);
    }
  }, [visible, coins]);

  const animateCoinCount = (from: number, to: number) => {
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const step = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + (to - from) * easedProgress);
      
      setVisualCoins(current);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setVisualCoins(to);
      }
    };
    
    requestAnimationFrame(step);
  };

  const wheelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const WHEEL_SIZE = 280;
  const WHEEL_R = WHEEL_SIZE / 2;
  const CENTER = WHEEL_R;

  const handleSpin = () => {
    if (isSpinning || rouletteTickets <= 0) return;

    const used = useRouletteTicket();
    if (!used) return;

    setIsSpinning(true);
    setShowResult(false);
    setWonPrize(null);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const winIndex = pickPrize(PRIZES);
    const prize = PRIZES[winIndex];

    // Calculate the target angle so the pointer lands on the winning segment
    // Pointer is at top (0°). Segments start from 0° clockwise.
    const segmentCenter = winIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    // Add a small random offset within the segment (stay 20% away from edges)
    const pad = SEGMENT_ANGLE * 0.2;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE - pad * 2);
    // Normalize current rotation to a positive 0-360 range
    const startRotation = ((rotation.value % 360) + 360) % 360;
    // Calculate how much extra we need to rotate from current position to land on the target
    const landingOffset = (((360 - (segmentCenter + jitter)) - startRotation) % 360 + 360) % 360;
    // Add multiple full rotations for dramatic effect
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const finalAngle = rotation.value + fullSpins * 360 + landingOffset;

    rotation.value = withTiming(
      finalAngle,
      {
        duration: 4000 + Math.random() * 1000,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onSpinComplete)(prize);
        }
      }
    );
  };

  const handleCoinSpin = () => {
    if (isSpinning || coins < COIN_SPIN_COST || coinSpinsToday >= MAX_COIN_SPINS) return;

    setShowResult(false);
    setWonPrize(null);
    wonAmountRef.current = 0;

    const oldBalance = visualCoins;
    addCoins(-COIN_SPIN_COST);
    animateCoinCount(oldBalance, oldBalance - COIN_SPIN_COST);
    incrementCoinSpins();

    setIsSpinning(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const winIndex = pickPrize(PRIZES);
    const prize = PRIZES[winIndex];

    const segmentCenter = winIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const pad = SEGMENT_ANGLE * 0.2;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE - pad * 2);
    const startRotation = ((rotation.value % 360) + 360) % 360;
    const landingOffset = (((360 - (segmentCenter + jitter)) - startRotation) % 360 + 360) % 360;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const finalAngle = rotation.value + fullSpins * 360 + landingOffset;

    rotation.value = withTiming(
      finalAngle,
      {
        duration: 4000 + Math.random() * 1000,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onSpinComplete)(prize);
        }
      }
    );
  };

  const onSpinComplete = (prize: RoulettePrize) => {
    setIsSpinning(false);
    setWonPrize(prize);
    setShowResult(true);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const state = useGameState.getState();
    let awardAmount = 0;
    
    switch (prize.type) {
      case 'coins':
        awardAmount = prize.value;
        state.addCoins(prize.value);
        if (!isGuest && user) {
          const newCoins = useGameState.getState().coins;
          import('@/lib/db').then((db) => db.updateCoins(user.id, newCoins));
        }
        break;
      case 'powerup':
        if (prize.powerUpKey) {
          const newPowerUps = { ...state.powerUps, [prize.powerUpKey]: state.powerUps[prize.powerUpKey] + 1 };
          useGameState.setState({ powerUps: newPowerUps });
          if (!isGuest && user) {
            import('@/lib/db').then((db) => db.updateUserPowerUps(user.id, newPowerUps));
          }
        }
        break;
      case 'accessory':
        alreadyOwnedRef.current = false;
        if (prize.accessoryId) {
          const alreadyOwned = state.ownedAccessories.includes(prize.accessoryId);
          if (!alreadyOwned) {
            // New accessory — award it
            useGameState.setState({
              ownedAccessories: [...state.ownedAccessories, prize.accessoryId],
            });
            if (!isGuest && user) {
              import('@/lib/db').then((db) => db.addAccessory(user.id, prize.accessoryId!));
            }
          } else {
            alreadyOwnedRef.current = true;
            awardAmount = 1000;
            state.addCoins(1000);
            if (!isGuest && user) {
              const newCoins = useGameState.getState().coins;
              import('@/lib/db').then((db) => db.updateCoins(user.id, newCoins));
            }
          }
        }
        break;
    }
    wonAmountRef.current = awardAmount;
  };

  const handleClaim = () => {
    setShowResult(false);
    if (wonAmountRef.current > 0) {
      // Trigger the counting animation
      animateCoinCount(visualCoins, visualCoins + wonAmountRef.current);
      wonAmountRef.current = 0;
    }
  };

  const segmentColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
    '#FF9FF3', '#54A0FF', '#5CD85C', '#FFA502',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />

        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="ferris-wheel" size={26} color="#FF4081" />
              <Text style={styles.title}>Lucky Spin!</Text>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.headerCoinDisplay}>
                <StickmanCoin size={20} animated={false} />
                <Text style={styles.headerCoinText}>{visualCoins.toLocaleString()}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn} disabled={isSpinning}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </Pressable>
            </View>
          </View>

          {/* Ticket Count */}
          <View style={styles.ticketBar}>
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color="#FF4081" />
            <Text style={styles.ticketCount}>
              {rouletteTickets} Stickman Ticket{rouletteTickets !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Refresh Prize Pool — purchasable */}
          {refreshCountdown ? (
            <Pressable
              onPress={() => {
                const REFRESH_COST = 5000;
                if (coins < REFRESH_COST || isSpinning) return;
                const oldBal = visualCoins;
                addCoins(-REFRESH_COST);
                animateCoinCount(oldBal, oldBal - REFRESH_COST);
                if (!isGuest && user) {
                  const newCoins = useGameState.getState().coins;
                  import('@/lib/db').then((db) => db.updateCoins(user.id, newCoins));
                }
                // Force refresh the wheel (per-user override seed)
                useGameState.setState({ wheelRefreshTime: Date.now() });
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
              disabled={coins < 5000 || isSpinning}
              style={({ pressed }) => [
                styles.refreshBar,
                coins < 5000 && { opacity: 0.4 },
                pressed && coins >= 5000 && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="refresh-outline" size={16} color="#7C4DFF" />
              <Text style={styles.refreshText}>Refresh Prizes ({refreshCountdown})</Text>
              <StickmanCoin size={14} animated={false} />
              <Text style={[styles.refreshText, { fontFamily: 'Fredoka_700Bold' }]}>5,000</Text>
            </Pressable>
          ) : null}

          {/* Wheel */}
          <View style={styles.wheelContainer}>
            {/* Pointer */}
            <View style={styles.pointer}>
              <Ionicons name="caret-down" size={32} color="#FF4081" />
            </View>

            <Animated.View style={[styles.wheelWrapper, wheelAnimStyle]}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                {PRIZES.map((prize: RoulettePrize, i: number) => {
                  const startAngle = i * SEGMENT_ANGLE;
                  const endAngle = startAngle + SEGMENT_ANGLE;
                  const midAngle = startAngle + SEGMENT_ANGLE / 2;
                  const iconPos = polarToCartesian(CENTER, CENTER, WHEEL_R * 0.6, midAngle);

                  return (
                    <G key={prize.id}>
                      <Path
                        d={describeArc(CENTER, CENTER, WHEEL_R - 2, startAngle, endAngle)}
                        fill={segmentColors[i % segmentColors.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                      
                      {/* Visual Icon for segment */}
                      <G transform={`translate(${iconPos.x}, ${iconPos.y}) rotate(${midAngle + 180})`}>
                        <WheelPrizeIcon prize={prize} midAngle={midAngle} />
                      </G>
                    </G>
                  );
                })}
                {/* Center circle */}
                <Circle cx={CENTER} cy={CENTER} r={28} fill="#fff" stroke="#FF4081" strokeWidth={3} />
                <SvgText
                  x={CENTER}
                  y={CENTER + 1}
                  fill="#FF4081"
                  fontSize={11}
                  fontFamily="Fredoka_700Bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  SPIN
                </SvgText>
              </Svg>
            </Animated.View>
          </View>

          {/* Spin Button */}
          <Pressable
            onPress={handleSpin}
            disabled={isSpinning || rouletteTickets <= 0}
            style={({ pressed }) => [
              styles.spinBtn,
              (isSpinning || rouletteTickets <= 0) && styles.spinBtnDisabled,
              pressed && !isSpinning && rouletteTickets > 0 && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={20}
              color="#fff"
            />
            <Text style={styles.spinBtnText}>
              {isSpinning ? 'Spinning...' : rouletteTickets > 0 ? 'Use 1 Ticket' : 'No Tickets'}
            </Text>
          </Pressable>

          {/* Coin Spin Button */}
          <Pressable
            onPress={handleCoinSpin}
            disabled={isSpinning || coins < COIN_SPIN_COST || !!timeRemaining}
            style={({ pressed }) => [
              styles.coinSpinBtn,
              (isSpinning || coins < COIN_SPIN_COST || !!timeRemaining) && styles.spinBtnDisabled,
              pressed && !isSpinning && coins >= COIN_SPIN_COST && !timeRemaining && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <StickmanCoin size={20} />
            <Text style={styles.spinBtnText}>
              {timeRemaining ? `Wait ${timeRemaining}` : `Use ${COIN_SPIN_COST} Coins`}
            </Text>
          </Pressable>
          
          {timeRemaining && (
            <Pressable
              onPress={() => {
                const RESET_COST = 2000;
                if (coins < RESET_COST) return;
                const oldBal = visualCoins;
                addCoins(-RESET_COST);
                animateCoinCount(oldBal, oldBal - RESET_COST);
                if (!isGuest && user) {
                  const newCoins = useGameState.getState().coins;
                  import('@/lib/db').then((db) => db.updateCoins(user.id, newCoins));
                }
                resetCoinSpins();
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              disabled={coins < 2000}
              style={({ pressed }) => [
                styles.resetCooldownBtn,
                coins < 2000 && { opacity: 0.4 },
                pressed && coins >= 2000 && { opacity: 0.7 }
              ]}
            >
              <StickmanCoin size={16} animated={false} />
              <Text style={styles.resetCooldownText}>Reset Cooldown (2,000)</Text>
            </Pressable>
          )}
          
          {coinSpinsToday > 0 && !timeRemaining && (
            <Text style={styles.spinsRemainingText}>
              {MAX_COIN_SPINS - coinSpinsToday} coin spins remaining
            </Text>
          )}

          <Text style={styles.hintText}>
            Earn tickets by completing Classic Mode levels! 🎮
          </Text>
        </Animated.View>

        {/* Prize Result Modal */}
        {showResult && wonPrize && (
          <Animated.View entering={ZoomIn.duration(400).springify()} style={styles.resultOverlay}>
            <View style={styles.resultCard}>
              {/* Coin Burst Animation */}
              {wonPrize.type === 'coins' && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <View style={styles.particleContainer}>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <CoinParticle key={i} delay={i * 30} />
                    ))}
                  </View>
                </View>
              )}

              <Text style={styles.resultTitle}>🎉 You Won!</Text>
              <View style={[styles.resultIconBg, { backgroundColor: wonPrize.bgColor }]}>
                {wonPrize.type === 'coins' ? (
                  <StickmanCoin size={60} />
                ) : wonPrize.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={wonPrize.icon as any} size={48} color={wonPrize.color} />
                ) : (
                  <Ionicons name={wonPrize.icon as any} size={48} color={wonPrize.color} />
                )}

                {/* Animated +1 badge for power-ups */}
                {wonPrize.type === 'powerup' && (
                  <Animated.View
                    entering={ZoomIn.delay(300).duration(400).springify()}
                    style={styles.plusOneBadge}
                  >
                    <Text style={styles.plusOneText}>+1</Text>
                  </Animated.View>
                )}
              </View>
              <Text style={styles.resultPrize}>{wonPrize.label.replace('\n', ' ')}</Text>

              {/* Power-up count display */}
              {wonPrize.type === 'powerup' && wonPrize.powerUpKey && (
                <Animated.View
                  entering={FadeInDown.delay(500).duration(400)}
                  style={styles.potionCountRow}
                >
                  <MaterialCommunityIcons name={wonPrize.icon as any} size={20} color={wonPrize.color} />
                  <Text style={[styles.potionCountText, { color: wonPrize.color }]}>
                    You now have {useGameState.getState().powerUps[wonPrize.powerUpKey]}!
                  </Text>
                </Animated.View>
              )}

              {wonPrize.type === 'accessory' && alreadyOwnedRef.current && (
                <Text style={styles.resultNote}>Already owned — got 1,000 coins instead!</Text>
              )}
              <Pressable
                style={styles.resultClaimBtn}
                onPress={handleClaim}
              >
                <Text style={styles.resultClaimText}>Awesome!</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '90%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCoinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  headerCoinText: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: '#FF8F00',
    minWidth: 40,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  ticketBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  ticketCount: {
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#FF4081',
  },
  wheelContainer: {
    width: 290,
    height: 290,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pointer: {
    position: 'absolute',
    top: -8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wheelWrapper: {
    width: 280,
    height: 280,
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4081',
    width: '80%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  coinSpinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFC107',
    width: '80%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  spinBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  spinBtnText: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  spinsRemainingText: {
    fontSize: 12,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#FFA000',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    marginBottom: 16,
  },
  resultIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultPrize: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultNote: {
    fontSize: 12,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultClaimBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 22,
    marginTop: 8,
  },
  resultClaimText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  particleContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    zIndex: 100,
  },
  refreshBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#EDE7F6',
    borderRadius: 10,
    marginBottom: 4,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: 'Fredoka_400Regular',
    color: '#7C4DFF',
  },
  resetCooldownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD54F',
    marginBottom: 8,
  },
  resetCooldownText: {
    fontSize: 12,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#FF8F00',
  },
  plusOneBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  plusOneText: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  potionCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 4,
  },
  potionCountText: {
    fontSize: 14,
    fontFamily: 'Fredoka_600SemiBold',
  },
});
