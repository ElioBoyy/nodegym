# Système d'Internationalisation (i18n)

Ce module fournit un système complet d'internationalisation pour l'application Gym API, permettant de prendre en charge plusieurs langues dans les notifications par email.

## Fonctionnalités

- ✅ Support multi-langues (Anglais, Français, Espagnol)
- ✅ Interpolation de paramètres avec `{{paramName}}`
- ✅ Fallback automatique vers la langue par défaut
- ✅ Intégration complète avec l'adapter de notifications
- ✅ Configuration centralisée des traductions

## Langues supportées

| Code | Langue   | Statut     |
| ---- | -------- | ---------- |
| `en` | Anglais  | ✅ Complet |
| `fr` | Français | ✅ Complet |
| `es` | Espagnol | ✅ Complet |

## Architecture

```
app/infrastructure/i18n/
├── i18n_service.ts        # Service principal d'i18n
├── translations.ts        # Fichiers de traductions
├── i18n_config.ts        # Configuration i18n
└── README.md            # Cette documentation
```

## Structure des traductions

Les traductions sont organisées de manière hiérarchique :

```typescript
{
  email: {
    welcome: {
      subject: "Clé de traduction pour le sujet",
      body: "Clé de traduction pour le corps avec {{paramName}}"
    },
    // ... autres templates d'email
  },
  errors: {
    userNotFound: "Utilisateur avec l'ID {{userId}} introuvable"
  }
}
```

## Utilisation

### 1. 🌍 Détection automatique via Accept-Language

```typescript
import {
  NotificationServiceAdapter,
  EmailProviderAdapter,
} from '../anti_corruption/external_notification_adapter.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { HttpContext } from '@adonisjs/core/http'

// Dans un contrôleur AdonisJS
async handleRequest(ctx: HttpContext) {
  const acceptLanguage = ctx.request.header('Accept-Language')
  // Ex: "fr-FR,fr;q=0.9,en;q=0.8,en-US;q=0.7"

  // Détection automatique de la langue
  const emailProvider = new EmailProviderAdapter(undefined, acceptLanguage)
  const notificationService = new NotificationServiceAdapter(
    emailProvider,
    userRepository,
    undefined,
    acceptLanguage
  )

  // La langue est automatiquement détectée : "fr"
  console.log(notificationService.getLocale()) // "fr"
}
```

### 2. Configuration manuelle

```typescript
// Configuration manuelle avec une langue spécifique
const emailProvider = new EmailProviderAdapter('fr')
const notificationService = new NotificationServiceAdapter(emailProvider, userRepository, 'fr')
```

### 3. Changer de langue

```typescript
// Changer la langue manuellement
emailProvider.setLocale('es')
notificationService.setLocale('es')

// Changer la langue depuis Accept-Language
notificationService.setLocaleFromAcceptLanguage('es-ES,es;q=0.9,en;q=0.8')

// Détecter sans changer
const detectedLocale = notificationService.detectLocaleFromAcceptLanguage('fr-FR,fr;q=0.9')

// Obtenir la langue actuelle
const currentLocale = notificationService.getLocale() // 'es'
```

### 3. Envoi de notifications

```typescript
// Notification de bienvenue en français
notificationService.setLocale('fr')
await notificationService.sendWelcomeNotification('user@example.com', 'Jean Dupont')

// Invitation de défi en espagnol
notificationService.setLocale('es')
await notificationService.sendChallengeInvitation('user@example.com', 'Maratón de Fitness')
```

## 🌍 Détection automatique Accept-Language

### Comment ça fonctionne

Le système parse automatiquement l'en-tête `Accept-Language` et sélectionne la meilleure langue supportée :

```
Accept-Language: fr-FR,fr;q=0.9,en;q=0.8,en-US;q=0.7
```

**Résultat :** `fr` (français détecté et supporté)

### Exemples de détection

| En-tête Accept-Language   | Langue détectée | Explication                                |
| ------------------------- | --------------- | ------------------------------------------ |
| `fr-FR,fr;q=0.9,en;q=0.8` | `fr`            | Français prioritaire et supporté           |
| `en-US,en;q=0.9,fr;q=0.8` | `en`            | Anglais prioritaire et supporté            |
| `es-ES,es;q=0.9,en;q=0.8` | `es`            | Espagnol prioritaire et supporté           |
| `de-DE,de;q=0.9,fr;q=0.8` | `fr`            | Allemand non supporté → fallback français  |
| `it-IT,it;q=0.9`          | `en`            | Italien non supporté → fallback par défaut |

### Nouvelles méthodes API

```typescript
// Détection et configuration automatique
service.setLocaleFromAcceptLanguage(acceptLanguageHeader)

// Détection sans changement
const locale = service.detectLocaleFromAcceptLanguage(acceptLanguageHeader)

// Parser manuel
const locale = i18nService.parseAcceptLanguage(acceptLanguageHeader)
```

### Intégration AdonisJS

```typescript
// Dans un contrôleur
export default class NotificationController {
  async sendWelcome({ request, response }: HttpContext) {
    const acceptLanguage = request.header('Accept-Language')
    const { email, userName } = request.body()

    const notificationService = new NotificationServiceAdapter(
      emailProvider,
      userRepository,
      undefined,
      acceptLanguage // 🎯 Détection automatique
    )

    await notificationService.sendWelcomeNotification(email, userName)

    return response.json({
      success: true,
      locale: notificationService.getLocale(),
    })
  }
}
```

## API du service I18n

### `I18nService`

```typescript
class I18nService {
  constructor(config: I18nConfig)
  setLocale(locale: string): void
  getLocale(): string
  translate(key: string, params?: { [key: string]: string | number }): string
}
```

### Méthodes principales

- **`setLocale(locale)`** : Définit la langue active
- **`getLocale()`** : Retourne la langue actuelle
- **`translate(key, params)`** : Traduit une clé avec des paramètres optionnels

## Templates d'email disponibles

| Template        | Clé de traduction                        | Paramètres       |
| --------------- | ---------------------------------------- | ---------------- |
| Bienvenue       | `email.welcome.subject/body`             | `userName`       |
| Invitation défi | `email.challengeInvitation.subject/body` | `challengeTitle` |
| Badge gagné     | `email.badgeEarned.subject/body`         | `badgeName`      |
| Salle approuvée | `email.gymApproval.subject/body`         | `gymName`        |
| Défi terminé    | `email.challengeCompleted.subject/body`  | `challengeTitle` |
| Défi rejoint    | `email.challengeJoined.subject/body`     | `challengeTitle` |

## Ajout d'une nouvelle langue

1. **Ajouter les traductions** dans `translations.ts` :

```typescript
export const germanTranslations: I18nTranslations = {
  email: {
    welcome: {
      subject: 'Willkommen bei Gym API!',
      body: 'Willkommen {{userName}}!...',
    },
    // ... autres traductions
  },
}
```

2. **Mettre à jour la configuration** dans `i18n_config.ts` :

```typescript
export const i18nConfig: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'es', 'de'], // Ajouter 'de'
  translations: {
    en: englishTranslations,
    fr: frenchTranslations,
    es: spanishTranslations,
    de: germanTranslations, // Ajouter les traductions allemandes
  },
}
```

## Gestion des erreurs

- **Fallback automatique** : Si une traduction n'existe pas dans la langue demandée, le système utilise automatiquement la langue par défaut
- **Logs d'avertissement** : Les clés de traduction manquantes sont loggées
- **Clés par défaut** : Si aucune traduction n'est trouvée, la clé originale est retournée

## Exemple complet

Voir le fichier `example_usage.ts` pour des exemples détaillés d'utilisation du système i18n avec l'adapter de notifications.

## Bonnes pratiques

1. **Utiliser des clés descriptives** : `email.welcome.subject` plutôt que `ws`
2. **Grouper logiquement** : Organiser les traductions par domaine fonctionnel
3. **Tester toutes les langues** : Vérifier que toutes les traductions sont correctes
4. **Paramètres cohérents** : Utiliser les mêmes noms de paramètres dans toutes les langues
5. **Documentation** : Documenter les nouveaux templates et paramètres
