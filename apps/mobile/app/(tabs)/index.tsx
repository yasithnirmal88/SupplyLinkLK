import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  Pressable,
  Platform
} from 'react-native';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { 
  Bell, 
  Search, 
  Filter, 
  Zap,
  ChevronDown,
  CloudOff,
  MapPin,
  TrendingUp
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';

import { db } from '../../services/firebase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { DemandCard } from '../../components/marketplace/DemandCard';
import { SupplyCard } from '../../components/marketplace/SupplyCard';
import { MarketplaceSkeleton } from '../../components/marketplace/MarketplaceSkeleton';
import { COLORS } from '../../constants/Colors';

export default function HomeFeedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role, displayName, verificationStatus } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const isSupplier = role === 'supplier';

  useEffect(() => {
    if (!verificationStatus || verificationStatus !== 'approved') return;

    const collectionName = isSupplier ? 'demandPosts' : 'supplyAds';
    const statusField = 'status';
    const statusValue = isSupplier ? 'open' : 'active';

    const q = query(
      collection(db, collectionName),
      where(statusField, '==', statusValue),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
      setIsOffline(snapshot.metadata.fromCache);
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
  };

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Equipment', 'Services'];
  const [activeCategory, setActiveCategory] = useState('All');

  const Header = () => (
    <View 
      className="bg-white border-b border-slate-100"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="px-6 pb-4">
        {isOffline && (
          <MotiView 
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 32 }}
            className="bg-amber-50 px-4 rounded-xl flex-row items-center justify-center mb-4 border border-amber-100 overflow-hidden"
          >
            <CloudOff size={12} color="#D97706" />
            <Text className="ml-2 text-amber-700 text-[10px] font-black uppercase tracking-widest">Offline Mode · Cached Data</Text>
          </MotiView>
        )}
        
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <MotiText 
              from={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              {new Date().getHours() < 12 ? t('home.goodMorning') : t('home.goodEvening')}
            </MotiText>
            <MotiText 
              from={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 100 }}
              className="text-2xl font-black text-slate-900 mt-0.5"
            >
              {displayName?.split(' ')[0] || 'User'} <Text style={{ color: COLORS.primaryGreen }}>🌿</Text>
            </MotiText>
          </View>
          
          <Pressable 
            className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100 active:scale-95 transition-transform"
          >
             <Bell size={22} color={COLORS.textPrimary} />
             <View className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </Pressable>
        </View>

        <View className="flex-row gap-3">
          <Pressable 
            className="flex-1 bg-slate-50 flex-row items-center px-4 py-3.5 rounded-2xl border border-slate-100 active:bg-slate-100"
          >
            <Search size={18} color="#94A3B8" />
            <Text className="ml-3 text-slate-400 font-medium text-sm">Search marketplace...</Text>
          </Pressable>
          <Pressable className="w-12 h-12 bg-primary-green rounded-2xl items-center justify-center shadow-lg shadow-primary-green/20 active:scale-95">
             <Filter size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="px-6 py-4"
        contentContainerStyle={{ paddingRight: 40 }}
      >
        {categories.map((cat, i) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            className={`mr-3 px-5 py-2.5 rounded-full border ${
              activeCategory === cat 
                ? 'bg-slate-900 border-slate-900' 
                : 'bg-white border-slate-200'
            }`}
          >
            <Text className={`font-bold text-xs uppercase tracking-widest ${
              activeCategory === cat ? 'text-white' : 'text-slate-500'
            }`}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <Header />
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={COLORS.primaryGreen}
          />
        }
      >
        <View className="flex-row items-center justify-between px-6 mt-6 mb-4">
          <View>
            <Text className="text-[10px] font-black text-primary-green uppercase tracking-widest mb-1">
              Marketplace
            </Text>
            <Text className="text-xl font-black text-slate-900">
              {isSupplier ? 'Open Demands' : 'Active Supply Ads'}
            </Text>
          </View>
          <Pressable className="flex-row items-center bg-white px-3 py-1.5 rounded-xl border border-slate-100">
             <MapPin size={14} color={COLORS.primaryGreen} />
             <Text className="ml-1.5 text-slate-900 font-bold text-xs">Colombo</Text>
             <ChevronDown size={14} color={COLORS.textMuted} className="ml-1" />
          </Pressable>
        </View>

        {loading ? (
          <MarketplaceSkeleton />
        ) : (
          <View className="px-6">
            <AnimatePresence>
              {data.length === 0 ? (
                <MotiView 
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                   <MotiView
                     animate={{ 
                       translateY: [0, -10, 0],
                       scale: [1, 1.1, 1]
                     }}
                     transition={{ loop: true, duration: 2000 }}
                   >
                     <Zap size={48} color={COLORS.primaryGreen} opacity={0.2} />
                   </MotiView>
                   <Text className="text-slate-900 font-black mt-6 text-lg uppercase tracking-tight">Nothing here yet</Text>
                   <Text className="text-slate-400 font-medium text-center px-10 mt-2 text-sm leading-5">
                     Check back later for new opportunities in your area.
                   </Text>
                </MotiView>
              ) : (
                data.map((item, index) => (
                  <MotiView
                    key={item.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 100 }}
                  >
                    {isSupplier 
                      ? <DemandCard 
                          post={item} 
                          onPress={() => router.push({
                            pathname: '/offers/submit',
                            params: { 
                              postId: item.id, 
                              title: item.title, 
                              qtyNeeded: item.quantityNeeded, 
                              unit: item.unit,
                              businessName: item.businessName 
                            }
                          })} 
                        />
                      : <SupplyCard 
                          ad={item} 
                          onPress={() => alert('Viewing Ad Detail soon')} 
                        />
                    }
                  </MotiView>
                ))
              )}
            </AnimatePresence>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for posting */}
      {!loading && (
        <MotiView 
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 500 }}
          style={{ position: 'absolute', bottom: 30, right: 30 }}
        >
          <Pressable 
            className="w-16 h-16 bg-slate-900 rounded-full items-center justify-center shadow-2xl active:scale-95"
            onPress={() => router.push(isSupplier ? '/ads/create' : '/demands/create')}
          >
            <TrendingUp size={28} color="white" />
          </Pressable>
        </MotiView>
      )}
    </View>
  );
}
