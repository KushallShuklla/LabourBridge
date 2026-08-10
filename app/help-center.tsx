import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelpCenter() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const faqs = [
    {
      q: { en: 'How do I post a job?', hi: 'मैं नौकरी कैसे पोस्ट करूं?' },
      a: { en: 'Go to the Post Job tab, fill in the job details, and click Post Job.', hi: 'पोस्ट जॉब टैब पर जाएं, नौकरी का विवरण भरें और पोस्ट जॉब पर क्लिक करें।' }
    },
    {
      q: { en: 'How do I view applications?', hi: 'मैं आवेदन कैसे देखूं?' },
      a: { en: 'Go to My Posted Jobs, select a job, and view all applications.', hi: 'माई पोस्टेड जॉब्स पर जाएं, एक नौकरी चुनें और सभी आवेदन देखें।' }
    },
    {
      q: { en: 'How do I contact a worker?', hi: 'मैं एक मजदूर से कैसे संपर्क करूं?' },
      a: { en: 'View the application and use the contact details provided.', hi: 'आवेदन देखें और दिए गए संपर्क विवरण का उपयोग करें।' }
    },
    {
      q: { en: 'Can I edit my posted jobs?', hi: 'क्या मैं अपनी पोस्ट की गई नौकरियों को संपादित कर सकता हूं?' },
      a: { en: 'Currently, you need to delete and repost to make changes.', hi: 'वर्तमान में, परिवर्तन करने के लिए आपको हटाना और फिर से पोस्ट करना होगा।' }
    },
    {
      q: { en: 'How do I change my company profile?', hi: 'मैं अपनी कंपनी प्रोफ़ाइल कैसे बदलूं?' },
      a: { en: 'Go to Settings > Edit Profile to update your company information.', hi: 'अपनी कंपनी की जानकारी अपडेट करने के लिए सेटिंग्स > प्रोफ़ाइल संपादित करें पर जाएं।' }
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
        </Text>

        {faqs.map((faq, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.question, { color: colors.text }]}>
              {faq.q[language]}
            </Text>
            <Text style={[styles.answer, { color: colors.textSecondary }]}>
              {faq.a[language]}
            </Text>
          </View>
        ))}

        <View style={[styles.contactCard, { backgroundColor: '#E8F4F8' }]}>
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={styles.contactTitle}>
            {language === 'hi' ? 'अभी भी मदद चाहिए?' : 'Still need help?'}
          </Text>
          <Text style={styles.contactText}>
            {language === 'hi' ? 'हमारी सहायता टीम से संपर्क करें' : 'Contact our support team'}
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/contact-support')}
          >
            <Text style={styles.contactButtonText}>
              {language === 'hi' ? 'संपर्क सहायता' : 'Contact Support'}
            </Text>
          </TouchableOpacity>
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
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  faqCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  question: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  answer: { fontSize: 14, lineHeight: 20 },
  contactCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  contactIcon: { fontSize: 48, marginBottom: 12 },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A66C2', marginBottom: 8 },
  contactText: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  contactButton: { backgroundColor: '#0A66C2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  contactButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
