import { DomainEventHandler } from '../../domain/events/domain_event_dispatcher.js'
import {
  UserRegisteredEvent,
  UserActivatedEvent,
  UserDeactivatedEvent,
} from '../../domain/events/user_events.js'
import {
  ChallengeCreatedEvent,
  UserJoinedChallengeEvent,
  ChallengeCompletedEvent,
} from '../../domain/events/challenge_events.js'
import { BadgeEarnedEvent } from '../../domain/events/badge_events.js'
import { NotificationService } from '../../domain/services/notification_service.js'
import {
  NotificationServiceAdapter,
  EmailProviderAdapter,
} from '../../infrastructure/anti_corruption/external_notification_adapter.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { EventStore } from '../../infrastructure/event_store/event_store.js'

export class UserRegisteredHandler implements DomainEventHandler<UserRegisteredEvent> {
  constructor(
    private notificationService: NotificationService,
    private userRepository: UserRepository
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      // Créer l'adapter de notification avec support i18n
      const emailProvider = new EmailProviderAdapter(undefined, event.acceptLanguage)
      const i18nNotificationService = new NotificationServiceAdapter(
        emailProvider,
        this.userRepository,
        undefined,
        event.acceptLanguage
      )

      // Utiliser le prénom s'il est disponible, sinon extraire depuis l'email
      const userName = event.firstName || event.email.split('@')[0]

      // Envoyer la notification de bienvenue avec i18n
      await i18nNotificationService.sendWelcomeNotification(event.email, userName)

      console.log(
        `📧 Welcome notification sent to ${event.email} in ${i18nNotificationService.getLocale()}`
      )
    } catch (error) {
      console.error('Failed to send welcome notification:', error)

      // Fallback vers l'ancien système en cas d'erreur
      await this.notificationService.sendNotification({
        userId: event.userId,
        title: 'Welcome to Gym API!',
        message: `Welcome ${event.firstName || event.email.split('@')[0]}! Thank you for joining our fitness community.`,
        type: 'gym_approved',
      })
    }
  }
}

export class UserActivatedHandler implements DomainEventHandler<UserActivatedEvent> {
  constructor(private eventStore: EventStore) {}

  async handle(event: UserActivatedEvent): Promise<void> {
    await this.eventStore.saveEvents(event.userId, [event], 0)
  }
}

export class UserDeactivatedHandler implements DomainEventHandler<UserDeactivatedEvent> {
  constructor(private eventStore: EventStore) {}

  async handle(event: UserDeactivatedEvent): Promise<void> {
    await this.eventStore.saveEvents(event.userId, [event], 0)
  }
}

export class ChallengeCreatedHandler implements DomainEventHandler<ChallengeCreatedEvent> {
  constructor(private eventStore: EventStore) {}

  async handle(event: ChallengeCreatedEvent): Promise<void> {
    await this.eventStore.saveEvents(event.challengeId, [event], 0)
  }
}

export class UserJoinedChallengeHandler implements DomainEventHandler<UserJoinedChallengeEvent> {
  constructor(private eventStore: EventStore) {}

  async handle(event: UserJoinedChallengeEvent): Promise<void> {
    await this.eventStore.saveEvents(event.challengeId, [event], 0)
  }
}

export class ChallengeCompletedHandler implements DomainEventHandler<ChallengeCompletedEvent> {
  constructor(private eventStore: EventStore) {}

  async handle(event: ChallengeCompletedEvent): Promise<void> {
    await this.eventStore.saveEvents(event.challengeId, [event], 0)
  }
}

export class BadgeEarnedHandler implements DomainEventHandler<BadgeEarnedEvent> {
  constructor(
    private notificationService: NotificationService,
    private eventStore: EventStore
  ) {}

  async handle(event: BadgeEarnedEvent): Promise<void> {
    await this.notificationService.sendBadgeEarned(event.userId, event.badgeName, event.badgeId)
    await this.eventStore.saveEvents(event.userId, [event], 0)
  }
}
