import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Use the test ID for development to avoid getting banned.
// In production, replace this with your actual AdMob ad unit ID via environment variables.
const adUnitId = __DEV__ ? TestIds.BANNER : (process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER);

export default function AdBanner() {
  const insets = useSafeAreaInsets();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdFailed, setIsAdFailed] = useState(false);

  // If it's the web platform, we don't render native AdMob ads
  if (Platform.OS === 'web' || isAdFailed) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('Ad failed to load: ', error);
          setIsAdFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    // Minimal spacing above the ad
    marginTop: 10,
  },
});
