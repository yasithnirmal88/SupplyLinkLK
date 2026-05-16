import React, { useState, useCallback, useEffect } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { ChevronLeft, Phone, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { sendOtp, getAuthErrorKey } from '../../services/auth';
import { COLORS } from '../../constants/Colors';

const LOGO_IMG = require('../../assets/logo.png');

export default function PhoneScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setConfirmationResult, setLoading, setAuthError, isLoading, authError } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const header0 = useSharedValue(0);
  const headerX = useSharedValue(-10);
  const content0 = useSharedValue(0);
  const contentY = useSharedValue(20);
  const input0 = useSharedValue(0);
  const inputY = useSharedValue(20);
  const footer0 = useSharedValue(0);
  const footerY = useSharedValue(20);
  const error0 = useSharedValue(0);

  useEffect(() => {
    header0.value = withTiming(1, { duration: 400 });
    headerX.value = withTiming(0, { duration: 400 });
    content0.value = withTiming(1, { duration: 600 });
    contentY.value = withTiming(0, { duration: 600 });
    input0.value = withDelay(200, withTiming(1, { duration: 600 }));
    inputY.value = withDelay(200, withTiming(0, { duration: 600 }));
    footer0.value = withDelay(400, withTiming(1, { duration: 600 }));
    footerY.value = withDelay(400, withTiming(0, { duration: 600 }));
  }, []);

  useEffect(() => {
    error0.value = withTiming(authError ? 1 : 0, { duration: 300 });
  }, [authError]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: header0.value,
    transform: [{ translateX: headerX.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: content0.value,
    transform: [{ translateY: contentY.value }],
  }));
  const inputStyle = useAnimatedStyle(() => ({
    opacity: input0.value,
    transform: [{ translateY: inputY.value }],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: footer0.value,
    transform: [{ translateY: footerY.value }],
  }));
  const errorStyle = useAnimatedStyle(() => ({
    opacity: error0.value,
  }));

  const formatDisplay = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const rawDigits = phoneNumber.replace(/\D/g, '');
  const isValid = /^7[0-9]{8}$/.test(rawDigits);

  const handleSendOtp = useCallback(async () => {
    if (!isValid) { setAuthError(t('auth.errors.invalidPhone')); return; }
    setLoading(true);
    setAuthError(null);
    try {
      const fullNumber = `+94${rawDigits}`;
      const confirmationResult = await sendOtp(fullNumber);
      setConfirmationResult(confirmationResult);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullNumber } });
    } catch (error: any) {
      console.error('FULL AUTH ERROR:', {
        code: error?.code,
        message: error?.message,
        nativeError: error?.nativeErrorMessage,
      });
      const code = error?.code || '';
      setAuthError(t(getAuthErrorKey(code)));
    } finally {
      setLoading(false);
    }
  }, [rawDigits, isValid]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 48 }}>

        <Animated.View style={[headerStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }]}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Image source={LOGO_IMG} style={{ width: 100, height: 40 }} resizeMode="contain" />
          </View>
          <View style={{ width: 48 }} />
        </Animated.View>

        <View style={{ flex: 1 }}>
          <Animated.View style={contentStyle}>
            <View style={{ width: 64, height: 64, backgroundColor: '#ECFDF5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <Phone size={32} color={COLORS.primaryGreen} />
            </View>
            <Text style={{ color: '#0F172A', fontSize: 36, fontWeight: '900', lineHeight: 40, marginBottom: 16 }}>
              Enter your{'\n'}phone number
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 17, fontWeight: '500', lineHeight: 24, paddingRight: 40 }}>
              We'll send a verification code to secure your account.
            </Text>
          </Animated.View>

          <Animated.View style={[inputStyle, { marginTop: 48 }]}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', borderRadius: 24,
              backgroundColor: isFocused ? 'white' : '#F8FAFC',
              borderWidth: 2, borderColor: isFocused ? COLORS.primaryGreen : 'transparent',
              padding: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginRight: 8 }}>
                <Text style={{ fontSize: 20 }}>🇱🇰</Text>
                <Text style={{ marginLeft: 8, fontWeight: '900', color: '#0F172A', fontSize: 17 }}>+94</Text>
              </View>
              <TextInput
                style={{ flex: 1, fontSize: 22, fontWeight: '900', color: '#0F172A', paddingHorizontal: 16, paddingVertical: 16 }}
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

            {authError && (
              <Animated.Text style={[errorStyle, { color: '#EF4444', fontWeight: '700', marginTop: 16, marginLeft: 8 }]}>
                ⚠️ {authError}
              </Animated.Text>
            )}
          </Animated.View>
        </View>

        <Animated.View style={footerStyle}>
          <Pressable
            onPress={handleSendOtp}
            disabled={!isValid || isLoading}
            style={{
              borderRadius: 24, paddingVertical: 22,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isValid ? COLORS.primaryGreen : '#E2E8F0',
              shadowColor: isValid ? COLORS.primaryGreen : 'transparent',
              shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ fontWeight: '900', fontSize: 17, marginRight: 8, color: isValid ? 'white' : '#94A3B8' }}>
                  Send Verification Code
                </Text>
                <ArrowRight size={20} color={isValid ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>

          <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 32, fontSize: 13, paddingHorizontal: 24 }}>
            By continuing, you agree to our{' '}
            <Text style={{ color: '#0F172A', fontWeight: '700' }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: '#0F172A', fontWeight: '700' }}>Privacy Policy</Text>.
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}