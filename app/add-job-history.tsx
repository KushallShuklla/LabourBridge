import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function AddJobHistoryScreen() {
  const { workerId, workerName } = useLocalSearchParams();
  const [jobTitle, setJobTitle] = useState('');
  const [workPeriod, setWorkPeriod] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const addHistory = async () => {
    if (!jobTitle || rating === 0) {
      Alert.alert('Error', 'Please fill job title and rating');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('job_history').insert({
      worker_id: workerId,
      employer_id: user.id,
      job_title: jobTitle,
      work_period: workPeriod,
      rating,
      feedback,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Job history added');
      router.back();
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Add Job History for {workerName}
      </Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Job Title *</Text>
      <TextInput
        value={jobTitle}
        onChangeText={setJobTitle}
        placeholder="e.g., Plumbing Work"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Work Period</Text>
      <TextInput
        value={workPeriod}
        onChangeText={setWorkPeriod}
        placeholder="e.g., 2 weeks"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Rating *</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={{
              padding: 10,
              backgroundColor: rating >= star ? '#FFC107' : '#E0E0E0',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 24 }}>{rating >= star ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Feedback</Text>
      <TextInput
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Write your feedback..."
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 6, height: 100 }}
      />

      <TouchableOpacity
        onPress={addHistory}
        style={{
          backgroundColor: '#28A745',
          padding: 14,
          borderRadius: 6,
          marginBottom: 30,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          Add Job History
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
