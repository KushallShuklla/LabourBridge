import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Image, Linking, FlatList, Alert, Animated } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function EmployerHome() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [workers, setWorkers] = useState<any[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadWorkers();
    loadEmployerProfile();
    loadShortlist();
    loadRecentActivity();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workers, search]);

  const loadShortlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('employer_shortlist')
      .select('worker_id')
      .eq('employer_id', user.id);

    if (data) {
      setShortlistedIds(new Set(data.map(item => item.worker_id)));
    }
  };

  const loadRecentActivity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('created_by', user.id);

    if (!jobs || jobs.length === 0) return;

    const jobIds = jobs.map(j => j.id);

    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!applications) return;

    // Fetch worker profiles separately
    const workerIds = applications.map(a => a.worker_id);
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select('id, full_name')
      .in('id', workerIds);

    // Merge data
    const activity = applications.map(app => ({
      ...app,
      worker_profiles: workers?.find(w => w.id === app.worker_id),
      jobs: jobs.find(j => j.id === app.job_id)
    }));

    setRecentActivity(activity);
  };

  const toggleShortlist = async (workerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isShortlisted = shortlistedIds.has(workerId);

    if (isShortlisted) {
      await supabase
        .from('employer_shortlist')
        .delete()
        .eq('employer_id', user.id)
        .eq('worker_id', workerId);
      
      const newSet = new Set(shortlistedIds);
      newSet.delete(workerId);
      setShortlistedIds(newSet);
      Alert.alert(t.success, t.removedFromShortlist);
    } else {
      await supabase
        .from('employer_shortlist')
        .insert({ employer_id: user.id, worker_id: workerId });
      
      setShortlistedIds(new Set([...shortlistedIds, workerId]));
      Alert.alert(t.success, t.addedToShortlist);
    }
  };

  const loadEmployerProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('employer_profiles')
      .select('company_name, company_logo')
      .eq('user_id', user.id)
      .single();

    console.log('Employer Profile Data:', data);
    if (data) setEmployerProfile(data);
  };

  const loadWorkers = async () => {
    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // For now, set workers without ratings since table doesn't exist
      const workersWithRatings = data.map(worker => ({
        ...worker,
        user_id: worker.id,
        avgRating: 0,
        totalRatings: 0,
      }));
      setWorkers(workersWithRatings);
    }
  };

  const applyFilters = () => {
    let filtered = [...workers];

    if (search) {
      filtered = filtered.filter(w =>
        w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.city?.toLowerCase().includes(search.toLowerCase()) ||
        w.area?.toLowerCase().includes(search.toLowerCase()) ||
        w.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredWorkers(filtered);
  };

  const callWorker = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const clearSearch = () => {
    setSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t.findSkilledLabour}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {filteredWorkers.length} {language === 'hi' ? 'मजदूर उपलब्ध' : 'workers available'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowActivity(!showActivity)}
              style={styles.activityButton}
            >
              <Text style={styles.activityIcon}>🔔</Text>
              {recentActivity.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{recentActivity.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              {employerProfile?.company_logo ? (
                <Image source={{ uri: employerProfile.company_logo }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.menuIcon}>
                  <Text style={styles.menuText}>🏢</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={language === 'hi' ? 'नाम, कौशल, शहर या क्षेत्र से खोजें...' : 'Search by name, skills, city or area...'}
            placeholderTextColor={colors.textSecondary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Link to Advanced Filters */}
        <TouchableOpacity 
          onPress={() => router.push('/talent-pool')}
          style={styles.advancedFilterButton}
        >
          <Text style={styles.advancedFilterText}>
            🔍 {language === 'hi' ? 'उन्नत फ़िल्टर के लिए प्रतिभा पूल पर जाएं' : 'Go to Talent Pool for advanced filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Panel */}
      {showActivity && (
        <View style={[styles.activityPanel, { backgroundColor: colors.card }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>{t.recentActivity}</Text>
            <TouchableOpacity onPress={() => setShowActivity(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.length > 0 ? (
            <ScrollView style={styles.activityList}>
              {recentActivity.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.activityItem}
                  onPress={() => {
                    setShowActivity(false);
                    router.push('/applications');
                  }}
                >
                  <Text style={styles.activityIcon}>📋</Text>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityText, { color: colors.text }]}>
                      {item.worker_profiles?.full_name}
                    </Text>
                    <Text style={[styles.activitySubtext, { color: colors.textSecondary }]}>
                      {t.newApplication} • {item.jobs?.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyActivity, { color: colors.textSecondary }]}>{t.noRecentActivity}</Text>
          )}
        </View>
      )}

      {/* Workers List */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
          <View style={[styles.workerCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                onPress={() => router.push(`/worker-profile-view?id=${item.id}`)}
                style={styles.workerInfo}
              >
                {item.photo_url ? (
                  <Image 
                    source={{ uri: item.photo_url }} 
                    style={styles.workerPhoto}
                    onError={() => console.log('Worker photo load error')}
                  />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.border }]}>
                    <Text style={styles.photoText}>{item.full_name?.charAt(0) || '?'}</Text>
                  </View>
                )}
                <View style={styles.workerDetails}>
                  <Text style={[styles.workerName, { color: colors.text }]}>{item.full_name}</Text>
                  {item.avgRating > 0 && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.rating}>⭐ {item.avgRating.toFixed(1)}</Text>
                      <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
                        ({item.totalRatings})
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    📍 {item.city}{item.area ? `, ${item.area}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => callWorker(item.phone)}
                style={styles.callButton}
              >
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>
            </View>

            {/* Experience & Pay */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{language === 'hi' ? 'अनुभव' : 'Experience'}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {item.experience_years || 0} {language === 'hi' ? 'वर्ष' : 'years'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{language === 'hi' ? 'फोन' : 'Phone'}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {item.phone}
                </Text>
              </View>
            </View>

            {/* Skills */}
            {item.skills && item.skills.length > 0 && (
              <View style={styles.skillsContainer}>
                {item.skills.slice(0, 4).map((skill: string, idx: number) => (
                  <View key={idx} style={[styles.skillBadge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.skillBadgeText, { color: colors.text }]}>{skill}</Text>
                  </View>
                ))}
                {item.skills.length > 4 && (
                  <Text style={[styles.moreSkills, { color: colors.textSecondary }]}>
                    +{item.skills.length - 4} more
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => toggleShortlist(item.id)}
                style={[
                  styles.actionButton,
                  { backgroundColor: shortlistedIds.has(item.id) ? '#FEF3C7' : colors.background }
                ]}
              >
                <Text style={[styles.actionButtonText, { color: shortlistedIds.has(item.id) ? '#F59E0B' : colors.text }]}>
                  {shortlistedIds.has(item.id) ? '⭐ ' + t.shortlisted : t.shortlistWorker}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/worker-profile-view?id=${item.id}`)}
                style={styles.actionButtonPrimary}
              >
                <Text style={styles.actionButtonTextPrimary}>{language === 'hi' ? 'प्रोफ़ाइल देखें' : 'View Profile'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {language === 'hi' ? 'कोई मजदूर नहीं मिला' : 'No workers found'}
            </Text>
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>{language === 'hi' ? 'खोज साफ़ करें' : 'Clear Search'}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Profile Menu Dropdown */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuBackdrop}
            activeOpacity={1} 
            onPress={() => {
              console.log('Backdrop clicked');
              setShowMenu(false);
            }}
          />
          <View style={[styles.menuDropdown, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Dashboard clicked');
                setShowMenu(false);
                router.push('/employer');
              }}
            >
              <Text style={styles.menuItemIcon}>📊</Text>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Edit Profile clicked');
                setShowMenu(false);
                router.push('/employer-profile-setup');
              }}
            >
              <Text style={styles.menuItemIcon}>✏️</Text>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  activityButton: { position: 'relative', width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  activityIcon: { fontSize: 20 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  activityPanel: { position: 'absolute', top: 100, right: 20, width: 320, maxHeight: 400, borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, zIndex: 1000, padding: 16 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activityTitle: { fontSize: 16, fontWeight: 'bold' },
  closeButton: { fontSize: 18, color: '#9CA3AF' },
  activityList: { maxHeight: 300 },
  activityItem: { flexDirection: 'row', padding: 12, borderRadius: 8, backgroundColor: '#F9FAFB', marginBottom: 8 },
  activityContent: { flex: 1, marginLeft: 8 },
  activityText: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  activitySubtext: { fontSize: 12 },
  emptyActivity: { textAlign: 'center', padding: 20, fontSize: 14 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#057642', justifyContent: 'center', alignItems: 'center' },
  profilePhoto: { width: 40, height: 40, borderRadius: 20 },
  menuText: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  clearIcon: { fontSize: 16, color: '#9CA3AF', paddingLeft: 8 },
  advancedFilterButton: { marginHorizontal: 20, marginBottom: 12, padding: 12, backgroundColor: '#EFF6FF', borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  advancedFilterText: { fontSize: 13, color: '#1E40AF', textAlign: 'center', fontWeight: '600' },
  list: { padding: 20, gap: 16 },
  workerCard: { padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  workerInfo: { flexDirection: 'row', flex: 1 },
  workerPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  photoPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  photoText: { fontSize: 24, fontWeight: 'bold', color: '#6B7280' },
  workerDetails: { flex: 1 },
  workerName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  ratingCount: { fontSize: 12, marginLeft: 4 },
  location: { fontSize: 13 },
  callButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#057642', justifyContent: 'center', alignItems: 'center' },
  callIcon: { fontSize: 24 },
  infoRow: { flexDirection: 'row', gap: 16, marginBottom: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, fontWeight: '600' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  skillBadgeText: { fontSize: 12, fontWeight: '500' },
  moreSkills: { fontSize: 12, alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  actionButtonPrimary: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#057642' },
  actionButtonTextPrimary: { fontSize: 14, fontWeight: '600', color: 'white' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, marginBottom: 16 },
  clearButton: { backgroundColor: '#057642', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  clearButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  menuDropdown: { position: 'absolute', top: 90, right: 20, borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, minWidth: 200, zIndex: 1001 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemIcon: { fontSize: 20, marginRight: 12 },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  menuDivider: { height: 1, marginHorizontal: 16 },
});
