import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

export const MarketplaceSkeleton = () => {
  return (
    <View className="px-6 gap-6">
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 overflow-hidden">
          <View className="flex-row justify-between mb-6">
            <View className="flex-row items-center">
              <Skeleton colorMode="light" radius={16} height={60} width={60} />
              <View className="ml-4 gap-2">
                <Skeleton colorMode="light" height={24} width={150} />
                <Skeleton colorMode="light" height={16} width={100} />
              </View>
            </View>
            <Skeleton colorMode="light" radius={12} height={40} width={80} />
          </View>
          
          <View className="gap-2 mb-6">
            <Skeleton colorMode="light" height={16} width="100%" />
            <Skeleton colorMode="light" height={16} width="80%" />
          </View>

          <View className="flex-row justify-between p-4 bg-slate-50 rounded-2xl">
            <View className="gap-1">
              <Skeleton colorMode="light" height={12} width={60} />
              <Skeleton colorMode="light" height={24} width={80} />
            </View>
            <View className="items-end gap-1">
              <Skeleton colorMode="light" height={12} width={60} />
              <Skeleton colorMode="light" height={24} width={120} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
