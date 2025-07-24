import { Challenge } from '../../../domain/entities/challenge.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetGymChallengesRequest {
  userId: string
  pagination?: PaginationOptions
}

export interface GetGymChallengesResponse {
  challenges: Challenge[]
  total: number
  page: number
  limit: number
}

export class GetGymChallenges {
  constructor(
    private userRepository: UserRepository,
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository
  ) {}

  async execute(request: GetGymChallengesRequest): Promise<GetGymChallengesResponse> {
    const user = await this.userRepository.findById(request.userId)
    if (!user || !user.isGymOwner()) {
      throw new Error('Unauthorized: Only gym owners can access gym challenges')
    }

    const gym = await this.gymRepository.findByOwnerId(request.userId)
    if (!gym) {
      throw new Error('Gym not found')
    }

    const { challenges, total } = await this.challengeRepository.findByGymId(
      gym.id,
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
