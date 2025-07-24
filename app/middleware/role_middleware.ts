import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '../domain/entities/user.js'

abstract class RoleMiddleware {
  protected abstract allowedRoles: UserRole[]

  async handle(ctx: HttpContext, next: NextFn) {
    const { response, auth } = ctx

    if (!auth || !auth.user) {
      return response.status(401).json({ error: 'Authentication required' })
    }

    const userRole = auth.user.role as UserRole
    if (!this.allowedRoles.includes(userRole)) {
      return response.status(403).json({ error: 'Insufficient permissions' })
    }

    await next()
  }
}

export class SuperAdminMiddleware extends RoleMiddleware {
  protected allowedRoles = [UserRole.SUPER_ADMIN]
}

export class GymOwnerMiddleware extends RoleMiddleware {
  protected allowedRoles = [UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]
}

export class ClientMiddleware extends RoleMiddleware {
  protected allowedRoles = [UserRole.CLIENT, UserRole.GYM_OWNER, UserRole.SUPER_ADMIN]
}

export const superAdminMiddleware = SuperAdminMiddleware
export const gymOwnerMiddleware = GymOwnerMiddleware
export const clientMiddleware = ClientMiddleware
