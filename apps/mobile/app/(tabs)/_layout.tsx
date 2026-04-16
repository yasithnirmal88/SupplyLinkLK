import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  UserCircle 
} from 'lucide-react-native';
import { View } from 'react-native';

import { COLORS } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';
import { VerificationGuardModal } from '../../components/marketplace/VerificationGuardModal';

export default function TabLayout() {
  const { verificationStatus } = useAuthStore();
  const [showGuard, setShowGuard] = useState(false);

  // If user is not approved, we want to show the guard modal when they interact 
  // or simply keep it visible. The requirement says "On any tab press... block navigation".
  // A cleaner way in Expo Router is to use screen listeners or just wrap the content.
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
            borderTopColor: '#F1F5F9',
            height: 90,
            paddingBottom: 30,
            paddingTop: 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            marginTop: -4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
        }}
        screenListeners={{
          tabPress: (e) => {
            if (!isApproved) {
              e.preventDefault();
              setShowGuard(true);
            }
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Market',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: 'Post Ad',
            tabBarIcon: ({ color }) => (
              <View className="bg-primary-green p-3 rounded-2xl -mt-8 shadow-lg shadow-emerald-900/40">
                <PlusCircle size={28} color="white" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
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
