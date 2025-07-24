import { User, UserRole } from '../domain/entities/user.js'

export class AuthHelper {
  static hasRole(user: User, role: UserRole): boolean {
    return user.role === role
  }

  static isSuperAdmin(user: User): boolean {
    return user.role === UserRole.SUPER_ADMIN
  }

  static isGymOwner(user: User): boolean {
    return user.role === UserRole.GYM_OWNER
  }

  static isClient(user: User): boolean {
    return user.role === UserRole.CLIENT
  }

  static canAccessAdminFeatures(user: User): boolean {
    return user.role === UserRole.SUPER_ADMIN
  }

  static canManageGym(user: User, gymOwnerId?: string): boolean {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }
    if (user.role === UserRole.GYM_OWNER && gymOwnerId) {
      return user.id === gymOwnerId
    }
    return false
  }

  static canManageChallenge(user: User, challengeCreatorId?: string, gymOwnerId?: string): boolean {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }
    if (challengeCreatorId && user.id === challengeCreatorId) {
      return true
    }
    if (user.role === UserRole.GYM_OWNER && gymOwnerId && user.id === gymOwnerId) {
      return true
    }
    return false
  }

  static canAccessResource(user: User, resourceOwnerId: string): boolean {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }
    return user.id === resourceOwnerId
  }

  static validateUserAccess(user: User, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role)
  }
}
