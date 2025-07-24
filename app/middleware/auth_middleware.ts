import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { JwtService } from '../infrastructure/services/jwt_service.js'
import type { GetUserById } from '../application/use_cases/user/get_user_by_id.js'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const authHeader = request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.substring(7)

    try {
      if (!ctx.container) {
        return response.status(500).json({ error: 'Container not available' })
      }

      const jwtService = ctx.container.get<JwtService>('JwtService')
      const getUserByIdUseCase = ctx.container.get<GetUserById>('GetUserById')

      const payload = jwtService.verifyToken(token)
      const user = await getUserByIdUseCase.execute(payload.userId)

      if (!user.isActive) {
        return response.status(401).json({ error: 'Account is deactivated' })
      }

      ctx.auth = {
        user,
        getUserId: () => user.id,
        getUser: () => user,
        hasRole: (role: string) => user.role === role,
      }

      await next()
    } catch (error) {
      return response.status(401).json({ error: 'Invalid token' })
    }
  }
}
