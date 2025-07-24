import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import {
  ChallengeParticipationRepository,
  ParticipationFilters,
} from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetUserParticipationsRequest {
  userId: string
  filters?: ParticipationFilters
  pagination?: PaginationOptions
}

export interface GetUserParticipationsResponse {
  participations: ChallengeParticipation[]
  total: number
  page: number
  limit: number
}

export class GetUserParticipations {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: GetUserParticipationsRequest): Promise<GetUserParticipationsResponse> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const filters = {
      ...request.filters,
      userId: request.userId,
    }

    const { participations, total } = await this.participationRepository.findAll(
      filters,
      request.pagination
    )

    return {
      participations,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
