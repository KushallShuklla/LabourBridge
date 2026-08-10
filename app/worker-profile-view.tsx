import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Linking, Image as RNImage } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function WorkerProfileView() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const trans = translations[language];
  const { id } = useLocalSearchParams();
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    loadWorker();
  }, [id]);

  const loadWorker = async () => {
    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) setWorker(data);
  };

  const callWorker = () => {
    if (worker?.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    }
  };

  if (!worker) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.text }]}>{trans.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{trans.back}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        {worker.photo_url ? (
          <RNImage source={{ uri: worker.photo_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <Text style={styles.avatarText}>{worker.full_name?.charAt(0) || '?'}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{worker.full_name}</Text>
        <Text style={[styles.location, { color: colors.textSecondary }]}>
          📍 {worker.city}{worker.area ? `, ${worker.area}` : ''}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'संपर्क' : 'Contact'}</Text>
        <TouchableOpacity onPress={callWorker} style={styles.contactRow}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={[styles.contactText, { color: colors.text }]}>{worker.phone}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{trans.experience}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          {worker.experience_years || 0} {language === 'hi' ? 'वर्ष' : 'years'}
        </Text>
      </View>

      {(worker.age || worker.gender || worker.availability) && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'विवरण' : 'Details'}</Text>
          {worker.age && (
            <Text style={[styles.infoText, { color: colors.text }]}>
              {t('age')}: {worker.age} {language === 'hi' ? 'वर्ष' : 'years'}
            </Text>
          )}
          {worker.gender && (
            <Text style={[styles.infoText, { color: colors.text }]}>
              {t('gender')}: {worker.gender === 'Male' ? t('male') : t('female')}
            </Text>
          )}
          {worker.availability && (
            <Text style={[styles.infoText, { color: colors.text }]}>
              {t('availability')}: {worker.availability === 'Full-time' ? t('fullTime') : worker.availability === 'Part-time' ? t('partTime') : t('contract')}
            </Text>
          )}
        </View>
      )}

      {worker.skills && worker.skills.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{trans.skills}</Text>
          <View style={styles.skillsContainer}>
            {worker.skills.map((skill: string, idx: number) => (
              <View key={idx} style={[styles.skillBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {worker.bio && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{trans.bio}</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>{worker.bio}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={callWorker} style={styles.callButton}>
          <Text style={styles.callButtonText}>📞 {trans.callWorker}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/worker-history?id=${id}`)}
          style={styles.historyButton}
        >
          <Text style={styles.historyButtonText}>{trans.workHistory}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { textAlign: 'center', marginTop: 100, fontSize: 16 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642' },
  profileCard: { margin: 20, padding: 24, borderRadius: 16, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#6B7280' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  location: { fontSize: 14 },
  section: { margin: 20, marginTop: 0, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactIcon: { fontSize: 20, marginRight: 12 },
  contactText: { fontSize: 16 },
  infoText: { fontSize: 16, lineHeight: 24 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 14, fontWeight: '500' },
  actions: { padding: 20, gap: 12 },
  callButton: { backgroundColor: '#057642', padding: 16, borderRadius: 12, alignItems: 'center' },
  callButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  historyButton: { backgroundColor: '#0A66C2', padding: 16, borderRadius: 12, alignItems: 'center' },
  historyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
