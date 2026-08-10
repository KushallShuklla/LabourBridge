import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function ShortlistedWorkers() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    loadShortlistedWorkers();
  }, []);

  const loadShortlistedWorkers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('employer_shortlist')
      .select('*, worker_profiles(*)')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setWorkers(data);
  };

  const removeFromShortlist = async (id: string) => {
    await supabase.from('employer_shortlist').delete().eq('id', id);
    loadShortlistedWorkers();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t.savedWorkers}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {workers.length > 0 ? (
          workers.map((item) => (
            <View key={item.id} style={[styles.workerCard, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                onPress={() => router.push(`/worker-profile-view?id=${item.worker_profiles.id}`)}
                style={styles.workerInfo}
              >
                {item.worker_profiles.photo_url ? (
                  <Image source={{ uri: item.worker_profiles.photo_url }} style={styles.photo} />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.border }]}>
                    <Text style={styles.photoText}>{item.worker_profiles.full_name?.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.details}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.worker_profiles.full_name}</Text>
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    📍 {item.worker_profiles.city}
                  </Text>
                  <View style={styles.skills}>
                    {item.worker_profiles.skills?.slice(0, 3).map((skill: string, idx: number) => (
                      <View key={idx} style={[styles.skillBadge, { backgroundColor: colors.background }]}>
                        <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeFromShortlist(item.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>{t.remove}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.noSavedWorkers}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  workerCard: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  workerInfo: { flex: 1, flexDirection: 'row' },
  photo: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  photoPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  photoText: { fontSize: 24, fontWeight: 'bold', color: '#6B7280' },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  location: { fontSize: 13, marginBottom: 8 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 11, fontWeight: '500' },
  removeButton: { justifyContent: 'center', paddingHorizontal: 12 },
  removeText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
