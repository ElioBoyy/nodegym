import { UserBadge } from '../entities/user_badge.js'
import { PaginationOptions } from './user_repository.js'

export interface UserBadgeFilters {
  userId?: string
  badgeId?: string
  relatedChallengeId?: string
}

export interface UserBadgeRepository {
  create(userBadge: UserBadge): Promise<UserBadge>
  findById(id: string): Promise<UserBadge | null>
  findByUserAndBadge(userId: string, badgeId: string): Promise<UserBadge | null>
  findAll(
    filters?: UserBadgeFilters,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }>
  findByUserId(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }>
  findByBadgeId(
    badgeId: string,
    pagination?: PaginationOptions
  ): Promise<{ userBadges: UserBadge[]; total: number }>
  delete(id: string): Promise<void>
  countByUserId(userId: string): Promise<number>
  countByBadgeId(badgeId: string): Promise<number>
  exists(id: string): Promise<boolean>
  existsByUserAndBadge(userId: string, badgeId: string): Promise<boolean>
}
