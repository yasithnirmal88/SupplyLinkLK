import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Camera, UploadCloud, CheckCircle2, File } from 'lucide-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { COLORS } from '../../../constants/Colors';

export default function BusinessRegScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateBusinessReg, businessRegUrl } = useKycStore();
  
  const [fileUri, setFileUri] = useState<string | undefined>(businessRegUrl);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      }
    } catch (err) {
      Alert.alert('Error picking document', 'Please try again.');
    }
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileName('photo_capture.jpg');
    }
  };

  const handleContinue = () => {
    if (fileUri) {
      updateBusinessReg(fileUri);
      router.push('/onboarding/business/review');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ProgressBar current={4} total={5} />

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.business.reg.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.business.reg.subtitle')}
          </Text>
        </View>

        <View className="gap-6">
          <Pressable
            onPress={handlePickDocument}
            className={`w-full py-12 rounded-3xl border-2 border-dashed items-center justify-center bg-white ${fileUri ? 'border-primary-green bg-primary-green/5' : 'border-gray-300'}`}
          >
             {fileUri ? (
               <View className="items-center">
                 <CheckCircle2 size={48} color={COLORS.primaryGreen} />
                 <Text className="text-primary-green font-bold mt-3 text-lg">
                   {fileName || 'File Selected'}
                 </Text>
                 <Text className="text-text-muted text-xs mt-1">Tap to change file</Text>
               </View>
             ) : (
               <View className="items-center">
                 <View className="p-4 bg-gray-100 rounded-full mb-4">
                   <UploadCloud size={36} color={COLORS.textMuted} />
                 </View>
                 <Text className="text-text-muted font-bold text-lg">
                   {t('onboarding.business.reg.tapToUpload')}
                 </Text>
                 <Text className="text-gray-400 text-xs mt-2">PDF or Image accepted</Text>
               </View>
             )}
          </Pressable>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="px-4 text-gray-400 font-bold uppercase" style={{ fontSize: 10 }}>OR TAKE PHOTO</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <Pressable
            onPress={handleCamera}
            className="flex-row items-center justify-center py-4 bg-white rounded-2xl border border-gray-200"
          >
            <Camera size={20} color={COLORS.textMuted} />
            <Text className="ml-2 font-bold text-text-muted">Open Camera</Text>
          </Pressable>
        </View>

        <View className="mt-12 p-5 bg-gray-50 border border-gray-100 rounded-3xl">
          <View className="flex-row mb-2">
             <FileText size={16} color={COLORS.primaryGreen} />
             <Text className="font-bold text-sm ml-2 text-text-primary uppercase tracking-tight">Legal Requirement</Text>
          </View>
          <Text className="text-text-muted text-xs leading-5">
            Sri Lankan law requires businesses to be registered. Your certificate allows us to grant you higher transaction limits and verified status.
          </Text>
        </View>
      </ScrollView>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleContinue}
          disabled={!fileUri}
          className={`py-4 rounded-2xl items-center ${fileUri ? 'bg-primary-green' : 'bg-gray-300'}`}
        >
          <Text className="text-white font-bold text-lg lowercase">
            {t('onboarding.business.reg.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
