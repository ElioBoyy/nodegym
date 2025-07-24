import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface GymStatsData {
  gym: {
    id: string
    name: string
    status: string
    totalChallenges: number
    totalParticipants: number
  }
  challengeStats: {
    total: number
    active: number
    completed: number
  }
  participationStats: {
    total: number
    active: number
    completed: number
  }
  monthlyStats: {
    newParticipants: number
    completedChallenges: number
    totalWorkoutSessions: number
  }
  recentChallenges: Array<{
    id: string
    title: string
    participantsCount: number
    status: string
    createdAt: Date
  }>
}

export class GetGymStats {
  constructor(
    private userRepository: UserRepository,
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(userId: string): Promise<GymStatsData> {
    const user = await this.userRepository.findById(userId)
    if (!user || !user.isGymOwner()) {
      throw new Error('Unauthorized: Only gym owners can access gym stats')
    }

    const gym = await this.gymRepository.findByOwnerId(userId)
    if (!gym) {
      throw new Error('Gym not found')
    }

    const { challenges } = await this.challengeRepository.findByGymId(gym.id)

    const challengeStats = {
      total: challenges.length,
      active: challenges.filter((c) => c.isActive()).length,
      completed: challenges.filter((c) => c.isCompleted()).length,
    }

    const allParticipations = []
    for (const challenge of challenges) {
      const { participations } = await this.participationRepository.findByChallengeId(challenge.id)
      allParticipations.push(...participations)
    }

    const participationStats = {
      total: allParticipations.length,
      active: allParticipations.filter((p) => p.isActive()).length,
      completed: allParticipations.filter((p) => p.isCompleted()).length,
    }

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyParticipants = allParticipations.filter((p) => p.joinedAt >= currentMonth).length

    const monthlyCompletedChallenges = challenges.filter(
      (c) => c.isCompleted() && c.updatedAt >= currentMonth
    ).length

    const monthlyWorkoutSessions = allParticipations.reduce(
      (sum, p) => sum + p.workoutSessions.filter((session) => session.date >= currentMonth).length,
      0
    )

    const recentChallenges = challenges
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(async (challenge) => {
        const participantsCount = await this.participationRepository.countByChallengeId(
          challenge.id
        )
        return {
          id: challenge.id,
          title: challenge.title,
          participantsCount,
          status: challenge.status,
          createdAt: challenge.createdAt,
        }
      })

    const resolvedRecentChallenges = await Promise.all(recentChallenges)

    const uniqueParticipants = new Set(allParticipations.map((p) => p.userId)).size

    return {
      gym: {
        id: gym.id,
        name: gym.name,
        status: gym.status,
        totalChallenges: challenges.length,
        totalParticipants: uniqueParticipants,
      },
      challengeStats,
      participationStats,
      monthlyStats: {
        newParticipants: monthlyParticipants,
        completedChallenges: monthlyCompletedChallenges,
        totalWorkoutSessions: monthlyWorkoutSessions,
      },
      recentChallenges: resolvedRecentChallenges,
    }
  }
}
