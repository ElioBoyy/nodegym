import { I18nConfig } from '../services/i18n_service.js'
import { englishTranslations, frenchTranslations, spanishTranslations } from './translations.js'

export const i18nConfig: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'es'],
  translations: {
    en: englishTranslations,
    fr: frenchTranslations,
    es: spanishTranslations,
  },
}

export { I18nService } from '../services/i18n_service.js'
