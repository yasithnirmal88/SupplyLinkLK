import React, { useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/Colors';

const LOGO_IMG = require('../../assets/logo.png');

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const bg1Opacity = useSharedValue(0);
  const bg1Scale = useSharedValue(0.5);
  const bg2Opacity = useSharedValue(0);
  const bg2Scale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.2);
  const logoRotate = useSharedValue(45);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);
  const tag1Opacity = useSharedValue(0);
  const tag1X = useSharedValue(-20);
  const tag2Opacity = useSharedValue(0);
  const tag2X = useSharedValue(-20);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(20);
  const noteOpacity = useSharedValue(0);

  useEffect(() => {
    bg1Opacity.value = withTiming(0.15, { duration: 2000 });
    bg1Scale.value = withTiming(1, { duration: 2000 });
    bg2Opacity.value = withDelay(500, withTiming(0.1, { duration: 2500 }));
    bg2Scale.value = withDelay(500, withTiming(1, { duration: 2500 }));
    logoOpacity.value = withDelay(200, withSpring(1));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    logoRotate.value = withDelay(200, withSpring(0, { damping: 12 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    titleY.value = withDelay(600, withTiming(0, { duration: 800 }));
    tag1Opacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
    tag1X.value = withDelay(1000, withTiming(0, { duration: 800 }));
    tag2Opacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    tag2X.value = withDelay(1200, withTiming(0, { duration: 800 }));
    subtitleOpacity.value = withDelay(1500, withTiming(0.6, { duration: 1000 }));
    ctaOpacity.value = withDelay(1800, withTiming(1, { duration: 600 }));
    ctaY.value = withDelay(1800, withSpring(0, { damping: 15 }));
    noteOpacity.value = withDelay(2200, withTiming(0.4, { duration: 1000 }));
  }, []);

  const bg1Style = useAnimatedStyle(() => ({
    opacity: bg1Opacity.value,
    transform: [{ scale: bg1Scale.value }],
  }));
  const bg2Style = useAnimatedStyle(() => ({
    opacity: bg2Opacity.value,
    transform: [{ scale: bg2Scale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotate.value}deg` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const tag1Style = useAnimatedStyle(() => ({
    opacity: tag1Opacity.value,
    transform: [{ translateX: tag1X.value }],
  }));
  const tag2Style = useAnimatedStyle(() => ({
    opacity: tag2Opacity.value,
    transform: [{ translateX: tag2X.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));
  const noteStyle = useAnimatedStyle(() => ({
    opacity: noteOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#2D6A4F' }}>
      <StatusBar style="light" />

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <Animated.View style={[bg1Style, {
          position: 'absolute', borderRadius: 200,
          width: 400, height: 400, backgroundColor: '#F4A261',
          top: -100, right: -100,
        }]} />
        <Animated.View style={[bg2Style, {
          position: 'absolute', borderRadius: 150,
          width: 300, height: 300, backgroundColor: '#FFFFFF',
          bottom: -80, left: -80,
        }]} />
      </View>

      <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 96, paddingBottom: 64 }}>
        <View style={{ alignItems: 'center' }}>
          <Animated.View style={[logoStyle, {
            width: 160, height: 160, backgroundColor: 'white',
            borderRadius: 32, alignItems: 'center', justifyContent: 'center',
            padding: 16,
            shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1, shadowRadius: 20,
          }]}>
            <Image source={LOGO_IMG} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={[titleStyle, { marginTop: 32 }]}>
            <Text style={{ color: 'white', fontSize: 48, fontWeight: '900', textAlign: 'center' }}>
              SupplyLink <Text style={{ color: COLORS.accentGold }}>LK</Text>
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 4, fontWeight: '700', fontSize: 10, marginTop: 8 }}>
              {t('splash.agricultural').toUpperCase()}
            </Text>
          </Animated.View>
        </View>

        <View>
          <Animated.Text style={[tag1Style, { color: 'white', fontSize: 36, fontWeight: '700', lineHeight: 40 }]}>
            {t('splash.tagline1')}
          </Animated.Text>
          <Animated.Text style={[tag2Style, { fontSize: 36, fontWeight: '900', lineHeight: 40, marginTop: 4, color: COLORS.accentGold }]}>
            {t('splash.tagline2')}
          </Animated.Text>
          <Animated.Text style={[subtitleStyle, { color: 'white', marginTop: 24, fontSize: 16, fontWeight: '500', lineHeight: 24 }]}>
            {t('splash.subtitle')}
          </Animated.Text>
        </View>

        <Animated.View style={ctaStyle}>
          <Pressable
            onPress={() => router.push('/(auth)/language')}
            style={{
              backgroundColor: 'white', borderRadius: 24, paddingVertical: 20,
              paddingHorizontal: 32, alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
            }}
          >
            <Text style={{ color: '#2D6A4F', fontWeight: '900', fontSize: 17 }}>
              {t('splash.getStarted')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/phone')}
            style={{ marginTop: 24, paddingVertical: 8, alignItems: 'center' }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 15 }}>
              {t('splash.signIn')}
            </Text>
          </Pressable>

          <Animated.Text style={[noteStyle, { color: 'white', textAlign: 'center', marginTop: 32, fontSize: 11, fontWeight: '500' }]}>
            {t('splash.languageNote')}
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}