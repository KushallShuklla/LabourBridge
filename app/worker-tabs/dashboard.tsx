import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardTab() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ applications: 0, bookmarks: 0, notifications: 0 });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadStats();
    }, [])
  );

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(data);
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [apps, bookmarks, notifs] = await Promise.all([
      supabase.from('applications').select('id', { count: 'exact' }).eq('worker_id', user.id),
      supabase.from('bookmarks').select('id', { count: 'exact' }).eq('worker_id', user.id),
      supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', user.id).eq('read', false),
    ]);

    setStats({
      applications: apps.count || 0,
      bookmarks: bookmarks.count || 0,
      notifications: notifs.count || 0,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const menuItems = [
    { icon: '💼', title: t('viewJobs'), route: '/jobs', color: '#057642' },
    { icon: '📋', title: t('myApplications'), route: '/my-applications', color: '#7C3AED', badge: stats.applications },
    { icon: '⭐', title: t('bookmarkedJobs'), route: '/bookmarked-jobs', color: '#F59E0B', badge: stats.bookmarks },
    { icon: '📄', title: t('myDocuments'), route: '/documents', color: '#DC2626' },
    { icon: '📊', title: t('myAnalytics'), route: '/worker-analytics', color: '#059669' },
    { icon: '🕒', title: t('jobHistory'), route: '/job-history', color: '#8B5CF6' },
    { icon: '⚙️', title: t('settings'), route: '/settings', color: '#6B7280' },
    { icon: '🔔', title: t('notifications'), route: '/notifications', color: '#EF4444', badge: stats.notifications },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0A66C2', '#004182']}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          {profile?.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || t('completeProfile')}</Text>
            <Text style={styles.profileDetails}>
              {profile?.city || t('addLocation')} • {profile?.experience_years || 0} {t('yearsExp')}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/worker-profile')}
        >
          <Text style={styles.editButtonText}>{t('editProfile')}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.applications}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('applications')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.bookmarks}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('savedJobs')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.notifications}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('alerts')}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { backgroundColor: colors.background }]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <Text style={[styles.menuTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.badge !== undefined && item.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={logout}
        style={[styles.logoutButton, { borderColor: colors.textSecondary + '40' }]}
      >
        <Text style={[styles.logoutText, { color: '#DC2626' }]}>🚪 {t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#0A66C2' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  profileDetails: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  editButton: { backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start' },
  editButtonText: { color: '#0A66C2', fontWeight: '600', fontSize: 14 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
  statNumber: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  menuContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 12 },
  menuCard: { width: '47%', padding: 16, borderRadius: 12, elevation: 2, position: 'relative' },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuIconText: { fontSize: 24 },
  menuTitle: { fontSize: 14, fontWeight: '600' },
  badge: { position: 'absolute', top: 12, right: 12, minWidth: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  logoutButton: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '600' },
});
