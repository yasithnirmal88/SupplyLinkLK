import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Zap, 
  Package,
  ArrowLeft,
  XCircle,
  Truck
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

const NOTIF_ICONS: Record<string, any> = {
  offer_accepted: { icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
  offer_received: { icon: Zap, color: '#F59E0B', bg: '#FFFBEB' },
  kyc_approved: { icon: Award, color: '#3B82F6', bg: '#EFF6FF' },
  kyc_rejected: { icon: XCircle, color: '#EF4444', bg: '#FEF2F2' },
  chat_message: { icon: MessageSquare, color: '#6366F1', bg: '#EEF2FF' },
  delivery_confirmed: { icon: Truck, color: COLORS.primaryGreen, bg: '#F0FDF4' },
  default: { icon: Bell, color: '#64748B', bg: '#F8FAFC' }
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, `notifications/${uid}/items`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(items);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    const batch = writeBatch(db);
    
    unread.forEach(n => {
      const ref = doc(db, `notifications/${uid}/items`, n.id);
      batch.update(ref, { read: true });
    });

    await batch.commit();
  };

  const handlePress = async (item: any) => {
    // 1. Mark as read
    if (!item.read) {
      await updateDoc(doc(db, `notifications/${uid}/items`, item.id), { read: true });
    }

    // 2. Navigate
    if (item.type.includes('offer') || item.type === 'delivery_confirmed') {
       router.push({ pathname: '/offers/review', params: { postId: item.relatedId } });
    } else if (item.type === 'chat_message') {
       router.push(`/chat/${item.relatedId}`);
    } else if (item.type.includes('kyc')) {
       router.push('/(tabs)/profile');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const Config = NOTIF_ICONS[item.type] || NOTIF_ICONS.default;
    const Icon = Config.icon;

    return (
      <Pressable 
        onPress={() => handlePress(item)}
        className={`flex-row px-6 py-5 border-b border-slate-50 transition-colors ${item.read ? 'bg-white' : 'bg-emerald-50/30'}`}
      >
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center mr-4" 
          style={{ backgroundColor: Config.bg }}
        >
          <Icon size={22} color={Config.color} />
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`text-sm ${item.read ? 'font-bold text-slate-700' : 'font-black text-slate-900'} uppercase tracking-tight`}>
              {item.title}
            </Text>
            <Text className="text-[10px] font-bold text-slate-400">
               {formatDistanceToNow(new Date(item.createdAt))}
            </Text>
          </View>
          <Text className="text-slate-500 text-xs font-medium leading-5" numberOfLines={2}>
             {item.body}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View 
        className="px-6 pb-6 pt-10 flex-row justify-between items-center bg-white border-b border-slate-100"
        style={{ paddingTop: insets.top + 10 }}
      >
        <View className="flex-row items-center">
           <Pressable onPress={() => router.back()} className="mr-3 p-1">
              <ArrowLeft size={24} color="#0F172A" />
           </Pressable>
           <Text className="text-2xl font-black text-slate-900 uppercase tracking-tight">Activity</Text>
        </View>
        <Pressable onPress={handleMarkAllRead}>
           <Text className="text-xs font-black text-primary-green uppercase tracking-widest">Mark All Read</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
          }
          ListEmptyComponent={() => (
            <View className="py-20 items-center justify-center px-10">
              <View className="w-20 h-20 bg-slate-50 rounded-[2rem] items-center justify-center mb-6">
                <Bell size={40} color="#CBD5E1" />
              </View>
              <Text className="text-xl font-black text-slate-800 uppercase tracking-tight text-center">No Notifications</Text>
              <Text className="text-slate-400 text-center mt-3 font-medium leading-5">
                Stay updated on your offers, trades, and account activity here.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
