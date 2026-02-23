import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface NumberPadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function NumberPad({ onPress, onDelete, onSubmit, disabled }: NumberPadProps) {
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
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            if (key === 'del') {
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    styles.specialKey,
                    { backgroundColor: Colors.tertiary },
                    pressed && styles.keyPressed,
                    disabled && styles.keyDisabled,
                  ]}
                  onPress={handleDelete}
                  disabled={disabled}
                >
                  <Ionicons name="backspace-outline" size={26} color={Colors.text} />
                </Pressable>
              );
            }
            if (key === 'go') {
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    styles.goKey,
                    pressed && styles.keyPressed,
                    disabled && styles.keyDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={disabled}
                >
                  <Ionicons name="checkmark" size={30} color={Colors.textWhite} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.key,
                  pressed && styles.keyPressed,
                  disabled && styles.keyDisabled,
                ]}
                onPress={() => handlePress(key)}
                disabled={disabled}
              >
                <Text style={styles.keyText}>{key}</Text>
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
    paddingHorizontal: 20,
    gap: 8,
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
