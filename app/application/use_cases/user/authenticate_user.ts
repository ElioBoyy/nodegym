import { User } from '../../../domain/entities/user.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { PasswordService } from '../../../domain/services/password_service.js'

export interface AuthenticateUserRequest {
  email: string
  password: string
}

export interface AuthenticateUserResponse {
  user: User
  isAuthenticated: boolean
}

export class AuthenticateUser {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(request.email)
    if (!user) {
      return { user: null as any, isAuthenticated: false }
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated')
    }

    const isPasswordValid = await this.passwordService.verify(user.password, request.password)
    if (!isPasswordValid) {
      return { user: null as any, isAuthenticated: false }
    }

    return { user, isAuthenticated: true }
  }
}
