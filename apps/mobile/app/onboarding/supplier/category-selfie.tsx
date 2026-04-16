import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Check, X, Box } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';

export default function CategorySelfieScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    selectedCategories, 
    currentCategoryIndex, 
    updateCategorySelfie, 
    nextCategory 
  } = useKycStore();
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const currentCategory = selectedCategories[currentCategoryIndex];

  if (!currentCategory) {
    return null;
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-center mb-4">We need camera access to verify your supply</Text>
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

  const handleNext = () => {
    if (photo) {
      updateCategorySelfie(currentCategory.slug, photo);
      setPhoto(null);
      const hasMore = nextCategory();
      if (!hasMore) {
        router.push('/onboarding/supplier/review');
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="bg-background pt-2">
        <ProgressBar current={5} total={7} />
      </View>

      <View className="flex-1 bg-black overflow-hidden">
        {photo ? (
          <Image source={{ uri: photo }} className="flex-1" />
        ) : (
          <CameraView 
            ref={cameraRef}
            className="flex-1"
            facing="back"
          >
            {/* Guide overlay */}
            <View className="flex-1 items-center justify-center">
              <View className="items-center px-10">
                <View className="w-full aspect-square border-4 border-white/50 border-dashed rounded-3xl" />
                <Text className="text-white font-bold mt-4 text-center text-lg shadow-lg">
                  Place {currentCategory.name} inside the frame
                </Text>
              </View>
            </View>
          </CameraView>
        )}
      </View>

      <View className="bg-background p-8">
        <View className="flex-row items-center justify-center mb-2">
           <Box size={24} color="#2D6A4F" />
           <Text className="text-xl font-bold ml-2 text-text-primary uppercase tracking-widest">
             {currentCategory.name}
           </Text>
        </View>
        
        <Text className="text-text-muted text-center mb-8">
          {photo ? "Confirmation" : t('onboarding.supplier.catSelfie.instruction')}
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
                onPress={handleNext} 
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
                <Camera size={32} color="white" />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
