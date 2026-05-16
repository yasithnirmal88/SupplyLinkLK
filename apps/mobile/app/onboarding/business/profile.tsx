import React from 'react';
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
import { Camera, Store } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { useAuthStore } from '../../../stores/authStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { COLORS } from '../../../constants/Colors';

const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is too short'),
  contactPerson: z.string().min(2, 'Contact name is too short'),
  businessType: z.string().min(1, 'Please select a business type'),
  district: z.string().min(1, 'Please select a district'),
  address: z.string().min(5, 'Address is too short'),
});

const BUSINESS_TYPES = [
  'Importer', 'Distributor', 'Restaurant', 'Hotel', 'Supermarket', 'Other'
];

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
].sort();

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { phoneNumber: authPhone } = useAuthStore();
  const { 
    updateProfile, 
    businessName, 
    contactPerson, 
    businessType, 
    district, 
    address, 
    profilePhotoUrl 
  } = useKycStore();

  const [photo, setPhoto] = React.useState<string | undefined>(profilePhotoUrl);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: businessName || '',
      contactPerson: contactPerson || '',
      businessType: businessType || '',
      district: district || '',
      address: address || '',
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const onSubmit = (data: any) => {
    updateProfile({ 
      ...data, 
      profilePhotoUrl: photo,
      phoneNumber: authPhone || undefined
    });
    router.push('/onboarding/business/nic-upload');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ProgressBar current={1} total={5} />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.business.profile.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.business.profile.subtitle')}
          </Text>
        </View>

        {/* Business Storefront Picker */}
        <View className="items-center mb-8">
          <Pressable 
            onPress={pickImage}
            className="w-full aspect-[2/1] bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 items-center justify-center"
          >
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View className="items-center">
                <View className="p-4 bg-white rounded-full mb-2 shadow-sm">
                  <Store size={32} color={COLORS.primaryGreen} />
                </View>
                <Text className="text-text-muted font-bold">
                  {t('onboarding.business.profile.photoTitle')}
                </Text>
              </View>
            )}
            <View className="absolute bottom-4 right-4 p-2 bg-primary-green rounded-full">
              <Camera size={18} color="white" />
            </View>
          </Pressable>
        </View>

        <View className="gap-5 pb-10">
          {/* Business Name */}
          <View>
            <Text className="font-bold mb-2 text-text-primary">
              {t('onboarding.business.profile.bizName')}
            </Text>
            <Controller
              control={control}
              name="businessName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border rounded-xl px-4 py-4 text-text-primary border-gray-200"
                  style={{ borderColor: errors.businessName ? '#EF4444' : '#E5E7EB' }}
                  placeholder={t('onboarding.business.profile.bizPlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Contact Person */}
          <View>
            <Text className="font-bold mb-2 text-text-primary">
              {t('onboarding.business.profile.contactName')}
            </Text>
            <Controller
              control={control}
              name="contactPerson"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border rounded-xl px-4 py-4 text-text-primary border-gray-200"
                  style={{ borderColor: errors.contactPerson ? '#EF4444' : '#E5E7EB' }}
                  placeholder={t('onboarding.business.profile.contactPlaceholder')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Business Type Selector (Custom Chips) */}
          <View>
            <Text className="font-bold mb-2 text-text-primary">
              {t('onboarding.business.profile.bizType')}
            </Text>
            <Controller
              control={control}
              name="businessType"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => onChange(type)}
                      className={`px-4 py-2 rounded-full border ${value === type ? 'bg-primary-green border-primary-green' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={value === type ? 'text-white font-bold' : 'text-text-muted'}>
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            />
          </View>

          {/* District Selector */}
          <View>
            <Text className="font-bold mb-2 text-text-primary">
              {t('onboarding.business.profile.district')}
            </Text>
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
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
          </View>

          {/* Address */}
          <View>
            <Text className="font-bold mb-2 text-text-primary">
              Business Address
            </Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border rounded-xl px-4 py-4 text-text-primary border-gray-200"
                  multiline
                  numberOfLines={3}
                  style={{ 
                    borderColor: errors.address ? '#EF4444' : '#E5E7EB',
                    height: 80,
                    textAlignVertical: 'top'
                  }}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="bg-primary-green py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            {t('onboarding.business.profile.continue')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
