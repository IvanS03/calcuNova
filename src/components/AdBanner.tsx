import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Use TestIds.BANNER while developing
// Replace with your real ID for production:
// 'ca-app-pub-XXXXXXXX/XXXXXXXXXX'
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.container, !loaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // GDPR friendly
        }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:          '100%',
    alignItems:     'center',
  },
  // Hide the space while ad hasn't loaded yet
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});