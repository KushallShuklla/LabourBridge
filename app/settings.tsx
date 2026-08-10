import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const settingsSections = [
    {
      title: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      items: [
        { icon: '👤', label: language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile', route: '/worker-profile', color: '#0A66C2' },
        { icon: '📄', label: language === 'hi' ? 'मेरे दस्तावेज़' : 'My Documents', route: '/documents', color: '#7C3AED' },
        { icon: '📊', label: language === 'hi' ? 'मेरा विश्लेषण' : 'My Analytics', route: '/worker-analytics', color: '#059669' },
        { icon: '🕒', label: language === 'hi' ? 'नौकरी का इतिहास' : 'Job History', route: '/job-history', color: '#F59E0B' },
      ],
    },
    {
      title: language === 'hi' ? 'गतिविधि' : 'Activity',
      items: [
        { icon: '📋', label: language === 'hi' ? 'मेरे आवेदन' : 'My Applications', route: '/my-applications', color: '#7C3AED' },
        { icon: '⭐', label: language === 'hi' ? 'सहेजी गई नौकरियां' : 'Saved Jobs', route: '/bookmarked-jobs', color: '#F59E0B' },
        { icon: '🔔', label: language === 'hi' ? 'सूचनाएं' : 'Notifications', route: '/notifications', color: '#EF4444' },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0A66C2', '#004182']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</Text>
        <Text style={styles.headerSubtitle}>{language === 'hi' ? 'अपने खाते और पसंद का प्रबंधन करें' : 'Manage your account & preferences'}</Text>
      </LinearGradient>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[styles.settingItem, { backgroundColor: colors.background }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: item.color + '15' }]}>
                <Text style={styles.settingIconText}>{item.icon}</Text>
              </View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'पसंद' : 'Preferences'}</Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
          <View style={[styles.settingIcon, { backgroundColor: '#0A66C215' }]}>
            <Text style={styles.settingIconText}>🌓</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'डार्क/लाइट थीम' : 'Dark/Light Theme'}</Text>
          <ThemeToggle />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
          <View style={[styles.settingIcon, { backgroundColor: '#0A66C215' }]}>
            <Text style={styles.settingIconText}>🌐</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'भाषा' : 'Language'}</Text>
          <LanguageSelector />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'सहायता' : 'Support'}</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.background }]}
          onPress={() => router.push('/worker-help-center')}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#05966915' }]}>
            <Text style={styles.settingIconText}>❓</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.background }]}
          onPress={() => router.push('/worker-contact-support')}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#05966915' }]}>
            <Text style={styles.settingIconText}>💬</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'संपर्क सहायता' : 'Contact Support'}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.background }]}
          onPress={() => router.push('/worker-about')}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#05966915' }]}>
            <Text style={styles.settingIconText}>ℹ️</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'लेबर ब्रिज के बारे में' : 'About LabourBridge'}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'गोपनीयता' : 'Privacy'}</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.background }]}
          onPress={() => router.push('/privacy-policy')}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#05966915' }]}>
            <Text style={styles.settingIconText}>📄</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.background }]}
          onPress={() => router.push('/terms-of-service')}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#05966915' }]}>
            <Text style={styles.settingIconText}>📋</Text>
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={logout}
        style={[styles.logoutButton, { borderColor: colors.textSecondary + '40' }]}
      >
        <Text style={styles.logoutText}>{language === 'hi' ? '🚪 लॉगआउट' : '🚪 Logout'}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.2.0.3
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Bridging Work. Building Lives.
        </Text>
        <Text style={[styles.copyright, { color: colors.textSecondary }]}>
          © LabourBridge 2026
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 24,
    color: '#999',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    borderColor: '#DC2626',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
  },
});
