import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Info,
  Layers,
  CheckCircle2,
  MapPin
} from 'lucide-react-native';

import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/Colors';

const demandSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  itemName: z.string().min(3, 'Item name too short').max(100),
  totalQuantity: z.number().min(1, 'Quantity is required'),
  unit: z.enum(['kg', 'units', 'bundles', 'bags']),
  priceRangeMin: z.number().min(1, 'Min price is required'),
  priceRangeMax: z.number().min(1, 'Max price is required'),
  deadline: z.date(),
  districtPreference: z.string().optional(),
  qualityNotes: z.string().max(500).optional(),
  quotaSplitEnabled: z.boolean().default(false),
});

type DemandFormValues = z.infer<typeof demandSchema>;

const CATEGORIES = ['Coconuts 🥥', 'Vegetables 🥦', 'Fruits 🍎', 'Rice & Grains 🌾', 'Spices 🌶️'];

export default function DemandPostScreen() {
  const router = useRouter();
  const { district } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      unit: 'kg',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      districtPreference: district || 'Any District',
      quotaSplitEnabled: false,
    }
  });

  const onSubmit = async (data: DemandFormValues) => {
    setLoading(true);
    try {
      await apiClient('/demand-posts', {
        method: 'POST',
        body: {
          ...data,
          deadline: data.deadline.toISOString(),
        }
      });
      Alert.alert('Success', 'Demand post published! Suppliers will be notified.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post demand');
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
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">Post Demand</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Produce Category</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <Pressable 
                      key={cat} onPress={() => onChange(cat)}
                      className={`px-4 py-2.5 rounded-xl border ${value === cat ? 'bg-primary-green border-primary-green' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`font-bold ${value === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Items Needed</Text>
            <Controller
              control={control}
              name="itemName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value} onChangeText={onChange}
                  placeholder="e.g. Red Onions or Keeri Samba Rice"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-base font-bold text-slate-900"
                />
              )}
            />
         </View>

         <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Quantity</Text>
              <Controller
                control={control}
                name="totalQuantity"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value?.toString()} onChangeText={v => onChange(parseInt(v, 10))}
                    keyboardType="numeric" placeholder="0"
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-black text-slate-900"
                  />
                )}
              />
            </View>
            <View className="flex-[0.6]">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unit</Text>
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-2 h-14 items-center">
                     {['kg','bags'].map(u => (
                        <Pressable key={u} onPress={() => onChange(u as any)} className={`p-2 rounded-lg border ${value === u ? 'bg-slate-900' : 'bg-white'}`}>
                           <Text className={`text-[10px] font-black uppercase ${value === u ? 'text-white' : 'text-slate-500'}`}>{u}</Text>
                        </Pressable>
                     ))}
                  </View>
                )}
              />
            </View>
         </View>

         <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
               <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Min LKR/Unit</Text>
               <Controller
                 control={control}
                 name="priceRangeMin"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     value={value?.toString()} onChangeText={v => onChange(parseInt(v, 10))}
                     keyboardType="numeric" placeholder="Min"
                     className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900"
                   />
                 )}
               />
            </View>
            <View className="flex-1">
               <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Max LKR/Unit</Text>
               <Controller
                 control={control}
                 name="priceRangeMax"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     value={value?.toString()} onChangeText={v => onChange(parseInt(v, 10))}
                     keyboardType="numeric" placeholder="Max"
                     className="bg-white border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900"
                   />
                 )}
               />
            </View>
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex-row items-center">
               <CalendarIcon size={14} color="#94A3B8" /> Fill Deadline
            </Text>
            <Controller
              control={control}
              name="deadline"
              render={({ field: { onChange, value } }) => (
                <Pressable onPress={() => setShowDeadlinePicker(true)} className="bg-white border border-slate-200 rounded-2xl px-4 py-4">
                   <Text className="font-bold text-slate-900">{value.toLocaleDateString()}</Text>
                   {showDeadlinePicker && (
                      <DateTimePicker
                        value={value} mode="date"
                        onChange={(e, d) => { setShowDeadlinePicker(false); if(d) onChange(d); }}
                      />
                   )}
                </Pressable>
              )}
            />
         </View>

         <View className="mb-8 p-6 bg-slate-900 rounded-[2.5rem]">
            <View className="flex-row justify-between items-center mb-4">
               <View className="flex-row items-center">
                  <Layers size={20} color="white" />
                  <Text className="ml-3 text-white font-black uppercase tracking-tight">Quota Splitting</Text>
               </View>
               <Controller
                 control={control}
                 name="quotaSplitEnabled"
                 render={({ field: { onChange, value } }) => (
                   <Switch 
                     value={value} onValueChange={onChange}
                     trackColor={{ false: '#334155', true: COLORS.primaryGreen }}
                   />
                 )}
               />
            </View>
            <Text className="text-white/60 text-xs font-medium leading-5">
               Enable this to allow multiple farmers to fulfill your order in batches. 
               Disable if you require the entire quantity from a single verified supplier.
            </Text>
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
                 <CheckCircle2 size={24} color="white" />
                 <Text className="text-white font-black text-lg uppercase tracking-tight">Release Demand</Text>
               </>
            )}
         </Pressable>
      </View>
    </View>
  );
}
