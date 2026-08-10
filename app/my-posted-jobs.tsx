import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyPostedJobsScreen() {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredJobs(jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.city.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredJobs(jobs);
    }
  }, [search, jobs]);

  const fetchMyJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    setJobs(data || []);
    setFilteredJobs(data || []);
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !currentStatus })
      .eq('id', jobId);

    if (error) {
      alert(error.message);
    } else {
      alert(currentStatus ? 'Job marked as closed' : 'Job marked as active');
      fetchMyJobs();
    }
  };

  const deleteJob = async (jobId: string) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This will also delete all applications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('jobs')
              .delete()
              .eq('id', jobId);

            if (error) {
              alert(error.message);
            } else {
              alert('Job deleted');
              fetchMyJobs();
            }
          },
        },
      ]
    );
  };

  const getApplicationCount = (job: any) => {
    return job.applications?.[0]?.count || 0;
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
        {language === 'hi' ? 'मेरी पोस्ट की गई नौकरियां' : 'My Posted Jobs'}
      </Text>

      {jobs.length > 0 && (
        <TextInput
          style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' }}
          placeholder={language === 'hi' ? 'अपनी पोस्ट की गई नौकरियां खोजें...' : 'Search your posted jobs...'}
          value={search}
          onChangeText={setSearch}
        />
      )}

      {filteredJobs.length === 0 && jobs.length > 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          No jobs match your search
        </Text>
      ) : jobs.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          No jobs posted yet
        </Text>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isExpired = new Date(item.expiry_date) < new Date();
            const appCount = getApplicationCount(item);

            return (
              <View
                style={{
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 10,
                  backgroundColor: item.is_active ? 'white' : '#F5F5F5',
                  borderColor: isExpired ? '#DC3545' : '#E0E0E0',
                  borderWidth: isExpired ? 2 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1 }}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View
                      style={{
                        backgroundColor: item.is_active ? '#28A745' : '#6C757D',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>
                        {item.is_active ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'बंद' : 'Closed')}
                      </Text>
                    </View>
                    {isExpired && (
                      <View style={{ backgroundColor: '#DC3545', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                        <Text style={{ color: 'white', fontSize: 12 }}>{language === 'hi' ? 'समाप्त' : 'Expired'}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={{ marginTop: 5 }}>{item.description}</Text>

                <Text style={{ marginTop: 5, fontWeight: 'bold' }}>
                  📍 {item.city}{item.area ? `, ${item.area}` : ''}
                </Text>

                {item.salary_range && <Text>💰 {item.salary_range}</Text>}

                {item.required_skills?.length > 0 && (
                  <Text>🔧 {item.required_skills.join(', ')}</Text>
                )}

                {item.workers_needed && (
                  <Text>👷 {item.workers_needed} {language === 'hi' ? 'मजदूर चाहिए' : 'workers needed'}</Text>
                )}

                {item.work_type && (
                  <Text>💼 {item.work_type}</Text>
                )}

                {item.duration && (
                  <Text>⏱️ {language === 'hi' ? 'अवधि' : 'Duration'}: {item.duration}</Text>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    Posted: {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isExpired ? '#DC3545' : '#666',
                    }}
                  >
                    Expires: {new Date(item.expiry_date).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#E3F2FD',
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    📊 {appCount} {language === 'hi' ? 'आवेदन' : 'Application'}{appCount !== 1 ? 's' : ''}
                  </Text>
                </View>

                {isExpired && (
                  <View style={{ backgroundColor: '#FFF3CD', padding: 8, borderRadius: 4, marginTop: 8 }}>
                    <Text style={{ textAlign: 'center', color: '#856404', fontSize: 12 }}>
                      ⚠️ {language === 'hi' ? 'यह नौकरी समाप्त हो गई है' : 'This job has expired'}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {appCount > 0 && (
                    <TouchableOpacity
                      onPress={() => {/* Navigate to applications */}}
                      style={{
                        flex: 1,
                        backgroundColor: '#007BFF',
                        padding: 8,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: 'white', textAlign: 'center', fontSize: 13 }}>
                        {language === 'hi' ? 'आवेदन देखें' : 'View Apps'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => toggleJobStatus(item.id, item.is_active)}
                    style={{
                      flex: 1,
                      backgroundColor: item.is_active ? '#FFC107' : '#28A745',
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 13 }}>
                      {item.is_active ? (language === 'hi' ? 'बंद करें' : 'Mark Closed') : (language === 'hi' ? 'सक्रिय करें' : 'Mark Active')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteJob(item.id)}
                    style={{
                      backgroundColor: '#DC3545',
                      padding: 8,
                      borderRadius: 4,
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 13 }}>{language === 'hi' ? 'हटाएं' : 'Delete'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
