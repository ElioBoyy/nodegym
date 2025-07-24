import { Badge } from '../../../domain/entities/badge.js'
import { BadgeRepository, BadgeFilters } from '../../../domain/repositories/badge_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetBadgesRequest {
  filters?: BadgeFilters
  pagination?: PaginationOptions
}

export interface GetBadgesResponse {
  badges: Badge[]
  total: number
  page: number
  limit: number
}

export class GetBadges {
  constructor(private badgeRepository: BadgeRepository) {}

  async execute(request: GetBadgesRequest = {}): Promise<GetBadgesResponse> {
    const { badges, total } = await this.badgeRepository.findAll(
      request.filters,
      request.pagination
    )

    return {
      badges,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
