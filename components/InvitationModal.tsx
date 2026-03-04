import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface InvitationModalProps {
  visible: boolean;
  hostUsername: string;
  difficulty: 'easy' | 'average' | 'hard';
  onAccept: () => void;
  onDecline: () => void;
}

const INVITE_DURATION = 15; // seconds

export default function InvitationModal({
  visible,
  hostUsername,
  difficulty,
  onAccept,
  onDecline,
}: InvitationModalProps) {
  const [timeLeft, setTimeLeft] = useState(INVITE_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setTimeLeft(INVITE_DURATION);
      progress.value = 1;
      progress.value = withTiming(0, { duration: INVITE_DURATION * 1000 });

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Don't call onDecline here — the hook's own 15s timer handles
            // auto-expiration to avoid double-cancellation of the room.
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getDiffColor = () => {
    switch (difficulty) {
      case 'easy': return Colors.primary;
      case 'average': return Colors.secondary;
      case 'hard': return Colors.error;
    }
  };

  const getDiffLabel = () => {
    switch (difficulty) {
      case 'easy': return '🟢 Easy';
      case 'average': return '🟡 Average';
      case 'hard': return '🔴 Hard';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.duration(300)}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="game-controller" size={32} color={Colors.primary} />
            <Text style={styles.title}>1v1 Challenge!</Text>
          </View>

          {/* Invitation details */}
          <View style={styles.body}>
            <Text style={styles.message}>
              <Text style={styles.username}>{hostUsername}</Text>
              {' wants to battle you!'}
            </Text>
            <View style={[styles.diffBadge, { backgroundColor: getDiffColor() }]}>
              <Text style={styles.diffText}>{getDiffLabel()}</Text>
            </View>
          </View>

          {/* Timer bar */}
          <View style={styles.timerContainer}>
            <View style={styles.timerTrack}>
              <Animated.View
                style={[
                  styles.timerFill,
                  progressStyle,
                  { backgroundColor: timeLeft <= 5 ? Colors.error : Colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.timerText, timeLeft <= 5 && { color: Colors.error }]}>
              {timeLeft}s
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable
              style={[styles.btn, styles.declineBtn]}
              onPress={onDecline}
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.btnText}>Decline</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.acceptBtn]}
              onPress={onAccept}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.btnText}>Accept</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  body: {
    alignItems: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  username: {
    fontWeight: '700',
    color: Colors.text,
  },
  diffBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  diffText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 20,
  },
  timerTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
    minWidth: 30,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  declineBtn: {
    backgroundColor: Colors.error,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
