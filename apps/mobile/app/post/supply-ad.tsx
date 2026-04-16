import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ArrowLeft, 
  Camera, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  X,
  MapPin,
  CheckCircle2
} from 'lucide-react-native';

import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api';
import { uploadImage } from '../../services/storage';
import { COLORS } from '../../constants/Colors';

const supplyAdSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  itemName: z.string().min(3, 'Item name must be at least 3 characters').max(100),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  unit: z.enum(['kg', 'units', 'bundles', 'bags']),
  pricePerUnit: z.number().min(1, 'Price is required'),
  description: z.string().max(500).optional(),
  district: z.string().min(1, 'District is required'),
  availableFrom: z.date(),
  availableUntil: z.date().optional(),
});

type SupplyAdFormValues = z.infer<typeof supplyAdSchema>;

const CATEGORIES = [
  { label: 'Coconuts 🥥', value: 'coconuts' },
  { label: 'Vegetables 🥦', value: 'vegetables' },
  { label: 'Fruits 🍎', value: 'fruits' },
  { label: 'Rice & Grains 🌾', value: 'rice' },
  { label: 'Spices 🌶️', value: 'spices' },
];

export default function SupplyAdScreen() {
  const router = useRouter();
  const { uid, district, verificationStatus } = useAuthStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<SupplyAdFormValues>({
    resolver: zodResolver(supplyAdSchema),
    defaultValues: {
      unit: 'kg',
      district: district || '',
      availableFrom: new Date(),
    }
  });

  if (verificationStatus !== 'approved') {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-slate-50">
         <X size={48} color={COLORS.red500} />
         <Text className="text-xl font-bold mt-4 text-center">Verification Required</Text>
      </View>
    );
  }

  const handlePickPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 photos per ad.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SupplyAdFormValues) => {
    if (photos.length === 0) {
      Alert.alert('Missing Photo', 'Please attach at least one photo of your produce.');
      return;
    }

    setLoading(true);
    try {
      const adId = `ad_${Date.now()}`;
      
      // Upload photos sequentially or concurrently
      const uploadedUrls = await Promise.all(
        photos.map((uri, index) => uploadImage(uri, `supply-ads/${uid}/${adId}/${index}.jpg`))
      );

      await apiClient('/supply-ads', {
        method: 'POST',
        body: {
          ...data,
          availableFrom: data.availableFrom.toISOString(),
          availableUntil: data.availableUntil ? data.availableUntil.toISOString() : undefined,
          photoUrls: uploadedUrls,
        }
      });

      Alert.alert('Success', 'Your supply ad is now live!', [
        { text: 'View My Ads', onPress: () => router.replace('/post/my-ads') }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Submission Error', err.message || 'Failed to post ad.');
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
         <Text className="text-xl font-black text-slate-900 ml-4 uppercase tracking-tight">Post Supply Ad</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         {/* Category Picker (Simplified for UI, normally a bottom sheet) */}
         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <Pressable 
                      key={cat.value} 
                      onPress={() => onChange(cat.value)}
                      className={`px-4 py-2.5 rounded-xl border ${value === cat.value ? 'bg-primary-green border-primary-green' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`font-bold ${value === cat.value ? 'text-white' : 'text-slate-600'}`}>{cat.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            {errors.category && <Text className="text-red-500 text-xs mt-1">{errors.category.message}</Text>}
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Item Title</Text>
            <Controller
              control={control}
              name="itemName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. Fresh Organic Carrots"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-base font-bold text-slate-900 focus:border-primary-green"
                />
              )}
            />
            {errors.itemName && <Text className="text-red-500 text-xs mt-1">{errors.itemName.message}</Text>}
         </View>

         <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quantity</Text>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value?.toString()}
                    onChangeText={val => onChange(parseInt(val, 10))}
                    keyboardType="numeric"
                    placeholder="0"
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-base font-black text-slate-900"
                  />
                )}
              />
              {errors.quantity && <Text className="text-red-500 text-xs mt-1">{errors.quantity.message}</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unit</Text>
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-2 mt-1">
                     {['kg','units','bundles'].map(u => (
                        <Pressable 
                          key={u} onPress={() => onChange(u as any)}
                          className={`px-3 py-2 rounded-xl border ${value === u ? 'bg-primary-green border-primary-green' : 'bg-white border-slate-200'}`}
                        >
                           <Text className={`font-bold text-[10px] uppercase ${value === u ? 'text-white' : 'text-slate-600'}`}>{u}</Text>
                        </Pressable>
                     ))}
                  </View>
                )}
              />
            </View>
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price per unit (LKR)</Text>
            <Controller
              control={control}
              name="pricePerUnit"
              render={({ field: { onChange, value } }) => (
                <View className="relative justify-center">
                  <Text className="absolute left-4 font-black text-slate-400 z-10 text-lg">Rs.</Text>
                  <TextInput
                    value={value?.toString()}
                    onChangeText={val => onChange(parseInt(val, 10))}
                    keyboardType="numeric"
                    placeholder="0.00"
                    className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-slate-900"
                  />
                </View>
              )}
            />
            {errors.pricePerUnit && <Text className="text-red-500 text-xs mt-1">{errors.pricePerUnit.message}</Text>}
         </View>

         <View className="mb-6">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description (Optional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Additional details, grade, or storage info..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-base font-medium text-slate-700 min-h-[100px]"
                />
              )}
            />
         </View>

         {/* Photos Section */}
         <View className="mb-8">
            <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex-row items-center">
               Produce Photos <Text className="text-slate-300">({photos.length}/5)</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
               <Pressable 
                 onPress={handlePickPhoto}
                 className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-2xl items-center justify-center mr-3 active:bg-slate-50"
               >
                  <Camera size={24} color="#94A3B8" />
                  <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Add Photo</Text>
               </Pressable>

               {photos.map((uri, idx) => (
                  <View key={idx} className="w-24 h-24 rounded-2xl bg-slate-100 mr-3 overflow-hidden relative border border-slate-200 shadow-sm">
                     <Image source={{ uri }} className="w-full h-full" />
                     <Pressable 
                       onPress={() => removePhoto(idx)}
                       className="absolute top-1 right-1 bg-black/50 p-1 rounded-full"
                     >
                        <X size={12} color="white" />
                     </Pressable>
                  </View>
               ))}
            </ScrollView>
         </View>

         {/* Location & Dates */}
         <View className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm mb-10 gap-5">
            <View>
               <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex-row items-center">
                  <MapPin size={12} color="#94A3B8" /> Harvest District
               </Text>
               <Controller
                 control={control}
                 name="district"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     value={value}
                     onChangeText={onChange}
                     className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800"
                   />
                 )}
               />
            </View>

            <View className="flex-row gap-4">
               <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex-row items-center">
                     <CalendarIcon size={12} color="#94A3B8" /> Available From
                  </Text>
                  <Controller
                    control={control}
                    name="availableFrom"
                    render={({ field: { onChange, value } }) => (
                      <Pressable 
                         onPress={() => setShowFromPicker(true)}
                         className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      >
                         <Text className="text-sm font-bold text-slate-800">{value.toLocaleDateString()}</Text>
                         {showFromPicker && (
                            <DateTimePicker
                               value={value}
                               mode="date"
                               onChange={(event, date) => {
                                 setShowFromPicker(false);
                                 if (date) onChange(date);
                               }}
                            />
                         )}
                      </Pressable>
                    )}
                  />
               </View>

               <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex-row items-center">
                     <CalendarIcon size={12} color="#94A3B8" /> Until (Optional)
                  </Text>
                  <Controller
                    control={control}
                    name="availableUntil"
                    render={({ field: { onChange, value } }) => (
                      <Pressable 
                         onPress={() => setShowUntilPicker(true)}
                         className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                      >
                         <Text className={`text-sm font-bold ${value ? 'text-slate-800' : 'text-slate-400'}`}>
                           {value ? value.toLocaleDateString() : 'Select Date'}
                         </Text>
                         {showUntilPicker && (
                            <DateTimePicker
                               value={value || new Date()}
                               mode="date"
                               onChange={(event, date) => {
                                 setShowUntilPicker(false);
                                 if (date) onChange(date);
                               }}
                            />
                         )}
                      </Pressable>
                    )}
                  />
               </View>
            </View>
         </View>
         
         <View className="h-20" />
      </ScrollView>

      {/* Floating Submit Button */}
      <View className="absolute bottom-6 left-6 right-6">
         <Pressable 
           onPress={handleSubmit(onSubmit)}
           disabled={loading}
           className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-xl ${loading ? 'bg-slate-400 shadow-slate-900/10' : 'bg-primary-green shadow-emerald-900/40'}`}
         >
            {loading ? (
               <ActivityIndicator color="white" />
            ) : (
               <>
                 <CheckCircle2 size={24} color="white" />
                 <Text className="text-white font-black text-lg uppercase tracking-tight">Publish Ad</Text>
               </>
            )}
         </Pressable>
      </View>
    </View>
  );
}
