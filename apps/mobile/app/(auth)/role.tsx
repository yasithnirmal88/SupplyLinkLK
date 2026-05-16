import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { ChevronLeft, Check, User, Briefcase, ArrowRight } from 'lucide-react-native';

import { useAuthStore } from '../../stores/authStore';
import { updateUserRole } from '../../services/auth';
import { COLORS } from '../../constants/Colors';
import type { Role } from '@supplylink/shared-types';

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  emoji: string;
  isSelected: boolean;
  onSelect: (role: Role) => void;
  index: number;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, title, description, emoji, isSelected, onSelect, index }) => {
  return (
    <MotiView
      from={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 400 + index * 100 }}
    >
      <Pressable
        onPress={() => onSelect(role)}
        className={`p-6 rounded-[32px] border-2 flex-row items-center mb-4 transition-all ${
          isSelected 
            ? 'bg-primary-green border-primary-green shadow-xl shadow-primary-green/20' 
            : 'bg-white border-slate-100'
        }`}
      >
        <View className={`w-16 h-16 rounded-2xl items-center justify-center mr-5 ${
          isSelected ? 'bg-white/20' : 'bg-slate-50'
        }`}>
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className={`font-black text-xl mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </Text>
          <Text className={`font-medium text-sm leading-5 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
            {description}
          </Text>
        </View>
        <View className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
          isSelected ? 'bg-white border-white' : 'border-slate-200'
        }`}>
          {isSelected && <Check size={18} color={COLORS.primaryGreen} strokeWidth={4} />}
        </View>
      </Pressable>
    </MotiView>
  );
};

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uid, setRole, setLoading, isLoading } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = async () => {
    if (!selectedRole || !uid) return;

    setLoading(true);
    try {
      await updateUserRole(uid, selectedRole);
      setRole(selectedRole);

      const target = selectedRole === 'supplier' 
        ? '/onboarding/supplier/profile' 
        : '/onboarding/business/profile';
      
      router.replace(target);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 px-8 pt-16 pb-12">
        {/* Header Navigation */}
        <MotiView 
          from={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-row items-center justify-between mb-12"
        >
          <Pressable
            onPress={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-slate-50 items-center justify-center border border-slate-100 active:scale-90"
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Step 3 of 3
          </Text>
          <View className="w-12" />
        </MotiView>

        {/* Content */}
        <View className="flex-1">
          <MotiView
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <View className="w-16 h-16 bg-amber-50 rounded-3xl items-center justify-center mb-8">
              <User size={32} color={COLORS.accentGold} />
            </View>
            
            <Text className="text-slate-900 text-4xl font-black leading-[1.1] mb-4">
              How will you{'\n'}use SupplyLink?
            </Text>
            <Text className="text-slate-400 text-lg font-medium leading-6 pr-10">
              Select your primary role to customize your experience.
            </Text>
          </MotiView>

          <View className="mt-12">
            <RoleCard 
              role="supplier"
              emoji="🌿"
              title="Individual Supplier"
              description="I want to sell my crops and products directly to businesses."
              isSelected={selectedRole === 'supplier'}
              onSelect={setSelectedRole}
              index={0}
            />
            <RoleCard 
              role="business"
              emoji="🏢"
              title="Business Buyer"
              description="I want to source quality products for my restaurant or shop."
              isSelected={selectedRole === 'business'}
              onSelect={setSelectedRole}
              index={1}
            />
          </View>
        </View>

        {/* Footer CTAs */}
        <MotiView
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 600 }}
        >
          <Pressable
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`rounded-3xl py-6 flex-row items-center justify-center shadow-xl ${
              selectedRole ? 'bg-primary-green shadow-primary-green/20' : 'bg-slate-200'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className={`font-black text-lg mr-2 ${selectedRole ? 'text-white' : 'text-slate-400'}`}>
                  Complete Profile Setup
                </Text>
                <ArrowRight size={20} color={selectedRole ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}
