import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Platform
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
  Star as StarIcon,
  Calendar,
  Camera,
  ChevronLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { MotiView, MotiText, AnimatePresence } from 'moti';

import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';
import { signOutUser as authLogout } from '../../services/auth';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storage';

const ProfileItem = ({ icon: Icon, label, color = "#64748B", onPress, badge, index }: any) => (
  <MotiView
    from={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 400 + index * 50 }}
  >
    <Pressable 
      onPress={onPress}
      className="flex-row items-center bg-white px-6 py-4 mb-3 rounded-[24px] border border-slate-50 active:bg-slate-50 shadow-sm shadow-slate-200/50"
    >
       <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center mr-4">
          <Icon size={18} color={color} strokeWidth={2.5} />
       </View>
       <Text className="flex-1 text-slate-700 font-black text-xs uppercase tracking-widest">{label}</Text>
       {badge && (
          <View className="bg-primary-green/10 px-2.5 py-1 rounded-lg mr-2 border border-primary-green/20">
             <Text className="text-primary-green font-black text-[8px] uppercase tracking-widest">{badge}</Text>
          </View>
       )}
       <ChevronRight size={16} color="#CBD5E1" />
    </Pressable>
  </MotiView>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid, role, displayName, logout: clearStore } = useAuthStore();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc((db as any), 'users', uid as any));
        if (snap && typeof snap.exists === 'function' && snap.exists()) setProfileData(snap.data());
      } catch (e) {
        console.warn('Failed to fetch profile', e);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await authLogout();
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
        await updateDoc(doc(db, 'users', uid as string), { photoUrl: url });
        setProfileData({ ...profileData, photoUrl: url });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        Alert.alert('Error', 'Failed to upload photo');
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-slate-50"><ActivityIndicator color={COLORS.primaryGreen} /></View>;

  const isSupplier = role === 'supplier';
  const isApproved = profileData?.verificationStatus === 'approved';

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
         className="flex-1"
         showsVerticalScrollIndicator={false}
         contentContainerStyle={{ paddingBottom: 120 }}
      >
          {/* Modern Header Section */}
          <View className="bg-white rounded-b-[3.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
             <View 
               className="px-8 pb-10" 
               style={{ paddingTop: insets.top + 20 }}
             >
                <MotiView 
                  from={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-row justify-between items-center mb-10"
                >
                   <Text className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                     Profile
                   </Text>
                   <Pressable className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
                      <Settings size={20} color={COLORS.textPrimary} />
                   </Pressable>
                </MotiView>

                <View className="flex-row items-center">
                   <Pressable onPress={pickImage} className="relative mr-6">
                      <MotiView 
                        from={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-[32px] bg-slate-100 overflow-hidden border-4 border-white shadow-xl"
                      >
                        {profileData?.photoUrl ? (
                           <ExpoImage source={{ uri: profileData.photoUrl }} className="w-full h-full" transition={1000} />
                        ) : (
                           <View className="w-full h-full items-center justify-center"><User size={40} color="#CBD5E1" /></View>
                        )}
                      </MotiView>
                      <View className="absolute -bottom-1 -right-1 bg-primary-green w-8 h-8 rounded-full items-center justify-center border-4 border-white">
                         {uploading ? <ActivityIndicator size="small" color="white" /> : <Camera size={14} color="white" />}
                      </View>
                   </Pressable>

                   <View className="flex-1">
                      <MotiText 
                        from={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-black text-slate-900 uppercase tracking-tight"
                      >
                        {displayName}
                      </MotiText>
                      <View className="flex-row items-center mt-1">
                         <MapPin size={12} color={COLORS.primaryGreen} />
                         <Text className="text-slate-400 font-bold text-xs ml-1">{profileData?.district || 'Colombo'}</Text>
                      </View>
                      <View className="flex-row items-center mt-3">
                         {isApproved ? (
                           <View className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                              <ShieldCheck size={14} color={COLORS.primaryGreen} />
                              <Text className="ml-1.5 text-primary-green font-black text-[10px] uppercase tracking-widest">Verified</Text>
                           </View>
                         ) : (
                           <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                              <BadgeCheck size={14} color="#D97706" />
                              <Text className="ml-1.5 text-amber-700 font-black text-[10px] uppercase tracking-widest">Pending</Text>
                           </View>
                         )}
                      </View>
                   </View>
                </View>

                <View className="flex-row gap-4 mt-10">
                   <View className="flex-1 bg-slate-50 p-5 rounded-[28px] border border-slate-100 items-center">
                      <View className="flex-row items-center mb-1">
                         <StarIcon size={14} color="#FBBF24" fill="#FBBF24" />
                         <Text className="text-xl font-black text-slate-900 ml-1.5">{profileData?.averageRating || '5.0'}</Text>
                      </View>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</Text>
                   </View>
                   <View className="flex-1 bg-slate-50 p-5 rounded-[28px] border border-slate-100 items-center">
                      <Calendar size={18} color={COLORS.primaryGreen} />
                      <Text className="text-xl font-black text-slate-900 mt-1">2026</Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</Text>
                   </View>
                </View>
             </View>
          </View>

          <View className="px-8 mt-10">
             <Text className="text-[10px] font-black text-primary-green uppercase tracking-[0.2em] mb-6 ml-1">Marketplace</Text>
             {isSupplier ? (
               <>
                  <ProfileItem 
                    icon={Package} label="My Listings" 
                    index={0}
                    onPress={() => router.push('/post/my-ads')} 
                  />
                  <ProfileItem 
                    icon={Layers} label="Proposals" 
                    index={1}
                    onPress={() => router.push('/offers/review')} 
                  />
               </>
             ) : (
               <>
                  <ProfileItem 
                    icon={Package} label="Our Demands" 
                    index={0}
                    onPress={() => router.push('/post/my-demands')} 
                  />
                  <ProfileItem 
                    icon={Layers} label="Recieved Offers" 
                    index={1}
                    onPress={() => router.push('/offers/review')} 
                  />
               </>
             )}
             <ProfileItem 
                icon={TrendingUp} label="Business Insights" 
                color={COLORS.primaryGreen}
                index={2}
                onPress={() => router.push('/analytics')}
             />

             <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-6 ml-1">Settings & Security</Text>
             <ProfileItem icon={CreditCard} label="Payments & Billing" index={3} />
             <ProfileItem icon={Info} label="Help & Support" index={4} />
             <ProfileItem icon={ShieldCheck} label="Privacy Policy" index={5} />

             <MotiView
               from={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 1000 }}
             >
                <Pressable 
                   onPress={handleLogout}
                   className="mt-12 flex-row items-center justify-center py-6 bg-rose-50 rounded-[32px] border border-rose-100 active:bg-rose-100 active:scale-95 transition-all"
                >
                   <LogOut size={20} color="#F43F5E" strokeWidth={3} />
                   <Text className="ml-3 text-rose-500 font-black uppercase text-xs tracking-widest">Sign Out</Text>
                </Pressable>
             </MotiView>

             <Text className="text-center text-slate-300 font-bold text-[10px] uppercase tracking-widest mt-12">
               SupplyLink LK v1.2.0
             </Text>
          </View>
      </ScrollView>
    </View>
  );
};
}
