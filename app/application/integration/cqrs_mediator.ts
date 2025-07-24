import { CommandBus } from '../commands/command_handler.js'
import { QueryBus } from '../queries/query_handler.js'
import { DomainEventDispatcher } from '../../domain/events/domain_event_dispatcher.js'
import { AggregateRoot } from '../../domain/events/aggregate_root.js'

export class CQRSMediator {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async send<TResult>(command: any): Promise<TResult> {
    return await this.commandBus.execute(command)
  }

  async query<TResult>(query: any): Promise<TResult> {
    return await this.queryBus.execute(query)
  }

  async publishEvents(aggregate: AggregateRoot): Promise<void> {
    const events = aggregate.getUncommittedEvents()
    await this.eventDispatcher.dispatchAll(events)
    aggregate.markEventsAsCommitted()
  }

  async sendAndPublish<TResult>(command: any, aggregate?: AggregateRoot): Promise<TResult> {
    const result = await this.send<TResult>(command)

    if (aggregate) {
      await this.publishEvents(aggregate)
    }

    return result
  }
}
