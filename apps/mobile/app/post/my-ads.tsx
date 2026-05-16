import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { 
  ArrowLeft, 
  PackageSearch, 
  Eye, 
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react-native';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';
import type { SupplyAd } from '@supplylink/shared-types';

export default function MyAdsScreen() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [ads, setAds] = useState<SupplyAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'supplyAds'),
      where('supplierId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ adId: d.id, ...d.data() } as SupplyAd));
      setAds(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleMarkSold = async (adId: string) => {
    Alert.alert('Mark as Sold', 'Are you sure you want to mark this ad as sold? It will no longer appear in search results.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Mark Sold', 
        style: 'default',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'supplyAds', adId), { status: 'sold' });
          } catch (e) {
            Alert.alert('Error', 'Could not update ad status.');
          }
        }
      }
    ]);
  };

  const handleDelete = async (adId: string) => {
    Alert.alert('Delete Ad', 'Are you sure you want to permanently delete this ad?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'supplyAds', adId), { status: 'removed' });
            // Ideally delete doc if no offers attached, or just 'removed'
          } catch (e) {
            Alert.alert('Error', 'Could not delete ad.');
          }
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100 pt-12">
         <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-50">
            <ArrowLeft size={24} color="#0F172A" />
         </Pressable>
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">My Supply Ads</Text>
      </View>

      {loading ? (
         <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
         </View>
      ) : (
         <FlatList
            data={ads.filter(a => a.status !== 'removed')}
            keyExtractor={item => item.adId}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            ListEmptyComponent={() => (
               <View className="py-20 items-center justify-center mt-10">
                  <View className="w-24 h-24 bg-slate-100 rounded-3xl items-center justify-center mb-6">
                     <PackageSearch size={48} color="#94A3B8" />
                  </View>
                  <Text className="text-xl font-black text-slate-800 uppercase tracking-tight">No Ads Posted</Text>
                  <Text className="text-slate-400 text-center font-medium mt-2">
                     You haven't posted any supply ads yet. Create one to reach buyers.
                  </Text>
                  <Pressable 
                     onPress={() => router.push('/post/supply-ad')}
                     className="mt-8 bg-primary-green px-8 py-3 rounded-xl shadow-lg shadow-emerald-900/20"
                  >
                     <Text className="text-white font-bold uppercase tracking-widest text-xs">Create Ad</Text>
                  </Pressable>
               </View>
            )}
            renderItem={({ item }) => (
               <View className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm mb-6 overflow-hidden ${item.status === 'sold' ? 'opacity-70' : ''}`}>
                  <View className="flex-row p-6">
                     <View className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden mr-4 border border-slate-200">
                        {item.imageUrls && item.imageUrls[0] ? (
                           <Image source={{ uri: item.imageUrls[0] }} className="w-full h-full object-cover" />
                        ) : (
                           <View className="flex-1 items-center justify-center bg-emerald-50">
                              <Text className="text-2xl">📦</Text>
                           </View>
                        )}
                     </View>
                     
                     <View className="flex-1 justify-center">
                        <View className="flex-row justify-between items-start">
                           <View className="flex-1 mr-2">
                              {item.status === 'sold' && (
                                 <View className="bg-slate-800 self-start px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                    <Text className="text-white text-[10px] font-bold">SOLD OUT</Text>
                                 </View>
                              )}
                              <Text className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">{item.title}</Text>
                              <Text className="text-primary-green font-bold text-sm mt-0.5">Rs. {item.pricePerUnit} / {item.unit}</Text>
                           </View>
                        </View>
                        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                           Stock: {item.quantity} {item.unit}
                        </Text>
                     </View>
                  </View>

                  <View className="bg-slate-50 px-6 py-4 flex-row items-center border-t border-slate-100">
                     <View className="flex-row flex-1">
                        <View className="flex-row items-center mr-6">
                           <Eye size={16} color="#94A3B8" />
                           <Text className="ml-1.5 text-slate-500 font-bold text-xs">{item.viewCount || 0}</Text>
                        </View>
                        <View className="flex-row items-center">
                           <MessageSquare size={16} color="#94A3B8" />
                           <Text className="ml-1.5 text-slate-500 font-bold text-xs">{item.offerCount || 0}</Text>
                        </View>
                     </View>
                     
                     <View className="flex-row gap-6 items-center">
                        {item.status === 'active' && (
                           <Pressable onPress={() => handleMarkSold(item.adId)} className="flex-row items-center active:opacity-50">
                              <CheckCircle2 size={18} color={COLORS.primaryGreen} />
                              <Text className="ml-1.5 text-primary-green font-bold text-xs uppercase">Sold</Text>
                           </Pressable>
                        )}
                        <Pressable onPress={() => handleDelete(item.adId)} className="active:opacity-50">
                           <Trash2 size={18} color="#F43F5E" />
                        </Pressable>
                     </View>
                  </View>
               </View>
            )}
         />
      )}
    </View>
  );
}
