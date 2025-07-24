import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface UpdateWorkoutSessionRequest {
  participationId: string
  sessionId: string
  userId: string
  duration?: number
  caloriesBurned?: number
  exercisesCompleted?: string[]
  notes?: string
  date?: Date
}

export class UpdateWorkoutSession {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateWorkoutSessionRequest): Promise<ChallengeParticipation> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const participation = await this.participationRepository.findById(request.participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    if (!participation.belongsToUser(request.userId)) {
      throw new Error('Unauthorized: Can only update own workout sessions')
    }

    const session = participation.getWorkoutSession(request.sessionId)
    if (!session) {
      throw new Error('Workout session not found')
    }

    const updatedParticipation = participation.updateWorkoutSession(request.sessionId, {
      duration: request.duration,
      caloriesBurned: request.caloriesBurned,
      exercisesCompleted: request.exercisesCompleted,
      notes: request.notes,
      date: request.date,
    })

    return await this.participationRepository.update(updatedParticipation)
  }
}
