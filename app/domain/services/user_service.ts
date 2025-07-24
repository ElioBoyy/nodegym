import { User, UserRole } from '../entities/user.js'

export interface UserService {
  canUserPerformAction(user: User, action: string, targetUserId?: string): boolean
  isEligibleForPromotion(user: User, targetRole: UserRole): boolean
  calculateUserLevel(workoutSessions: number, badges: number): number
  getUserPermissions(user: User): string[]
}

export class DomainUserService implements UserService {
  canUserPerformAction(user: User, action: string, targetUserId?: string): boolean {
    if (!user.isActive) {
      return false
    }

    switch (action) {
      case 'manage_users':
        return user.role === UserRole.SUPER_ADMIN
      case 'approve_gyms':
        return user.role === UserRole.SUPER_ADMIN
      case 'create_badges':
        return user.role === UserRole.SUPER_ADMIN
      case 'manage_gym':
        return user.role === UserRole.GYM_OWNER || user.role === UserRole.SUPER_ADMIN
      case 'join_challenges':
        return user.role === UserRole.CLIENT
      case 'view_profile':
        return targetUserId ? user.id === targetUserId || user.role === UserRole.SUPER_ADMIN : true
      default:
        return false
    }
  }

  isEligibleForPromotion(user: User, targetRole: UserRole): boolean {
    if (!user.isActive) {
      return false
    }

    const roleHierarchy = {
      [UserRole.CLIENT]: 1,
      [UserRole.GYM_OWNER]: 2,
      [UserRole.SUPER_ADMIN]: 3,
    }

    const currentLevel = roleHierarchy[user.role]
    const targetLevel = roleHierarchy[targetRole]

    return targetLevel > currentLevel
  }

  calculateUserLevel(workoutSessions: number, badges: number): number {
    const sessionPoints = workoutSessions * 10
    const badgePoints = badges * 50
    const totalPoints = sessionPoints + badgePoints

    if (totalPoints >= 1000) return 10
    if (totalPoints >= 500) return 8
    if (totalPoints >= 250) return 6
    if (totalPoints >= 100) return 4
    if (totalPoints >= 50) return 2
    return 1
  }

  getUserPermissions(user: User): string[] {
    const permissions: string[] = []

    if (!user.isActive) {
      return permissions
    }

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        permissions.push(
          'manage_users',
          'approve_gyms',
          'create_badges',
          'manage_challenges',
          'view_analytics',
          'system_admin'
        )
        break
      case UserRole.GYM_OWNER:
        permissions.push('manage_gym', 'create_challenges', 'view_gym_analytics', 'manage_members')
        break
      case UserRole.CLIENT:
        permissions.push('join_challenges', 'view_progress', 'earn_badges', 'view_profile')
        break
    }

    return permissions
  }
}
