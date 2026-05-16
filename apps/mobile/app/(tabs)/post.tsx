import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  PackagePlus, 
  ArrowRight, 
  Truck, 
  Store,
  MessageCircle,
  Shapes
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

export default function PostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useAuthStore();
  const isSupplier = role === 'supplier';

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
        <Text className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          Manage Offerings
        </Text>
        <Text className="text-slate-500 font-medium mb-8">
          {isSupplier 
            ? "Post your current stock to find buyers nearby." 
            : "Post a demand to find suppliers for your business."}
        </Text>

        <Pressable 
          onPress={() => isSupplier ? router.push('/post/supply-ad') : router.push('/post/demand-post')}
          className="bg-primary-green p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/40 mb-6 active:scale-[0.98] transition-transform"
        >
          <View className="flex-row justify-between items-center mb-6">
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
              {isSupplier ? <Truck size={32} color="white" /> : <Store size={32} color="white" />}
            </View>
            <ArrowRight size={24} color="white" />
          </View>
          <Text className="text-white text-2xl font-black uppercase tracking-tight">
            {isSupplier ? 'Post Supply Ad' : 'Post Demand Request'}
          </Text>
          <Text className="text-white/70 font-bold mt-2 leading-5">
            {isSupplier 
              ? "Tell buyers what you've harvested and your price per unit." 
              : "Specify the item, quantity, and budget you need."}
          </Text>
        </Pressable>

        {isSupplier && (
          <Pressable 
            onPress={() => router.push('/post/my-ads')}
            className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20 mb-6 active:scale-[0.98] transition-transform"
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center">
                <Shapes size={32} color="white" />
              </View>
              <ArrowRight size={24} color="white" />
            </View>
            <Text className="text-white text-xl font-black uppercase tracking-tight">
              Manage My Ads
            </Text>
            <Text className="text-white/60 font-medium mt-2 leading-5">
              Track views, incoming offers, and toggle inventory status (active/sold out).
            </Text>
          </Pressable>
        )}

        <View className="bg-white p-6 rounded-[2rem] border border-slate-100 flex-row items-center">
           <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4">
              <MessageCircle size={24} color={COLORS.primaryGreen} />
           </View>
           <View className="flex-1">
              <Text className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Need help?</Text>
              <Text className="text-slate-500 text-sm font-medium">Contact SupplyLink support</Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}
