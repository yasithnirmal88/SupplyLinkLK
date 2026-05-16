import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { Bell, Search, Filter, Zap, ChevronDown, CloudOff, MapPin, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [activeCategory, setActiveCategory] = useState('All');

  const isSupplier = role === 'supplier';
  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Equipment', 'Services'];

  useEffect(() => {
    if (!verificationStatus || (verificationStatus !== 'approved' && verificationStatus !== 'verified')) {
      setLoading(false);
      return;
    }
    const collectionName = isSupplier ? 'demandPosts' : 'supplyAds';
    const statusValue = isSupplier ? 'open' : 'active';

    const db = getFirestore();
    const q = query(
      collection(db, collectionName),
      where('status', '==', statusValue),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (!snapshot) return;
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(items);
        setLoading(false);
        setRefreshing(false);
      },
      error => {
        console.error('Firestore Listen Error:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [role, verificationStatus]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />

      <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingTop: insets.top + 10 }}>
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>
                {new Date().getHours() < 12 ? t('home.goodMorning') : t('home.goodEvening')}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 2 }}>
                {displayName?.split(' ')[0] || 'User'} 🌿
              </Text>
            </View>
            <Pressable style={{ width: 48, height: 48, backgroundColor: '#F8FAFC', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Bell size={22} color={COLORS.textPrimary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={{ flex: 1, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' }}>
              <Search size={18} color="#94A3B8" />
              <Text style={{ marginLeft: 12, color: '#94A3B8', fontWeight: '500', fontSize: 14 }}>Search marketplace...</Text>
            </Pressable>
            <Pressable style={{ width: 48, height: 48, backgroundColor: COLORS.primaryGreen, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={20} color="white" />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 24, paddingVertical: 16 }} contentContainerStyle={{ paddingRight: 40 }}>
          {categories.map(cat => (
            <Pressable key={cat} onPress={() => setActiveCategory(cat)} style={{ marginRight: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99, borderWidth: 1, backgroundColor: activeCategory === cat ? '#0F172A' : 'white', borderColor: activeCategory === cat ? '#0F172A' : '#E2E8F0' }}>
              <Text style={{ fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: activeCategory === cat ? 'white' : '#64748B' }}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.primaryGreen} />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: '900', color: COLORS.primaryGreen, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Marketplace</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A' }}>{isSupplier ? 'Open Demands' : 'Active Supply Ads'}</Text>
          </View>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
            <MapPin size={14} color={COLORS.primaryGreen} />
            <Text style={{ marginLeft: 6, color: '#0F172A', fontWeight: '700', fontSize: 12 }}>Colombo</Text>
            <ChevronDown size={14} color="#94A3B8" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {loading ? <MarketplaceSkeleton /> : (
          <View style={{ paddingHorizontal: 24 }}>
            {data.length === 0 ? (
              <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 40, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Zap size={48} color={COLORS.primaryGreen} opacity={0.2} />
                <Text style={{ color: '#0F172A', fontWeight: '900', marginTop: 24, fontSize: 17, textTransform: 'uppercase' }}>Nothing here yet</Text>
                <Text style={{ color: '#94A3B8', fontWeight: '500', textAlign: 'center', paddingHorizontal: 40, marginTop: 8, fontSize: 13, lineHeight: 20 }}>
                  {verificationStatus !== 'approved' && verificationStatus !== 'verified'
                    ? 'Complete KYC verification to access the marketplace.'
                    : 'Check back later for new opportunities in your area.'}
                </Text>
              </View>
            ) : (
              data.map(item => (
                <View key={item.id}>
                  {isSupplier
                    ? <DemandCard post={item} onPress={() => router.push({ pathname: '/offers/submit', params: { postId: item.id, title: item.title, qtyNeeded: item.quantityNeeded, unit: item.unit, businessName: item.businessName } })} />
                    : <SupplyCard ad={item} onPress={() => alert('Viewing Ad Detail soon')} />
                  }
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {!loading && (
        <View style={{ position: 'absolute', bottom: 30, right: 30 }}>
          <Pressable style={{ width: 64, height: 64, backgroundColor: '#0F172A', borderRadius: 32, alignItems: 'center', justifyContent: 'center' }} onPress={() => router.push(isSupplier ? '/ads/create' : '/demands/create')}>
            <TrendingUp size={28} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
}