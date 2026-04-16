import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row justify-between mb-2">
        <Text className="text-text-muted font-bold" style={{ fontSize: 11, letterSpacing: 1 }}>
          ONBOARDING
        </Text>
        <Text className="text-primary-green font-bold" style={{ fontSize: 11 }}>
          {current} / {total}
        </Text>
      </View>
      <View className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full bg-primary-green rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>
    </View>
  );
};
