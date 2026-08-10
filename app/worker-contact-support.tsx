import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WorkerContactSupport() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject || !message) {
      Alert.alert(
        language === 'hi' ? 'त्रुटि' : 'Error',
        language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields'
      );
      return;
    }

    Alert.alert(
      language === 'hi' ? 'सफलता' : 'Success',
      language === 'hi' ? 'आपका संदेश भेज दिया गया है। हम जल्द ही संपर्क करेंगे।' : 'Your message has been sent. We will contact you soon.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'hi' ? 'संपर्क सहायता' : 'Contact Support'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === 'hi' ? 'मजदूर सहायता' : 'Worker Support'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={styles.infoIcon}>📧</Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>worker-support@labourbridge.com</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={styles.infoIcon}>📞</Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>+91 1800-WORKER-HELP</Text>
        </View>

        <Text style={[styles.formTitle, { color: colors.text }]}>
          {language === 'hi' ? 'हमें संदेश भेजें' : 'Send us a message'}
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>
          {language === 'hi' ? 'विषय' : 'Subject'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder={language === 'hi' ? 'विषय दर्ज करें' : 'Enter subject'}
          placeholderTextColor={colors.textSecondary}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          {language === 'hi' ? 'संदेश' : 'Message'}
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          placeholder={language === 'hi' ? 'अपना संदेश लिखें' : 'Write your message'}
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {language === 'hi' ? 'संदेश भेजें' : 'Send Message'}
          </Text>
        </TouchableOpacity>
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
  infoCard: { padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  infoIcon: { fontSize: 32, marginBottom: 8 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  textArea: { padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 14, height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#0A66C2', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
