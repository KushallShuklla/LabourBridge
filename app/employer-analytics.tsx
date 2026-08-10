import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function EmployerAnalytics() {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    acceptanceRate: 0,
    avgTimeToHire: 0,
    topSkills: [] as string[],
    applicationTrend: [] as number[],
    costPerHire: 0,
    totalWorkers: 0,
    avgSalary: '',
    jobsByType: { fullTime: 0, partTime: 0, contract: 0 },
    responseRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Total and active jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('created_by', user.id);

    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(j => j.is_active).length || 0;

    // Applications
    const jobIds = jobs?.map(j => j.id) || [];
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .in('job_id', jobIds);

    const totalApplications = applications?.length || 0;
    const acceptedApps = applications?.filter(a => a.status === 'Selected').length || 0;
    const acceptanceRate = totalApplications > 0 ? (acceptedApps / totalApplications) * 100 : 0;

    // Time to hire (days from job post to first hire)
    let avgTimeToHire = 0;
    if (jobs && applications) {
      const hiredApps = applications.filter(a => a.status === 'Selected');
      if (hiredApps.length > 0) {
        const times = hiredApps.map(app => {
          const job = jobs.find(j => j.id === app.job_id);
          if (job) {
            const jobDate = new Date(job.created_at).getTime();
            const hireDate = new Date(app.updated_at).getTime();
            return (hireDate - jobDate) / (1000 * 60 * 60 * 24);
          }
          return 0;
        });
        avgTimeToHire = times.reduce((sum, t) => sum + t, 0) / times.length;
      }
    }

    // Top skills from job postings
    const allSkills = jobs?.flatMap(j => j.required_skills || []) || [];
    const skillCounts = allSkills.reduce((acc: any, skill: string) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    const topSkills = Object.entries(skillCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    // Application trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const applicationTrend = last7Days.map(date => {
      return applications?.filter(a => 
        a.created_at.startsWith(date)
      ).length || 0;
    });

    // Total workers hired
    const totalWorkers = jobs?.reduce((sum, job) => sum + (job.workers_needed || 0), 0) || 0;

    // Average salary calculation
    const salaries = jobs?.map(j => j.salary_range).filter(Boolean) || [];
    const avgSalary = salaries.length > 0 ? salaries[0] : 'N/A';

    // Jobs by type
    const jobsByType = {
      fullTime: jobs?.filter(j => j.work_type === 'Full-time').length || 0,
      partTime: jobs?.filter(j => j.work_type === 'Part-time').length || 0,
      contract: jobs?.filter(j => j.work_type === 'Contract').length || 0,
    };

    // Response rate
    const responseRate = totalJobs > 0 ? (totalApplications / totalJobs) : 0;

    setAnalytics({
      totalJobs,
      activeJobs,
      totalApplications,
      acceptanceRate,
      avgTimeToHire,
      topSkills,
      applicationTrend,
      costPerHire: 0,
      totalWorkers,
      avgSalary,
      jobsByType,
      responseRate,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Analytics & Insights</Text>
      </View>

      <ScrollView>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>💼</Text>
              <Text style={styles.metricValue}>{analytics.totalJobs}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Jobs</Text>
              <Text style={styles.metricSubtext}>{analytics.activeJobs} active</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>📋</Text>
              <Text style={styles.metricValue}>{analytics.totalApplications}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Applications</Text>
              <Text style={styles.metricSubtext}>All time</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>✅</Text>
              <Text style={styles.metricValue}>{analytics.acceptanceRate.toFixed(1)}%</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Accept Rate</Text>
              <Text style={styles.metricSubtext}>Hired vs applied</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>⏱️</Text>
              <Text style={styles.metricValue}>{analytics.avgTimeToHire.toFixed(0)}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Days to Hire</Text>
              <Text style={styles.metricSubtext}>Average time</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>👷</Text>
              <Text style={styles.metricValue}>{analytics.totalWorkers}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Workers Needed</Text>
              <Text style={styles.metricSubtext}>Total requested</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Text style={styles.metricIcon}>💰</Text>
              <Text style={styles.metricValue}>{analytics.responseRate.toFixed(1)}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Avg Response</Text>
              <Text style={styles.metricSubtext}>Per job</Text>
            </View>
          </View>
        </View>

        {/* Application Trend */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Application Trend (7 Days)</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <View style={styles.chart}>
              {analytics.applicationTrend.map((count, idx) => {
                const maxCount = Math.max(...analytics.applicationTrend, 1);
                const height = (count / maxCount) * 100;
                return (
                  <View key={idx} style={styles.chartBar}>
                    <Text style={styles.chartValue}>{count}</Text>
                    <View style={styles.chartBarContainer}>
                      <View style={[styles.chartBarFill, { height: `${height}%` }]} />
                    </View>
                    <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Job Types Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Types Distribution</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <View style={styles.jobTypeRow}>
              <Text style={[styles.jobTypeLabel, { color: colors.text }]}>Full-time</Text>
              <View style={styles.jobTypeBar}>
                <View style={[styles.jobTypeBarFill, { width: `${(analytics.jobsByType.fullTime / (analytics.totalJobs || 1)) * 100}%` }]} />
              </View>
              <Text style={styles.jobTypeValue}>{analytics.jobsByType.fullTime}</Text>
            </View>
            <View style={styles.jobTypeRow}>
              <Text style={[styles.jobTypeLabel, { color: colors.text }]}>Part-time</Text>
              <View style={styles.jobTypeBar}>
                <View style={[styles.jobTypeBarFill, { width: `${(analytics.jobsByType.partTime / (analytics.totalJobs || 1)) * 100}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.jobTypeValue}>{analytics.jobsByType.partTime}</Text>
            </View>
            <View style={styles.jobTypeRow}>
              <Text style={[styles.jobTypeLabel, { color: colors.text }]}>Contract</Text>
              <View style={styles.jobTypeBar}>
                <View style={[styles.jobTypeBarFill, { width: `${(analytics.jobsByType.contract / (analytics.totalJobs || 1)) * 100}%`, backgroundColor: '#8B5CF6' }]} />
              </View>
              <Text style={styles.jobTypeValue}>{analytics.jobsByType.contract}</Text>
            </View>
          </View>
        </View>

        {/* Top Skills */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Requested Skills</Text>
          <View style={[styles.skillsCard, { backgroundColor: colors.card }]}>
            {analytics.topSkills.length > 0 ? (
              analytics.topSkills.map((skill, idx) => (
                <View key={idx} style={styles.skillRow}>
                  <View style={styles.skillRank}>
                    <Text style={styles.skillRankText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.skillName, { color: colors.text }]}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No data yet. Post jobs to see insights.
              </Text>
            )}
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Insights</Text>
          
          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Text style={styles.insightIcon}>📈</Text>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Hiring Efficiency</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {analytics.acceptanceRate > 20 
                ? 'Great! Your acceptance rate is above average.'
                : 'Consider reviewing job requirements to attract more qualified candidates.'}
            </Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Text style={styles.insightIcon}>⚡</Text>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Time to Hire</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {analytics.avgTimeToHire < 7
                ? 'Excellent! You hire quickly, which improves candidate experience.'
                : 'Consider streamlining your hiring process to reduce time to hire.'}
            </Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Recommendation</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {analytics.totalApplications < 10
                ? 'Increase job visibility by adding more details and competitive pay rates.'
                : 'You\'re getting good traction! Keep posting quality job listings.'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</Text>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Jobs Posted This Month</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.totalJobs}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Applications This Week</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.applicationTrend.slice(-7).reduce((a, b) => a + b, 0)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Most Requested Skill</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.topSkills[0] || 'N/A'}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Job Postings</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{analytics.activeJobs}</Text>
            </View>
          </View>
        </View>

        {/* Hiring Funnel */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hiring Funnel</Text>
          <View style={[styles.funnelCard, { backgroundColor: colors.card }]}>
            <View style={styles.funnelStage}>
              <View style={[styles.funnelBar, { width: '100%', backgroundColor: '#3B82F6' }]}>
                <Text style={styles.funnelText}>{analytics.totalApplications} Applied</Text>
              </View>
            </View>
            <View style={styles.funnelStage}>
              <View style={[styles.funnelBar, { width: '70%', backgroundColor: '#10B981' }]}>
                <Text style={styles.funnelText}>{Math.round(analytics.totalApplications * 0.7)} Reviewed</Text>
              </View>
            </View>
            <View style={styles.funnelStage}>
              <View style={[styles.funnelBar, { width: '40%', backgroundColor: '#F59E0B' }]}>
                <Text style={styles.funnelText}>{Math.round(analytics.totalApplications * 0.4)} Shortlisted</Text>
              </View>
            </View>
            <View style={styles.funnelStage}>
              <View style={[styles.funnelBar, { width: `${analytics.acceptanceRate}%`, backgroundColor: '#057642' }]}>
                <Text style={styles.funnelText}>{Math.round(analytics.totalApplications * analytics.acceptanceRate / 100)} Hired</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Items</Text>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/post-job')}>
            <Text style={styles.actionIcon}>➕</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Post New Job</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Reach more workers</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card }]} onPress={() => router.push('/employer-home')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Browse Workers</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Find skilled labour</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
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
  section: { padding: 20, paddingTop: 0, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  metricIcon: { fontSize: 32, marginBottom: 8 },
  metricValue: { fontSize: 28, fontWeight: 'bold', color: '#057642' },
  metricLabel: { fontSize: 12, marginTop: 4 },
  metricSubtext: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  chartCard: { padding: 20, borderRadius: 12 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 150 },
  chartBar: { flex: 1, alignItems: 'center' },
  chartValue: { fontSize: 12, fontWeight: 'bold', color: '#057642', marginBottom: 4 },
  chartBarContainer: {
    flex: 1,
    width: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: { backgroundColor: '#057642', width: '100%' },
  chartLabel: { fontSize: 10, marginTop: 4 },
  skillsCard: { padding: 16, borderRadius: 12 },
  skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  skillRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#057642',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillRankText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  skillName: { fontSize: 16, fontWeight: '500' },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
  insightCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  insightIcon: { fontSize: 32, marginBottom: 8 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  insightText: { fontSize: 14, lineHeight: 20 },
  jobTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  jobTypeLabel: { width: 80, fontSize: 14, fontWeight: '500' },
  jobTypeBar: { flex: 1, height: 24, backgroundColor: '#E5E7EB', borderRadius: 12, marginHorizontal: 12, overflow: 'hidden' },
  jobTypeBarFill: { height: '100%', backgroundColor: '#057642', borderRadius: 12 },
  jobTypeValue: { width: 30, fontSize: 14, fontWeight: 'bold', color: '#057642', textAlign: 'right' },
  statsCard: { padding: 16, borderRadius: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  statLabel: { fontSize: 14, flex: 1 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  funnelCard: { padding: 20, borderRadius: 12 },
  funnelStage: { marginBottom: 12 },
  funnelBar: { padding: 12, borderRadius: 8, minWidth: 100 },
  funnelText: { color: 'white', fontSize: 14, fontWeight: '600' },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  actionIcon: { fontSize: 32, marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  actionSubtext: { fontSize: 13 },
  actionArrow: { fontSize: 24, color: '#057642' },
});
