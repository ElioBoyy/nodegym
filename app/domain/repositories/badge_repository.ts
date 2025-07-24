import { Badge } from '../entities/badge.js'
import { PaginationOptions } from './user_repository.js'

export interface BadgeFilters {
  isActive?: boolean
}

export interface BadgeRepository {
  create(badge: Badge): Promise<Badge>
  findById(id: string): Promise<Badge | null>
  findAll(
    filters?: BadgeFilters,
    pagination?: PaginationOptions
  ): Promise<{ badges: Badge[]; total: number }>
  findActive(): Promise<Badge[]>
  update(badge: Badge): Promise<Badge>
  delete(id: string): Promise<void>
  countActive(): Promise<number>
  exists(id: string): Promise<boolean>
}
