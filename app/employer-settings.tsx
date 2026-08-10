import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Switch, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EmployerSettings() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    applicationAlerts: true,
    profileVisibility: true,
  });

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    if (data?.settings) {
      setSettings({ ...settings, ...data.settings });
    }
  };

  const saveSettings = async (newSettings: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('id', user.id);
  };

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Delete user data
            await supabase.from('employer_profiles').delete().eq('user_id', user.id);
            await supabase.from('jobs').delete().eq('created_by', user.id);
            await supabase.auth.signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'खाता' : 'Account'}</Text>
        
        <TouchableOpacity
          onPress={() => router.push('/employer-profile-setup')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>👤</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📧</Text>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'ईमेल' : 'Email'}</Text>
              <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'सूचनाएं' : 'Notifications'}</Text>
        
        <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'पुश सूचनाएं' : 'Push Notifications'}</Text>
              <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'तुरंत अलर्ट प्राप्त करें' : 'Get instant alerts'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={(val) => updateSetting('pushNotifications', val)}
            trackColor={{ false: '#D1D5DB', true: '#057642' }}
            thumbColor="white"
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📋</Text>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'आवेदन अलर्ट' : 'Application Alerts'}</Text>
              <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'नए आवेदन की सूचनाएं' : 'New application notifications'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.applicationAlerts}
            onValueChange={(val) => updateSetting('applicationAlerts', val)}
            trackColor={{ false: '#D1D5DB', true: '#057642' }}
            thumbColor="white"
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'गोपनीयता' : 'Privacy'}</Text>
        
        <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>👁️</Text>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'प्रोफ़ाइल दृश्यता' : 'Profile Visibility'}</Text>
              <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'मजदूरों को प्रोफ़ाइल दिखाएं' : 'Show profile to workers'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.profileVisibility}
            onValueChange={(val) => updateSetting('profileVisibility', val)}
            trackColor={{ false: '#D1D5DB', true: '#057642' }}
            thumbColor="white"
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/privacy-policy')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📄</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/terms-of-service')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📋</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'पसंद' : 'Preferences'}</Text>
        
        <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'डार्क मोड' : 'Dark Mode'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D5DB', true: '#057642' }}
            thumbColor="white"
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            const newLang = language === 'en' ? 'hi' : 'en';
            setLanguage(newLang);
            Alert.alert('Language Changed', `Language set to ${newLang === 'en' ? 'English' : 'हिंदी'}. Navigate to other pages to see changes.`);
          }}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌐</Text>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'भाषा' : 'Language'}</Text>
              <Text style={[styles.settingSubtext, { color: colors.textSecondary }]}>
                {language === 'en' ? 'English' : 'हिंदी'}
              </Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'सहायता' : 'Support'}</Text>
        
        <TouchableOpacity
          onPress={() => router.push('/help-center')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>❓</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/contact-support')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>💬</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'संपर्क सहायता' : 'Contact Support'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/about')}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <Text style={[styles.settingText, { color: colors.text }]}>{language === 'hi' ? 'लेबर ब्रिज के बारे में' : 'About LabourBridge'}</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#DC3545' }]}>{language === 'hi' ? 'खतरे का क्षेत्र' : 'Danger Zone'}</Text>
        
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.settingRow, { backgroundColor: colors.card }]}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🚪</Text>
            <Text style={[styles.settingText, { color: '#DC3545' }]}>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</Text>
          </View>
          <Text style={[styles.settingArrow, { color: '#DC3545' }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Version 1.2.0.3
        </Text>
        <Text style={[styles.footerTagline, { color: colors.textSecondary }]}>
          Bridging Work. Building Lives.
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          © LabourBridge 2026
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 24, marginRight: 12, width: 32 },
  settingText: { fontSize: 16, fontWeight: '500' },
  settingSubtext: { fontSize: 13, marginTop: 2 },
  settingArrow: { fontSize: 24, color: '#9CA3AF' },
  footer: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  footerText: { fontSize: 12, marginBottom: 4 },
  footerTagline: { fontSize: 11, fontStyle: 'italic', marginBottom: 4 },
});
