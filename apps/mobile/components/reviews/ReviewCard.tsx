import React from 'react';
import { View, Text } from 'react-native';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: {
    reviewerId: string;
    rating: number;
    reviewText: string;
    createdAt: string;
    reviewerName?: string; // Optional if we fetch it separately
  };
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const date = new Date(review.createdAt);
  const timeAgo = !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Recently';

  return (
    <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="font-bold text-gray-900 mb-1">
            {review.reviewerName || 'Verified User'}
          </Text>
          <StarRating rating={review.rating} size={14} readOnly />
        </View>
        <Text className="text-[11px] text-gray-400 font-medium">
          {timeAgo}
        </Text>
      </View>
      
      <Text className="text-gray-600 text-[13px] leading-5">
        {review.reviewText}
      </Text>
    </View>
  );
};
