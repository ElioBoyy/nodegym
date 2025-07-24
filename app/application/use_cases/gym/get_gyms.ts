import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository, GymFilters } from '../../../domain/repositories/gym_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetGymsRequest {
  filters?: GymFilters
  pagination?: PaginationOptions
}

export interface GetGymsResponse {
  gyms: Gym[]
  total: number
  page: number
  limit: number
}

export class GetGyms {
  constructor(private gymRepository: GymRepository) {}

  async execute(request: GetGymsRequest = {}): Promise<GetGymsResponse> {
    const { gyms, total } = await this.gymRepository.findAll(request.filters, request.pagination)

    return {
      gyms,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
