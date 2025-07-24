export interface Query {
  readonly queryType: string
}

export interface QueryHandler<TQuery extends Query, TResult = any> {
  handle(query: TQuery): Promise<TResult>
}

export interface QueryBus {
  execute<TResult>(query: Query): Promise<TResult>
}

export class InMemoryQueryBus implements QueryBus {
  private handlers = new Map<string, QueryHandler<any, any>>()

  register<TQuery extends Query, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler)
  }

  async execute<TResult>(query: Query): Promise<TResult> {
    const handler = this.handlers.get(query.queryType)
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.queryType}`)
    }
    return handler.handle(query)
  }
}
