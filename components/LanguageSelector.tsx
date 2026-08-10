import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = async (lang: 'en' | 'hi') => {
    await setLanguage(lang);
    Alert.alert('Language Changed', `Language set to ${lang === 'en' ? 'English' : 'हिंदी'}. Please restart the app or navigate to see changes.`);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 8, padding: 10 }}>
      <TouchableOpacity
        onPress={() => handleLanguageChange('en')}
        style={{
          backgroundColor: language === 'en' ? '#1E90FF' : '#E0E0E0',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: language === 'en' ? 'white' : 'black', fontWeight: 'bold' }}>
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleLanguageChange('hi')}
        style={{
          backgroundColor: language === 'hi' ? '#1E90FF' : '#E0E0E0',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: language === 'hi' ? 'white' : 'black', fontWeight: 'bold' }}>
          हिंदी
        </Text>
      </TouchableOpacity>
    </View>
  );
}
