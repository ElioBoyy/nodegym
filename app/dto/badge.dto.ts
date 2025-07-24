import { BadgeRule } from '../domain/entities/badge.js'

export interface CreateBadgeDto {
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
}

export interface UpdateBadgeDto {
  name?: string
  description?: string
  iconUrl?: string
  rules?: BadgeRule[]
}

export interface BadgeResponseDto {
  id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BadgeListDto {
  badges: BadgeResponseDto[]
  total: number
  page: number
  limit: number
}

export interface UserBadgeResponseDto {
  id: string
  userId: string
  badgeId: string
  badge: BadgeResponseDto
  earnedAt: Date
  relatedChallengeId?: string
  metadata?: Record<string, any>
}

export interface UserBadgeListDto {
  badges: UserBadgeResponseDto[]
  total: number
  page: number
  limit: number
}
