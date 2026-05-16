import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User 
} from 'lucide-react-native';
import { View, Platform } from 'react-native';

import { COLORS } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { VerificationGuardModal } from '../../components/marketplace/VerificationGuardModal';

export default function TabLayout() {
  const { verificationStatus } = useAuthStore();
  const [showGuard, setShowGuard] = useState(false);

  const isApproved = verificationStatus === 'approved';

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primaryGreen,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 100 : 85,
            paddingBottom: Platform.OS === 'ios' ? 40 : 25,
            paddingTop: 12,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            marginTop: -4,
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
        }}
        screenListeners={{
          tabPress: (e) => {
            if (!isApproved && e.target?.includes('post')) {
              e.preventDefault();
              setShowGuard(true);
            }
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => <Home size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <View className="bg-slate-900 w-14 h-14 rounded-full items-center justify-center -mt-8 shadow-xl shadow-slate-900/30 border-4 border-white">
                <Plus size={28} color="white" strokeWidth={3} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => <MessageCircle size={22} color={color} strokeWidth={2.5} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={22} color={color} strokeWidth={2.5} />,
          }}
        />
      </Tabs>

      <VerificationGuardModal 
        isVisible={showGuard}
        onClose={() => setShowGuard(false)}
        status={verificationStatus as any}
      />
    </>
  );
}
