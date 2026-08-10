import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function CommunityChatScreen() {
  const { language } = useLanguage();
  const { id, name } = useLocalSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
    
    // Subscribe to new posts
    const subscription = supabase
      .channel('community_posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts', filter: `community_id=eq.${id}` },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('community_id', id)
      .order('created_at', { ascending: false });

    // Fetch worker and job details separately
    if (data) {
      const postsWithDetails = await Promise.all(
        data.map(async (post) => {
          const [workerData, jobData] = await Promise.all([
            supabase.from('worker_profiles').select('full_name').eq('id', post.worker_id).single(),
            post.job_id ? supabase.from('jobs').select('title, city, salary_range').eq('id', post.job_id).single() : null,
          ]);
          
          return {
            ...post,
            worker: workerData.data,
            job: jobData?.data,
          };
        })
      );
      setPosts(postsWithDetails);
    } else {
      setPosts([]);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('community_posts').insert({
      community_id: id,
      worker_id: user.id,
      content: newPost,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setNewPost('');
      fetchPosts();
    }
  };

  const deletePost = async (postId: string) => {
    const confirmed = typeof window !== 'undefined' && window.confirm 
      ? window.confirm('Delete this post?')
      : true;
    
    if (!confirmed) return;

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchPosts();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#1E90FF', padding: 15 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'white', marginBottom: 5 }}>← {language === 'hi' ? 'वापस' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          {decodeURIComponent(name as string)}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 15 }}>
        {posts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
            {language === 'hi' ? 'अभी तक कोई पोस्ट नहीं। पहले बनें!' : 'No posts yet. Be the first!'}
          </Text>
        ) : (
          posts.map((post) => (
            <View
              key={post.id}
              style={{
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 8,
                marginBottom: 15,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {post.worker?.full_name || 'Worker'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {new Date(post.created_at).toLocaleString()}
                  </Text>
                </View>
                {post.worker_id === currentUserId && (
                  <TouchableOpacity onPress={() => deletePost(post.id)}>
                    <Text style={{ color: '#DC3545', fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={{ fontSize: 15, marginBottom: 10 }}>{post.content}</Text>

              {post.job && (
                <TouchableOpacity
                  onPress={() => router.push(`/job-details?id=${post.job_id}`)}
                  style={{
                    backgroundColor: '#e3f2fd',
                    padding: 10,
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: '#1E90FF',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>
                    💼 {post.job.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    📍 {post.job.city} • 💰 {post.job.salary_range}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#1E90FF', marginTop: 5 }}>
                    {language === 'hi' ? 'विवरण देखें →' : 'View Details →'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ backgroundColor: 'white', padding: 15, borderTopWidth: 1, borderTopColor: '#ddd' }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            placeholder={language === 'hi' ? 'अपना संदेश लिखें...' : 'Write your message...'}
            value={newPost}
            onChangeText={setNewPost}
            multiline
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 10,
              borderRadius: 8,
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={createPost}
            disabled={!newPost.trim()}
            style={{
              backgroundColor: newPost.trim() ? '#1E90FF' : '#ccc',
              padding: 15,
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
