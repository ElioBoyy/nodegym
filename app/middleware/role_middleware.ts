import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '../domain/entities/user.js'

export function createRoleMiddleware(allowedRoles: UserRole[]) {
  return (ctx: HttpContext, next: NextFn) => {
    const { response, auth } = ctx

    if (!auth || !auth.user) {
      return response.status(401).json({ error: 'Authentication required' })
    }

    const userRole = auth.user.role as UserRole
    if (!allowedRoles.includes(userRole)) {
      return response.status(403).json({ error: 'Insufficient permissions' })
    }

    return next()
  }
}

export const superAdminMiddleware = createRoleMiddleware([UserRole.SUPER_ADMIN])
export const gymOwnerMiddleware = createRoleMiddleware([UserRole.GYM_OWNER, UserRole.SUPER_ADMIN])
export const clientMiddleware = createRoleMiddleware([
  UserRole.CLIENT,
  UserRole.GYM_OWNER,
  UserRole.SUPER_ADMIN,
])
