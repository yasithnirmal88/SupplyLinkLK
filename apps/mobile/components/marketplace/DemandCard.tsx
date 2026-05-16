import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, Clock, BadgeCheck, Package } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { COLORS } from '../../constants/Colors';
import type { DemandPost } from '@supplylink/shared-types';

interface DemandCardProps {
  post: DemandPost;
  onPress: () => void;
}

export const DemandCard: React.FC<DemandCardProps> = ({ post, onPress }) => {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-white rounded-[2rem] p-6 mb-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1 pr-4">
          <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
            <Text style={{ fontSize: 32 }}>📦</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              {post.category}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-primary-green font-bold text-xs uppercase tracking-widest">{post.businessName}</Text>
              <View className="ml-1">
                <BadgeCheck size={14} color={COLORS.primaryGreen} fill="white" />
              </View>
            </View>
          </View>
        </View>
        
        <View className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 items-center">
           <Text className="text-amber-700 font-black text-[10px] uppercase">Deadline</Text>
           <Text className="text-amber-700 font-bold text-xs">{formatDistanceToNow(new Date(post.deadline))}</Text>
        </View>
      </View>

      <Text className="text-slate-500 font-medium mb-4 line-clamp-2 leading-5">
        {post.description}
      </Text>

      <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl">
         <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</Text>
            <Text className="text-lg font-black text-slate-900">
               {post.quantityNeeded} <Text className="text-sm font-bold text-slate-500">{post.unit}</Text>
            </Text>
         </View>
         <View className="items-end">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Price</Text>
            <Text className="text-lg font-black text-primary-green">
               Rs. {post.priceRangeMin?.toLocaleString()} - {post.priceRangeMax?.toLocaleString()}
            </Text>
         </View>
      </View>

      <View className="flex-row items-center justify-between mt-4 px-1">
         <View className="flex-row items-center">
            <MapPin size={14} color="#64748B" />
            <Text className="ml-1.5 text-slate-500 font-bold text-xs uppercase tracking-tight">{post.district}</Text>
         </View>
         <View className="bg-primary-green px-4 py-2 rounded-xl">
            <Text className="text-white font-bold text-xs uppercase">Submit Offer</Text>
         </View>
      </View>
    </Pressable>
  );
};
