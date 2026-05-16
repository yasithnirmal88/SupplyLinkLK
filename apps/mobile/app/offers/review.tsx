import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  ArrowLeft, 
  User, 
  BadgeCheck, 
  CheckCircle2, 
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react-native';

import { db } from '../../services/firebase';
import { apiClient } from '../../services/api';
import { COLORS } from '../../constants/Colors';

export default function ReviewOffersScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const [offers, setOffers] = useState<any[]>([]);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    // 1. Get Post Details
    getDoc(doc(db, 'demandPosts', postId as string)).then(snapshot => {
       setPost(snapshot.data());
    });

    // 2. Listen to Offers
    const q = query(
      collection(db, 'offers'),
      where('demandPostId', '==', postId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ offerId: d.id, ...d.data() }));
      setOffers(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleAccept = async (offerId: string) => {
    setLoading(true);
    try {
      await apiClient(`/offers/${offerId}/accept`, { method: 'PATCH' });
      Alert.alert('Accepted', 'Offer accepted. Negotiations unlocked.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (offerId: string) => {
    Alert.prompt('Reject Offer', 'Enter a reason (optional)', async (reason) => {
      setLoading(true);
      try {
        await apiClient(`/offers/${offerId}/reject`, { 
          method: 'PATCH',
          body: { reason }
        });
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  if (loading && !post) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100 mt-10">
         <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-50">
            <ArrowLeft size={24} color="#0F172A" />
         </Pressable>
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">Incoming Offers</Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={item => item.offerId}
        ListHeaderComponent={() => post && (
          <View className="p-6 bg-slate-900 rounded-b-[2.5rem] mb-6">
             <Text className="text-white/60 font-black uppercase text-[10px] tracking-widest mb-1">Fulfillment Progress</Text>
             <Text className="text-white text-xl font-bold mb-4">{post.itemName}</Text>
             <View className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-2">
                <View 
                  className="bg-primary-green h-full" 
                  style={{ width: `${(post.filledQuantity / post.totalQuantity) * 100}%` }} 
                />
             </View>
             <View className="flex-row justify-between">
                <Text className="text-white/40 text-[10px] font-bold">0</Text>
                <Text className="text-primary-green text-[10px] font-bold">{post.filledQuantity} / {post.totalQuantity} {post.unit}</Text>
                <Text className="text-white/40 text-[10px] font-bold">{post.totalQuantity}</Text>
             </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className={`mx-6 mb-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm ${item.status === 'accepted' ? 'border-primary-green border-2' : ''}`}>
             <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center mr-4">
                   <User size={24} color="#94A3B8" />
                </View>
                <View className="flex-1">
                   <View className="flex-row items-center">
                      <Text className="font-black text-slate-900 text-lg tracking-tight uppercase">{item.supplierName}</Text>
                      <View className="ml-1"><BadgeCheck size={16} color={COLORS.primaryGreen} fill="white" /></View>
                   </View>
                   <Text className="text-slate-400 font-bold text-[10px] uppercase">Verified Producer</Text>
                </View>
                <View className="items-end">
                   <Text className="font-black text-primary-green text-xl">Rs. {item.pricePerUnit}</Text>
                   <Text className="text-[10px] font-bold text-slate-400 uppercase">per {item.unit}</Text>
                </View>
             </View>

             <View className="bg-slate-50 p-4 rounded-2xl flex-row justify-between mb-6">
                <View>
                   <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Offer Volume</Text>
                   <Text className="font-black text-slate-800 text-base">{item.quantity} {item.unit}</Text>
                </View>
                <View className="items-end">
                   <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex-row items-center">
                      <Clock size={10} color="#94A3B8" /> Availability
                   </Text>
                   <Text className="font-black text-slate-800 text-base">{new Date(item.availableByDate).toLocaleDateString()}</Text>
                </View>
             </View>

             {item.notes && <Text className="text-slate-500 font-medium mb-6 italic text-sm">"{item.notes}"</Text>}

             <View className="flex-row gap-3">
                {item.status === 'pending' ? (
                   <>
                      <Pressable 
                        onPress={() => handleReject(item.offerId)}
                        className="flex-1 py-3.5 border border-slate-200 rounded-xl items-center justify-center bg-white"
                      >
                         <Text className="text-slate-400 font-bold uppercase text-xs">Reject</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => handleAccept(item.offerId)}
                        className="flex-[2] py-3.5 bg-primary-green rounded-xl items-center justify-center shadow-lg shadow-emerald-900/10"
                      >
                         <Text className="text-white font-black uppercase text-xs">Accept Offer</Text>
                      </Pressable>
                   </>
                ) : (
                   <View className={`w-full py-3.5 rounded-xl items-center justify-center flex-row gap-2 ${item.status === 'accepted' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {item.status === 'accepted' ? <CheckCircle2 size={16} color={COLORS.primaryGreen} /> : <XCircle size={16} color="#F43F5E" />}
                      <Text className={`font-black uppercase text-xs ${item.status === 'accepted' ? 'text-primary-green' : 'text-rose-500'}`}>
                         {item.status}
                      </Text>
                   </View>
                )}
             </View>
          </View>
        )}
      />
    </View>
  );
}
