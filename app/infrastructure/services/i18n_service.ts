export interface I18nTranslations {
  [key: string]: string | I18nTranslations
}

export interface I18nConfig {
  defaultLocale: string
  supportedLocales: string[]
  translations: { [locale: string]: I18nTranslations }
}

export class I18nService {
  private config: I18nConfig
  private currentLocale: string

  constructor(config: I18nConfig) {
    this.config = config
    this.currentLocale = config.defaultLocale
  }

  setLocale(locale: string): void {
    if (this.config.supportedLocales.includes(locale)) {
      this.currentLocale = locale
    } else {
      console.warn(
        `Locale '${locale}' is not supported. Using default locale '${this.config.defaultLocale}'`
      )
      this.currentLocale = this.config.defaultLocale
    }
  }

  getLocale(): string {
    return this.currentLocale
  }

  translate(key: string, params: { [key: string]: string | number } = {}): string {
    const translation = this.getTranslation(key, this.currentLocale)
    return this.interpolateParams(translation, params)
  }

  parseAcceptLanguage(acceptLanguageHeader: string): string {
    if (!acceptLanguageHeader) {
      return this.config.defaultLocale
    }

    const languages = acceptLanguageHeader
      .split(',')
      .map((lang) => {
        const [locale, qValue] = lang.trim().split(';q=')
        const quality = qValue ? Number.parseFloat(qValue) : 1.0
        const normalizedLocale = locale.split('-')[0].toLowerCase()
        return { locale: normalizedLocale, quality }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const lang of languages) {
      if (this.config.supportedLocales.includes(lang.locale)) {
        return lang.locale
      }
    }

    return this.config.defaultLocale
  }

  detectLocaleFromAcceptLanguage(acceptLanguageHeader?: string): string {
    const detectedLocale = this.parseAcceptLanguage(acceptLanguageHeader || '')
    console.log(`Detected locale from Accept-Language header: ${detectedLocale}`)
    return detectedLocale
  }

  setLocaleFromAcceptLanguage(acceptLanguageHeader?: string): void {
    const detectedLocale = this.detectLocaleFromAcceptLanguage(acceptLanguageHeader)
    this.setLocale(detectedLocale)
  }

  private getTranslation(key: string, locale: string): string {
    const keys = key.split('.')
    let translation: any = this.config.translations[locale]

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        if (locale !== this.config.defaultLocale) {
          return this.getTranslation(key, this.config.defaultLocale)
        }
        console.warn(`Translation key '${key}' not found for locale '${locale}'`)
        return key
      }
    }

    return typeof translation === 'string' ? translation : key
  }

  private interpolateParams(text: string, params: { [key: string]: string | number }): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return params[paramName]?.toString() || match
    })
  }
}
