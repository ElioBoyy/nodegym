import { DomainEvent } from './domain_event.js'

export class ChallengeCreatedEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly title: string,
    public readonly creatorId: string,
    public readonly gymId: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.challengeId
  }

  getEventName(): string {
    return 'ChallengeCreated'
  }
}

export class UserJoinedChallengeEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly userId: string,
    public readonly participationId: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.challengeId
  }

  getEventName(): string {
    return 'UserJoinedChallenge'
  }
}

export class UserLeftChallengeEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly userId: string,
    public readonly participationId: string
  ) {
    super()
  }

  getAggregateId(): string {
    return this.challengeId
  }

  getEventName(): string {
    return 'UserLeftChallenge'
  }
}

export class ChallengeCompletedEvent extends DomainEvent {
  constructor(
    public readonly challengeId: string,
    public readonly userId: string,
    public readonly participationId: string,
    public readonly completedAt: Date
  ) {
    super()
  }

  getAggregateId(): string {
    return this.challengeId
  }

  getEventName(): string {
    return 'ChallengeCompleted'
  }
}
