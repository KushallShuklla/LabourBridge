import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
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
            {language === 'hi' ? 'मजदूरों और नियोक्ताओं को जोड़ना' : 'Connecting Workers and Employers'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'हमारा मिशन' : 'Our Mission'}
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {language === 'hi' 
              ? 'LabourBridge का उद्देश्य मजदूरों और नियोक्ताओं के बीच की खाई को पाटना है। हम एक ऐसा मंच प्रदान करते हैं जहां मजदूर आसानी से काम पा सकें और नियोक्ता कुशल श्रमिकों को ढूंढ सकें।'
              : 'LabourBridge aims to bridge the gap between workers and employers. We provide a platform where workers can easily find work and employers can find skilled laborers.'}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
          </Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'आसान नौकरी पोस्टिंग' : 'Easy job posting'}
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
                {language === 'hi' ? 'सुरक्षित और विश्वसनीय' : 'Safe and reliable'}
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'द्विभाषी समर्थन' : 'Bilingual support'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'संपर्क करें' : 'Contact Us'}
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            📧 support@labourbridge.com
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            📞 +91 1800-XXX-XXXX
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            🌐 www.labourbridge.com
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.copyright, { color: colors.textSecondary }]}>© 2024 LabourBridge</Text>
          <Text style={[styles.rights, { color: colors.textSecondary }]}>All rights reserved</Text>
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
  copyright: { fontSize: 12, marginBottom: 4 },
  rights: { fontSize: 12 },
});
