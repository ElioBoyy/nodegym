import { Challenge, ChallengeDifficulty } from '../../../domain/entities/challenge.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface UpdateChallengeRequest {
  challengeId: string
  userId: string
  title?: string
  description?: string
  objectives?: string[]
  exerciseTypes?: string[]
  duration?: number
  difficulty?: ChallengeDifficulty
  maxParticipants?: number
}

export class UpdateChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateChallengeRequest): Promise<Challenge> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (!user.isSuperAdmin() && !challenge.belongsTo(request.userId)) {
      throw new Error('Unauthorized: Can only update own challenges')
    }

    const updatedChallenge = challenge.update({
      title: request.title,
      description: request.description,
      objectives: request.objectives,
      exerciseTypes: request.exerciseTypes,
      duration: request.duration,
      difficulty: request.difficulty,
      maxParticipants: request.maxParticipants,
    })

    return await this.challengeRepository.update(updatedChallenge)
  }
}
