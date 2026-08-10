import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image, Linking, Modal, TextInput } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function CompanyProfile() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] as any;
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalHires: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    loadProfile();
    loadReviews();
    checkCanReview();
  }, [id]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('company_reviews')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch worker names separately
      const workerIds = data.map(r => r.worker_id);
      const { data: workers } = await supabase
        .from('worker_profiles')
        .select('id, full_name, photo')
        .in('id', workerIds);

      const reviewsWithWorkers = data.map(review => ({
        ...review,
        worker_profiles: workers?.find(w => w.id === review.worker_id)
      }));

      setReviews(reviewsWithWorkers);
    }
  };

  const checkCanReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('id, jobs(created_by)')
      .eq('worker_id', user.id)
      .eq('status', 'Selected');

    const hasWorked = data?.some((app: any) => app.jobs?.created_by === id);
    setCanReview(!!hasWorked);
  };

  const submitReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if review already exists
    const { data: existing } = await supabase
      .from('company_reviews')
      .select('id')
      .eq('company_id', id)
      .eq('worker_id', user.id)
      .single();

    let error;
    if (existing) {
      // Update existing review
      ({ error } = await supabase
        .from('company_reviews')
        .update({
          rating,
          review_text: reviewText,
        })
        .eq('id', existing.id));
    } else {
      // Insert new review
      ({ error } = await supabase
        .from('company_reviews')
        .insert({
          company_id: id,
          worker_id: user.id,
          rating,
          review_text: reviewText,
        }));
    }

    if (!error) {
      // Notify employer about new review
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (workerProfile?.full_name) {
        await supabase.from('notifications').insert({
          user_id: id,
          title: existing ? 'Review Updated' : 'New Review Received',
          message: `${workerProfile.full_name} ${existing ? 'updated their' : 'left a'} ${rating}-star review for your company`,
          type: 'general',
        });
      }

      setShowReviewModal(false);
      setReviewText('');
      setRating(5);
      loadReviews();
    }
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (data) setProfile(data);

    // Load employer stats
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, is_active')
      .eq('created_by', id);

    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(j => j.is_active).length || 0;

    const jobIds = jobs?.map(j => j.id) || [];
    const { data: hires } = await supabase
      .from('applications')
      .select('id')
      .in('job_id', jobIds)
      .eq('status', 'Selected');

    setStats({
      totalJobs,
      activeJobs,
      totalHires: hires?.length || 0,
    });
  };

  const openWebsite = () => {
    if (profile?.website) {
      Linking.openURL(profile.website);
    }
  };

  const callPhone = () => {
    if (profile?.phone) {
      Linking.openURL(`tel:${profile.phone}`);
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t.companyProfileNotFound}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Company Header */}
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        {profile.company_logo ? (
          <Image source={{ uri: profile.company_logo }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.border }]}>
            <Text style={styles.logoText}>🏢</Text>
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.companyName, { color: colors.text }]}>{profile.company_name}</Text>
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          
          {profile.industry && (
            <Text style={[styles.industry, { color: colors.textSecondary }]}>
              {profile.industry}
            </Text>
          )}
          
          {profile.company_size && (
            <Text style={[styles.companySize, { color: colors.textSecondary }]}>
              👥 {profile.company_size} {t.employees}
            </Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.totalJobs}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.totalJobs}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.activeJobs}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.activeJobs}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={styles.statValue}>{stats.totalHires}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.totalHires}</Text>
        </View>
      </View>

      {/* Description */}
      {profile.description && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.about}</Text>
          <Text style={[styles.description, { color: colors.text }]}>{profile.description}</Text>
        </View>
      )}

      {/* Contact Info */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.contactInformation}</Text>
        
        {profile.phone && (
          <TouchableOpacity onPress={callPhone} style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={[styles.contactText, { color: colors.text }]}>{profile.phone}</Text>
          </TouchableOpacity>
        )}
        
        {profile.website && (
          <TouchableOpacity onPress={openWebsite} style={styles.contactRow}>
            <Text style={styles.contactIcon}>🌐</Text>
            <Text style={[styles.contactText, styles.link]}>{profile.website}</Text>
          </TouchableOpacity>
        )}
        
        {(profile.address || profile.city) && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={[styles.contactText, { color: colors.text }]}>
              {[profile.address, profile.city, profile.state, profile.zip_code]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.reviewHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.reviews}</Text>
          {canReview && (
            <TouchableOpacity onPress={() => setShowReviewModal(true)} style={styles.addReviewButton}>
              <Text style={styles.addReviewText}>+ {t.addReview}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.worker_profiles?.full_name}</Text>
                <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
              </View>
              {review.review_text && (
                <Text style={[styles.reviewText, { color: colors.text }]}>{review.review_text}</Text>
              )}
              <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.noReviews, { color: colors.textSecondary }]}>{t.noReviewsYet}</Text>
        )}
      </View>

      {/* View Jobs Button */}
      <TouchableOpacity
        onPress={() => router.push(`/jobs?employer=${id}`)}
        style={styles.viewJobsButton}
      >
        <Text style={styles.viewJobsText}>{t.viewAllJobsFromCompany}</Text>
      </TouchableOpacity>
      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.writeReview}</Text>
            
            <Text style={[styles.label, { color: colors.text }]}>{t.rating}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.label, { color: colors.text }]}>{t.reviewOptional}</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={t.shareExperience}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitReview} style={styles.submitButton}>
                <Text style={styles.submitText}>{t.submit}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  headerCard: { margin: 20, marginTop: 0, padding: 20, borderRadius: 16, alignItems: 'center' },
  logo: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 48 },
  headerInfo: { alignItems: 'center', width: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  companyName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  verifiedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  industry: { fontSize: 16, marginBottom: 4 },
  companySize: { fontSize: 14 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#057642' },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  section: { margin: 20, marginTop: 0, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactIcon: { fontSize: 20, marginRight: 12, width: 24 },
  contactText: { fontSize: 15, flex: 1 },
  link: { color: '#0A66C2', textDecorationLine: 'underline' },
  viewJobsButton: { margin: 20, backgroundColor: '#057642', padding: 18, borderRadius: 12, alignItems: 'center' },
  viewJobsText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addReviewButton: { backgroundColor: '#0A66C2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addReviewText: { color: 'white', fontSize: 13, fontWeight: '600' },
  reviewCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  reviewRating: { fontSize: 14 },
  reviewText: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  reviewDate: { fontSize: 12, marginTop: 4 },
  noReviews: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  star: { fontSize: 32 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  submitButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#0A66C2', alignItems: 'center' },
  submitText: { fontSize: 14, fontWeight: '600', color: 'white' },
});
