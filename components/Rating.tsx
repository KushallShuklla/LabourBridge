import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useState } from 'react';

interface RatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export const Rating = ({ rating, onRatingChange, size = 24, readonly = false }: RatingProps) => {
  const [currentRating, setCurrentRating] = useState(rating);

  const handlePress = (value: number) => {
    if (readonly) return;
    setCurrentRating(value);
    onRatingChange?.(value);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handlePress(star)}
          disabled={readonly}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= currentRating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    color: '#F59E0B',
  },
});
