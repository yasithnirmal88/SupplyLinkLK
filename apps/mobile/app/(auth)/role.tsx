import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/authStore';
import { updateUserRole } from '../../services/auth';
import type { Role } from '@supplylink/shared-types';

interface RoleCard {
  role: Role;
  emoji: string;
  titleKey: string;
  descKey: string;
  gradient: string;
  iconBg: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'supplier',
    emoji: '🌿',
    titleKey: 'roles.supplierCard',
    descKey: 'roles.supplierCardDesc',
    gradient: '#2D6A4F',
    iconBg: 'rgba(45,106,79,0.12)',
  },
  {
    role: 'business',
    emoji: '🏢',
    titleKey: 'roles.businessCard',
    descKey: 'roles.businessCardDesc',
    gradient: '#1A1A2E',
    iconBg: 'rgba(26,26,46,0.08)',
  },
];

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uid, setRole, setLoading, isLoading } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Card entrance animations
  const cardAnims = useRef(
    ROLE_CARDS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(40),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      ...cardAnims.map((anim, i) =>
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (!selectedRole || !uid) return;

    setLoading(true);
    try {
      await updateUserRole(uid, selectedRole);
      setRole(selectedRole);

      // Navigate to onboarding based on role
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
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      <View className="flex-1 px-6 pt-16 pb-8 justify-between">
        {/* Header */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <View className="items-center mb-8">
            <View
              className="items-center justify-center rounded-full mb-5"
              style={{
                width: 72,
                height: 72,
                backgroundColor: 'rgba(244,162,97,0.15)',
              }}
            >
              <Text style={{ fontSize: 36 }}>👋</Text>
            </View>

            <Text
              className="text-text-primary font-bold text-center"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              {t('roles.title')}
            </Text>
            <Text
              className="text-text-muted text-center mt-2"
              style={{ fontSize: 15 }}
            >
              {t('roles.subtitle')}
            </Text>
          </View>
        </Animated.View>

        {/* Role Cards */}
        <View className="gap-5">
          {ROLE_CARDS.map((card, index) => {
            const isSelected = selectedRole === card.role;
            const anim = cardAnims[index];

            return (
              <Animated.View
                key={card.role}
                style={{
                  opacity: anim.opacity,
                  transform: [
                    { translateY: anim.translateY },
                    { scale: anim.scale },
                  ],
                }}
              >
                <Pressable
                  onPress={() => setSelectedRole(card.role)}
                  className="active:scale-[0.98]"
                  style={{
                    backgroundColor: isSelected ? card.gradient : '#FFFFFF',
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 2,
                    borderColor: isSelected ? card.gradient : '#E5E7EB',
                    shadowColor: isSelected ? card.gradient : '#000',
                    shadowOffset: { width: 0, height: isSelected ? 8 : 2 },
                    shadowOpacity: isSelected ? 0.3 : 0.06,
                    shadowRadius: isSelected ? 16 : 8,
                    elevation: isSelected ? 10 : 2,
                  }}
                >
                  <View className="flex-row items-start">
                    {/* Icon */}
                    <View
                      className="items-center justify-center rounded-2xl mr-4"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: isSelected
                          ? 'rgba(255,255,255,0.15)'
                          : card.iconBg,
                      }}
                    >
                      <Text style={{ fontSize: 32 }}>{card.emoji}</Text>
                    </View>

                    {/* Text */}
                    <View className="flex-1">
                      <Text
                        className="font-bold"
                        style={{
                          fontSize: 20,
                          color: isSelected ? '#FFFFFF' : '#1A1A2E',
                        }}
                      >
                        {t(card.titleKey)}
                      </Text>
                      <Text
                        className="mt-2"
                        style={{
                          fontSize: 14,
                          lineHeight: 20,
                          color: isSelected
                            ? 'rgba(255,255,255,0.75)'
                            : '#6B7280',
                        }}
                      >
                        {t(card.descKey)}
                      </Text>
                    </View>

                    {/* Radio indicator */}
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        borderWidth: 2,
                        borderColor: isSelected
                          ? 'rgba(255,255,255,0.5)'
                          : '#D1D5DB',
                        backgroundColor: isSelected
                          ? 'rgba(255,255,255,0.2)'
                          : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <View
                          className="rounded-full"
                          style={{
                            width: 14,
                            height: 14,
                            backgroundColor: '#FFFFFF',
                          }}
                        />
                      )}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Continue Button */}
        <Animated.View style={{ opacity: buttonOpacity }}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedRole || isLoading}
            className="rounded-2xl py-4 items-center active:opacity-90"
            style={{
              backgroundColor: selectedRole ? '#2D6A4F' : '#D1D5DB',
              shadowColor: selectedRole ? '#2D6A4F' : 'transparent',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: selectedRole ? 0.25 : 0,
              shadowRadius: 12,
              elevation: selectedRole ? 6 : 0,
            }}
          >
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>
              {t('roles.continue')}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
