import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Camera } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { COLORS } from '../../../constants/Colors';

export default function NicUploadScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateNic, nicFrontUrl, nicBackUrl } = useKycStore();

  const [front, setFront] = useState<string | undefined>(nicFrontUrl);
  const [back, setBack] = useState<string | undefined>(nicBackUrl);

  const pickImage = async (type: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'front') setFront(result.assets[0].uri);
      else setBack(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (front && back) {
      updateNic(front, back);
      router.push('/onboarding/supplier/selfie');
    }
  };

  const ImageBox = ({ 
    uri, 
    label, 
    onPress 
  }: { 
    uri?: string; 
    label: string; 
    onPress: () => void 
  }) => (
    <Pressable
      onPress={onPress}
      className={`w-full aspect-[1.6/1] rounded-2xl border-2 border-dashed items-center justify-center bg-white overflow-hidden ${uri ? 'border-primary-green' : 'border-gray-300'}`}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <View className="items-center">
          <View className="p-4 bg-gray-50 rounded-full mb-2">
            <Camera size={32} color={COLORS.textMuted} />
          </View>
          <Text className="text-text-muted font-bold">{label}</Text>
          <Text className="text-gray-400 text-xs mt-1">{t('onboarding.supplier.nic.tapToUpload')}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ProgressBar current={2} total={7} />

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.supplier.nic.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.supplier.nic.subtitle')}
          </Text>
        </View>

        <View className="gap-6">
          <ImageBox 
            uri={front} 
            label={t('onboarding.supplier.nic.front')} 
            onPress={() => pickImage('front')} 
          />
          <ImageBox 
            uri={back} 
            label={t('onboarding.supplier.nic.back')} 
            onPress={() => pickImage('back')} 
          />
        </View>

        <View className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <Text className="text-amber-800 text-xs font-semibold">
            SECURE VERIFICATION
          </Text>
          <Text className="text-amber-700 text-xs mt-1 leading-4">
            {t('kyc.securityNote')}
          </Text>
        </View>
      </ScrollView>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleContinue}
          disabled={!front || !back}
          className={`py-4 rounded-2xl items-center ${front && back ? 'bg-primary-green' : 'bg-gray-300'}`}
        >
          <Text className="text-white font-bold text-lg">
            {t('onboarding.supplier.nic.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
