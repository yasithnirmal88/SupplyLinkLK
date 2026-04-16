import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Search, User, ChevronRight } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid } = useAuthStore();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const renderChatItem = ({ item }: { item: any }) => {
    const isSupplier = item.participants[0] === uid;
    const counterpartName = isSupplier ? item.businessName : item.supplierName;
    const unreadCount = item.unreadCount?.[uid] || 0;

    return (
      <Pressable 
        onPress={() => router.push(`/chat/${item.chatId}`)}
        className="flex-row items-center px-6 py-5 bg-white border-b border-slate-50 active:bg-slate-50"
      >
        <View className="w-14 h-14 bg-slate-100 rounded-2xl items-center justify-center mr-4 overflow-hidden border border-slate-200">
           <User size={28} color="#94A3B8" />
        </View>

        <View className="flex-1 mr-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-black text-slate-900 text-base uppercase tracking-tight">{counterpartName}</Text>
            <Text className="text-[10px] font-bold text-slate-400">
              {item.lastMessageAt ? formatDistanceToNow(new Date(item.lastMessageAt)) : ''}
            </Text>
          </View>
          <Text 
            className={`text-sm ${unreadCount > 0 ? 'font-black text-slate-800' : 'font-medium text-slate-400'}`} 
            numberOfLines={1}
          >
            {item.lastMessage || 'Start negotiating...'}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <View className="bg-primary-green w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
          </View>
        ) : (
          <ChevronRight size={16} color="#CBD5E1" />
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View 
        className="px-6 pb-6 pt-10 flex-row justify-between items-center bg-white border-b border-slate-100"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Text className="text-2xl font-black text-slate-900 uppercase tracking-tight">Inbox</Text>
        <Pressable className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
           <Search size={20} color="#64748B" />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
          ListEmptyComponent={() => (
            <View className="py-20 items-center justify-center px-10">
              <View className="w-20 h-20 bg-slate-50 rounded-[2rem] items-center justify-center mb-6">
                <MessageSquare size={40} color="#CBD5E1" />
              </View>
              <Text className="text-xl font-black text-slate-800 uppercase tracking-tight text-center">Your inbox is empty</Text>
              <Text className="text-slate-400 text-center mt-3 font-medium leading-5">
                Negotiations appear here once an offer is accepted by a buyer.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
