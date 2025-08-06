import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ruCommon from '@/public/locales/ru/common.json';
import kzCommon from '@/public/locales/kz/common.json';
import enCommon from '@/public/locales/en/common.json';

const resources = {
  ru: { common: ruCommon },
  kz: { common: kzCommon },
  en: { common: enCommon },
};

if (typeof window !== 'undefined' && !i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      defaultNS: 'common',
      fallbackLng: 'ru',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
}

export default i18n;
