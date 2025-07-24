import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface DeleteWorkoutSessionRequest {
  participationId: string
  sessionId: string
  userId: string
}

export class DeleteWorkoutSession {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: DeleteWorkoutSessionRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const participation = await this.participationRepository.findById(request.participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    if (!participation.belongsToUser(request.userId)) {
      throw new Error('Unauthorized: Can only delete own workout sessions')
    }

    const session = participation.getWorkoutSession(request.sessionId)
    if (!session) {
      throw new Error('Workout session not found')
    }

    const updatedParticipation = participation.removeWorkoutSession(request.sessionId)
    await this.participationRepository.update(updatedParticipation)
  }
}
