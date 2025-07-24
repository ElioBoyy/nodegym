import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { WorkoutSession } from '../../../domain/entities/challenge_participation.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface WorkoutHistoryRequest {
  userId: string
  pagination?: PaginationOptions
}

export interface WorkoutHistoryResponse {
  sessions: WorkoutSession[]
  stats: {
    totalSessions: number
    totalTime: number
    totalCalories: number
    averageDuration: number
    averageCalories: number
  }
  total: number
  page: number
  limit: number
}

export class GetWorkoutHistory {
  constructor(
    private userRepository: UserRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: WorkoutHistoryRequest): Promise<WorkoutHistoryResponse> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { participations } = await this.participationRepository.findByUserId(request.userId)

    const allSessions = participations
      .flatMap((p) => p.workoutSessions)
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    const totalSessions = allSessions.length
    const totalTime = allSessions.reduce((sum, session) => sum + session.duration, 0)
    const totalCalories = allSessions.reduce((sum, session) => sum + session.caloriesBurned, 0)

    const averageDuration = totalSessions > 0 ? totalTime / totalSessions : 0
    const averageCalories = totalSessions > 0 ? totalCalories / totalSessions : 0

    const page = request.pagination?.page ?? 1
    const limit = request.pagination?.limit ?? 10
    const skip = (page - 1) * limit

    const paginatedSessions = allSessions.slice(skip, skip + limit)

    return {
      sessions: paginatedSessions,
      stats: {
        totalSessions,
        totalTime,
        totalCalories,
        averageDuration,
        averageCalories,
      },
      total: totalSessions,
      page,
      limit,
    }
  }
}
