import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useAuthStore } from '../../stores/authStore';
import { sendOtp, getAuthErrorKey } from '../../services/auth';
import { auth } from '../../services/firebase';

export default function PhoneScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const { setVerificationId, setLoading, setAuthError, isLoading, authError } =
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
      const verificationId = await sendOtp(fullNumber, recaptchaVerifier.current);
      setVerificationId(verificationId);
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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Invisible reCAPTCHA */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification={true}
      />

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
            <Text style={{ fontSize: 30 }}>📱</Text>
          </View>

          <Text
            className="text-text-primary font-bold"
            style={{ fontSize: 28, lineHeight: 36 }}
          >
            {t('auth.phoneTitle')}
          </Text>
          <Text className="text-text-muted mt-2" style={{ fontSize: 15 }}>
            {t('auth.phoneDescription')}
          </Text>
        </View>

        {/* Phone Input */}
        <View className="mt-8">
          <Text
            className="font-semibold mb-3"
            style={{ fontSize: 13, color: '#6B7280', letterSpacing: 0.5 }}
          >
            {t('auth.phoneNumber').toUpperCase()}
          </Text>

          <View
            className="flex-row items-center rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: isFocused
                ? '#2D6A4F'
                : authError
                  ? '#EF4444'
                  : '#E5E7EB',
              shadowColor: isFocused ? '#2D6A4F' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isFocused ? 0.1 : 0,
              shadowRadius: 8,
              elevation: isFocused ? 4 : 0,
            }}
          >
            {/* Country Prefix */}
            <View
              className="justify-center items-center px-4 py-4"
              style={{
                backgroundColor: 'rgba(45,106,79,0.06)',
                borderRightWidth: 1,
                borderRightColor: '#E5E7EB',
              }}
            >
              <Text className="font-semibold" style={{ fontSize: 13, color: '#6B7280' }}>
                🇱🇰
              </Text>
              <Text
                className="font-bold"
                style={{ fontSize: 17, color: '#1A1A2E', marginTop: 1 }}
              >
                +94
              </Text>
            </View>

            {/* Input Field */}
            <TextInput
              className="flex-1 px-4 py-5"
              style={{
                fontSize: 22,
                fontWeight: '600',
                color: '#1A1A2E',
                letterSpacing: 1,
              }}
              placeholder={t('auth.phonePlaceholder')}
              placeholderTextColor="#D1D5DB"
              keyboardType="phone-pad"
              maxLength={11} // 9 digits + 2 spaces
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

          {/* Error Message */}
          {authError && (
            <View className="flex-row items-center mt-3">
              <Text style={{ color: '#EF4444', fontSize: 13 }}>⚠️ {authError}</Text>
            </View>
          )}

          {/* Helper Text */}
          <Text className="text-text-muted mt-3" style={{ fontSize: 13 }}>
            {t('auth.phoneSubtitle')}
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Send OTP Button */}
        <Pressable
          onPress={handleSendOtp}
          disabled={!isValid || isLoading}
          className="rounded-2xl py-4 items-center active:opacity-90"
          style={{
            backgroundColor: isValid ? '#2D6A4F' : '#D1D5DB',
            shadowColor: isValid ? '#2D6A4F' : 'transparent',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isValid ? 0.25 : 0,
            shadowRadius: 12,
            elevation: isValid ? 6 : 0,
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text className="text-white font-bold ml-2" style={{ fontSize: 17 }}>
                {t('auth.sending')}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>
              {t('auth.sendOtp')}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
