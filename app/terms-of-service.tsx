import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfService() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [content, setContent] = useState('');

  const defaultContent = `Terms of Service for LabourBridge

Last Updated: ${new Date().toLocaleDateString()}

1. Acceptance of Terms
By accessing and using LabourBridge, you accept and agree to be bound by these Terms of Service.

2. User Accounts
- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- You must not share your account credentials

3. User Conduct
- Use the platform for lawful purposes only
- Do not post false or misleading information
- Respect other users and maintain professional conduct

4. Job Postings
- Employers must provide accurate job descriptions
- Job postings must comply with local labor laws
- LabourBridge reserves the right to remove inappropriate postings

5. Applications
- Workers must provide truthful information in applications
- Workers are responsible for their own safety and working conditions

6. Fees and Payments
- LabourBridge may charge fees for premium features
- All fees are non-refundable unless otherwise stated

7. Limitation of Liability
LabourBridge is not responsible for disputes between employers and workers.

8. Changes to Terms
We reserve the right to modify these terms at any time.

9. Contact
For questions about these Terms, contact us at support@labourbridge.com`;

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'terms_of_service')
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
          {language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service'}
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
