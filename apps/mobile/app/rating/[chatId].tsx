import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, CheckCircle2, X } from 'lucide-react-native';
import { COLORS } from '../../constants/Colors';
import { apiClient } from '../../services/api';

export default function RatingScreen() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [tradeAgain, setTradeAgain] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient('/reviews', {
        method: 'POST',
        body: {
          chatId,
          rating,
          reviewText: review,
          wouldTradeAgain: tradeAgain
        }
      });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
       <View className="items-center mb-8">
          <View className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] items-center justify-center mb-6">
             <Star size={40} color={COLORS.primaryGreen} fill={COLORS.primaryGreen} />
          </View>
          <Text className="text-3xl font-black text-slate-900 text-center uppercase tracking-tight">Rate the Trade</Text>
          <Text className="text-slate-500 text-center mt-3 font-medium px-4">
             How was your experience with the counterparty? Your feedback helps keep SupplyLink safe.
          </Text>
       </View>

       <View className="flex-row justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
             <Pressable key={star} onPress={() => setRating(star)}>
                <Star 
                  size={48} 
                  color={star <= rating ? '#FBBF24' : '#E2E8F0'} 
                  fill={star <= rating ? '#FBBF24' : 'transparent'} 
                />
             </Pressable>
          ))}
       </View>

       <View className="mb-8">
          <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Write a Review (Optional)</Text>
          <TextInput
             multiline
             numberOfLines={4}
             placeholder="How was the quality? Was the delivery on time?"
             className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-base font-medium text-slate-800 min-h-[120px]"
             value={review}
             onChangeText={setReview}
             maxLength={300}
          />
       </View>

       <View className="mb-12">
          <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Would you trade with them again?</Text>
          <View className="flex-row gap-4">
             <Pressable 
                onPress={() => setTradeAgain(true)}
                className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${tradeAgain === true ? 'bg-primary-green border-primary-green' : 'bg-white border-slate-200'}`}
             >
                <CheckCircle2 size={18} color={tradeAgain === true ? 'white' : '#94A3B8'} />
                <Text className={`ml-2 font-bold ${tradeAgain === true ? 'text-white' : 'text-slate-500'}`}>Yes</Text>
             </Pressable>
             <Pressable 
                onPress={() => setTradeAgain(false)}
                className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${tradeAgain === false ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-200'}`}
             >
                <X size={18} color={tradeAgain === false ? 'white' : '#94A3B8'} />
                <Text className={`ml-2 font-bold ${tradeAgain === false ? 'text-white' : 'text-slate-500'}`}>No</Text>
             </Pressable>
          </View>
       </View>

       <Pressable 
          onPress={handleSubmit}
          disabled={submitting}
          className={`py-4 rounded-2xl items-center shadow-xl ${submitting ? 'bg-slate-400' : 'bg-slate-900 shadow-slate-900/20'}`}
       >
          {submitting ? <ActivityIndicator color="white" /> : (
            <Text className="text-white font-black uppercase text-lg tracking-tight">Submit Feedback</Text>
          )}
       </Pressable>
    </ScrollView>
  );
}
