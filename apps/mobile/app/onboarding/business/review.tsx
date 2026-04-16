import React from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, Building, User, MapPin, Briefcase } from 'lucide-native';

import { useKycStore } from '../../../stores/kycStore';
import { useAuthStore } from '../../../stores/authStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { uploadImage } from '../../../services/storage';
import { apiClient } from '../../../services/api';
import { COLORS } from '../../../constants/Colors';

export default function BusinessReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uid } = useAuthStore();
  
  const { 
    businessName, contactPerson, district, address, businessType,
    profilePhotoUrl, nicFrontUrl, nicBackUrl, selfieUrl, businessRegUrl,
    isLoading, setLoading
  } = useKycStore();

  const handleFinalSubmit = async () => {
    if (!uid) return;
    
    setLoading(true);
    try {
      // 1. Parallel Uploads to Firebase Storage
      const [
        pPhoto, nFront, nBack, sPhoto, bReg
      ] = await Promise.all([
        profilePhotoUrl ? uploadImage(profilePhotoUrl, `users/${uid}/business_storefront.jpg`) : null,
        nicFrontUrl ? uploadImage(nicFrontUrl, `kyc/${uid}/nic-front.jpg`) : null,
        nicBackUrl ? uploadImage(nicBackUrl, `kyc/${uid}/nic-back.jpg`) : null,
        selfieUrl ? uploadImage(selfieUrl, `kyc/${uid}/selfie.jpg`) : null,
        businessRegUrl ? uploadImage(businessRegUrl, `kyc/${uid}/business-reg.file`) : null,
      ]);

      // 2. Submit to Business-specific KYC Endpoint
      await apiClient('/kyc/submit-business', {
        method: 'POST',
        body: {
          uid,
          businessName,
          contactPerson,
          businessType,
          district,
          address,
          profilePhotoUrl: pPhoto,
          nicFrontUrl: nFront,
          nicBackUrl: nBack,
          selfieUrl: sPhoto,
          businessRegUrl: bReg,
        },
      });

      // 3. Success
      router.push('/onboarding/business/submitted');
    } catch (err: any) {
      console.error('Business submission failed:', err);
      Alert.alert('Submission Error', err.message || 'Could not submit your business profile.');
    } finally {
      setLoading(false);
    }
  };

  const SummarySection = ({ title, icon: Icon, children }: any) => (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <Icon size={18} color={COLORS.primaryGreen} />
        <Text className="text-lg font-bold ml-2 text-text-primary uppercase tracking-tight">
          {title}
        </Text>
      </View>
      <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        {children}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ProgressBar current={5} total={5} />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.business.review.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.business.review.subtitle')}
          </Text>
        </View>

        {/* Business Info */}
        <SummarySection title={t('onboarding.business.review.business')} icon={Building}>
           <Text className="text-2xl font-bold text-text-primary">{businessName}</Text>
           <View className="flex-row items-center mb-6">
              <View className="bg-primary-green/10 px-3 py-1 rounded-full">
                 <Text className="text-primary-green font-bold text-xs uppercase">{businessType}</Text>
              </View>
              <Text className="text-text-muted mx-2">•</Text>
              <Text className="text-text-muted font-semibold">{district}</Text>
           </View>

           <View className="space-y-4">
              <View className="flex-row items-center">
                 <User size={16} color={COLORS.textMuted} />
                 <Text className="ml-3 text-text-primary font-semibold">{contactPerson}</Text>
              </View>
              <View className="flex-row items-start mt-4">
                 <MapPin size={16} color={COLORS.textMuted} />
                 <Text className="ml-3 text-text-muted flex-1 text-xs">{address}</Text>
              </View>
           </View>
        </SummarySection>

        {/* Identity & Legal Docs */}
        <SummarySection title={t('onboarding.business.review.kyc')} icon={Briefcase}>
           <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-muted">Identity Verification</Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold text-[10px] uppercase">NIC & Selfie OK</Text>
              </View>
           </View>

           <View className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex-row items-center">
              <File size={24} color={COLORS.primaryGreen} />
              <View className="ml-3">
                 <Text className="font-bold text-text-primary">Business Registration</Text>
                 <Text className="text-text-muted text-xs">Certificate document uploaded</Text>
              </View>
           </View>
        </SummarySection>

        <View className="h-10" />
      </ScrollView>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleFinalSubmit}
          disabled={isLoading}
          className={`py-4 rounded-2xl items-center ${isLoading ? 'bg-gray-400' : 'bg-primary-green'}`}
          style={{ elevation: 5 }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {t('onboarding.business.review.submit')}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
