import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';

export default function CommunitiesTab() {
  const { language } = useLanguage();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'general', maxMembers: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCommunities();
    fetchMyMemberships();
  }, []);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });
    setCommunities(data || []);
  };

  const fetchMyMemberships = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('worker_id', user.id);

    setMyMemberships(new Set(data?.map(m => m.community_id) || []));
  };

  const createCommunity = async () => {
    if (!newCommunity.name.trim()) {
      Alert.alert('Error', 'Community name is required');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('communities').insert({
      name: newCommunity.name,
      description: newCommunity.description,
      category: newCommunity.category,
      created_by: user.id,
      max_members: newCommunity.maxMembers ? parseInt(newCommunity.maxMembers) : null,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Community created!');
      setShowCreateForm(false);
      setNewCommunity({ name: '', description: '', category: 'general', maxMembers: '' });
      fetchCommunities();
      fetchMyMemberships();
    }
  };

  const joinCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const community = communities.find(c => c.id === communityId);
    if (community?.max_members && community.member_count >= community.max_members) {
      Alert.alert('Full', 'This community has reached its member limit');
      return;
    }

    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      worker_id: user.id,
    });

    if (!error) {
      fetchCommunities();
      fetchMyMemberships();
    }
  };

  const leaveCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('worker_id', user.id);

    if (!error) {
      fetchCommunities();
      fetchMyMemberships();
    }
  };

  const getFilteredCommunities = () => {
    if (filter === 'my') return communities.filter(c => myMemberships.has(c.id));
    return communities;
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'skill-based': return '🔧';
      case 'location-based': return '📍';
      case 'job-sharing': return '💼';
      default: return '💬';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A66C2', '#004182']} style={styles.header}>
        <Text style={styles.headerTitle}>👥 Communities</Text>
        <Text style={styles.headerSubtitle}>Connect with fellow workers</Text>
      </LinearGradient>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'my' && styles.filterBtnActive]}
          onPress={() => setFilter('my')}
        >
          <Text style={[styles.filterText, filter === 'my' && styles.filterTextActive]}>My Communities</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          onPress={() => setShowCreateForm(!showCreateForm)}
          style={styles.createBtn}
        >
          <LinearGradient colors={['#0A66C2', '#004182']} style={styles.createGradient}>
            <Text style={styles.createBtnText}>
              {showCreateForm ? '✕ Cancel' : '+ Create Community'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {showCreateForm && (
          <View style={styles.createForm}>
            <TextInput
              placeholder="Community Name"
              value={newCommunity.name}
              onChangeText={(text) => setNewCommunity({ ...newCommunity, name: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={newCommunity.description}
              onChangeText={(text) => setNewCommunity({ ...newCommunity, description: text })}
              multiline
              style={[styles.input, styles.textArea]}
            />
            <TextInput
              placeholder="Max Members (leave empty for unlimited)"
              value={newCommunity.maxMembers}
              onChangeText={(text) => setNewCommunity({ ...newCommunity, maxMembers: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.categoryRow}>
              {['general', 'skill-based', 'location-based', 'job-sharing'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewCommunity({ ...newCommunity, category: cat })}
                  style={[styles.categoryChip, newCommunity.category === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryText, newCommunity.category === cat && styles.categoryTextActive]}>
                    {cat.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={createCommunity} style={styles.submitBtn}>
              <Text style={styles.submitText}>Create</Text>
            </TouchableOpacity>
          </View>
        )}

        {getFilteredCommunities().map((community) => {
          const isMember = myMemberships.has(community.id);
          return (
            <View key={community.id} style={[styles.card, isMember && styles.cardMember]}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(community.category)}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{community.name}</Text>
                  <Text style={styles.cardMeta}>
                    👥 {community.member_count}{community.max_members ? `/${community.max_members}` : ''} members • {community.category}
                  </Text>
                </View>
              </View>
              
              {community.description && (
                <Text style={styles.cardDesc}>{community.description}</Text>
              )}

              <View style={styles.cardActions}>
                {isMember ? (
                  <>
                    <TouchableOpacity
                      onPress={() => router.push(`/community-chat?id=${community.id}&name=${encodeURIComponent(community.name)}`)}
                      style={styles.openBtn}
                    >
                      <Text style={styles.openBtnText}>💬 Open Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => leaveCommunity(community.id)}
                      style={styles.leaveBtn}
                    >
                      <Text style={styles.leaveBtnText}>Leave</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => joinCommunity(community.id)}
                    style={[styles.joinBtn, community.max_members && community.member_count >= community.max_members && styles.joinBtnDisabled]}
                    disabled={community.max_members && community.member_count >= community.max_members}
                  >
                    <Text style={styles.joinBtnText}>
                      {community.max_members && community.member_count >= community.max_members ? '🔒 Full' : '+ Join'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  filterRow: { flexDirection: 'row', padding: 15, gap: 10 },
  filterBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: 'white', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#0A66C2' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: 'white' },
  content: { flex: 1, padding: 15 },
  createBtn: { marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  createGradient: { padding: 15, alignItems: 'center' },
  createBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  createForm: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  categoryChipActive: { backgroundColor: '#0A66C2' },
  categoryText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  categoryTextActive: { color: 'white' },
  submitBtn: { backgroundColor: '#28A745', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardMember: { borderLeftWidth: 4, borderLeftColor: '#28A745' },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  categoryIcon: { fontSize: 32, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#666' },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  cardActions: { flexDirection: 'row', gap: 10 },
  openBtn: { flex: 1, backgroundColor: '#0A66C2', padding: 12, borderRadius: 8, alignItems: 'center' },
  openBtnText: { color: 'white', fontWeight: '600' },
  leaveBtn: { backgroundColor: '#DC3545', padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  leaveBtnText: { color: 'white', fontWeight: '600' },
  joinBtn: { flex: 1, backgroundColor: '#28A745', padding: 12, borderRadius: 8, alignItems: 'center' },
  joinBtnDisabled: { backgroundColor: '#9CA3AF' },
  joinBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
