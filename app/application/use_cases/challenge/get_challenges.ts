import { Challenge } from '../../../domain/entities/challenge.js'
import {
  ChallengeRepository,
  ChallengeFilters,
} from '../../../domain/repositories/challenge_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetChallengesRequest {
  filters?: ChallengeFilters
  pagination?: PaginationOptions
}

export interface GetChallengesResponse {
  challenges: Challenge[]
  total: number
  page: number
  limit: number
}

export class GetChallenges {
  constructor(private challengeRepository: ChallengeRepository) {}

  async execute(request: GetChallengesRequest = {}): Promise<GetChallengesResponse> {
    const { challenges, total } = await this.challengeRepository.findAll(
      request.filters,
      request.pagination
    )

    return {
      challenges,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
