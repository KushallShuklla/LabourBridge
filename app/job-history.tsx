import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function JobHistoryScreen() {
  const { language } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('job_history')
      .select('*')
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setHistory(data);
      const ratings = data.filter(h => h.rating).map(h => h.rating);
      if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        setAvgRating(avg);
      }
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
        {language === 'hi' ? 'नौकरी का इतिहास' : 'Job History'}
      </Text>

      {avgRating > 0 && (
        <View
          style={{
            backgroundColor: '#E8F5E9',
            padding: 15,
            borderRadius: 8,
            marginBottom: 15,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            {language === 'hi' ? 'औसत रेटिंग' : 'Average Rating'}
          </Text>
          <Text style={{ fontSize: 32, textAlign: 'center', marginTop: 5 }}>
            {avgRating.toFixed(1)} {renderStars(Math.round(avgRating))}
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {language === 'hi' ? `${history.filter(h => h.rating).length} समीक्षाओं पर आधारित` : `Based on ${history.filter(h => h.rating).length} reviews`}
          </Text>
        </View>
      )}

      {history.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          {language === 'hi' ? 'अभी तक कोई नौकरी इतिहास नहीं' : 'No job history yet'}
        </Text>
      ) : (
        <FlatList
          data={history}
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
                {item.job_title}
              </Text>

              {item.work_period && (
                <Text style={{ marginTop: 5 }}>📅 {item.work_period}</Text>
              )}

              {item.rating && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 24 }}>
                    {renderStars(item.rating)}
                  </Text>
                </View>
              )}

              {item.feedback && (
                <View
                  style={{
                    backgroundColor: '#F5F5F5',
                    padding: 10,
                    borderRadius: 6,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontStyle: 'italic' }}>&quot;{item.feedback}&quot;</Text>
                </View>
              )}

              <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                {language === 'hi' ? 'जोड़ा गया:' : 'Added:'} {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
