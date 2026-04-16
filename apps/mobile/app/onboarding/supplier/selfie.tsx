import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, RotateCw, Check, X } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';

export default function SelfieScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateSelfie } = useKycStore();
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center mb-4">We need camera access to verify your identity</Text>
        <Pressable onPress={requestPermission} className="bg-primary-green px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef['current']) {
      const result = await cameraRef['current'].takePictureAsync({
        quality: 0.7,
      });
      if (result) setPhoto(result.uri);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      updateSelfie(photo);
      router.push('/onboarding/supplier/categories');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="bg-background pt-2">
        <ProgressBar current={3} total={7} />
      </View>

      <View className="flex-1 bg-black overflow-hidden">
        {photo ? (
          <Image source={{ uri: photo }} className="flex-1" />
        ) : (
          <CameraView 
            ref={cameraRef}
            className="flex-1"
            facing="front"
          >
            {/* Guide overlay */}
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-72 h-96 border-4 border-white border-dashed opacity-50" 
                style={{ borderRadius: 150 }}
              />
            </View>
          </CameraView>
        )}
      </View>

      <View className="bg-background p-8">
        <Text className="text-2xl font-bold text-center text-text-primary">
          {photo ? t('onboarding.supplier.selfie.confirm') : t('onboarding.supplier.selfie.title')}
        </Text>
        <Text className="text-text-muted text-center mt-2 mb-8">
          {photo ? "Does this look clear?" : t('onboarding.supplier.selfie.subtitle')}
        </Text>

        <View className="flex-row justify-center items-center gap-8">
          {photo ? (
            <>
              <Pressable 
                onPress={() => setPhoto(null)} 
                className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={32} color="#EF4444" />
              </Pressable>
              <Pressable 
                onPress={handleConfirm} 
                className="w-20 h-20 rounded-full bg-primary-green items-center justify-center"
              >
                <Check size={40} color="white" />
              </Pressable>
            </>
          ) : (
            <Pressable 
              onPress={takePhoto} 
              className="w-20 h-20 rounded-full bg-primary-green items-center justify-center border-4 border-white/30"
            >
              <View className="w-16 h-16 rounded-full border-2 border-white items-center justify-center">
                <CameraIcon size={32} color="white" />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
