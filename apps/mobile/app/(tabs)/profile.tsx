import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
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
  TrendingUp
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { displayName, role, district, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const ProfileItem = ({ icon: Icon, label, color = "#64748B", onPress }: any) => (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center bg-white px-6 py-4 mb-2 rounded-2xl border border-slate-50 active:bg-slate-50"
    >
       <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-4">
          <Icon size={20} color={color} />
       </View>
       <Text className="flex-1 font-bold text-slate-700">{label}</Text>
       <ChevronRight size={18} color="#CBD5E1" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header Profile */}
        <View 
          className="bg-primary-green px-8 pb-10 rounded-b-[3rem] shadow-xl shadow-emerald-900/40"
          style={{ paddingTop: insets.top + 20 }}
        >
          <View className="flex-row items-center">
             <View className="w-20 h-20 rounded-[2.5rem] bg-white p-1">
                <View className="w-full h-full rounded-[2.2rem] bg-emerald-50 items-center justify-center">
                   <User size={40} color={COLORS.primaryGreen} />
                </View>
             </View>
             <View className="ml-5">
                <View className="flex-row items-center">
                   <Text className="text-2xl font-black text-white">{displayName}</Text>
                   <View className="ml-2">
                      <BadgeCheck size={20} color="white" fill={COLORS.primaryGreen} />
                   </View>
                </View>
                <Text className="text-white/70 font-bold uppercase tracking-widest text-[10px] mt-1">
                   {role} • Verified Account
                </Text>
             </View>
          </View>
        </View>

        <View className="px-6 -mt-6">
           <View className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex-row justify-around">
              <View className="items-center">
                 <Text className="text-slate-400 font-bold text-[10px] uppercase">My Ads</Text>
                 <Text className="text-lg font-black text-slate-900">12</Text>
              </View>
              <View className="w-[1px] h-10 bg-slate-100" />
              <View className="items-center">
                 <Text className="text-slate-400 font-bold text-[10px] uppercase">Rating</Text>
                 <Text className="text-lg font-black text-slate-900">4.8</Text>
              </View>
              <View className="w-[1px] h-10 bg-slate-100" />
              <View className="items-center">
                 <Text className="text-slate-400 font-bold text-[10px] uppercase">Deals</Text>
                 <Text className="text-lg font-black text-slate-900">240</Text>
              </View>
           </View>
        </View>

        <View className="px-6 pt-8 pb-20">
           <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Personal Settings</Text>
           <ProfileItem 
              icon={TrendingUp} 
              label="View My Performance Analytics" 
              color={COLORS.primaryGreen}
              onPress={() => router.push('/analytics')}
           />
           <ProfileItem icon={User} label="Edit Profile Information" />
           <ProfileItem icon={MapPin} label="Manage Pickup Locations" />
           <ProfileItem icon={CreditCard} label="Payment & Payouts" />
           
           <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4 ml-2">Security & Help</Text>
           <ProfileItem icon={ShieldCheck} label="Account Security" color={COLORS.primaryGreen} />
           <ProfileItem icon={Info} label="Support Center" />
           
           <Pressable 
            onPress={handleLogout}
            className="flex-row items-center bg-rose-50 px-6 py-5 mt-8 rounded-2xl border border-rose-100 active:bg-rose-100"
           >
              <LogOut size={20} color="#F43F5E" />
              <Text className="ml-4 font-black text-rose-500 uppercase text-xs tracking-widest">Sign Out Account</Text>
           </Pressable>

           <Text className="text-center text-slate-300 font-bold text-[10px] mt-10 uppercase tracking-widest">
              SupplyLink LK • Version 1.0.0 (Build 42)
           </Text>
        </View>
      </ScrollView>
    </View>
  );
}
