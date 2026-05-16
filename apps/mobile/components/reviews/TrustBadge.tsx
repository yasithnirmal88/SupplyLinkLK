import React from 'react';
import { View, Text } from 'react-native';
import { Award, ShieldCheck, Zap, TrendingUp, Heart } from 'lucide-react-native';

interface TrustBadgeProps {
  badge: string;
  size?: 'sm' | 'md';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ badge, size = 'md' }) => {
  const getBadgeConfig = (name: string) => {
    switch (name) {
      case 'KYC Verified':
        return { icon: ShieldCheck, color: '#10B981', bgColor: 'bg-emerald-50' };
      case 'Trusted Seller':
        return { icon: Award, color: '#2D6A4F', bgColor: 'bg-green-50' };
      case 'Fast Responder':
        return { icon: Zap, color: '#F4A261', bgColor: 'bg-orange-50' };
      case 'Top Supplier':
        return { icon: TrendingUp, color: '#2563EB', bgColor: 'bg-blue-50' };
      case 'Buyer Favorite':
        return { icon: Heart, color: '#EF4444', bgColor: 'bg-rose-50' };
      default:
        return { icon: Award, color: '#6B7280', bgColor: 'bg-gray-50' };
    }
  };

  const { icon: Icon, color, bgColor } = getBadgeConfig(badge);
  const isSm = size === 'sm';

  return (
    <View className={`flex-row items-center ${bgColor} rounded-full ${isSm ? 'px-2 py-0.5' : 'px-3 py-1'} mr-2 mb-2`}>
      <Icon size={isSm ? 12 : 14} color={color} />
      <Text 
        className={`ml-1 font-bold ${isSm ? 'text-[10px]' : 'text-[11px]'} uppercase tracking-tight`}
        style={{ color }}
      >
        {badge}
      </Text>
    </View>
  );
};
