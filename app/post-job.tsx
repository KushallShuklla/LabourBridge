import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const COMMON_SKILLS = [
  'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter',
  'Welder', 'Driver', 'Helper', 'Cleaner', 'Gardener',
  'AC Technician', 'Mechanic', 'Tile Worker', 'Steel Fixer', 'Crane Operator',
  'JCB Operator', 'Foreman', 'Supervisor', 'Labour Contractor', 'Security Guard',
  'Housekeeping', 'Cook', 'Waiter', 'Delivery Boy', 'Packer',
  'Loader', 'Warehouse Worker', 'Factory Worker', 'Construction Worker', 'Road Worker'
];

const SKILL_TRANSLATIONS: { [key: string]: string } = {
  'Plumber': 'प्लंबर',
  'Electrician': 'इलेक्ट्रीशियन',
  'Carpenter': 'बढ़ई',
  'Mason': 'राजमिस्त्री',
  'Painter': 'पेंटर',
  'Welder': 'वेल्डर',
  'Driver': 'ड्राइवर',
  'Helper': 'हेल्पर',
  'Cleaner': 'सफाई कर्मचारी',
  'Gardener': 'माली',
  'AC Technician': 'एसी तकनीशियन',
  'Mechanic': 'मैकेनिक',
  'Tile Worker': 'टाइलर',
  'Steel Fixer': 'स्टील फिक्सर',
  'Crane Operator': 'क्रेन ऑपरेटर',
  'JCB Operator': 'जेसीबी ऑपरेटर',
  'Foreman': 'फोरमैन',
  'Supervisor': 'सुपरवाइजर',
  'Labour Contractor': 'ठेकेदार',
  'Security Guard': 'सुरक्षा गार्ड',
  'Housekeeping': 'हाउसकीपिंग',
  'Cook': 'रसोइया',
  'Waiter': 'वेटर',
  'Delivery Boy': 'डिलीवरी बॉय',
  'Packer': 'पैकर',
  'Loader': 'लोडर',
  'Warehouse Worker': 'गोदाम कर्मचारी',
  'Factory Worker': 'फैक्ट्री कर्मचारी',
  'Construction Worker': 'निर्माण कर्मचारी',
  'Road Worker': 'सड़क कर्मचारी'
};

export default function PostJobScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [workersNeeded, setWorkersNeeded] = useState('1');
  const [duration, setDuration] = useState('');
  const [workType, setWorkType] = useState('Full-time');
  const [contactPhone, setContactPhone] = useState('');

  const toggleSkill = (skill: string) => {
    setRequiredSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const postJob = async () => {
    if (!title || !description || !city || requiredSkills.length === 0) {
      alert('Please fill all required fields and select at least one skill');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('User not logged in');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays || '30'));

    const { error } = await supabase.from('jobs').insert({
      title,
      description,
      city,
      area,
      salary_range: salaryRange,
      required_skills: requiredSkills,
      expiry_date: expiryDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      created_by: user.id,
      workers_needed: parseInt(workersNeeded) || 1,
      duration: duration || null,
      work_type: workType,
      contact_phone: contactPhone || null,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Job posted successfully');
      router.back();
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        {language === 'hi' ? 'नौकरी पोस्ट करें' : 'Post a Job'}
      </Text>

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'नौकरी का शीर्षक *' : 'Job Title *'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'उदा., घर की मरम्मत के लिए प्लंबर चाहिए' : 'e.g., Need Plumber for Home Repair'}
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'विवरण *' : 'Description *'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'काम की आवश्यकताओं का वर्णन करें' : 'Describe the work requirements'}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6, height: 80 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'शहर *' : 'City *'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'शहर दर्ज करें' : 'Enter city'}
        value={city}
        onChangeText={setCity}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'क्षेत्र' : 'Area'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'क्षेत्र/इलाका दर्ज करें' : 'Enter area/locality'}
        value={area}
        onChangeText={setArea}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'कितने मजदूर चाहिए *' : 'Workers Needed *'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'उदा., 5' : 'e.g., 5'}
        value={workersNeeded}
        onChangeText={setWorkersNeeded}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'काम का प्रकार' : 'Work Type'}</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
        {[{en: 'Full-time', hi: 'पूर्णकालिक'}, {en: 'Part-time', hi: 'अंशकालिक'}, {en: 'Contract', hi: 'अनुबंध'}].map(type => (
          <TouchableOpacity
            key={type.en}
            onPress={() => setWorkType(type.en)}
            style={{
              flex: 1,
              backgroundColor: workType === type.en ? '#057642' : '#E0E0E0',
              padding: 10,
              borderRadius: 6,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: workType === type.en ? 'white' : 'black', fontSize: 13 }}>
              {language === 'hi' ? type.hi : type.en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'काम की अवधि' : 'Duration'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'उदा., 2 सप्ताह, 1 महीना' : 'e.g., 2 weeks, 1 month'}
        value={duration}
        onChangeText={setDuration}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'संपर्क फोन' : 'Contact Phone'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'संपर्क नंबर दर्ज करें' : 'Enter contact number'}
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'वेतन सीमा' : 'Salary Range'}</Text>
      <TextInput
        placeholder={language === 'hi' ? 'उदा., ₹500-800/दिन' : 'e.g., ₹500-800/day'}
        value={salaryRange}
        onChangeText={setSalaryRange}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{language === 'hi' ? 'समाप्ति (दिन)' : 'Expiry (Days)'}</Text>
      <TextInput
        placeholder="30"
        value={expiryDays}
        onChangeText={setExpiryDays}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 }}
      />

      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{language === 'hi' ? 'आवश्यक कौशल * (कम से कम एक चुनें)' : 'Required Skills * (Select at least one)'}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 }}>
        {COMMON_SKILLS.map(skill => (
          <TouchableOpacity
            key={skill}
            onPress={() => toggleSkill(skill)}
            style={{
              backgroundColor: requiredSkills.includes(skill) ? '#057642' : '#E0E0E0',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: requiredSkills.includes(skill) ? 'white' : 'black', fontSize: 13 }}>
              {language === 'hi' ? SKILL_TRANSLATIONS[skill] : skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={postJob}
        style={{
          backgroundColor: '#28A745',
          padding: 14,
          borderRadius: 6,
          marginBottom: 50
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          {language === 'hi' ? 'नौकरी पोस्ट करें' : 'Post Job'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
