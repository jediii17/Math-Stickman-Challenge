import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useGameState } from '@/hooks/useGameState';
import AnimatedStickman from '@/components/AnimatedStickman';
import { getClassicDifficulty } from '@/lib/math-engine';

const { width, height: screenHeight } = Dimensions.get('window');

// Configuration
const EXTRA_LOCKED_LEVELS = 3; // show a few locked levels ahead
const NODE_SIZE = 60;
const LEVEL_SPACING = 110; // vertical gap between levels
const MAP_PADDING_BOTTOM = 120;
const MAP_PADDING_TOP = 80;

// --- Seasonal Configuration ---
const SEASONS = [
  {
    name: 'Spring',
    colors: ['#DCEDC8', '#A5D6A7', '#81C784'] as const,
    icon: 'flower-outline', // Ionicons
    decorations: [
      { family: 'MaterialCommunityIcons', name: 'flower-tulip', color: 'rgba(233, 30, 99, 0.4)' },
      { family: 'MaterialCommunityIcons', name: 'pine-tree', color: 'rgba(56, 142, 60, 0.3)' },
      { family: 'MaterialCommunityIcons', name: 'butterfly', color: 'rgba(156, 39, 176, 0.3)' },
      { family: 'MaterialCommunityIcons', name: 'flower', color: 'rgba(255, 235, 59, 0.5)' },
    ],
  },
  {
    name: 'Summer',
    colors: ['#B3E5FC', '#81D4FA', '#4FC3F7'] as const,
    icon: 'sunny-outline', // Ionicons
    decorations: [
      { family: 'MaterialCommunityIcons', name: 'palm-tree', color: 'rgba(46, 125, 50, 0.4)' },
      { family: 'MaterialCommunityIcons', name: 'white-balance-sunny', color: 'rgba(255, 193, 7, 0.4)' },
      { family: 'MaterialCommunityIcons', name: 'weather-cloudy', color: 'rgba(255, 255, 255, 0.5)' },
    ],
  },
  {
    name: 'Autumn',
    colors: ['#FFE0B2', '#FFB74D', '#FFA726'] as const,
    icon: 'leaf-outline', // Ionicons
    decorations: [
      { family: 'MaterialCommunityIcons', name: 'leaf-maple', color: 'rgba(216, 67, 21, 0.4)' },
      { family: 'MaterialCommunityIcons', name: 'pine-tree', color: 'rgba(191, 54, 12, 0.3)' },
      { family: 'MaterialCommunityIcons', name: 'mushroom-outline', color: 'rgba(121, 85, 72, 0.4)' },
    ],
  },
  {
    name: 'Winter',
    colors: ['#E1F5FE', '#B3E5FC', '#E8EAF6'] as const,
    icon: 'snow-outline', // Ionicons
    decorations: [
      { family: 'MaterialCommunityIcons', name: 'snowflake', color: 'rgba(255, 255, 255, 0.7)' },
      { family: 'MaterialCommunityIcons', name: 'pine-tree', color: 'rgba(144, 164, 174, 0.4)' },
      { family: 'MaterialCommunityIcons', name: 'snowman', color: 'rgba(255, 255, 255, 0.6)' },
    ],
  }
];

// Pseudo-random generator for consistent decoration placement
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

interface LevelNodeProps {
  level: number;
  status: 'completed' | 'current' | 'locked';
  x: number;
  y: number;
  onPress: () => void;
  index: number;
}

function LevelNode({ level, status, x, y, onPress, index }: LevelNodeProps) {
  const diff = getClassicDifficulty(level);
  
  const getColors = (): [string, string] => {
    if (status === 'locked') return ['#E0E0E0', '#BDBDBD'];
    if (diff === 'easy') return ['#2ECC71', '#27AE60'];
    if (diff === 'average') return ['#F1C40F', '#F39C12'];
    return ['#E74C3C', '#C0392B'];
  };
  
  const isPulsing = status === 'current';
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    if (isPulsing) {
      const pulse = () => {
        pulseScale.value = withSequence(
          withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        );
      };
      pulse();
      const interval = setInterval(pulse, 1600);
      return () => clearInterval(interval);
    }
  }, [isPulsing]);
  
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isPulsing ? pulseScale.value : 1 }],
  }));

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 80).springify()}
      style={[
        styles.nodeContainer, 
        { left: x - NODE_SIZE / 2, top: y - NODE_SIZE / 2 },
      ]}
    >
    <Animated.View style={animStyle}>
      <Pressable 
        onPress={onPress}
        disabled={status === 'locked'}
        style={({ pressed }) => [
          styles.nodePressable,
          pressed && status !== 'locked' && { transform: [{ scale: 0.9 }] }
        ]}
      >
        <LinearGradient
          colors={getColors()}
          style={styles.nodeBubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {status === 'completed' ? (
            <View style={styles.starsContainer}>
               <Ionicons name="star" size={12} color="#fff" />
               <Ionicons name="star" size={16} color="#fff" style={{ marginTop: -4 }} />
               <Ionicons name="star" size={12} color="#fff" />
            </View>
          ) : status === 'locked' ? (
            <Ionicons name="lock-closed" size={24} color="#757575" />
          ) : (
            <Text style={styles.nodeLevelText}>{level}</Text>
          )}
        </LinearGradient>
        
        <View style={styles.nodeLabel}>
           <Text style={[
             styles.nodeLabelText, 
             status === 'locked' && { color: '#9E9E9E' },
             status === 'current' && { color: Colors.primary, fontFamily: 'Fredoka_700Bold' }
           ]}>
             Lv.{level}
           </Text>
        </View>
      </Pressable>
    </Animated.View>
    </Animated.View>
  );
}

export default function ClassicMapScreen() {
  const insets = useSafeAreaInsets();
  const { classicLevel } = useGameState();
  const scrollRef = useRef<ScrollView>(null);
  
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  // Stickman walking animation values
  const stickmanX = useSharedValue(0);
  const stickmanY = useSharedValue(0);
  const [isWalking, setIsWalking] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);

  // Show all levels from 1 up to current + a few locked ahead
  const totalLevels = classicLevel + EXTRA_LOCKED_LEVELS;
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);
  
  // Total map height (bottom-to-top: level 1 at bottom, last at top)
  const totalMapHeight = totalLevels * LEVEL_SPACING + MAP_PADDING_BOTTOM + MAP_PADDING_TOP;

  // Determine Current Season
  const seasonIndex = Math.floor((classicLevel - 1) / 25) % 4;
  const currentSeason = SEASONS[seasonIndex];
  
  // Generate consistent background decorations based on level height
  const decorations = React.useMemo(() => {
    const decs = [];
    const numDecorations = totalLevels * 2.5; // Roughly 2.5 items per level space
    
    for (let i = 0; i < numDecorations; i++) {
      // Use index and season as seed
      const seed = i + (seasonIndex * 1000);
      const decType = currentSeason.decorations[Math.floor(seededRandom(seed) * currentSeason.decorations.length)];
      
      const size = 30 + seededRandom(seed + 1) * 50; // 30 to 80
      const x = seededRandom(seed + 2) * width;
      const y = totalMapHeight - (seededRandom(seed + 3) * totalMapHeight);
      
      decs.push({ id: `dec-${i}`, ...decType, size, x, y });
    }
    return decs;
  }, [totalLevels, seasonIndex, totalMapHeight]);
  
  // Calculate node positions — bottom-to-top with S-curve
  const getPosition = (index: number) => {
    // Y goes from bottom to top
    const y = totalMapHeight - MAP_PADDING_BOTTOM - (index * LEVEL_SPACING);
    
    // X weaves left-right in an S-pattern
    const cycle = index % 4;
    const direction = Math.floor(index / 2) % 2 === 0 ? 1 : -1;
    
    let xRatio = 0.5; // center  
    if (cycle === 0) xRatio = 0.5;
    else if (cycle === 1) xRatio = 0.5 + 0.22 * direction;
    else if (cycle === 2) xRatio = 0.5 + 0.32 * direction;
    else if (cycle === 3) xRatio = 0.5 + 0.22 * direction;
    
    const x = width * xRatio;
    
    return { x, y };
  };

  const points = levels.map((_, i) => getPosition(i));

  // Set initial stickman position to current level
  useEffect(() => {
    const currentIndex = levels.indexOf(classicLevel);
    if (currentIndex !== -1) {
      const { x, y } = points[currentIndex];
      stickmanX.value = x;
      stickmanY.value = y;
    }
    
    // Scroll to current level position
    setTimeout(() => {
      const currentIndex = levels.indexOf(classicLevel);
      if (currentIndex !== -1 && scrollRef.current) {
        const { y } = points[currentIndex];
        const scrollTarget = Math.max(0, y - screenHeight / 2);
        scrollRef.current.scrollTo({ y: scrollTarget, animated: true });
      }
    }, 300);
  }, [classicLevel]);

  const stickmanAnimStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: stickmanX.value - 45,
    top: stickmanY.value - NODE_SIZE - 75,
    width: 90,
    height: 90,
    zIndex: 100,
  }));

  const launchGame = (level: number) => {
    const diff = getClassicDifficulty(level);
    router.replace({ pathname: '/game', params: { difficulty: diff, mode: 'classic', level: level.toString() } });
  };

  const handleLevelSelect = (level: number) => {
    if (isWalking) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const targetIndex = levels.indexOf(level);
    if (targetIndex === -1) return;

    const { x: targetX, y: targetY } = points[targetIndex];
    
    // If already at this level, just launch
    const currentIndex = levels.indexOf(classicLevel);
    if (currentIndex !== -1) {
      const { x: curX, y: curY } = points[currentIndex];
      if (Math.abs(curX - targetX) < 5 && Math.abs(curY - targetY) < 5) {
        launchGame(level);
        return;
      }
    }

    // Walk to the level
    setIsWalking(true);
    setPendingLevel(level);
    
    const duration = 800;
    
    stickmanX.value = withTiming(targetX, { 
      duration, 
      easing: Easing.inOut(Easing.cubic) 
    });
    stickmanY.value = withTiming(targetY, { 
      duration, 
      easing: Easing.inOut(Easing.cubic) 
    }, (finished) => {
      if (finished) {
        runOnJS(onWalkComplete)(level);
      }
    });
  };

  const onWalkComplete = (level: number) => {
    setIsWalking(false);
    setPendingLevel(null);
    // Launch the game after arriving
    setTimeout(() => launchGame(level), 300);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentSeason.colors}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topPadding + 8 }]}>
        <Pressable onPress={() => router.replace('/difficulty')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.titleContainer}>
           <Ionicons name={currentSeason.icon as any} size={20} color={Colors.text} style={{ marginRight: 6 }} />
           <Text style={styles.title}>{currentSeason.name} Map</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lv.{classicLevel}</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={{ 
          height: totalMapHeight,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapArea}>
          {/* Background Decorations */}
          {decorations.map((dec) => (
            <View 
              key={dec.id} 
              style={[styles.decorationIcon, { left: dec.x - dec.size/2, top: dec.y - dec.size/2 }]}
            >
              {dec.family === 'MaterialCommunityIcons' ? (
                 <MaterialCommunityIcons name={dec.name as any} size={dec.size} color={dec.color} />
              ) : (
                 <Ionicons name={dec.name as any} size={dec.size} color={dec.color} />
              )}
            </View>
          ))}

          {/* Draw connecting paths */}
          {points.map((p, i) => {
            if (i === points.length - 1) return null;
            const nextP = points[i + 1];
            
            const dx = nextP.x - p.x;
            const dy = nextP.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            const isUnlocked = levels[i] < classicLevel;
            
            return (
              <Animated.View 
                key={`line-${i}`}
                entering={FadeIn.delay(i * 80)}
                style={[
                  styles.pathLine,
                  {
                    left: p.x,
                    top: p.y,
                    width: dist,
                    transform: [
                      { translateX: -dist / 2 },
                      { translateY: -4 },
                      { rotate: `${angle}deg` },
                      { translateX: dist / 2 }
                    ],
                    backgroundColor: isUnlocked ? Colors.primary : '#D5D5D5',
                  }
                ]}
              />
            );
          })}

          {/* Level Nodes */}
          {levels.map((lvl, index) => {
            const { x, y } = points[index];
            let status: 'completed' | 'current' | 'locked' = 'locked';
            if (lvl < classicLevel) status = 'completed';
            else if (lvl === classicLevel) status = 'current';

            return (
              <LevelNode 
                key={lvl}
                level={lvl}
                status={status}
                x={x}
                y={y}
                index={index}
                onPress={() => handleLevelSelect(lvl)}
              />
            );
          })}

          {/* Walking Stickman (AnimatedStickman with accessories) */}
          <Animated.View style={stickmanAnimStyle}>
            <AnimatedStickman size={90} hideArms={false} />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeText: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  decorationIcon: {
    position: 'absolute',
    zIndex: 0, 
  },
  pathLine: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  nodeContainer: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    zIndex: 2,
  },
  nodePressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBubble: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  nodeLevelText: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  nodeLabel: {
    position: 'absolute',
    bottom: -24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nodeLabelText: {
    fontSize: 12,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textLight,
  },
});
