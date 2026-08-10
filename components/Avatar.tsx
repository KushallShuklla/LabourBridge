import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  imageUrl?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  status?: 'online' | 'offline' | 'busy';
  showStatus?: boolean;
}

export const Avatar = ({
  imageUrl,
  name,
  size = 'medium',
  status,
  showStatus = false,
}: AvatarProps) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32, fontSize: 14 };
      case 'medium': return { width: 48, height: 48, fontSize: 20 };
      case 'large': return { width: 64, height: 64, fontSize: 28 };
      case 'xlarge': return { width: 96, height: 96, fontSize: 40 };
      default: return { width: 48, height: 48, fontSize: 20 };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#10B981';
      case 'offline': return '#9CA3AF';
      case 'busy': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const sizeStyle = getSizeStyle();
  const initial = name?.charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.container, { width: sizeStyle.width, height: sizeStyle.height }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.image, sizeStyle]} />
      ) : (
        <View style={[styles.placeholder, sizeStyle]}>
          <Text style={[styles.initial, { fontSize: sizeStyle.fontSize }]}>
            {initial}
          </Text>
        </View>
      )}
      {showStatus && status && (
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
            size === 'small' && styles.statusSmall,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    borderRadius: 100,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: 'bold',
    color: '#6B7280',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
