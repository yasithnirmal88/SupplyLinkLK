import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Clock, ShieldAlert, XCircle, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

interface VerificationGuardModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'pending' | 'rejected' | null;
}

export const VerificationGuardModal: React.FC<VerificationGuardModalProps> = ({ 
  isVisible, 
  onClose, 
  status 
}) => {
  const isRejected = status === 'rejected';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="w-full bg-white rounded-[2.5rem] overflow-hidden">
          {/* Header Icon */}
          <View 
            className={`py-12 items-center justify-center ${isRejected ? 'bg-red-50' : 'bg-amber-50'}`}
          >
            <View 
              className={`w-20 h-20 rounded-3xl items-center justify-center shadow-sm ${isRejected ? 'bg-red-500' : 'bg-amber-500'}`}
            >
              {isRejected ? (
                <XCircle size={40} color="white" />
              ) : (
                <Clock size={40} color="white" />
              )}
            </View>
          </View>

          {/* Body */}
          <View className="p-8 items-center">
            <Text className="text-2xl font-black text-slate-900 text-center uppercase tracking-tight">
              {isRejected ? 'Verification Failed' : 'Verification Under Review'}
            </Text>
            
            <Text className="text-slate-500 text-center mt-4 leading-6 font-medium">
              {isRejected 
                ? "Your KYC documents were not approved. Please check your email or contact support for re-submission details."
                : "Our team is currently reviewing your documents. Total access will be granted within 24 hours of submission."}
            </Text>

            <View className="w-full h-[1px] bg-slate-100 my-8" />

            <Pressable
              onPress={onClose}
              className={`w-full py-4 rounded-2xl items-center flex-row justify-center gap-2 ${isRejected ? 'bg-red-500' : 'bg-primary-green'}`}
            >
              <Text className="text-white font-bold text-lg">
                {isRejected ? 'Contact Support' : 'Understood'}
              </Text>
              {!isRejected && <ArrowRight size={20} color="white" />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
