import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'

export interface ClientDashboardData {
  activeChallenges: number
  completedChallenges: number
  totalBadges: number
  totalWorkoutTime: number
  totalCaloriesBurned: number
  currentStreak: number
  monthlyStats: {
    workoutSessions: number
    totalTime: number
    totalCalories: number
  }
  recentChallenges: Array<{
    id: string
    title: string
    progress: number
    status: string
  }>
  recentBadges: Array<{
    id: string
    badgeId: string
    name: string
    earnedAt: Date
  }>
}

export class GetDashboardData {
  constructor(
    private userRepository: UserRepository,
    private participationRepository: ChallengeParticipationRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(userId: string): Promise<ClientDashboardData> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { participations } = await this.participationRepository.findByUserId(userId)
    const { userBadges } = await this.userBadgeRepository.findByUserId(userId)

    const activeChallenges = participations.filter((p) => p.isActive()).length
    const completedChallenges = participations.filter((p) => p.isCompleted()).length
    const totalBadges = userBadges.length

    const totalWorkoutTime = participations.reduce((sum, p) => sum + p.getTotalWorkoutTime(), 0)
    const totalCaloriesBurned = participations.reduce(
      (sum, p) => sum + p.getTotalCaloriesBurned(),
      0
    )

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyParticipations = participations.filter((p) =>
      p.workoutSessions.some((session) => session.date >= currentMonth)
    )

    const monthlyWorkoutSessions = monthlyParticipations.reduce(
      (sum, p) => sum + p.workoutSessions.filter((session) => session.date >= currentMonth).length,
      0
    )

    const monthlyTime = monthlyParticipations.reduce(
      (sum, p) =>
        sum +
        p.workoutSessions
          .filter((session) => session.date >= currentMonth)
          .reduce((sessionSum, session) => sessionSum + session.duration, 0),
      0
    )

    const monthlyCalories = monthlyParticipations.reduce(
      (sum, p) =>
        sum +
        p.workoutSessions
          .filter((session) => session.date >= currentMonth)
          .reduce((sessionSum, session) => sessionSum + session.caloriesBurned, 0),
      0
    )

    const recentChallenges = participations
      .sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: `Challenge ${p.challengeId}`,
        progress: p.progress,
        status: p.status,
      }))

    const recentBadges = userBadges
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
      .slice(0, 5)
      .map((ub) => ({
        id: ub.id,
        badgeId: ub.badgeId,
        name: `Badge ${ub.badgeId}`,
        earnedAt: ub.earnedAt,
      }))

    return {
      activeChallenges,
      completedChallenges,
      totalBadges,
      totalWorkoutTime,
      totalCaloriesBurned,
      currentStreak: 0,
      monthlyStats: {
        workoutSessions: monthlyWorkoutSessions,
        totalTime: monthlyTime,
        totalCalories: monthlyCalories,
      },
      recentChallenges,
      recentBadges,
    }
  }
}
