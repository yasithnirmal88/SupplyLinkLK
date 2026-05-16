import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, MapPin, LogOut, ChevronRight, Info, ShieldCheck, CreditCard, User, BadgeCheck, TrendingUp, Package, Layers, Star as StarIcon, Calendar, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';
import { signOutUser as authLogout } from '../../services/auth';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '../../services/storage';

const ProfileItem = ({ icon: Icon, label, color = "#64748B", onPress, badge }: any) => (
  <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 24, paddingVertical: 16, marginBottom: 12, borderRadius: 24, borderWidth: 1, borderColor: '#F8FAFC' }}>
    <View style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
      <Icon size={18} color={color} strokeWidth={2.5} />
    </View>
    <Text style={{ flex: 1, color: '#334155', fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>{label}</Text>
    {badge && (
      <View style={{ backgroundColor: 'rgba(45,106,79,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: 'rgba(45,106,79,0.2)' }}>
        <Text style={{ color: COLORS.primaryGreen, fontWeight: '900', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2 }}>{badge}</Text>
      </View>
    )}
    <ChevronRight size={16} color="#CBD5E1" />
  </Pressable>
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
        const snap = await getDoc(doc(db, 'users', uid as string));
        if (snap.exists()) setProfileData(snap.data());
      } catch (e) { console.warn('Failed to fetch profile', e); }
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) {
      setUploading(true);
      try {
        const url = await uploadImage(result.assets[0].uri, `profiles/${uid}.jpg`);
        await updateDoc(doc(db, 'users', uid as string), { photoUrl: url });
        setProfileData({ ...profileData, photoUrl: url });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) { Alert.alert('Error', 'Failed to upload photo'); }
      finally { setUploading(false); }
    }
  };

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}><ActivityIndicator color={COLORS.primaryGreen} /></View>;

  const isSupplier = role === 'supplier';
  const isApproved = profileData?.verificationStatus === 'approved';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: 'white', borderBottomLeftRadius: 56, borderBottomRightRadius: 56, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 32, paddingBottom: 40, paddingTop: insets.top + 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ color: '#94A3B8', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>Profile</Text>
              <Pressable style={{ width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Settings size={20} color={COLORS.textPrimary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={pickImage} style={{ position: 'relative', marginRight: 24 }}>
                <View style={{ width: 96, height: 96, borderRadius: 32, backgroundColor: '#F1F5F9', overflow: 'hidden', borderWidth: 4, borderColor: 'white' }}>
                  {profileData?.photoUrl ? <ExpoImage source={{ uri: profileData.photoUrl }} style={{ width: '100%', height: '100%' }} transition={1000} /> : <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}><User size={40} color="#CBD5E1" /></View>}
                </View>
                <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: COLORS.primaryGreen, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'white' }}>
                  {uploading ? <ActivityIndicator size="small" color="white" /> : <Camera size={14} color="white" />}
                </View>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' }}>{displayName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <MapPin size={12} color={COLORS.primaryGreen} />
                  <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>{profileData?.district || 'Colombo'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  {isApproved ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#D1FAE5' }}>
                      <ShieldCheck size={14} color={COLORS.primaryGreen} />
                      <Text style={{ marginLeft: 6, color: COLORS.primaryGreen, fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Verified</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
                      <BadgeCheck size={14} color="#D97706" />
                      <Text style={{ marginLeft: 6, color: '#92400E', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 40 }}>
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <StarIcon size={14} color="#FBBF24" fill="#FBBF24" />
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginLeft: 6 }}>{profileData?.averageRating || '5.0'}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2 }}>Rating</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' }}>
                <Calendar size={18} color={COLORS.primaryGreen} />
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 4 }}>2026</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2 }}>Joined</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 32, marginTop: 40 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', color: COLORS.primaryGreen, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 24, marginLeft: 4 }}>Marketplace</Text>
          {isSupplier ? (
            <>
              <ProfileItem icon={Package} label="My Listings" onPress={() => router.push('/post/my-ads')} />
              <ProfileItem icon={Layers} label="Proposals" onPress={() => router.push('/offers/review')} />
            </>
          ) : (
            <>
              <ProfileItem icon={Package} label="Our Demands" onPress={() => router.push('/post/my-demands')} />
              <ProfileItem icon={Layers} label="Received Offers" onPress={() => router.push('/offers/review')} />
            </>
          )}
          <ProfileItem icon={TrendingUp} label="Business Insights" color={COLORS.primaryGreen} onPress={() => router.push('/analytics')} />
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 3, marginTop: 32, marginBottom: 24, marginLeft: 4 }}>Settings & Security</Text>
          <ProfileItem icon={CreditCard} label="Payments & Billing" />
          <ProfileItem icon={Info} label="Help & Support" />
          <ProfileItem icon={ShieldCheck} label="Privacy Policy" />
          <Pressable onPress={handleLogout} style={{ marginTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24, backgroundColor: '#FFF1F2', borderRadius: 32, borderWidth: 1, borderColor: '#FFE4E6' }}>
            <LogOut size={20} color="#F43F5E" strokeWidth={3} />
            <Text style={{ marginLeft: 12, color: '#F43F5E', fontWeight: '900', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2 }}>Sign Out</Text>
          </Pressable>
          <Text style={{ textAlign: 'center', color: '#CBD5E1', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginTop: 48 }}>SupplyLink LK v1.2.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}