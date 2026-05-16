import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react-native';
import { COLORS } from '../../../constants/Colors';

interface VerificationBadgeProps {
  label: 'KYC' | 'Business' | 'Phone';
  enabled: boolean;
}

const iconMap = {
  KYC: CheckCircle2,
  Business: ShieldCheck,
  Phone: Smartphone,
};

const VerificationBadge = memo(({ label, enabled }: VerificationBadgeProps) => {
  const { t } = useTranslation();
  const Icon = iconMap[label];
  
  return (
    <View className="flex-row items-center gap-2 rounded-full px-4 py-2 border border-slate-200 bg-white shadow-sm">
      <Icon size={16} color={enabled ? COLORS.success : '#94A3B8'} />
      <Text className={`text-[10px] font-black uppercase tracking-[0.2em] ${enabled ? 'text-emerald-700' : 'text-slate-500'}`}>
        {label} {enabled ? t('common.approved') : t('common.pending')}
      </Text>
    </View>
  );
});

export default VerificationBadge;
