import { createI18n } from 'vue-i18n';
import { Language } from 'element-plus/es/locale/index';
import ElZhCn from 'element-plus/es/locale/lang/zh-cn';
import ElEn from 'element-plus/es/locale/lang/en';
import en from './locales/en';
import zhCn from './locales/zh-cn';
import { getItem, setItem } from './utils/local-storage-util';

const messages = {
  'zh-cn': {
    ...zhCn,
  },
  en: {
    ...en,
  },
};

const elMessages: Record<string, Language> = {
  'zh-cn': ElZhCn,
  en: ElEn,
};

export const languages: Record<string, string> = { 'zh-cn': '中文', en: 'English' };

const i18nFallbackLocale = 'zh-cn';

export function getElementPlusLocale(lang: string): Language {
  return elMessages[lang] ?? elMessages[i18nFallbackLocale] ?? ElZhCn;
}

export function getLanguage(): string {
  let result = getItem('current_language_locale');
  if (result !== undefined && result !== null) {
    return result;
  }

  setItem('current_language_locale', i18nFallbackLocale);
  return i18nFallbackLocale;
}

export default createI18n({
  legacy: false,
  locale: getLanguage(),
  fallbackLocale: i18nFallbackLocale,
  globalInjection: true,
  messages,
});
