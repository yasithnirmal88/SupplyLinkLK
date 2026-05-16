import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { MapPin, Star, BadgeCheck, Zap } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';
import type { SupplyAd } from '@supplylink/shared-types';

interface SupplyCardProps {
  ad: SupplyAd;
  onPress: () => void;
}

export const SupplyCard: React.FC<SupplyCardProps> = ({ ad, onPress }) => {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-white rounded-[2rem] mb-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all overflow-hidden"
    >
      <View className="h-56 relative bg-slate-100">
        {ad.imageUrls && ad.imageUrls[0] ? (
          <Image source={{ uri: ad.imageUrls[0] }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full items-center justify-center">
             <Zap size={48} color="#D1D5DB" />
          </View>
        )}
        
        {/* District Badge */}
        <View className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-xl flex-row items-center border border-white/50">
           <MapPin size={12} color={COLORS.primaryGreen} />
           <Text className="ml-1.5 text-slate-800 font-bold text-[10px] uppercase tracking-tighter">
             {ad.district}
           </Text>
        </View>

        {/* Verification Overlay */}
        <View className="absolute top-4 right-4 bg-primary-green px-3 py-1.5 rounded-xl flex-row items-center">
           <BadgeCheck size={12} color="white" />
           <Text className="ml-1.5 text-white font-black text-[10px] uppercase tracking-tighter">
             Verified
           </Text>
        </View>
      </View>

      <View className="p-6">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              {ad.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">{ad.supplierName}</Text>
              <Text className="text-slate-300 mx-2">•</Text>
              <View className="flex-row items-center">
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text className="ml-1 text-slate-500 font-bold text-[10px]">4.8 (12 reviews)</Text>
              </View>
            </View>
          </View>
          
          <View className="items-end">
             <Text className="text-2xl font-black text-primary-green">Rs.{ad.pricePerUnit}</Text>
             <Text className="text-[10px] font-bold text-slate-400 uppercase">per {ad.unit}</Text>
          </View>
        </View>

        <View className="w-full h-[1px] bg-slate-100 my-4" />

        <View className="flex-row items-center justify-between">
           <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center">
                 <Zap size={16} color={COLORS.primaryGreen} />
              </View>
              <View className="ml-3">
                 <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</Text>
                 <Text className="text-sm font-black text-slate-900">
                    {ad.quantity} {ad.unit}
                 </Text>
              </View>
           </View>
           
           <View className="bg-slate-900 px-6 py-3 rounded-2xl shadow-sm">
              <Text className="text-white font-bold text-xs uppercase">View Supplier</Text>
           </View>
        </View>
      </View>
    </Pressable>
  );
};
