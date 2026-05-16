import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, FlatList } from 'react-native';
import { Search as SearchIcon, X, LayoutGrid, Filter } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { useAuthStore } from '../../stores/authStore';
import { DemandCard } from '../../components/marketplace/DemandCard';
import { SupplyCard } from '../../components/marketplace/SupplyCard';
import { MarketplaceSkeleton } from '../../components/marketplace/MarketplaceSkeleton';
import { COLORS } from '../../constants/Colors';

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🌟' },
  { id: 'coconuts', name: 'Coconuts', emoji: '🥥' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥦' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎' },
  { id: 'rice', name: 'Rice & Grains', emoji: '🌾' },
  { id: 'spices', name: 'Spices', emoji: '🌶️' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role } = useAuthStore();
  const isSupplier = role === 'supplier';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLoading(true);
    const db = getFirestore();
    const collectionName = isSupplier ? 'demandPosts' : 'supplyAds';
    
    const constraints: any[] = [where('status', '==', isSupplier ? 'open' : 'active')];
    if (selectedCategory !== 'all') {
      constraints.push(where('category', '==', selectedCategory));
    }

    const q = query(
      collection(db, collectionName),
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: any) => {
        if (!snapshot) return;
        const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        const filtered = search ? items.filter((i: any) => ((i.title || i.displayName || i.businessName || i.category) || '').toLowerCase().includes(search.toLowerCase())) : items;
        setData(filtered);
        setLoading(false);
      },
      (error: any) => {
        console.error('Firestore Search Error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [selectedCategory, search, isSupplier]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ backgroundColor: 'white', paddingHorizontal: 32, paddingBottom: 16, paddingTop: insets.top + 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' }}>Explore</Text>
          <Pressable style={{ width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
            <Filter size={18} color={COLORS.textPrimary} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 24, borderWidth: 2, paddingHorizontal: 20, paddingVertical: 4, borderColor: isFocused ? COLORS.primaryGreen : '#F1F5F9', backgroundColor: isFocused ? 'white' : '#F8FAFC' }}>
          <SearchIcon size={20} color={isFocused ? COLORS.primaryGreen : '#94A3B8'} strokeWidth={2.5} />
          <TextInput
            placeholder={isSupplier ? 'Search for demands...' : 'Search for suppliers...'}
            style={{ flex: 1, height: 56, marginLeft: 12, fontWeight: '700', color: '#0F172A', fontSize: 17 }}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={{ backgroundColor: '#E2E8F0', padding: 6, borderRadius: 99 }}>
              <X size={12} color="#64748B" strokeWidth={3} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ paddingVertical: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 32 }}>
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable key={cat.id} onPress={() => setSelectedCategory(isActive ? 'all' : cat.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, marginRight: 12, borderWidth: 1, backgroundColor: isActive ? '#0F172A' : 'white', borderColor: isActive ? '#0F172A' : '#F1F5F9' }}>
                <Text style={{ fontSize: 17 }}>{cat.emoji}</Text>
                <Text style={{ marginLeft: 8, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: isActive ? 'white' : '#64748B' }}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => loading ? <MarketplaceSkeleton /> : (
          <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 40, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
            <LayoutGrid size={48} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={{ color: '#0F172A', fontWeight: '900', marginTop: 24, fontSize: 17, textTransform: 'uppercase' }}>No results found</Text>
            <Text style={{ color: '#94A3B8', fontWeight: '500', textAlign: 'center', paddingHorizontal: 40, marginTop: 8, fontSize: 13 }}>Try adjusting your search or filters.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View>
            {isSupplier
              ? <DemandCard post={item} onPress={() => router.push({ pathname: '/offers/submit', params: { postId: item.id, title: item.title, qtyNeeded: item.quantityNeeded, unit: item.unit, businessName: item.businessName } })} />
              : <SupplyCard ad={item} onPress={() => alert('Viewing Ad Detail soon')} />
            }
          </View>
        )}
      />
    </View>
  );
}