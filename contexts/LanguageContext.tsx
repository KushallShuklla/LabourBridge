import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, TranslationKey } from '../constants/translations';
import { safeLog } from '@/utils/safeLogging';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      safeLog.info('Loaded language:', saved || 'none');
      if (saved === 'en' || saved === 'hi') {
        setLanguageState(saved);
      }
    } catch (error) {
      safeLog.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      safeLog.info('Setting language to:', lang);
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
      safeLog.info('Language set successfully');
    } catch (error) {
      safeLog.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
