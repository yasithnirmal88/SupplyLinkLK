import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Save, 
  ShieldAlert, 
  MapPin, 
  User, 
  AlignLeft,
  BadgeCheck,
  Camera,
  Building,
  Check,
  ChevronRight
} from 'lucide-react-native';
import { Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { uploadImage } from '../services/storage';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';
import { COLORS } from '../constants/Colors';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { uid, role, displayName } = useAuthStore();
  const setDisplayName = useAuthStore((s) => s.setDisplayName);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [district, setDistrict] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [categoriesText, setCategoriesText] = useState('');
  const [languagesText, setLanguagesText] = useState('');
  const [districtModalOpen, setDistrictModalOpen] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setName(data.displayName || '');
          setBio(data.bio || '');
          setDistrict(data.district || '');
          setBusinessName(data.businessName || '');
          setPhotoUrl(data.photoUrl || data.avatarUrl || data.profilePhotoUrl || '');
          setCategoriesText(Array.isArray(data.categories) ? data.categories.filter(Boolean).join(', ') : (data.categories || ''));
          setLanguagesText(Array.isArray(data.languages) ? data.languages.filter(Boolean).join(', ') : (data.languages || ''));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  const handlePickPhoto = async () => {
    if (!uid) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const url = await uploadImage(asset.uri, `profiles/${uid}-${Date.now()}.jpg`);
        setPhotoUrl(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Profile photo upload failed:', error);
        Alert.alert('Upload Failed', 'Could not upload profile photo. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !district.trim()) {
      Alert.alert('Validation Error', 'Name and District are required.');
      return;
    }

    const categories = categoriesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const languages = languagesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (categories.length > 10) {
      Alert.alert('Validation Error', 'Please use up to 10 categories.');
      return;
    }

    if (languages.length > 5) {
      Alert.alert('Validation Error', 'Please use up to 5 languages.');
      return;
    }

    const normalizedCategories = categories.slice(0, 10);
    const normalizedLanguages = languages.slice(0, 5);

    setSaving(true);
    const previousDisplayName = displayName;

    try {
      if (name !== displayName) {
        setDisplayName?.(name.trim());
      }

      const body: any = {
        displayName: name.trim(),
        bio: bio.trim(),
        district: district.trim(),
      };

      if (businessName.trim()) {
        body.businessName = businessName.trim();
      }

      if (photoUrl.trim()) {
        body.photoUrl = photoUrl.trim();
      }

      if (normalizedCategories.length) {
        body.categories = normalizedCategories;
      }

      if (normalizedLanguages.length) {
        body.languages = normalizedLanguages;
      }

      await apiClient('/users/profile', {
        method: 'PATCH',
        body,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Could not update profile');
      if (previousDisplayName) {
        setDisplayName?.(previousDisplayName);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  const isApproved = profile?.verificationStatus === 'approved';

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        className="px-6 pb-4 pt-4 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm z-10"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-50">
            <ArrowLeft size={24} color="#0F172A" />
          </Pressable>
          <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">{t('profile.editProfile')}</Text>
        </View>
        <Pressable 
          onPress={handleSave} 
          disabled={saving || uploading}
          className={`flex-row items-center px-4 py-2 rounded-xl ${saving || uploading ? 'bg-slate-200' : 'bg-slate-900'}`}
        >
          {saving ? (
             <ActivityIndicator size="small" color="#94A3B8" />
          ) : (
             <>
                <Save size={16} color="white" />
                <Text className="text-white font-bold text-xs uppercase tracking-widest ml-2">Save</Text>
             </>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-8 p-5 rounded-3xl border border-emerald-100 bg-emerald-50 shadow-sm">
          <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Verification Reminder</Text>
          <Text className="text-slate-700 text-xs leading-5">
            Changes to your business name, operating district, or profile photo will re-open verification review if your account is already approved.
          </Text>
        </View>

        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Profile Photo</Text>
        <View className="mb-6 flex-row items-center justify-between bg-white border border-slate-200 rounded-3xl p-4">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-3xl bg-slate-100 overflow-hidden items-center justify-center">
              {photoUrl ? (
                <ExpoImage source={{ uri: photoUrl }} className="w-full h-full" transition={1000} />
              ) : (
                <User size={28} color="#94A3B8" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-bold">Profile image</Text>
              <Text className="text-slate-500 text-xs">Update the photo reviewed by KYC.</Text>
            </View>
          </View>
          <Pressable
            onPress={handlePickPhoto}
            className="bg-slate-900 px-4 py-2 rounded-2xl"
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Camera size={14} color="white" />
                <Text className="text-white uppercase text-xs font-bold">Change</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Basic Information</Text>

        <View className="mb-6 relative">
          <View className="absolute left-4 top-4 z-10"><User size={20} color="#94A3B8" /></View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Display Name"
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-slate-900 focus:border-primary-green"
          />
        </View>

        <View className="mb-6 relative">
          <View className="absolute left-4 top-4 z-10"><AlignLeft size={20} color="#94A3B8" /></View>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Add a short bio about what you do..."
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-700 min-h-[100px] focus:border-primary-green"
          />
          <Text className="text-right text-[10px] font-bold text-slate-400 mt-2 mr-2">{bio.length}/300</Text>
        </View>

        <View className="mb-6 relative">
          <View className="absolute left-4 top-4 z-10"><MapPin size={20} color="#94A3B8" /></View>
          <Pressable
            onPress={() => setDistrictModalOpen(true)}
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 flex-row items-center justify-between"
          >
            <Text className={`text-base font-bold ${district ? 'text-slate-900' : 'text-slate-400'}`}>
              {district || 'Select Operating District'}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>

        <Modal visible={districtModalOpen} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[3rem] p-8 max-h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black uppercase tracking-tight">Select District</Text>
                <Pressable onPress={() => setDistrictModalOpen(false)}>
                  <Text className="text-emerald-600 font-bold">Done</Text>
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => {
                      setDistrict(d);
                      setDistrictModalOpen(false);
                    }}
                    className="py-4 border-b border-slate-100 flex-row justify-between items-center"
                  >
                    <Text className={`text-base ${district === d ? 'font-black text-emerald-700' : 'font-medium text-slate-700'}`}>
                      {d}
                    </Text>
                    {district === d && <Check size={18} color="#059669" />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View className="mb-6 relative">
          <View className="absolute left-4 top-4 z-10"><Building size={20} color="#94A3B8" /></View>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Business Name (optional)"
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-slate-900 focus:border-primary-green"
          />
        </View>

        <View className="mb-6 relative">
          <View className="absolute left-4 top-4 z-10"><AlignLeft size={20} color="#94A3B8" /></View>
          <TextInput
            value={categoriesText}
            onChangeText={setCategoriesText}
            placeholder="Categories (comma separated)"
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-slate-900 focus:border-primary-green"
          />
        </View>

        <View className="mb-8 relative">
          <View className="absolute left-4 top-4 z-10"><AlignLeft size={20} color="#94A3B8" /></View>
          <TextInput
            value={languagesText}
            onChangeText={setLanguagesText}
            placeholder="Languages (comma separated)"
            className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-slate-900 focus:border-primary-green"
          />
        </View>

        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 mt-4">Protected Information</Text>
        
        <View className="bg-slate-100 rounded-3xl p-6 border border-slate-200 mb-10 opacity-70">
           <View className="flex-row items-center mb-4">
              <ShieldAlert size={18} color="#64748B" />
              <Text className="text-slate-500 font-bold ml-2 text-xs uppercase tracking-widest">Read Only</Text>
           </View>

           <View className="mb-5 border-b border-slate-200 pb-5">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Role</Text>
              <Text className="text-base font-black text-slate-800 uppercase tracking-tight">{role}</Text>
           </View>

           <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</Text>
              <Text className="text-base font-black text-slate-800 tracking-tight">{profile?.phoneNumber || 'Not provided'}</Text>
           </View>
           
           <Pressable 
             onPress={() => Alert.alert('Request Change', 'To change your role or phone number, please contact support and complete a new verification request.')}
             className="mt-6 bg-white border border-slate-200 py-3 rounded-xl items-center"
           >
              <Text className="text-slate-600 font-bold text-xs uppercase tracking-widest">Request Change</Text>
           </Pressable>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
