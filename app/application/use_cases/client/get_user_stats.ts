import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'

export interface UserStatsData {
  totalChallenges: number
  activeChallenges: number
  completedChallenges: number
  totalBadges: number
  totalWorkoutTime: number
  totalCaloriesBurned: number
  totalWorkoutSessions: number
  averageSessionDuration: number
  averageCaloriesPerSession: number
}

export class GetUserStats {
  constructor(
    private userRepository: UserRepository,
    private participationRepository: ChallengeParticipationRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(userId: string): Promise<UserStatsData> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { participations } = await this.participationRepository.findByUserId(userId)
    const { userBadges } = await this.userBadgeRepository.findByUserId(userId)

    const totalChallenges = participations.length
    const activeChallenges = participations.filter((p) => p.isActive()).length
    const completedChallenges = participations.filter((p) => p.isCompleted()).length
    const totalBadges = userBadges.length

    const totalWorkoutSessions = participations.reduce(
      (sum, p) => sum + p.getWorkoutSessionCount(),
      0
    )
    const totalWorkoutTime = participations.reduce((sum, p) => sum + p.getTotalWorkoutTime(), 0)
    const totalCaloriesBurned = participations.reduce(
      (sum, p) => sum + p.getTotalCaloriesBurned(),
      0
    )

    const averageSessionDuration =
      totalWorkoutSessions > 0 ? totalWorkoutTime / totalWorkoutSessions : 0

    const averageCaloriesPerSession =
      totalWorkoutSessions > 0 ? totalCaloriesBurned / totalWorkoutSessions : 0

    return {
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalBadges,
      totalWorkoutTime,
      totalCaloriesBurned,
      totalWorkoutSessions,
      averageSessionDuration,
      averageCaloriesPerSession,
    }
  }
}
