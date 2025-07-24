import { User, UserRole, UserProps } from '../entities/user.js'

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  isActive?: boolean
}

export class UserFactory {
  static create(request: CreateUserRequest): User {
    const userProps: UserProps = {
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      password: request.password,
      role: request.role,
      isActive: request.isActive ?? true,
    }

    return User.create(userProps)
  }

  static createClient(email: string, firstName: string, lastName: string, password: string): User {
    return this.create({
      email,
      firstName,
      lastName,
      password,
      role: UserRole.CLIENT,
      isActive: true,
    })
  }

  static createGymOwner(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): User {
    return this.create({
      email,
      firstName,
      lastName,
      password,
      role: UserRole.GYM_OWNER,
      isActive: false,
    })
  }

  static createSuperAdmin(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): User {
    return this.create({
      email,
      firstName,
      lastName,
      password,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    })
  }

  static fromSnapshot(props: UserProps & { id: string; createdAt: Date; updatedAt: Date }): User {
    return User.fromSnapshot(props)
  }
}
