import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  count: number;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  size?: 'small' | 'medium' | 'large';
}

export const Badge = ({ count, variant = 'primary', size = 'medium' }: BadgeProps) => {
  if (count === 0) return null;

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return styles.primary;
      case 'danger': return styles.danger;
      case 'warning': return styles.warning;
      case 'success': return styles.success;
      default: return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'medium': return styles.medium;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  return (
    <View style={[styles.badge, getVariantStyle(), getSizeStyle()]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  small: {
    minWidth: 18,
    height: 18,
  },
  medium: {
    minWidth: 24,
    height: 24,
  },
  large: {
    minWidth: 30,
    height: 30,
  },
  primary: {
    backgroundColor: '#057642',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  warning: {
    backgroundColor: '#F59E0B',
  },
  success: {
    backgroundColor: '#10B981',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
