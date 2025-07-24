import { DomainEvent } from './domain_event.js'

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>
}

export class DomainEventDispatcher {
  private static instance: DomainEventDispatcher
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map()

  private constructor() {}

  static getInstance(): DomainEventDispatcher {
    if (!DomainEventDispatcher.instance) {
      DomainEventDispatcher.instance = new DomainEventDispatcher()
    }
    return DomainEventDispatcher.instance
  }

  register<T extends DomainEvent>(eventName: string, handler: DomainEventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, [])
    }
    this.handlers.get(eventName)!.push(handler)
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName()
    const handlers = this.handlers.get(eventName) || []

    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.dispatch(event)))
  }

  clear(): void {
    this.handlers.clear()
  }
}
