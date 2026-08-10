import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WorkerHelpCenter() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const faqs = [
    {
      q: { en: 'How do I find jobs?', hi: 'मैं नौकरी कैसे खोजूं?' },
      a: { en: 'Browse the Jobs tab to see available opportunities. Use filters to find jobs matching your skills.', hi: 'उपलब्ध अवसरों को देखने के लिए जॉब्स टैब ब्राउज़ करें। अपने कौशल से मेल खाने वाली नौकरियां खोजने के लिए फ़िल्टर का उपयोग करें।' }
    },
    {
      q: { en: 'How do I apply for a job?', hi: 'मैं नौकरी के लिए कैसे आवेदन करूं?' },
      a: { en: 'Click on a job, review details, and tap "Apply Now" or "Quick Apply" button.', hi: 'एक नौकरी पर क्लिक करें, विवरण की समीक्षा करें और "अभी आवेदन करें" या "त्वरित आवेदन" बटन पर टैप करें।' }
    },
    {
      q: { en: 'How do I update my profile?', hi: 'मैं अपनी प्रोफ़ाइल कैसे अपडेट करूं?' },
      a: { en: 'Go to Settings > Edit Profile to update your information, skills, and photo.', hi: 'अपनी जानकारी, कौशल और फोटो अपडेट करने के लिए सेटिंग्स > प्रोफ़ाइल संपादित करें पर जाएं।' }
    },
    {
      q: { en: 'How do I track my applications?', hi: 'मैं अपने आवेदनों को कैसे ट्रैक करूं?' },
      a: { en: 'Go to Settings > My Applications to see all your job applications and their status.', hi: 'अपने सभी नौकरी आवेदन और उनकी स्थिति देखने के लिए सेटिंग्स > मेरे आवेदन पर जाएं।' }
    },
    {
      q: { en: 'How do I save jobs for later?', hi: 'मैं बाद के लिए नौकरियां कैसे सहेजूं?' },
      a: { en: 'Tap the star icon on any job card to bookmark it. View saved jobs in Settings > Saved Jobs.', hi: 'इसे बुकमार्क करने के लिए किसी भी जॉब कार्ड पर स्टार आइकन पर टैप करें। सेटिंग्स > सहेजी गई नौकरियां में सहेजी गई नौकरियां देखें।' }
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
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === 'hi' ? 'मजदूरों के लिए' : 'For Workers'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
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
            onPress={() => router.push('/worker-contact-support')}
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
  subtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
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
