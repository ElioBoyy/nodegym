import {
  NotificationService,
  NotificationData,
} from '../../domain/services/notification_service.js'
import { SmtpEmailService } from '../services/smtp_email_service.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { I18nService } from '../i18n/i18n_config.js'
import { i18nConfig } from '../i18n/i18n_config.js'

export interface ExternalNotificationProvider {
  sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<void>
}

export interface ExternalEmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class EmailProviderAdapter implements ExternalNotificationProvider {
  private smtpService: SmtpEmailService
  private i18nService: I18nService

  constructor(locale?: string, acceptLanguageHeader?: string) {
    this.smtpService = new SmtpEmailService()
    this.i18nService = new I18nService(i18nConfig)

    if (acceptLanguageHeader) {
      this.i18nService.setLocaleFromAcceptLanguage(acceptLanguageHeader)
    } else if (locale) {
      this.i18nService.setLocale(locale)
    } else {
      this.i18nService.setLocale(i18nConfig.defaultLocale)
    }
  }

  setLocale(locale: string): void {
    this.i18nService.setLocale(locale)
  }

  setLocaleFromAcceptLanguage(acceptLanguageHeader: string): void {
    this.i18nService.setLocaleFromAcceptLanguage(acceptLanguageHeader)
  }

  async sendEmail(to: string, subject: string, body: string, isHtml = false): Promise<void> {
    try {
      const message = {
        to,
        subject,
        ...(isHtml ? { html: body } : { text: body }),
      }

      await this.smtpService.sendEmail(message)
    } catch (error) {
      throw new Error(this.i18nService.translate('errors.smtpError', { error: error.message }))
    }
  }
}

export class NotificationServiceAdapter implements NotificationService {
  private i18nService: I18nService

  constructor(
    private provider: ExternalNotificationProvider,
    private userRepository: UserRepository,
    locale?: string,
    acceptLanguageHeader?: string
  ) {
    this.i18nService = new I18nService(i18nConfig)

    if (acceptLanguageHeader) {
      this.i18nService.setLocaleFromAcceptLanguage(acceptLanguageHeader)
    } else if (locale) {
      this.i18nService.setLocale(locale)
    } else {
      this.i18nService.setLocale(i18nConfig.defaultLocale)
    }
  }

  setLocale(locale: string): void {
    this.i18nService.setLocale(locale)
  }

  setLocaleFromAcceptLanguage(acceptLanguageHeader: string): void {
    this.i18nService.setLocaleFromAcceptLanguage(acceptLanguageHeader)
  }

  detectLocaleFromAcceptLanguage(acceptLanguageHeader: string): string {
    return this.i18nService.detectLocaleFromAcceptLanguage(acceptLanguageHeader)
  }

  getLocale(): string {
    return this.i18nService.getLocale()
  }

  private async getUserEmail(userId: string): Promise<string> {
    try {
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new Error(this.i18nService.translate('errors.userNotFound', { userId }))
      }
      return user.email
    } catch (error) {
      console.error(`Failed to get user email for ID ${userId}:`, error.message)
      return this.i18nService.translate('email.fallback.email')
    }
  }

  async sendWelcomeNotification(userEmail: string, userName: string): Promise<void> {
    const subject = this.i18nService.translate('email.welcome.subject')
    const body = this.i18nService.translate('email.welcome.body', { userName })

    await this.provider.sendEmail(userEmail, subject, body)
  }

  async sendChallengeInvitation(userEmail: string, challengeTitle: string): Promise<void> {
    const subject = this.i18nService.translate('email.challengeInvitation.subject', {
      challengeTitle,
    })
    const body = this.i18nService.translate('email.challengeInvitation.body', { challengeTitle })

    await this.provider.sendEmail(userEmail, subject, body)
  }

  async sendBadgeEarned(userId: string, badgeName: string, _badgeId: string): Promise<void> {
    const userEmail = await this.getUserEmail(userId)
    const subject = this.i18nService.translate('email.badgeEarned.subject')
    const body = this.i18nService.translate('email.badgeEarned.body', { badgeName })

    await this.provider.sendEmail(userEmail, subject, body)
  }

  async sendGymApproval(ownerEmail: string, gymName: string): Promise<void> {
    const subject = this.i18nService.translate('email.gymApproval.subject')
    const body = this.i18nService.translate('email.gymApproval.body', { gymName })

    await this.provider.sendEmail(ownerEmail, subject, body)
  }

  async sendNotification(data: NotificationData): Promise<void> {
    const userEmail = await this.getUserEmail(data.userId)
    const subject = data.title
    const body = `${data.title}\n\n${data.message}`

    await this.provider.sendEmail(userEmail, subject, body)
  }

  async sendChallengeCompleted(
    userId: string,
    challengeTitle: string,
    _challengeId: string
  ): Promise<void> {
    const userEmail = await this.getUserEmail(userId)
    const subject = this.i18nService.translate('email.challengeCompleted.subject', {
      challengeTitle,
    })
    const body = this.i18nService.translate('email.challengeCompleted.body', { challengeTitle })

    await this.provider.sendEmail(userEmail, subject, body)
  }

  async sendGymApproved(ownerId: string, gymName: string, _gymId: string): Promise<void> {
    const ownerEmail = await this.getUserEmail(ownerId)
    const subject = this.i18nService.translate('email.gymApproval.subject')
    const body = this.i18nService.translate('email.gymApproval.body', { gymName })

    await this.provider.sendEmail(ownerEmail, subject, body)
  }

  async sendChallengeJoined(
    userId: string,
    challengeTitle: string,
    _challengeId: string
  ): Promise<void> {
    const userEmail = await this.getUserEmail(userId)
    const subject = this.i18nService.translate('email.challengeJoined.subject', { challengeTitle })
    const body = this.i18nService.translate('email.challengeJoined.body', { challengeTitle })

    await this.provider.sendEmail(userEmail, subject, body)
  }
}
