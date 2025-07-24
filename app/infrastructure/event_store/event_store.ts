import { DomainEvent } from '../../domain/events/domain_event.js'

export interface StoredEvent {
  eventId: string
  aggregateId: string
  eventName: string
  eventData: string
  eventVersion: number
  occurredOn: Date
  metadata?: Record<string, any>
}

export interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>
  getEvents(aggregateId: string, fromVersion?: number): Promise<StoredEvent[]>
  getAllEvents(fromEventId?: string): Promise<StoredEvent[]>
}

export class InMemoryEventStore implements EventStore {
  private events: StoredEvent[] = []
  private aggregateVersions: Map<string, number> = new Map()

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const currentVersion = this.aggregateVersions.get(aggregateId) || 0

    if (currentVersion !== expectedVersion) {
      throw new Error(
        `Concurrency conflict. Expected version ${expectedVersion}, but current version is ${currentVersion}`
      )
    }

    let version = currentVersion
    const storedEvents: StoredEvent[] = events.map((event) => {
      version++
      return {
        eventId: event.eventId,
        aggregateId,
        eventName: event.getEventName(),
        eventData: JSON.stringify(event),
        eventVersion: version,
        occurredOn: event.occurredOn,
      }
    })

    this.events.push(...storedEvents)
    this.aggregateVersions.set(aggregateId, version)
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<StoredEvent[]> {
    return this.events
      .filter((event) => event.aggregateId === aggregateId && event.eventVersion > fromVersion)
      .sort((a, b) => a.eventVersion - b.eventVersion)
  }

  async getAllEvents(fromEventId?: string): Promise<StoredEvent[]> {
    if (!fromEventId) {
      return [...this.events].sort((a, b) => a.occurredOn.getTime() - b.occurredOn.getTime())
    }

    const fromIndex = this.events.findIndex((event) => event.eventId === fromEventId)
    if (fromIndex === -1) {
      return []
    }

    return this.events
      .slice(fromIndex + 1)
      .sort((a, b) => a.occurredOn.getTime() - b.occurredOn.getTime())
  }
}
