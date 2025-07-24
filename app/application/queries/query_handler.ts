export interface Query<TResult = any> {
  readonly queryType: string
}

export interface QueryHandler<TQuery extends Query<TResult>, TResult = any> {
  handle(query: TQuery): Promise<TResult>
}

export interface QueryBus {
  execute<TResult>(query: Query<TResult>): Promise<TResult>
}

export class InMemoryQueryBus implements QueryBus {
  private handlers = new Map<string, QueryHandler<any, any>>()

  register<TQuery extends Query<TResult>, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler)
  }

  async execute<TResult>(query: Query<TResult>): Promise<TResult> {
    const handler = this.handlers.get(query.queryType)
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.queryType}`)
    }
    return handler.handle(query)
  }
}
