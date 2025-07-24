import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface DeleteChallengeRequest {
  challengeId: string
  userId: string
}

export class DeleteChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private userRepository: UserRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: DeleteChallengeRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (!user.isSuperAdmin() && !challenge.belongsTo(request.userId)) {
      throw new Error('Unauthorized: Can only delete own challenges')
    }

    const participantsCount = await this.participationRepository.countByChallengeId(
      request.challengeId
    )
    if (participantsCount > 0) {
      throw new Error('Cannot delete challenge with active participants')
    }

    await this.challengeRepository.delete(request.challengeId)
  }
}
