import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import Logo from '@/components/Logo';
import { supabase } from '@/services/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const role = Platform.OS === 'web' 
          ? localStorage.getItem('userRole')
          : await SecureStore.getItemAsync('userRole');
        
        if (role === 'worker') {
          router.replace('/worker-tabs');
        } else if (role === 'employer') {
          router.replace('/employer-tabs');
        } else {
          router.replace('/auth');
        }
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/auth');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Logo size="xlarge" />
        <Text style={styles.title}>LabourBridge</Text>
        <Text style={styles.subtitle}>Connecting Workers & Employers</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
