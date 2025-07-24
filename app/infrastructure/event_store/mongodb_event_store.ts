import { Collection, MongoClient } from 'mongodb'
import { DomainEvent } from '../../domain/events/domain_event.js'
import { EventStore, StoredEvent } from './event_store.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

export class MongoDBEventStore implements EventStore {
  private client: MongoClient
  private collection: Collection<StoredEvent>

  constructor() {
    this.client = MongoDBConnection.getInstance().getClient()
    this.collection = this.client.db().collection<StoredEvent>('events')
  }

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const session = this.client.startSession()

    try {
      await session.withTransaction(async () => {
        const currentVersion = await this.getCurrentVersion(aggregateId)

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

        await this.collection.insertMany(storedEvents, { session })
      })
    } finally {
      await session.endSession()
    }
  }

  async getEvents(aggregateId: string, fromVersion = 0): Promise<StoredEvent[]> {
    const cursor = this.collection.find(
      {
        aggregateId,
        eventVersion: { $gt: fromVersion },
      },
      { sort: { eventVersion: 1 } }
    )

    return await cursor.toArray()
  }

  async getAllEvents(fromEventId?: string): Promise<StoredEvent[]> {
    let query = {}

    if (fromEventId) {
      const fromEvent = await this.collection.findOne({ eventId: fromEventId })
      if (fromEvent) {
        query = { occurredOn: { $gt: fromEvent.occurredOn } }
      }
    }

    const cursor = this.collection.find(query, { sort: { occurredOn: 1 } })
    return await cursor.toArray()
  }

  private async getCurrentVersion(aggregateId: string): Promise<number> {
    const lastEvent = await this.collection.findOne({ aggregateId }, { sort: { eventVersion: -1 } })

    return lastEvent?.eventVersion || 0
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ aggregateId: 1, eventVersion: 1 })
    await this.collection.createIndex({ eventId: 1 }, { unique: true })
    await this.collection.createIndex({ occurredOn: 1 })
    await this.collection.createIndex({ eventName: 1 })
  }
}
