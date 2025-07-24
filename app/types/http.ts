import { User } from '../domain/entities/user.js'
import { DIContainer } from '../infrastructure/dependency_injection/container.js'
import { CQRSMediator } from '../application/integration/cqrs_mediator.js'
import { DomainEventDispatcher } from '../domain/events/domain_event_dispatcher.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth?: {
      user: User
      getUserId(): string
      getUser(): User
      hasRole(role: string): boolean
    }
    container?: DIContainer
  }
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    DIContainer: DIContainer
    CQRSMediator: CQRSMediator
    DomainEventDispatcher: DomainEventDispatcher
  }
}

export {}
