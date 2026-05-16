import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle, Clock } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { COLORS } from '../../../constants/Colors';

export default function SubmittedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { reset } = useKycStore();

  const handleGoHome = () => {
    reset();
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-primary-green items-center justify-center px-10">
      <StatusBar style="light" />
      
      <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-8">
        <CheckCircle size={64} color="white" strokeWidth={3} />
      </View>

      <Text className="text-white text-3xl font-bold text-center">
        {t('onboarding.supplier.submitted.title')}
      </Text>
      
      <View className="flex-row items-center mt-4 bg-white/10 px-4 py-2 rounded-full">
        <Clock size={16} color="white" />
        <Text className="text-white font-bold ml-2 text-sm uppercase tracking-widest">
          24 Hour SLA
        </Text>
      </View>

      <Text className="text-white/80 text-center mt-8 text-lg leading-6">
        {t('onboarding.supplier.submitted.info')}
      </Text>

      <View className="absolute bottom-12 left-10 right-10">
        <Pressable 
          onPress={handleGoHome}
          className="bg-white py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-primary-green font-bold text-lg">
            {t('onboarding.supplier.submitted.goHome')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
