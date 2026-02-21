import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetPassword, verifyRecoveryPhrase } = useAuth();

  const [username, setUsername] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError(null);

    if (!username.trim() || !recoveryPhrase.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    const result = await verifyRecoveryPhrase(username.trim(), recoveryPhrase.trim());
    setLoading(false);

    if (result) {
      setError(result);
    } else {
      setStep('reset');
      setError(null);
    }
  };

  const handleReset = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(username.trim(), recoveryPhrase.trim(), newPassword);
    setLoading(false);

    if (result) {
      setError(result);
    } else {
      setStep('success');
    }
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  if (step === 'success') {
    return (
      <LinearGradient
        colors={['#27AE60', '#2ECC71', '#A8E6CF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.container, { paddingTop: topPadding + 40 }]}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.card}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Password Reset!</Text>
            <Text style={styles.successMessage}>
              Your password has been updated successfully. You can now log in with your new password.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
              onPress={() => router.replace('/auth')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="log-in-outline" size={22} color="#fff" />
                <Text style={styles.submitText}>Back to Login</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#27AE60', '#2ECC71', '#A8E6CF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: topPadding + 40 }]}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <MaterialCommunityIcons 
            name={step === 'verify' ? "shield-key" : "lock-reset"} 
            size={56} 
            color={Colors.secondary} 
          />
          <Text style={styles.title}>
            {step === 'verify' ? 'Verify Identity' : 'Reset Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'verify' 
              ? 'Enter your username and recovery phrase' 
              : 'Enter your new password below'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
          <View style={styles.inputGroup}>
            {step === 'verify' ? (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={Colors.textLight}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Recovery Phrase (e.g. word-word...)"
                    placeholderTextColor={Colors.textLight}
                    value={recoveryPhrase}
                    onChangeText={setRecoveryPhrase}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={Colors.textLight}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            onPress={step === 'verify' ? handleVerify : handleReset}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={step === 'verify' ? "arrow-forward-outline" : "refresh-outline"} 
                    size={22} 
                    color="#fff" 
                  />
                  <Text style={styles.submitText}>
                    {step === 'verify' ? 'Verify Phrase' : 'Reset Password'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
            <Text style={styles.backText}>Back to Login</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center',
    color: Colors.textWhite,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Fredoka_400Regular',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.error,
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitText: {
    fontSize: 17,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
});
