import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const COMMON_SKILLS = [
  'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter',
  'Welder', 'Driver', 'Helper', 'Cleaner', 'Gardener',
  'Mechanic', 'Tailor', 'Cook', 'Security Guard', 'Delivery Boy',
  'Warehouse Worker', 'Construction Worker', 'AC Technician', 'Tiler', 'Fabricator'
];

const getTranslatedSkill = (skill: string, t: any) => {
  const skillMap: any = {
    'Plumber': t('plumber'),
    'Electrician': t('electrician'),
    'Carpenter': t('carpenter'),
    'Mason': t('mason'),
    'Painter': t('painter'),
    'Welder': t('welder'),
    'Driver': t('driver'),
    'Helper': t('helper'),
    'Cleaner': t('cleaner'),
    'Gardener': t('gardener'),
    'Mechanic': t('mechanic'),
    'Tailor': t('tailor'),
    'Cook': t('cook'),
    'Security Guard': t('securityGuard'),
    'Delivery Boy': t('deliveryBoy'),
    'Warehouse Worker': t('warehouseWorker'),
    'Construction Worker': t('constructionWorker'),
    'AC Technician': t('acTechnician'),
    'Tiler': t('tiler'),
    'Fabricator': t('fabricator'),
  };
  return skillMap[skill] || skill;
};

export default function WorkerProfileScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState('Full-time');
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    loadProfile();
    checkVerification();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setArea(data.area || '');
      setBio(data.bio || '');
      setExperienceYears(String(data.experience_years || 0));
      setSelectedSkills(data.skills || []);
      setPhotoUrl(data.photo_url || '');
      setAge(String(data.age || ''));
      setGender(data.gender || '');
      setLanguages(data.languages || []);
      setAvailability(data.availability || 'Full-time');
    }
    setLoading(false);
  };

  const checkVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('verified')
      .eq('id', user.id)
      .single();

    setIsVerified(data?.verified || false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const saveProfile = async () => {
    try {
      console.log('Starting save...');
      
      if (!fullName || !phone || !city || selectedSkills.length === 0) {
        Alert.alert('Error', 'Please fill all required fields and select at least one skill');
        return;
      }

      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        Alert.alert('Error', 'User not authenticated');
        setSaving(false);
        return;
      }

      console.log('User ID:', user.id);

      let finalPhotoUrl = photoUrl;

      // Upload photo to Supabase Storage if it's a local file
      if (photoUrl && (photoUrl.startsWith('file://') || photoUrl.startsWith('content://'))) {
        try {
          console.log('Uploading photo...');
          const fileName = `${user.id}-${Date.now()}.jpg`;
          
          // For web, use fetch. For mobile, use different approach
          const formData = new FormData();
          formData.append('file', {
            uri: photoUrl,
            type: 'image/jpeg',
            name: fileName,
          } as any);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, formData, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(fileName);
            
            finalPhotoUrl = publicUrl;
            console.log('Photo uploaded:', publicUrl);
          }
        } catch (photoError: any) {
          console.error('Photo upload failed:', photoError);
        }
      }

      const profileData = {
        id: user.id,
        full_name: fullName,
        phone,
        city,
        area: area || null,
        bio: bio || null,
        experience_years: parseInt(experienceYears) || 0,
        skills: selectedSkills,
        photo_url: finalPhotoUrl || null,
        age: parseInt(age) || null,
        gender: gender || null,
        languages: languages.length > 0 ? languages : null,
        availability: availability,
        updated_at: new Date().toISOString()
      };

      console.log('Saving profile data:', profileData);

      const { data, error } = await supabase
        .from('worker_profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select();

      console.log('Save response:', { data, error });

      setSaving(false);

      if (error) {
        console.error('Save error:', error);
        Alert.alert('Error', `Failed to save: ${error.message}`);
      } else {
        console.log('Profile saved successfully');
        Alert.alert('Success', 'Profile saved successfully');
        router.back();
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', `Unexpected error: ${err.message}`);
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0A66C2', '#004182']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('myProfile')}</Text>
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ {t('verified')}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Photo Section */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
            </View>
          )}
          <View style={styles.photoEdit}>
            <Text style={styles.photoEditText}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.photoHint, { color: colors.textSecondary }]}>{t('tapToChangePhoto')}</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={language === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'फोन *' : 'Phone *'}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={language === 'hi' ? 'फोन नंबर दर्ज करें' : 'Enter phone number'}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'शहर *' : 'City *'}</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder={language === 'hi' ? 'शहर' : 'City'}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'क्षेत्र' : 'Area'}</Text>
            <TextInput
              value={area}
              onChangeText={setArea}
              placeholder={language === 'hi' ? 'क्षेत्र' : 'Area'}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'अनुभव (वर्ष)' : 'Experience (Years)'}</Text>
          <TextInput
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'उम्र' : 'Age'}</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder={language === 'hi' ? 'उम्र दर्ज करें' : 'Enter age'}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'लिंग' : 'Gender'}</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.genderChip,
                    gender === g && styles.genderChipActive
                  ]}
                >
                  <Text style={[
                    styles.genderText,
                    gender === g && styles.genderTextActive
                  ]}>
                    {language === 'hi' ? (g === 'Male' ? 'पुरुष' : 'महिला') : g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'उपलब्धता' : 'Availability'}</Text>
          <View style={styles.availabilityContainer}>
            {['Full-time', 'Part-time', 'Contract'].map(avail => (
              <TouchableOpacity
                key={avail}
                onPress={() => setAvailability(avail)}
                style={[
                  styles.availChip,
                  availability === avail && styles.availChipActive
                ]}
              >
                <Text style={[
                  styles.availText,
                  availability === avail && styles.availTextActive
                ]}>
                  {language === 'hi' ? (avail === 'Full-time' ? 'पूर्णकालिक' : avail === 'Part-time' ? 'अंशकालिक' : 'अनुबंध') : avail}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'कौशल * (कम से कम एक चुनें)' : 'Skills * (Select at least one)'}</Text>
          <View style={styles.skillsContainer}>
            {COMMON_SKILLS.map(skill => (
              <TouchableOpacity
                key={skill}
                onPress={() => toggleSkill(skill)}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill) && styles.skillChipActive
                ]}
              >
                <Text style={[
                  styles.skillText,
                  selectedSkills.includes(skill) && styles.skillTextActive
                ]}>
                  {getTranslatedSkill(skill, t)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Skill Input */}
          <View style={styles.customSkillRow}>
            <TextInput
              value={customSkill}
              onChangeText={setCustomSkill}
              placeholder={language === 'hi' ? 'अन्य कौशल जोड़ें' : 'Add other skill'}
              placeholderTextColor={colors.textSecondary}
              style={[styles.customSkillInput, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
              onSubmitEditing={addCustomSkill}
            />
            <TouchableOpacity onPress={addCustomSkill} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Display custom skills */}
          {selectedSkills.filter(s => !COMMON_SKILLS.includes(s)).length > 0 && (
            <View style={styles.customSkillsDisplay}>
              {selectedSkills.filter(s => !COMMON_SKILLS.includes(s)).map(skill => (
                <View key={skill} style={styles.customSkillTag}>
                  <Text style={styles.customSkillTagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => toggleSkill(skill)}>
                    <Text style={styles.removeSkillText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{language === 'hi' ? 'बायो' : 'Bio'}</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder={language === 'hi' ? 'अपने बारे में और अपने अनुभव के बारे में बताएं' : 'Tell about yourself and your experience'}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: colors.text, borderColor: colors.textSecondary + '40' }]}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={saveProfile} style={styles.saveButton} disabled={saving}>
        <LinearGradient
          colors={['#0A66C2', '#004182']}
          style={styles.saveGradient}
        >
          <Text style={styles.saveText}>{saving ? (language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...') : t('saveProfile')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  verifiedBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  photoIcon: {
    fontSize: 40,
  },
  photoEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A66C2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoEditText: {
    fontSize: 16,
  },
  photoHint: {
    marginTop: 8,
    fontSize: 13,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0A66C2',
  },
  skillChipActive: {
    backgroundColor: '#0A66C2',
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A66C2',
  },
  skillTextActive: {
    color: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  genderChip: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  genderChipActive: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  genderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderTextActive: {
    color: 'white',
  },
  availabilityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  availChip: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  availChipActive: {
    backgroundColor: '#057642',
    borderColor: '#057642',
  },
  availText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  availTextActive: {
    color: 'white',
  },
  customSkillRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  customSkillInput: {
    flex: 1,
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#0A66C2',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  customSkillsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  customSkillTagText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  removeSkillText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});