import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetPendingGymsRequest {
  pagination?: PaginationOptions
}

export interface GetPendingGymsResponse {
  gyms: Gym[]
  total: number
  page: number
  limit: number
}

export class GetPendingGyms {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: GetPendingGymsRequest = {}): Promise<GetPendingGymsResponse> {
    const { gyms, total } = await this.gymRepository.findPending(request.pagination)

    return {
      gyms,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
