import { UserBadge } from '../../../domain/entities/user_badge.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { PaginationOptions } from '../../../domain/repositories/user_repository.js'

export interface GetUserBadgesRequest {
  userId: string
  pagination?: PaginationOptions
}

export interface GetUserBadgesResponse {
  userBadges: UserBadge[]
  total: number
  page: number
  limit: number
}

export class GetUserBadges {
  constructor(
    private userBadgeRepository: UserBadgeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: GetUserBadgesRequest): Promise<GetUserBadgesResponse> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const { userBadges, total } = await this.userBadgeRepository.findByUserId(
      request.userId,
      request.pagination
    )

    return {
      userBadges,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
