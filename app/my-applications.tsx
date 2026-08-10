import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { translations } from '@/constants/translations';

export default function MyApplicationsScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const t = translations[language];
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchMyApplications();
  }, []);

  useEffect(() => {
    if (search || filter !== 'All') {
      let filtered = applications;
      
      if (search) {
        filtered = filtered.filter(app => 
          app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
          app.job?.city?.toLowerCase().includes(search.toLowerCase()) ||
          app.employer?.company_name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (filter !== 'All') {
        filtered = filtered.filter(app => app.status === filter);
      }
      
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications);
    }
  }, [search, applications, filter]);

  const fetchMyApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        created_at,
        job:jobs (
          id,
          title,
          description,
          city,
          salary_range,
          created_by
        )
      `)
      .eq('worker_id', user.id)
      .neq('status', 'Withdrawn')
      .order('created_at', { ascending: false });

    console.log('Applications data:', data);
    console.log('Applications error:', error);

    if (!error && data) {
      // Fetch employer profiles for each job
      const employerIds = data.map((app: any) => app.job?.created_by).filter(Boolean);
      const { data: profiles } = await supabase
        .from('employer_profiles')
        .select('user_id, company_name, company_logo')
        .in('user_id', employerIds);

      // Merge employer profiles with applications
      const appsWithEmployers = data.map((app: any) => ({
        ...app,
        employer: profiles?.find((p: any) => p.user_id === app.job?.created_by)
      }));

      setApplications(appsWithEmployers);
      setFilteredApplications(appsWithEmployers);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'Withdrawn' })
      .eq('id', applicationId);

    if (error) {
      alert('Error withdrawing application');
    } else {
      alert('Application withdrawn successfully');
      fetchMyApplications();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#6C757D';
      case 'Viewed': return '#17A2B8';
      case 'Shortlisted': return '#FFC107';
      case 'Selected': return '#28A745';
      case 'Rejected': return '#DC3545';
      default: return '#6C757D';
    }
  };

  const statusFilters = ['All', 'Pending', 'Viewed', 'Shortlisted', 'Selected', 'Rejected'];

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'All': language === 'hi' ? 'सभी' : 'All',
      'Pending': language === 'hi' ? 'लंबित' : 'Pending',
      'Viewed': language === 'hi' ? 'देखा गया' : 'Viewed',
      'Shortlisted': language === 'hi' ? 'शॉर्टलिस्ट' : 'Shortlisted',
      'Selected': language === 'hi' ? 'चयनित' : 'Selected',
      'Rejected': language === 'hi' ? 'अस्वीकृत' : 'Rejected'
    };
    return labels[status] || status;
  };

  const getStatusCount = (status: string) => {
    if (status === 'All') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t.myApplications}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {applications.length} {language === 'hi' ? 'आवेदन' : 'applications'}
        </Text>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterTabs}>
        {statusFilters.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilter(status)}
            style={[
              styles.filterTab,
              filter === status && styles.filterTabActive,
              { backgroundColor: filter === status ? '#0A66C2' : colors.card }
            ]}
          >
            <Text style={[
              styles.filterTabText,
              { color: filter === status ? 'white' : colors.text }
            ]}>
              {getStatusLabel(status)}
            </Text>
            {getStatusCount(status) > 0 && (
              <View style={[
                styles.filterBadge,
                { backgroundColor: filter === status ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  { color: filter === status ? 'white' : colors.text }
                ]}>
                  {getStatusCount(status)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {applications.length > 0 && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={language === 'hi' ? 'नौकरी, कंपनी या शहर से खोजें...' : 'Search by job, company, or city...'}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {filteredApplications.length === 0 && applications.length > 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          No applications match your search
        </Text>
      ) : applications.length === 0 ? (
        <Text>No applications yet</Text>
      ) : (
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.appCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/job-details?id=${item.job?.id}`)}
            >
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
              </View>

              <Text style={[styles.jobTitle, { color: colors.text }]}>{item.job?.title}</Text>
              
              {item.employer && (
                <View style={styles.companyRow}>
                  <Text style={styles.companyIcon}>🏢</Text>
                  <Text style={[styles.companyText, { color: colors.textSecondary }]}>
                    {item.employer.company_name}
                  </Text>
                </View>
              )}
              
              <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
                📍 {item.job?.city}
              </Text>
              {item.job?.salary_range && (
                <Text style={[styles.salary, { color: colors.text }]}>💰 {item.job.salary_range}</Text>
              )}
              <Text style={[styles.appliedDate, { color: colors.textSecondary }]}>
                {language === 'hi' ? 'आवेदन किया' : 'Applied'}: {new Date(item.applied_at).toLocaleDateString()}
              </Text>

              {(item.status === 'Pending' || item.status === 'Rejected') && (
                <TouchableOpacity
                  style={[styles.withdrawButton, item.status === 'Rejected' && styles.reapplyButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (item.status === 'Rejected') {
                      router.push(`/job-details?id=${item.job?.id}`);
                    } else {
                      withdrawApplication(item.id);
                    }
                  }}
                >
                  <Text style={styles.withdrawText}>
                    {item.status === 'Rejected' 
                      ? (language === 'hi' ? '🔄 फिर से आवेदन करें' : '🔄 Apply Again')
                      : (language === 'hi' ? '❌ आवेदन वापस लें' : '❌ Withdraw Application')
                    }
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexWrap: 'wrap' },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  filterTabActive: { elevation: 2 },
  filterTabText: { fontSize: 13, fontWeight: '600' },
  filterBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  filterBadgeText: { fontSize: 11, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, elevation: 1 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  list: { padding: 16, gap: 12 },
  appCard: { padding: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, position: 'relative' },
  statusBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  jobTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, paddingRight: 80 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  companyIcon: { fontSize: 16, marginRight: 6 },
  companyText: { fontSize: 14 },
  location: { fontSize: 13, marginBottom: 4 },
  salary: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  appliedDate: { fontSize: 12, marginTop: 4 },
  withdrawButton: { marginTop: 12, backgroundColor: '#DC3545', padding: 10, borderRadius: 8, alignItems: 'center' },
  reapplyButton: { backgroundColor: '#28A745' },
  withdrawText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
