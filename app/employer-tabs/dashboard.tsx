import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationBell from '@/components/NotificationBell';

export default function EmployerDashboard() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, selected: 0 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadStats();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get jobs count
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .eq('is_active', true);

    // Get job IDs first
    const { data: userJobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('created_by', user.id);

    const jobIds = userJobs?.map(j => j.id) || [];

    // Get applications count for user's jobs
    const { count: appsCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .in('job_id', jobIds);

    // Get selected count
    const { count: selectedCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Selected')
      .in('job_id', jobIds);

    setStats({
      jobs: jobsCount || 0,
      applications: appsCount || 0,
      selected: selectedCount || 0,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const menuItems = [
    { icon: '🏠', title: language === 'hi' ? 'मजदूर ब्राउज़ करें' : 'Browse Workers', route: '/employer-home', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { icon: '⭐', title: language === 'hi' ? 'सहेजे गए मजदूर' : 'Saved Workers', route: '/shortlisted-workers', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { icon: '➕', title: language === 'hi' ? 'नौकरी पोस्ट करें' : 'Post Job', route: '/post-job', color: '#0A66C2', gradient: ['#0A66C2', '#004182'] },
    { icon: '💼', title: language === 'hi' ? 'मेरी पोस्ट की गई नौकरियां' : 'My Posted Jobs', route: '/my-posted-jobs', color: '#057642', gradient: ['#057642', '#034d2a'], badge: stats.jobs },
    { icon: '📋', title: language === 'hi' ? 'आवेदन देखें' : 'View Applications', route: '/applications', color: '#7C3AED', gradient: ['#7C3AED', '#5B21B6'], badge: stats.applications },
    { icon: '👥', title: language === 'hi' ? 'प्रतिभा पूल' : 'Talent Pool', route: '/talent-pool', color: '#0891B2', gradient: ['#0891B2', '#0E7490'] },
    { icon: '📊', title: language === 'hi' ? 'विश्लेषण' : 'Analytics', route: '/employer-analytics', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { icon: '🏢', title: language === 'hi' ? 'कंपनी प्रोफ़ाइल' : 'Company Profile', route: '/employer-profile-setup', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    { icon: '🔔', title: language === 'hi' ? 'सूचनाएं' : 'Notifications', route: '/notifications', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    { icon: '⚙️', title: language === 'hi' ? 'सेटिंग्स' : 'Settings', route: '/employer-settings', color: '#6B7280', gradient: ['#6B7280', '#4B5563'] },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#057642', '#034d2a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {profile?.company_logo ? (
            <Image source={{ uri: profile.company_logo }} style={styles.companyIcon} />
          ) : (
            <View style={styles.companyIcon}>
              <Text style={styles.companyIconText}>🏭</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</Text>
            <Text style={styles.headerSubtitle}>{language === 'hi' ? 'अपनी भर्ती प्रबंधित करें' : 'Manage your hiring'}</Text>
          </View>
          <NotificationBell />
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: '#0A66C2' }]}>{stats.jobs}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{language === 'hi' ? 'सक्रिय नौकरियां' : 'Active Jobs'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: '#7C3AED' }]}>{stats.applications}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{language === 'hi' ? 'आवेदन' : 'Applications'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: '#057642' }]}>{stats.selected}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{language === 'hi' ? 'नियुक्त' : 'Hired'}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { backgroundColor: colors.background }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={item.gradient as any}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>{item.icon}</Text>
            </LinearGradient>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            {item.badge !== undefined && item.badge > 0 && (
              <View style={[styles.actionBadge, { backgroundColor: item.color }]}>
                <Text style={styles.actionBadgeText}>{item.badge}</Text>
              </View>
            )}
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={() => router.push('/employer-settings')}
        style={[styles.settingsButton, { borderColor: colors.textSecondary + '40' }]}
      >
        <Text style={[styles.settingsText, { color: colors.text }]}>{language === 'hi' ? '⚙️ सेटिंग्स' : '⚙️ Settings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={logout}
        style={[styles.logoutButton, { borderColor: colors.textSecondary + '40' }]}
      >
        <Text style={[styles.logoutText, { color: '#DC2626' }]}>{language === 'hi' ? '🚪 लॉगआउट' : '🚪 Logout'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyIconText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  actionBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionArrow: {
    fontSize: 24,
    color: '#999',
  },
  settingsButton: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});