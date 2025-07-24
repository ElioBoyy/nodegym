import { DIContainer } from '../../infrastructure/dependency_injection/container.js'
import { DomainEventDispatcher } from '../../domain/events/domain_event_dispatcher.js'
import { InMemoryCommandBus } from '../commands/command_handler.js'
import { InMemoryQueryBus } from '../queries/query_handler.js'
import { CQRSMediator } from './cqrs_mediator.js'
import { MongoDBEventStore } from '../../infrastructure/event_store/mongodb_event_store.js'
import {
  NotificationServiceAdapter,
  EmailProviderAdapter,
} from '../../infrastructure/anti_corruption/external_notification_adapter.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'

import {
  UserRegisteredHandler,
  UserActivatedHandler,
  UserDeactivatedHandler,
  ChallengeCreatedHandler,
  UserJoinedChallengeHandler,
  ChallengeCompletedHandler,
  BadgeEarnedHandler,
} from './domain_event_handlers.js'

import {
  CreateUserCommandHandler,
  ActivateUserCommandHandler,
  DeactivateUserCommandHandler,
} from '../commands/user_commands.js'

import { GetUserSummaryQueryHandler, GetUsersListQueryHandler } from '../queries/user_queries.js'

export class ArchitectureBootstrap {
  static async initialize(): Promise<{
    container: DIContainer
    mediator: CQRSMediator
    eventDispatcher: DomainEventDispatcher
  }> {
    const container = DIContainer.getInstance()
    await container.initialize()

    const eventDispatcher = DomainEventDispatcher.getInstance()
    const commandBus = new InMemoryCommandBus()
    const queryBus = new InMemoryQueryBus()
    const eventStore = new MongoDBEventStore()

    await eventStore.ensureIndexes()

    const emailProvider = new EmailProviderAdapter()
    const userRepository = container.get('UserRepository') as UserRepository
    const notificationService = new NotificationServiceAdapter(emailProvider, userRepository)

    this.registerEventHandlers(eventDispatcher, notificationService, eventStore, userRepository)
    this.registerCommandHandlers(commandBus, container, eventDispatcher)
    this.registerQueryHandlers(queryBus, container)

    const mediator = new CQRSMediator(commandBus, queryBus, eventDispatcher)

    return {
      container,
      mediator,
      eventDispatcher,
    }
  }

  private static registerEventHandlers(
    eventDispatcher: DomainEventDispatcher,
    notificationService: NotificationServiceAdapter,
    eventStore: MongoDBEventStore,
    userRepository: UserRepository
  ): void {
    eventDispatcher.register(
      'UserRegistered',
      new UserRegisteredHandler(notificationService, userRepository)
    )
    eventDispatcher.register('UserActivated', new UserActivatedHandler(eventStore))
    eventDispatcher.register('UserDeactivated', new UserDeactivatedHandler(eventStore))
    eventDispatcher.register('ChallengeCreated', new ChallengeCreatedHandler(eventStore))
    eventDispatcher.register('UserJoinedChallenge', new UserJoinedChallengeHandler(eventStore))
    eventDispatcher.register('ChallengeCompleted', new ChallengeCompletedHandler(eventStore))
    eventDispatcher.register('BadgeEarned', new BadgeEarnedHandler(notificationService, eventStore))
  }

  private static registerCommandHandlers(
    commandBus: InMemoryCommandBus,
    container: DIContainer,
    eventDispatcher: DomainEventDispatcher
  ): void {
    commandBus.register(
      'CreateUser',
      new CreateUserCommandHandler(
        container.get('UserRepository'),
        container.get('PasswordService'),
        eventDispatcher
      )
    )

    commandBus.register(
      'ActivateUser',
      new ActivateUserCommandHandler(container.get('UserRepository'), eventDispatcher)
    )

    commandBus.register(
      'DeactivateUser',
      new DeactivateUserCommandHandler(container.get('UserRepository'), eventDispatcher)
    )
  }

  private static registerQueryHandlers(queryBus: InMemoryQueryBus, container: DIContainer): void {
    queryBus.register(
      'GetUserSummary',
      new GetUserSummaryQueryHandler(container.get('UserRepository'))
    )

    queryBus.register('GetUsersList', new GetUsersListQueryHandler(container.get('UserRepository')))
  }
}
