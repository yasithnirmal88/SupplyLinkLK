import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Sparkles, X } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';

interface SubscriptionGuardModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const SubscriptionGuardModal: React.FC<SubscriptionGuardModalProps> = ({ 
  isVisible, 
  onClose,
  title,
  description
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription/plans');
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-6">
        <View className="w-full bg-white rounded-[3rem] overflow-hidden">
          <View className="bg-slate-900 py-12 items-center relative">
             <View className="absolute top-4 right-6">
                <Pressable onPress={onClose} className="p-2">
                   <X size={24} color="rgba(255,255,255,0.3)" />
                </Pressable>
             </View>
             <View className="w-20 h-20 bg-primary-green rounded-[2rem] items-center justify-center shadow-xl shadow-emerald-500/40">
                <Crown size={40} color="white" />
             </View>
             <Text className="text-white text-2xl font-black mt-6 uppercase tracking-tight">Upgrade Required</Text>
          </View>
          
          <View className="p-8 items-center">
            <Text className="text-slate-900 text-xl font-black text-center uppercase tracking-tight">{title}</Text>
            <Text className="text-slate-500 text-center mt-3 font-medium leading-5">
              {description}
            </Text>

            <View className="w-full h-[1px] bg-slate-100 my-8" />

            <Pressable
              onPress={handleUpgrade}
              className="w-full bg-primary-green py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/20"
            >
              <Sparkles size={20} color="white" fill="white" />
              <Text className="text-white font-black text-lg ml-3 uppercase tracking-tight">Unlock Unlimited Access</Text>
            </Pressable>
            
            <Pressable onPress={onClose} className="mt-6">
               <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest">Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
