import { DomainEvent } from './domain_event.js'

export class BadgeEarnedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly badgeId: string,
    public readonly badgeName: string,
    public readonly earnedThrough: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.userId
  }

  getEventName(): string {
    return 'BadgeEarned'
  }
}

export class BadgeCreatedEvent extends DomainEvent {
  constructor(
    public readonly badgeId: string,
    public readonly name: string,
    public readonly createdBy: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.badgeId
  }

  getEventName(): string {
    return 'BadgeCreated'
  }
}
