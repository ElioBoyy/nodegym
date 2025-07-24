import { Badge } from '../entities/badge.js'
import { User } from '../entities/user.js'

export interface UserActivityStats {
  completedChallenges: number
  totalWorkoutSessions: number
  totalCaloriesBurned: number
  totalWorkoutTime: number
  currentStreak: number
  participationCount: number
  [key: string]: number
}

export interface BadgeEligibilityResult {
  isEligible: boolean
  badge: Badge
  missingRequirements?: string[]
}

export interface BadgeService {
  evaluateUserForBadges(user: User, stats: UserActivityStats): Promise<Badge[]>
  checkBadgeEligibility(badge: Badge, stats: UserActivityStats): BadgeEligibilityResult
  calculateUserStats(userId: string): Promise<UserActivityStats>
  getEligibleBadges(userId: string): Promise<Badge[]>
  awardBadgeToUser(
    userId: string,
    badgeId: string,
    relatedChallengeId?: string,
    metadata?: Record<string, any>
  ): Promise<void>
}
