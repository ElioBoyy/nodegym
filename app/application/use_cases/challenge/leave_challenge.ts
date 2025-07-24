import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface LeaveChallengeRequest {
  challengeId: string
  userId: string
}

export class LeaveChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: LeaveChallengeRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const participation = await this.participationRepository.findByUserAndChallenge(
      request.userId,
      request.challengeId
    )
    if (!participation) {
      throw new Error('User is not participating in this challenge')
    }

    if (participation.isCompleted()) {
      throw new Error('Cannot leave a completed challenge')
    }

    const abandonedParticipation = participation.abandon()
    await this.participationRepository.update(abandonedParticipation)
  }
}
