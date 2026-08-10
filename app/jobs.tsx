import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function JobListScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [showRecommended, setShowRecommended] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [showHighSalary, setShowHighSalary] = useState(false);
  const [employerProfiles, setEmployerProfiles] = useState<any>({});
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
    loadWorkerProfile();
    loadAppliedJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, showRecommended, showNearby, showHighSalary]);

  const loadAppliedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('job_id')
      .eq('worker_id', user.id);

    if (data) {
      setAppliedJobs(new Set(data.map(app => app.job_id)));
    }
  };

  const quickApply = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (appliedJobs.has(jobId)) {
      Alert.alert(t.error, t.alreadyAppliedToJob);
      return;
    }

    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        worker_id: user.id,
        status: 'Pending'
      });

    if (!error) {
      setAppliedJobs(new Set([...appliedJobs, jobId]));
      Alert.alert(t.success, t.appliedSuccessfully);
    }
  };

  const loadWorkerProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setWorkerProfile(data);
    
    // Get recommended jobs based on skills
    if (data?.skills) {
      const { data: recommended } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recommended) {
        const scored = recommended
          .map(job => ({
            ...job,
            score: getMatchScore(job)
          }))
          .filter(job => job.score > 30)
          .sort((a, b) => b.score - a.score);
        setRecommendedJobs(scored);
      }
    }
  };

  const fetchJobs = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .gte('expiry_date', today)
      .order('created_at', { ascending: false });

    if (!error && data) {
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

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.required_skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (showRecommended && workerProfile?.skills) {
      filtered = filtered.filter(job => {
        const jobSkills = job.required_skills || [];
        const workerSkills = workerProfile.skills || [];
        return jobSkills.some((skill: string) => workerSkills.includes(skill));
      });
    }

    if (showNearby && workerProfile?.city) {
      filtered = filtered.filter(job => 
        job.city.toLowerCase() === workerProfile.city.toLowerCase()
      );
    }

    if (showHighSalary) {
      filtered = filtered.sort((a, b) => {
        const salaryA = parseInt(a.salary_range?.match(/\d+/)?.[0] || '0');
        const salaryB = parseInt(b.salary_range?.match(/\d+/)?.[0] || '0');
        return salaryB - salaryA;
      });
    }

    setFilteredJobs(filtered);
  };

  const getMatchScore = (job: any) => {
    if (!workerProfile?.skills) return 0;
    const jobSkills = job.required_skills || [];
    const workerSkills = workerProfile.skills || [];
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>{language === 'hi' ? 'काम खोजें' : 'Find Work'}</Text>
          <TouchableOpacity onPress={() => router.push('/worker-profile')}>
            <View style={styles.profileContainer}>
              {workerProfile?.photo_url ? (
                <Image source={{ uri: workerProfile.photo_url }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileText}>{workerProfile?.full_name?.charAt(0) || '?'}</Text>
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder={language === 'hi' ? 'नौकरी, कौशल या शीर्षक खोजें...' : 'Search jobs, skills, or titles...'}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setShowRecommended(!showRecommended)}
            style={[styles.chip, showRecommended && styles.chipActive]}
          >
            <Text style={[styles.chipText, showRecommended && styles.chipTextActive]}>
              {language === 'hi' ? 'अनुशंसित' : 'Recommended'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowNearby(!showNearby)}
            style={[styles.chip, showNearby && styles.chipActive]}
          >
            <Text style={[styles.chipText, showNearby && styles.chipTextActive]}>{language === 'hi' ? 'पास में' : 'Nearby'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowHighSalary(!showHighSalary)}
            style={[styles.chip, showHighSalary && styles.chipActive]}
          >
            <Text style={[styles.chipText, showHighSalary && styles.chipTextActive]}>{language === 'hi' ? 'उच्च वेतन' : 'High Salary'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Jobs Feed */}
      {recommendedJobs.length > 0 && !searchQuery && (
        <View style={styles.recommendedSection}>
          <View style={styles.recommendedHeader}>
            <View>
              <Text style={[styles.recommendedTitle, { color: colors.text }]}>{t.jobRecommendations}</Text>
              <Text style={[styles.recommendedSubtitle, { color: colors.textSecondary }]}>{t.basedOnProfile}</Text>
            </View>
          </View>
          {recommendedJobs.map((item) => {
            const employer = employerProfiles[item.created_by];
            return (
              <View key={item.id} style={[styles.recommendedCard, { backgroundColor: '#FEF3C7' }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.companyIcon}>
                      {employer?.company_logo ? (
                        <Image source={{ uri: employer.company_logo }} style={styles.companyLogoImage} />
                      ) : (
                        <Text style={styles.companyIconText}>🏢</Text>
                      )}
                    </View>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.companyName}>{employer?.company_name || item.city}</Text>
                    </View>
                  </View>
                  <View style={[styles.matchBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.matchIcon}>⚡</Text>
                    <Text style={[styles.matchText, { color: 'white' }]}>{item.score}%</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.salary}>{item.salary_range}</Text>
                  <TouchableOpacity
                    style={styles.quickApplyButton}
                    onPress={() => appliedJobs.has(item.id) ? router.push(`/job-details?id=${item.id}`) : quickApply(item.id)}
                  >
                    <Text style={styles.quickApplyText}>
                      {appliedJobs.has(item.id) ? '✓ ' + t.applied : t.quickApply}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const matchScore = getMatchScore(item);
          const employer = employerProfiles[item.created_by];
          return (
            <View style={[styles.jobCard, { backgroundColor: colors.background }]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <TouchableOpacity
                    onPress={() => employer && router.push(`/company-profile?id=${item.created_by}`)}
                    style={styles.companyIcon}
                  >
                    {employer?.company_logo ? (
                      <Image source={{ uri: employer.company_logo }} style={styles.companyLogoImage} />
                    ) : (
                      <Text style={styles.companyIconText}>🏢</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => employer && router.push(`/company-profile?id=${item.created_by}`)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.companyName, { color: colors.textSecondary }]}>
                          {employer?.company_name || item.city}
                        </Text>
                        {employer?.verified && (
                          <Text style={{ fontSize: 12, color: '#059669' }}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
                      {getTimeAgo(item.created_at)}
                    </Text>
                  </View>
                </View>
                {matchScore > 0 && (
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchIcon}>⚡</Text>
                    <Text style={styles.matchText}>{matchScore}%</Text>
                  </View>
                )}
              </View>

              {/* Skills */}
              {item.required_skills?.length > 0 && (
                <View style={styles.skillsContainer}>
                  {item.required_skills.slice(0, 3).map((skill: string, index: number) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.salaryContainer}>
                  <Text style={[styles.salary, { color: colors.text }]}>
                    {item.salary_range || '$25/hr'}
                  </Text>
                  <Text style={[styles.location, { color: colors.textSecondary }]}>
                    📍 {item.city}{item.area ? `, ${item.area}` : ''}
                  </Text>
                </View>
                {appliedJobs.has(item.id) ? (
                  <View style={styles.appliedBadge}>
                    <Text style={styles.appliedText}>✓ {t.applied}</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.applyButton}
                    onPress={() => router.push(`/job-details?id=${item.id}`)}
                  >
                    <LinearGradient
                      colors={['#0A66C2', '#004182']}
                      style={styles.applyGradient}
                    >
                      <Text style={styles.applyText}>{language === 'hi' ? 'अभी आवेदन करें' : 'Apply Now'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 102, 194, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A66C2',
    overflow: 'hidden',
  },
  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0A66C2',
    borderWidth: 2,
    borderColor: 'white',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(10, 102, 194, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  jobCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  companyIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  companyLogoImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  companyIconText: {
    fontSize: 28,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 102, 194, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  matchIcon: {
    fontSize: 12,
  },
  matchText: {
    color: '#0A66C2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  salaryContainer: {
    flex: 1,
  },
  salary: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  applyText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  recommendedSection: {
    padding: 16,
    paddingTop: 8,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendedSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  recommendedCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  quickApplyButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickApplyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appliedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  appliedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: 'bold',
  },
});