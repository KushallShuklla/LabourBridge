import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        backgroundColor: theme === 'dark' ? '#FFC107' : '#333333',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {theme === 'dark' ? `☀️ ${t('light')}` : `🌙 ${t('dark')}`}
      </Text>
    </TouchableOpacity>
  );
}
