import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2 } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { COLORS } from '../../../constants/Colors';

const CATEGORIES = [
  { slug: 'coconuts', emoji: '🥥', nameKey: 'cat.coconuts' },
  { slug: 'vegetables', emoji: '🥦', nameKey: 'cat.vegetables' },
  { slug: 'fruits', emoji: '🍎', nameKey: 'cat.fruits' },
  { slug: 'grains', emoji: '🌾', nameKey: 'cat.grains' },
  { slug: 'spices', emoji: '🌶️', nameKey: 'cat.spices' },
  { slug: 'herbs', emoji: '🌿', nameKey: 'cat.herbs' },
  { slug: 'eggs', emoji: '🥚', nameKey: 'cat.eggs' },
  { slug: 'dairy', emoji: '🥛', nameKey: 'cat.dairy' },
  { slug: 'other', emoji: '📦', nameKey: 'cat.other' },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setCategories, selectedCategories } = useKycStore();

  const [selected, setSelected] = useState<string[]>(
    selectedCategories.map(c => c.slug)
  );

  const toggleCategory = (slug: string) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter(s => s !== slug));
    } else {
      setSelected([...selected, slug]);
    }
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      const selections = CATEGORIES
        .filter(c => selected.includes(c.slug))
        .map(c => ({ slug: c.slug, name: t(c.nameKey) }));
      
      setCategories(selections);
      router.push('/onboarding/supplier/category-selfie');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ProgressBar current={4} total={7} />

      <View className="flex-1 px-6 pt-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.supplier.categories.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.supplier.categories.subtitle')}
          </Text>
        </View>

        <View className="flex-1">
          <FlatList
            data={CATEGORIES}
            numColumns={2}
            keyExtractor={(item) => item.slug}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item.slug);
              return (
                <Pressable
                  onPress={() => toggleCategory(item.slug)}
                  className={`flex-1 aspect-square rounded-3xl items-center justify-center border-2 border-dashed ${isSelected ? 'bg-primary-green/5 border-primary-green' : 'bg-white border-gray-200'}`}
                >
                  <View className="items-center">
                    <Text style={{ fontSize: 40 }} className="mb-2">{item.emoji}</Text>
                    <Text className={`font-bold text-center ${isSelected ? 'text-primary-green' : 'text-text-muted'}`}>
                      {t(item.nameKey)}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="absolute top-3 right-3">
                      <CheckCircle2 size={24} color={COLORS.primaryGreen} fill="white" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </View>

        <View className="py-4 px-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
          <Text className="text-blue-800 text-xs font-semibold">STOCK VERIFICATION</Text>
          <Text className="text-blue-700 text-xs mt-1">
            {t('onboarding.supplier.categories.instruction')}
          </Text>
        </View>
      </View>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleContinue}
          disabled={selected.length === 0}
          className={`py-4 rounded-2xl items-center ${selected.length > 0 ? 'bg-primary-green' : 'bg-gray-300'}`}
        >
          <Text className="text-white font-bold text-lg">
            {t('onboarding.supplier.categories.continue', { count: selected.length })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
