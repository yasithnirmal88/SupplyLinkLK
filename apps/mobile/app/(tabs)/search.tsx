import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  FlatList,
  Platform
} from 'react-native';
import { 
  Search as SearchIcon, 
  X,
  LayoutGrid,
  Filter,
  History,
  TrendingUp,
  ChevronRight
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { MotiView, AnimatePresence } from 'moti';

import { db } from '../../services/firebase';
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
    const collectionName = isSupplier ? 'demandPosts' : 'supplyAds';
    const constraints = [where('status', '==', isSupplier ? 'open' : 'active')];
    
    if (selectedCategory !== 'all') {
      constraints.push(where('category', '==', selectedCategory));
    }

    const q = query(
      collection(db, collectionName),
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filtered = search 
        ? items.filter(i => ((((i as any).title) || ((i as any).displayName) || ((i as any).businessName) || ((i as any).category)) || '').toLowerCase().includes(search.toLowerCase()))
        : items

      setData(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory, search, isSupplier]);

  return (
    <View className="flex-1 bg-white">
      <View 
        className="bg-white px-8 pb-4"
        style={{ paddingTop: insets.top + 20 }}
      >
        <MotiView 
          from={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-row justify-between items-center mb-8"
        >
          <Text className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Explore
          </Text>
          <Pressable className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
             <Filter size={18} color={COLORS.textPrimary} strokeWidth={2.5} />
          </Pressable>
        </MotiView>

        <MotiView 
          animate={{ 
            borderColor: isFocused ? COLORS.primaryGreen : '#F1F5F9',
            backgroundColor: isFocused ? '#FFFFFF' : '#F8FAFC'
          }}
          className="flex-row items-center rounded-3xl border-2 px-5 py-1 shadow-sm shadow-slate-200/50"
        >
          <SearchIcon size={20} color={isFocused ? COLORS.primaryGreen : "#94A3B8"} strokeWidth={2.5} />
          <TextInput
            placeholder={isSupplier ? "Search for demands..." : "Search for suppliers..."}
            className="flex-1 h-14 ml-3 font-bold text-slate-900 text-lg"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <AnimatePresence>
            {search.length > 0 && (
              <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Pressable onPress={() => setSearch('')} className="bg-slate-200 p-1.5 rounded-full">
                  <X size={12} color="#64748B" strokeWidth={3} />
                </Pressable>
              </MotiView>
            )}
          </AnimatePresence>
        </MotiView>
      </View>

      <View className="py-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32 }}
        >
          {CATEGORIES.map((cat, index) => {
            const isActive = selectedCategory === cat.id;
            return (
              <MotiView
                key={cat.id}
                from={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 100 }}
              >
                <Pressable
                  onPress={() => setSelectedCategory(isActive ? 'all' : cat.id)}
                  className={`flex-row items-center px-6 py-3 rounded-2xl mr-3 border transition-all ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                  <Text className={`ml-2 font-black text-xs uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {cat.name}
                  </Text>
                </Pressable>
              </MotiView>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => loading ? <MarketplaceSkeleton /> : (
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 items-center justify-center bg-slate-50 rounded-[40px] border border-slate-100 border-dashed"
          >
            <LayoutGrid size={48} color="#CBD5E1" strokeWidth={1.5} />
            <Text className="text-slate-900 font-black mt-6 text-lg uppercase tracking-tight">No results found</Text>
            <Text className="text-slate-400 font-medium text-center px-10 mt-2 text-sm">
              Try adjusting your search or filters to find what you're looking for.
            </Text>
          </MotiView>
        )}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 50 }}
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
        )}
      />
    </View>
  );
}
