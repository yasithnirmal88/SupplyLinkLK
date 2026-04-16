import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    defaultNS,
  });

export default i18n;
