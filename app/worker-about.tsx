import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WorkerAbout() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'hi' ? 'लेबर ब्रिज के बारे में' : 'About LabourBridge'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🌉</Text>
          <Text style={[styles.appName, { color: colors.text }]}>LabourBridge</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {language === 'hi' ? 'मजदूरों को सशक्त बनाना' : 'Empowering Workers'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'मजदूरों के लिए' : 'For Workers'}
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {language === 'hi' 
              ? 'LabourBridge आपको अच्छे रोजगार के अवसर खोजने में मदद करता है। हम आपके कौशल को नियोक्ताओं से जोड़ते हैं जो आपकी प्रतिभा की तलाश में हैं।'
              : 'LabourBridge helps you find good employment opportunities. We connect your skills with employers looking for your talent.'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'आपके लाभ' : 'Your Benefits'}
          </Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'मुफ्त नौकरी खोज' : 'Free job search'}
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'त्वरित आवेदन प्रक्रिया' : 'Quick application process'}
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'सत्यापित नियोक्ता' : 'Verified employers'}
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'हिंदी और अंग्रेजी समर्थन' : 'Hindi and English support'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            📧 worker-support@labourbridge.com
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            📞 +91 1800-WORKER-HELP
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            🌐 www.labourbridge.com/workers
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.2.0.3</Text>
          <Text style={[styles.footerTagline, { color: colors.textSecondary }]}>Bridging Work. Building Lives.</Text>
          <Text style={[styles.copyright, { color: colors.textSecondary }]}>© LabourBridge 2026</Text>
        </View>
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
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  tagline: { fontSize: 14 },
  section: { padding: 20, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sectionText: { fontSize: 14, lineHeight: 22 },
  featureList: { gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { fontSize: 16, color: '#057642', marginRight: 12, fontWeight: 'bold' },
  featureText: { fontSize: 14, flex: 1 },
  contactText: { fontSize: 14, marginBottom: 8 },
  footer: { alignItems: 'center', marginTop: 32, paddingBottom: 32 },
  version: { fontSize: 12, marginBottom: 4 },
  footerTagline: { fontSize: 11, fontStyle: 'italic', marginBottom: 4 },
  copyright: { fontSize: 12 },
});
