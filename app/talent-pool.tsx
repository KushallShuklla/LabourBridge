import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TalentPool() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [workers, setWorkers] = useState<any[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ skill: '', location: '', minRating: 0, minExperience: 0 });
  const [sortBy, setSortBy] = useState('recent'); // recent, rating, experience

  useEffect(() => {
    loadWorkers();
    loadSavedWorkers();
  }, [search, filters, sortBy]);

  const loadWorkers = async () => {
    let query = supabase
      .from('worker_profiles')
      .select('*');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,skills.cs.{${search}}`);
    }

    const { data } = await query;
    if (data) {
      // Get ratings from both worker_ratings and job_history tables
      const workerIds = data.map(w => w.id);
      
      const [ratingsResult, historyResult] = await Promise.all([
        supabase.from('worker_ratings').select('worker_id, rating').in('worker_id', workerIds),
        supabase.from('job_history').select('worker_id, rating').in('worker_id', workerIds)
      ]);

      let workersWithRatings = data.map(worker => {
        // Combine ratings from both tables
        const workerRatings = ratingsResult.data?.filter(r => r.worker_id === worker.id) || [];
        const historyRatings = historyResult.data?.filter(h => h.worker_id === worker.id && h.rating) || [];
        const allRatings = [...workerRatings.map(r => r.rating), ...historyRatings.map(h => h.rating)];
        
        return {
          ...worker,
          user_id: worker.id,
          avgRating: allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
            : 0,
          totalRatings: allRatings.length,
        };
      });

      // Apply filters
      if (filters.location) {
        workersWithRatings = workersWithRatings.filter(w => w.city?.toLowerCase().includes(filters.location.toLowerCase()) || w.area?.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.skill) {
        workersWithRatings = workersWithRatings.filter(w => w.skills?.includes(filters.skill));
      }
      if (filters.minRating > 0) {
        workersWithRatings = workersWithRatings.filter(w => w.avgRating >= filters.minRating);
      }
      if (filters.minExperience > 0) {
        workersWithRatings = workersWithRatings.filter(w => (w.experience_years || 0) >= filters.minExperience);
      }

      // Apply sorting
      if (sortBy === 'rating') {
        workersWithRatings.sort((a, b) => b.avgRating - a.avgRating);
      } else if (sortBy === 'experience') {
        workersWithRatings.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
      }

      setWorkers(workersWithRatings);
    }
  };

  const loadSavedWorkers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('saved_workers')
      .select('worker_id')
      .eq('employer_id', user.id);

    if (data) {
      setSavedWorkers(new Set(data.map(s => s.worker_id)));
    }
  };

  const toggleSaveWorker = async (workerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (savedWorkers.has(workerId)) {
      await supabase
        .from('saved_workers')
        .delete()
        .eq('employer_id', user.id)
        .eq('worker_id', workerId);
      setSavedWorkers(prev => {
        const next = new Set(prev);
        next.delete(workerId);
        return next;
      });
    } else {
      await supabase
        .from('saved_workers')
        .insert({ employer_id: user.id, worker_id: workerId });
      setSavedWorkers(prev => new Set(prev).add(workerId));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{language === 'hi' ? '← वापस' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{language === 'hi' ? 'प्रतिभा पूल' : 'Talent Pool'}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {workers.length} {language === 'hi' ? 'मजदूर उपलब्ध' : 'workers available'}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder={language === 'hi' ? 'नाम या कौशल से खोजें...' : 'Search by name or skills...'}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Sort Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>{language === 'hi' ? 'क्रमबद्ध करें:' : 'Sort:'}</Text>
          <TouchableOpacity
            onPress={() => setSortBy('recent')}
            style={[styles.filterChip, sortBy === 'recent' && styles.filterChipActive, { backgroundColor: sortBy === 'recent' ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, sortBy === 'recent' && { color: 'white' }]}>{language === 'hi' ? 'नवीनतम' : 'Recent'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('rating')}
            style={[styles.filterChip, sortBy === 'rating' && styles.filterChipActive, { backgroundColor: sortBy === 'rating' ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, sortBy === 'rating' && { color: 'white' }]}>{language === 'hi' ? 'शीर्ष रेटेड' : 'Top Rated'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('experience')}
            style={[styles.filterChip, sortBy === 'experience' && styles.filterChipActive, { backgroundColor: sortBy === 'experience' ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, sortBy === 'experience' && { color: 'white' }]}>{language === 'hi' ? 'अनुभव' : 'Experience'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Experience Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Experience:</Text>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minExperience: 0 })}
            style={[styles.filterChip, filters.minExperience === 0 && styles.filterChipActive, { backgroundColor: filters.minExperience === 0 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minExperience === 0 && { color: 'white' }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minExperience: 2 })}
            style={[styles.filterChip, filters.minExperience === 2 && styles.filterChipActive, { backgroundColor: filters.minExperience === 2 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minExperience === 2 && { color: 'white' }]}>2+ Years</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minExperience: 5 })}
            style={[styles.filterChip, filters.minExperience === 5 && styles.filterChipActive, { backgroundColor: filters.minExperience === 5 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minExperience === 5 && { color: 'white' }]}>5+ Years</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rating Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Rating:</Text>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minRating: 0 })}
            style={[styles.filterChip, filters.minRating === 0 && styles.filterChipActive, { backgroundColor: filters.minRating === 0 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minRating === 0 && { color: 'white' }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minRating: 3 })}
            style={[styles.filterChip, filters.minRating === 3 && styles.filterChipActive, { backgroundColor: filters.minRating === 3 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minRating === 3 && { color: 'white' }]}>⭐ 3+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilters({ ...filters, minRating: 4 })}
            style={[styles.filterChip, filters.minRating === 4 && styles.filterChipActive, { backgroundColor: filters.minRating === 4 ? '#057642' : colors.card }]}
          >
            <Text style={[styles.filterText, filters.minRating === 4 && { color: 'white' }]}>⭐ 4+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          {['Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter', 'Welder', 'Driver', 'Helper', 'Cleaner', 'Gardener', 'Mechanic', 'Tailor', 'Cook', 'Security Guard', 'Delivery Boy', 'Warehouse Worker', 'Construction Worker', 'AC Technician', 'Tiler', 'Fabricator'].map(skill => (
            <TouchableOpacity
              key={skill}
              onPress={() => setFilters({ ...filters, skill: filters.skill === skill ? '' : skill })}
              style={[
                styles.filterChip,
                filters.skill === skill && styles.filterChipActive,
                { backgroundColor: filters.skill === skill ? '#057642' : colors.card }
              ]}
            >
              <Text style={[styles.filterText, filters.skill === skill && { color: 'white' }]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Workers List */}
      {workers.map(worker => (
        <View key={worker.id} style={[styles.workerCard, { backgroundColor: colors.card }]}>
          <View style={styles.workerHeader}>
            {worker.photo_url ? (
              <Image
                source={{ uri: worker.photo_url }}
                style={styles.workerPhoto}
              />
            ) : (
              <View style={[styles.workerPhoto, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6B7280' }}>
                  {worker.full_name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.workerInfo}>
              <Text style={[styles.workerName, { color: colors.text }]}>{worker.full_name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {worker.avgRating.toFixed(1)}</Text>
                <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
                  ({worker.totalRatings} reviews)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleSaveWorker(worker.id)}>
              <Text style={styles.saveIcon}>{savedWorkers.has(worker.id) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {/* Skills */}
          {worker.skills && (
            <View style={styles.skillsContainer}>
              {worker.skills.slice(0, 3).map((skill: string, idx: number) => (
                <View key={idx} style={[styles.skillBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Location & Experience */}
          <View style={styles.workerDetails}>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              📍 {worker.city || 'Location not set'}
            </Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              💼 {worker.experience_years || 0} years exp
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => router.push(`/worker-profile-view?id=${worker.id}`)}
              style={[styles.actionButton, { backgroundColor: colors.background }]}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/worker-history?id=${worker.id}`)}
              style={styles.actionButtonPrimary}
            >
              <Text style={styles.actionButtonTextPrimary}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
  searchInput: { padding: 16, borderRadius: 12, fontSize: 16 },
  sortScroll: { marginBottom: 10 },
  filterScroll: { marginBottom: 10 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterLabel: { fontSize: 13, fontWeight: '600', marginRight: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterChipActive: { backgroundColor: '#057642' },
  filterText: { fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  workerCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  workerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  workerPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 18, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  ratingCount: { fontSize: 12, marginLeft: 4 },
  saveIcon: { fontSize: 24 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  skillText: { fontSize: 12, fontWeight: '500' },
  workerDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailText: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  actionButtonPrimary: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#057642' },
  actionButtonTextPrimary: { fontSize: 14, fontWeight: '600', color: 'white' },
});
