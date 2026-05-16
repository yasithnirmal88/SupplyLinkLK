import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { ChevronLeft, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react-native';

import { useAuthStore } from '../../stores/authStore';
import {
  confirmOtpWithResult,
  verifyIdTokenWithBackend,
  getAuthErrorKey,
} from '../../services/auth';
import { COLORS } from '../../constants/Colors';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { t } = useTranslation();

  const {
    confirmationResult,
    setUser,
    setNewUser,
    setLoading,
    setAuthError,
    isLoading,
    authError,
    language,
  } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first box
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 500);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (authError) setAuthError(null);

    // Handle paste of full OTP
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();

      if (newOtp.every((d) => d !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(
    async (code: string) => {
      if (!confirmationResult) {
        setAuthError(t('common.error'));
        return;
      }

      setLoading(true);
      setAuthError(null);

      try {
        const firebaseUser = await confirmOtpWithResult(confirmationResult, code);
        const idToken = await firebaseUser.getIdToken();

        const { isNewUser, user: profile } = await verifyIdTokenWithBackend(
          idToken,
          language
        );

        setUser({
          uid: profile.uid,
          phoneNumber: profile.phoneNumber,
          role: profile.role,
          verificationStatus: profile.verificationStatus,
          displayName: profile.displayName,
        });

        setNewUser(isNewUser);

        if (profile.role) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/role');
        }
      } catch (error: any) {
        const code = error?.code || '';
        setAuthError(t(getAuthErrorKey(code)));
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
      } finally {
        setLoading(false);
      }
    },
    [confirmationResult, phone, language]
  );

  const handleResend = () => {
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setAuthError(null);
    router.replace('/(auth)/phone');
  };

  const otpFilled = otp.every((d) => d !== '');

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
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Step 2 of 3
          </Text>
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
              <ShieldCheck size={32} color={COLORS.primaryGreen} />
            </View>
            
            <Text className="text-slate-900 text-4xl font-black leading-[1.1] mb-4">
              Enter code{'\n'}to verify
            </Text>
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-lg font-medium leading-6">
                Sent to <Text className="text-slate-900 font-bold">{phone}</Text>
              </Text>
            </View>
          </MotiView>

          {/* OTP Boxes Section */}
          <MotiView
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            className="mt-12 flex-row justify-between"
          >
            {otp.map((digit, index) => (
              <MotiView
                key={index}
                animate={{ 
                  scale: digit ? 1.05 : 1,
                  borderColor: authError ? '#EF4444' : digit ? COLORS.primaryGreen : '#F1F5F9',
                  backgroundColor: digit ? '#FFFFFF' : '#F8FAFC'
                }}
                className="w-[14%] aspect-[0.8] rounded-2xl border-2 items-center justify-center"
                style={{ shadowColor: digit ? COLORS.primaryGreen : 'transparent', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
              >
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  className="text-center font-black text-2xl text-slate-900 w-full h-full"
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  selectTextOnFocus
                />
              </MotiView>
            ))}
          </MotiView>

          <AnimatePresence>
            {authError && (
              <MotiText 
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 font-bold mt-6 text-center"
              >
                ⚠️ {authError}
              </MotiText>
            )}
          </AnimatePresence>

          {/* Resend Section */}
          <MotiView 
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 800 }}
            className="mt-10 items-center"
          >
            {canResend ? (
              <Pressable 
                onPress={handleResend} 
                className="flex-row items-center bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 active:scale-95"
              >
                <RefreshCw size={16} color={COLORS.primaryGreen} />
                <Text className="ml-2 font-black text-primary-green uppercase tracking-widest text-[10px]">
                  Resend Code
                </Text>
              </Pressable>
            ) : (
              <View className="flex-row items-center">
                <Text className="text-slate-400 font-medium">Resend code in </Text>
                <Text className="text-slate-900 font-black">{countdown}s</Text>
              </View>
            )}
          </MotiView>
        </View>

        {/* Footer CTAs */}
        <MotiView
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
        >
          <Pressable
            onPress={() => handleVerify(otp.join(''))}
            disabled={!otpFilled || isLoading}
            className={`rounded-3xl py-6 flex-row items-center justify-center shadow-xl ${
              otpFilled ? 'bg-primary-green shadow-primary-green/20' : 'bg-slate-200'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className={`font-black text-lg mr-2 ${otpFilled ? 'text-white' : 'text-slate-400'}`}>
                  Verify & Continue
                </Text>
                <ArrowRight size={20} color={otpFilled ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
}
