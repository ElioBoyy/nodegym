export abstract class DomainEvent {
  public readonly occurredOn: Date
  public readonly eventId: string
  public readonly eventVersion: number

  constructor(eventVersion: number = 1) {
    this.occurredOn = new Date()
    this.eventId = crypto.randomUUID()
    this.eventVersion = eventVersion
  }

  abstract getAggregateId(): string
  abstract getEventName(): string
}
