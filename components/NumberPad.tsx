import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Pressable from '@/components/AppPressable';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface NumberPadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  isSmallScreen?: boolean;
  screenHeight?: number;
}

export default function NumberPad({ onPress, onDelete, onSubmit, disabled, isSmallScreen = false, screenHeight = 800 }: NumberPadProps) {
  // Proportional sizing: keys should be compact to leave room for arena + input
  const availableHeight = screenHeight * (screenHeight < 700 ? 0.24 : screenHeight < 800 ? 0.26 : 0.30);
  const keyHeight = Math.max(32, Math.min(48, Math.floor((availableHeight - 4 * 6) / 5)));
  const keyWidth = Math.max(50, Math.min(72, Math.round(keyHeight * 1.4)));
  const keyGap = Math.max(3, Math.min(6, Math.round(keyHeight * 0.10)));
  const fontSize = Math.max(14, Math.min(22, Math.round(keyHeight * 0.42)));
  const goKeyWidth = (keyWidth * 3) + (keyGap * 2);

  const dynamicRow = { gap: keyGap };
  const dynamicKey = { width: keyWidth, height: keyHeight };
  const dynamicGoKey = { width: goKeyWidth };
  const dynamicText = { fontSize };
  const handlePress = (value: string) => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(value);
  };

  const handleDelete = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDelete();
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSubmit();
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['/', '0', 'del'],
    ['go'],
  ];

  return (
    <View style={[styles.container, { gap: keyGap }]}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, dynamicRow]}>
          {row.map((key) => {
            if (key === 'del') {
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    dynamicKey,
                    styles.specialKey,
                    { backgroundColor: Colors.tertiary },
                    pressed && styles.keyPressed,
                    disabled && styles.keyDisabled,
                  ]}
                  onPress={handleDelete}
                  disabled={disabled}
                >
                  <Ionicons name="backspace-outline" size={isSmallScreen ? 22 : 26} color={Colors.text} />
                </Pressable>
              );
            }
            if (key === 'go') {
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    dynamicKey,
                    styles.goKey,
                    dynamicGoKey,
                    pressed && styles.keyPressed,
                    disabled && styles.keyDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={disabled}
                >
                  <Ionicons name="checkmark" size={isSmallScreen ? 26 : 30} color={Colors.textWhite} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.key,
                  dynamicKey,
                  pressed && styles.keyPressed,
                  disabled && styles.keyDisabled,
                ]}
                onPress={() => handlePress(key)}
                disabled={disabled}
              >
                <Text style={[styles.keyText, dynamicText]}>{key}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12, // Reduced from 20
    gap: 4, // Reduced from 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  key: {
    width: 80,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  goKey: {
    width: 256 + 16, // 80*3 + 8*2
    backgroundColor: Colors.primary,
    shadowOpacity: 0.15,
  },
  specialKey: {
    shadowOpacity: 0.15,
  },
  keyPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 24,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.text,
  },
});
