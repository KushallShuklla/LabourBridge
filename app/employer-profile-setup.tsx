import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function EmployerProfileSetup() {
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCompanyName(data.company_name || '');
      setCompanyLogo(data.company_logo || '');
      setIndustry(data.industry || '');
      setCompanySize(data.company_size || '');
      setWebsite(data.website || '');
      setDescription(data.description || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setZipCode(data.zip_code || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setCompanyNumber(data.company_number || '');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      // On web, ensure we have a valid URI
      if (Platform.OS === 'web') {
        setCompanyLogo(uri);
      } else {
        setCompanyLogo(uri);
      }
    }
  };

  const saveProfile = async () => {
    try {
      console.log('=== SAVE PROFILE START ===');
      
      if (!companyName || !phone) {
        Alert.alert('Error', 'Please fill company name and phone');
        return;
      }

      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('ERROR: No user found');
        Alert.alert('Error', 'Not logged in');
        setSaving(false);
        return;
      }

      console.log('User ID:', user.id);

      // Profile data with all fields
      const profileData: any = {
        user_id: user.id,
        company_name: companyName,
        phone: phone,
        company_logo: companyLogo || null,
        industry: industry || null,
        company_size: companySize || null,
        website: website || null,
        description: description || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zipCode || null,
        email: email || null,
        company_number: companyNumber || null,
      };

      console.log('Profile data:', profileData);

      // Check if exists
      console.log('Checking if profile exists...');
      const { data: existing, error: checkError } = await supabase
        .from('employer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.log('Check error:', checkError);
      }
      console.log('Existing profile:', existing);

      let error;
      if (existing) {
        console.log('Updating existing profile...');
        const result = await supabase
          .from('employer_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = result.error;
        console.log('Update result:', result);
      } else {
        console.log('Inserting new profile...');
        const result = await supabase
          .from('employer_profiles')
          .insert(profileData);
        error = result.error;
        console.log('Insert result:', result);
      }

      setSaving(false);

      if (error) {
        console.log('SAVE ERROR:', error);
        Alert.alert('Error', error.message);
      } else {
        console.log('SUCCESS: Profile saved');
        Alert.alert('Success', 'Profile saved successfully');
        router.back();
      }
    } catch (err: any) {
      console.log('EXCEPTION:', err);
      Alert.alert('Error', err.message);
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Company Profile</Text>
      </View>

      {/* Logo Upload */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Company Logo</Text>
        <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
          {companyLogo ? (
            <Image 
              source={{ uri: companyLogo }} 
              style={styles.logo}
              onError={(e) => {
                console.log('Image load error:', e.nativeEvent.error);
                setCompanyLogo('');
              }}
            />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.border }]}>
              <Text style={styles.logoText}>📷</Text>
              <Text style={[styles.logoSubtext, { color: colors.textSecondary }]}>Upload Logo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Company Info */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Company Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Enter company name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Industry</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={industry}
          onChangeText={setIndustry}
          placeholder="e.g., Construction, Manufacturing"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Company Size</Text>
        <View style={styles.chipContainer}>
          {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => setCompanySize(size)}
              style={[
                styles.chip,
                companySize === size && styles.chipActive,
                { backgroundColor: companySize === size ? '#057642' : colors.card }
              ]}
            >
              <Text style={[styles.chipText, companySize === size && styles.chipTextActive]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Phone *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="company@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Company Registration Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={companyNumber}
          onChangeText={setCompanyNumber}
          placeholder="Registration/License number"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Website</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={website}
          onChangeText={setWebsite}
          placeholder="https://company.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="url"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell workers about your company..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Street address"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.flex1]}>
          <Text style={[styles.label, { color: colors.text }]}>City</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={[styles.section, styles.flex1]}>
          <Text style={[styles.label, { color: colors.text }]}>State</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="12345"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        onPress={saveProfile}
        disabled={saving}
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  backButton: { fontSize: 16, color: '#057642', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  section: { padding: 20, paddingTop: 0 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  logoContainer: { alignItems: 'center', marginTop: 10 },
  logo: { width: 120, height: 120, borderRadius: 60 },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { fontSize: 40 },
  logoSubtext: { fontSize: 12, marginTop: 4 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipActive: { backgroundColor: '#057642' },
  chipText: { fontSize: 14, color: '#666' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  saveButton: {
    margin: 20,
    backgroundColor: '#057642',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
