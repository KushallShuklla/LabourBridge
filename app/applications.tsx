import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';
import { notifyWorkerStatusChange } from '../services/notifications';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ApplicationsScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('User not logged in');
      return;
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        expected_pay,
        worker_id,
        job:jobs!inner (
          title,
          created_by
        )
      `);

    if (error) {
      alert(error.message);
      return;
    }

    const filtered = data.filter(
      (item: any) => item.job?.created_by === user.id
    );

    // Fetch worker profiles separately
    const workerIds = filtered.map((app: any) => app.worker_id);
    const { data: workers } = await supabase
      .from('worker_profiles')
      .select('*')
      .in('id', workerIds);

    // Fetch verification status
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, verified')
      .in('id', workerIds);

    // Merge worker data with applications
    const applicationsWithWorkers = filtered.map((app: any) => ({
      ...app,
      worker: workers?.find((w: any) => w.id === app.worker_id),
      verified: profiles?.find((p: any) => p.id === app.worker_id)?.verified || false
    }));

    setApplications(applicationsWithWorkers);
  };

  const updateStatus = async (applicationId: string, status: string) => {
    const app = applications.find(a => a.id === applicationId);
    
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      alert(error.message);
    } else {
      // Send notification
      if (app) {
        await notifyWorkerStatusChange(app.worker_id, app.job?.title || 'a job', status);
      }
      alert('Status updated');
      fetchApplications();
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(a => a.id)));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) {
      Alert.alert('Error', 'Please select applications first');
      return;
    }

    Alert.alert(
      'Confirm Bulk Action',
      `Update ${selectedIds.size} application(s) to ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const ids = Array.from(selectedIds);
            const { error } = await supabase
              .from('applications')
              .update({ status })
              .in('id', ids);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              // Send notifications
              for (const id of ids) {
                const app = applications.find(a => a.id === id);
                if (app) {
                  await notifyWorkerStatusChange(app.worker_id, app.job?.title || 'a job', status);
                }
              }
              Alert.alert('Success', `${ids.length} application(s) updated`);
              setSelectedIds(new Set());
              setBulkMode(false);
              fetchApplications();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{language === 'hi' ? 'नौकरी के आवेदन' : 'Job Applications'}</Text>
        <TouchableOpacity onPress={() => setBulkMode(!bulkMode)} style={styles.bulkButton}>
          <Text style={styles.bulkButtonText}>{bulkMode ? (language === 'hi' ? 'रद्द करें' : 'Cancel') : (language === 'hi' ? 'बल्क कार्य' : 'Bulk Actions')}</Text>
        </TouchableOpacity>
      </View>

      {bulkMode && (
        <View style={[styles.bulkToolbar, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={selectAll} style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>
              {selectedIds.size === applications.length ? (language === 'hi' ? '☑️ सभी अचयनित करें' : '☑️ Deselect All') : (language === 'hi' ? '☐ सभी चुनें' : '☐ Select All')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.selectedCount, { color: colors.text }]}>
            {selectedIds.size} {language === 'hi' ? 'चयनित' : 'selected'}
          </Text>
        </View>
      )}

      {bulkMode && selectedIds.size > 0 && (
        <View style={[styles.bulkActions, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => bulkUpdateStatus('Shortlisted')}
            style={[styles.bulkActionButton, { backgroundColor: '#28A745' }]}
          >
            <Text style={styles.bulkActionText}>✓ Shortlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => bulkUpdateStatus('Selected')}
            style={[styles.bulkActionButton, { backgroundColor: '#6F42C1' }]}
          >
            <Text style={styles.bulkActionText}>✓ Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => bulkUpdateStatus('Rejected')}
            style={[styles.bulkActionButton, { backgroundColor: '#DC3545' }]}
          >
            <Text style={styles.bulkActionText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {applications.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{language === 'hi' ? 'कोई आवेदन नहीं मिला' : 'No applications found'}</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => bulkMode && toggleSelection(item.id)}
              activeOpacity={bulkMode ? 0.7 : 1}
              style={[
                styles.applicationCard,
                { backgroundColor: colors.card },
                selectedIds.has(item.id) && styles.selectedCard,
              ]}
            >
              {bulkMode && (
                <View style={styles.checkbox}>
                  <Text style={styles.checkboxText}>{selectedIds.has(item.id) ? '☑️' : '☐'}</Text>
                </View>
              )}
              <Text style={[styles.jobTitle, { color: colors.text }]}>
                Job: {item.job?.title}
              </Text>

              {item.worker ? (
                <>
                  <View style={styles.workerHeader}>
                    <Text style={styles.workerName}>
                      {item.worker.full_name}
                    </Text>
                    {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                  </View>
                  <Text style={[styles.workerDetail, { color: colors.text }]}>📞 {item.worker.phone}</Text>
                  <Text style={[styles.workerDetail, { color: colors.text }]}>📍 {item.worker.city}{item.worker.area ? `, ${item.worker.area}` : ''}</Text>
                  <Text style={[styles.workerDetail, { color: colors.text }]}>💼 Experience: {item.worker.experience_years} years</Text>
                  <Text style={[styles.workerDetail, { color: colors.text }]}>🔧 Skills: {item.worker.skills?.join(', ') || 'N/A'}</Text>
                  {item.expected_pay && (
                    <Text style={[styles.workerDetail, { color: '#057642', fontWeight: 'bold' }]}>
                      💰 Expected Pay: ₹{item.expected_pay}/hr
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.incompleteProfile}>Profile not completed</Text>
              )}

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>Status: {item.status}</Text>
              </View>

              {!bulkMode && (
                <>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, 'Viewed')}
                      style={[styles.actionButton, { backgroundColor: '#17A2B8' }]}
                    >
                      <Text style={styles.actionButtonText}>Mark Viewed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, 'Shortlisted')}
                      style={[styles.actionButton, { backgroundColor: '#28A745' }]}
                    >
                      <Text style={styles.actionButtonText}>Shortlist</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, 'Selected')}
                      style={[styles.actionButton, { backgroundColor: '#6F42C1' }]}
                    >
                      <Text style={styles.actionButtonText}>Select</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, 'Rejected')}
                      style={[styles.actionButton, { backgroundColor: '#DC3545' }]}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {item.status === 'Selected' && item.worker && !bulkMode && (
                <TouchableOpacity
                  onPress={() => router.push(`/add-job-history?workerId=${item.worker_id}&workerName=${item.worker.full_name}`)}
                  style={styles.historyButton}
                >
                  <Text style={styles.historyButtonText}>Add to Job History</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Selected': return '#6F42C1';
    case 'Shortlisted': return '#28A745';
    case 'Rejected': return '#DC3545';
    case 'Viewed': return '#17A2B8';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  bulkButton: { backgroundColor: '#057642', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  bulkButtonText: { color: 'white', fontWeight: '600' },
  bulkToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 10 },
  toolbarButton: { padding: 8 },
  toolbarButtonText: { fontSize: 14, fontWeight: '600' },
  selectedCount: { fontSize: 14, fontWeight: 'bold' },
  bulkActions: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 8, marginBottom: 10 },
  bulkActionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  bulkActionText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  applicationCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 10 },
  selectedCard: { borderColor: '#057642', borderWidth: 2, backgroundColor: '#F0FDF4' },
  checkbox: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  checkboxText: { fontSize: 24 },
  jobTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  workerHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  workerName: { fontWeight: 'bold', color: '#1E90FF', fontSize: 16 },
  verifiedBadge: { marginLeft: 5, fontSize: 18, color: '#1E90FF' },
  workerDetail: { fontSize: 14, marginTop: 4 },
  incompleteProfile: { color: '#999', marginTop: 5 },
  statusBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionButton: { flex: 1, padding: 10, borderRadius: 8 },
  actionButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  historyButton: { marginTop: 8, backgroundColor: '#28A745', padding: 10, borderRadius: 8 },
  historyButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});
