import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WorkerAnalyticsScreen() {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalApplications: 0,
    appliedCount: 0,
    viewedCount: 0,
    shortlistedCount: 0,
    selectedCount: 0,
    rejectedCount: 0,
    successRate: 0,
    avgRating: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get applications
    const { data: applications } = await supabase
      .from('applications')
      .select('status')
      .eq('worker_id', user.id);

    const totalApplications = applications?.length || 0;
    const appliedCount = applications?.filter(a => a.status === 'Applied').length || 0;
    const viewedCount = applications?.filter(a => a.status === 'Viewed').length || 0;
    const shortlistedCount = applications?.filter(a => a.status === 'Shortlisted').length || 0;
    const selectedCount = applications?.filter(a => a.status === 'Selected').length || 0;
    const rejectedCount = applications?.filter(a => a.status === 'Rejected').length || 0;

    const successRate = totalApplications > 0 
      ? Math.round((selectedCount / totalApplications) * 100) 
      : 0;

    // Get job history
    const { data: history } = await supabase
      .from('job_history')
      .select('rating')
      .eq('worker_id', user.id);

    const totalJobs = history?.length || 0;
    const ratings = history?.filter(h => h.rating).map(h => h.rating) || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    setStats({
      totalApplications,
      appliedCount,
      viewedCount,
      shortlistedCount,
      selectedCount,
      rejectedCount,
      successRate,
      avgRating,
      totalJobs,
    });
  };

  const StatCard = ({ title, value, color, subtitle }: any) => (
    <View
      style={{
        backgroundColor: color,
        padding: 20,
        borderRadius: 8,
        marginBottom: 15,
      }}
    >
      <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
        {value}
      </Text>
      <Text style={{ color: 'white', fontSize: 16, marginTop: 5 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        {language === 'hi' ? 'मेरा विश्लेषण' : 'My Analytics'}
      </Text>

      <StatCard
        title={language === 'hi' ? 'कुल आवेदन' : 'Total Applications'}
        value={stats.totalApplications}
        color="#1E90FF"
      />

      <StatCard
        title={language === 'hi' ? 'सफलता दर' : 'Success Rate'}
        value={`${stats.successRate}%`}
        color="#28A745"
        subtitle={language === 'hi' ? `${stats.totalApplications} में से ${stats.selectedCount} चयनित` : `${stats.selectedCount} selected out of ${stats.totalApplications}`}
      />

      <StatCard
        title={language === 'hi' ? 'औसत रेटिंग' : 'Average Rating'}
        value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) + ' ⭐' : 'N/A'}
        color="#FFC107"
        subtitle={language === 'hi' ? `${stats.totalJobs} पूर्ण नौकरियों पर आधारित` : `Based on ${stats.totalJobs} completed jobs`}
      />

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          {language === 'hi' ? 'आवेदन विवरण' : 'Application Breakdown'}
        </Text>

        <View
          style={{
            backgroundColor: '#F5F5F5',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{language === 'hi' ? '📝 आवेदन किया' : '📝 Applied'}</Text>
            <Text style={{ fontWeight: 'bold' }}>{stats.appliedCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{language === 'hi' ? '👀 देखा गया' : '👀 Viewed'}</Text>
            <Text style={{ fontWeight: 'bold' }}>{stats.viewedCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{language === 'hi' ? '⭐ शॉर्टलिस्ट' : '⭐ Shortlisted'}</Text>
            <Text style={{ fontWeight: 'bold' }}>{stats.shortlistedCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{language === 'hi' ? '✅ चयनित' : '✅ Selected'}</Text>
            <Text style={{ fontWeight: 'bold', color: '#28A745' }}>{stats.selectedCount}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{language === 'hi' ? '❌ अस्वीकृत' : '❌ Rejected'}</Text>
            <Text style={{ fontWeight: 'bold', color: '#DC3545' }}>{stats.rejectedCount}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 10, marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          {language === 'hi' ? 'प्रदर्शन सारांश' : 'Performance Summary'}
        </Text>

        <View
          style={{
            backgroundColor: '#E3F2FD',
            padding: 15,
            borderRadius: 8,
          }}
        >
          <Text style={{ marginBottom: 5 }}>
            {language === 'hi' ? '📊 कुल पूर्ण नौकरियां:' : '📊 Total Jobs Completed:'} <Text style={{ fontWeight: 'bold' }}>{stats.totalJobs}</Text>
          </Text>
          <Text style={{ marginBottom: 5 }}>
            {language === 'hi' ? '🎯 सफलता दर:' : '🎯 Success Rate:'} <Text style={{ fontWeight: 'bold' }}>{stats.successRate}%</Text>
          </Text>
          <Text>
            {language === 'hi' ? '⭐ औसत रेटिंग:' : '⭐ Average Rating:'} <Text style={{ fontWeight: 'bold' }}>
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
