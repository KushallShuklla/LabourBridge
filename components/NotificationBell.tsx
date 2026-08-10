import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationBell() {
  const { notification } = useNotifications();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/notifications')}
    >
      <Text style={styles.icon}>🔔</Text>
      {notification && (
        <View style={styles.badge} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
});
