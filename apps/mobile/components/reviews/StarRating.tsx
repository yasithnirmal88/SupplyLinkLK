import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  onRatingChange,
  readOnly = false,
}) => {
  return (
    <View className="flex-row">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <TouchableOpacity
            key={index}
            disabled={readOnly}
            onPress={() => onRatingChange && onRatingChange(starValue)}
            className="mr-1"
          >
            <Star
              size={size}
              color={isFilled ? '#F4A261' : '#D1D5DB'}
              fill={isFilled ? '#F4A261' : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
