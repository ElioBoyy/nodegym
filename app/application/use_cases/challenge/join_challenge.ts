import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { NotificationService } from '../../../domain/services/notification_service.js'

export interface JoinChallengeRequest {
  challengeId: string
  userId: string
}

export class JoinChallenge {
  constructor(
    private challengeRepository: ChallengeRepository,
    private challengeParticipationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async execute(request: JoinChallengeRequest): Promise<ChallengeParticipation> {
    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (!challenge.isActive()) {
      throw new Error('Challenge is not active')
    }

    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const existingParticipation =
      await this.challengeParticipationRepository.findByUserAndChallenge(
        request.userId,
        request.challengeId
      )
    if (existingParticipation) {
      throw new Error('User is already participating in this challenge')
    }

    if (challenge.hasMaxParticipants()) {
      const currentParticipants = await this.challengeParticipationRepository.countByChallengeId(
        request.challengeId
      )
      if (!challenge.canAcceptParticipants(currentParticipants)) {
        throw new Error('Challenge has reached maximum participants')
      }
    }

    const participation = new ChallengeParticipation({
      id: crypto.randomUUID(),
      challengeId: request.challengeId,
      userId: request.userId,
    })

    const createdParticipation = await this.challengeParticipationRepository.create(participation)

    await this.notificationService.sendChallengeJoined(
      request.userId,
      challenge.title,
      challenge.id
    )

    return createdParticipation
  }
}
