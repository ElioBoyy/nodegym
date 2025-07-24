import { User, UserRole } from '../../../domain/entities/user.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { PasswordService } from '../../../domain/services/password_service.js'

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  acceptLanguage?: string
}

export class CreateUser {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(request.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await this.passwordService.hash(request.password)

    const user = User.create({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      password: hashedPassword,
      role: request.role,
    })

    return await this.userRepository.create(user)
  }
}
