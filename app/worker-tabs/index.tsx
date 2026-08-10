import { router, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet, RefreshControl, Modal, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WorkerHomeScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [employerProfiles, setEmployerProfiles] = useState<any>({});
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfile();
    loadJobs();
    loadBookmarks();
    loadAppliedJobs();
    
    // Real-time subscription for new jobs
    const subscription = supabase
      .channel('jobs_feed')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'jobs' 
      }, () => {
        loadJobs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('job_id')
      .eq('worker_id', user.id);

    if (data) {
      setBookmarkedJobs(new Set(data.map(b => b.job_id)));
    }
  };

  const loadAppliedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('job_id')
      .eq('worker_id', user.id);

    if (data) {
      setAppliedJobs(new Set(data.map(a => a.job_id)));
    }
  };

  const toggleBookmark = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (bookmarkedJobs.has(jobId)) {
      await supabase.from('bookmarks').delete().eq('worker_id', user.id).eq('job_id', jobId);
      const newSet = new Set(bookmarkedJobs);
      newSet.delete(jobId);
      setBookmarkedJobs(newSet);
    } else {
      await supabase.from('bookmarks').insert({ worker_id: user.id, job_id: jobId });
      setBookmarkedJobs(new Set([...bookmarkedJobs, jobId]));
    }
  };

  const quickApply = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('applications')
      .insert({ job_id: jobId, worker_id: user.id, status: 'Pending' });

    if (!error) {
      setAppliedJobs(new Set([...appliedJobs, jobId]));
    }
  };

  const getFilteredJobs = () => {
    let filtered = jobs;
    
    if (filterType === 'saved') filtered = jobs.filter(j => bookmarkedJobs.has(j.id));
    else if (filterType === 'applied') filtered = jobs.filter(j => appliedJobs.has(j.id));
    
    if (searchQuery) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.required_skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

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

  const loadJobs = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .gte('expiry_date', today)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setJobs(data);

      // Fetch employer profiles
      const employerIds = [...new Set(data.map(job => job.created_by))];
      const { data: profiles } = await supabase
        .from('employer_profiles')
        .select('*')
        .in('user_id', employerIds);

      if (profiles) {
        const profileMap = profiles.reduce((acc: any, profile: any) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
        setEmployerProfiles(profileMap);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const getMatchScore = (job: any) => {
    if (!profile?.skills) return 0;
    const jobSkills = job.required_skills || [];
    const workerSkills = profile.skills || [];
    const matches = jobSkills.filter((skill: string) => workerSkills.includes(skill));
    return jobSkills.length > 0 ? Math.round((matches.length / jobSkills.length) * 100) : 0;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '1 min ago';
    if (diffMinutes < 30) return `${diffMinutes} min ago`;
    if (diffMinutes < 60) return '30 min ago';
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hr ago';
    if (diffHours < 4) return `${diffHours} hr ago`;
    if (diffHours < 6) return '4 hr ago';
    if (diffHours < 10) return '6 hr ago';
    if (diffHours < 15) return '10 hr ago';
    if (diffHours < 24) return '15 hr ago';
    return '24 hr ago';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0A66C2', '#004182']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{language === 'hi' ? 'नमस्ते' : 'Hello'}, {profile?.full_name?.split(' ')[0] || (language === 'hi' ? 'मजदूर' : 'Worker')}!</Text>
            <Text style={styles.subtitle}>{language === 'hi' ? 'अपना अगला अवसर खोजें' : 'Find your next opportunity'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(true)}
          >
            {profile?.photo_url ? (
              <Image source={{ uri: profile.photo_url }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatar}>
                <Text style={styles.profileText}>{profile?.full_name?.charAt(0) || '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                router.push('/worker-profile');
              }}
            >
              <Text style={styles.menuIcon}>✏️</Text>
              <Text style={styles.menuText}>{language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowProfileMenu(false);
                router.push('/settings');
              }}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Feed */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'hi' ? 'नौकरी, शहर या कौशल खोजें...' : 'Search jobs, city or skills...'}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>{language === 'hi' ? 'सभी' : 'All'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filterType === 'saved' && styles.filterChipActive]}
          onPress={() => setFilterType('saved')}
        >
          <Text style={[styles.filterChipText, filterType === 'saved' && styles.filterChipTextActive]}>{language === 'hi' ? 'सहेजे गए' : 'Saved'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filterType === 'applied' && styles.filterChipActive]}
          onPress={() => setFilterType('applied')}
        >
          <Text style={[styles.filterChipText, filterType === 'applied' && styles.filterChipTextActive]}>{language === 'hi' ? 'आवेदन किए' : 'Applied'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredJobs()}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.feed}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <Text style={[styles.feedTitle, { color: colors.text }]}>
              {language === 'hi' ? 'नवीनतम नौकरियां 🔥' : 'Latest Jobs 🔥'}
            </Text>
            <Text style={[styles.feedSubtitle, { color: colors.textSecondary }]}>
              {jobs.length} {language === 'hi' ? 'नए अवसर' : 'new opportunities'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const matchScore = getMatchScore(item);
          const isNew = new Date(item.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;
          const employer = employerProfiles[item.created_by];
          
          return (
            <TouchableOpacity
              style={[styles.jobCard, { backgroundColor: colors.background }]}
              onPress={() => router.push(`/job-details?id=${item.id}`)}
              activeOpacity={0.7}
            >
              {/* New Badge */}
              {isNew && new Date(item.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                <View style={styles.newBadge}>
                  <Text style={styles.newText}>{language === 'hi' ? 'नया' : 'NEW'}</Text>
                </View>
              )}

              {/* Match Badge */}
              {matchScore > 0 && (
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>⭐ {matchScore}%</Text>
                </View>
              )}

              {/* Job Header */}
              <View style={styles.jobHeader}>
                {employer?.company_logo ? (
                  <Image source={{ uri: employer.company_logo }} style={styles.companyIcon} />
                ) : (
                  <View style={styles.companyIcon}>
                    <Text style={styles.companyIconText}>🏢</Text>
                  </View>
                )}
                <View style={styles.jobHeaderInfo}>
                  <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
                    {getTimeAgo(item.created_at)}
                  </Text>
                </View>
              </View>

              {/* Job Details */}
              <Text style={[styles.jobDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.jobMeta}>
                <Text style={[styles.metaItem, { color: colors.textSecondary }]}>
                  📍 {item.city}{item.area ? `, ${item.area}` : ''}
                </Text>
                {item.salary_range && (
                  <Text style={[styles.metaItem, { color: '#057642' }]}>
                    💰 {item.salary_range}
                  </Text>
                )}
              </View>

              {/* Skills */}
              {item.required_skills?.length > 0 && (
                <View style={styles.skillsRow}>
                  {item.required_skills.slice(0, 3).map((skill: string, index: number) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                  ))}
                  {item.required_skills.length > 3 && (
                    <Text style={[styles.moreSkills, { color: colors.textSecondary }]}>
                      +{item.required_skills.length - 3}
                    </Text>
                  )}
                </View>
              )}

              {/* Action Button */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => toggleBookmark(item.id)}
                >
                  <Text style={styles.iconButtonText}>{bookmarkedJobs.has(item.id) ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
                
                {appliedJobs.has(item.id) ? (
                  <View style={styles.appliedButton}>
                    <Text style={styles.appliedButtonText}>✓ {language === 'hi' ? 'आवेदन किया' : 'Applied'}</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => quickApply(item.id)}
                  >
                    <LinearGradient
                      colors={['#0A66C2', '#004182']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.applyGradient}
                    >
                      <Text style={styles.applyText}>{language === 'hi' ? 'तुरंत आवेदन करें' : 'Quick Apply'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileButton: {
    position: 'relative',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A66C2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  feed: {
    padding: 16,
  },
  feedHeader: {
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 13,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#057642',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  jobHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 8,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyIconText: {
    fontSize: 24,
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobMeta: {
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    marginBottom: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 11,
    color: '#0A66C2',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 11,
    alignSelf: 'center',
  },
  applyButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  clearIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingLeft: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  appliedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },
  appliedButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
});
