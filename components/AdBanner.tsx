import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use the test ID for development to avoid getting banned.
// In production, use the real AdMob ad unit ID from environment variables.
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : (process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.ADAPTIVE_BANNER);

// Error boundary wrapper to prevent ad crashes from killing the app
class AdErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Ad crashed (non-fatal):', error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function AdBannerInner() {
  const insets = useSafeAreaInsets();
  const bannerRef = useRef<BannerAd>(null);
  const [isAdFailed, setIsAdFailed] = useState(false);

  // (iOS) WKWebView can terminate if app is in a "suspended state",
  // resulting in an empty banner when app returns to foreground.
  // Therefore manually request a new ad when the app is foregrounded.
  useForeground(() => {
    Platform.OS === 'ios' && bannerRef.current?.load();
  });

  // If it's the web platform or ad failed, don't render
  if (Platform.OS === 'web' || isAdFailed) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          networkExtras: {
            collapsible: 'bottom',
          },
        }}
        onAdLoaded={() => {
          console.log('Ad loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Ad failed to load: ', error);
          setIsAdFailed(true);
        }}
      />
    </View>
  );
}

export default function AdBanner() {
  return (
    <AdErrorBoundary>
      <AdBannerInner />
    </AdErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
});
