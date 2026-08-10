import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from '@/components/Logo';

export default function WorkerTabsLayout() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        header: () => (
          <View style={{
            backgroundColor: colors.background,
            paddingTop: 50,
            paddingBottom: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
            alignItems: 'center'
          }}>
            <Logo size="medium" />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'hi' ? 'होम' : 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: language === 'hi' ? 'समुदाय' : 'Communities',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
    </Tabs>
  );
}
