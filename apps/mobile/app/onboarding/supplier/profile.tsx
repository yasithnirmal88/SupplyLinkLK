import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, User } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { COLORS } from '../../../constants/Colors';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name is too short'),
  address: z.string().min(5, 'Address is too short'),
  district: z.string().min(1, 'Please select a district'),
});

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
].sort();

export default function SupplierProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { updateProfile, displayName, address, district, profilePhotoUrl } = useKycStore();

  const [photo, setPhoto] = useState<string | undefined>(profilePhotoUrl);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: displayName || '',
      address: address || '',
      district: district || '',
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const onSubmit = (data: any) => {
    updateProfile({ ...data, profilePhotoUrl: photo });
    router.push('/onboarding/supplier/nic-upload');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ProgressBar current={1} total={7} />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.supplier.profile.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.supplier.profile.subtitle')}
          </Text>
        </View>

        {/* Profile Photo Picker */}
        <View className="items-center mb-8">
          <Pressable 
            onPress={pickImage}
            className="items-center justify-center rounded-full overflow-hidden"
            style={{ 
              width: 120, 
              height: 120, 
              backgroundColor: '#E5E7EB',
              borderWidth: 2,
              borderColor: COLORS.primaryGreen
            }}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <User size={48} color="#9CA3AF" />
            )}
            <View className="absolute bottom-0 right-0 p-2 bg-primary-green rounded-full m-1">
              <Camera size={16} color="white" />
            </View>
          </Pressable>
          <Text className="text-text-muted mt-3 font-semibold" style={{ fontSize: 13 }}>
            {t('onboarding.supplier.profile.photoTitle')}
          </Text>
        </View>

        <View className="gap-5">
          {/* Name Input */}
          <View>
            <Text className="font-bold mb-2 text-text-primary" style={{ fontSize: 14 }}>
              {t('onboarding.supplier.profile.name')}
            </Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border rounded-xl px-4 py-4 text-text-primary"
                  style={{ borderColor: errors.displayName ? '#EF4444' : '#E5E7EB', fontSize: 16 }}
                  placeholder={t('onboarding.supplier.profile.namePlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.displayName && (
              <Text className="text-red-500 text-xs mt-1">{errors.displayName.message as string}</Text>
            )}
          </View>

          {/* District Picker (Simplified for brevity, using ScrollView or select) */}
          <View>
            <Text className="font-bold mb-2 text-text-primary" style={{ fontSize: 14 }}>
              {t('onboarding.supplier.profile.district')}
            </Text>
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-2"
                >
                  {DISTRICTS.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => onChange(d)}
                      className={`px-4 py-2 rounded-full border ${value === d ? 'bg-primary-green border-primary-green' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={value === d ? 'text-white font-bold' : 'text-text-muted'}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            />
            {errors.district && (
              <Text className="text-red-500 text-xs mt-1">{errors.district.message as string}</Text>
            )}
          </View>

          {/* Address Input */}
          <View className="mb-10">
            <Text className="font-bold mb-2 text-text-primary" style={{ fontSize: 14 }}>
              {t('onboarding.supplier.profile.address')}
            </Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border rounded-xl px-4 py-4 text-text-primary"
                  style={{ 
                    borderColor: errors.address ? '#EF4444' : '#E5E7EB', 
                    fontSize: 16,
                    height: 100,
                    textAlignVertical: 'top'
                  }}
                  multiline
                  placeholder={t('onboarding.supplier.profile.addressPlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.address && (
              <Text className="text-red-500 text-xs mt-1">{errors.address.message as string}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View className="p-6 bg-background">
        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="bg-primary-green py-4 rounded-2xl items-center active:opacity-90"
        >
          <Text className="text-white font-bold text-lg">
            {t('onboarding.supplier.profile.continue')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
