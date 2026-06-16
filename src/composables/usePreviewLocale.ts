import { computed, ref } from 'vue';
import { Locale, SUPPORTED_LOCALES, type LocaleCode } from '@/uni_modules/lucky-ui/locale';

export function usePreviewLocale() {
  const currentLocale = ref(Locale.locale);
  const localeOptions = SUPPORTED_LOCALES;
  const currentLocaleLabel = computed(
    () =>
      localeOptions.find(locale => locale.value === currentLocale.value)?.label ||
      currentLocale.value
  );

  function setLocale(lang: LocaleCode) {
    Locale.use(lang);
    currentLocale.value = lang;
  }

  return {
    currentLocale,
    localeOptions,
    currentLocaleLabel,
    setLocale,
  };
}
