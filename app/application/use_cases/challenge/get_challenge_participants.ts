import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import {
  ChallengeParticipationRepository,
  ParticipationFilters,
} from '../../../domain/repositories/challenge_participation_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetChallengeParticipantsRequest {
  challengeId: string
  filters?: ParticipationFilters
  pagination?: PaginationOptions
}

export interface GetChallengeParticipantsResponse {
  participants: ChallengeParticipation[]
  total: number
  page: number
  limit: number
}

export class GetChallengeParticipants {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(
    request: GetChallengeParticipantsRequest
  ): Promise<GetChallengeParticipantsResponse> {
    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const filters = {
      ...request.filters,
      challengeId: request.challengeId,
    }

    const { participations, total } = await this.participationRepository.findAll(
      filters,
      request.pagination
    )

    return {
      participants: participations,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
