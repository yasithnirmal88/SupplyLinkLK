import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../stores/authStore';

interface LanguageOption {
  code: 'en' | 'si' | 'ta';
  nameKey: string;
  subKey: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', nameKey: 'language.english', subKey: 'language.englishSub', flag: '🇬🇧' },
  { code: 'si', nameKey: 'language.sinhala', subKey: 'language.sinhalaSub', flag: '🇱🇰' },
  { code: 'ta', nameKey: 'language.tamil', subKey: 'language.tamilSub', flag: '🇱🇰' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAuthStore();

  const handleSelect = async (code: 'en' | 'si' | 'ta') => {
    await setLanguage(code);
    i18n.changeLanguage(code);
  };

  const handleContinue = () => {
    router.push('/(auth)/phone');
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      <View className="flex-1 px-6 pt-20 pb-8 justify-between">
        {/* Header */}
        <View className="items-center">
          {/* Icon */}
          <View
            className="items-center justify-center rounded-full mb-6"
            style={{
              width: 72,
              height: 72,
              backgroundColor: 'rgba(45,106,79,0.1)',
            }}
          >
            <Text style={{ fontSize: 36 }}>🌐</Text>
          </View>

          <Text
            className="text-text-primary font-bold text-center"
            style={{ fontSize: 28 }}
          >
            {t('language.title')}
          </Text>
          <Text
            className="text-text-muted text-center mt-2"
            style={{ fontSize: 15 }}
          >
            {t('language.subtitle')}
          </Text>
        </View>

        {/* Language Cards */}
        <View className="gap-4 mt-8">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => handleSelect(lang.code)}
                className="active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected ? '#2D6A4F' : '#FFFFFF',
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: isSelected ? '#2D6A4F' : '#E5E7EB',
                  shadowColor: isSelected ? '#2D6A4F' : '#000',
                  shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                  shadowOpacity: isSelected ? 0.25 : 0.06,
                  shadowRadius: isSelected ? 12 : 6,
                  elevation: isSelected ? 8 : 2,
                }}
              >
                <View className="flex-row items-center">
                  {/* Flag */}
                  <View
                    className="items-center justify-center rounded-2xl mr-4"
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(45,106,79,0.08)',
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{lang.flag}</Text>
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
                      {t(lang.nameKey)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: isSelected
                          ? 'rgba(255,255,255,0.7)'
                          : '#6B7280',
                        marginTop: 2,
                      }}
                    >
                      {t(lang.subKey)}
                    </Text>
                  </View>

                  {/* Checkmark */}
                  {isSelected && (
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: 'rgba(255,255,255,0.25)',
                      }}
                    >
                      <Text className="text-white font-bold" style={{ fontSize: 16 }}>
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button */}
        <View className="mt-auto pt-8">
          <Pressable
            onPress={handleContinue}
            className="rounded-2xl py-4 items-center active:opacity-90"
            style={{
              backgroundColor: '#2D6A4F',
              shadowColor: '#2D6A4F',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>
              {t('language.continue')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
