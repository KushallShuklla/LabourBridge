import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';

export default function CommunitiesScreen() {
  const { language } = useLanguage();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'general' });

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
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Community created!');
      setShowCreateForm(false);
      setNewCommunity({ name: '', description: '', category: 'general' });
      fetchCommunities();
      fetchMyMemberships();
    }
  };

  const joinCommunity = async (communityId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      worker_id: user.id,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
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

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchCommunities();
      fetchMyMemberships();
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        {language === 'hi' ? '👥 समुदाय' : '👥 Communities'}
      </Text>

      <Text style={{ color: '#666', marginBottom: 15 }}>
        {language === 'hi' ? 'अन्य मजदूरों से जुड़ें और नौकरी की जानकारी साझा करें' : 'Connect with other workers and share job information'}
      </Text>

      <TouchableOpacity
        onPress={() => setShowCreateForm(!showCreateForm)}
        style={{
          backgroundColor: '#1E90FF',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {showCreateForm ? (language === 'hi' ? '✕ रद्द करें' : '✕ Cancel') : (language === 'hi' ? '+ नया समुदाय बनाएं' : '+ Create New Community')}
        </Text>
      </TouchableOpacity>

      {showCreateForm && (
        <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            {language === 'hi' ? 'नया समुदाय बनाएं' : 'Create New Community'}
          </Text>

          <TextInput
            placeholder={language === 'hi' ? 'समुदाय का नाम' : 'Community Name'}
            value={newCommunity.name}
            onChangeText={(text) => setNewCommunity({ ...newCommunity, name: text })}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 10,
              borderRadius: 6,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder={language === 'hi' ? 'विवरण' : 'Description'}
            value={newCommunity.description}
            onChangeText={(text) => setNewCommunity({ ...newCommunity, description: text })}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 10,
              borderRadius: 6,
              marginBottom: 10,
            }}
          />

          <Text style={{ marginBottom: 5, fontWeight: '600' }}>
            {language === 'hi' ? 'श्रेणी' : 'Category'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
            {['general', 'skill-based', 'location-based', 'job-sharing'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setNewCommunity({ ...newCommunity, category: cat })}
                style={{
                  backgroundColor: newCommunity.category === cat ? '#1E90FF' : '#e0e0e0',
                  padding: 8,
                  borderRadius: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: newCommunity.category === cat ? 'white' : '#333', fontSize: 12 }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={createCommunity}
            style={{
              backgroundColor: '#28A745',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {language === 'hi' ? 'बनाएं' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
        {language === 'hi' ? 'सभी समुदाय' : 'All Communities'}
      </Text>

      {communities.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
          {language === 'hi' ? 'अभी तक कोई समुदाय नहीं' : 'No communities yet'}
        </Text>
      ) : (
        communities.map((community) => {
          const isMember = myMemberships.has(community.id);
          return (
            <View
              key={community.id}
              style={{
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 8,
                marginBottom: 15,
                borderLeftWidth: 4,
                borderLeftColor: isMember ? '#28A745' : '#1E90FF',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
                    {community.name}
                  </Text>
                  {community.description && (
                    <Text style={{ color: '#666', marginBottom: 8 }}>
                      {community.description}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ backgroundColor: '#e0e0e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 }}>
                      <Text style={{ fontSize: 12, color: '#333' }}>{community.category}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      👥 {community.member_count} {language === 'hi' ? 'सदस्य' : 'members'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {isMember ? (
                  <>
                    <TouchableOpacity
                      onPress={() => router.push(`/community-chat?id=${community.id}&name=${encodeURIComponent(community.name)}`)}
                      style={{
                        flex: 1,
                        backgroundColor: '#1E90FF',
                        padding: 10,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                        {language === 'hi' ? '💬 खोलें' : '💬 Open'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => leaveCommunity(community.id)}
                      style={{
                        backgroundColor: '#DC3545',
                        padding: 10,
                        borderRadius: 6,
                        paddingHorizontal: 15,
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {language === 'hi' ? 'छोड़ें' : 'Leave'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => joinCommunity(community.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#28A745',
                      padding: 10,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                      {language === 'hi' ? '+ शामिल हों' : '+ Join'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
