import { ChallengeParticipation } from '../entities/challenge_participation.js'
import { Badge, BadgeRuleType } from '../entities/badge.js'

export interface BadgeEvaluationStrategy {
  canEarnBadge(badge: Badge, participations: ChallengeParticipation[]): boolean
  getProgressPercentage(badge: Badge, participations: ChallengeParticipation[]): number
}

export class WorkoutCountStrategy implements BadgeEvaluationStrategy {
  canEarnBadge(badge: Badge, participations: ChallengeParticipation[]): boolean {
    const totalWorkouts = participations.reduce((sum, p) => sum + p.workoutSessions.length, 0)
    const requiredWorkouts =
      badge.rules.find(
        (r) => r.type === BadgeRuleType.PARTICIPATION && r.condition === 'workout_count'
      )?.value || 0
    return totalWorkouts >= requiredWorkouts
  }

  getProgressPercentage(badge: Badge, participations: ChallengeParticipation[]): number {
    const totalWorkouts = participations.reduce((sum, p) => sum + p.workoutSessions.length, 0)
    const requiredWorkouts =
      badge.rules.find(
        (r) => r.type === BadgeRuleType.PARTICIPATION && r.condition === 'workout_count'
      )?.value || 1
    return Math.min((totalWorkouts / requiredWorkouts) * 100, 100)
  }
}

export class ConsecutiveDaysStrategy implements BadgeEvaluationStrategy {
  canEarnBadge(badge: Badge, participations: ChallengeParticipation[]): boolean {
    const requiredDays =
      badge.rules.find((r) => r.type === BadgeRuleType.STREAK && r.condition === 'consecutive_days')
        ?.value || 0
    const consecutiveDays = this.calculateConsecutiveDays(participations)
    return consecutiveDays >= requiredDays
  }

  getProgressPercentage(badge: Badge, participations: ChallengeParticipation[]): number {
    const requiredDays =
      badge.rules.find((r) => r.type === BadgeRuleType.STREAK && r.condition === 'consecutive_days')
        ?.value || 1
    const consecutiveDays = this.calculateConsecutiveDays(participations)
    return Math.min((consecutiveDays / requiredDays) * 100, 100)
  }

  private calculateConsecutiveDays(participations: ChallengeParticipation[]): number {
    const workoutDates = participations
      .flatMap((p) => p.workoutSessions.map((s) => s.date))
      .map((date) => date.toDateString())
      .sort()

    let maxStreak = 0
    let currentStreak = 1

    for (let i = 1; i < workoutDates.length; i++) {
      const currentDate = new Date(workoutDates[i])
      const previousDate = new Date(workoutDates[i - 1])
      const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)

      if (dayDiff === 1) {
        currentStreak++
      } else {
        maxStreak = Math.max(maxStreak, currentStreak)
        currentStreak = 1
      }
    }

    return Math.max(maxStreak, currentStreak)
  }
}

export class TotalCaloriesStrategy implements BadgeEvaluationStrategy {
  canEarnBadge(badge: Badge, participations: ChallengeParticipation[]): boolean {
    const totalCalories = participations.reduce((sum, p) => sum + p.getTotalCaloriesBurned(), 0)
    const requiredCalories =
      badge.rules.find((r) => r.type === BadgeRuleType.CUSTOM && r.condition === 'total_calories')
        ?.value || 0
    return totalCalories >= requiredCalories
  }

  getProgressPercentage(badge: Badge, participations: ChallengeParticipation[]): number {
    const totalCalories = participations.reduce((sum, p) => sum + p.getTotalCaloriesBurned(), 0)
    const requiredCalories =
      badge.rules.find((r) => r.type === BadgeRuleType.CUSTOM && r.condition === 'total_calories')
        ?.value || 1
    return Math.min((totalCalories / requiredCalories) * 100, 100)
  }
}

export class BadgeEvaluationContext {
  private strategy: BadgeEvaluationStrategy

  constructor(strategy: BadgeEvaluationStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: BadgeEvaluationStrategy): void {
    this.strategy = strategy
  }

  canEarnBadge(badge: Badge, participations: ChallengeParticipation[]): boolean {
    return this.strategy.canEarnBadge(badge, participations)
  }

  getProgressPercentage(badge: Badge, participations: ChallengeParticipation[]): number {
    return this.strategy.getProgressPercentage(badge, participations)
  }
}
