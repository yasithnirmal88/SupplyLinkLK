import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  User, 
  ChevronDown, 
  ShieldCheck,
  Package,
  BadgeCheck
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { uploadImage } from '../../services/storage';
import { COLORS } from '../../constants/Colors';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uid, displayName } = useAuthStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [chatData, setChatData] = useState<any>(null);
  const [offerData, setOfferData] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId || !uid) return;

    // 1. Fetch Chat Meta
    const chatRef = doc(db, 'chats', chatId as string);
    getDoc(chatRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setChatData(data);
        
        // Fetch matched offer details
        getDoc(doc(db, 'offers', data.offerId)).then(oSnap => {
          if (oSnap.exists()) setOfferData(oSnap.data());
        });
      }
    });

    // 2. Listen to Messages
    const q = query(
      collection(db, `messages/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(items);
      setLoading(false);
      
      // Auto-mark as read
      updateDoc(chatRef, { [`unreadCount.${uid}`]: 0 });
    });

    return () => unsubscribe();
  }, [chatId, uid]);

  const handleSend = async (imageUrl?: string) => {
    if (!inputText.trim() && !imageUrl) return;
    if (!chatId) return;

    const text = inputText.trim();
    setInputText('');
    setSending(!imageUrl); // don't show dual loaders if image

    try {
      const msgData = {
        senderId: uid,
        senderName: displayName,
        text: text || null,
        imageUrl: imageUrl || null,
        type: imageUrl ? 'image' : 'text',
        readBy: [uid],
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, `messages/${chatId}/messages`), msgData);

      // Update Chat Meta
      const otherUid = chatData.participants.find((id: string) => id !== uid);
      await updateDoc(doc(db, 'chats', chatId as string), {
        lastMessage: imageUrl ? '📷 Photo' : text,
        lastMessageAt: Timestamp.now(),
        [`unreadCount.${otherUid}`]: increment(1)
      });

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Message failed to send');
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const msgId = `msg_${Date.now()}`;
      const url = await uploadImage(result.assets[0].uri, `chats/${chatId}/${msgId}.jpg`);
      handleSend(url);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === uid;
    const isSystem = item.senderId === 'system';

    if (isSystem) {
      return (
        <View className="items-center my-4 px-10">
           <View className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <Text className="text-[10px] font-black text-slate-400 uppercase text-center">{item.text}</Text>
           </View>
        </View>
      );
    }

    return (
      <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mr-2 self-end mb-1">
             <User size={16} color="#94A3B8" />
          </View>
        )}
        <View 
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
            isMe ? 'bg-primary-green rounded-tr-none' : 'bg-slate-100 rounded-tl-none'
          }`}
        >
          {item.imageUrl && (
             <Image source={{ uri: item.imageUrl }} className="w-48 h-48 rounded-lg mb-2" resizeMode="cover" />
          )}
          {item.text && (
            <Text className={`text-sm font-medium ${isMe ? 'text-white' : 'text-slate-800'}`}>
              {item.text}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const counterpartName = chatData ? (chatData.participants[0] === uid ? chatData.businessName : chatData.supplierName) : 'Loading...';

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View 
        className="px-6 pb-4 bg-white border-b border-slate-100 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
           <ArrowLeft size={24} color="#0F172A" />
        </Pressable>
        
        <View className="flex-1 items-center">
           <View className="flex-row items-center">
              <Text className="font-black text-slate-900 uppercase tracking-tight">{counterpartName}</Text>
              <View className="ml-1"><BadgeCheck size={14} color={COLORS.primaryGreen} fill="white" /></View>
           </View>
           <Text className="text-[10px] font-bold text-primary-green uppercase tracking-widest">Active Negotiation</Text>
        </View>

        <View className="w-10" />
      </View>

      {offerData && (
         <View className="bg-slate-900 mx-6 mt-4 p-4 rounded-3xl flex-row items-center shadow-lg shadow-black/10">
            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-4">
               <Package size={20} color="white" />
            </View>
            <View className="flex-1">
               <Text className="text-white font-black text-xs uppercase tracking-widest">Deal: {offerData.quantity} {offerData.unit}</Text>
               <Text className="text-white/60 text-[10px] font-bold">Total: Rs. {(offerData.quantity * offerData.pricePerUnit).toLocaleString()}</Text>
            </View>
            
            {chatData.status === 'active' ? (
              <Pressable 
                onPress={() => {
                   Alert.alert('Confirm Delivery', 'Has the produce been delivered successfully?', [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Yes, Delivered', 
                        onPress: async () => {
                           try {
                              await apiClient(`/reviews/${chatId}/confirm-delivery`, { method: 'PATCH' });
                              // status will update via listener
                           } catch (e) {
                              Alert.alert('Error', 'Action failed');
                           }
                        }
                      }
                   ])
                }}
                className="bg-primary-green px-3 py-2 rounded-xl"
              >
                 <Text className="text-white text-[10px] font-black uppercase">Confirm Delivery</Text>
              </Pressable>
            ) : chatData.status === 'delivery_confirmed' ? (
              <Pressable 
                 onPress={() => router.push(`/rating/${chatId}`)}
                 className="bg-amber-500 px-3 py-2 rounded-xl"
              >
                 <Text className="text-white text-[10px] font-black uppercase">Rate Trade</Text>
              </Pressable>
            ) : (
              <View className="bg-slate-700 px-3 py-1.5 rounded-lg">
                 <Text className="text-white/50 text-[10px] font-bold uppercase">Archive</Text>
              </View>
            )}
         </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primaryGreen} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View 
        className="px-6 pb-6 pt-2 bg-white flex-row items-center border-t border-slate-50"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <Pressable 
          onPress={handlePickImage}
          className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center mr-3"
        >
           <ImageIcon size={22} color="#64748B" />
        </Pressable>
        
        <View className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mr-3 max-h-32">
          <TextInput
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            className="text-sm font-medium text-slate-900"
          />
        </View>

        <Pressable 
          onPress={() => handleSend()}
          disabled={sending}
          className={`w-12 h-12 rounded-2xl items-center justify-center ${sending ? 'bg-slate-200' : 'bg-primary-green shadow-md shadow-emerald-900/20'}`}
        >
          {sending ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" fill="white" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
