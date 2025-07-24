import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface GetParticipationByIdRequest {
  participationId: string
  userId: string
}

export class GetParticipationById {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: GetParticipationByIdRequest): Promise<ChallengeParticipation> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const participation = await this.participationRepository.findById(request.participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    if (!user.isSuperAdmin() && !participation.belongsToUser(request.userId)) {
      throw new Error('Unauthorized: Can only access own participations')
    }

    return participation
  }
}
