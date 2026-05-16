import React from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { ReviewCard } from './ReviewCard';

interface ReviewsListProps {
  reviews: any[];
  isLoading: boolean;
  onEndReached?: () => void;
  isFetchingMore?: boolean;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading,
  onEndReached,
  isFetchingMore,
}) => {
  if (isLoading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator color="#2D6A4F" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View className="py-10 items-center justify-center">
        <Text className="text-gray-400 font-medium">No reviews yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      renderItem={({ item }) => <ReviewCard review={item} />}
      keyExtractor={(item) => item.ratingId || Math.random().toString()}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      scrollEnabled={false} // Since it will be nested in a parent ScrollView usually
      ListFooterComponent={
        isFetchingMore ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#2D6A4F" />
          </View>
        ) : null
      }
    />
  );
};
