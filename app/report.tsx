import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function ReportScreen() {
  const { type, id, name } = useLocalSearchParams();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reasons = type === 'user'
    ? ['Fake Profile', 'Inappropriate Behavior', 'Spam', 'Fraud', 'Other']
    : ['Fake Job', 'Misleading Information', 'Spam', 'Inappropriate Content', 'Other'];

  const submitReport = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reportData: any = {
      reporter_id: user.id,
      report_type: type,
      reason,
      description,
      status: 'pending',
    };

    if (type === 'user') {
      reportData.reported_user_id = id;
    } else {
      reportData.reported_job_id = id;
    }

    const { error } = await supabase.from('reports').insert(reportData);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Report submitted. Admin will review it.');
      router.back();
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Report {type === 'user' ? 'User' : 'Job'}
      </Text>

      <Text style={{ marginBottom: 20, color: '#666' }}>
        Reporting: {name}
      </Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
        Select Reason *
      </Text>

      {reasons.map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => setReason(r)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderWidth: 1,
            borderColor: reason === r ? '#1E90FF' : '#E0E0E0',
            backgroundColor: reason === r ? '#E3F2FD' : 'white',
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: reason === r ? '#1E90FF' : '#999',
              backgroundColor: reason === r ? '#1E90FF' : 'white',
              marginRight: 10,
            }}
          />
          <Text>{r}</Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>
        Additional Details (Optional)
      </Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Provide more information..."
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          borderRadius: 6,
          height: 100,
        }}
      />

      <TouchableOpacity
        onPress={submitReport}
        style={{
          backgroundColor: '#DC3545',
          padding: 14,
          borderRadius: 6,
          marginBottom: 30,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          Submit Report
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
