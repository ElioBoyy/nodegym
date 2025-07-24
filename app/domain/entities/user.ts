import { AggregateRoot } from '../events/aggregate_root.js'
import {
  UserRegisteredEvent,
  UserActivatedEvent,
  UserDeactivatedEvent,
} from '../events/user_events.js'

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GYM_OWNER = 'gym_owner',
  CLIENT = 'client',
}

export interface UserProps {
  email: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  isActive?: boolean
}

export class User extends AggregateRoot {
  public readonly id: string
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string
  public readonly password: string
  public readonly role: UserRole
  public readonly isActive: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserProps & { id: string; createdAt: Date; updatedAt: Date }) {
    super()
    this.id = props.id
    this.email = props.email
    this.firstName = props.firstName
    this.lastName = props.lastName
    this.password = props.password
    this.role = props.role
    this.isActive = props.isActive ?? true
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: UserProps): User {
    const user = new User({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    user.addDomainEvent(new UserRegisteredEvent(user.id, user.email, user.role, user.firstName))
    return user
  }

  static fromSnapshot(props: UserProps & { id: string; createdAt: Date; updatedAt: Date }): User {
    return new User(props)
  }

  deactivate(deactivatedBy: string, reason?: string): User {
    const user = new User({
      ...this.toPlainObject(),
      isActive: false,
      updatedAt: new Date(),
    })

    user.addDomainEvent(new UserDeactivatedEvent(this.id, deactivatedBy, reason))
    return user
  }

  activate(activatedBy: string): User {
    const user = new User({
      ...this.toPlainObject(),
      isActive: true,
      updatedAt: new Date(),
    })

    user.addDomainEvent(new UserActivatedEvent(this.id, activatedBy))
    return user
  }

  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN
  }

  isGymOwner(): boolean {
    return this.role === UserRole.GYM_OWNER
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT
  }

  hasRole(role: UserRole): boolean {
    return this.role === role
  }

  private toPlainObject(): UserProps & { id: string; createdAt: Date; updatedAt: Date } {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
