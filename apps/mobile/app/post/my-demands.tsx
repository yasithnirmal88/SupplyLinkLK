import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
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
  Layers, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  Trash2,
  ChevronRight
} from 'lucide-react-native';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';
import type { DemandPost } from '@supplylink/shared-types';

export default function MyDemandsScreen() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [posts, setPosts] = useState<DemandPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'demandPosts'),
      where('businessId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ postId: d.id, ...d.data() } as DemandPost));
      setPosts(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleClosePost = async (postId: string) => {
    Alert.alert('Close Demand', 'Are you sure you want to close this demand? You will no longer receive new offers.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Close', 
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'demandPosts', postId), { status: 'closed' });
          } catch (e) {
            Alert.alert('Error', 'Action failed');
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
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">Our Demand Posts</Text>
      </View>

      {loading ? (
         <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
         </View>
      ) : (
         <FlatList
            data={posts.filter(p => p.status !== 'removed')}
            keyExtractor={item => item.postId}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            ListEmptyComponent={() => (
               <View className="py-20 items-center justify-center mt-10">
                  <View className="w-24 h-24 bg-slate-100 rounded-3xl items-center justify-center mb-6">
                     <Layers size={48} color="#94A3B8" />
                  </View>
                  <Text className="text-xl font-black text-slate-800 uppercase tracking-tight">No Demands Released</Text>
                  <Text className="text-slate-400 text-center font-medium mt-2">
                     Post what you need to start receiving offers from verified suppliers.
                  </Text>
                  <Pressable 
                     onPress={() => router.push('/post/demand-post')}
                     className="mt-8 bg-primary-green px-8 py-3 rounded-xl shadow-lg shadow-emerald-900/20"
                  >
                     <Text className="text-white font-bold uppercase tracking-widest text-xs">Create Demand</Text>
                  </Pressable>
               </View>
            )}
            renderItem={({ item }) => (
               <Pressable 
                 onPress={() => router.push({ pathname: '/offers/review', params: { postId: item.postId } })}
                 className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm mb-6 overflow-hidden ${item.status === 'closed' ? 'opacity-70' : ''}`}
               >
                  <View className="p-6">
                     <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                           <Text className="text-[10px] font-black text-primary-green uppercase tracking-widest mb-1">{item.category}</Text>
                           <Text className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.title}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-lg ${item.status === 'open' ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                           <Text className={`text-[8px] font-black uppercase ${item.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>{item.status}</Text>
                        </View>
                     </View>
                     
                     <View className="flex-row items-center gap-4 mt-2">
                        <View className="flex-row items-center">
                           <Clock size={12} color="#94A3B8" />
            <Text className="ml-1 text-[10px] font-bold text-slate-400 uppercase">Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
                        </View>
                        <View className="flex-row items-center">
                           <MessageSquare size={12} color="#94A3B8" />
                           <Text className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{item.offersCount || 0} Offers</Text>
                        </View>
                     </View>

                     <View className="mt-4 flex-row items-center justify-between">
                        <Text className="text-slate-900 font-black text-sm">Need {item.quantityNeeded} {item.unit}</Text>
                        <ChevronRight size={16} color="#CBD5E1" />
                     </View>
                  </View>

                  <View className="bg-slate-50 px-6 py-4 flex-row items-center justify-between border-t border-slate-100">
                     <Text className="text-[10px] font-bold text-slate-400 uppercase">Target: Rs.{item.priceRangeMin} - {item.priceRangeMax}</Text>
                     {item.status === 'open' && (
                        <Pressable onPress={() => handleClosePost(item.postId)} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                           <Text className="text-[10px] font-black text-rose-500 uppercase">Close Post</Text>
                        </Pressable>
                     )}
                  </View>
               </Pressable>
            )}
         />
      )}
    </View>
  );
}
