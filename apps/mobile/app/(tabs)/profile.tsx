import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Settings, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Info,
  ShieldCheck,
  CreditCard,
  User,
  BadgeCheck,
  TrendingUp,
  Package,
  Layers,
  MessageSquare,
  Award,
  Star as StarIcon,
  Calendar,
  Camera
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';
import { logout } from '../../services/auth';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storage';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid, role, displayName, phoneNumber, logout: clearStore } = useAuthStore();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setProfileData(snap.data());
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
    clearStore();
    router.replace('/(auth)/splash');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const url = await uploadImage(result.assets[0].uri, `profiles/${uid}.jpg`);
        await updateDoc(doc(db, 'users', uid), { photoUrl: url });
        setProfileData({ ...profileData, photoUrl: url });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo');
      } finally {
        setUploading(false);
      }
    }
  };

  const ProfileItem = ({ icon: Icon, label, color = "#64748B", onPress, badge }: any) => (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center bg-white px-6 py-4 mb-2 rounded-2xl border border-slate-50 active:bg-slate-50"
    >
       <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-4">
          <Icon size={20} color={color} />
       </View>
       <Text className="flex-1 text-slate-700 font-bold uppercase text-xs tracking-tight">{label}</Text>
       {badge && (
          <View className="bg-primary-green/10 px-2 py-1 rounded-lg mr-2">
             <Text className="text-primary-green font-black text-[8px] uppercase">{badge}</Text>
          </View>
       )}
       <ChevronRight size={16} color="#CBD5E1" />
    </Pressable>
  );

  if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator color={COLORS.primaryGreen} /></View>;

  const isSupplier = role === 'supplier';
  const isApproved = profileData?.verificationStatus === 'approved';

  return (
    <ScrollView 
       className="flex-1 bg-slate-50"
       showsVerticalScrollIndicator={false}
       contentContainerStyle={{ paddingBottom: 100 }}
    >
        {/* Profile Header */}
        <View className="bg-white px-8 pb-10 pt-16 rounded-b-[4rem] shadow-sm shadow-slate-200">
           <View className="flex-row justify-between items-start mb-8">
              <View>
                 <Text className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                    {profileData?.plan === 'pro' ? '🏆 Pro Participant' : 'Starter Account'}
                 </Text>
                 <View className="flex-row items-center">
                    <Text className="text-3xl font-black text-slate-900 uppercase tracking-tight mr-2">{displayName}</Text>
                    {isApproved && <ShieldCheck size={24} color={COLORS.primaryGreen} fill={COLORS.primaryGreen + '20'} />}
                 </View>
                 <Text className="text-slate-400 font-bold text-sm mt-1 flex-row items-center">
                    <MapPin size={12} color="#94A3B8" /> {profileData?.district || 'Western District'}
                 </Text>
              </View>
              <Pressable onPress={pickImage} className="relative">
                 <View className="w-20 h-20 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-md">
                   {profileData?.photoUrl ? (
                      <ExpoImage source={{ uri: profileData.photoUrl }} className="w-full h-full" transition={1000} />
                   ) : (
                      <View className="w-full h-full items-center justify-center"><User size={32} color="#CBD5E1" /></View>
                   )}
                 </View>
                 <View className="absolute bottom-0 right-0 bg-primary-green w-7 h-7 rounded-full items-center justify-center border-2 border-white">
                    {uploading ? <ActivityIndicator size="small" color="white" /> : <Camera size={14} color="white" />}
                 </View>
              </Pressable>
           </View>

           <View className="flex-row gap-4">
              <View className="flex-1 bg-slate-50 p-4 rounded-3xl items-center border border-slate-100">
                 <View className="flex-row items-center mb-1">
                    <StarIcon size={14} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-lg font-black text-slate-900 ml-1">{profileData?.averageRating || '5.0'}</Text>
                 </View>
                 <Text className="text-[10px] font-bold text-slate-400 uppercase">{profileData?.reviewCount || '0'} Reviews</Text>
              </View>
              <View className="flex-1 bg-slate-50 p-4 rounded-3xl items-center border border-slate-100">
                 <Calendar size={14} color="#94A3B8" />
                 <Text className="text-[10px] font-bold text-slate-400 uppercase mt-1">Since {new Date(profileData?.createdAt).getFullYear()}</Text>
              </View>
           </View>
        </View>

        <View className="px-6 mt-8">
           <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Marketplace Management</Text>
           {isSupplier ? (
             <>
                <ProfileItem 
                  icon={Package} label="My Active Supply Ads" 
                  onPress={() => alert('Feature coming soon')} 
                />
                <ProfileItem 
                  icon={Layers} label="Proposals & Offers" 
                  onPress={() => alert('Feature coming soon')} 
                />
             </>
           ) : (
             <>
                <ProfileItem 
                  icon={Package} label="Our Demand Posts" 
                  onPress={() => alert('Feature coming soon')} 
                />
                <ProfileItem 
                  icon={Layers} label="Browse Received Offers" 
                  onPress={() => alert('Feature coming soon')} 
                />
             </>
           )}
           <ProfileItem 
              icon={TrendingUp} label="Business Analytics" 
              color={COLORS.primaryGreen}
              onPress={() => router.push('/analytics')}
           />

           <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4 ml-2">Account Settings</Text>
           <ProfileItem icon={BadgeCheck} label="Verification Status" badge={profileData?.verificationStatus} />
           <ProfileItem icon={CreditCard} label="Billing & Payouts" />
           <ProfileItem 
              icon={Settings} label="App Settings & Privacy" 
              onPress={() => router.push('/settings')}
           />

           <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4 ml-2">Support & Legal</Text>
           <ProfileItem icon={Info} label="Help Center & Support" />
           <ProfileItem icon={ShieldCheck} label="Privacy Policy" />

           <Pressable 
              onPress={handleLogout}
              className="mt-12 mb-20 flex-row items-center justify-center py-4 bg-rose-50 rounded-2xl border border-rose-100"
           >
              <LogOut size={20} color="#F43F5E" />
              <Text className="ml-3 text-rose-500 font-black uppercase text-xs tracking-tight">Logout from Account</Text>
           </Pressable>
    </View>
  );
}
