import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  ChevronLeft,
  Crown
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api';
import { COLORS } from '../../constants/Colors';

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, plan } = useAuthStore();
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSupplier = role === 'supplier';
  
  const plans = {
    free: {
      name: 'Free Starter',
      price: 0,
      features: isSupplier ? [
        'Max 3 Active Ads',
        '10 Offers / Month',
        'Standard Support'
      ] : [
        'Max 2 Demand Posts',
        'Basic Supplier Search',
        'Standard Support'
      ]
    },
    pro: {
      name: isSupplier ? 'Supplier Pro' : 'Business Pro',
      price: isSupplier 
        ? (isAnnual ? 4499 : 499) 
        : (isAnnual ? 8999 : 999),
      savings: isAnnual ? 'Save 25%' : null,
      features: isSupplier ? [
        'Unlimited Supply Ads',
        'Unlimited Offers',
        '🔥 Priority Listing',
        'Advanced Analytics',
        'Direct Buyer Chat'
      ] : [
        'Unlimited Demand Posts',
        'Recurring Postings',
        '🔥 Priority Notifications',
        'Supplier Analytics',
        'Expert Verify Badges'
      ]
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await apiClient('/subscription/initiate', {
        method: 'POST',
        body: {
          planId: isSupplier ? 'supplier_pro' : 'business_pro',
          billingCycle: isAnnual ? 'annual' : 'monthly'
        }
      });
      
      Alert.alert(
        'Payment Initiated', 
        `Redirecting to PayHere Secure Gateway for Rs.${response.amount}`,
        [
          { text: 'Simulate Success', onPress: () => router.push('/subscription/success') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
         <View 
            className="bg-slate-900 px-8 pb-12 pt-12 rounded-b-[3.5rem] shadow-2xl shadow-black/20"
            style={{ paddingTop: insets.top + 20 }}
         >
            <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-6">
               <ChevronLeft size={20} color="white" />
            </Pressable>
            <Text className="text-white text-4xl font-black uppercase tracking-tight leading-none">Scale your{'\n'}Business 📈</Text>
            <Text className="text-white/50 font-bold mt-4">Upgrade to unlock unlimited potential in the marketplace.</Text>

            <View className="flex-row bg-white/10 p-1 rounded-2xl mt-12 self-start border border-white/10">
               <Pressable 
                  onPress={() => setIsAnnual(false)}
                  className={`px-6 py-2.5 rounded-xl ${!isAnnual ? 'bg-primary-green' : ''}`}
               >
                  <Text className={`font-black uppercase text-[10px] ${!isAnnual ? 'text-white' : 'text-white/40'}`}>Monthly</Text>
               </Pressable>
               <Pressable 
                  onPress={() => setIsAnnual(true)}
                  className={`px-6 py-2.5 rounded-xl flex-row items-center ${isAnnual ? 'bg-primary-green' : ''}`}
               >
                  <Text className={`font-black uppercase text-[10px] ${isAnnual ? 'text-white' : 'text-white/40'}`}>Annual</Text>
                  <View className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-md">
                     <Text className="text-[8px] font-black text-white">-25%</Text>
                  </View>
               </Pressable>
            </View>
         </View>

         <View className="px-6 -mt-10">
            {/* Pro Card */}
            <View className="bg-white border-4 border-primary-green rounded-[3rem] p-8 shadow-2xl shadow-emerald-900/10 mb-8 overflow-hidden">
               <View className="absolute top-6 right-6 opacity-10">
                  <Crown size={80} color={COLORS.primaryGreen} />
               </View>
               
               <View className="flex-row items-center mb-6">
                  <View className="w-10 h-10 bg-primary-green rounded-xl items-center justify-center mr-4">
                     <Zap size={20} color="white" fill="white" />
                  </View>
                  <Text className="text-xl font-black text-slate-900 uppercase tracking-tight">{plans.pro.name}</Text>
               </View>

               <View className="flex-row items-end mb-8">
                  <Text className="text-4xl font-black text-slate-900">Rs.{plans.pro.price}</Text>
                  <Text className="text-slate-400 font-bold mb-1 ml-1">/{isAnnual ? 'year' : 'month'}</Text>
               </View>

               <View className="gap-4 mb-10">
                  {plans.pro.features.map((f, i) => (
                    <View key={i} className="flex-row items-center">
                       <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center mr-3">
                          <Check size={12} color={COLORS.primaryGreen} />
                       </View>
                       <Text className="text-slate-600 font-bold text-sm">{f}</Text>
                    </View>
                  ))}
               </View>

               <Pressable 
                  onPress={handleSubscribe}
                  disabled={loading}
                  className="bg-primary-green py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/20"
               >
                  {loading ? <ActivityIndicator color="white" /> : (
                     <>
                        <Text className="text-white font-black uppercase text-base mr-2 tracking-tight">Upgrade Now</Text>
                        <ArrowRight size={20} color="white" />
                     </>
                  )}
               </Pressable>
            </View>

            {/* Free Card */}
            <View className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100 mb-20 opacity-60">
               <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Current Plan</Text>
               <Text className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{plans.free.name}</Text>
               <Text className="text-slate-400 font-bold mb-6">Included by default.</Text>
               
               <View className="gap-3">
                  {plans.free.features.map((f, i) => (
                    <View key={i} className="flex-row items-center">
                       <Check size={14} color="#94A3B8" />
                       <Text className="text-slate-500 font-bold text-xs ml-3">{f}</Text>
                    </View>
                  ))}
               </View>
            </View>
         </View>
      </ScrollView>
    </View>
  );
}
