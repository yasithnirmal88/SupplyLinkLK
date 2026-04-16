import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  FlatList 
} from 'react-native';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  MapPin, 
  X,
  ChevronDown,
  LayoutGrid
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

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
  const { role } = useAuthStore();
  const isSupplier = role === 'supplier';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
      
      // Client-side search for simplicity in this prototype
      const filtered = search 
        ? items.filter(i => (i.title || i.displayName || i.businessName).toLowerCase().includes(search.toLowerCase()))
        : items;

      setData(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory, search, isSupplier]);

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        className="bg-white px-6 pb-6 pt-10 shadow-sm"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Text className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">
          Find produce
        </Text>

        <View className="flex-row items-center bg-slate-100 rounded-2xl border border-slate-200 px-4 py-1">
          <SearchIcon size={20} color="#94A3B8" />
          <TextInput
            placeholder={isSupplier ? "Search for demands..." : "Search for suppliers..."}
            className="flex-1 h-12 ml-3 font-medium text-slate-900"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <X size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      <View className="py-6">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(isActive ? 'all' : cat.name)}
                className={`flex-row items-center px-5 py-3 rounded-2xl mr-3 border transition-all ${
                  isActive 
                    ? 'bg-primary-green border-primary-green shadow-md shadow-emerald-900/20' 
                    : 'bg-white border-slate-100'
                }`}
              >
                <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                <Text className={`ml-2 font-bold text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => loading ? <MarketplaceSkeleton /> : (
          <View className="py-20 items-center justify-center">
            <LayoutGrid size={48} color="#CBD5E1" />
            <Text className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">No results found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          isSupplier 
            ? <DemandCard post={item} onPress={() => {}} />
            : <SupplyCard ad={item} onPress={() => {}} />
        )}
      />
    </View>
  );
}
