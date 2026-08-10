import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function WorkerHistory() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [worker, setWorker] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgRating: 0, totalJobs: 0, rehireRate: 0 });

  useEffect(() => {
    loadWorkerData();
  }, [id]);

  const loadWorkerData = async () => {
    console.log('Loading worker data for ID:', id);
    
    // Load worker profile
    const { data: profile, error: profileError } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Worker profile:', profile);
    console.log('Profile error:', profileError);

    if (profile) setWorker(profile);

    // Load ratings from worker_ratings table
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('worker_ratings')
      .select('*')
      .eq('worker_id', id)
      .order('created_at', { ascending: false });

    console.log('Worker ratings data:', ratingsData);
    console.log('Worker ratings error:', ratingsError);

    // Also load from job_history table
    const { data: jobHistoryData, error: historyError } = await supabase
      .from('job_history')
      .select('*')
      .eq('worker_id', id)
      .order('created_at', { ascending: false });

    console.log('Job history data:', jobHistoryData);
    console.log('Job history error:', historyError);

    // Combine both sources
    let allRatings: any[] = [];

    if (ratingsData && ratingsData.length > 0) {
      const employerIds = ratingsData.map(r => r.employer_id).filter(Boolean);
      const jobIds = ratingsData.map(r => r.job_id).filter(Boolean);

      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('user_id, company_name')
        .in('user_id', employerIds);

      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title')
        .in('id', jobIds);

      allRatings = ratingsData.map(rating => ({
        ...rating,
        employer: employers?.find(e => e.user_id === rating.employer_id),
        job: jobs?.find(j => j.id === rating.job_id),
      }));
    }

    // Add job_history entries
    if (jobHistoryData && jobHistoryData.length > 0) {
      const historyEmployerIds = jobHistoryData.map(h => h.employer_id).filter(Boolean);
      
      const { data: historyEmployers } = await supabase
        .from('employer_profiles')
        .select('user_id, company_name')
        .in('user_id', historyEmployerIds);

      const historyRatings = jobHistoryData.map(history => ({
        id: history.id,
        rating: history.rating || 0,
        punctuality: history.rating || 0,
        quality: history.rating || 0,
        communication: history.rating || 0,
        review_text: history.feedback,
        would_rehire: true,
        created_at: history.created_at,
        employer: historyEmployers?.find(e => e.user_id === history.employer_id),
        job: { title: history.job_title },
      }));

      allRatings = [...allRatings, ...historyRatings];
    }

    console.log('All ratings combined:', allRatings);
    setRatings(allRatings);

    // Calculate stats
    if (allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;
      const rehireCount = allRatings.filter(r => r.would_rehire).length;
      const rehireRate = (rehireCount / allRatings.length) * 100;

      setStats({
        avgRating,
        totalJobs: allRatings.length,
        rehireRate,
      });
    } else {
      console.log('No ratings or job history found');
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Work History</Text>
      </View>

      <ScrollView>
        {/* Worker Summary */}
        {worker && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: worker.photo || 'https://via.placeholder.com/80' }}
              style={styles.workerPhoto}
            />
            <Text style={[styles.workerName, { color: colors.text }]}>{worker.full_name}</Text>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.avgRating.toFixed(1)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalJobs}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.rehireRate.toFixed(0)}%</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rehire Rate</Text>
              </View>
            </View>

            {/* Rating Breakdown */}
            <View style={styles.breakdown}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>Rating Breakdown</Text>
              {ratings.length > 0 && (
                <>
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Punctuality</Text>
                    <Text style={styles.breakdownValue}>
                      {(ratings.reduce((sum, r) => sum + r.punctuality, 0) / ratings.length).toFixed(1)} ⭐
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Quality</Text>
                    <Text style={styles.breakdownValue}>
                      {(ratings.reduce((sum, r) => sum + r.quality, 0) / ratings.length).toFixed(1)} ⭐
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Communication</Text>
                    <Text style={styles.breakdownValue}>
                      {(ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length).toFixed(1)} ⭐
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews ({ratings.length})</Text>
          
          {ratings.map((rating) => (
            <View key={rating.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewInfo}>
                  <Text style={[styles.employerName, { color: colors.text }]}>
                    {rating.employer?.company_name || rating.employer?.full_name}
                  </Text>
                  <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>
                    {rating.job?.title}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{rating.rating.toFixed(1)} ⭐</Text>
                </View>
              </View>

              <Text style={styles.stars}>{renderStars(rating.rating)}</Text>

              {rating.review_text && (
                <Text style={[styles.reviewText, { color: colors.text }]}>{rating.review_text}</Text>
              )}

              <View style={styles.reviewDetails}>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailLabel}>Punctuality: {rating.punctuality}/5</Text>
                </View>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailLabel}>Quality: {rating.quality}/5</Text>
                </View>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailLabel}>Communication: {rating.communication}/5</Text>
                </View>
              </View>

              {rating.would_rehire && (
                <View style={styles.rehireBadge}>
                  <Text style={styles.rehireText}>✓ Would hire again</Text>
                </View>
              )}

              <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                {new Date(rating.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}

          {ratings.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No reviews yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  summaryCard: { margin: 20, padding: 20, borderRadius: 16, alignItems: 'center' },
  workerPhoto: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  workerName: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#057642' },
  statLabel: { fontSize: 12, marginTop: 4 },
  breakdown: { width: '100%', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  breakdownTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { fontSize: 14 },
  breakdownValue: { fontSize: 14, fontWeight: '600' },
  reviewsSection: { padding: 20, paddingTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  reviewCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewInfo: { flex: 1 },
  employerName: { fontSize: 16, fontWeight: 'bold' },
  jobTitle: { fontSize: 13, marginTop: 2 },
  ratingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B' },
  stars: { fontSize: 16, marginBottom: 8 },
  reviewText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  reviewDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  detailBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  detailLabel: { fontSize: 11, color: '#6B7280' },
  rehireBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  rehireText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  reviewDate: { fontSize: 11, marginTop: 8 },
  emptyState: { padding: 40, borderRadius: 12, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14 },
});
