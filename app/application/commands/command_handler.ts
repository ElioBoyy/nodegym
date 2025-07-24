export interface Command<TResult = void> {
  readonly commandType: string
}

export interface CommandHandler<TCommand extends Command<TResult>, TResult = void> {
  handle(command: TCommand): Promise<TResult>
}

export interface CommandBus {
  execute<TResult>(command: Command<TResult>): Promise<TResult>
}

export class InMemoryCommandBus implements CommandBus {
  private handlers = new Map<string, CommandHandler<any, any>>()

  register<TCommand extends Command<TResult>, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>
  ): void {
    this.handlers.set(commandType, handler)
  }

  async execute<TResult>(command: Command<TResult>): Promise<TResult> {
    const handler = this.handlers.get(command.commandType)
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.commandType}`)
    }
    return handler.handle(command)
  }
}
