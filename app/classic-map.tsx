import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, useWindowDimensions, Platform, Modal, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  useAnimatedScrollHandler,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import Colors from '@/constants/colors';
import { useGameState } from '@/hooks/useGameState';
import AnimatedStickman from '@/components/AnimatedStickman';
import { getClassicDifficulty } from '@/lib/math-engine';

// width and screenHeight are now obtained via useWindowDimensions() inside each component

// Configuration
const EXTRA_LOCKED_LEVELS = 28; // show a few locked levels ahead
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

function AnnoyingHereButton({ onPress, bottomPadding, direction, stickmanY, scrollY, screenHeight }: { onPress: () => void, bottomPadding: number, direction: 'above' | 'below', stickmanY: any, scrollY: any, screenHeight: number }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  // screenHeight is now passed as a prop

  useEffect(() => {
    // Annoying wiggle and pulse effect
    rotation.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 }),
        withDelay(1000, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withDelay(1000, withTiming(1, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ]
  }));

  const customExit = () => {
    'worklet';
    // Calculate the stickman's current screen Y position
    // stickmanY is map-coordinate, scrollY is the scroll offset
    // The screen height center is where the button is naturally anchored if it were at 0,0 relative to container
    // However, the container is at the bottom.
    
    // Position of button in screen coordinates
    const buttonScreenY = screenHeight - bottomPadding - 30 - 25; // 25 is half button height roughly
    const stickmanScreenY = stickmanY.value - scrollY.value - 90; // 90 is center offset roughly
    
    const targetY = stickmanScreenY - buttonScreenY;
    
    return {
      animations: {
        transform: [
          { translateY: withTiming(targetY, { duration: 600, easing: Easing.out(Easing.quad) }) },
          { scale: withTiming(0, { duration: 600 }) },
        ],
        opacity: withTiming(0, { duration: 400 }),
      },
      initialValues: {
        transform: [{ translateY: 0 }, { scale: 1 }],
        opacity: 1,
      },
    };
  };

  return (
    <Animated.View 
      entering={FadeInUp.springify()} 
      exiting={customExit}
      style={[styles.hereBtnContainer, { bottom: bottomPadding + 30 }]}
    >
      <Animated.View style={animStyle}>
        <Pressable 
          style={({ pressed }) => [styles.hereBtn, pressed && { opacity: 0.8 }]}
          onPress={onPress}
        >
          <Ionicons name={direction === 'above' ? "arrow-up" : "arrow-down"} size={20} color="#fff" />
          <Text style={styles.hereBtnText}>You're here</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function ClassicMapScreen() {
  const insets = useSafeAreaInsets();
  const { classicLevel } = useGameState();
  const scrollRef = useRef<ScrollView>(null);
  const { width, height: screenHeight } = useWindowDimensions();
  
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom;

  // Stickman walking animation values
  const stickmanX = useSharedValue(0);
  const stickmanY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scaleX = useSharedValue(1); // Used to flip the stickman left/right based on walk direction
  const [isWalking, setIsWalking] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showHereIndicator, setShowHereIndicator] = useState(false);
  // Track stickman position in state to avoid reading shared values during render
  const stickmanPosRef = useRef({ x: 0, y: 0 });

  // Show all levels from 1 up to current + a few locked ahead
  const totalLevels = classicLevel + EXTRA_LOCKED_LEVELS;
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);
  
  // Total map height (bottom-to-top: level 1 at bottom, last at top)
  const totalMapHeight = totalLevels * LEVEL_SPACING + MAP_PADDING_BOTTOM + MAP_PADDING_TOP;

  // Determine Current Season based on scroll position (default to player's current level season)
  const playerSeasonIndex = Math.floor((classicLevel - 1) / 25) % 4; // Use 25 since chunks use 25
  const [displayedSeasonIndex, setDisplayedSeasonIndex] = useState(playerSeasonIndex);
  const [hereDirection, setHereDirection] = useState<'above' | 'below' | null>(null);
  const currentSeason = SEASONS[playerSeasonIndex]; // Fixed color for back bar background
  const displayedSeason = SEASONS[displayedSeasonIndex];
  
  // Generate consistent background decorations per level space
  const decorations = React.useMemo(() => {
    const decs = [];
    
    for (let level = 1; level <= totalLevels; level++) {
      const decSeasonIndex = Math.floor((level - 1) / 25) % 4;
      const decSeason = SEASONS[decSeasonIndex];
      
      // We generate around 2-3 items per level chunk
      const itemsThisLevel = 2 + Math.floor(seededRandom(level * 100) * 2);
      
      for (let j = 0; j < itemsThisLevel; j++) {
        const seed = level * 1000 + j;
        const decType = decSeason.decorations[Math.floor(seededRandom(seed) * decSeason.decorations.length)];
        
        const size = 30 + seededRandom(seed + 1) * 50; // 30 to 80
        
        // Base Y position on the level's Y position
        const levelY = totalMapHeight - MAP_PADDING_BOTTOM - ((level - 1) * LEVEL_SPACING);
        
        // Scatter Y within +/- LEVEL_SPACING/2
        const yOffset = (seededRandom(seed + 2) - 0.5) * LEVEL_SPACING;
        const y = levelY + yOffset;
        
        const x = seededRandom(seed + 3) * width;
        
        decs.push({ id: `dec-${level}-${j}`, ...decType, size, x, y });
      }
    }
    return decs;
  }, [totalLevels, totalMapHeight]);
  
  // Calculate seasonal background chunks calculate chunks of 25 levels
  const seasonChunks = React.useMemo(() => {
    const chunks = [];
    for (let startLevel = 1; startLevel <= totalLevels; startLevel += 25) {
      const endLevel = Math.min(startLevel + 24, totalLevels);
      const chunkSeasonIndex = Math.floor((startLevel - 1) / 25) % 4;
      
      // Calculate start and end Y positions for this chunk
      // Levels are drawn bottom-to-top. Level 1 is at the bottom.
      const startP = totalMapHeight - MAP_PADDING_BOTTOM - ((startLevel - 1) * LEVEL_SPACING);
      const endP = totalMapHeight - MAP_PADDING_BOTTOM - ((endLevel - 1) * LEVEL_SPACING);
      
      // Give a little padding below and above the levels
      const paddingY = 55;
      const bottomY = startP + paddingY + (startLevel === 1 ? MAP_PADDING_BOTTOM : 0);
      const topY = endP - paddingY - (endLevel === totalLevels ? MAP_PADDING_TOP : 0);
      
      chunks.push({
        id: `chunk-${startLevel}`,
        season: SEASONS[chunkSeasonIndex],
        top: topY,
        height: bottomY - topY,
      });
    }
    return chunks;
  }, [totalLevels, totalMapHeight]);
  
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
      stickmanPosRef.current = { x, y };
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
    transform: [{ scaleX: scaleX.value }]
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

    // Walk to the level
    setIsWalking(true);
    setPendingLevel(level);
    
    // Use ref to find closest node (avoids reading shared value during render)
    const curX = stickmanPosRef.current.x;
    const curY = stickmanPosRef.current.y;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.sqrt(Math.pow(points[i].x - curX, 2) + Math.pow(points[i].y - curY, 2));
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    }
    
    const startIndex = closestIndex;
    const levelDiff = Math.abs(targetIndex - startIndex);
    
    // If jump is > 20 levels, teleport instantly instead of walking
    if (levelDiff > 20) {
      stickmanX.value = targetX;
      stickmanY.value = targetY;
      stickmanPosRef.current = { x: targetX, y: targetY };
      onWalkComplete(level);
      return;
    }
    
    // Determine path direction
    const step = startIndex < targetIndex ? 1 : -1;
    
    // Build animation sequence Arrays
    const seqX: any[] = [];
    const seqY: any[] = [];
    
    // Base speed per node-to-node jump
    const jumpDuration = 400; 
    
    let pathIndex = startIndex;
    
    while (pathIndex !== targetIndex) {
      pathIndex += step;
      const nextPoint = points[pathIndex];
      const isLastStep = pathIndex === targetIndex;
      
      seqX.push(
        withTiming(nextPoint.x, { duration: jumpDuration, easing: Easing.linear })
      );
      
      // Flip stickman direction on first step
      if (pathIndex === startIndex + step) {
        if (nextPoint.x < curX) {
          scaleX.value = -1;
        } else {
          scaleX.value = 1;
        }
      }
      
      seqY.push(
        withTiming(nextPoint.y, { duration: jumpDuration, easing: Easing.linear }, (finished) => {
          if (finished && isLastStep) {
            runOnJS(onWalkComplete)(level);
          }
        })
      );
    }
    
    if (seqX.length > 0) {
      stickmanX.value = withSequence(...seqX);
      stickmanY.value = withSequence(...seqY);
      // Update ref to final position
      stickmanPosRef.current = { x: targetX, y: targetY };
    } else {
      onWalkComplete(level);
    }
  };

  const onWalkComplete = (level: number) => {
    setIsWalking(false);
    setPendingLevel(null);
    scaleX.value = 1; // Reset stickman facing right on stop
    // Prompt the user to start the level instead of automatic launch
    setSelectedLevel(level);
  };

  // Use a reaction to sync state with shared values safely outside the render cycle
  useAnimatedReaction(
    () => ({
      scroll: scrollY.value,
      sY: stickmanY.value,
    }),
    (current) => {
      // Calculate off-screen status
      const scrollOffset = current.scroll;
      const actualStickmanY = current.sY - NODE_SIZE - 75; 
      const actualStickmanBottom = actualStickmanY + 90;
      
      const screenTop = scrollOffset + topPadding + 60;
      const screenBottom = scrollOffset + screenHeight;
      
      const isCompletelyAboveScreen = actualStickmanBottom < screenTop;
      const isCompletelyBelowScreen = actualStickmanY > screenBottom;

      if (isCompletelyAboveScreen) {
        runOnJS(setHereDirection)('above');
      } else if (isCompletelyBelowScreen) {
        runOnJS(setHereDirection)('below');
      } else {
        runOnJS(setHereDirection)(null);
      }
    },
    [topPadding, screenHeight]
  );

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    scrollY.value = scrollOffset;
    
    const screenCenterY = scrollOffset + screenHeight / 2;
    const rawLevel = (totalMapHeight - MAP_PADDING_BOTTOM - screenCenterY) / LEVEL_SPACING + 1;
    const visibleLevel = Math.max(1, Math.min(Math.round(rawLevel), totalLevels));
    const newSeasonIndex = Math.floor((visibleLevel - 1) / 25) % 4;
    
    if (newSeasonIndex !== displayedSeasonIndex) {
      setDisplayedSeasonIndex(newSeasonIndex);
    }
  };
  
  const scrollToCurrentLevel = () => {
    // Find where the stickman currently is (tracked node)
    const curX = stickmanPosRef.current.x;
    const curY = stickmanPosRef.current.y;
    
    if (scrollRef.current) {
      const scrollTarget = Math.max(0, curY - screenHeight / 2);
      scrollRef.current.scrollTo({ y: scrollTarget, animated: true });
    }
    
    // Show the "You're here" indicator above the stickman
    setShowHereIndicator(true);
    setTimeout(() => setShowHereIndicator(false), 2500);
  };

  return (
    <View style={styles.container}>
      {/* We will render gradients inside the ScrollView so they scroll naturally */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: currentSeason.colors[2] }]} />
      
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: topPadding + 8 }]}>
        <Pressable onPress={() => router.replace('/difficulty')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.titleContainer}>
           <Ionicons name={displayedSeason.icon as any} size={20} color={Colors.text} style={{ marginRight: 6 }} />
           <Text style={styles.title}>{displayedSeason.name} Map</Text>
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
        onScroll={handleScroll}
        scrollEventThrottle={16} // 60fps
      >
        <View style={styles.mapArea}>
          {/* Seasonal Background Gradients */}
          {seasonChunks.map((chunk) => (
            <LinearGradient
              key={chunk.id}
              colors={chunk.season.colors}
              style={[
                styles.seasonBackground,
                { top: chunk.top, height: chunk.height }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ))}

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
            <AnimatedStickman size={110} hideArms={false} />
          </Animated.View>

          {/* "You're here" floating indicator above stickman */}
          {showHereIndicator && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              exiting={FadeOut.delay(1500).duration(500)}
              style={{
                position: 'absolute',
                left: stickmanPosRef.current.x - 60,
                top: stickmanPosRef.current.y - NODE_SIZE - 75 - 44,
                width: 120,
                alignItems: 'center',
                zIndex: 200,
              }}
            >
              <View style={styles.hereIndicator}>
                <Ionicons name="location" size={16} color="#fff" />
                <Text style={styles.hereIndicatorText}>You're here!</Text>
              </View>
              <View style={styles.hereIndicatorArrow} />
            </Animated.View>
          )}
        </View>
      </ScrollView>
      
      {/* "You are here" Floating Button */}
      {hereDirection && (
        <AnnoyingHereButton 
          onPress={scrollToCurrentLevel} 
          bottomPadding={bottomPadding} 
          direction={hereDirection} 
          stickmanY={stickmanY} 
          scrollY={scrollY}
          screenHeight={screenHeight}
        />
      )}
      
      {/* Level Start Confirmation Modal */}
      <Modal
        visible={selectedLevel !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
          
          <Animated.View 
            entering={FadeInDown.duration(300).easing(Easing.out(Easing.ease))}
            style={[styles.modalContainer, { width: width * 0.85, maxWidth: 380 }]}
          >
            {/* Header with gradient feel */}
            <View style={[styles.modalHeader, { backgroundColor: currentSeason.colors[1] }]}>
              <View style={styles.modalLevelCircle}>
                <Text style={styles.modalLevelNumber}>{selectedLevel}</Text>
              </View>
              <Text style={styles.modalTitle}>Level {selectedLevel}</Text>
              <View style={[styles.modalSeasonTag, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Ionicons name={currentSeason.icon as any} size={14} color="#fff" />
                <Text style={styles.modalSeasonText}>{currentSeason.name}</Text>
              </View>
            </View>
            
            <View style={styles.modalBody}>
              {/* Stars for completed levels */}
              {selectedLevel !== null && selectedLevel < classicLevel && (
                <View style={styles.modalStarsContainer}>
                  <Ionicons name="star" size={28} color="#FFD700" />
                  <Ionicons name="star" size={36} color="#FFD700" style={{ marginTop: -6 }} />
                  <Ionicons name="star" size={28} color="#FFD700" />
                </View>
              )}
              
              <Text style={styles.modalText}>
                {selectedLevel !== null && selectedLevel < classicLevel
                  ? 'Replay this level?'
                  : 'Ready to take on the challenge?'}
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setSelectedLevel(null)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={16} color="#888" />
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.playBtn, { backgroundColor: currentSeason.colors[1] }]} 
                  onPress={() => {
                    if (selectedLevel) launchGame(selectedLevel);
                    setSelectedLevel(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.playBtnText}>Play!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    overflow: 'hidden',
  },
  seasonBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
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
  hereBtnContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 50,
  },
  hereBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hereBtnText: {
    color: '#fff',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  modalLevelCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  modalLevelNumber: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#fff',
  },
  modalTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  modalSeasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalSeasonText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  modalBody: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  modalStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  modalText: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 17,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 0.4,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
  },
  cancelBtnText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: '#888',
  },
  playBtn: {
    flex: 0.6,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  hereIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  hereIndicatorText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  hereIndicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E74C3C',
  },
});
