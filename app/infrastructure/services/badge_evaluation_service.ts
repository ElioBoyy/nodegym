import { Badge } from '../../domain/entities/badge.js'
import { User } from '../../domain/entities/user.js'
import {
  BadgeService,
  UserActivityStats,
  BadgeEligibilityResult,
} from '../../domain/services/badge_service.js'
import { BadgeRepository } from '../../domain/repositories/badge_repository.js'
import { UserBadgeRepository } from '../../domain/repositories/user_badge_repository.js'
import { ChallengeParticipationRepository } from '../../domain/repositories/challenge_participation_repository.js'
import { UserBadge } from '../../domain/entities/user_badge.js'
import { NotificationService } from '../../domain/services/notification_service.js'

export class BadgeEvaluationService implements BadgeService {
  constructor(
    private badgeRepository: BadgeRepository,
    private userBadgeRepository: UserBadgeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private notificationService: NotificationService
  ) {}

  async evaluateUserForBadges(user: User, stats: UserActivityStats): Promise<Badge[]> {
    const activeBadges = await this.badgeRepository.findActive()
    const eligibleBadges: Badge[] = []

    for (const badge of activeBadges) {
      const hasAlready = await this.userBadgeRepository.existsByUserAndBadge(user.id, badge.id)
      if (hasAlready) {
        continue
      }

      const eligibility = this.checkBadgeEligibility(badge, stats)
      if (eligibility.isEligible) {
        eligibleBadges.push(badge)
      }
    }

    return eligibleBadges
  }

  checkBadgeEligibility(badge: Badge, stats: UserActivityStats): BadgeEligibilityResult {
    const missingRequirements: string[] = []
    let isEligible = true

    for (const rule of badge.rules) {
      const userValue = stats[rule.condition] ?? 0
      if (userValue < rule.value) {
        isEligible = false
        missingRequirements.push(
          `${rule.condition}: ${userValue}/${rule.value} (need ${rule.value - userValue} more)`
        )
      }
    }

    return {
      isEligible,
      badge,
      missingRequirements: isEligible ? undefined : missingRequirements,
    }
  }

  async calculateUserStats(userId: string): Promise<UserActivityStats> {
    const { participations } = await this.participationRepository.findByUserId(userId)

    const completedChallenges = participations.filter((p) => p.isCompleted()).length
    const totalWorkoutSessions = participations.reduce(
      (sum, p) => sum + p.getWorkoutSessionCount(),
      0
    )
    const totalCaloriesBurned = participations.reduce(
      (sum, p) => sum + p.getTotalCaloriesBurned(),
      0
    )
    const totalWorkoutTime = participations.reduce((sum, p) => sum + p.getTotalWorkoutTime(), 0)
    const participationCount = participations.length

    return {
      completedChallenges,
      totalWorkoutSessions,
      totalCaloriesBurned,
      totalWorkoutTime,
      participationCount,
      currentStreak: 0,
    }
  }

  async getEligibleBadges(userId: string): Promise<Badge[]> {
    const stats = await this.calculateUserStats(userId)
    const activeBadges = await this.badgeRepository.findActive()
    const eligibleBadges: Badge[] = []

    for (const badge of activeBadges) {
      const hasAlready = await this.userBadgeRepository.existsByUserAndBadge(userId, badge.id)
      if (hasAlready) {
        continue
      }

      if (badge.isEligibleForUser(stats)) {
        eligibleBadges.push(badge)
      }
    }

    return eligibleBadges
  }

  async awardBadgeToUser(
    userId: string,
    badgeId: string,
    relatedChallengeId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const hasAlready = await this.userBadgeRepository.existsByUserAndBadge(userId, badgeId)
    if (hasAlready) {
      return
    }

    const badge = await this.badgeRepository.findById(badgeId)
    if (!badge) {
      throw new Error('Badge not found')
    }

    const userBadge = new UserBadge({
      id: crypto.randomUUID(),
      userId,
      badgeId,
      relatedChallengeId,
      metadata,
    })

    await this.userBadgeRepository.create(userBadge)
    await this.notificationService.sendBadgeEarned(userId, badge.name, badge.id)
  }
}
