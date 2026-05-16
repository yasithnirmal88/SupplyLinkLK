import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { StarRating } from './StarRating';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

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

  // ─── Slide-up animation (replaces MotiView from={{ translateY: 300 }} animate={{ translateY: 0 }})
  const translateY = useSharedValue(300);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      // Reset instantly so next open animates fresh
      translateY.value = 300;
    }
  }, [isVisible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ─── Submit handler ────────────────────────────────────────────────────────
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
      {/* NOTE: className removed from KeyboardAvoidingView — use style only */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.backdrop}>

          {/* Animated sheet — NO className here, that's what caused the crash */}
          <Animated.View style={[styles.sheet, sheetStyle]}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Rate {targetName}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Star rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>How was your experience?</Text>
              <StarRating
                rating={rating}
                onRatingChange={(r) => {
                  setRating(r);
                  setError(null);
                }}
                size={40}
              />
            </View>

            {/* Text input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Write a review (optional)</Text>
              <TextInput
                style={styles.textInput}
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
              <Text style={styles.charCount}>{reviewText.length}/500</Text>
            </View>

            {/* Validation error */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>

          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Replaces MotiView className="bg-white rounded-t-[32px] p-6 pb-10"
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 999,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingLabel: {
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    color: '#111827',
    height: 128,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorText: {
    color: '#F43F5E',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D6A4F',
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
