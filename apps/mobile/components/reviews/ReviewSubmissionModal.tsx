import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { X } from 'lucide-react-native';
import { StarRating } from './StarRating';
import { MotiView, AnimatePresence } from 'moti';

interface ReviewSubmissionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => Promise<void>;
  targetName: string;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  targetName,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 5) {
      setError('Review must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating, reviewText);
      setRating(0);
      setReviewText('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <MotiView
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            className="bg-white rounded-t-[32px] p-6 pb-10"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Rate {targetName}</Text>
              <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
              <Text className="text-gray-500 mb-4 font-medium">How was your experience?</Text>
              <StarRating 
                rating={rating} 
                onRatingChange={(r) => {
                  setRating(r);
                  setError(null);
                }} 
                size={40} 
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-700 mb-2">Write a review (optional)</Text>
              <TextInput
                className="bg-gray-50 rounded-2xl p-4 text-gray-900 h-32 border border-gray-100"
                placeholder="Share your thoughts about the service, quality, and delivery..."
                multiline
                textAlignVertical="top"
                value={reviewText}
                onChangeText={(t) => {
                  setReviewText(t);
                  setError(null);
                }}
                maxLength={500}
              />
              <Text className="text-right text-[10px] text-gray-400 mt-1">
                {reviewText.length}/500
              </Text>
            </View>

            {error && (
              <Text className="text-rose-500 text-center text-sm font-bold mb-4">
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`py-4 rounded-2xl flex-row justify-center items-center ${isSubmitting ? 'bg-gray-300' : 'bg-[#2D6A4F]'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Submit Review</Text>
              )}
            </TouchableOpacity>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
