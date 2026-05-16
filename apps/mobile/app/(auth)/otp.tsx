import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
} from 'react-native-reanimated';
import { ChevronLeft, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { confirmOtpWithResult, verifyIdTokenWithBackend, getAuthErrorKey } from '../../services/auth';
import { COLORS } from '../../constants/Colors';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { t } = useTranslation();
  const { confirmationResult, setUser, setNewUser, setLoading, setAuthError, isLoading, authError, language } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const header0 = useSharedValue(0);
  const headerX = useSharedValue(-10);
  const content0 = useSharedValue(0);
  const contentY = useSharedValue(20);
  const input0 = useSharedValue(0);
  const inputY = useSharedValue(20);
  const footer0 = useSharedValue(0);
  const footerY = useSharedValue(20);
  const resend0 = useSharedValue(0);
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
    resend0.value = withDelay(800, withTiming(1, { duration: 400 }));
    setTimeout(() => inputRefs.current[0]?.focus(), 500);
  }, []);

  useEffect(() => {
    error0.value = withTiming(authError ? 1 : 0, { duration: 300 });
  }, [authError]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const headerStyle = useAnimatedStyle(() => ({ opacity: header0.value, transform: [{ translateX: headerX.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: content0.value, transform: [{ translateY: contentY.value }] }));
  const inputStyle = useAnimatedStyle(() => ({ opacity: input0.value, transform: [{ translateY: inputY.value }] }));
  const footerStyle = useAnimatedStyle(() => ({ opacity: footer0.value, transform: [{ translateY: footerY.value }] }));
  const resendStyle = useAnimatedStyle(() => ({ opacity: resend0.value }));
  const errorStyle = useAnimatedStyle(() => ({ opacity: error0.value }));

  const handleChange = (text: string, index: number) => {
    if (authError) setAuthError(null);
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < OTP_LENGTH) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIdx = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''));
      return;
    }
    const digit = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async (code: string) => {
    if (!confirmationResult) { setAuthError(t('common.error')); return; }
    setLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await confirmOtpWithResult(confirmationResult, code);
      const idToken = await firebaseUser.getIdToken();

      try {
        const { isNewUser, user: profile } = await verifyIdTokenWithBackend(idToken, language);
        setUser({ uid: profile.uid, phoneNumber: profile.phoneNumber, role: profile.role, verificationStatus: profile.verificationStatus, displayName: profile.displayName });
        setNewUser(isNewUser);
        if (profile.role) { router.replace('/(tabs)'); } else { router.replace('/(auth)/role'); }
      } catch (backendError: any) {
        // Backend unavailable - use Firebase user directly
        console.warn('Backend unavailable, using Firebase user directly', backendError.message);
        const { getUserProfile } = await import('../../services/auth');
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({ uid: profile.uid, phoneNumber: profile.phoneNumber || firebaseUser.phoneNumber || '', role: profile.role, verificationStatus: profile.verificationStatus, displayName: profile.displayName });
          if (profile.role) { router.replace('/(tabs)'); } else { router.replace('/(auth)/role'); }
        } else {
          setUser({ uid: firebaseUser.uid, phoneNumber: firebaseUser.phoneNumber || '', role: null, verificationStatus: null });
          router.replace('/(auth)/role');
        }
      }
    } catch (error: any) {
      const code = error?.code || '';
      setAuthError(t(getAuthErrorKey(code)));
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } finally {
      setLoading(false);
    }
  }, [confirmationResult, language]);

  const handleResend = () => {
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setAuthError(null);
    router.replace('/(auth)/phone');
  };

  const otpFilled = otp.every(d => d !== '');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 48 }}>
        <Animated.View style={[headerStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }]}>
          <Pressable onPress={() => router.back()} style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>Step 2 of 3</Text>
          <View style={{ width: 48 }} />
        </Animated.View>

        <View style={{ flex: 1 }}>
          <Animated.View style={contentStyle}>
            <View style={{ width: 64, height: 64, backgroundColor: '#ECFDF5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <ShieldCheck size={32} color={COLORS.primaryGreen} />
            </View>
            <Text style={{ color: '#0F172A', fontSize: 36, fontWeight: '900', lineHeight: 40, marginBottom: 16 }}>Enter code{'\n'}to verify</Text>
            <Text style={{ color: '#94A3B8', fontSize: 17, fontWeight: '500' }}>
              Sent to <Text style={{ color: '#0F172A', fontWeight: '700' }}>{phone}</Text>
            </Text>
          </Animated.View>

          <Animated.View style={[inputStyle, { marginTop: 48 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {otp.map((digit, index) => (
                <View key={index} style={{
                  width: '14%', aspectRatio: 0.8, borderRadius: 16, borderWidth: 2,
                  alignItems: 'center', justifyContent: 'center',
                  borderColor: authError ? '#EF4444' : digit ? COLORS.primaryGreen : '#F1F5F9',
                  backgroundColor: digit ? '#FFFFFF' : '#F8FAFC',
                }}>
                  <TextInput
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={{ textAlign: 'center', fontWeight: '900', fontSize: 22, color: '#0F172A', width: '100%', height: '100%' }}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? OTP_LENGTH : 1}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>
            {authError && (
              <Animated.Text style={[errorStyle, { color: '#EF4444', fontWeight: '700', marginTop: 24, textAlign: 'center' }]}>
                ⚠️ {authError}
              </Animated.Text>
            )}
          </Animated.View>

          <Animated.View style={[resendStyle, { marginTop: 40, alignItems: 'center' }]}>
            {canResend ? (
              <Pressable onPress={handleResend} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <RefreshCw size={16} color={COLORS.primaryGreen} />
                <Text style={{ marginLeft: 8, fontWeight: '900', color: COLORS.primaryGreen, textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>Resend Code</Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontWeight: '500' }}>Resend code in </Text>
                <Text style={{ color: '#0F172A', fontWeight: '900' }}>{countdown}s</Text>
              </View>
            )}
          </Animated.View>
        </View>

        <Animated.View style={footerStyle}>
          <Pressable
            onPress={() => handleVerify(otp.join(''))}
            disabled={!otpFilled || isLoading}
            style={{ borderRadius: 24, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: otpFilled ? COLORS.primaryGreen : '#E2E8F0' }}
          >
            {isLoading ? <ActivityIndicator color="white" /> : (
              <>
                <Text style={{ fontWeight: '900', fontSize: 17, marginRight: 8, color: otpFilled ? 'white' : '#94A3B8' }}>Verify & Continue</Text>
                <ArrowRight size={20} color={otpFilled ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}