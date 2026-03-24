import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations, DEFAULT_LANGUAGE, LANGUAGES } from '@/utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or use default (Russian)
    return localStorage.getItem('language') || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', language);
  }, [language]);

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let value = translations[language];
    
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        console.warn(`Translation not found: ${keyPath} for language: ${language}`);
        return keyPath;
      }
    }
    
    return value;
  };

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};
