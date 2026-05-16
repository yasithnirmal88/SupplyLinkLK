import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText } from 'moti';
import { AnimatePresence } from 'moti';
import { COLORS } from '../../constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    router.push('/(auth)/language');
  };

  const handleSignIn = () => {
    router.push('/(auth)/phone');
  };

  return (
    <View className="flex-1 bg-primary-green">
      <StatusBar style="light" />

      {/* Decorative background elements */}
      <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
        <MotiView
          from={{ opacity: 0, scale: 0.5, translateX: 50, translateY: -50 }}
          animate={{ opacity: 0.15, scale: 1, translateX: 0, translateY: 0 }}
          transition={{ type: 'timing', duration: 2000 }}
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            backgroundColor: '#F4A261',
            top: -100,
            right: -100,
          }}
        />
        <MotiView
          from={{ opacity: 0, scale: 0.5, translateX: -50, translateY: 50 }}
          animate={{ opacity: 0.1, scale: 1, translateX: 0, translateY: 0 }}
          transition={{ type: 'timing', duration: 2500, delay: 500 }}
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            backgroundColor: '#FFFFFF',
            bottom: -80,
            left: -80,
          }}
        />
      </View>

      <View className="flex-1 justify-between px-8 pt-24 pb-16">
        {/* Logo Section */}
        <View className="items-center">
          <MotiView
            from={{ opacity: 0, scale: 0.2, rotate: '45deg' }}
            animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
            transition={{ type: 'spring', damping: 12, delay: 200 }}
            className="w-28 h-28 bg-white/10 rounded-[32px] items-center justify-center border border-white/20"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }}
          >
            <MotiView
              animate={{ rotate: ['-5deg', '5deg', '-5deg'] }}
              transition={{ loop: true, type: 'timing', duration: 4000, easing: (t) => Math.sin(t * Math.PI) }}
            >
              <Text style={{ fontSize: 60 }}>🌿</Text>
            </MotiView>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 600 }}
            className="mt-8"
          >
            <Text className="text-white text-5xl font-black tracking-tight text-center">
              SupplyLink <Text style={{ color: COLORS.accentGold }}>LK</Text>
            </Text>
            <Text className="text-white/40 text-center uppercase tracking-[0.3em] font-bold text-[10px] mt-2">
              {t('splash.agricultural').toUpperCase()}
            </Text>
          </MotiView>
        </View>

        {/* Value Prop Section */}
        <View>
          <MotiText
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 1000 }}
            className="text-white text-4xl font-bold leading-[1.1]"
          >
            {t('splash.tagline1')}
          </MotiText>
          <MotiText
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 800, delay: 1200 }}
            className="text-4xl font-black leading-[1.1] mt-1"
            style={{ color: COLORS.accentGold }}
          >
            {t('splash.tagline2')}
          </MotiText>
          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ type: 'timing', duration: 1000, delay: 1500 }}
            className="text-white mt-6 text-lg font-medium leading-relaxed"
          >
            {t('splash.subtitle')}
          </MotiText>
        </View>

        {/* CTA Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 1800 }}
        >
          <Pressable
            onPress={handleGetStarted}
            className="bg-white rounded-[24px] py-5 px-8 items-center active:scale-[0.98] active:opacity-90"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text className="text-primary-green font-black text-lg">
              {t('splash.getStarted')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSignIn}
            className="mt-6 py-2 items-center active:opacity-60"
          >
            <Text className="text-white/80 font-bold text-base">
              {t('splash.signIn')}
            </Text>
          </Pressable>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ type: 'timing', duration: 1000, delay: 2200 }}
            className="text-white text-center mt-8 text-[11px] font-medium"
          >
            {t('splash.languageNote')}
          </MotiText>
        </MotiView>
      </View>
    </View>
  );
}
