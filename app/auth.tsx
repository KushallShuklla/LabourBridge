import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';

const getRole = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userRole');
  }
  return await SecureStore.getItemAsync('userRole');
};

export default function AuthScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'worker' | 'employer' | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // SIGN UP FUNCTION
  const signUp = async () => {
    try {
      console.log('Starting signup...');
      console.log('Email:', email);
      
      // Store role
      if (Platform.OS === 'web') {
        localStorage.setItem('userRole', role);
      } else {
        await SecureStore.setItemAsync('userRole', role);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Auth signup response:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('Auth error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        if (!error.message && !error.status) {
          alert('Network error. Please check your internet connection and try again.');
          return;
        }
        
        if (error.message?.includes('already registered')) {
          alert('This email is already registered. Please use a different email or sign in.');
        } else if (error.status === 429) {
          alert('Too many attempts. Please wait a few minutes and try again.');
        } else {
          alert(`Auth Error: ${error.message || 'Unknown error occurred'}`);
        }
        return;
      }

      const savedRole = await getRole();
      console.log('Role:', savedRole);
      console.log('User ID:', data.user?.id);

      if (data.user && savedRole) {
        console.log('Inserting profile...');
        const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          role: role,
        });

        console.log('Profile insert response:', { profileData, profileError });

        if (profileError) {
          console.error('Profile error details:', JSON.stringify(profileError, null, 2));
          if (profileError.code === '23505') {
            alert('This email is already registered with a different role. Please use a different email.');
          } else {
            alert(`Profile Error: ${profileError.message}`);
          }
          return;
        }
      }

      if (data.user && !data.session) {
        alert('Signup successful! Please check your email to verify your account before logging in.');
        setIsLogin(true);
        return;
      }

      console.log('Signup successful!');
      alert('Signup successful. Please login.');
      setIsLogin(true);
    } catch (err: any) {
      console.error('Catch error:', err);
      alert(`Signup Error:\nMessage: ${err?.message || 'Unknown'}\nStack: ${err?.stack || 'N/A'}`);
    }
  };

  // SIGN IN FUNCTION
  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message?.includes('Email not confirmed')) {
        alert('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        alert(error.message);
      }
      return;
    }

    if (role === 'worker') {
      router.replace('/worker-tabs');
    } else if (role === 'employer') {
      router.replace('/employer-tabs');
    }
  };

  if (!showAuth) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Logo size="large" style={{ marginBottom: 20 }} />
            <Text style={[styles.title, { color: colors.text }]}>{t('selectRole')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose how you want to use LabourBridge</Text>
          </View>
          <View style={styles.roleSelectionContainer}>
            <TouchableOpacity
              onPress={() => {
                setRole('worker');
                setShowAuth(true);
              }}
              style={[styles.largeRoleButton, { backgroundColor: '#28A745' }]}
            >
              <Text style={styles.largeRoleText}>{t('iAmWorker')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRole('employer');
                setShowAuth(true);
              }}
              style={[styles.largeRoleButton, { backgroundColor: '#007BFF' }]}
            >
              <Text style={styles.largeRoleText}>{t('iAmEmployer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => setShowAuth(false)}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Logo size="large" style={{ marginBottom: 20 }} />
          <Text style={[styles.title, { color: colors.text }]}>
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin ? t('signInToContinue') : t('signUpToStart')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('email')}</Text>
            <TextInput
              placeholder={t('enterEmail')}
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.textSecondary + '40'
              }]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('password')}</Text>
            <TextInput
              placeholder={t('enterPassword')}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.textSecondary + '40'
              }]}
            />
          </View>



          {/* Action Button */}
          <TouchableOpacity
            onPress={isLogin ? signIn : signUp}
            style={styles.button}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {isLogin ? t('signIn') : t('signUp')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Toggle */}
          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            style={styles.toggleContainer}
          >
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              <Text style={[styles.toggleLink, { color: '#667eea' }]}>
                {isLogin ? t('signUp') : t('signIn')}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontWeight: 'bold',
  },
  roleSelectionContainer: {
    gap: 16,
  },
  largeRoleButton: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  largeRoleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
  },
});