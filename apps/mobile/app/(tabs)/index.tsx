import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  FlatList,
  Pressable,
  Image
} from 'react-native';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { 
  Bell, 
  Search, 
  MapPin, 
  Filter, 
  Zap,
  ChevronDown
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { DemandCard } from '../../components/marketplace/DemandCard';
import { SupplyCard } from '../../components/marketplace/SupplyCard';
import { MarketplaceSkeleton } from '../../components/marketplace/MarketplaceSkeleton';
import { COLORS } from '../../constants/Colors';
import type { DemandPost, SupplyAd } from '@supplylink/shared-types';

export default function HomeFeedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { role, displayName, verificationStatus } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const isSupplier = role === 'supplier';

  useEffect(() => {
    if (!verificationStatus || verificationStatus !== 'approved') return;

    const collectionName = isSupplier ? 'demandPosts' : 'supplyAds';
    const statusField = isSupplier ? 'status' : 'status';
    const statusValue = isSupplier ? 'open' : 'active';

    const q = query(
      collection(db, collectionName),
      where(statusField, '==', statusValue),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [role, verificationStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    // onSnapshot will automatically update, but we can force state if needed
  };

  const Header = () => (
    <View 
      className="px-6 pb-6 bg-white shadow-sm rounded-b-[2.5rem]"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            {new Date().getHours() < 12 ? t('home.goodMorning') : t('home.goodEvening')},
          </Text>
          <Text className="text-2xl font-black text-slate-900">{displayName?.split(' ')[0]} 🌿</Text>
        </View>
        <Pressable className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100">
           <Bell size={24} color={COLORS.textPrimary} />
           <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <Pressable 
          className="flex-1 bg-slate-100 flex-row items-center px-4 py-3.5 rounded-2xl border border-slate-200"
        >
          <Search size={20} color="#94A3B8" />
          <Text className="ml-3 text-slate-400 font-medium">Search marketplace...</Text>
        </Pressable>
        <Pressable className="w-14 h-14 bg-primary-green rounded-2xl items-center justify-center">
           <Filter size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <Header />
      
      <ScrollView 
        className="flex-1 bg-slate-50 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-center justify-between px-6 mb-4">
          <Text className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {isSupplier ? 'Open Demands' : 'Active Supply Ads'}
          </Text>
          <View className="flex-row items-center">
             <Text className="text-primary-green font-bold text-sm">Nearby</Text>
             <ChevronDown size={16} color={COLORS.primaryGreen} />
          </View>
        </View>

        {loading ? (
          <MarketplaceSkeleton />
        ) : (
          <View className="px-6 pb-20">
            {data.length === 0 ? (
              <View className="py-20 items-center justify-center bg-white rounded-[2.5rem] border border-slate-100">
                 <Zap size={48} color="#CBD5E1" />
                 <Text className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">Nothing here yet</Text>
              </View>
            ) : (
              data.map((item) => (
                isSupplier 
                  ? <DemandCard 
                      key={item.id} 
                      post={item} 
                      onPress={() => router.push({
                        pathname: '/offers/submit',
                        params: { 
                          postId: item.id, 
                          title: item.title, 
                          qtyNeeded: item.totalQuantity, 
                          unit: item.unit,
                          businessName: item.businessName 
                        }
                      })} 
                    />
                  : <SupplyCard 
                      key={item.id} 
                      ad={item} 
                      onPress={() => alert('Viewing Ad Detail soon')} 
                    />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
