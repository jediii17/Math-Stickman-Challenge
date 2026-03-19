import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Text, Platform } from 'react-native';
import Pressable from '@/components/AppPressable';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface ScribbleAreaProps {
  onClose: () => void;
}

export default function ScribbleArea({ onClose }: ScribbleAreaProps) {
  // Keep all path data in refs so PanResponder always sees the latest
  const pathsRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const currentPath = useRef<string>('');
  const [, setTick] = useState(0); // force re-render

  const forceRender = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        pathsRef.current = [...pathsRef.current, currentPath.current];
        // New stroke clears redo history
        redoStackRef.current = [];
        forceRender();
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        pathsRef.current[pathsRef.current.length - 1] = currentPath.current;
        forceRender();
      },
      onPanResponderRelease: () => {
        currentPath.current = '';
      },
    })
  ).current;

  const hapticLight = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUndo = () => {
    if (pathsRef.current.length === 0) return;
    hapticLight();
    const removed = pathsRef.current.pop()!;
    redoStackRef.current.push(removed);
    forceRender();
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    hapticLight();
    const restored = redoStackRef.current.pop()!;
    pathsRef.current.push(restored);
    forceRender();
  };

  const handleClear = () => {
    hapticLight();
    pathsRef.current = [];
    redoStackRef.current = [];
    currentPath.current = '';
    forceRender();
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pathsRef.current = [];
    redoStackRef.current = [];
    currentPath.current = '';
    onClose();
  };

  const paths = pathsRef.current;
  const canUndo = paths.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Pressable
            style={({ pressed }) => [styles.toolBtn, styles.clearBtn, pressed && styles.toolBtnPressed]}
            onPress={handleClear}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.text} />
            <Text style={styles.toolBtnText}>Clear</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, !canUndo && styles.iconBtnDisabled, pressed && canUndo && styles.toolBtnPressed]}
            onPress={handleUndo}
            disabled={!canUndo}
          >
            <Ionicons name="arrow-undo" size={20} color={canUndo ? Colors.text : Colors.textLight} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, !canRedo && styles.iconBtnDisabled, pressed && canRedo && styles.toolBtnPressed]}
            onPress={handleRedo}
            disabled={!canRedo}
          >
            <Ionicons name="arrow-redo" size={20} color={canRedo ? Colors.text : Colors.textLight} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.toolBtn, styles.closeBtn, pressed && styles.toolBtnPressed]}
          onPress={handleClose}
        >
          <Ionicons name="close" size={20} color={Colors.textWhite} />
        </Pressable>
      </View>

      {/* Canvas — fills all remaining vertical space */}
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((path, index) => (
            <Path
              key={`${index}-${path.length}`}
              d={path}
              stroke={Colors.text}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          ))}
        </Svg>
        {paths.length === 0 && (
          <View style={styles.placeholder}>
            <Ionicons name="finger-print-outline" size={40} color={Colors.textLight} style={{ opacity: 0.25 }} />
            <Text style={styles.placeholderText}>Draw here to work out the problem</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 6,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  iconBtnDisabled: {
    opacity: 0.35,
  },
  toolbarTitle: {
    fontSize: 13,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toolBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  toolBtnText: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.text,
  },
  clearBtn: {
    backgroundColor: Colors.tertiaryLight,
  },
  closeBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
  },
  canvas: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
    opacity: 0.5,
  },
});
