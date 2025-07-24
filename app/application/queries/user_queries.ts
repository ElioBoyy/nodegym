import { Query, QueryHandler } from './query_handler.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { UserRole } from '../../domain/entities/user.js'

export interface UserSummary {
  id: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  totalChallenges?: number
  totalBadges?: number
}

export class GetUserSummaryQuery implements Query {
  readonly queryType = 'GetUserSummary'

  constructor(public readonly userId: string) {}
}

export class GetUsersListQuery implements Query {
  readonly queryType = 'GetUsersList'

  constructor(
    public readonly filters?: {
      role?: UserRole
      isActive?: boolean
      search?: string
    },
    public readonly pagination?: {
      page: number
      limit: number
    }
  ) {}
}

export class GetUserSummaryQueryHandler implements QueryHandler<GetUserSummaryQuery, UserSummary> {
  constructor(private userRepository: UserRepository) {}

  async handle(query: GetUserSummaryQuery): Promise<UserSummary> {
    const user = await this.userRepository.findById(query.userId)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }
}

export class GetUsersListQueryHandler implements QueryHandler<GetUsersListQuery, UserSummary[]> {
  constructor(private userRepository: UserRepository) {}

  async handle(query: GetUsersListQuery): Promise<UserSummary[]> {
    const { users } = await this.userRepository.findAll(query.filters, query.pagination)

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }))
  }
}
