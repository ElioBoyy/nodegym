import type { HttpContext } from '@adonisjs/core/http'
import '../types/http.js'
import { CreateUser } from '../application/use_cases/user/create_user.js'
import { AuthenticateUser } from '../application/use_cases/user/authenticate_user.js'
import { GetUserById } from '../application/use_cases/user/get_user_by_id.js'
import { JwtService } from '../infrastructure/services/jwt_service.js'
import { AuthResponseDto, UserResponseDto } from '../dto/user.dto.js'
import { createUserValidator, authUserValidator } from '../validators/user_validator.js'
import {
  NotificationServiceAdapter,
  EmailProviderAdapter,
} from '../infrastructure/anti_corruption/external_notification_adapter.js'
import { UserRepository } from '../domain/repositories/user_repository.js'

export default class AuthController {
  constructor(
    private createUserUseCase: CreateUser,
    private authenticateUserUseCase: AuthenticateUser,
    private getUserByIdUseCase: GetUserById,
    private jwtService: JwtService,
    private userRepository: UserRepository
  ) {}

  async register({ request, response }: HttpContext) {
    try {
      const data = await createUserValidator.validate(request.body())
      const acceptLanguage = request.header('Accept-Language')

      // Ajouter acceptLanguage aux données pour le use case
      const userRequest = {
        ...data,
        acceptLanguage,
      }

      const user = await this.createUserUseCase.execute(userRequest)

      // Envoyer la notification de bienvenue avec i18n
      try {
        const emailProvider = new EmailProviderAdapter(undefined, acceptLanguage)
        const notificationService = new NotificationServiceAdapter(
          emailProvider,
          this.userRepository,
          undefined,
          acceptLanguage
        )

        await notificationService.sendWelcomeNotification(user.email, user.firstName)
        console.log(
          `📧 Welcome notification sent to ${user.email} in ${notificationService.getLocale()}`
        )
      } catch (notificationError) {
        console.error('Failed to send welcome notification:', notificationError)
        // Ne pas faire échouer l'inscription si la notification échoue
      }

      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      const authResponse: AuthResponseDto = {
        user: this.mapToUserResponse(user),
        token,
      }

      return response.status(201).json(authResponse)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const data = await authUserValidator.validate(request.body())

      const { user, isAuthenticated } = await this.authenticateUserUseCase.execute(data)

      if (!isAuthenticated) {
        return response.status(401).json({ error: 'Invalid credentials' })
      }

      const token = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      const authResponse: AuthResponseDto = {
        user: this.mapToUserResponse(user),
        token,
      }

      return response.json(authResponse)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      if (!auth) {
        return response.status(401).json({ error: 'Authentication required' })
      }
      const userId = auth.getUserId()
      const user = await this.getUserByIdUseCase.execute(userId)

      return response.json(this.mapToUserResponse(user))
    } catch (error) {
      return response.status(404).json({ error: error.message })
    }
  }

  async logout({ response }: HttpContext) {
    return response.json({ message: 'Logged out successfully' })
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
