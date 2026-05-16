import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <Text style={styles.text}>
          You are currently offline. Some features may be limited.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#F43F5E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  text: {
    color: 'white',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});