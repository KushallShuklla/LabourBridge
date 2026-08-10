import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, ScrollView, View, StyleSheet, Platform } from 'react-native';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function RoleSelectionScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const saveRole = async (role: string) => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem('userRole', role);
      } else {
        // Use SecureStore for mobile
        await SecureStore.setItemAsync('userRole', role);
      }
      router.push('/auth');
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role. Please try again.');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <LanguageSelector />
        <ThemeToggle />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={[styles.appName, { color: colors.text }]}>
          {t('appName')}
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {t('tagline')}
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.cardsContainer}>
        <Text style={[styles.selectText, { color: colors.text }]}>
          {t('selectRole')}
        </Text>

        {/* Worker Card */}
        <TouchableOpacity
          onPress={() => saveRole('worker')}
          style={styles.card}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.cardIcon}>👷</Text>
            <Text style={styles.cardTitle}>{t('iAmWorker')}</Text>
            <Text style={styles.cardSubtitle}>{t('workerSubtitle')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Employer Card */}
        <TouchableOpacity
          onPress={() => saveRole('employer')}
          style={styles.card}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.cardIcon}>💼</Text>
            <Text style={styles.cardTitle}>{t('iAmEmployer')}</Text>
            <Text style={styles.cardSubtitle}>{t('employerSubtitle')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
  },
  selectText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
});
