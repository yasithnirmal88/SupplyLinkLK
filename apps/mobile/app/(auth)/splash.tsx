import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // 1. Logo bounces in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Button slides up
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous leaf animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafRotate, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const leafRotateInterpolate = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const handleGetStarted = () => {
    router.push('/(auth)/language');
  };

  const handleSignIn = () => {
    router.push('/(auth)/phone');
  };

  return (
    <View className="flex-1 bg-primary-green">
      <StatusBar style="light" />

      {/* Background decorative elements */}
      <View className="absolute top-0 left-0 right-0 bottom-0">
        {/* Top-right circle */}
        <View
          className="absolute rounded-full opacity-10"
          style={{
            width: 300,
            height: 300,
            backgroundColor: '#F4A261',
            top: -80,
            right: -80,
          }}
        />
        {/* Bottom-left circle */}
        <View
          className="absolute rounded-full opacity-10"
          style={{
            width: 250,
            height: 250,
            backgroundColor: '#FFFFFF',
            bottom: -60,
            left: -60,
          }}
        />
        {/* Mid accent dot */}
        <View
          className="absolute rounded-full opacity-20"
          style={{
            width: 120,
            height: 120,
            backgroundColor: '#F4A261',
            top: '35%',
            left: -30,
          }}
        />
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-between px-8 pt-20 pb-12">
        {/* Top Section — Logo & Branding */}
        <View className="items-center mt-16">
          {/* Animated leaf icon */}
          <Animated.View
            style={{
              transform: [
                { scale: logoScale },
                { rotate: leafRotateInterpolate },
              ],
              opacity: logoOpacity,
            }}
          >
            <View
              className="items-center justify-center rounded-3xl"
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Text style={{ fontSize: 52 }}>🌿</Text>
            </View>
          </Animated.View>

          {/* App Name */}
          <Animated.View
            style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
            className="mt-6"
          >
            <Text
              className="text-white text-center font-bold"
              style={{ fontSize: 36, letterSpacing: 1 }}
            >
              SupplyLink LK
            </Text>
          </Animated.View>

          {/* Agricultural Marketplace Tag */}
          <Animated.View style={{ opacity: taglineOpacity }} className="mt-2">
            <Text
              className="text-center font-semibold"
              style={{
                fontSize: 11,
                color: 'rgba(244,162,97,0.9)',
                letterSpacing: 3,
              }}
            >
              {t('splash.agricultural')}
            </Text>
          </Animated.View>
        </View>

        {/* Middle Section — Tagline */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
          className="items-start px-2"
        >
          <Text
            className="text-white font-bold"
            style={{ fontSize: 32, lineHeight: 42 }}
          >
            {t('splash.tagline1')}
          </Text>
          <Text
            className="font-bold"
            style={{ fontSize: 32, lineHeight: 42, color: '#F4A261' }}
          >
            {t('splash.tagline2')}
          </Text>

          <Animated.Text
            style={{ opacity: subtitleOpacity }}
            className="text-white/70 mt-4"
          >
            {t('subtitle')}
          </Animated.Text>
        </Animated.View>

        {/* Bottom Section — CTAs */}
        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          }}
        >
          {/* Get Started Button */}
          <Pressable
            onPress={handleGetStarted}
            className="rounded-2xl py-4 px-8 items-center active:opacity-90"
            style={{
              backgroundColor: '#F4A261',
              shadowColor: '#F4A261',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text
              className="font-bold"
              style={{ fontSize: 18, color: '#1A1A2E' }}
            >
              {t('getStarted')}
            </Text>
          </Pressable>

          {/* Sign In Link */}
          <Pressable
            onPress={handleSignIn}
            className="mt-4 py-3 items-center active:opacity-70"
          >
            <Text className="text-white/80 font-semibold" style={{ fontSize: 16 }}>
              {t('signIn')}
            </Text>
          </Pressable>

          {/* Language Note */}
          <Text
            className="text-center mt-6"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}
          >
            {t('languageNote')}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
