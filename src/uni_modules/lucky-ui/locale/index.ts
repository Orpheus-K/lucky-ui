import { ref } from 'vue';
import zhHans from './lang/zh-Hans';
import zhHant from './lang/zh-Hant';
import en from './lang/en';
import ja from './lang/ja';
import ko from './lang/ko';
import fr from './lang/fr';
import es from './lang/es';
import ptBR from './lang/pt-BR';

export type MessageSchema = typeof zhHans;

type LocaleMessage = Record<string, unknown>;
type TranslateParams = Record<string, string | number> | Array<string | number>;

export const SUPPORTED_LOCALES = [
  { value: 'zh-Hans', label: '简体中文' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'pt-BR', label: 'Português' },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['value'];

const messages: Record<string, MessageSchema | LocaleMessage> = {
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  en,
  ja,
  ko,
  fr,
  es,
  'pt-BR': ptBR,
};

const currentLocale = ref('zh-Hans');

// 自动检测系统语言
if (typeof uni !== 'undefined' && uni.getLocale) {
  const systemLocale = uni.getLocale();
  if (messages[systemLocale]) {
    currentLocale.value = systemLocale;
  } else if (/^zh-(TW|HK|MO|Hant|CHT)/i.test(systemLocale)) {
    currentLocale.value = 'zh-Hant';
  } else if (systemLocale.startsWith('zh')) {
    currentLocale.value = 'zh-Hans';
  } else if (systemLocale.startsWith('en')) {
    currentLocale.value = 'en';
  } else if (systemLocale.startsWith('ja')) {
    currentLocale.value = 'ja';
  } else if (systemLocale.startsWith('ko')) {
    currentLocale.value = 'ko';
  } else if (systemLocale.startsWith('fr')) {
    currentLocale.value = 'fr';
  } else if (systemLocale.startsWith('es')) {
    currentLocale.value = 'es';
  } else if (systemLocale.startsWith('pt')) {
    currentLocale.value = 'pt-BR';
  }
}

export const Locale = {
  get locale() {
    return currentLocale.value;
  },
  use(lang: string, newMessages?: LocaleMessage) {
    if (newMessages) {
      messages[lang] = newMessages;
    }
    if (messages[lang]) {
      currentLocale.value = lang;
    }
  },
  add(newMessages: Record<string, LocaleMessage>) {
    for (const key in newMessages) {
      if (messages[key]) {
        Object.assign(messages[key], newMessages[key]);
      } else {
        messages[key] = newMessages[key];
      }
    }
  },
  t<T = string>(path: string, ...args: unknown[]): T {
    const langMessages = messages[currentLocale.value] || zhHans;
    const value = path.split('.').reduce<unknown>((obj, key) => {
      if (!obj || typeof obj !== 'object') return undefined;
      return (obj as Record<string, unknown>)[key];
    }, langMessages);

    if (typeof value === 'function') {
      return value(...args) as T;
    }
    if (typeof value !== 'string') {
      return (value !== undefined ? value : path) as T;
    }
    return formatMessage(value, args[0] as TranslateParams | undefined) as T;
  },
};

function formatMessage(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (matched, key: string) => {
    if (Array.isArray(params)) {
      const value = params[Number(key)];
      return value === undefined ? matched : String(value);
    }
    const value = params[key];
    return value === undefined ? matched : String(value);
  });
}

export default Locale;
