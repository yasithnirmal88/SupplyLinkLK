import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/authStore';
import {
  confirmOtp,
  verifyIdTokenWithBackend,
  getAuthErrorKey,
} from '../../services/auth';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { t } = useTranslation();

  const {
    verificationId,
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

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const boxScales = useRef(
    Array(OTP_LENGTH)
      .fill(null)
      .map(() => new Animated.Value(1))
  ).current;

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
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animateBox = (index: number) => {
    Animated.sequence([
      Animated.timing(boxScales[index], {
        toValue: 1.15,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(boxScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (authError) setAuthError(null);

    // Handle paste of full OTP
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = d;
          animateBox(index + i);
        }
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();

      // Auto-submit if all filled
      if (newOtp.every((d) => d !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit) {
      animateBox(index);
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Auto-submit when all digits entered
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
      if (!verificationId) {
        setAuthError(t('common.error'));
        return;
      }

      setLoading(true);
      setAuthError(null);

      try {
        const firebaseUser = await confirmOtp(verificationId, code);
        const idToken = await firebaseUser.getIdToken();

        // Verify with backend
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

        // Redirect based on profile status
        if (profile.role) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/role');
        }
      } catch (error: any) {
        const code = error?.code || '';
        setAuthError(t(getAuthErrorKey(code)));
        triggerShake();
        // Clear OTP on error
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
      } finally {
        setLoading(false);
      }
    },
    [verificationId, phone, language]
  );

  const handleResend = () => {
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setAuthError(null);
    // In production, re-trigger sendOtp here
    router.replace('/(auth)/phone');
  };

  const otpFilled = otp.every((d) => d !== '');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <View className="flex-1 px-6 pt-16 pb-8 justify-between">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="self-start mb-8 active:opacity-60"
        >
          <View
            className="flex-row items-center rounded-full px-3 py-2"
            style={{ backgroundColor: 'rgba(45,106,79,0.08)' }}
          >
            <Text style={{ fontSize: 18, color: '#2D6A4F' }}>←</Text>
            <Text className="ml-1 font-semibold" style={{ color: '#2D6A4F', fontSize: 14 }}>
              {t('common.back')}
            </Text>
          </View>
        </Pressable>

        {/* Header */}
        <View>
          <View
            className="items-center justify-center rounded-full mb-6 self-start"
            style={{
              width: 64,
              height: 64,
              backgroundColor: 'rgba(45,106,79,0.1)',
            }}
          >
            <Text style={{ fontSize: 30 }}>🔐</Text>
          </View>

          <Text
            className="text-text-primary font-bold"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            {t('auth.otpTitle')}
          </Text>
          <Text className="text-text-muted mt-2" style={{ fontSize: 15 }}>
            {t('auth.otpDescription')}
          </Text>
          {phone && (
            <Text
              className="font-semibold mt-1"
              style={{ fontSize: 16, color: '#2D6A4F' }}
            >
              {phone}
            </Text>
          )}
        </View>

        {/* OTP Boxes */}
        <Animated.View
          className="flex-row justify-between mt-10"
          style={{ transform: [{ translateX: shakeAnim }] }}
        >
          {otp.map((digit, index) => (
            <Animated.View
              key={index}
              style={{ transform: [{ scale: boxScales[index] }] }}
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="text-center rounded-2xl"
                style={{
                  width: 52,
                  height: 64,
                  fontSize: 26,
                  fontWeight: '700',
                  color: '#1A1A2E',
                  backgroundColor: digit ? 'rgba(45,106,79,0.08)' : '#FFFFFF',
                  borderWidth: 2,
                  borderColor: authError
                    ? '#EF4444'
                    : digit
                      ? '#2D6A4F'
                      : '#E5E7EB',
                }}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1} // Allow paste on first box
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                selectTextOnFocus
              />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Error */}
        {authError && (
          <View className="mt-4">
            <Text style={{ color: '#EF4444', fontSize: 14, textAlign: 'center' }}>
              ⚠️ {authError}
            </Text>
          </View>
        )}

        {/* Resend */}
        <View className="items-center mt-6">
          {canResend ? (
            <Pressable onPress={handleResend} className="active:opacity-60">
              <Text className="font-semibold" style={{ fontSize: 15, color: '#2D6A4F' }}>
                {t('auth.resendOtp')}
              </Text>
            </Pressable>
          ) : (
            <Text className="text-text-muted" style={{ fontSize: 15 }}>
              {t('auth.resendIn', { seconds: countdown })}
            </Text>
          )}
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Verify Button */}
        <Pressable
          onPress={() => handleVerify(otp.join(''))}
          disabled={!otpFilled || isLoading}
          className="rounded-2xl py-4 items-center active:opacity-90"
          style={{
            backgroundColor: otpFilled ? '#2D6A4F' : '#D1D5DB',
            shadowColor: otpFilled ? '#2D6A4F' : 'transparent',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: otpFilled ? 0.25 : 0,
            shadowRadius: 12,
            elevation: otpFilled ? 6 : 0,
          }}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text className="text-white font-bold ml-2" style={{ fontSize: 17 }}>
                {t('auth.verifying')}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>
              {t('auth.verifyOtp')}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
