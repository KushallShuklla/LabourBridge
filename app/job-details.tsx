import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import { notifyEmployerNewApplication } from '../services/notifications';
import { useLanguage } from '@/contexts/LanguageContext';

export default function JobDetailsScreen() {
  const { language } = useLanguage();
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [expectedPay, setExpectedPay] = useState('');
  const [defaultPay, setDefaultPay] = useState('');

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
    checkBookmarkStatus();
    loadDefaultPay();
  }, []);

  const fetchJobDetails = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    setJob(data);

    // Fetch employer profile
    if (data?.created_by) {
      const { data: profile } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', data.created_by)
        .single();
      
      setEmployerProfile(profile);
    }
  };

  const checkApplicationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('worker_id', user.id)
      .neq('status', 'Withdrawn')
      .single();

    setHasApplied(!!data);
  };

  const checkBookmarkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('job_id', id)
      .eq('worker_id', user.id)
      .single();

    setIsBookmarked(!!data);
  };

  const loadDefaultPay = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('worker_profiles')
      .select('expected_salary')
      .eq('id', user.id)
      .single();

    if (data?.expected_salary) {
      setDefaultPay(data.expected_salary.toString());
      setExpectedPay(data.expected_salary.toString());
    }
  };

  const applyForJob = () => {
    setShowPayModal(true);
  };

  const submitApplication = async () => {
    if (!expectedPay || parseFloat(expectedPay) <= 0) {
      Alert.alert('Error', 'Please enter your expected pay rate');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use upsert to handle withdrawn applications
    const { error } = await supabase
      .from('applications')
      .upsert({
        job_id: id,
        worker_id: user.id,
        status: 'Pending',
        expected_pay: parseFloat(expectedPay),
        applied_at: new Date().toISOString(),
      }, {
        onConflict: 'job_id,worker_id'
      });

    if (error) {
      console.error('Application error:', error);
      Alert.alert('Error', error.message || 'Failed to submit application');
    } else {
      // Get worker name and notify employer
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (job?.created_by && workerProfile?.full_name) {
        console.log('Sending notification to employer:', job.created_by);
        console.log('Worker name:', workerProfile.full_name);
        console.log('Job title:', job.title);
        await notifyEmployerNewApplication(job.created_by, workerProfile.full_name, job.title);
      }

      Alert.alert('Success', 'Applied successfully');
      setHasApplied(true);
      setShowPayModal(false);
    }
  };

  const toggleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('worker_id', user.id)
        .eq('job_id', id);
      setIsBookmarked(false);
      alert('Bookmark removed');
    } else {
      await supabase.from('bookmarks').insert({ worker_id: user.id, job_id: id });
      setIsBookmarked(true);
      alert('Job bookmarked');
    }
  };

  if (!job) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        {job.title}
      </Text>

      {/* Company Info */}
      {employerProfile && (
        <TouchableOpacity
          onPress={() => router.push(`/company-profile?id=${job.created_by}`)}
          style={{
            backgroundColor: '#F0F9FF',
            padding: 15,
            borderRadius: 12,
            marginBottom: 15,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#0A66C2',
          }}
        >
          {employerProfile.company_logo ? (
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', marginRight: 12 }}>
              <Text style={{ fontSize: 40 }}>🏢</Text>
            </View>
          ) : (
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 24 }}>🏢</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0A66C2' }}>
                {employerProfile.company_name}
              </Text>
              {employerProfile.verified && (
                <Text style={{ fontSize: 14, color: '#059669' }}>✓</Text>
              )}
            </View>
            {employerProfile.industry && (
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                {employerProfile.industry}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#0A66C2', marginTop: 4 }}>View Company Profile →</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={{ backgroundColor: '#F5F5F5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          📍 <Text style={{ fontWeight: 'bold' }}>{language === 'hi' ? 'स्थान:' : 'Location:'}</Text> {job.city}
          {job.area ? `, ${job.area}` : ''}
        </Text>

        {job.salary_range && (
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            💰 <Text style={{ fontWeight: 'bold' }}>{language === 'hi' ? 'वेतन:' : 'Salary:'}</Text> {job.salary_range}
          </Text>
        )}

        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          📅 <Text style={{ fontWeight: 'bold' }}>{language === 'hi' ? 'समाप्त:' : 'Expires:'}</Text>{' '}
          {new Date(job.expiry_date).toLocaleDateString()}
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          📝 <Text style={{ fontWeight: 'bold' }}>{language === 'hi' ? 'पोस्ट किया गया:' : 'Posted:'}</Text>{' '}
          {new Date(job.created_at).toLocaleDateString()}
        </Text>
      </View>

      {job.required_skills?.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            {language === 'hi' ? 'आवश्यक कौशल:' : 'Required Skills:'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {job.required_skills.map((skill: string) => (
              <View
                key={skill}
                style={{
                  backgroundColor: '#1E90FF',
                  padding: 8,
                  borderRadius: 15,
                  margin: 4,
                }}
              >
                <Text style={{ color: 'white' }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          {language === 'hi' ? 'नौकरी का विवरण:' : 'Job Description:'}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>{job.description}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
        <TouchableOpacity
          onPress={applyForJob}
          disabled={hasApplied}
          style={{
            flex: 1,
            backgroundColor: hasApplied ? '#6C757D' : '#28A745',
            padding: 14,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            {hasApplied ? (language === 'hi' ? 'पहले से आवेदन किया' : 'Already Applied') : (language === 'hi' ? 'अभी आवेदन करें' : 'Apply Now')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleBookmark}
          style={{
            backgroundColor: isBookmarked ? '#FFC107' : '#6C757D',
            padding: 14,
            borderRadius: 6,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ fontSize: 20 }}>{isBookmarked ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: '#6C757D',
          padding: 14,
          borderRadius: 6,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          {language === 'hi' ? 'नौकरियों पर वापस जाएं' : 'Back to Jobs'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push(`/report?type=job&id=${id}&name=${job.title}`)}
        style={{
          backgroundColor: '#DC3545',
          padding: 14,
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          🚨 Report This Job
        </Text>
      </TouchableOpacity>

      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>Expected Pay Rate</Text>
            <Text style={modalStyles.subtitle}>What is your expected hourly rate for this job?</Text>
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Hourly Rate (₹)</Text>
              <TextInput
                style={modalStyles.input}
                value={expectedPay}
                onChangeText={setExpectedPay}
                placeholder={defaultPay || "Enter amount"}
                keyboardType="decimal-pad"
                autoFocus
              />
              {defaultPay && <Text style={modalStyles.hint}>Your profile default: ₹{defaultPay}/hr</Text>}
            </View>
            <View style={modalStyles.actions}>
              <TouchableOpacity onPress={() => setShowPayModal(false)} style={modalStyles.cancelButton}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitApplication} style={modalStyles.submitButton}>
                <Text style={modalStyles.submitText}>Submit Application</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 18, fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  submitButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#28A745', alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
