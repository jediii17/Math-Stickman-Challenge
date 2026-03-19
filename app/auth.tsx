import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Pressable from '@/components/AppPressable';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useGameState } from '@/hooks/useGameState';
import * as Clipboard from 'expo-clipboard';



type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, continueAsGuest } = useAuth();
  const { resetForGuest } = useGameState();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!username.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim())) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const errorMsg = await login(username.trim(), password);
      setLoading(false);
      if (errorMsg) {
        setError(errorMsg);
      } else {
        router.replace('/');
      }
    } else {
      const res = await register(username.trim(), password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.recoveryPhrase) {
        setRecoveryPhrase(res.recoveryPhrase);
      } else {
        router.replace('/');
      }
    }
  };

  const handleGuest = () => {
    resetForGuest();
    continueAsGuest();
    router.replace('/');
  };

  const copyToClipboard = async () => {
    if (recoveryPhrase) {
      await Clipboard.setStringAsync(recoveryPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

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
          <MaterialCommunityIcons name="brain" size={56} color={Colors.secondary} />
          <Text style={styles.title}>MATH Stickman{'\n'}Challenge</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
          {recoveryPhrase ? (
            <View style={styles.recoveryContainer}>
              <View style={styles.recoveryIconContainer}>
                <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.recoveryTitle}>Registration Successful!</Text>
              <Text style={styles.recoveryDesc}>
                This is your secure recovery phrase. You <Text style={styles.boldText}>must</Text> save it to reset your password if you ever forget it.
                {'\n\n'}Please write it down or copy it to a safe place. It will not be shown again!
              </Text>
              
              <View style={styles.phraseBox}>
                <Text style={styles.phraseText} selectable={true}>{recoveryPhrase}</Text>
                <Pressable 
                  style={styles.copyButton} 
                  onPress={copyToClipboard}
                >
                  <Ionicons 
                    name={copied ? "checkmark" : "copy-outline"} 
                    size={20} 
                    color={copied ? Colors.primary : Colors.textLight} 
                  />
                  <Text style={[
                    styles.copyText, 
                    copied && { color: Colors.primary }
                  ]}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                ]}
                onPress={() => router.replace('/')}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.submitText}>I have saved my phrase</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => { setMode('login'); setUsername(''); setPassword(''); setError(null); }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => { setMode('register'); setUsername(''); setPassword(''); setError(null); }}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Colors.textLight}
                value={username}
                onChangeText={(text) => {
                  // Strip spaces automatically — they break the email bypass
                  setUsername(text.replace(/\s/g, ''));
                }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            {mode === 'register' && username.length > 0 && !/^[a-zA-Z0-9_-]*$/.test(username) && (
              <Text style={{ color: '#E74C3C', fontSize: 12, marginTop: 2, marginLeft: 4 }}>
                Only letters, numbers, underscores, and hyphens allowed
              </Text>
            )}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={Colors.textLight} 
                />
              </Pressable>
            </View>

            {mode === 'register' && (
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                </Pressable>
              </View>
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
            onPress={handleSubmit}
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
                    name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Login' : 'Create Account'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {mode === 'login' && (
            <Pressable
              style={({ pressed }) => [
                styles.forgotBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          )}
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Pressable
            style={({ pressed }) => [
              styles.guestBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleGuest}
          >
            <Ionicons name="game-controller-outline" size={20} color="rgba(255,255,255,0.9)" />
            <Text style={styles.guestText}>Continue as Guest</Text>
          </Pressable>
          <Text style={styles.guestNote}>
            Guest progress won&apos;t be saved
          </Text>
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
    fontSize: 36,
    fontFamily: 'Fredoka_700Bold',
    textAlign: 'center',
    color: Colors.textWhite,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
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
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  guestText: {
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
  guestNote: {
    fontSize: 12,
    fontFamily: 'Fredoka_400Regular',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.primary,
  },
  recoveryContainer: {
    alignItems: 'center',
    gap: 16,
  },
  recoveryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recoveryTitle: {
    fontSize: 24,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  recoveryDesc: {
    fontSize: 15,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontFamily: 'Fredoka_700Bold',
    color: Colors.primaryDark,
  },
  phraseBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    marginVertical: 8,
  },
  phraseText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    alignSelf: 'center',
  },
  copyText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: Colors.textLight,
  }
});
