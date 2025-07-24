import { Command, CommandHandler } from './command_handler.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { PasswordService } from '../../domain/services/password_service.js'
import { DomainEventDispatcher } from '../../domain/events/domain_event_dispatcher.js'
import { User, UserRole } from '../../domain/entities/user.js'
import {
  UserRegisteredEvent,
  UserActivatedEvent,
  UserDeactivatedEvent,
} from '../../domain/events/user_events.js'

export class CreateUserCommand implements Command<User> {
  readonly commandType = 'CreateUser'

  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly password: string,
    public readonly role: UserRole
  ) {}
}

export class ActivateUserCommand implements Command<void> {
  readonly commandType = 'ActivateUser'

  constructor(
    public readonly userId: string,
    public readonly activatedBy: string
  ) {}
}

export class DeactivateUserCommand implements Command<void> {
  readonly commandType = 'DeactivateUser'

  constructor(
    public readonly userId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string
  ) {}
}

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, User> {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async handle(command: CreateUserCommand): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(command.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await this.passwordService.hash(command.password)
    const user = User.create({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      password: hashedPassword,
      role: command.role,
      isActive: true,
    })

    await this.userRepository.create(user)

    const event = new UserRegisteredEvent(user.id, user.email, user.role, user.firstName)
    await this.eventDispatcher.dispatch(event)

    return user
  }
}

export class ActivateUserCommandHandler implements CommandHandler<ActivateUserCommand, void> {
  constructor(
    private userRepository: UserRepository,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async handle(command: ActivateUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const activatedUser = user.activate(command.activatedBy)
    await this.userRepository.update(activatedUser)

    const event = new UserActivatedEvent(user.id, command.activatedBy)
    await this.eventDispatcher.dispatch(event)
  }
}

export class DeactivateUserCommandHandler implements CommandHandler<DeactivateUserCommand, void> {
  constructor(
    private userRepository: UserRepository,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  async handle(command: DeactivateUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const deactivatedUser = user.deactivate(command.deactivatedBy, command.reason)
    await this.userRepository.update(deactivatedUser)

    const event = new UserDeactivatedEvent(user.id, command.deactivatedBy, command.reason)
    await this.eventDispatcher.dispatch(event)
  }
}
