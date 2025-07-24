import { User } from '../domain/entities/user.js'
import { DIContainer } from '../infrastructure/dependency_injection/container.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth?: {
      user: User
      getUserId(): string
      getUser(): User
      hasRole(role: string): boolean
    }
    container?: DIContainer
  }
}

export {}
