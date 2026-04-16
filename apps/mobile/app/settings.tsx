import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Globe, 
  Bell, 
  Shield, 
  Trash2, 
  ChevronRight,
  Info
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '../stores/authStore';
import i18n from '../services/i18n';
import { COLORS } from '../constants/Colors';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, setLanguage, uid } = useAuthStore();
  
  const [notifications, setNotifications] = useState({
    push: true,
    sms: true,
    marketing: false
  });

  const toggleSwitch = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will remove your profile from search and deactivate your listings permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            if (!uid) return;
            try {
              await updateDoc(doc(db, 'users', uid), { 
                deleted: true, 
                status: 'inactive',
                updatedAt: new Date().toISOString()
              });
              Alert.alert('Account Deactivated', 'Your logout will now proceed.');
              // logout logic would follow
            } catch (e) {
              Alert.alert('Error', 'Action failed');
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ children, title, icon: Icon }: any) => (
     <View className="mb-8">
        <View className="flex-row items-center mb-4 ml-2">
           <Icon size={16} color="#94A3B8" />
           <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</Text>
        </View>
        <View className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
           {children}
        </View>
     </View>
  );

  const SettingItem = ({ label, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
     <Pressable 
        onPress={onPress}
        className="flex-row items-center justify-between px-6 py-5 border-b border-slate-50 last:border-b-0 active:bg-slate-50"
     >
        <Text className="text-slate-700 font-bold">{label}</Text>
        {isSwitch ? (
           <Switch 
              value={switchValue} 
              onValueChange={onSwitchChange}
              trackColor={{ false: '#E2E8F0', true: COLORS.primaryGreen }}
           />
        ) : (
           <View className="flex-row items-center">
              {value && <Text className="mr-2 text-slate-400 font-bold text-sm">{value}</Text>}
              <ChevronRight size={16} color="#CBD5E1" />
           </View>
        )}
     </Pressable>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        className="px-6 pb-6 bg-white border-b border-slate-100 flex-row items-center"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-50">
           <ArrowLeft size={24} color="#0F172A" />
        </Pressable>
        <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">App Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
         <SettingRow title="Language Preferences" icon={Globe}>
            <SettingItem label="English" value={language === 'en' ? 'Active' : ''} onPress={() => changeLanguage('en')} />
            <SettingItem label="සිංහල (Sinhala)" value={language === 'si' ? 'Active' : ''} onPress={() => changeLanguage('si')} />
            <SettingItem label="தமிழ் (Tamil)" value={language === 'ta' ? 'Active' : ''} onPress={() => changeLanguage('ta')} />
         </SettingRow>

         <SettingRow title="Notification Control" icon={Bell}>
            <SettingItem 
               label="Push Notifications" 
               isSwitch switchValue={notifications.push} 
               onSwitchChange={() => toggleSwitch('push')} 
            />
            <SettingItem 
               label="SMS Alerts" 
               isSwitch switchValue={notifications.sms} 
               onSwitchChange={() => toggleSwitch('sms')} 
            />
         </SettingRow>

         <SettingRow title="Safety & Privacy" icon={Shield}>
            <SettingItem label="Terms of Service" />
            <SettingItem label="Privacy Policy" />
            <Pressable 
               onPress={handleDeleteAccount}
               className="flex-row items-center px-6 py-5 active:bg-rose-50"
            >
               <Trash2 size={18} color="#F43F5E" />
               <Text className="ml-3 text-rose-500 font-black uppercase text-xs">Delete Account Permanently</Text>
            </Pressable>
         </SettingRow>

         <View className="items-center py-10">
            <View className="w-12 h-12 bg-slate-200 rounded-2xl items-center justify-center mb-4">
               <Info size={24} color="#64748B" />
            </View>
            <Text className="text-slate-400 font-black uppercase text-[10px] tracking-widest">SupplyLink LK Mobile</Text>
            <Text className="text-slate-300 font-bold text-[10px] mt-1">Version 1.2.4 (Stable Build)</Text>
         </View>
      </ScrollView>
    </View>
  );
}
