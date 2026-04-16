import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Search, Filter } from 'lucide-react-native';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <View 
        className="px-6 pb-6 pt-4 flex-row justify-between items-center bg-white border-b border-slate-50"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Text className="text-2xl font-black text-slate-900 uppercase tracking-tight">Messages</Text>
        <Pressable className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
           <Search size={20} color="#64748B" />
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        <View className="py-20 items-center justify-center px-10">
           <View className="w-20 h-20 bg-slate-50 rounded-[2rem] items-center justify-center mb-6">
              <MessageSquare size={40} color="#CBD5E1" />
           </View>
           <Text className="text-xl font-black text-slate-800 uppercase tracking-tight text-center">No Conversations Yet</Text>
           <Text className="text-slate-400 text-center mt-3 font-medium leading-5">
             Submit an offer or inquire about a listing to start a negotiation.
           </Text>
        </View>
      </ScrollView>
    </View>
  );
}
