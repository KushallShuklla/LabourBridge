import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [content, setContent] = useState('');

  const defaultContent = `Privacy Policy for LabourBridge

Last Updated: ${new Date().toLocaleDateString()}

1. Information We Collect
We collect information you provide directly to us, including name, email, phone number, and profile information.

2. How We Use Your Information
- To provide and maintain our services
- To notify you about changes to our service
- To provide customer support
- To gather analysis or valuable information to improve our service

3. Data Security
We implement appropriate security measures to protect your personal information.

4. Your Rights
You have the right to access, update, or delete your personal information at any time.

5. Contact Us
If you have questions about this Privacy Policy, please contact us at support@labourbridge.com`;

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'privacy_policy')
      .single();

    setContent(data?.value || defaultContent);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>{content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  content: { padding: 20 },
  text: { fontSize: 14, lineHeight: 24 },
});
