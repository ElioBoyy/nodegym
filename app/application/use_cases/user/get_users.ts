import { User } from '../../../domain/entities/user.js'
import {
  UserRepository,
  UserFilters,
  PaginationOptions,
} from '../../../domain/repositories/user_repository.js'

export interface GetUsersRequest {
  filters?: UserFilters
  pagination?: PaginationOptions
}

export interface GetUsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export class GetUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetUsersRequest = {}): Promise<GetUsersResponse> {
    const { users, total } = await this.userRepository.findAll(request.filters, request.pagination)

    return {
      users,
      total,
      page: request.pagination?.page ?? 1,
      limit: request.pagination?.limit ?? 10,
    }
  }
}
