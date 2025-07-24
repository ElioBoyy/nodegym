import { DomainEvent } from './domain_event.js'
import { UserRole } from '../entities/user.js'

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly firstName?: string,
    public readonly acceptLanguage?: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.userId
  }

  getEventName(): string {
    return 'UserRegistered'
  }
}

export class UserActivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly activatedBy: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.userId
  }

  getEventName(): string {
    return 'UserActivated'
  }
}

export class UserDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.userId
  }

  getEventName(): string {
    return 'UserDeactivated'
  }
}
