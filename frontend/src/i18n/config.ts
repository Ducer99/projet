import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions françaises
import translationFR from './locales/fr.json';
// Traductions anglaises
import translationEN from './locales/en.json';

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Détection automatique de la langue du navigateur
  .use(LanguageDetector)
  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialiser i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut : français
    debug: true, // 🔍 MODE DEBUG ACTIVÉ pour diagnostiquer
    
    interpolation: {
      escapeValue: false // React échappe déjà par défaut
    },
    
    detection: {
      // Ordre de détection de la langue
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Clé pour le stockage local
      lookupLocalStorage: 'i18nextLng',
      // Cache la langue détectée
      caches: ['localStorage'],
    }
  });

export default i18n;
