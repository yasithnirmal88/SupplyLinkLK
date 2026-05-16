import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { ChevronLeft, Phone, ArrowRight } from 'lucide-react-native';

import { useAuthStore } from '../../stores/authStore';
import { sendOtp, getAuthErrorKey } from '../../services/auth';
import { COLORS } from '../../constants/Colors';

const LOGO_IMG = require('../../assets/logo.png');

export default function PhoneScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { setConfirmationResult, setLoading, setAuthError, isLoading, authError } =
    useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format phone for display: 7X XXX XXXX
  const formatDisplay = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const rawDigits = phoneNumber.replace(/\D/g, '');
  const isValid = /^7[0-9]{8}$/.test(rawDigits);

  const handleSendOtp = useCallback(async () => {
    if (!isValid) {
      setAuthError(t('auth.errors.invalidPhone'));
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const fullNumber = `+94${rawDigits}`;
      const confirmationResult = await sendOtp(fullNumber);
      setConfirmationResult(confirmationResult);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullNumber },
      });
    } catch (error: any) {
      const code = error?.code || '';
      setAuthError(t(getAuthErrorKey(code)));
    } finally {
      setLoading(false);
    }
  }, [rawDigits, isValid]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <View className="flex-1 px-8 pt-16 pb-12">
        {/* Header Navigation */}
        <MotiView 
          from={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-row items-center justify-between mb-12"
        >
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-slate-50 items-center justify-center border border-slate-100 active:scale-90"
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <View className="items-center">
            <Image source={LOGO_IMG} style={{ width: 100, height: 40 }} resizeMode="contain" />
          </View>
          <View className="w-12" />
        </MotiView>

        {/* Content */}
        <View className="flex-1">
          <MotiView
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <View className="w-16 h-16 bg-emerald-50 rounded-3xl items-center justify-center mb-8">
              <Phone size={32} color={COLORS.primaryGreen} />
            </View>
            
            <Text className="text-slate-900 text-4xl font-black leading-[1.1] mb-4">
              Enter your{'\n'}phone number
            </Text>
            <Text className="text-slate-400 text-lg font-medium leading-6 pr-10">
              We'll send a verification code to secure your account.
            </Text>
          </MotiView>

          {/* Input Section */}
          <MotiView
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            className="mt-12"
          >
            <View 
              className={`flex-row items-center rounded-3xl bg-slate-50 border-2 transition-all p-2 ${
                isFocused ? 'border-primary-green bg-white shadow-sm' : 'border-transparent'
              }`}
            >
              {/* Country Code */}
              <View className="flex-row items-center px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 mr-2">
                <Text style={{ fontSize: 20 }}>🇱🇰</Text>
                <Text className="ml-2 font-black text-slate-900 text-lg">+94</Text>
              </View>

              {/* Input */}
              <TextInput
                className="flex-1 text-2xl font-black text-slate-900 px-4 py-4"
                placeholder="7X XXX XXXX"
                placeholderTextColor="#CBD5E1"
                keyboardType="phone-pad"
                maxLength={11}
                value={formatDisplay(phoneNumber)}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '');
                  setPhoneNumber(digits);
                  if (authError) setAuthError(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
              />
            </View>

            <AnimatePresence>
              {authError && (
                <MotiText 
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 font-bold mt-4 ml-2"
                >
                  ⚠️ {authError}
                </MotiText>
              )}
            </AnimatePresence>
          </MotiView>
        </View>

        {/* Footer CTAs */}
        <MotiView
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
        >
          <Text className="text-slate-400 text-center mb-8 text-sm px-6">
            By continuing, you agree to our <Text className="text-slate-900 font-bold">Terms of Service</Text> and <Text className="text-slate-900 font-bold">Privacy Policy</Text>.
          </Text>

          <Pressable
            onPress={handleSendOtp}
            disabled={!isValid || isLoading}
            className={`rounded-3xl py-6 flex-row items-center justify-center shadow-xl ${
              isValid ? 'bg-primary-green shadow-primary-green/20' : 'bg-slate-200'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className={`font-black text-lg mr-2 ${isValid ? 'text-white' : 'text-slate-400'}`}>
                  Send Verification Code
                </Text>
                <ArrowRight size={20} color={isValid ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>

          {/* Dev Bypass Link */}
          <Pressable
            onPress={async () => {
              useAuthStore.getState().setUser({
                uid: 'dev-bypass-123',
                phoneNumber: '+94770000000',
                role: 'supplier',
                verificationStatus: 'approved',
                displayName: 'Test Dev User'
              });
              router.replace('/(tabs)');
            }}
            className="mt-6 py-2 items-center"
          >
            <Text className="text-slate-300 font-bold text-xs uppercase tracking-widest">
              Dev Bypass Verification
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
}
