import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { BlurView } from 'expo-blur';
import StickmanCoin from '@/components/StickmanCoin';
import { useGameState } from '@/hooks/useGameState';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, updateUsername, updatePassword, logout } = useAuth();
  const { coins } = useGameState();
  
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    if (isGuest) {
      router.replace('/auth');
    }
  }, [isGuest]);

  if (isGuest || !user) {
    return null;
  }

  const handleUpdateUsername = async () => {
    if (newUsername.trim() === user?.username) return;
    if (newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    // No space for username
    if(newUsername.trim().includes(' ')) {
      setError('Username cannot contain spaces');
      return;
    }

    //max username length
    if(newUsername.trim().length > 20) {
      setError('Username cannot be longer than 20 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const errorMsg = await updateUsername(newUsername.trim());
      if (errorMsg) {
        setError(errorMsg);
      } else {
        setSuccess('Username updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const errorMsg = await updatePassword(currentPassword, newPassword);
      if (errorMsg) {
        setError(errorMsg);
      } else {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          router.replace('/');
        }}
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.userCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.userCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={80} color="#fff" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.usernameText}>{user?.username}</Text>
              <View style={styles.coinBadge}>
                <StickmanCoin size={18} />
                <Text style={styles.coinText}>{coins.toLocaleString()} Coins</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {error && (
          <Animated.View entering={FadeInUp} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        )}

        {success && (
          <Animated.View entering={FadeInUp} style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            <Text style={styles.successBannerText}>{success}</Text>
          </Animated.View>
        )}

        {/* Username Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Change Username</Text>
          </View>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="New Username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <Text style={styles.cooldownNote}>
            Note: You can only change your username once every 7 days.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              newUsername.trim() === user?.username && styles.disabledBtn
            ]}
            onPress={handleUpdateUsername}
            disabled={loading || newUsername.trim() === user?.username}
          >
            <Text style={styles.actionBtnText}>Update Username</Text>
          </Pressable>
        </Animated.View>

        {/* Password Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              secureTextEntry={!showCurrentPassword}
            />
            <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              secureTextEntry={!showNewPassword}
            />
            <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              secureTextEntry={!showConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              (!currentPassword || !newPassword || !confirmPassword) && styles.disabledBtn
            ]}
            onPress={handleUpdatePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            <Text style={styles.actionBtnText}>Update Password</Text>
          </Pressable>
        </Animated.View>

        {/* Logout Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && { opacity: 0.8, backgroundColor: 'rgba(231, 76, 60, 0.1)' }
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>

      {loading && (
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light">
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </BlurView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.text,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  userCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  userCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  usernameText: {
    fontSize: 26,
    fontFamily: 'Fredoka_700Bold',
    color: '#fff',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  coinText: {
    fontSize: 15,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#FFD700',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 2,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.text,
  },
  cooldownNote: {
    fontSize: 12,
    fontFamily: 'Fredoka_400Regular',
    color: Colors.textLight,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Fredoka_600SemiBold',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },
  logoutBtnText: {
    fontSize: 17,
    fontFamily: 'Fredoka_600SemiBold',
    color: Colors.error,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: Colors.error,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  successBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Fredoka_500Medium',
    color: '#27AE60',
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
