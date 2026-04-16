import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  PackageCheck,
  CalendarCheck
} from 'lucide-react-native';

import { apiClient } from '../../services/api';

const offerSchema = z.object({
  quantityOffered: z.number().min(1, 'Quantity is required'),
  pricePerUnit: z.number().min(1, 'Price per unit required'),
  availableByDate: z.date(),
  notes: z.string().max(200).optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

export default function SubmitOfferScreen() {
  const router = useRouter();
  const { postId, title, qtyNeeded, unit, businessName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      availableByDate: new Date(),
    }
  });

  const onSubmit = async (data: OfferFormValues) => {
    setLoading(true);
    try {
      await apiClient('/offers', {
        method: 'POST',
        body: {
          demandPostId: postId,
          ...data,
          availableByDate: data.availableByDate.toISOString(),
        }
      });
      Alert.alert('Success', 'Offer sent to the buyer!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100 mt-10">
         <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-slate-50">
            <ArrowLeft size={24} color="#0F172A" />
         </Pressable>
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">Submit Offer</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         <View className="bg-primary-green/5 border border-primary-green/10 p-6 rounded-[2rem] mb-8">
            <Text className="text-[10px] font-black text-primary-green uppercase tracking-widest mb-1">Responding to</Text>
            <Text className="text-xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{title}</Text>
            <View className="flex-row items-center justify-between mt-4">
               <View>
                  <Text className="text-xs font-bold text-slate-400">Buyer</Text>
                  <Text className="text-sm font-black text-slate-700">{businessName}</Text>
               </View>
               <View className="items-end">
                  <Text className="text-xs font-bold text-slate-400">Total Needed</Text>
                  <Text className="text-sm font-black text-slate-700">{qtyNeeded} {unit}</Text>
               </View>
            </View>
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex-row items-center">
               <PackageCheck size={14} color="#94A3B8" /> Supply Quantity ({unit})
            </Text>
            <Controller
              control={control}
              name="quantityOffered"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value?.toString()} onChangeText={v => onChange(parseInt(v, 10))}
                  keyboardType="numeric" placeholder={`Amount in ${unit}`}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-lg font-black text-slate-900"
                />
              )}
            />
            <Text className="text-[10px] text-slate-400 mt-2 font-medium px-1">Note: You can offer a partial amount if the post allows quota splitting.</Text>
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex-row items-center">
                Rs. Offer Price / {unit}
            </Text>
            <Controller
              control={control}
              name="pricePerUnit"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value?.toString()} onChangeText={v => onChange(parseInt(v, 10))}
                  keyboardType="numeric" placeholder="Price per unit"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-lg font-black text-primary-green"
                />
              )}
            />
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex-row items-center">
               <CalendarCheck size={14} color="#94A3B8" /> Ready By Date
            </Text>
            <Controller
              control={control}
              name="availableByDate"
              render={({ field: { onChange, value } }) => (
                <Pressable onPress={() => setShowDatePicker(true)} className="bg-white border border-slate-200 rounded-2xl px-4 py-4">
                   <Text className="font-bold text-slate-900">{value.toLocaleDateString()}</Text>
                   {showDatePicker && (
                      <DateTimePicker
                        value={value} mode="date"
                        onChange={(e, d) => { setShowDatePicker(false); if(d) onChange(d); }}
                      />
                   )}
                </Pressable>
              )}
            />
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes to Buyer</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value} onChangeText={onChange}
                  placeholder="e.g. Can supply top grade produce..."
                  multiline numberOfLines={3} textAlignVertical="top"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 min-h-[100px]"
                />
              )}
            />
         </View>

         <View className="h-40" />
      </ScrollView>

      <View className="absolute bottom-6 left-6 right-6">
         <Pressable 
           onPress={handleSubmit(onSubmit)}
           disabled={loading}
           className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-xl ${loading ? 'bg-slate-400' : 'bg-primary-green shadow-emerald-900/40'}`}
         >
            {loading ? <ActivityIndicator color="white" /> : (
               <>
                 <Zap size={24} color="white" fill="white" />
                 <Text className="text-white font-black text-lg uppercase tracking-tight">Send Live Offer</Text>
               </>
            )}
         </Pressable>
      </View>
    </View>
  );
}
