import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { ChevronLeft, Check, User, ArrowRight } from 'lucide-react-native';
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
}

const RoleCard: React.FC<RoleCardProps> = ({ role, title, description, emoji, isSelected, onSelect }) => (
  <Pressable
    onPress={() => onSelect(role)}
    style={{
      padding: 24, borderRadius: 32, borderWidth: 2, flexDirection: 'row', alignItems: 'center', marginBottom: 16,
      backgroundColor: isSelected ? COLORS.primaryGreen : 'white',
      borderColor: isSelected ? COLORS.primaryGreen : '#F1F5F9',
    }}
  >
    <View style={{ width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 20, backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F8FAFC' }}>
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '900', fontSize: 20, marginBottom: 4, color: isSelected ? 'white' : '#0F172A' }}>{title}</Text>
      <Text style={{ fontWeight: '500', fontSize: 13, lineHeight: 18, color: isSelected ? 'rgba(255,255,255,0.7)' : '#94A3B8' }}>{description}</Text>
    </View>
    <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, backgroundColor: isSelected ? 'white' : 'transparent', borderColor: isSelected ? 'white' : '#E2E8F0' }}>
      {isSelected && <Check size={18} color={COLORS.primaryGreen} strokeWidth={4} />}
    </View>
  </Pressable>
);

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uid, setRole, setLoading, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const header0 = useSharedValue(0);
  const headerX = useSharedValue(-10);
  const content0 = useSharedValue(0);
  const contentY = useSharedValue(20);
  const cards0 = useSharedValue(0);
  const cardsY = useSharedValue(20);
  const footer0 = useSharedValue(0);
  const footerY = useSharedValue(20);

  useEffect(() => {
    header0.value = withTiming(1, { duration: 400 });
    headerX.value = withTiming(0, { duration: 400 });
    content0.value = withTiming(1, { duration: 600 });
    contentY.value = withTiming(0, { duration: 600 });
    cards0.value = withDelay(300, withTiming(1, { duration: 600 }));
    cardsY.value = withDelay(300, withTiming(0, { duration: 600 }));
    footer0.value = withDelay(600, withTiming(1, { duration: 600 }));
    footerY.value = withDelay(600, withTiming(0, { duration: 600 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: header0.value, transform: [{ translateX: headerX.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: content0.value, transform: [{ translateY: contentY.value }] }));
  const cardsStyle = useAnimatedStyle(() => ({ opacity: cards0.value, transform: [{ translateY: cardsY.value }] }));
  const footerStyle = useAnimatedStyle(() => ({ opacity: footer0.value, transform: [{ translateY: footerY.value }] }));

  const handleContinue = async () => {
    if (!selectedRole || !uid) return;
    setLoading(true);
    try {
      await updateUserRole(uid, selectedRole);
      setRole(selectedRole);
      router.replace(selectedRole === 'supplier' ? '/onboarding/supplier/profile' : '/onboarding/business/profile');
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 64, paddingBottom: 48 }}>
        <Animated.View style={[headerStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }]}>
          <Pressable onPress={() => router.back()} style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3 }}>Step 3 of 3</Text>
          <View style={{ width: 48 }} />
        </Animated.View>

        <View style={{ flex: 1 }}>
          <Animated.View style={contentStyle}>
            <View style={{ width: 64, height: 64, backgroundColor: '#FFFBEB', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <User size={32} color={COLORS.accentGold} />
            </View>
            <Text style={{ color: '#0F172A', fontSize: 36, fontWeight: '900', lineHeight: 40, marginBottom: 16 }}>How will you{'\n'}use SupplyLink?</Text>
            <Text style={{ color: '#94A3B8', fontSize: 17, fontWeight: '500', lineHeight: 24, paddingRight: 40 }}>Select your primary role to customize your experience.</Text>
          </Animated.View>

          <Animated.View style={[cardsStyle, { marginTop: 48 }]}>
            <RoleCard role="supplier" emoji="🌿" title="Individual Supplier" description="I want to sell my crops and products directly to businesses." isSelected={selectedRole === 'supplier'} onSelect={setSelectedRole} />
            <RoleCard role="business" emoji="🏢" title="Business Buyer" description="I want to source quality products for my restaurant or shop." isSelected={selectedRole === 'business'} onSelect={setSelectedRole} />
          </Animated.View>
        </View>

        <Animated.View style={footerStyle}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            style={{ borderRadius: 24, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedRole ? COLORS.primaryGreen : '#E2E8F0' }}
          >
            {isLoading ? <ActivityIndicator color="white" /> : (
              <>
                <Text style={{ fontWeight: '900', fontSize: 17, marginRight: 8, color: selectedRole ? 'white' : '#94A3B8' }}>Complete Profile Setup</Text>
                <ArrowRight size={20} color={selectedRole ? 'white' : '#94A3B8'} />
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}