import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';

export default function BookmarkedJobsScreen() {
  const { language } = useLanguage();
  const t = translations[language];
  const [bookmarkedJobs, setBookmarkedJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookmarkedJobs();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredJobs(bookmarkedJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.city.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredJobs(bookmarkedJobs);
    }
  }, [search, bookmarkedJobs]);

  const fetchBookmarkedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('job_id')
      .eq('worker_id', user.id);

    if (!bookmarks || bookmarks.length === 0) {
      setBookmarkedJobs([]);
      return;
    }

    const jobIds = bookmarks.map(b => b.job_id);
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds);

    setBookmarkedJobs(jobs || []);
    setFilteredJobs(jobs || []);
  };

  const removeBookmark = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('bookmarks')
      .delete()
      .eq('worker_id', user.id)
      .eq('job_id', jobId);

    alert(language === 'hi' ? 'बुकमार्क हटाया गया' : 'Bookmark removed');
    fetchBookmarkedJobs();
  };

  const applyForJob = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      worker_id: user.id,
      status: 'Applied',
    });

    if (error) {
      if (error.code === '23505') {
        alert(language === 'hi' ? 'आप पहले से इस नौकरी के लिए आवेदन कर चुके हैं' : 'You have already applied for this job');
      } else {
        alert(error.message);
      }
    } else {
      alert(language === 'hi' ? 'सफलतापूर्वक आवेदन किया' : 'Applied successfully');
    }
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
        {t.bookmarkedJobs}
      </Text>

      {bookmarkedJobs.length > 0 && (
        <TextInput
          style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}
          placeholder={language === 'hi' ? 'सहेजी गई नौकरियां खोजें...' : 'Search bookmarked jobs...'}
          value={search}
          onChangeText={setSearch}
        />
      )}

      {filteredJobs.length === 0 && bookmarkedJobs.length > 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          {t.noJobsFound}
        </Text>
      ) : bookmarkedJobs.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          {t.noBookmarkedJobs}
        </Text>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {item.title}
              </Text>
              <Text style={{ marginTop: 5 }}>{item.description}</Text>
              <Text style={{ marginTop: 5, fontWeight: 'bold' }}>
                📍 {item.city}{item.area ? `, ${item.area}` : ''}
              </Text>
              {item.salary_range && <Text>💰 {item.salary_range}</Text>}
              {item.required_skills?.length > 0 && (
                <Text>🔧 {item.required_skills.join(', ')}</Text>
              )}

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => applyForJob(item.id)}
                  style={{
                    flex: 1,
                    backgroundColor: '#1E90FF',
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>{t.apply}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeBookmark(item.id)}
                  style={{
                    backgroundColor: '#DC3545',
                    padding: 8,
                    borderRadius: 4,
                    paddingHorizontal: 15,
                  }}
                >
                  <Text style={{ color: 'white' }}>{t.remove}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
